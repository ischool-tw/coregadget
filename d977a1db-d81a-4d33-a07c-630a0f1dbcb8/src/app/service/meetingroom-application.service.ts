import { Injectable } from '@angular/core';
import { GadgetService, Contract } from "../gadget.service";

@Injectable({
  providedIn: 'root'
})
export class MeetingroomApplicationService {

  contract: any;

  constructor(private gadget: GadgetService) {
  }

  async getContract() {
    if (!this.contract) {
      this.contract = await this.gadget.getContract("ischool.booking");
    }
  }

  async getMyMeetingroomApplications() {
    await this.getContract();

    try {
      // 呼叫 service。
      const _meetingroomApplication = await this.contract.send("GetMyMeetingroomApplications");
      const meetingroomApplications:MeetingroomApplication[] = [].concat(_meetingroomApplication.MeetingroomApplication || []);

      return meetingroomApplications;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

export class MeetingroomApplication {
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
  detail: any;
  meetingroom_name:string;
  meetingroom_building:string;
  meetingroom_is_special: string;
  apply_reason: string;

  apply_date_desc?: string;
  apply_start_date_desc?: string;
  repeat_end_date_desc?: string;
  start_time_desc?: string;
  end_time_desc?: string;
  canceled_time_desc?: string;
}