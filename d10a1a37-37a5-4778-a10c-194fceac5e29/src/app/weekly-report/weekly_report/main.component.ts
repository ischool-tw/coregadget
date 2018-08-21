import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WeeklyDataService } from '../weekly-data.service';
import { GadgetService, Contract } from 'src/app/gadget.service';
import { Utils } from 'src/app/util';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['../common.css']
})
export class MainComponent implements OnInit {

  head: string;
  accessPoint: string;
  courseDataInfo: any;
  courseDataList: any;
  weeklyData3Info: any;

  loading: boolean;
  error: any;
  addText: string;
  constructor(private gadget: GadgetService, private weeklyData: WeeklyDataService, private router: Router, private route: ActivatedRoute ) { }
  // 取得 contract 連線。
  contract: Contract;

  async ngOnInit() {
    this.contract = await this.gadget.getContract('kcis');
    this.getData();
  }

  add(CourseID: string, CourseName: string, uid: string) {
    this.weeklyData.selectWeeklyReportUID = '';
    this.weeklyData.addWeeklyReportEntry = null;
    this.router.navigate(['../add-s1', CourseID, CourseName, uid], {
      relativeTo: this.route
    });
  }

  async getData() {
    try {
      this.loading = true;

      // 呼叫 service。
      const rsp1 = await this.contract.send('weekly.GetCourses');
      this.courseDataInfo = Utils.array(rsp1, "Response/Course");

      // console.log(this.courseDataInfo);

      const rsp2 = await this.contract.send('weekly.GetWeeklyReportLimit');
      this.weeklyData3Info = Utils.array(rsp2, "Response/WeeklyReport");

      this.weeklyData.currentCousreWeeklyReportList = this.weeklyData3Info;

      const rsp3 = await this.contract.send('weekly.GetWeeklyReportReadCount');
      this.weeklyData.weeklyReportHasReadCountLst = Utils.array(rsp3, "Response/WeeklyHasReadCount");

      // console.log(this.weeklyHasReadCountInfo);
      this.courseDataList = [];
      // console.log(this.weeklyData3Info);
      for (const data of this.courseDataInfo) {
        let bDataList = this.weeklyData3Info.filter(v => v.CourseID === data.ID);

        let displayItem: boolean = true;
        if (bDataList.length === 0) {
          displayItem = false;
        } else {
          // 先塞暫時資料
          for (const d1 of bDataList) {
            let hasRead = this.weeklyData.weeklyReportHasReadCountLst.filter(v1 => v1.WeeklyReportUID === d1.UID)

            if (hasRead.length > 0) {
              // console.log(hasRead[0]["CourseID"]);
              d1.HasRead = hasRead[0]["HasRead"];
              d1.Total = hasRead[0]["Total"];
            }
          }

          this.weeklyData.currentCousreWeeklyReportList = bDataList;
        }
        this.courseDataList.push({ ID: data.ID, Name: data.Name, DisplayItem: displayItem, bDataList });
      }


      // console.log(this.courseDataList);

    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

}
