import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
// import { MeetingroomApplicationService, MeetingroomApplication } from "../service/meetingroom-application.service";
import { GadgetService, Contract } from "../gadget.service";
import * as moment from "moment";
import { MatDialog, MatDialogRef } from '@angular/material';
import { EquipApplicationService, ExtEquipApplication } from '../service/equip-application.service';
import { DialogService } from '../service/dialog.service';
import {MatChipInputEvent} from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

@Component({
  selector: 'app-my-reservation',
  templateUrl: './my-reservation.component.html',
  styles: []
})
export class MyReservationComponent implements OnInit {

  visible = true;
  selectable = false;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  remove(detail): void {
    console.log(detail);
    // const index = this.fruits.indexOf(fruit);

    // if (index >= 0) {
    //   this.fruits.splice(index, 1);
    // }
  }

  @ViewChild("currInfo") currInfo: TemplateRef<any>;
  contract: any;
  myEquipApplications: any;
  isLoading =true;
  isSaving = true;
  dialogRef: MatDialogRef<any>;
  // meetingroomApplications: MeetingroomApplication[];
  @ViewChild("cancelTemp") cancelTemp: TemplateRef<any>;
  constructor(
    private gadget: GadgetService,
    public dialog: MatDialog,
    private equipApplicationService: EquipApplicationService,
    private dialogService: DialogService,
  ) { }

  async ngOnInit() {
    this.contract = await this.gadget.getContract("ischool.equipment");
    this.getData();
  }

  public async getData() {
    this.isLoading = true;
    const data:ExtEquipApplication[] = await this.equipApplicationService.getMyEquipApplications();

    for (const da of data) {

      da.apply_date_desc = moment(parseInt(da.apply_date)).format("YYYY-MM-DD");
      da.apply_start_date_desc = moment(parseInt(da.apply_start_date)).format("YYYY-MM-DD");
      da.repeat_end_date_desc = moment(parseInt(da.repeat_end_date)).format("YYYY-MM-DD");
      da.canceled_time_desc = da.canceled_time ? moment(parseInt(da.canceled_time)).format("YYYY-MM-DD") : '';

      da.detail = [].concat(da.detail || []);

      if (da.repeat_type) {
        if (da.repeat_type === 'daily')
          da.repeat_type_desc = '每日';
        else if (da.repeat_type === 'weekly')
          da.repeat_type_desc = `每週${['日', '一', '二', '三', '四', '五', '六'][moment(da.apply_start_date_desc).weekday()]}`;
        else if (da.repeat_type === 'monthly')
          da.repeat_type_desc = `每月${moment(da.apply_start_date_desc).get('date')}日`;
        else
          da.repeat_type_desc = '';
      }

      for (const item of da.detail) {
        da.start_hour_desc = moment(parseInt(item.start_time)).format("HH:mm");
        da.end_hour_desc = moment(parseInt(item.end_time)).format("HH:mm");
        item.date_desc = moment(parseInt(item.start_time)).format("YYYY-MM-DD");
      }
    }

    this.myEquipApplications = data;
    this.isLoading = false;
  }

  async confirmCancel(item) {
    // let dialogRef = this.dialog.open(this.cancelTemp);
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     console.log(item);
    //     // this.CancelEquipApplication(item);
    //   }
    // });

    const result = await this.dialogService.confirmCancel('取消預約', '請輸入取消原因？');
    if (result.confirm) {
      try {
        this.isSaving = true;
        await this.equipApplicationService.cancelEquipApplication(item.uid, result.reason);
        this.getData();
      } catch (error) {
        alert(error);
      } finally {
        this.isSaving = false;
      }
    }
  }

  async detailCancel(item) {

    const result = await this.dialogService.confirmCancel('取消預約', '請輸入取消原因？');
    if (result.confirm) {
      try {
        this.isSaving = true;
        await this.equipApplicationService.cancelDetail(item.detail_uid, result.reason);
        this.getData();
      } catch (error) {
        alert(error);
      } finally {
        this.isSaving = false;
      }
    }
  }
}

