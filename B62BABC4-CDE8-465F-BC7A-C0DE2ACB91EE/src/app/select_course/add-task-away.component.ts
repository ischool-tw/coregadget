import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from '../gadget.service';
import { Utils } from '../util';
import * as moment from 'moment';
import { subjectInfo } from './subjectInfo';
import { courseInfo } from './courseInfo';
import { SelectCourseDataService } from '../select-course-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AddDialogComponent } from './add-dialog.component';


@Component({
  selector: 'app-add-task-away',
  templateUrl: './add-task-away.component.html',
  styles: []
})
export class AddTaskAwayComponent implements OnInit {
  head: string;
  accessPoint: string;
  // 課程資訊
  courseInfo: any;
  loading: boolean = true;
  error: any;
  courseInfoList: any;
  courseList: any;
  selCourseType: string = "";
  selCourseInfo: courseInfo;
  selCourseInfoServ: any;

  constructor(private route: ActivatedRoute, private gadget: GadgetService, private selectCourseData: SelectCourseDataService, private router: Router, private dialog: MatDialog) { }
  // 取得 contract 連線。
  contract: Contract;

  async ngOnInit() {
    this.contract = await this.gadget.getContract('ischool.course_selection');
    this.selCourseInfo = new courseInfo();
    this.getData();
  }

  // 取得可選清單
  async getCanSelectCourseList() {

    this.loading = true;
    this.selCourseType = this.route.snapshot.paramMap.get("courseType");
    let courseType = this.selCourseType;

    try {
      // 呼叫 service。
      const rsp1 = await this.contract.send('GetTakeAway', {
        Request: {
          Type: courseType
        }
      });
      this.courseInfo = Utils.array(rsp1, "科目清單/科目");
      // <科目系統編號>148273</科目系統編號>
      // <科目名稱>歌聲傳奇</科目名稱>
      // <已選人數>34</已選人數>
      // <人數上限>60</人數上限>

      this.courseList = [];

      for (const data of this.courseInfo) {
        let co: subjectInfo = new subjectInfo();
        co.subjectID = data["科目系統編號"];
        co.subjectName = data["科目名稱"];
        co.selectedCount = data["已選人數"];
        co.maxCount = data["人數上限"];
        this.courseList.push(co);
      }

      // 處理已選
      let selCourse = Utils.array(rsp1, "科目清單/選上科目");
      if (selCourse.length > 0) {
        let course: courseInfo = new courseInfo();
        course.typeName = this.selCourseType;
        course.selectedCourse = selCourse[0]["科目名稱"];
        course.isNoCourse = false;

        let subj = new subjectInfo();
        subj.subjectID = selCourse[0]["科目系統編號"];
        subj.subjectName = selCourse[0]["科目名稱"];
        course.subjectList = [subj];
        this.selCourseInfo = course;

        // 處理可選課程內已選
        for (const ss of this.courseList) {
          if (ss.subjectID === subj.subjectID) {
            ss.isSelected = true;
          } else {
            ss.isSelected = false;
          }
        }
      }

      // console.log(this.courseList);
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  getData() {
    this.getCanSelectCourseList();
  }

  showDialog(subject) {
    // console.log(subject.subjectID);
    const dig = this.dialog.open(AddDialogComponent, {
      data: { subjectID: subject.subjectID, mode: '先搶先贏' }
    });

    dig.afterClosed().subscribe((v) => {
      // alert(JSON.stringify(v));

      this.sendData(v.subjectID);
    });
  }

  // 直接加入選課
  joinCourse(subject) {
    // console.log(subject);
    this.sendData(subject.subjectID);
  }

  async sendData(subjectID) {
    try {
      // 呼叫 service。
      // _.SetTakeAway
      // <Request>
      //   <SubjectID>148276</SubjectID>
      //   <Type>'多元選修'</Type>
      // </Request>

      let typeName = this.selCourseType;
      const rsp2 = await this.contract.send('SetTakeAway', {

        SubjectID: subjectID,
        Type: typeName

      });
      let status = Utils.array(rsp2, "");
      // 解析回傳訊息
      if (status.length > 0) {
        if (status[0].message !== "") {
          alert(status[0].message);
        } else {
          // alert("已選完成");
        }

        // console.log(status[0].status);
        // console.log(status[0].message);
      }

      // this.selectCourseData.selectCourseInfo = this.courseList.filter(x => x.subjectID === v.subjectID);
      // console.log(this.selectCourseData.selectCourseInfo);
      // console.log(status);
      // this.router.navigate(['../../main'], {
      //   relativeTo: this.route
      // });
      // console.log(this.courseList);

      // 重整資料      
      this.getCanSelectCourseList();
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

}
