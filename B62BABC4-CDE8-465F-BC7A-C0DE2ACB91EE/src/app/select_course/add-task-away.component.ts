﻿import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from '../gadget.service';
import { Utils } from '../util';
import * as moment from 'moment';
import { subjectInfo } from './subjectInfo';
import { courseInfo } from './courseInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AddDialogComponent } from './add-dialog.component';


@Component({
  selector: 'app-add-task-away',
  templateUrl: './add-task-away.component.html',
  styles: []
})
export class AddTaskAwayComponent implements OnInit {

  loading: boolean = true;
  saving: boolean = false;
  subjectType: string;
  currentStatus: any;

  constructor(private route: ActivatedRoute, private gadget: GadgetService, private router: Router, private dialog: MatDialog) { }
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

      // this.currentStatus.Attend = [].concat(this.currentStatus.Attend || []);
      this.currentStatus.Subject = [].concat(this.currentStatus.Subject || []);

    } catch (err) {
      // console.log(err);
      alert("GetSubjectList error:\n" + JSON.stringify(err));
    } finally {
      this.loading = false;
    }
  }

  joinCourse(subject) {
    if (this.saving)
      return;

    this.setData({ ...subject });

  }

  leaveCourse(subject){
    if (this.saving)
      return;

    this.removeData({ ...subject });
  }

  async removeData(subject) {
    try {
      this.saving = true;

      let rsp = await this.contract.send('LeaveTakeAway', { SubjectType: this.subjectType, SubjectID: subject.SubjectID });
      console.log(rsp);
      if (rsp.message != "") {
        alert(rsp.message);
      }
    } catch (err) {

      alert("LeaveTakeAway error:\n" + JSON.stringify(err));
    } finally {
      // var self = this;
      this.saving = false;

      this.getData();
    }
  }
  
  async setData(subject) {
    try {
      this.saving = true;

      let rsp = await this.contract.send('SetTakeAway', { SubjectType: this.subjectType, SubjectID: subject.SubjectID });
      console.log(rsp);
      if (rsp.message != "") {
        alert(rsp.message);
      }
    } catch (err) {

      alert("SetTakeAway error:\n" + JSON.stringify(err));
    } finally {
      // var self = this;
      this.saving = false;

      this.getData();
    }
  }

  showDialog(subject, mode) {
    // console.log(JSON.stringify(subject));
    const dig = this.dialog.open(AddDialogComponent, {
      data: { subject: subject, mode: mode , countMode:'先搶先贏'}
    });

    dig.afterClosed().subscribe((v) => {
      //  alert(JSON.stringify(v.subject));
      if (v && v.subject) {
        this.joinCourse(v.subject);
      }
    });
  }
  getLevel(subject) {
    switch (subject.Level) {
      case "":
        return "";
      case "1":
        return " I";
      case "2":
        return " II";
      case "3":
        return " III";
      case "4":
        return " IV";
      case "5":
        return " V";
      case "6":
        return " VI";
      case "7":
        return " VII";
      case "8":
        return " VIII";
    }
  }

}
