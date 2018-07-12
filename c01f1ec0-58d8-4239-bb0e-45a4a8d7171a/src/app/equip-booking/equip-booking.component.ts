import { Component, OnInit, Optional } from '@angular/core';
import { EquipmentService, Equipment } from '../service/equipment.service';
import { EquipApplicationService, Detail, ExtEquipApplication } from '../service/equip-application.service';
import { RRule } from 'rrule';
import { MainComponent } from "../main.component";
import * as moment from "moment";
import { DialogService } from '../service/dialog.service';
@Component({
  selector: 'app-equip-booking',
  templateUrl: './equip-booking.component.html',
  styleUrls: ['./equip-booking.component.css']
})
export class EquipBookingComponent implements OnInit {

  isLoading =true;
  isSaving = false;
  // 使用者選的單位
  selectedUnitName: string = "";
  // 使用者選的類別
  selectedCategory: string = "";
  // 可選單位
  unitNameList: any = [];

  // 使用者選的設備
  selectedEquipment: Equipment = new Equipment();

  // 搜尋關鍵字
  searchKeyWord: string = "";

  // 可選類別
  categoryList: any = [];

  // 呈現設備
  displayEquipments: any = [];

  displayEquipmentsDays: any = [];
  displayEquipmentsDetail: any = [];

  currentEquipApplications: ExtEquipApplication[] = [];

  addStartDate: string = "";
  addEndDate: string = "";
  addStartTimeH: string = "";
  addStartTimeM: string = "";
  addEndTimeH: string = "";
  addEndTimeM: string = "";
  addRepeatType: string = "";
  addIsRepeat: boolean = false;
  addApplyReason: string = "";
  displayYear: number = 0;
  displayMonth: number = 0;
  detailLoading: boolean = true;
  applyStartDate: any;
  repeatEndDate: any;
  okButtonDisable: boolean = false;
  selYearMonth:any;

  hours = [];
  minutes = [];
  addRepeartTypeArray = [
    { value: 'daily', viewValue: '每日' },
    { value: 'weekly', viewValue: '每週' },
    { value: 'monthly', viewValue: '每月' }
  ]
  constructor(
    private equipmentService: EquipmentService,
    private equipApplicationService: EquipApplicationService,
    private dialogService: DialogService,
    @Optional() private rootMain: MainComponent
  ) {

  }

  // 是否重複選項切換
  addIsRepeatChange() {
    this.addIsRepeat = !this.addIsRepeat;
  }

  ngOnInit() {
    this.hours = [];
    this.minutes = [];
    for (let idx = 0; idx <= 23; idx++) {
      let val = idx.toString();
      this.hours.push({ value: val, viewValue: val });
    }
    for (let idx = 0; idx <= 59; idx++) {
      let val = idx.toString();
      this.minutes.push({ value: val, viewValue: val });
    }

    this.getData();

  }

  bookingClick(value) {
    this.selectedEquipment = value;
    this.addApplyReason = "";
    this.addStartDate = "";
    this.addEndDate = "";
    this.addStartTimeM = this.addStartTimeH = "";
    this.addEndTimeM = this.addEndTimeH = "";
    this.addIsRepeat = false;
    this.addRepeatType = "";
  }


  async loadDetail() {
    this.detailLoading = true;
    this.currentEquipApplications = await this.equipApplicationService.getEquipApplicationsByUID(this.selectedEquipment.uid);
    const temp: any = [];

    const bindDataDict: any = [];
    for (const data of this.currentEquipApplications) {
      for (const det of data.detail) {
        const start_time = moment(parseInt(det.start_time));
        if (start_time.year() === this.displayYear && (start_time.month() + 1) === this.displayMonth) {
          const end_time = moment(parseInt(det.end_time));
          const dayKey = start_time.date();
          const week = start_time.weekday();
          let week_name = '';
          if (week === 1) {
            week_name = '星期一';
          } else if (week === 2) {
            week_name = '星期二'
          } else if (week === 3) {
            week_name = '星期三'
          } else if (week === 4) {
            week_name = '星期四'
          } else if (week === 5) {
            week_name = '星期五'
          } else if (week === 6) {
            week_name = '星期六'
          } else {
            week_name = '星期日';
          }
          const item = {
            applicant_name: data.applicant_name,
            start_time_h: start_time.format("HH:mm"),
            end_time_h: end_time.format("HH:mm"),
            start_time: start_time,
            end_time: end_time,
            day_key: dayKey,
            week_name: week_name
          }
          temp.push(item);
        }
      }
    }
    // 依開始時間排序(轉回時間戳)
    temp.sort((a, b) => a.start_time.valueOf() - b.start_time.valueOf());

    let dayList: any = [];
    // 整理資料
    for (const dd of temp) {
      if (dd.day_key) {
        if (!bindDataDict[dd.day_key]) {
          bindDataDict[dd.day_key] = [];
          dayList.push({ day: dd.day_key, weekday: dd.week_name });
        }
        bindDataDict[dd.day_key].push(dd);
      }
    }


    this.detailLoading = false;
    this.displayEquipmentsDays = dayList;
    this.displayEquipmentsDetail = bindDataDict;

  }

