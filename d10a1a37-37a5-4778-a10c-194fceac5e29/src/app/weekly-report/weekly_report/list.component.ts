import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { WeeklyDataService } from '../weekly-data.service';
import { GadgetService, Contract } from 'src/app/gadget.service';
import { Utils } from 'src/app/util';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['../common.css']
})
export class ListComponent implements OnInit {
  head: string;
  accessPoint: string;
  weeklyDataInfo: any;
  weeklyDataList: any;
  loading: boolean;
  error: any;
  courseID: string;
  courseName: string;

  constructor(private route: ActivatedRoute, private gadget: GadgetService,private weeklyData:WeeklyDataService, private router: Router) {
    // 取得 contract 連線。

  }
  contract: Contract;

  async ngOnInit() {

    this.courseID = this.route.snapshot.paramMap.get("id");
    this.courseName = this.route.snapshot.paramMap.get("name");
    // console.log(this.courseID);
    this.contract = await this.gadget.getContract('kcis');
    this.getData();


  }

  add(CourseID:string,CourseName:string,uid:string){
    this.weeklyData.selectWeeklyReportUID = '';
    this.weeklyData.addWeeklyReportEntry = null;
    this.router.navigate(['../../../add-s1', CourseID, CourseName,uid], {
      relativeTo: this.route
    });
  }
  async getData() {
    try {
      this.loading = true;

      // 呼叫 service。
      const rsp = await this.contract.send('weekly.GetWeeklyReportByCourseID', {
        Request: {
          CourseID: this.courseID
        }
      })
      this.weeklyDataInfo = Utils.array(rsp,"Response/WeeklyReport");

      const rsp3 = await this.contract.send('weekly.GetWeeklyReportReadCount');
      this.weeklyData.weeklyReportHasReadCountLst = Utils.array(rsp3, "Response/WeeklyHasReadCount");

      this.weeklyDataList = [];
      for (const data of this.weeklyDataInfo) {
        // 先塞暫存資料
        let hasRead = this.weeklyData.weeklyReportHasReadCountLst.filter(v => v.WeeklyReportUID === data.UID)
        if (hasRead.length > 0)
        {
          data.HasRead = hasRead[0]["HasRead"];
          data.Total = hasRead[0]["Total"];
        }

        this.weeklyDataList.push(data);
      }

      this.weeklyData.currentCousreWeeklyReportList = this.weeklyDataList;

     


      // console.log(this.weeklyDataList);


    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }
}
