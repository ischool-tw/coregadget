import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppMaterialModule } from './app-material.module';
import { AlertService } from './service/alert.service';
import { DSAService } from './service/dsa.service';
import { ConfigService } from './service/config.service';
import { AttendanceRoutingModule } from './attendance-routing.module';
import { AppComponent } from './attendance.component';
import { DebugComponent } from './modal/debug.component';
import { WaitingComponent } from './modal/waiting.component';
import { MainComponent } from './attendance/main.component';
import { StudentPickComponent } from './attendance/student-pick.component';
import { PeriodChooserComponent } from './modal/period-chooser.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AttendanceRoutingModule,
    AppMaterialModule,
  ],
  providers: [DSAService, ConfigService, AlertService],
  declarations: [
    AppComponent,
    MainComponent,
    StudentPickComponent,
    DebugComponent,
    WaitingComponent,
    PeriodChooserComponent,
  ],
  entryComponents: [
    PeriodChooserComponent,
    DebugComponent,
    WaitingComponent
  ]
})
export class AttendanceModule { }