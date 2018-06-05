import { GadgetService } from './gadget.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { DialogComponent } from './dialog.component';
import { MatButtonModule } from '@angular/material';
import { MatDialogModule } from '@angular/material';
import {MatTooltipModule} from '@angular/material';
import { MainComponent } from './select_course/main.component';
import { AddTaskAwayComponent } from './select_course/add-task-away.component';
import { AddWishComponent } from './select_course/add-wish.component';
import { AddDialogComponent } from './select_course/add-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    DialogComponent,
    MainComponent,
    AddTaskAwayComponent,
    AddWishComponent,
    AddDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule, 
    MatDialogModule,
    MatTooltipModule
  ],
  providers: [GadgetService],
  bootstrap: [AppComponent],
  entryComponents: [
    DialogComponent,
    AddDialogComponent
  ]
})
export class AppModule { }
