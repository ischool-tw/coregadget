import { Injectable } from '@angular/core';
import { GadgetService, Contract } from "../gadget.service";

@Injectable({
  providedIn: 'root'
})
export class MeetingroomService {

  contract: any;

  constructor(private gadget: GadgetService) {
  }

  async getContract() {
    if (!this.contract) this.contract = await this.gadget.getContract("ischool.public.booking");
  }

  async getMeetingrooms() {
    await this.getContract();

    try {
      // 呼叫 service。
      const rsp = await this.contract.send("GetMeetingrooms");
      const rooms:Meetingroom[] = [].concat(rsp.meetingroom || []);

      rooms.map(v => v.MeetingroomEquipment = [].concat(v.MeetingroomEquipment || []));

      // console.log(rooms);
      return rooms;

    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async getApplicationsByRoomID(roomID) {
    await this.getContract();
    try {
      // 呼叫 service。
      const applications = await this.contract.send(
        "GetMeetingroomApplicationsByRoomID",
        {
          Request: {
            MeetingroomID: roomID
          }
        }
      );
      return [].concat(applications.meetingroomApplication || []) as Appointment[];
    } catch (err) {
      console.log(err);
      return [];
    } finally {
    }

  }
}

export class Meetingroom {
  uid: string;
  name: string;
  building: string;
  capacity: string;
  status: string;
  ref_unit_id: string;
  is_special: string;
  create_time: string;
  created_by: string;
  MeetingroomEquipment:any;
  picture:string;
}

export interface Appointment {
  uid: string;
  teacher_name: string;
  ref_teacher_id: string;
  applicant_name: string;
  apply_by: string;
  ref_meetingroom_id: string;
  apply_date: string;
  repeat_type: string;
  apply_start_date: string;
  repeat_end_date: string;
  is_canceled: string;
  canceled_time: string;
  canceled_by: string;
  cancel_reason: string;
  is_approved: string;
  reject_reason: string;
  ref_admin_id: string;
  reviewed_date: string;
  is_repeat: string;
  apply_reason: string;
  detail: Detail[];
}

export interface Detail {
  start_time: string;
  end_time: string;
}