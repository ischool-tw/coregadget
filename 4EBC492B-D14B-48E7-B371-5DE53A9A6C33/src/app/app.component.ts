import { GadgetService } from './gadget.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {
  loading: boolean;
  examList: any;
  current: any;

  constructor(
    private gadget: GadgetService
    , private modalService: NgbModal
  ) {
    this.current = {
      Exam: null
      , TargetStudent: null
      , TargetIEP: null
    };
  }

  async ngOnInit() {
    try {
      this.loading = true;
      const contract = await this.gadget.getContract('1campus.iep');
      // 呼叫 service。
      const resp = await contract.send('GetStudent', {});
      this.examList = [].concat(resp.Exam || []);
    } catch (err) {
      alert("CallService：GetStudent Error\n" + JSON.stringify(err));
    } finally {
      this.loading = false;
    }
    if (this.examList && this.examList.length > 0) {
      var alertMsg = "";
      var currentExam = null;
      //正規化
      this.examList.forEach(examRec => {
        var missingAlert = 0;
        examRec.Progress = 0;
        examRec.Total = 0;
        examRec.InTimeRange = false;
        examRec.Student = [].concat(examRec.Student || []);
        examRec.Student.forEach(stuRec => {
          stuRec.Course = [].concat(stuRec.Course || []);
          stuRec.Course.forEach(courseRec => {
            examRec.Total++;
            courseRec.ExamType = courseRec.ExamType || '';
            if (courseRec.IEPValue) {
              courseRec.IEPValue = JSON.parse(courseRec.IEPValue);
              courseRec.IEPText = courseRec.IEPValue.join(' ');
              if (courseRec.IEPValue.length > 0) {
                examRec.Progress++;
              }
            }
            else {
              courseRec.IEPValue = [];
              courseRec.IEPText = "";
            }
            if (courseRec.InTimeRange == "true") {
              examRec.InTimeRange = true;
              if (!currentExam)
                currentExam = examRec;
              if (courseRec.IEPValue.length == 0) {
                missingAlert++;
              }
            }
          });
        });
        if (missingAlert)
          alertMsg = alertMsg + "\n\t" + (examRec.Name + "：" + missingAlert) + " 人次";
      });
      //選一個
      this.setCurrentExam(currentExam || this.examList[0]);
      if (alertMsg) {
        alertMsg = "IEP學生評量標準尚未填報完成\n請於成績輸入截止前至\"IEP--教師IEP填報\"功能填報" + alertMsg;
        if (window.parent) {
          window.parent.alert(alertMsg);
          gadget.activeGadget();
        }
        else
          window.alert(alertMsg);
      }
    }
  }

  async setCurrentExam(examRec: any) {
    this.current.Exam = examRec;
    if (!examRec.InputTemplate) {
      try {
        this.loading = true;
        const contract = await this.gadget.getContract('1campus.iep');
        // 呼叫 service。
        const resp = await contract.send('GetInputTemplate', { ExamName: examRec.Name });
        examRec.InputTemplate = [].concat(resp.InputTemplate || []);
        examRec.Student.forEach(stuRec => {
          stuRec.Course.forEach(courseRec => {
            examRec.InputTemplate.forEach(itemTemplate => {
              itemTemplate.Type = itemTemplate.Type || '';
              if (itemTemplate.Type == courseRec.ExamType) {
                courseRec.ItemTemplate = [].concat(itemTemplate.Item || []);
              }
            });
          });
        });
      } catch (err) {
        alert("CallService：GetInputTemplate Error\n" + JSON.stringify(err));
      } finally {
        this.loading = false;
      }
    }
  }

  openInput(content, targetStuRec, courseRec) {
    let itemSpliter = function (source, spliterList) {
      if (spliterList.length == 0) {
        return [source];
      }
      else {
        var newSpliterList = [].concat(spliterList);
        var spliter = newSpliterList.pop();
        var list = source.split(spliter);

        var r = [];
        list.forEach((item, index) => {
          if (index > 0)
            r.push(spliter);
          r = r.concat(itemSpliter(item, newSpliterList));
        });
        return r;
      }
    }

    var targetIEP = { ...courseRec };
    targetIEP.ItemTemplate = targetIEP.ItemTemplate.map(item => {
      var list = itemSpliter(item, ["##INPUT##", "##TEXTAREA##"]);
      var valList = [];
      list.forEach((part, index) => {
        if (part == "##INPUT##" || part == "##TEXTAREA##") {
          if (item == targetIEP.IEPitem)
            valList.push(targetIEP.IEPValue[index] || '');
          else
            valList.push('');
        }
        else {
          valList.push(part);
        }
      });
      var result = {
        Key: item
        , List: list
        , Value: valList
        , Verify: () => {
          var pass = true;
          valList.forEach((val, index) => { pass = pass && (!!val || index == valList.length - 1); });
          return pass;
        }
      };

      return result;
    });
    targetIEP.Save = async () => {
      var selectItem;
      targetIEP.ItemTemplate.forEach((item) => {
        if (item.Key == targetIEP.IEPitem && item.Verify())
          selectItem = item;
      });
      if (selectItem) {

        try {
          const contract = await this.gadget.getContract('1campus.iep');
          // 呼叫 service。
          const resp = await contract.send('SetIEPData', {
            StudentID: targetStuRec.StudentID
            , CourseID: targetIEP.CourseID
            , ExamName: this.current.Exam.Name
            , ExamType: targetIEP.ExamType
            , IEPKey: selectItem.Key
            , IEPValue: JSON.stringify(selectItem.Value)
          });
        } catch (err) {
          alert("CallService：SetIEPData Error\n" + JSON.stringify(err));
          return;
        }

        if (courseRec.IEPValue.length == 0) {
          this.current.Exam.Progress++;
        }
        courseRec.IEPValue = selectItem.Value;
        courseRec.IEPText = courseRec.IEPValue.join(' ');
        targetIEP.modalReference.close();
      }
    };

    this.current.TargetIEP = targetIEP;
    this.current.TargetStudent = targetStuRec;
    targetIEP.modalReference = this.modalService.open(content, { centered: true });
  }


  // head: string;
  // accessPoint: string;
  // schoolInfo: any;
  // loading: boolean;
  // error: any;

  // langs = ['英文', '中文', '日文'];

  // constructor(
  //   private gadget: GadgetService) {
  // }

  // async ngOnInit() {

  //   this.head = 'Hello Gadget!';

  //   try {
  //     this.loading = true;

  //     // 取得 contract 連線。
  //     const contract = await this.gadget.getContract('basic.public');

  //     this.accessPoint = contract.getAccessPoint;

  //     // 呼叫 service。
  //     this.schoolInfo = await contract.send('beta.GetSystemConfig', {
  //       Name: '學校資訊'
  //     });

  //   } catch (err) {
  //     this.error = err;
  //   } finally {
  //     this.loading = false;
  //   }

  // }

}
