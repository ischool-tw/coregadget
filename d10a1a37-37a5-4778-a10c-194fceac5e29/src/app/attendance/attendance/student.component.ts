import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from 'src/app/gadget.service';
import { Utils } from 'src/app/util';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styles: []
})
export class StudentComponent implements OnInit {
  courseName: string = '';
  courseID: string = '';
  StudentDataList: any;
  loading: boolean = false;
  constructor(private gadget: GadgetService, private route: ActivatedRoute, private router: Router) { }
  contract: Contract;
  async ngOnInit() {
    this.contract = await this.gadget.getContract('kcis');
    this.courseID = this.route.snapshot.paramMap.get("courseid");
    this.courseName = this.route.snapshot.paramMap.get("coursename");
    this.getData();
  }

  async getData() {
    try {
      this.loading = true;
     
      
      let dt = moment().format("YYYY-MM-DD");
      // 呼叫 service。
      const rsp1 = await this.contract.send('attendance.GetCourseStudents', {
        Request:
          { CourseID: this.courseID, OccurDate: dt }
      });

      this.StudentDataList = Utils.array(rsp1, "Students/Student");
      for(const data of this.StudentDataList)
      {
        data.PhotoUrl = `${this.contract.getAccessPoint}/behavior.GetStudentPhoto?stt=Session&sessionid=${this.contract.getSessionID}&parser=spliter&content=StudentID:${data.ID}`;
      }

    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }
}
