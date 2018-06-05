import { Injectable } from '@angular/core';
import { courseInfo } from './select_course/courseInfo';
@Injectable({
  providedIn: 'root'
})
export class SelectCourseDataService {

  constructor() { }

  // 課程資訊
  public courseInfoList:any;

  // 使用者選的課程資訊
  public selectCourseInfo:courseInfo;

  // 志願序
  public selectWishList:any;


}
