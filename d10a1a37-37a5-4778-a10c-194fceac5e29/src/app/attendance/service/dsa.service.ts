import { Injectable } from '@angular/core';
import { GadgetService, Contract } from 'src/app/gadget.service';

import * as Moment from 'moment';

@Injectable()
export class DSAService {

  private ready: Promise<void>;

  private contract: Contract;

  constructor(private gadget: GadgetService) {
    this.ready = this.initContract();
  }

  private async initContract() {
    try {
      this.contract = await this.gadget.getContract('kcis');
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * 取得老師班級課程清單
   */
  public async getCCItems() {
    await this.ready; //等待 contract 準備完成。

    const rsp = await this.contract.send('attendance.GetCCItems');

    return (rsp && rsp.Items.Item as RollCallRecord[]) || [];
  }

  /**
   * 取得缺曠類別節次
   */
  public async getGetConfig() {
    await this.ready;

    const rsp = await this.contract.send('attendance.GetConfig');

    return rsp && rsp.Config;
  }

  /**
   * 取得班級課程學生清單。
   * @param type 類型：Course、Class
   * @param id 編號。
   * @param date 日期。
   */
  public async getStudents(type, id, date) {
    await this.ready;

    const req: any = {
      Request: {
        Type: type,
        OccurDate: date,
      }
    }

    if (type === "Course") req.Request.CourseID = id;
    if (type === "Class") req.Request.ClassID = id;

    const rsp = await this.contract.send('attendance.GetStudents', req);

    return ((rsp && rsp.Students && rsp.Students.Student) || []) as Student[];
  }

  /**
   * 取得建議點名清單。
   * @param date 日期。
   */
  public async getSuggestRollCall(date: string) {
    await this.ready;

    const rsp = await this.contract.send('attendance.SuggestRollCall', {
      Request: {
        OccurDate: date
      }
    });

    return [].concat((rsp && rsp.list) || []) as SuggestRecord[];
  }

  /**
   * 儲存點名資料。
   */
  public async setRollCall(type: GroupType, id: string, period: string, data: RollCallCheck[]) {
    await this.ready;

    const req: any = {
      Period: period,
      Student: JSON.stringify(data),
    };

    if(type === 'Course') {
      req.CourseID = id;
    } else {
      req.ClassID = id;
    }

    const rsp = await this.contract.send('attendance.SetRollCall', req);

    return rsp;
  }

  /**
   * 取得今日日期。
   */
  public getToday() {
    return Moment().format('YYYY/MM/DD');
  }
}

export type GroupType = '' | 'Course' | 'Class'
/**
 * 班級課程項目。
 */
export interface RollCallRecord {

  UID: string;

  Name: string;

  Type: GroupType;

  Students: string;
}

export interface Config {
  Timestamp: string;

  Periods: any;

  Absences: any;
}

export interface SuggestRecord {

  Checked: string;

  CourseID: string;

  CourseName: string;

  Period: string;
}

export interface Student {
  ID: string;
  Name: string;
  SeatNo: string;
  StudentNumber: string;
  Photo: string;
  ClassName: string;
  Attendance: AttendanceItem;
}

export interface AttendanceItem {
  Period: PeriodStatus;
}

/**
 * 代表某一節次的缺曠狀態。
 */
export interface PeriodStatus {

  /** '@text' 取得節次名稱。 */
  [x: string]: string;

  /**
   * 缺曠類型。(另外可使用 periodItem['@text'] 取得節次名稱。)。
   */
  AbsenceType: string;
}

export interface RollCallCheck {
  //** 學生編號。 */
  ID: string;

  /** 缺曠類別。 */
  Absence: string;
}