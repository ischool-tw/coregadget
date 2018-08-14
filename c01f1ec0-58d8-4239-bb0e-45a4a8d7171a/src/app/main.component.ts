import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GadgetService, Contract } from './gadget.service';
import { SakuraService } from './service/sakura.service';
import { TeacherService } from "./service/teacher.service";
import { MyReservationComponent } from "./reserve/my-reservation.component";


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

  @ViewChild("siteInfo") siteInfo: ElementRef;
  // 我的預約 component，預約異動時要同步變更我的預約
  @ViewChild("myReservation") myReservation: MyReservationComponent;
  loading: boolean = true;

  /** === Data Objects from DSA === */

  buildings: string[];
  dicRoomsByBuilding: any;
  selectedValue: string;
  isAdmin: boolean = false;
  isUnitAdmin: boolean = false;
  rooms = [

  ];

  currentMeetingroomID: any;
  // // 取得 contract 連線。
  contract: Contract;
  // current_room: Meetingroom = new Meetingroom();

  isTeacher: boolean = false;

  funcCat: string = '1';

  // debug 用
  jsonutil = JSON;

  constructor(
    private gadget: GadgetService,
    private teacherService: TeacherService,
    private sakura: SakuraService
  ) {

  }

  /** Initialize  */
  async ngOnInit() {
    this.isTeacher = this.sakura.isTeacher();
    this.isAdmin = this.teacherService.IsAdmin();
    this.isUnitAdmin = this.teacherService.IsUnitAdmin();

    if (this.isTeacher) {
      this.contract = await this.gadget.getContract("ischool.equipment");
    }

    this.getData();
  }

  async getData() {
    try {

      this.loading = true;

    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  public reloadMyReservation() {
    this.myReservation.getData();
  }

}
