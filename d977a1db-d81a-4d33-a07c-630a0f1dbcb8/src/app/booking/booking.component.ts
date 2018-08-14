import { Component, OnInit, ViewChild, TemplateRef, Input, Optional } from "@angular/core";
import { MatDialog } from '@angular/material';
import { DxSchedulerComponent } from "devextreme-angular";
import { RRule } from 'rrule';
import * as moment from "moment";

import { SakuraService } from "../service/sakura.service";
import { TeacherService, Teacher } from "../service/teacher.service";
import { MeetingroomService, Detail } from "../service/meetingroom.service";

import { GadgetService, Contract } from "../gadget.service";
import { MainComponent } from "../main.component";
import scheduler from "devextreme/ui/scheduler";

// 重複型態，資料庫會寫入 text
const repeat_types = [
  { disp: '每日', text: 'daily', color: '#ff9747' },
  { disp: '每週', text: 'weekly', color: '#ff9747' },
  { disp: '每月', text: 'monthly', color: '#ff9747' }
];

interface MapAppointment {
  uid: string,
  teacher_id: string,
  teacher_name: string,
  start_date: Date,
  start_time: Date,
  end_time: Date,
  is_repeat: Boolean,
  repeat_type: string,
  end_date: Date,
  is_approved: Boolean,
  apply_by: string,
  apply_reason: string,
}

interface ReqAppointment {
  uid?: string;
  teacher_name: string;
  ref_teacher_id: string;
  ref_meetingroom_id: string;
  apply_reason: string;
  apply_start_date: string;
  repeat_type: string;
  repeat_end_date: string;
  is_repeat: boolean;
  detail: Detail[];
}

@Component({
  selector: "app-booking",
  templateUrl: "./booking.component.html",
  styleUrls: ["./booking.component.css"]
})
export class BookingComponent implements OnInit {

  loading: boolean = true;
  isSaving = false;
  isTeacher: boolean = false;
  currentMeetingRoomStatus: string = "關閉";
  currentMeetingroomID: string;

  @Input()
  set meetingRoomID(value: string) {
    this.loading = true;
    this.currentMeetingroomID = value;
    this.GetMeetingroomApplicationsByRoomID(this.currentMeetingroomID);
    this.loading = false;
  }
  @Input()
  set meetingRoomStatus(value: string) {
    this.currentMeetingRoomStatus = value;

    if (this.currentMeetingRoomStatus != "開放") {
      this.canAdd = false;
      this.canUpdate = false;
    } else {
      this.canAdd = true;
      this.canUpdate = true;
    }
  }


  @ViewChild(DxSchedulerComponent) scheduler: DxSchedulerComponent;
  @ViewChild("cancelTemp") cancelTemp: TemplateRef<any>;
  // @ViewChild("appointmentMenu") appointmentMenu: DxContextMenuComponent;
  // @ViewChild("cellMenu") cellMenu: DxContextMenuComponent;


  /** === Data Objects from DSA === */
  contract: Contract; // 取得 contract 連線。
  teachers: Teacher[];
  myTeacherID: string = '';
  myTeacherName: string = '';

  // === Data Object for UI ===
  current_date: Date = new Date();
  appointments: MapAppointment[] = [];  // 把此場地全部申請資料轉成這個集合，好套用到 UI
  // 設定可設定及顯示的時間範圍
  startDayHour = 7;
  endDayHour = 23;

  // TODO 右鍵功能先註解
  // contextMenuAppointmentData: any;
  // contextMenuTargetedAppointmentData: any;
  // contextMenuCellData: any; // 目前選到的時段
  // appointmentContextMenuItems: any;
  // cellContextMenuItems: any;

  canAdd = false;
  canUpdate = false;
  canDelete = false;

  jsonutil = JSON; // debug 用