  detailClick(value) {

    this.selectedEquipment = value;
    this.loadDetail();
  }

  // 確認
  async ok() {
    this.okButtonDisable = true;
    let errMsg = await this.checkRequiedData();
    if (errMsg.length) {
      alert(errMsg.join('\n'));
      this.okButtonDisable = false;

    }else{
      await this.setEquipApplication();

      // 更新我的預約
      if (this.rootMain)
      {
        await this.rootMain.reloadMyReservation();
        $('#reserveEquipment').modal('hide');
      }
    }
  }

  async checkRequiedData() {
    let errMsg: any = [];
    if (!this.addStartDate) {
      errMsg.push("開始日期必填");
    }
    if (!this.addStartTimeH) {
      errMsg.push("開始時間(時)必填");
    }
    if (!this.addStartTimeM) {
      errMsg.push("開始時間(分)必填");
    }

    if (!this.addEndTimeH) {
      errMsg.push("結束時間(時)必填");
    }

    if (!this.addEndTimeM) {
      errMsg.push("結束時間(分)必填");
    }

    // TODO: 當開始日期小於今天，提示是否要繼續？
    let nowDate = moment();
    if(moment(this.addStartDate) < nowDate)
    {
      const result = await this.dialogService.confirm('當開始日期小於今天', '您確定要繼續嗎？');
      if (result) { 
        try {
        } catch (error) {
          alert(error);
        } finally {
          this.isSaving = false;
        }
      }else
      {
        this.okButtonDisable = false;
        return;
      }
    }

    // 當不需要重複，重複類型空白
    if (!this.addIsRepeat) {
      this.addRepeatType = "";
    }

    return errMsg;
  }

  async getData() {
    this.isLoading = true;
    await this.equipmentService.getData();
    this.selectedUnitName = "全部";
    this.selectedCategory = "全部";
    this.selYearMonth = moment();
    this.displayYear = this.selYearMonth.get('year');
    this.displayMonth = this.selYearMonth.get('month') + 1;

    this.unitNameList = this.equipmentService.getEquipUnits();
    this.categoryList = this.equipmentService.getEquipmentsCategory();
    this.displayEquipments = this.equipmentService.getEquipments();
    this.isLoading = false;
  }


  async setEquipApplication() {
    if (this.isSaving) return;
    if (!this.selectedEquipment) return;

    // 處理畫面上開始日期、開始時間、結束時間、結束日期
    let startDate = moment(this.addStartDate);
    let startTime = moment(startDate).set({ hours: parseInt(this.addStartTimeH), minutes: parseInt(this.addStartTimeM), seconds: 0 });
    let endTime = moment(startDate).set({ hours: parseInt(this.addEndTimeH), minutes: parseInt(this.addEndTimeM), seconds: 0 });
    let endDate = moment(this.addEndDate);

    // 檢查時間
    if (startTime >= endTime) {
      alert("結束時間必須大於開始時間"); return;
    }

    // 當有重複時才判斷結束日期，結束日期必須大於開始日期
    if (this.addIsRepeat) {
      if (endDate) {
        if (startDate > endDate) {
          alert("結束日期必須大於開始日期"); return;
        }
      } else {
        alert("必須要有結束日期"); return;
      }
    }

    try {
      this.isSaving = true;
      let applyStartDateM = moment(startDate);
      let repeatEndDateM = (this.addIsRepeat) ? moment(endDate) : applyStartDateM;
      this.applyStartDate = moment(startDate).toDate();
      this.repeatEndDate = (this.addIsRepeat) ? moment(endDate).toDate() : this.applyStartDate;

      let applyStartDateStr = applyStartDateM.format("YYYY-MM-DD");
      let repeatEndDateStr = repeatEndDateM.format("YYYY-MM-DD");
      const details = this.parseRRule2Date();
      let req = {
        ref_equip_id: this.selectedEquipment.uid,
        apply_reason: this.addApplyReason,
        is_repeat: this.addIsRepeat || false,
        repeat_type: this.addRepeatType || '',
        apply_start_date: applyStartDateStr,
        repeat_end_date: repeatEndDateStr,
        detail: details
      };
      // console.log(req);
      await this.equipApplicationService.setEquipApplication(req);
      this.isSaving = false;
      this.okButtonDisable = false;


    } catch (err) {
      console.log(err);
      this.isSaving = false;
    }
  }


