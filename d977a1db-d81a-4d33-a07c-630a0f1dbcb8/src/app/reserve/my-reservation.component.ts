import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MeetingroomApplicationService, MeetingroomApplication } from "../service/meetingroom-application.service";
import { GadgetService, Contract } from "../gadget.service";
import * as moment from "moment";
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-my-reservation',
  templateUrl: './my-reservation.component.html',
  styles: []
})
export class MyReservationComponent implements OnInit {
  contract: any;
  meetingroomApplications: MeetingroomApplication[] = [];
  @ViewChild("cancelTemp") cancelTemp: TemplateRef<any>;
  constructor(private gadget: GadgetService, private applicationService: MeetingroomApplicationService, private matDialog: MatDialog) { }

  async ngOnInit() {
    this.getData();
  }

  public async getData() {
    if (!this.contract) this.contract = await this.gadget.getContract("ischool.booking");
    let data: MeetingroomApplication[] = await this.applicationService.getMyMeetingroomApplications();
    for (const da of data) {

      da.apply_date_desc = moment(parseInt(da.apply_date)).format("YYYY-MM-DD");
      da.apply_start_date_desc = moment(parseInt(da.apply_start_date)).format("YYYY-MM-DD");
      da.repeat_end_date_desc = moment(parseInt(da.repeat_end_date)).format("YYYY-MM-DD");
      da.canceled_time_desc = da.canceled_time ? moment(da.canceled_time).format("YYYY-MM-DD") : '';

      da.detail = [].concat(da.detail || []);
      let repeat_type = "";
      if (da.repeat_type) {
        if (da.repeat_type === 'daily')
          repeat_type = '每日';
        else if (da.repeat_type === 'weekly')
          repeat_type = `每週${['日', '一', '二', '三', '四', '五', '六'][moment(da.apply_start_date_desc).weekday()]}`;
        else if (da.repeat_type === 'monthly')
          repeat_type = `每月${moment(da.apply_start_date_desc).get('date')}日`;
        else
          repeat_type = '';
      }

      da.repeat_type = repeat_type;

      for (const item of da.detail) {
        // item.start_time_desc = moment(parseInt(item.start_time)).format("YYYY-MM-DD HH:mm");
        // item.end_time_desc = moment(parseInt(item.end_time)).format(" HH:mm");

        da.start_time_desc = moment(parseInt(item.start_time)).format("HH:mm");
        da.end_time_desc = moment(parseInt(item.end_time)).format("HH:mm");
        item.date_desc = moment(parseInt(item.start_time)).format("YYYY-MM-DD");
      }
    }
    this.meetingroomApplications = data;
    // console.log(this.meetingroomApplications);

  }

  confirmCancel(item) {

    let dialogRef = this.matDialog.open(this.cancelTemp);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(item);
        this.CancelMeetingroomApplication(item);
      }
    });
  }

  // 取消會議室預約
  async CancelMeetingroomApplication(item) {
    try {
      let req = {
        uid: item.uid
      };
      //呼叫 service。
      const rooms = await this.contract.send('CancelMeetingroomApplication', {
        Request: req
      });
      this.getData();

    } catch (err) {
      alert("CancelMeetingroomApplication error: \n" + JSON.stringify(err));
      // e.cancel = true;
    } finally {
      // this.loading = false;
    }
  }
}
