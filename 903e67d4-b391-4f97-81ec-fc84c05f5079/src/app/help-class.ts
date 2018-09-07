/**班級 */
export class Class {
  constructor(public classId, public className, public gradeYear) {
    this.classId = classId;
    this.className = className;
    this.gradeYear = gradeYear;
  }
}

/**學生 */
export class Student {
  constructor(public sid, public name:string, public seatNo:number, public leaveList: Map<string, Leave>, public orileaveList: Map<string, Leave>) {
    this.sid = sid;
    this.name = name;
    this.seatNo = seatNo;
    this.leaveList = leaveList || new Map<string, Leave>();
    this.orileaveList = orileaveList || new Map<string, Leave>();
  }

  setAbsence(periodName: string, absName: string) {    
    if (periodName) {
      if (absName) {
        this.leaveList.set(periodName, new Leave(periodName, absName));
      }
      else {
        this.leaveList.delete(periodName);
      }
    }
  }
}

/**假別及簡稱 */
export class Absence {
  constructor(public name: string, public abbreviation: string) {
    this.name = name;
    this.abbreviation = abbreviation;
  }
}

/**節次 */
export class Period {
  constructor(public name: string, public sort: number, public type: string) {
    this.name = name;
    this.sort = sort;
    this.type = type;
  }
}

/**學生請假的類別 */
export class Leave {
  constructor(public periodName: string, public absName: string) {
    this.periodName = periodName;
    this.absName = absName;
  }
}