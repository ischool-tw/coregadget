import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {ListComponent} from './weekly_report/list.component';
// import {AddComponent} from './weekly_report/add.component';
import {AddS1Component} from './weekly_report/add-s1.component';
import {AddS2Component} from './weekly_report/add-s2.component';
import {AddS3Component} from './weekly_report/add-s3.component';
import {MainComponent} from './weekly_report/main.component';
import {DetailComponent} from './weekly_report/detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  // { path: 'add/:id/:name', component: AddComponent },
  {path:'add-s1/:id/:name/:uid',component:AddS1Component},
  {path:'add-s2',component:AddS2Component},
  {path:'add-s3',component:AddS3Component},
  { path: 'list/:id/:name', component: ListComponent },
  { path: 'detail/:wruid/:name', component: DetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WeeklyReportRoutingModule { }