  constructor(
    private gadget: GadgetService,
    private roomService: MeetingroomService,
    private teacherService: TeacherService,
    private matDialog: MatDialog,
    private sakura: SakuraService,
    @Optional() private rootMain: MainComponent
  ) {
    this.isTeacher = this.sakura.isTeacher();
    this.myTeacherID = this.sakura.getMyTeacherID();
    this.myTeacherName = this.sakura.getMyTeacherName();


    // TODO 右鍵功能先註解
    // 空白時段，按右鍵選單內容
    // this.cellContextMenuItems = [];

    // TODO 右鍵功能先註解
    // 已有預約，按右鍵選單內容
    // this.appointmentContextMenuItems = [];
  }

  /**Initialize */
  async ngOnInit() {

    if (this.isTeacher) this.contract = await this.gadget.getContract("ischool.booking");

    try {
      this.canAdd = this.isTeacher;

      if (this.currentMeetingRoomStatus != "開放") {
        this.canAdd = false;
      }
      // TODO 右鍵功能先註解
      // if (this.isTeacher) {
      //   this.cellContextMenuItems = [{ text: "預約這個時段", onItemClick: () => this.createAppointment() }];
      // }

      this.loading = true;
      this.teachers = await this.teacherService.getTeachers();
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  /**透過場地 ID 取得 相關預約申請單資料 */
  async GetMeetingroomApplicationsByRoomID(meetingroomId) {
    this.appointments = [];
    if (!meetingroomId) return;

    try {
      const meetingroomApplications = await this.roomService.getApplicationsByRoomID(meetingroomId);
      this.parseApplications(meetingroomApplications);
    } catch (err) {
      alert(`GetMeetingroomApplicationsByRoomID error:" ${JSON.stringify(err)}`);
    }
  }

  /**解析資料庫回傳的預約單，拆解結構整合展開的日期，寫入 appointments */
  parseApplications(meetingroomApplications) {
    const data: MapAppointment[] = [];

    for (const app of meetingroomApplications) {

      // 開始及結束日期儲存在申請單 meetingroom_application，時間皆為 00:00:00
      // 開始及結束時間儲存在展開表 meetingroom_application_detail，展開表記錄每個展開的起迄日期時間
      // 例：開始日期 apply_start_date --- "2018-06-28 00:00:00"
      // 例：結束日期 repeat_end_date --- "2018-06-28 00:00:00"
      // 例：開始時間 start_time --- "2018-06-28 12:00:00"
      // 例：結束時間 end_time --- "2018-06-28 13:00:00"

      // 開始日、結束日需由時間戳轉為 date
      const startDate = moment(parseInt(app.apply_start_date)).toDate();
      const endDate = moment(parseInt(app.repeat_end_date || app.apply_start_date)).toDate();
      const isRepeat = (app.is_repeat === 't');
      const isApproved = (app.is_approved === 't');

      const details = [].concat(app.detail || []);
      for (const detail of details) {
        const mb = moment(parseInt(detail.start_time)).toDate();
        const me = moment(parseInt(detail.end_time)).toDate();

        data.push({
          uid: app.uid,
          teacher_id: app.ref_teacher_id,
          teacher_name: app.teacher_name,
          start_date: startDate,
          start_time: mb,
          end_time: me,
          is_repeat: isRepeat,
          repeat_type: app.repeat_type,
          end_date: endDate,
          is_approved: isApproved,
          apply_by: app.apply_by,
          apply_reason: app.apply_reason,
        });
      }
    }
    // console.log("all details:", tmp);
    this.appointments = data;
  }

  /**打開日程，新增或編輯表單界面 */
  showAppointment(appointmentData, createNewAppointment) {
    this.scheduler.instance.hideAppointmentTooltip(); // 隱藏 tooltip

    // 設定是否可新增或變更(目前為編輯狀態，且是老師，且為申請人才可以變更)
    this.canAdd = this.isTeacher;
    if (appointmentData.apply_by) {
      this.canUpdate = (this.isTeacher && appointmentData.apply_by === this.myTeacherID);
    }

    if (this.currentMeetingRoomStatus != "開放") {
      this.canAdd = false;
      this.canUpdate = false;
    }

    if (this.currentMeetingroomID) {
      // 注意！！此時變更 canAdd, canUpdate 後需使用 setTimeout 否則編輯視窗出不來
      setTimeout(() => {
        this.scheduler.instance.showAppointmentPopup(
          appointmentData, createNewAppointment
        );
      });
    }
  }

  /**觸發取消預約 */
  deleteAppointment(e) {
    // 檢查是否可以刪除
    if (e.apply_by === this.myTeacherID) {

      this.scheduler.instance.hideAppointmentTooltip(); // 隱藏 tooltip

      // 詢問是否取消
      const dialogRef = this.matDialog.open(this.cancelTemp);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.scheduler.instance.deleteAppointment(e); // 會觸發 onAppointmentDeleting
        }
      });
    } else {
      alert('您不是申請人，無法取消。');
    }
  }

  /**進行取消預約 */
  async onAppointmentDeleting(e) {
    if (this.isSaving) return;

    this.isSaving = true;

    // 這裡有非同步的情況
    e.cancel = new Promise<Boolean>(async (r) => {
      try {
        // 呼叫 service。
        await this.contract.send('CancelMeetingroomApplication', {
          Request: { uid: e.appointmentData.uid }
        });
      } catch (err) {
        alert("CancelMeetingroomApplication error: \n" + JSON.stringify(err));
        this.isSaving = false;
        return r(true);
      } finally {
        this.isSaving = false;
        return r(false);
      }
    });
  }

  /**取消預約後，呼叫 service 重取資料 */
  onAppointmentDeleted(e) {
    // 更新我的預約
    if (this.rootMain) this.rootMain.reloadMyReservation();

    // 重新整理
    this.GetMeetingroomApplicationsByRoomID(this.currentMeetingroomID);
  }

  /**新增及修改的表單建立之後，處理自動化表單 */
  onAppointmentFormCreated = (data) => {

    // 注意！不要在這裡重設 data.appointmentData 的值，否則會失效

    const createrT = this.teachers.filter(x => x.id === data.appointmentData.apply_by);

    const creater = (createrT.length > 0) ? createrT[0].name || this.myTeacherName : this.myTeacherName;

    const form = data.form;

    form.option('items', [
      {
        label: { text: "會議主持人" },
        editorType: "dxSelectBox",
        dataField: "teacher_id", // 對應 appointments 的欄位
        isRequired: true,
        editorOptions: {
          items: this.teachers,
          displayExpr: "name",
          valueExpr: "id",
          searchEnabled: true,
          onValueChanged: function () { }.bind(this)
        }
      },
      {
        label: { text: "日期" },
        name: "startDate",
        dataField: "start_date",
        editorType: "dxDateBox",
        isRequired: true,
        editorOptions: {
          width: "100%",
          type: "date",
          showAnalogClock: false,
          // 此處設定 value 沒有用，只有表單中顯示
          // 且不會即時 binding 到 data.appointmentData，會用到上一次表單的值
        }
      },
      {
        label: { text: "開始時間" },
        name: "startTime",
        dataField: "start_time",
        editorType: "dxDateBox",
        isRequired: true,
        editorOptions: {
          width: "100%",
          type: "time",
          interval: 60,
          showAnalogClock: false,
          onValueChanged: function (args) {
          }
        },
      },
      {
        label: { text: "結束時間" },
        name: "endTime",
        dataField: "end_time",
        editorType: "dxDateBox",
        isRequired: true,
        editorOptions: {
          width: "100%",
          type: "time",
          interval: 60,
          showAnalogClock: false,
          onValueChanged: function (args) {
          }
        }
      },
      {
        label: { text: "申請事由" },
        editorType: "dxTextBox",
        dataField: "apply_reason",
        isRequired: false,
        editorOptions: {
          onValueChanged: function () { }.bind(this)
        }
      },
      {
        label: { text: "是否重複" },
        name: "repeat",
        dataField: "is_repeat",
        editorType: "dxSwitch",
        editorOptions: {
          onValueChanged: function (args) {
            form.itemOption("repeatEndDate", "visible", args.value);
            form.itemOption("repeatType", "visible", args.value);
          }
        }
      },
      {
        label: { text: "重複類型" },
        visible: data.appointmentData.is_repeat || false,
        name: "repeatType",
        dataField: "repeat_type",
        editorType: "dxRadioGroup",
        isRequired: true,
        editorOptions: {
          width: "100%",
          dataSource: repeat_types,
          displayExpr: "disp",
          valueExpr: "text",
          layout: "horizontal",
        }
      },
      {
        label: { text: "結束日期" },
        visible: data.appointmentData.is_repeat || false,
        name: "repeatEndDate",
        dataField: "end_date",
        editorType: "dxDateBox",
        isRequired: true,
        editorOptions: {
          width: "100%",
          type: "date",
          showAnalogClock: false,
        }
      },
      {
        label: { text: "申請人" },
        name: "creater",
        dataField: "creater",
        editorType: "dxTextBox",
        editorOptions: {
          value: creater,
          readOnly: true
        }
      }
    ]);
  };

  /**進行新增預約 */
  onAppointmentAdding(e) {
    this.setMeetingroomApplication(e); // 驗證並設定預約
  }

  /**當完成新增後，向 service 重取資料 */
  onAppointmentAdded(e) {
    if (this.rootMain) this.rootMain.reloadMyReservation(); // 更新我的預約
    this.GetMeetingroomApplicationsByRoomID(this.currentMeetingroomID); // 重新整理
  }

  /**進行編輯預約 */
  onAppointmentUpdating(e) {
    this.setMeetingroomApplication(e); // 驗證並設定預約
  }

  /**當完成編輯後，向 service 重取資料 */
  onAppointmentUpdated(e) {
    if (this.rootMain) this.rootMain.reloadMyReservation(); // 更新我的預約
    this.GetMeetingroomApplicationsByRoomID(this.currentMeetingroomID); // 重新整理
  }

  /**新增修改前驗證，並呼叫 service 設定資料至資料庫 */
  async setMeetingroomApplication(e) {
    if (this.isSaving) return;

    e.cancel = new Promise<Boolean>(async (r) => {
      const data = e.appointmentData || e.newData; // dx-scheduler 內建

      // 驗證場地編號
      if (!this.currentMeetingroomID) return r(true);

      // 檢查時間
      const iStartHour = moment(data.start_time).get('hour');
      const iEndHour = moment(data.end_time).get('hour');

      if (iStartHour >= iEndHour) {
        alert("結束時間必須大於開始時間"); return r(true);
      }

      if (iStartHour < this.startDayHour || iStartHour > this.endDayHour) {
        alert(`開始時間必須在 ${this.startDayHour}:00 ~ ${this.endDayHour}:00 之間`); return r(true);
      }
      if (iEndHour < this.startDayHour || iEndHour > this.endDayHour) {
        alert(`結束時間必須在 ${this.startDayHour}:00 ~ ${this.endDayHour}:00 之間`); return r(true);
      }

      // 當有重複時才判斷結束日期，結束日期必須大於開始日期
      if (data.is_repeat) {
        if (data.end_date) {
          if (data.start_date > data.end_date) {
            alert("結束日期必須大於開始日期"); return r(true);
          }
        } else {
          alert("必須要有結束日期"); return r(true);
        }
      }

      try {
        this.isSaving = true;

        const details = this.parseRRule2Date(data);

        const applyStartDate = moment(data.start_date).format("YYYY-MM-DD");
        const repeatEndDate = (data.is_repeat) ? moment(data.end_date).format("YYYY-MM-DD") : applyStartDate;

        const teacherT = this.teachers.filter(x => x.id === data.teacher_id);
        const teacherName = (teacherT.length) ? teacherT[0].name : '';

        let req: ReqAppointment = {
          teacher_name: teacherName,
          ref_teacher_id: data.teacher_id,
          ref_meetingroom_id: this.currentMeetingroomID,
          apply_reason: data.apply_reason,
          apply_start_date: applyStartDate,
          repeat_type: data.repeat_type,
          repeat_end_date: repeatEndDate,
          is_repeat: data.is_repeat || false,
          detail: details,
        };
        if (data.uid) req.uid = data.uid;
        // console.log(req);

        const rooms = await this.contract.send('SetMeetingroomApplication', { Request: req });
        // console.log(rooms);

        // 檢查是否重複
        if (rooms.Response.is_conflict) {
          let conflict_msg = "與下列時段有衝突無法新增：\n";
          const conflict_detail = [].concat(rooms.Response.detail || []);
          for (const detail of conflict_detail) {
            conflict_msg += `時間：${moment(detail.start_time).format("YYYY-MM-DD HH:mm")} - ${moment(detail.end_time).format("HH:mm")} \n`;
          }

          alert(conflict_msg);
          this.isSaving = false;
          return r(true);
        } else {
          this.isSaving = false;
          return r(false);
        }

      } catch (err) {
        // console.log("AddMeetingroomApplication error: \n" + JSON.stringify(err));
        alert("SetMeetingroomApplication error: \n" + JSON.stringify(err));
        this.isSaving = false;
        return r(true);
      }
    });

  }

  /**展開重複規則 RRULE 的每一天 */
  parseRRule2Date(data) {
    const detail: Detail[] = [];

    // 開始、結束時間(時、分)
    const startTimeHour = moment(data.start_time).get('hour');
    const startTimeMinute = moment(data.start_time).get('minute');
    const endTimeHour = moment(data.end_time).get('hour');
    const endTimeMinute = moment(data.end_time).get('minute');

    if (data.is_repeat && data.repeat_type) {
      // 設定的開始、結束日，時間都是00:00:00，單純時間的計算
      const options: RRule.Options = {
        freq: RRule.YEARLY,
        dtstart: data.start_date,
        until: data.end_date,
      };

      if (data.repeat_type === 'daily') {
        options.freq = RRule.DAILY; // 重複單位（日)
      } else if (data.repeat_type === 'weekly') {
        options.freq = RRule.WEEKLY; // 重複單位（週)

        // 注意： 0 == RRule.MO, 0 == moment.SU
        let weekDay = moment(data.start_date).weekday() - 1;
        if (weekDay < 0) weekDay = 7;
        options.byweekday = weekDay;
      } else if (data.repeat_type === 'monthly') {
        options.freq = RRule.MONTHLY; // 重複單位（月)
        options.bymonthday = moment(data.start_date).get('date');
      }

      const rules = new RRule(options);

      // console.log('rules', options, rules.all());

      for (let item of rules.all()) {
        const itemDate = moment(item);
        const sDate = moment(new Date(itemDate.get('year'), itemDate.get('month'), itemDate.get('date'), startTimeHour, startTimeMinute));
        const eDate = moment(new Date(itemDate.get('year'), itemDate.get('month'), itemDate.get('date'), endTimeHour, endTimeMinute));

        detail.push({
          start_time: sDate.format("YYYY-MM-DD HH:mm:ss"),
          end_time: eDate.format("YYYY-MM-DD HH:mm:ss"),
        });
      }

      // console.log(detail);
    } else {
      const oneDate = moment(data.start_date);
      const sDate = moment(new Date(oneDate.get('year'), oneDate.get('month'), oneDate.get('date'), startTimeHour, startTimeMinute));
      const eDate = moment(new Date(oneDate.get('year'), oneDate.get('month'), oneDate.get('date'), endTimeHour, endTimeMinute));

      detail.push({
        start_time: sDate.format("YYYY-MM-DD HH:mm:ss"),
        end_time: eDate.format("YYYY-MM-DD HH:mm:ss"),
      });
    }

    return detail;
  }

  /**提供外部呼叫開啟預約場地 */
  public showCreateAppointment() {

    const d = moment(); // 現在日期時間
    const sHour = Math.max(d.get('hour'), 7); // 取得現在時間的小時，但不可以小於7點
    const eHour = Math.min((d.get('hour') + 1), 23); // 取得現在時間再加1小時，但不可以大於23點
    // 預設開始時間為現在，結束時間為1小時後
    const defaultSDate = moment(new Date(d.get('year'), d.get('month'), d.get('date'))).toDate();
    const defaultSTime = moment(new Date(d.get('year'), d.get('month'), d.get('date'), sHour));
    const defaultETime = moment(new Date(d.get('year'), d.get('month'), d.get('date'), eHour));

    this.showAppointment({
      start_date: defaultSDate,
      start_time: defaultSTime,
      end_time: defaultETime,
    }, true);
  }

  // 切換週曆、月曆時，動態改變高度
  onOptionChanged(e) {
    if (e.name === 'currentView') {
      this.scheduler.height = (e.value === 'month') ? '80vh' : '100%';
      this.scheduler.appointmentTemplate = (e.value === 'month') ? 'month-appointment-template' : 'week-appointment-template';
    }
  }

  // 對已存在的預約cell進行編輯
  onAppointmentDblClick(e) {
    this.showAppointment(e.appointmentData, false);
  }

  // 對空白的 cell 進行新增
  onCellClick(e) {
    // 處理開始日期預設值
    // 注意！CellClick 新增時，傳入的值只有 startDate、endDate
    // 所以將 startDate 取出年月日，變成 start_date 預設值
    const d = moment(e.cellData.startDate);
    const defaultSDate = moment(new Date(d.get('year'), d.get('month'), d.get('date'))).toDate();
    this.showAppointment({
      start_date: defaultSDate,
      start_time: e.cellData.startDate,
      end_time: e.cellData.endDate,
    }, true);
  }


  // TODO 右鍵功能先註解
  /** 當某個事件按右鍵出現 context menu 時 */
  // onAppointmentContextMenu(e) {

  //   this.contextMenuAppointmentData = e.appointmentData;
  //   console.log(this.contextMenuAppointmentData);

  //   // 判斷是否有刪除功能
  //   if (this.isTeacher && this.contextMenuAppointmentData.apply_by === this.myTeacherID) {
  //     this.appointmentContextMenuItems = [{ text: "開啟", onItemClick: () => this.showAppointment(e.appointmentData, false) },
  //     { text: "刪除", onItemClick: () => this.deleteAppointment(e.appointmentData) }];
  //     this.canDelete = true;
  //   } else {
  //     this.appointmentContextMenuItems = [{ text: "開啟", onItemClick: () => this.showAppointment(e.appointmentData, false) }];
  //     this.canDelete = false;
  //   }

  //   this.contextMenuTargetedAppointmentData = e.targetedAppointmentData;
  // }

  // TODO 右鍵功能先註解
  /** Cell Context menu 上的 '預約這個時段' 被按下時 */
  // createAppointment() {
  //   // console.log("createAppointment");

  //   if (this.currentMeetingroomID) {
  //     this.scheduler.instance.showAppointmentPopup(
  //       {
  //         teacher_id: "",
  //         start_time: this.contextMenuCellData.startDate,
  //         is_repeat: false,
  //         repeat_type: null,
  //         end_date: this.contextMenuCellData.endDate,
  //         end_time: this.contextMenuCellData.endDate,
  //         apply_start_date: this.contextMenuCellData.startDate,
  //         apply_by: this.myTeacherID,
  //         apply_reason: ''
  //       },
  //       true
  //     );
  //   } else {
  //     alert("請先選擇場地。");
  //   }
  // }

  // TODO 右鍵功能先註解
  /** 當某個時段按右鍵出現 context menu 時 */
  // onCellContextMenu(e) {
  //   console.log(e.cellData.startDate);
  //   console.log("onCellContextMenu:" + e.cellData);
  //   this.contextMenuCellData = e.cellData;
  // }

  // TODO 右鍵功能先註解
  // 已有預約，按右鍵的選單任一項目觸發事件
  // onContextMenuItemClick(e) {
  //   console.log("onContextMenuItemClick");
  //   e.itemData.onItemClick(e.itemData);
  // }

}
