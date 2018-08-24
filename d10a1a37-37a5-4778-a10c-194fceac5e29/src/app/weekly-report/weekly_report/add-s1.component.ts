import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { StudentWeeklyData } from './StudentWeeklyData';
import { WeeklyDataService } from '../weekly-data.service';
import { WeeklyReportEntry } from './weeklyReportEntry';
import { GadgetService, Contract } from 'src/app/gadget.service';
import { Utils } from 'src/app/util';

@Component({
  selector: 'app-add-s1',
  templateUrl: './add-s1.component.html',
  styleUrls: ['../common.css']
})
export class AddS1Component implements OnInit {

  head: string;
  accessPoint: string;
  loading: boolean;
  error: any;
  displayGradebook: boolean = false;
  //checkNextButton: string = "disabled";
  checkNextButton: boolean = true;
  modeString: string = "Add";
  weeklyDataMain: WeeklyReportEntry;

  // 使用者選擇
  gradeBookList: any;

  // 可選
  canSelectGradeBookList: any;
  constructor(private route: ActivatedRoute, private gadget: GadgetService, private weeklyData: WeeklyDataService, private router: Router) { }
  contract: Contract;

  async ngOnInit() {
    this.weeklyDataMain = new WeeklyReportEntry();
    this.weeklyDataMain.CourseID = this.route.snapshot.paramMap.get("id");
    this.weeklyDataMain.CourseName = this.route.snapshot.paramMap.get("name");
    this.weeklyDataMain.uid = this.route.snapshot.paramMap.get("uid");
    this.weeklyData.selectWeeklyReportUID = this.weeklyDataMain.uid;
    this.contract = await this.gadget.getContract('kcis');
    if (this.weeklyData.selectWeeklyReportUID === '') {
      this.modeString = "Add";
    } else {
      this.modeString = "Edit";
    }

    this.getData();
  }

  async startDateChange(v) {
    this.setNetButtonEnable(false);
    this.displayGradebook = false;
    //alert(v.length);
    if (v.length === 0) {
      alert("Please set the Beginning and End Dates first.");
    } else {
      if (this.weeklyDataMain.EndDate.length > 0 && this.weeklyDataMain.GeneralComment.length > 0) {
        this.setNetButtonEnable(true);
      }
      this.procGradeBookList();
    }

  }

  //處理 gradebook 是在開始與結束日期區間
  async procGradeBookList() {
    this.gradeBookList = [];
    if (this.weeklyDataMain.BeginDate !== "" && this.weeklyDataMain.EndDate !== "") {
      let dateB = moment(this.weeklyDataMain.BeginDate, "YYYY-MM-DD")
      let dateE = moment(this.weeklyDataMain.EndDate, "YYYY-MM-DD");
      // let dd = moment('2018/5/3', "YYYY-MM-DD");
      //  alert(dd.isBetween(dateB, dateE, null, '[]'));
      for (const dd of this.canSelectGradeBookList) {
        dd.checked = true;
        let chkDate = moment(dd.Date, "YYYY-MM-DD");
        if (dateB && dateE) {
          if (chkDate.isBetween(dateB, dateE, null, '[]')) {
            this.gradeBookList.push(dd);
          }
        }
      }

      // 處理編輯狀態下已勾選
      if (this.weeklyData.selectWeeklyReportUID !== '') {
        // 先設成全部不勾
        for (const dd of this.canSelectGradeBookList) {
          dd.checked = false;
        }

        // 比對成績有資料項勾
        for (const dd of this.canSelectGradeBookList) {
          for (const wd of this.weeklyData.selectWeeklyData) {
            for(const item of wd.GradeBookDataList){
              if (dd.Assessment === item.Assessment && dd.CustomAssessment === item.CustomAssessment && dd.Subject === item.Subject && dd.Term === item.Term) {
                dd.checked = true;
                break;
            }            
            }
          }
        }
      }

      if (this.gradeBookList.length > 0) {
        this.displayGradebook = true;
      }
    }
  }


  async endDateChange(v) {
    this.displayGradebook = false;
    this.setNetButtonEnable(false);
    if (v.length === 0) {
      alert("Please set the Beginning and End Dates first.");
    } else {
      if (this.weeklyDataMain.BeginDate.length === 0) {
        this.weeklyDataMain.BeginDate = moment(this.weeklyDataMain.EndDate).add(-7, 'day').format("YYYY-MM-DD");
        console.log(this.weeklyDataMain.BeginDate);
      }


      if (this.weeklyDataMain.BeginDate.length > 0 && this.weeklyDataMain.GeneralComment.length > 0) {
        this.setNetButtonEnable(true);
      }
      this.procGradeBookList();
    }
  }

  async generalCommentChange(v) {
    this.setNetButtonEnable(false);
    if (v.length === 0) {
      // alert("Please set the General Comment first.");
    } else {
      if (this.weeklyDataMain.BeginDate.length > 0 && this.weeklyDataMain.EndDate.length > 0) {
        this.setNetButtonEnable(true);
      }
    }
  }

  async setNetButtonEnable(v: boolean) {
    this.checkNextButton = !v;
    // if (v === true) {
    //   this.checkNextButton = "";
    // } else {
    //   this.checkNextButton = "disabled";
    // }
  }

