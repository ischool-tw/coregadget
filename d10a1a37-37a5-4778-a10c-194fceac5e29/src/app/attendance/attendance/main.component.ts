import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from 'src/app/gadget.service';
import { Utils } from 'src/app/util';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styles: []
})
export class MainComponent implements OnInit {

  todayCourseDataList:any;
  courseDataList: any;
  loading: boolean = false;
  constructor(private gadget: GadgetService) { }
  contract: Contract;
  async ngOnInit() {
    this.contract = await this.gadget.getContract('kcis');
    this.getData();
  }

  async getData() {
    try {
      this.loading = true;

      // 呼叫 service。
      const rsp1 = await this.contract.send('attendance.GetCourses');
      this.courseDataList = Utils.array(rsp1, "Courses/Course");

      // 呼叫 service。
      const rsp2 = await this.contract.send('attendance.SuggestRollCall');
      this.todayCourseDataList = Utils.array(rsp2, "list");


    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }
}
