import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BehaviorRoutingModule } from './behavior-routing.module';
import { AppComponent } from './behavior.component';

import { MainComponent } from './main/main.component';
import { AddComponent } from './add/add.component';
import { ListComponent } from './list/list.component';
import { CommentComponent } from './comment/comment.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BehaviorRoutingModule
  ],
  declarations: [
    AppComponent,
    MainComponent,
    AddComponent,
    ListComponent,
    CommentComponent,
  ]
})
export class BehaviorModule { }
