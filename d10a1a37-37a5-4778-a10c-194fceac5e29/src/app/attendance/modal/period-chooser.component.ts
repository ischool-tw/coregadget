import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfigService, PeriodConf } from './../service/config.service';
import { DSAService, RollCallRecord } from './../service/dsa.service';
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'gd-period-chooser',
  templateUrl: './period-chooser.component.html',
  styleUrls: ['../common.css'],
  // encapsulation: ViewEncapsulation.Emulated
})
export class PeriodChooserComponent implements OnInit {

  title; 

  periods: PeriodConf[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private config: ConfigService,
    public dialogRef: MatDialogRef<PeriodChooserComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {course: RollCallRecord}
  ) {

    this.title = data.course.Name;

    dialogRef.updateSize('650px');
  }

  async ngOnInit() {
    await this.config.ready;
    this.periods = this.config.getPeriods();
    console.log(this.periods);
  }

  gotoPick(period) {
    this.router.navigate(['/attendance/pick','Course', this.data.course.UID, period.Name], {
    // this.router.navigate(['/attendance/main'], {
      queryParams: { DisplayName: this.title },
      relativeTo: this.route
    });
    this.dialogRef.close();
  }

  // 該節是否可以點名。
  allow_choose(period: PeriodConf) {
    if(!period.Absence) return false;

    return period.Absence.length<=0
  }
}
