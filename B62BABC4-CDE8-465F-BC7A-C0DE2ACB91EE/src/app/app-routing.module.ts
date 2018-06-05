
import {MainComponent} from './select_course/main.component';
import {AddDialogComponent} from './select_course/add-dialog.component';
import {AddTaskAwayComponent} from './select_course/add-task-away.component';
import {AddWishComponent} from './select_course/add-wish.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'main', component: MainComponent },
  {path:'add-dialog/:subjid/:mode',component:AddDialogComponent},
  {path:'add-task-away/:subjectType',component:AddTaskAwayComponent},
  {path:'add-wish/:subjectType',component:AddWishComponent},    
  // {path:'add-s1/:id/:name',component:AddS1Component},

];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