  /**展開重複規則 RRULE 的每一天 */
  parseRRule2Date() {
    const detail: Detail[] = [];

    // 開始、結束時間(時、分)
    const startTimeHour = parseInt(this.addStartTimeH);
    const startTimeMinute = parseInt(this.addStartTimeM);
    const endTimeHour = parseInt(this.addEndTimeH);
    const endTimeMinute = parseInt(this.addEndTimeM);

    if (this.addIsRepeat && this.addRepeatType) {
      // 設定的開始、結束日，時間都是00:00:00，單純時間的計算

      const options: RRule.Options = {
        freq: RRule.YEARLY,
        dtstart: this.applyStartDate,
        until: this.repeatEndDate,
      };

      if (this.addRepeatType === 'daily') {
        options.freq = RRule.DAILY; // 重複單位（日)
      } else if (this.addRepeatType === 'weekly') {
        options.freq = RRule.WEEKLY; // 重複單位（週)

        // 注意： 0 == RRule.MO, 0 == moment.SU
        let weekDay = moment(this.addStartDate).weekday() - 1;
        if (weekDay < 0) weekDay = 7;
        options.byweekday = weekDay;
      } else if (this.addRepeatType === 'monthly') {
        options.freq = RRule.MONTHLY; // 重複單位（月)
        options.bymonthday = moment(this.addStartDate).get('date');
      }

      const rules = new RRule(options);
      console.log(rules);
      // console.log('rules', options, rules.all());

      for (let item of rules.all()) {
        const itemDate = moment(item);
        const sDate = moment(new Date(itemDate.get('year'), itemDate.get('month'), itemDate.get('date'), startTimeHour, startTimeMinute));
        const eDate = moment(new Date(itemDate.get('year'), itemDate.get('month'), itemDate.get('date'), endTimeHour, endTimeMinute));

        detail.push({
          start_time: sDate.format("YYYY-MM-DD HH:mm:ss"),
          end_time: eDate.format("YYYY-MM-DD HH:mm:ss"),
          deadline: this.selectedEquipment.deadline
        });
      }

      // console.log(detail);
    } else {
      const oneDate = moment(this.addStartDate);
      const sDate = moment(new Date(oneDate.get('year'), oneDate.get('month'), oneDate.get('date'), startTimeHour, startTimeMinute));
      const eDate = moment(new Date(oneDate.get('year'), oneDate.get('month'), oneDate.get('date'), endTimeHour, endTimeMinute));

      detail.push({
        start_time: sDate.format("YYYY-MM-DD HH:mm:ss"),
        end_time: eDate.format("YYYY-MM-DD HH:mm:ss"),
        deadline: this.selectedEquipment.deadline
      });
    }

    return detail;
  }



  // 單位名稱修改
  unitNameValueChange(name) {
    this.displayEquipments = this.equipmentService.getEquipmentsByUnitName(name);
  }

  categoryValueChange(name) {
    this.displayEquipments = this.equipmentService.getEquipmentsByCategory(this.selectedUnitName, name);
  }

  lastMonthClick() {
    // 已調TODO: 統一改用 moment().subtract(1, 'month')，注意：get('month') 要加1
    this.selYearMonth = this.selYearMonth.subtract(1,'month');
    this.displayMonth = this.selYearMonth.get('month')+1;
    this.displayYear = this.selYearMonth.get('year');
    this.loadDetail();
  }

  nextMonthClick() {
    // 已調TODO: 統一改用 moment().add(1, 'month')，注意：get('month') 要加1
    this.selYearMonth = this.selYearMonth.add(1,'month');
    this.displayMonth = this.selYearMonth.get('month')+1;
    this.displayYear = this.selYearMonth.get('year');
    this.loadDetail();
  }

  searchButtonClick() {
    // 檢查是否有輸入關鍵字，如果沒有提示
    if (this.searchKeyWord.length > 0) {
      this.displayEquipments = this.equipmentService.findEquipmentsByKeywork(this.searchKeyWord);
    } else {
      alert("請輸入關鍵字後搜尋");
    }
  }


}
