import { Component, OnInit,ViewChild } from '@angular/core';
import { SakuraService } from '../service/sakura.service';
import { MeetingroomService, Meetingroom } from '../service/meetingroom.service';
import { BookingComponent } from './booking.component';

@Component({
  selector: 'app-booking-main',
  templateUrl: './booking-main.component.html',
  styles: []
})
export class BookingMainComponent implements OnInit {

  // 呼叫子層 BookingComponent 的新增預約
  @ViewChild("appBooking") appBooking: BookingComponent;

  /** === Data Objects from DSA === */
  meetingRooms: Meetingroom[] = [];
  buildings: string[];
  dicRoomsByBuilding: any;
  currentMeetingroom: Meetingroom = new Meetingroom();
  showEquipment: boolean = false; // 展開縮合設備狀況
  isTeacher: boolean = false;

  constructor(
    private roomService: MeetingroomService,
    private sakura: SakuraService
  ) {
    this.isTeacher = this.sakura.isTeacher();
  }

  /** Initialize  */
  async ngOnInit() {

    try {
      this.buildings = [];
      this.dicRoomsByBuilding = {};

      // 呼叫 service。取得全部的場地
      this.meetingRooms = await this.roomService.getMeetingrooms();

      let idx = 0;

      for (const room of this.meetingRooms) {

        // 預設為第一個場地
        if (idx === 0) this.currentMeetingroom = room;

        idx+=1;

        //dispatch into groups
        const building = (room.building ? room.building : '未指定');

        // 如果某大樓尚未加入陣列與 dictionary 中，則：
        if (!this.dicRoomsByBuilding[building]) {
          this.dicRoomsByBuilding[building] = [];
          this.buildings.push(building);
          // console.log("add building:", building);
        }

        this.dicRoomsByBuilding[building].push(room);
      }

    } catch (err) {
      console.log(err);
    }
  }

}
