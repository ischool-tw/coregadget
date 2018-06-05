import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from '../gadget.service';
import { Utils } from '../util';
import { subjectInfo } from './subjectInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-add-dialog',
  templateUrl: './add-dialog.component.html',
  styles: []
})
export class AddDialogComponent implements OnInit {
  head: string;
  accessPoint: string;
  // 課程資訊
  courseInfo: any;
  loading: boolean = true;
  error: any;
  subject: subjectInfo;
  buttonText: string = "";


  constructor(private route: ActivatedRoute, private gadget: GadgetService, private router: Router, public dialogRef: MatDialogRef<AddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  // 取得 contract 連線。
  contract: Contract;

  async ngOnInit() {

    this.subject = new subjectInfo();
    this.contract = await this.gadget.getContract('ischool.course_selection');

    this.getData();
  }

  async join() {
    this.dialogRef.close({
      subjectID: this.data.subjectID,
      mode: this.data.mode
    })
  }

  async close() {
    this.dialogRef.close()
  }

  async getData() {
    this.buttonText = "加入志願";
    if (this.data.mode !== "志願序") {
      this.buttonText = "選課";
    }

    this.loading = true;

    //  console.log(this.data.mode);

    try {
      // 呼叫 service。
      const rsp1 = await this.contract.send('GetSubjectDetail', {
        Request: {
          RefSubjectID: this.data.subjectID,
          Mode: this.data.mode
        }
      });
      this.courseInfo = Utils.array(rsp1, "Reslut");
      //   <Reslut>
      //   <subject_name>刊物編輯與文學創作</subject_name>
      //   <goal/>
      //   <content/>
      //   <memo/>
      //   <level>4</level>
      //   <credit>2</credit>
      //   <limit>60</limit>
      //   <count>443</count>
      // </Reslut>


      if (this.courseInfo.length > 0) {
        this.subject.subjectID = this.data.subjectID;
        this.subject.subjectName = this.courseInfo[0]["subject_name"];
        this.subject.courseObject = this.courseInfo[0]["goal"];
        this.subject.classContent = this.courseInfo[0]["content"];
        this.subject.memo = this.courseInfo[0]["memo"];
        this.subject.subjectLevel = this.courseInfo[0]["level"];
        this.subject.subjectCredit = this.courseInfo[0]["credit"];
        this.subject.maxCount = this.courseInfo[0]["limit"];
        this.subject.selectedCount = this.courseInfo[0]["count"];
      }
      // console.log(this.subject);       
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

}