  async getData() {
    this.displayGradebook = false;
    if (!this.weeklyData.addWeeklyReportEntry) {
      this.weeklyData.addWeeklyReportEntry = new WeeklyReportEntry();
    }

    try {

      if (this.weeklyData.addSelectdGradebook)
        this.gradeBookList = this.weeklyData.addSelectdGradebook;

      this.checkNextButton = this.weeklyData.addS1ButtonEnable;

      this.loading = true;

      // 如果可以編輯
      if (this.weeklyData.selectWeeklyReportUID !== '') {
        if (this.weeklyData.currentCousreWeeklyReportList.length > 0) {
          for (const data of this.weeklyData.currentCousreWeeklyReportList) {
            if (data.UID === this.weeklyData.selectWeeklyReportUID) {
              this.weeklyData.addWeeklyReportEntry = data;
              this.setNetButtonEnable(true);
            }
          }
        }
      }

      if (this.weeklyData.addWeeklyReportEntry.EndDate === "") {
        this.weeklyData.addWeeklyReportEntry.EndDate = moment().format("YYYY-MM-DD");
      }

      if (this.weeklyData.addWeeklyReportEntry.BeginDate === "") {
        this.weeklyData.addWeeklyReportEntry.BeginDate = moment().add(-7, 'day').format("YYYY-MM-DD");
      }
      this.weeklyDataMain.BeginDate = moment(this.weeklyData.addWeeklyReportEntry.BeginDate).format("YYYY-MM-DD");


      this.weeklyDataMain.EndDate = moment(this.weeklyData.addWeeklyReportEntry.EndDate).format("YYYY-MM-DD");

      this.weeklyDataMain.GeneralComment = this.weeklyData.addWeeklyReportEntry.GeneralComment;
      this.gradeBookList = [];

      // 呼叫 service。
      // 取得學生
      const rsp1 = await this.contract.send('weekly.GetCourseStudents', {
        Request: {
          CourseID: this.weeklyDataMain.CourseID
        }
      })
      this.weeklyData.addStudentsList = Utils.array(rsp1, "Response/Student");
      // 取得有學生成績項目
      const rsp2 = await this.contract.send('weekly.GetGradebookCustomAssessmentByCourseID', {
        Request: {
          CourseID: this.weeklyDataMain.CourseID
        }
      })
      this.canSelectGradeBookList = Utils.array(rsp2, "Response/CustomAssessment");

      // 學生成績
      const rsp2_1 = await this.contract.send('weekly.GetGradebookAssessmentScoreByCourseID', {
        Request: {
          CourseID: this.weeklyDataMain.CourseID
        }
      })
      this.weeklyData.addGradebookList = Utils.array(rsp2_1, "Response/GradebookAssessmentScore");;

      // 取得評語
      const rsp3 = await this.contract.send('weekly.GetBehaviorByCourseID', {
        Request: {
          CourseID: this.weeklyDataMain.CourseID
        }
      })
      this.weeklyData.addBehavoirList = Utils.array(rsp3, "Response/BehaviorData");

      // 當編輯模式，取得上資料庫存的資料
      if (this.weeklyData.selectWeeklyReportUID !== '') {
        const rsp4 = await this.contract.send('weekly.GetWeeklyDataByWeeklyReportUID', {
          Request: {
            WeeklyReportUID: this.weeklyData.selectWeeklyReportUID
          }
        })
        this.weeklyData.selectWeeklyData = Utils.array(rsp4, "Response/WeeklyData");

        // 解析資料
        for (let data of this.weeklyData.selectWeeklyData) {
          data.BehaviorDataList = [].concat(JSON.parse(data.BehaviorData) || []);
          data.GradeBookDataList = [].concat(JSON.parse(data.GradeBookData) || []);
        }
      }

      this.procGradeBookList();

    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  // 暫存資料
  async save() {

    this.weeklyData.addWeeklyReportEntry = this.weeklyDataMain;

    // 整理資料
    this.weeklyData.studentWeeklyDataList = this.weeklyData.addStudentsList;

    //console.log(this.weeklyData.addBehavoirList);

    let checkedGradeBookList: any = [];
    // 整理有勾有成績學生
    this.gradeBookList = this.gradeBookList.filter(v => v.checked === true);
    for (const g1 of this.gradeBookList) {
      for (const sc of this.weeklyData.addGradebookList) {
        // 當四層都有
        if (sc.Assessment === g1.Assessment && sc.CustomAssessment === g1.CustomAssessment && sc.Subject === g1.Subject && sc.term === g1.term) {
          checkedGradeBookList.push(sc);
        }
      }

    }
    // console.log(checkedGradeBookList);

    // 處理成績
    for (const gg of checkedGradeBookList) {
      if (!gg.Value)
        gg.Value = "--";
    }


    for (const stud of this.weeklyData.studentWeeklyDataList) {

      let gList = checkedGradeBookList.filter(v => v.StudentID === stud.ID);

      // console.log(gList);
      let bList = this.weeklyData.addBehavoirList.filter(v => v.ID === stud.ID);

      // 放入評語可勾選資料
      for (const bb of bList) {
        bb.checked = true;
      }

      stud.PersonalComment = "";
      stud.GradeBookList = gList;
      stud.BehaviorList = bList;

    }
    this.weeklyData.addSelectdGradebook = this.gradeBookList;
    //  console.log(this.weeklyData.studentWeeklyDataList);
    this.weeklyData.addS1ButtonEnable = this.checkNextButton;
    // 到 s2 ['../../../add-s2']

    this.router.navigate(['../../../../add-s2'], {
      relativeTo: this.route
    });
  }
}
