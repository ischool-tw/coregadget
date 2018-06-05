import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from '../gadget.service';
import { Utils } from '../util';
import { subjectInfo } from './subjectInfo';
import { courseInfo } from './courseInfo';
import { SelectCourseDataService } from '../select-course-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AddDialogComponent } from './add-dialog.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-add-wish',
  templateUrl: './add-wish.component.html',
  styles: []
})
export class AddWishComponent implements OnInit {
  loading: boolean = true;
  subjectType: string;
  currentStatus: any;

  constructor(private route: ActivatedRoute, private gadget: GadgetService, private selectCourseData: SelectCourseDataService, private router: Router, private dialog: MatDialog) { }
  // 取得 contract 連線。
  contract: Contract;


  async ngOnInit() {
    this.contract = await this.gadget.getContract('ischool.course_selection');
    this.subjectType = this.route.snapshot.paramMap.get("subjectType");
    this.getData();
  }
  async getData() {
    try {
      this.loading = true;
      this.currentStatus = await this.contract.send('GetSubjectList', { SubjectType: this.subjectType });

      this.currentStatus.Wish = [].concat(this.currentStatus.Wish || []);
      this.currentStatus.Subject = [].concat(this.currentStatus.Subject || []);
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  async setData(){
    try {
      this.loading = true;
      this.currentStatus = await this.contract.send('SetWish', { SubjectType: this.subjectType, Wish: this.currentStatus.Wish });
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
      this.getData();
    }
  }
  removeItem(subject) {
    var index = this.currentStatus.Wish.indexOf(subject);
    if (index >= 0) {
      this.currentStatus.Wish.splice(index, 1);
      this.currentStatus.Wish.forEach(function (wish, order) {
        wish.WishOrder = order + 1;
      });
      this.setData();
    }
  }

  // showDialog(subject) {
  //   // console.log(subject.subjectID);
  //   const dig = this.dialog.open(AddDialogComponent, {
  //     data: { subjectID: subject.subjectID, mode: '志願序' }
  //   });

  //   dig.afterClosed().subscribe((v) => {
  //     // alert(JSON.stringify(v));

  //     this.sendData(v.subjectID);
  //   });
  // }

  // joinCourse(subject) {
  //   this.sendData(subject.subjectID);
  // }

  // moveUp(subject) {
  //   console.log(subject);
  //   // 當志願序=1，無法移動。
  //   // 當志願序非1，志願序與前一個交換，送到Service
  //   let currentWish: courseInfo;

  //   if (this.selWishList.length > 0) {
  //     currentWish = this.selWishList[0];
  //   }

  //   // 當志願是 1 無法往上
  //   let wOrder = parseInt(subject.wishOrder);
  //   if (wOrder === 1) {
  //     console.log("至頂");
  //   } else {
  //     this.changeData(subject, "up");
  //   }
  // }

  // moveDown(subject) {
  //   console.log(subject);
  //   let currentWish: courseInfo;
  //   if (this.selWishList.length > 0) {
  //     currentWish = this.selWishList[0];
  //   }
  //   // 當志願與數量相同不處理
  //   let wOrder = parseInt(subject.wishOrder);
  //   if (wOrder === currentWish.subjectList.length) {
  //     console.log("至底");
  //   } else {
  //     this.changeData(subject, "down");
  //   }
  // }

  // // 移動排序
  // async changeData(subject, move) {
  //   // 取得現在 Subject Order
  //   let nOrder = parseInt(subject.wishOrder);
  //   let oldOrder = subject.wishOrder;

  //   let newOrder = "";
  //   if (move === "up") {
  //     newOrder = "0" + (nOrder - 1);
  //   } else {
  //     newOrder = "0" + (nOrder + 1);
  //   }

  //   // 取得目前科目與排序
  //   let currentWish: courseInfo;
  //   if (this.selWishList.length > 0) {
  //     currentWish = this.selWishList[0];
  //   }

  //   let subjectList = currentWish.subjectList;

  //   for (const subj of subjectList) {
  //     if (subj.subjectID === subject.subjectID) {
  //       subj.wishOrder = newOrder;
  //     } else {
  //       if (subj.wishOrder === newOrder) {
  //         subj.wishOrder = oldOrder;
  //       }
  //     }
  //   }

  //   // 排序
  //   let wishOrderList = ["01", "02", "03", "04", "05"];
  //   subjectList = subjectList.sort((a, b) => wishOrderList.indexOf(a.wishOrder) - wishOrderList.indexOf(b.wishOrder));

  //   try {

  //     let subjs: any = [];
  //     let seq: number = 1;

  //     for (const subj of subjectList) {
  //       let item = {
  //         "@Sequence": seq,
  //         "@RefSubjectID": subj.subjectID
  //       }
  //       subjs.push(item);
  //       seq = seq + 1;
  //     }


  //     let typeName = this.selCourseType;
  //     const rsp2 = await this.contract.send('SetWish', {
  //       Request: {
  //         Wish: {
  //           Subject: subjs
  //         },
  //         Type: typeName
  //       }
  //     });
  //     let status = Utils.array(rsp2, "status");
  //     // this.selectCourseData.selectCourseInfo = this.courseList.filter(x => x.subjectID === subjectID);
  //     // 解析回傳訊息
  //     if (status.length > 0) {
  //       if (status[0].message !== "") {
  //         alert(status[0].message);
  //       }
  //     }
  //     this.getData();


  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //     this.loading = false;
  //   }

  // }

  // removeItem(subject) {
  //   // console.log(subject);
  //   this.removeData(subject.subjectID);
  // }

  // // 移除資料並傳到 service
  // async removeData(subjectID) {

  //   // 取得移除 subjectID 後要新增的
  //   let currentWish: courseInfo;
  //   if (this.selWishList.length > 0) {
  //     currentWish = this.selWishList[0];
  //   }

  //   let subjectList = currentWish.subjectList.filter(v => v.subjectID !== subjectID);
  //   // console.log(subjectList);
  //   try {

  //     let subjs: any = [];
  //     let seq: number = 1;
  //     let isRemoveAll: boolean = false;
  //     // 檢查是否完全移掉空的
  //     if (subjectList.length === 0) {
  //       isRemoveAll = true;
  //     } else {
  //       for (const subj of subjectList) {
  //         let item = {
  //           "@Sequence": seq,
  //           "@RefSubjectID": subj.subjectID
  //         }
  //         subjs.push(item);
  //         seq = seq + 1;
  //       }
  //     }
  //     console.log(subjs);
  //     let typeName = this.selCourseType;
  //     let rsp2;
  //     if (isRemoveAll) {
  //       rsp2 = await this.contract.send('SetWish', {
  //         Request: {
  //           Wish: {
  //             Subject: ""
  //           },
  //           Type: typeName
  //         }
  //       });
  //     } else {
  //       rsp2 = await this.contract.send('SetWish', {
  //         Request: {
  //           Wish: {
  //             Subject: subjs
  //           },
  //           Type: typeName
  //         }
  //       });
  //     }


  //     let status = Utils.array(rsp2, "status");
  //     // this.selectCourseData.selectCourseInfo = this.courseList.filter(x => x.subjectID === subjectID);
  //     // 解析回傳訊息
  //     if (status.length > 0) {
  //       if (status[0].message !== "") {
  //         alert(status[0].message);
  //       }
  //     }
  //     this.getData();


  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //     this.loading = false;
  //   }
  // }

  // // 新增資料並傳到 service
  // async sendData(subjectID) {
  //   //  console.log(v);

  //   // 檢查是否超過5個志願
  //   // 取得畫面上志願數

  //   let currentWish: courseInfo;
  //   let checkCanAdd: boolean = false;

  //   // console.log(this.selWishList[0]);
  //   if (this.selWishList.length > 0) {
  //     currentWish = this.selWishList[0];
  //   }

  //   // 檢查資料是否重複與超過5個
  //   if (currentWish.subjectList.length < 5) {
  //     let pass: boolean = true;
  //     for (const subj of currentWish.subjectList) {
  //       // 有重複資料
  //       if (subj.subjectID === subjectID) {
  //         pass = false;
  //       }
  //     }
  //     checkCanAdd = pass;
  //     if (!pass) {
  //       // alert("無法加入重複課程");
  //     }
  //   } else {
  //     // alert("超過5個志願無法加入");
  //   }

  //   // 可以新增
  //   if (checkCanAdd) {

  //     try {
  //       // _.SetWish
  //       // <Request>
  //       //   <Type>'多元選修'</Type>
  //       //   <Wish>
  //       //     <Subject Sequence="1" RefSubjectID="148273"/>
  //       //     <Subject Sequence="2" RefSubjectID="148275"/>
  //       //     <Subject Sequence="3" RefSubjectID="148276"/>
  //       //     <Subject Sequence="4" RefSubjectID="148278"/>
  //       //     <Subject Sequence="5" RefSubjectID="148279"/>
  //       //   </Wish>
  //       // </Request>

  //       let subjs: any = [];
  //       let seq: number = 1;
  //       for (const subj of currentWish.subjectList) {
  //         let item = {
  //           "@Sequence": seq,
  //           "@RefSubjectID": subj.subjectID
  //         }
  //         subjs.push(item);
  //         seq = seq + 1;
  //       }

  //       let subj1 = { "@Sequence": seq, "@RefSubjectID": subjectID };
  //       subjs.push(subj1);
  //       console.log(subjs);


  //       let typeName = this.selCourseType;
  //       const rsp2 = await this.contract.send('SetWish', {
  //         Request: {
  //           Wish: {
  //             Subject: subjs
  //           },
  //           Type: typeName
  //         }
  //       });
  //       let status = Utils.array(rsp2, "status");
  //       // this.selectCourseData.selectCourseInfo = this.courseList.filter(x => x.subjectID === subjectID);
  //       // 解析回傳訊息
  //       if (status.length > 0) {
  //         if (status[0].message !== "") {
  //           alert(status[0].message);
  //         }

  //       }
  //       this.getData();
  //     } catch (err) {
  //       console.log(err);
  //     } finally {
  //       this.loading = false;
  //     }
  //   }

  // }
}
