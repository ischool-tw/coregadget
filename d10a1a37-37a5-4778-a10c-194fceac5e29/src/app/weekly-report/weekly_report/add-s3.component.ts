import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { WeeklyReportEntry } from './weeklyReportEntry';
import { WeeklyDataService } from '../weekly-data.service';
import { GadgetService, Contract } from 'src/app/gadget.service';
import { Utils } from 'src/app/util';

@Component({
  selector: 'app-add-s3',
  templateUrl: './add-s3.component.html',
  styleUrls: ['../common.css']
})
export class AddS3Component implements OnInit {
  head: string;
  accessPoint: string;
  loading: boolean;
  error: any;

  checkSaveButtonDisable: boolean = true;
  checkSendButtonDisable:boolean = true;

  studentWeeklyDataS3List: any;
  weeklyReportS3: WeeklyReportEntry;
  beginDate: string = "";
  endDate: string = "";
  teacherName: string = "";
  modeString: string = "Add";
  constructor(private route: ActivatedRoute, private gadget: GadgetService, private weeklyData: WeeklyDataService, private router: Router) { }
  contract: Contract;

  async ngOnInit() {
    this.weeklyReportS3 = new WeeklyReportEntry();
    this.teacherName = this.weeklyData.teacherName;
    this.contract = await this.gadget.getContract('kcis');
    if (this.weeklyData.selectWeeklyReportUID === '') {
      this.modeString = "Add";
    } else {
      this.modeString = "Edit";
    }
    this.getData();
  }

  async getData() {
    this.checkSaveButtonDisable = false;
    this.checkSendButtonDisable = false;
    this.weeklyReportS3 = this.weeklyData.addWeeklyReportEntry;
    this.studentWeeklyDataS3List = this.weeklyData.studentWeeklyDataList;
    this.beginDate = moment(this.weeklyReportS3.BeginDate, "YYYY-MM-DD").format("YYYY/MM/DD");
    this.endDate = moment(this.weeklyReportS3.EndDate, "YYYY-MM-DD").format("YYYY/MM/DD");

    // 判斷是否有資料在畫面上是否顯示
    for (const stud of this.studentWeeklyDataS3List) {
      let disp: boolean = false;
      stud.displayGradebook = disp;
      stud.displayBehavior = disp;

      if (stud.GradeBookList.length > 0) {
        stud.displayGradebook = true;
      }
      if (stud.BehaviorList.length > 0) {
        stud.displayBehavior = true;
      }
    }

    //console.log(this.studentWeeklyDataS3List);
  }

  async behaviorSettings() {
    this.router.navigate(['../../../add-s2']);

  }

async send(){
  this.checkSendButtonDisable = true;

}

  async save() {
    // console.log(this.studentWeeklyDataS3List);
    this.checkSaveButtonDisable = true;
    // 回寫暫存
    this.weeklyData.studentWeeklyDataList = this.studentWeeklyDataS3List;

    let wkUids: any;
    let uid = '';
    // 判斷是否有WeeklyReportUID，如果有當作更新，沒有當作新增
    if (this.weeklyData.selectWeeklyReportUID === '') {
      // 寫入 WeeklyReport
      const rsp1 = await this.contract.send('weekly.AddWeeklyReport', {
        Request: {
          WeeklyReport: {
            CourseID: this.weeklyData.addWeeklyReportEntry.CourseID,
            BeginDate: this.weeklyData.addWeeklyReportEntry.BeginDate,
            EndDate: this.weeklyData.addWeeklyReportEntry.EndDate,
            GeneralComment: this.weeklyData.addWeeklyReportEntry.GeneralComment
          }
        }
      })
      wkUids = Utils.array(rsp1, "Response/id");
      if (wkUids.length > 0) {
        uid = wkUids[0].uid;
      }

    } else {
      // 更新資料

      //1. 呼叫更新 Service 更新資料
      // 寫入 WeeklyReport
      const rspUpdate1 = await this.contract.send('weekly.UpdateWeeklyReportByUID', {
        Request: {
          BeginDate: this.weeklyData.addWeeklyReportEntry.BeginDate,
          EndDate: this.weeklyData.addWeeklyReportEntry.EndDate,
          GeneralComment: this.weeklyData.addWeeklyReportEntry.GeneralComment,
          UID: this.weeklyData.selectWeeklyReportUID
        }
      })
      wkUids = Utils.array(rspUpdate1, "Response/id");
      if (wkUids.length > 0) {
        uid = wkUids[0].uid;
      }
      //2. 透過 WeeklyReportUID 刪除舊WeeklyData資料
      const rspDelWekData = await this.contract.send('weekly.DelWeeklyDataByWeeklyReportUID', {
        Request: {
          WeeklyReportUID: this.weeklyData.selectWeeklyReportUID
        }
      })
      wkUids = Utils.array(rspDelWekData, "Response");
    }

    // 新增資料  // 有 uid 才寫入 WeeklyData
    if (uid !== '') {


      let items: any = [];
      for (const stud of this.studentWeeklyDataS3List) {
        //JSON.stringify(stud.BehaviorList)
        let item = {
          WeeklyReportUID: uid,
          StudentID: stud.ID,
          GradeBookData: JSON.stringify(stud.GradeBookList),
          BehaviorData: JSON.stringify(stud.BehaviorList),
          PersonalComment: stud.PersonalComment
        }
        items.push(item);
      }

      // console.log(items);

      // console.log(uid);
      const rsp2 = await this.contract.send('weekly.AddWeeklyData', {
        Request: { Student: items }
      })
      wkUids = Utils.array(rsp2, "Response/id");
    }




    let courseID = this.weeklyData.addWeeklyReportEntry.CourseID;
    let courseName = this.weeklyData.addWeeklyReportEntry.CourseName;




    // 清空暫存資料
    this.weeklyData.addWeeklyReportEntry.clear();
    this.weeklyData.studentWeeklyDataList = [];


    // 回到 List 畫面
    // this.router.navigate(['../../../list', this.weeklyData.addWeeklyReportEntry.CourseID, this.weeklyData.addWeeklyReportEntry.CourseName]);
    this.router.navigate(['../list', courseID, courseName], {
      relativeTo: this.route
    });

  }
}
