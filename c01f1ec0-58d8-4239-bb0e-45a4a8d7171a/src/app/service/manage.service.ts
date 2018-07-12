import { Injectable } from '@angular/core';
import _ from 'lodash';
import * as moment from "moment";

import { GadgetService } from '../gadget.service';
import { throwError } from 'rxjs';

export enum Action {
  'IN' = 'in',
  'OUT' = 'out',
};
export type EquipmentStatus = '良好' | '維修中' | '遺失' | '報廢';
export type CurrStatus = '取消' | '已領待還' | '待領' | '未還' | '時間未到' | '已還';
export type PGBoolean = 't' | 'f';

@Injectable({
  providedIn: 'root'
})
export class ManageService {

  contract: any;
  todayDetails: todayDetail[] = [];

  constructor(private gadget: GadgetService) {}

  async getContract() {
    if (!this.contract) this.contract = await this.gadget.getContract("ischool.equipment");
  }

  /**
   * 設定細項借出或歸還
   * @param detail_uid 細項編號
   * @param action (in:歸還 || out:借出)
   */
  async setIOHistory(detail_uid, action: Action):Promise<any> {
    if (!detail_uid || !action) return;

    await this.getContract();

    try {
      await this.contract.send("SetIOHistory", {
        Request: {
          ref_app_detail_id: detail_uid,
          action: action,
        }
      });
    } catch (err) {
      throw (err.dsaError && err.dsaError.message) ? err.dsaError.message : '發生錯誤';
    }
  }

  /**
   * 將超過保留時間的預約自動設為「取消」
   */
  async batchDeadlineCancel() {
    await this.getContract();

    try {
      await this.contract.send("BatchDeadlineCancel");
    } catch (err) {
      console.log(err);
    }
  }

  // 從 DSA 取得資料
  async getTodayDetails() {
    await this.getContract();

    try {
      await this.batchDeadlineCancel();
      const rsp = await this.contract.send("GetTodayDetails");
      const data:todayDetail[] = [].concat(rsp.Detail || []);
      data.forEach(item => {
        item.detail_is_canceled = (item.detail_is_canceled === 't');
        item.applications_is_repeat = (item.applications_is_repeat === 't');
        if (item.detail_is_canceled) {
          item.current_status = '取消';
        } else if (moment(item.detail_start_time) > moment(item.now)) {
          item.current_status = '時間未到';
        } else if (item.io_history_return_time) {
          item.current_status = '已還';
        } else if (moment(item.detail_start_time) <= moment(item.now) && moment(item.detail_deadline_time) >= moment(item.now)) {
          item.current_status = (item.io_history_borrow_time) ? '已領待還' : '待領';
        } else if (moment(item.detail_end_time) >= moment(item.now)) {
          item.current_status = (item.io_history_borrow_time) ? '已領待還' : '取消';
        } else if (moment(item.detail_end_time) < moment(item.now)) {
          item.current_status = '未還';
        }
      });
      this.todayDetails = data;
    } catch (err) {
      this.todayDetails = [];
      console.log(err);
    }
  }

  /**
   * 過濾單位或類型或關鍵字(財產編號、申請人、設備名稱、或預約單編號)
   * @param unitName 單位名稱(值 或 空值 或 全部)
   * @param category 類型名稱(值 或 空值 或 全部)
   * @param keyword 關鍵字
   */
  async filterTodayDetails(unitName: string, category: string, keyword: string = '') {
    await this.getTodayDetails();

    const tmp: todayDetail[] = [];

    const filterKeyword = (item) => {
      if (keyword) {
        if ([item.equipment_property_no,
          item.applications_applicant_name,
          item.equipment_name,
          item.applications_uid].indexOf(keyword) !== -1) tmp.push(item);
      } else {
        tmp.push(item);
      }
    }

    for (const item of this.todayDetails) {
      if (unitName === '全部' && category === '全部') {
        filterKeyword(item);
      } else if (unitName === '全部' && category !== '全部') {
        if (item.equipment_category === category) filterKeyword(item);
      } else if (unitName !== '全部' && category === '全部') {
        if (item.equip_units_name === unitName) filterKeyword(item);
      } else {
        if (item.equip_units_name === unitName && item.equipment_category === category) filterKeyword(item);
      }
    }

    // 細項時間 > 排序單位 > 類型
    return _.sortBy(tmp, ['detail_start_time', 'equip_units_id', 'equipment_uid']);
  }
}

/**細項及相關申請單、單位、設備、借出、歸還 */
export interface todayDetail {
  detail_uid: string;
  detail_start_time: string;
  detail_end_time: string;
  detail_is_canceled: boolean | PGBoolean;
  detail_canceled_time: string;
  detail_canceled_name: string;
  detail_deadline_time: string;
  applications_uid: string;
  applications_applicant_name: string;
  applications_apply_by: string;
  applications_ref_equip_id: string;
  applications_apply_date: string;
  applications_apply_reason: string;
  applications_is_repeat: boolean | PGBoolean;
  applications_repeat_type: string;
  applications_apply_start_date: string;
  applications_repeat_end_date: string;
  equipment_uid: string;
  equipment_picture: string;
  equipment_name: string;
  equipment_category: string;
  equipment_property_no: string;
  equipment_company: string;
  equipment_model_no: string;
  equipment_status: EquipmentStatus;
  equipment_deadline: string;
  equipment_place: string;
  equip_units_id: string;
  equip_units_name: string;
  io_history_uid: string;
  io_history_borrow_time: string;
  io_history_return_time: string;
  now: string;
  current_status?: CurrStatus;
}
