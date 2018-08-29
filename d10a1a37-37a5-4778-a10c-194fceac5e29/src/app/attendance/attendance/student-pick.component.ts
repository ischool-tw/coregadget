import { ConfigService, AbsenceConf, PeriodConf } from './../service/config.service';
import { AlertService } from './../service/alert.service';
import { DSAService, Student, AttendanceItem, PeriodStatus, GroupType, RollCallCheck } from './../service/dsa.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuPositionX } from '@angular/material/menu';
import { StudentCheck } from './student-check';
import { Router } from '@angular/router';

@Component({
  selector: 'gd-student-pick',
  templateUrl: './student-pick.component.html',
  styleUrls: ['../common.css']
})

export class StudentPickComponent implements OnInit {

  today: string;

  periodConf: PeriodConf; // 節次設定，決定有哪些缺曠可以點。

  selectedAbsence: string; // 已選擇的缺曠類別。
  selectedAbsence_eng: string;

  groupInfo: { type: GroupType, id: string, name: string } // 課程或班級。

  studentChecks: StudentCheck[]; //點名狀態。

  checkSummary: string; // 目前點名狀態統計。

  constructor(
    private dsa: DSAService,
    private route: ActivatedRoute,
    private alert: AlertService,
    private config: ConfigService,
    private change: ChangeDetectorRef,
    private router: Router,
  ) {
    this.today = dsa.getToday();
  }


  async ngOnInit() {

    this.groupInfo = { type: '', id: '', name: '' };

    await this.config.ready;

    // 取得前一頁傳來的資料。
    this.route.queryParamMap.subscribe(p => {
      // 課程名稱或班級名稱。
      this.groupInfo.name = p.get('DisplayName');
    });

    this.route.paramMap.subscribe(async pm => {
      this.groupInfo.type = pm.get('type') as GroupType; // course or class
      this.groupInfo.id = pm.get('id'); // course id
      const period = pm.get('p'); // period name

      // 可點節次。
      this.periodConf = this.config.getPeriod(period);
      this.periodConf.Absence = [].concat(this.periodConf.Absence || []);

      let abs = this.config.getAbsences();
      for (let ab of this.periodConf.Absence) {
        for (let xx of abs) {
          if (ab.Name === xx.Name) {
            ab.english_name = xx.english_name;
            ab.english_abbr = xx.english_abbr;
          }
        }
      }



      try {
        // 學生清單（含點名資料）。 
        await this.reloadStudentAttendances();
      } catch (error) {
        this.alert.json(error);
      }

      // 當有假別預設選第1個
      if (this.periodConf.Absence.length > 0) {
        this.selectedAbsence = this.periodConf.Absence[0].Name;
        this.selectedAbsence_eng = this.periodConf.Absence[0].english_name;
      }

    });
  }

  /** 依目前以數載入缺曠資料。 */
  public async reloadStudentAttendances(msg?: string) {
    const students = await this.dsa.getStudents(this.groupInfo.type, this.groupInfo.id, this.today);
    this.studentChecks = [];
    for (const stu of students) {

      // 取得學生照片 url
      stu.PhotoUrl = `${this.dsa.getAccessPoint()}/behavior.GetStudentPhoto?stt=Session&sessionid=${this.dsa.getSessionID()}&parser=spliter&content=StudentID:${stu.ID}`;
      const status = this.getSelectedAttendance(stu);
      this.studentChecks.push(new StudentCheck(stu, status, this.periodConf));
    }
    this.calcSummaryText();

    if (msg) this.alert.snack(msg);
  }

  selectedAbsenceItem(abb) {
    this.selectedAbsence = abb.Name;
    this.selectedAbsence_eng = abb.english_name;
  }

  changeAttendance(stu: StudentCheck) {

    if (!this.selectedAbsence) {
      this.alert.snack('Type of leave required.');
      return;
    }

    if (!stu.acceptChange()) {
      this.alert.snack('This student has been pre-approved and cannot be modified.');
      // this.alert.snack('此學生無法調整缺曠。');
      return;
    }

    stu.setAttendance(this.selectedAbsence);

    this.calcSummaryText();

    //因為只是調整陣列中的某個元件資料，並不會引發畫面更新。
    // this.change.markForCheck();
  }

  /** 計算統計值。 */
  calcSummaryText() {
    const summary = new Map<string, number>();
    for (const check of this.studentChecks) {

      if (!check.acceptChange()) continue;
      if (!check.status) continue;

      if (!summary.has(check.status.AbsenceType)) {
        summary.set(check.status.AbsenceType, 0);
      }

      summary.set(check.status.AbsenceType, summary.get(check.status.AbsenceType) + 1);
    }

    let text: string[] = [];
    for (let k of Array.from(summary)) {
      // text.push(`${k[0]}: ${k[1]}`);
      // 轉換
      let key = k[0];
      let value = k[1];

      for (let ab of this.periodConf.Absence) {
        if (ab.english_name && ab.Name === key) {
          key = ab.english_name;
        }
      }

      text.push(`${key}: ${value}`);
    }

    this.checkSummary = text.join(', ');
  }

  getAttendanceText(stu: StudentCheck) {
    let value = stu.status ? stu.status.AbsenceType : 'Present';
    // let value = stu.status ? stu.status.AbsenceType : 'Check';
    for (let xx of this.periodConf.Absence) {
      if (xx.english_name && xx.Name === value) {
        value = xx.english_name;
      }
    }
    return value;
  }

  getAttendanceStyle(stu: StudentCheck) {

    let bgColor = 'white';
    let fgColor = 'rgba(0,0,0,.12)';

    if (stu.status) {
      const absType = stu.status.AbsenceType;
      const absConf = this.config.getAbsence(absType);
      if (absConf.Abbr) {
        bgColor = this.config.getAbsenceColor(absConf.Abbr);
      }

      fgColor = 'white';
    }

    return {
      "background-color": bgColor,
      "color": fgColor,
    }
  }

  /**
   * 取得學生在目前節次的缺曠狀態。
   * @param stu 學生資料。
   */
  private getSelectedAttendance(stu: Student) {
    if (!stu.Attendance) return;
    const period = this.periodConf.Name;
    const dateAtts = [].concat(stu.Attendance.Period || []) as PeriodStatus[];
    return dateAtts.find(v => v['@text'] === period);
  }

  async saveRollCall() {

    const items: RollCallCheck[] = [];

    for (const check of this.studentChecks) {
      items.push(check.getCheckData());
    }

    const dialog = this.alert.waiting("Saving...");

    try {
      await this.dsa.setRollCall(this.groupInfo.type, this.groupInfo.id, this.periodConf.Name, items);
      await this.reloadStudentAttendances();

      // 回到主畫面
      this.router.navigate(['/attendance/main']);
    } catch (error) {
      this.alert.json(error);
    } finally {
      dialog.close();
    }

  }
}