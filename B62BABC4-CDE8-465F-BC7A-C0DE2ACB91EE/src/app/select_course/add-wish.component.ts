import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from '../gadget.service';
import { Utils } from '../util';
import { subjectInfo } from './subjectInfo';
import { courseInfo } from './courseInfo';
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
  saving: boolean = false;
  subjectType: string;
  currentStatus: any;
  Tooltip = "設為第一志願人數 / 課程人數上限 1. 代表熱程熱門程度 2. 可自行評估選上的機率 3. 請避免在第二志願選填第一志願分發必定額滿的課程";
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

      this.currentStatus.Wish = [].concat(this.currentStatus.Wish || []);
      this.currentStatus.Subject = [].concat(this.currentStatus.Subject || []);
    } catch (err) {
      console.log(err);
      alert("addWish error:\n"+JSON.stringify(err));
    } finally {
      this.loading = false;
    }
  }

  async setData() {
    try {
      this.saving = true;
      await this.contract.send('SetWish', { SubjectType: this.subjectType, Wish: this.currentStatus.Wish });

    } catch (err) {
      alert(err);
    } finally {
      var self = this;
      this.saving = false;
      self.currentStatus.Subject.forEach(function (subject) {
        subject.WishOrder = "";
        self.currentStatus.Wish.forEach(function (wish) {
          if (subject.SubjectID == wish.SubjectID) {
            subject.WishOrder = wish.WishOrder;
          }
        });
      });
      this.getData();
    }
  }
  removeItem(subject) {
    if (this.saving)
      return;

    var index = this.currentStatus.Wish.indexOf(subject);
    if (index >= 0) {
      this.currentStatus.Wish.splice(index, 1);
      this.currentStatus.Wish.forEach(function (wish, order) {
        wish.WishOrder = order + 1;
      });

      this.setData();
    }
  }

  moveDown(subject) {
    if (this.saving)
      return;
    subject.WishOrder += 1.5;
    this.currentStatus.Wish.sort(function (a, b) {
      return a.WishOrder - b.WishOrder;
    });
    this.currentStatus.Wish.forEach(function (wish, order) {
      wish.WishOrder = order + 1;
    });
    this.setData();
  }

  moveUp(subject) {
    if (this.saving)
      return;
    subject.WishOrder -= 1.5;
    this.currentStatus.Wish.sort(function (a, b) {
      return a.WishOrder - b.WishOrder;
    });
    this.currentStatus.Wish.forEach(function (wish, order) {
      wish.WishOrder = order + 1;
    });
    this.setData();
  }

  joinCourse(subject) {
    if (this.saving)
      return;
    var index = this.currentStatus.Wish.indexOf(subject);
    if (index < 0 && this.currentStatus.Wish.length < 5) {
      this.currentStatus.Wish.push({ ...subject });
      this.currentStatus.Wish.forEach(function (wish, order) {
        wish.WishOrder = order + 1;
      });
      this.setData();
    }

  }

  showDialog(subject) {
    // console.log(JSON.stringify(subject));
    const dig = this.dialog.open(AddDialogComponent, {
      data: { subject: subject, mode: '志願序' }
    });

    dig.afterClosed().subscribe((v) => {
    //  alert(JSON.stringify(v.subject));
      if (v.subject) {
        this.joinCourse(v.subject);
      }
    });
  }
}