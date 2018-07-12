import { GadgetService } from './gadget.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material';
import { MatDialogModule } from '@angular/material';
import { MatTooltipModule } from '@angular/material';
import { MainComponent } from './main.component';
import { MatSelectModule } from '@angular/material/select';
//Import DevExtreme and DevExteme-intl
import { DevExtremeModule } from 'devextreme-angular';
import { DxSchedulerModule } from 'devextreme-angular';
import { BookingComponent } from './booking/booking.component';
import { MyReservationComponent } from './reserve/my-reservation.component';
import 'devextreme-intl';
import { locale, loadMessages } from 'devextreme/localization';
import * as zhMessages from './zh.json';
import { BookingMainComponent } from './booking/booking-main.component';


loadMessages(zhMessages);

//Set locale according the browser language
locale(navigator.language);

@NgModule({
  declarations: [
    AppComponent,
    MainComponent, BookingComponent, MyReservationComponent, BookingMainComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    // Add DevExtremeModule to imports
    DevExtremeModule,
    DxSchedulerModule,
    MatSelectModule
  ],
  providers: [GadgetService, ],
  bootstrap: [AppComponent],
  entryComponents: [

  ]
})
export class AppModule { }
