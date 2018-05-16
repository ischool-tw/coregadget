import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { GadgetService, Contract } from 'src/app/gadget.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styles: []
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
  constructor(private route: ActivatedRoute, private gadget: GadgetService) { }
  contract: Contract;

  async ngOnInit() {
    this.courseID = this.route.snapshot.paramMap.get("id");
    this.courseName = this.route.snapshot.paramMap.get("name");
    console.log(this.courseID);
    this.contract = await this.gadget.getContract('kcis');

    this.getData();
  }

  async getData() {
    try {
      this.checkCount = 0;
      this.loading = true;
      this.currentDateString = moment().format("YYYY-MM-DD");
      // 呼叫 service。
      this.studentDataInfo = (await this.contract.send('behavior.GetCourseStudentsByCourseID', {
        Request: {
          CourseID: this.courseID
        }
      })).Response.Student;
      this.studentDataList = [];
      for (const data of this.studentDataInfo) {
        data.checked = false;
        this.studentDataList.push(data);
      }

      console.log(this.studentDataList);

    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }
}
