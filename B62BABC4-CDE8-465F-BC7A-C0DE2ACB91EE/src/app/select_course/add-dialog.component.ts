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

  constructor(private route: ActivatedRoute, private gadget: GadgetService, private router: Router, public dialogRef: MatDialogRef<AddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  // 取得 contract 連線。
  contract: Contract;
  buttonText: string = "";

  async ngOnInit() {

    this.getData();
  }

  async join() {
    this.dialogRef.close({
      // 回傳 subject
      subject: this.data.subject,
    })
  }

  async close() {
    this.dialogRef.close()
  }

  async getData() {
    if (this.data.mode == "志願序") {
      this.buttonText = "加入志願";
    } else if (this.data.mode == "先搶先贏") {
      this.buttonText = "選課";
    } else {
      this.buttonText = "";
    }
  }
}
