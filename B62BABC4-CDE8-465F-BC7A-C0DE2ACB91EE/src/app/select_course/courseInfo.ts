import {subjectInfo} from './subjectInfo';

// 課程資訊
export class courseInfo{
   
    // 課程類別
    typeName:string = "";
    // 是沒有課程 t/f
    isNoCourse:boolean = true;
    // 科目清單
    subjectList:any;
    // 是否顯示志願序統計
    isDisplayWishCount = true;

    // 選課結果
    selectedCourse:string = "";
    
    // 是否顯示按鈕
    isDisplayButton:boolean = true;
}