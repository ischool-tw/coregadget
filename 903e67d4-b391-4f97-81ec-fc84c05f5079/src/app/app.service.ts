import { Injectable, NgZone } from '@angular/core';
import { Class, Student, Absence, Period, Leave } from "./help-class";
import * as Rx from "rxjs/Rx";

type SendOptions = { contact: string, service: string, body: any, map: (rsp) => any };

@Injectable()
export class AppService {

  // p.kcbs.hc.edu.tw

  constructor(private zone: NgZone) { }

  /**呼叫 gadget service */
  private send(opts: SendOptions): Rx.Observable<any> {
    return Rx.Observable.create((subj$) => {
      let connection = gadget.getContract(opts.contact);
      connection.send({
        service: opts.service,
        body: opts.body,
        result: (response, error) => {
          if (error !== null) {
            subj$.error(error);
          } else {
            this.zone.run(() => {
              subj$.next(opts.map(response));
              subj$.complete();
            });
          }
        }
      });
    });
  }

  /**取得老師帶班 */
  getMyClass(): Rx.Observable<Class[]> {

    return this.send({
      contact: "cloud.teacher",
      service: "beta.GetMyClass",
      body: "",
      map: (rsp) => {
        let classes = new Array<Class>();
        rsp.Class.forEach((item) => {
          classes.push(new Class(item.ClassId, item.ClassName, item.GradeYear));
        });
        return classes;
      }
    }) as Rx.Observable<Class[]>;
  }

  /**取得節次 */
  getPeriods(): Rx.Observable<Period[]> {

    return this.send({
      contact: "cloud.public",
      service: "beta.GetSystemConfig",
      body: { Name: '節次對照表' },
      map: (rsp) => {
        let periods = new Array<Period>();
        rsp.List.Content.Periods.Period.forEach((item) => {
          periods.push(new Period(item.Name, Number(item.Sort), item.Type));
        });
        // 排序
        periods.sort((a, b) => {
          if (a.sort > b.sort) {
            return 1;
          }
          if (a.sort < b.sort) {
            return -1;
          }
          return 0;
        });
        return periods;
      }
    }) as Rx.Observable<Period[]>;
  }

  /**取得假別 */
  getAbsences(): Rx.Observable<Absence[]> {

    return this.send({
      contact: "cloud.public",
      service: "beta.GetSystemConfig",
      body: { Name: '假別對照表' },
      map: (rsp) => {
        let absences = new Array<Absence>();
        rsp.List.Content.AbsenceList.Absence.forEach((item) => {
          absences.push(new Absence(item.Name, item.Abbreviation));
        });
        return absences;
      }
    }) as Rx.Observable<Absence[]>;
  }

  /**取得今天某班級點名狀態 */
  getRollcallState(selClass: Class): Rx.Observable<boolean> {
    
    return this.send({
      contact: "p_kcbs.rollCallBook.teacher",
      service: "_.checkTodayRollCall",
      body: { classId: selClass.classId },
      map: (rsp) => {
        return rsp.completed;
      }
    }) as Rx.Observable<boolean>;
  }

  /**取得班級學生及今天請假狀態 */
  getClassStudentsLeave(selClass: Class): Rx.Observable<Student[]> {

    return this.send({
      contact: "p_kcbs.rollCallBook.teacher",
      service: "_.getStudentAttendance",
      body: { classId: selClass.classId },
      map: (rsp) => {
        let students = new Array<Student>();
        if (rsp.Student) {
          let stus = [].concat(rsp.Student || []);
          stus.forEach((item) => {
            let leaves: Map<string, Leave> = new Map<string, Leave>();
            if (item.Detail && item.Detail.Attendance && item.Detail.Attendance.Period) {
              let periods: any = [].concat(item.Detail.Attendance.Period || []);
              periods.forEach((p) => {
                leaves.set(p['@text'], new Leave(p['@text'], p.AbsenceType));
              });
            }
            students.push(new Student(item.StudentId, item.StudentName, item.SeatNo, leaves));
          });
        }
        return students;
      }
    }) as Rx.Observable<Student[]>;
  }

  /**儲存學生請假狀況 */
  saveStudentLeave(selClass, data) {

    return this.send({
      contact: "p_kcbs.rollCallBook.teacher",
      service: "_.setStudentAttendance",
      body: {
        classId: selClass.classId,
        students: { student: data }
      },
      map: (rsp) => {
        return rsp.complete;
      }
    }) as Rx.Observable<boolean>;
  }
}
