import { Injectable } from '@angular/core';
import { WeeklyReportEntry } from './weekly_report/weeklyReportEntry';

@Injectable({
  providedIn: 'root'
})
export class WeeklyDataService {

  constructor() { }

  // 教師名稱
  public teacherName: string = "Miranda";

  // 已讀統計
  public weeklyReportHasReadCountLst: any;

  // 目前課程WeeklyReport
  public currentCousreWeeklyReportList: any;

  public addWeeklyReportEntry: WeeklyReportEntry;

  public studentWeeklyDataList: any;

  // Add 使用的學生
  public addStudentsList: any;

  // Add 使用的學生評語
  public addBehavoirList: any;

  // Add 使用的Gradebook
  public addGradebookList: any;

  // 使用這畫面已選
  public addSelectdGradebook: any;

  // Add 畫面1 Button 是否可以使用
  public addS1ButtonEnable: boolean = true;
  // Add 畫面2 Button 是否可以使用
  public addS2ButtonEnable: boolean = true;

  // 在編輯過程中存的uid
  public selectWeeklyReportUID = "";

  // 在編輯過程用到上次資料庫取得資料
  public selectWeeklyData: any;
}
