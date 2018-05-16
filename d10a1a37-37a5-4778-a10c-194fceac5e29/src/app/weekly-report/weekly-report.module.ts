import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WeeklyReportRoutingModule } from './weekly-report-routing.module';

import { MainComponent } from './weekly_report/main.component';
import { AddComponent } from './weekly_report/add.component';
import { ListComponent } from './weekly_report/list.component';
import { DetailComponent } from './weekly_report/detail.component';
import { WeeklyDataService } from './weekly-data.service';
import { AddS2Component } from './weekly_report/add-s2.component';
import { AddS3Component } from './weekly_report/add-s3.component';
import { AddS1Component } from './weekly_report/add-s1.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    WeeklyReportRoutingModule
  ],
  declarations: [
    MainComponent,
    AddComponent,
    ListComponent,
    DetailComponent,
    AddS2Component,
    AddS3Component,
    AddS1Component,
  ]
})
export class WeeklyReportModule { }
