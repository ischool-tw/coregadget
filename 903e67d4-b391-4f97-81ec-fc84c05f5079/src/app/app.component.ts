import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Class, Student, Absence, Period, Leave } from "./help-class";
import { AppService } from "./app.service";
import * as rx from 'rxjs/Rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  selClass: Class;
  currAbs: Absence;
  classes: Class[] = new Array<Class>();
  /**假別 */
  absences: Absence[] = new Array<Absence>();
  clearAbs: Absence = new Absence(null, null);
  /**節次 */
  periods: Period[] = new Array<Period>();
  periodMap: Map<string, Period> = new Map<string, Period>();
  students: Student[] = new Array<Student>();
  classSubject$: rx.Subject<Class> = new rx.Subject();
  /**今天該班點名狀態 */
  completed: boolean;

  constructor(private appService: AppService, private change: ChangeDetectorRef) {
  }

  ngOnInit() {
    // 預設值
    this.currAbs = this.clearAbs;
    this.completed = false;

    // 取得假別、節次、老師帶班
    rx.Observable.combineLatest(
      this.appService.getAbsences(), this.appService.getPeriods(), this.appService.getMyClass(), (x, y, z) => {
        this.absences = x;
        this.periods = y;
        y.forEach((p) => {
          this.periodMap.set(p.name, p);
        });
        this.classes = z;
    })
    .subscribe(() => {
      // 全部取回後，進行處理
      if (this.classes && this.classes.length) {
        // 指定目前班級為第一個班級
        this.selClass = this.classes[0];
        // 訂閱班級異動
        this.classSubject$.subscribe((c) => {
          rx.Observable.combineLatest(
            this.appService.getClassStudentsLeave(c), this.appService.getRollcallState(c), (studs, complete) => {
              this.students = studs;
              this.completed = complete;
          })
          .subscribe();
        });
        // 切換班級
        this.toggleClassDate();
      }
    });
  }

  /**切換班級或缺曠日期，取得「該日學生缺曠」、「點名完成」狀態 */
  toggleClassDate() {
    if (this.selClass) {
      this.classSubject$.next(this.selClass);
    }
  }

  /**假別簡稱 */
  toShort(name: string): string {
    for (let n of this.absences) {
      if (n.name == name) {
        return n.abbreviation;
      }
    }

    return '';
  }

  /**設定全部學生該節次統一假別 */
  setAllStudentsAbs(period: Period) {
    if (period && this.currAbs) {
      this.students.forEach((stu) => {
        stu.setAbsence(period.name, this.currAbs.name);
      });
    }
  }

  /**設定單一學生所有節次統一假別 */
  setStudentAllPeriodAbs(stu) {
    if (stu && this.currAbs) {
      this.periods.forEach((period: Period) => {
        stu.setAbsence(period.name, this.currAbs.name);
      });
    }
  }

  /**設定單一學生單一節次假別 */
  setStudentPeroidAbs(stu, period) {
    if (stu && period && this.currAbs) {
      if (stu.leaveList.has(period.name)) {
        // 與上次相同即清除
        if (stu.leaveList.get(period.name).absName == this.currAbs.name) {
          stu.setAbsence(period.name, this.clearAbs.name);
        }
        else {
          stu.setAbsence(period.name, this.currAbs.name);
        }
      } else {
        stu.setAbsence(period.name, this.currAbs.name);
      }
    }
  }

  /**儲存點名結果 */
  saveData() {
    let data = [];
    
    this.students.forEach((s) => {
      let tmpDetail:string = '';
      s.leaveList.forEach((value, key) => {
        let periodName = s.leaveList.get(key).periodName;
        let periodType = this.periodMap.get(periodName).type;
        let absName = s.leaveList.get(key).absName;
        tmpDetail += `<Period AbsenceType="${absName}" AttendanceType="${periodType}">${periodName}</Period>`;
      });

      data.push({
        sid: s.sid,
        detail: (tmpDetail) ? `<Attendance>${tmpDetail}</Attendance>` : ''
      });
    });

    this.appService.saveStudentLeave(this.selClass, data).subscribe(() => {
      // 重取缺曠狀態
      this.toggleClassDate();
    });
  }
  
}

