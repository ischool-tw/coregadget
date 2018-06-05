import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from '../gadget.service';
import { Utils } from '../util';
import { SelectCourseDataService } from '../select-course-data.service';
import { selCourseBasicInfo } from './selCourseBasicInfo';
import * as moment from 'moment';
import { subjectInfo } from './subjectInfo';
import { courseInfo } from './courseInfo';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styles: []
})
export class MainComponent implements OnInit {
  loading: boolean = true;
  currentStatus: any;

  constructor(private route: ActivatedRoute, private gadget: GadgetService, private selectCourseData: SelectCourseDataService, private router: Router) { }
  // 取得 contract 連線。
  contract: Contract;

  async ngOnInit() {
    this.contract = await this.gadget.getContract('ischool.course_selection');
    this.getData();
  }

  async getData() {
    try {
      this.loading = true;

      // 呼叫 service。
      this.currentStatus = await this.contract.send('GetCurrentStatus');
      this.currentStatus.P1StartTime = moment(parseInt(this.currentStatus.P1StartTime));
      this.currentStatus.P1EndTime = moment(parseInt(this.currentStatus.P1EndTime));
      this.currentStatus.P2StartTime = moment(parseInt(this.currentStatus.P2StartTime));
      this.currentStatus.P2EndTime = moment(parseInt(this.currentStatus.P2EndTime));

      this.currentStatus.P1 = "" + this.currentStatus.P1StartTime.format("YYYY/MM/DD HH:mm:ss") + " ~ " + this.currentStatus.P2EndTime.format("YYYY/MM/DD HH:mm:ss") + " (" + this.currentStatus.P1Mode + ")";
      this.currentStatus.P2 = "" + this.currentStatus.P2StartTime.format("YYYY/MM/DD HH:mm:ss") + " ~ " + this.currentStatus.P2EndTime.format("YYYY/MM/DD HH:mm:ss") + " (" + this.currentStatus.P2Mode + ")";

      this.currentStatus.SubjectType = [].concat(this.currentStatus.SubjectType || []);
      this.currentStatus.Wish = [].concat(this.currentStatus.Wish || []);

    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  // 先搶先贏
  async selectTakeAwayCourse(subjectType) {
    // 將使用者所選課程傳入
    this.router.navigate(['../add-task-away', subjectType], {
      relativeTo: this.route
    });
  }

  // 志願序
  async selectWishCourse(subjectType) {
    // 將使用者所選課程傳入
    this.router.navigate(['../add-wish', subjectType], {
      relativeTo: this.route
    });
  }
}
