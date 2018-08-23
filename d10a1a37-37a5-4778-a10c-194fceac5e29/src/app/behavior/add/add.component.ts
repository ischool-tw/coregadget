import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { GadgetService, Contract } from 'src/app/gadget.service';
import { Utils } from 'src/app/util';
import { BehaviorDataService } from '../behavior-data.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['../common.css']
})
export class AddComponent implements OnInit {
  head: string;
  accessPoint: string;
  studentDataInfo: any;
  studentDataList: any;
  commentTemplateInfo: any;
  commentTemplateList: any;
  loading: boolean;
  error: any;
  currentDateString: string;
  courseID: string;
  courseName: string;
  checkCount: Number;
  addText: string;
  checkButtonEnable: string = "disabled";
  constructor(private route: ActivatedRoute, private gadget: GadgetService, private router: Router, private behaviorDataService: BehaviorDataService) { }
  contract: Contract;

  async ngOnInit() {
    this.courseID = this.route.snapshot.paramMap.get("id");
    this.courseName = this.route.snapshot.paramMap.get("name");
    // console.log(this.courseID);
    this.contract = await this.gadget.getContract('kcis');
    this.getCommentTemplate();
    this.getData();
  }

  async getCommentTemplate() {
    try {
      this.loading = true;
      // 呼叫 service。
      this.commentTemplateInfo = (await this.contract.send('behavior.GetCommentTemplate')).Response.CommentTemplate;
      this.commentTemplateList = [];
      for (const data of this.commentTemplateInfo) {
        this.commentTemplateList.push(data);
      }

      // console.log(this.commentTemplateList);
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  async getData() {
    try {
      this.checkButtonEnable = "";
      this.checkCount = 0;
      this.loading = true;
      this.currentDateString = moment().format("YYYY-MM-DD");

      if (this.behaviorDataService.addDate !== "") {
        this.currentDateString = this.behaviorDataService.addDate;
      }

      if (this.behaviorDataService.addComment !== "") {
        this.addText = this.behaviorDataService.addComment;
      }

      const rsp = await this.contract.send('behavior.GetCourseStudentsByCourseID', {
        Request: {
          CourseID: this.courseID
        }
      })

      this.studentDataInfo = Utils.array(rsp, "Response/Student");

      this.studentDataList = [];
      for (const data of this.studentDataInfo) {
        data.checked = false;

        data.PhotoUrl = `${this.contract.getAccessPoint}/behavior.GetStudentPhoto?stt=Session&sessionid=${this.contract.getSessionID}&parser=spliter&content=StudentID:${data.ID}`;
        // console.log(data.PhotoUrl);
        this.studentDataList.push(data);
      }

      if (this.behaviorDataService.addCheckStudentList) {
        if (this.behaviorDataService.addCheckStudentList.length > 0) {
          this.studentDataList = this.behaviorDataService.addCheckStudentList;

          let cot: number = 0;
          for (const dd of this.studentDataList) {
            if (dd.checked === true) {
              cot += 1;
            }
          }
          this.checkCount = cot;

        }
      }

      // console.log(this.studentDataList);

    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  async currentDateChange(value) {
    this.behaviorDataService.addDate = this.currentDateString;
  }

  async commentChange() {
    this.behaviorDataService.addComment = this.addText;
  }

  alert(id) {
    //  alert(JSON.stringify(id.checked));

    let cot = 0;
    for (const data of this.studentDataList) {
      if (data.checked === true) {
        cot += 1;
      }
    }

    // console.log(this.behaviorDataService.addCheckStudentList);
    this.checkCount = cot;
    this.behaviorDataService.addCheckStudentList = this.studentDataList;
    // this.behaviorDataService.addComment = this.addText;
    // this.behaviorDataService.addDate = this.currentDateString;
    // console.log(this.behaviorDataService.addDate);

    // console.log(this.checkCount);

  }

  async selectItem(data) {
    // console.log(data.Comment);
    this.addText = data.Comment;
  }

  async save() {
    // console.log(this.addText);
    // console.log(this.currentDateString);
    this.checkButtonEnable = "disabled";

    try {

      this.loading = true;
      let rsp: any;
      // 呼叫 service。

      let checkCanSend: Boolean = true;
      let checkCanSendError: String = "";

      if (!this.currentDateString) {
        checkCanSend = false;
        checkCanSendError = "Please select the date.";
      }

      if (!this.addText) {
        checkCanSend = false;
        checkCanSendError += "Please enter comment.";
      }

      if (this.checkCount === 0) {
        checkCanSend = false;
        checkCanSendError += "No students selected.";
      }

      if (checkCanSend === true) {
        // // 先用單筆，
        // for (const data of this.studentDataList) {
        //   if (data.checked === true) {
        //     rsp = (await this.contract.send('behavior.AddBehaviorData', {
        //       Request: {
        //         BehaviorData: {
        //           Field: {
        //             CourseID: this.courseID,
        //             StudentID: data.ID,
        //             Comment: this.addText,
        //             CreateDate: this.currentDateString
        //           }
        //         }
        //       }
        //     }));
        //     console.log(rsp);
        //   }
        // }

        // 多筆傳送
        let items: any;
        items = [];
        for (const data of this.studentDataList) {
          if (data.checked === true) {
            let item = {
              Field: {
                Comment: this.addText,
                CreateDate: this.currentDateString,
                CourseID: this.courseID,
                StudentID: data.ID
              }
            }
            items.push(item);
          }
        }

        // console.log(items);
        //  let reqStr = JSON.stringify(items);
        rsp = (await this.contract.send('behavior.AddBehaviorData', { Request: { BehaviorData: items } }));
        // console.log(rsp);


        alert('Saved！');


        // 清空暫存值
        this.behaviorDataService.addDate = "";
        this.behaviorDataService.addComment = "";
        this.behaviorDataService.addCheckStudentList = [];
        // 回到 list
        this.router.navigate(['../../../list', this.courseID, this.courseName], {
          relativeTo: this.route
        });
      } else {
        alert(checkCanSendError);
        this.checkButtonEnable = "";
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }
}
