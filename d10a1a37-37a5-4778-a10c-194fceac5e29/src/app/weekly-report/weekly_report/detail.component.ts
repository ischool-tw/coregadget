import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { WeeklyDataService } from '../weekly-data.service';
import { GadgetService, Contract } from 'src/app/gadget.service';
import { Utils } from 'src/app/util';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['../common.css']
})
export class DetailComponent implements OnInit {
  head: string;
  accessPoint: string;
  weeklyDataInfo: any;
  weeklyDataList: any;
  loading: boolean;
  error: any;
  weeklyReportUID: string;
  courseName: string;
  beginDate: string;
  endDate: string;
  generalComment: string;
  behaviorDataList: any;
  teacherName:string = "";

  constructor(private route: ActivatedRoute, private gadget: GadgetService, private weeklyData: WeeklyDataService) {
    // 取得 contract 連線。

  }
  contract: Contract;

  async ngOnInit() {
    this.courseName = this.route.snapshot.paramMap.get("name");
    this.weeklyReportUID = this.route.snapshot.paramMap.get("wruid");
    this.teacherName = this.weeklyData.teacherName;

    // console.log(this.courseID);
    this.contract = await this.gadget.getContract('kcis');
    this.getData();
  }

  async getData() {
    try {
      this.loading = true;

      // console.log(this.weeklyReportUID);
      // 呼叫 service。

      // 填畫面資料
      let cList = this.weeklyData.currentCousreWeeklyReportList.filter(v => v.UID === this.weeklyReportUID);
      if (cList.length > 0) {
        this.beginDate = cList[0].BeginDate2;
        this.endDate = cList[0].EndDate2;
        this.generalComment = cList[0].GeneralComment;
      }

      const rsp = await this.contract.send('weekly.GetWeeklyDataByWeeklyReportUID', {
        Request: {
          WeeklyReportUID: this.weeklyReportUID
        }
      });

      this.weeklyDataInfo = Utils.array(rsp, "Response/WeeklyData");


      this.weeklyDataList = [];      
      // this.behaviorDataList = [];
      for (const data of this.weeklyDataInfo) {
        let disp:boolean = false;
        data.displayGradebook = disp;
        data.displayBehavior = disp;
        
        try {
          let xx = JSON.parse(data.BehaviorData);
          data.behaviorDataList = xx;
          
          if (data.behaviorDataList.length > 0)
          {            
             data.displayBehavior = true;
          }

        } catch (err) {
          console.log(err);
        }finally{
        }

        try {
          let ss = JSON.parse(data.GradeBookData);
          data.gradeBookDataList = ss;

          if (data.gradeBookDataList.length > 0)
          {
             data.displayGradebook = true;
          }
          // 處理沒有值
          for(const gg of data.gradeBookDataList)
          {
            if(!gg.Value)
            {
              gg.Value = "--";
            }
          }
        } catch (err) {
          console.log(err);
        }finally{}

        this.weeklyDataList.push(data);


      }
      //  console.log(this.weeklyDataList);
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }
}

