import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {CommentComponent} from './comment/comment.component';
import {ListComponent} from './list/list.component';
import {AddComponent} from './add/add.component';
import {MainComponent} from './main/main.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'add/:id/:name', component: AddComponent },
  { path: 'list/:id/:name', component: ListComponent },
  { path: 'comment', component: CommentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BehaviorRoutingModule { }
