import { Component, OnInit,ViewChild } from '@angular/core';
import { SakuraService } from './service/sakura.service';
import { MyReservationComponent } from './reserve/my-reservation.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styles: [`
    :host() {
      flex:1;
    }
  `]
})
export class MainComponent implements OnInit {

  // 我的預約 component，預約異動時要同步變更我的預約
  @ViewChild("myReservation") myReservation: MyReservationComponent;

  isTeacher: boolean = false;

  constructor(private sakura: SakuraService) {
  }

  /** Initialize  */
  async ngOnInit() {
    this.isTeacher = this.sakura.isTeacher();
  }

  public reloadMyReservation() {
    this.myReservation.getData();
  }
}
