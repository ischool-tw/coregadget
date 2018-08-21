import { Component, OnInit } from '@angular/core';
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
  behaviorData3Info: any;

  loading: boolean;
  error: any;
  addText: string;
  constructor(private gadget: GadgetService) { }
  // 取得 contract 連線。
  contract: Contract;
  async ngOnInit() {
    this.contract = await this.gadget.getContract('kcis');
    this.getData();
  }


  async getData() {
    try {
      this.loading = true;

      // 呼叫 service。
      const rsp1 = await this.contract.send('behavior.GetCourses');

      this.courseDataInfo = Utils.array(rsp1, "Response/Course");
      const rsp2 = await this.contract.send('behavior.GetBehaviorDataLimit');
      this.behaviorData3Info = Utils.array(rsp2, "Response/BehaviorData");

      this.courseDataList = [];

      for (const data of this.courseDataInfo) {

        const bDataList = this.behaviorData3Info.filter(v => v.CourseID === data.ID);
        let displayItem: boolean = true;
        if (bDataList.length === 0) {
          displayItem = false;
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
