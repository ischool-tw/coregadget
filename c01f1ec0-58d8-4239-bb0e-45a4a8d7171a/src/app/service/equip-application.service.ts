import { Injectable } from '@angular/core';
import { GadgetService, Contract } from "../gadget.service";
import * as moment from "moment";
@Injectable({
  providedIn: 'root'
})
export class EquipApplicationService {
  contract: any;
  constructor(private gadget: GadgetService) { }

  async getContract() {
    if (!this.contract) this.contract = await this.gadget.getContract("ischool.equipment");
  }

  // 從 DSA 取得資料
  async getData() {

  }

  // 新增或更新預約申請單
  async setEquipApplication(request){
    console.log(request);
    try {
      const rooms = await this.contract.send('SetEquipApplication', { Request: request });

      // 檢查是否重複
      if (rooms.is_conflict) {
        let conflict_msg = "與下列時段有衝突無法新增：\n";
        const conflict_detail = [].concat(rooms.detail || []);
        for (const detail of conflict_detail) {
          conflict_msg += `時間：${moment(detail.start_time).format("YYYY-MM-DD HH:mm")} - ${moment(detail.end_time).format("HH:mm")} \n`;
        }

        alert(conflict_msg);
      } else {
      }

    } catch (err) {
      // console.log("AddMeetingroomApplication error: \n" + JSON.stringify(err));
      alert("SetMeetingroomApplication error: \n" + JSON.stringify(err));

    }
  }


  // 透過 uid 取得預約申請
  async getEquipApplicationsByUID(uid) {
    await this.getContract();

    if (uid) {
      try {
        // 呼叫 service。
        const _temp = await this.contract.send("GetEquipApplicationsByEquipmentUID", {
          Request: { uid: uid }
        });
        const data:EquipApplication[] = [].concat(_temp.EquipApplication || []);

        for (const da of data) {

          da.detail = [].concat(da.detail || []);

          // 轉換日期格式。注意！moment(空值)會等於現在，所以需先驗証是否有值
          for (const det of da.detail) {
            if (det.start_time) det.start_time_desc = moment(parseInt(det.start_time)).format("YYYY-MM-DD");
            if (det.return_time) det.return_time_desc = moment(parseInt(det.return_time)).format("YYYY-MM-DD");
          }

        }
        return data;
      } catch (err) {
        console.log(err);
        return [];
      } finally {

      }
    } else {
      return [];
    }
  }

  // 取得我的預約申請
  async getMyEquipApplications() {
    await this.getContract();
    try {
      // 呼叫 service。
      const _temp = await this.contract.send("GetMyEquipApplications");
      const data:EquipApplication[] = [].concat(_temp.EquipApplication || []);

      for (const da of data) {
        da.detail = [].concat(da.detail || []);
        da.detail.sort((a, b) => parseInt(a.start_time) - parseInt(b.start_time));
      }
      return data;
      // console.log(data);

    } catch (err) {
      console.log(err);
      return [];
    } finally {

    }
  }

  // 取消某個預約細項
  async cancelDetail(detail_id, reason) {
    if (!detail_id) return;

    try {
      await this.getContract();
      // TODO: 調整 UDS，當所有細項皆取消時，該申請單也一併取消
      await this.contract.send("SetCancelDetail", {
        Request: {
          ref_app_detail_id: detail_id,
          cancel_reason: reason
        }
      });
    } catch (err) {
      console.log(err);
      throw (err.dsaError && err.dsaError.message) ? err.dsaError.message : '發生錯誤';
    }
  }

  // 取消申請預約
  async cancelEquipApplication(uid,reason){
    if (!uid) return;

    try {
      await this.getContract();
      await this.contract.send("CancelEquipApplication", {
        Request: {
          uid: uid,
          cancel_reason: reason
        }
      });
    } catch (err) {
      console.log(err);
      throw (err.dsaError && err.dsaError.message) ? err.dsaError.message : '發生錯誤';
    }
  }

}


// 設備預約申請
export class EquipApplication {
  uid: string; // 申請紀錄系統編號
  applicant_name: string; // 申請者姓名
  apply_by: string; // 申請者教師編號
  ref_equip_id: string; // 設備編號
  apply_date: string; // 申請時間
  apply_reason: string; // 申請事由
  is_repeat: 't' | 'f'; // 是否重複
  repeat_type: string; // 重複類型
  apply_start_date: string; // 開始日期
  repeat_end_date: string; // 重複結束日期
  is_canceled: 't' | 'f'; // 是否取消
  canceled_time: string; // 取消時間
  canceled_name: string; // 取消者姓名
  canceled_by: string; // 取消者教師編號
  cancel_reason: string; // 取消原因
  detail: EquipApplicationDetail[];
  equip_name: string;
  property_no: string;
  company: string;
  model_no: string;
  status: string;
  deadline: string;
  place: string;
}

// 擴充部份非必要欄位的
export class ExtEquipApplication extends EquipApplication {
  start_time_desc?: string;
  return_time_desc?: string;

  repeat_type_desc?: string;
  apply_date_desc?: string; // YYYY-MM-DD
  apply_start_date_desc?: string; // YYYY-MM-DD
  repeat_end_date_desc?: string; // YYYY-MM-DD
  canceled_time_desc?: string; // YYYY-MM-DD

  start_hour_desc?: string; // 開始時間 HH:mm
  end_hour_desc?: string; // 結束時間 HH:mm
}

// 設備預約申請的時段細項
export class EquipApplicationDetail {
  detail_uid: string; // 系統編號
  ref_application_id: string; // 申請紀錄系統編號
  start_time: string; // 預約開始時間
  end_time: string; // 預約結束時間
  deadline: string; // 未取用取消時間
  is_canceled: string; // 是否取消
  canceled_time: string; // 取消時間
  canceled_name: string; // 取消者姓名
  canceled_by: string; // 取消者教師編號
  cancel_reason: string; // 取消原因
  ref_app_detail_id: string; // 設備預約申請時段系統編號
  borrow_time: string; // 借出時間
  return_time: string; // 歸還時間
  start_time_desc?: string;
  return_time_desc?: string;

  date_desc?: string; // 開始時間的 YYYY-MM-DD
}

/**新增時，寫入資料庫使用規格 */
export interface Detail {
  start_time: string;
  end_time: string;
  deadline: string; // 未取用取消時間
}