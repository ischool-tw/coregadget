import { GadgetService } from './gadget.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material';
import { MatDialogModule } from '@angular/material';
import { MatTooltipModule } from '@angular/material';
import { MainComponent } from './main.component';
import { MatSelectModule } from '@angular/material/select';
import { MyReservationComponent } from './reserve/my-reservation.component';
import { EquipBookingComponent } from './equip-booking/equip-booking.component';
import { ManageComponent } from './manage/manage.component';
import {MatDatepickerModule, MatNativeDateModule, MatInputModule} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatRadioModule} from '@angular/material/radio';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import { ConfirmCancelComponent } from './shared/confirm-cancel.component';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    MyReservationComponent,
    EquipBookingComponent,
    ManageComponent,
    ConfirmDialogComponent,
    ConfirmCancelComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule
  ],
  providers: [GadgetService,],
  bootstrap: [AppComponent],
  entryComponents: [
    ConfirmDialogComponent,
    ConfirmCancelComponent,
  ]
})
export class AppModule { }
