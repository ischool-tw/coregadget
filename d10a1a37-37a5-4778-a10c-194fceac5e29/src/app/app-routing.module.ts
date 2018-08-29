import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './home/home.module#HomeModule' },
  { path: 'behavior', loadChildren: './behavior/behavior.module#BehaviorModule' },
  { path: 'weekly_report', loadChildren: './weekly-report/weekly-report.module#WeeklyReportModule' },
  { path: 'attendance', loadChildren: './attendance/attendance.module#AttendanceModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
