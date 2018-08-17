import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AttendanceRoutingModule } from './attendance-routing.module';
import { AppComponent } from './attendance.component';

import { MainComponent } from './attendance/main.component';
import { StudentComponent } from './attendance/student.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AttendanceRoutingModule
  ],
  declarations: [
    AppComponent,
    MainComponent,
    StudentComponent,
  ]
})
export class AttendanceModule { }