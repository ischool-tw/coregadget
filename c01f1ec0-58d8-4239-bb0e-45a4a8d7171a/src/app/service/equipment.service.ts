import { Injectable } from '@angular/core';
import { GadgetService, Contract } from "../gadget.service";

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  equipments: Equipment[];
  equip_units = [];
  contract: any;
  dicEquipmentByUnit: any;
  constructor(private gadget: GadgetService) { }


  async getContract() {
    this.contract = await this.gadget.getContract("ischool.equipment");
  }

  // 從 DSA 取得資料
  async getData() {
    await this.getContract();
    try {
      // 呼叫 service。
      const _temp = await this.contract.send("GetEquipments");
      this.equipments = [].concat(_temp.equipment || []);
      this.equip_units = [];
      this.dicEquipmentByUnit = {};
      for (const eq of this.equipments) {
        const eqUName = (eq.equip_unit_name ? eq.equip_unit_name : '未指定');
        if (!this.dicEquipmentByUnit[eqUName]) {
          this.dicEquipmentByUnit[eqUName] = [];
          this.equip_units.push(eqUName);
        }
        this.dicEquipmentByUnit[eqUName].push(eq);
      }


    } catch (err) {
      console.log(err);
    } finally {

    }
    return this.equipments as Equipment[];
  }

  // 設備管理單位
  getEquipUnits() {
    let tmp = [];
    tmp.push("全部");
    for (const eu of this.equip_units)
      tmp.push(eu);
    return tmp;
  }

  // 取得所有設備
  getEquipments() {
    return this.equipments;
  }

  // 取得所有類別選單
  getEquipmentsCategory() {
    let tmp = [];
    if(this.equipments)
    {
      tmp.push("全部");
      for (const eq of this.equipments) {
        if (!tmp.includes(eq.category))
          tmp.push(eq.category);
      }
    }
   
    return tmp;
  }

  // 透過單位名稱取得設備
  getEquipmentsByUnitName(name: string) {
    if (name === '全部') {
      return this.equipments;
    } else {
      let tmp = this.equipments.filter(x => x.equip_unit_name === name);
      return tmp;
    }
  }

  getEquipmentsByCategory(unitName: string, category: string) {
    if (unitName === '全部' && category === '全部') {
      return this.equipments;

    } else if (unitName === '全部' && category !== '全部') {
      let tmp1 = [];
      for (const equip of this.equipments) {
        if (equip.category === category) {
          tmp1.push(equip);
        }
      }
      return tmp1;
    }
    else {
      let tmp = [];
      for (const equip of this.equipments) {
        if (equip.equip_unit_name === unitName && equip.category === category) {
          tmp.push(equip);
        }
      }
      return tmp;
    }
  }

  // 關鍵字搜尋
  findEquipmentsByKeywork(keyword: string) {
    let tmp = [];
    for (const equip of this.equipments) {
      if (equip.name.indexOf(keyword) > -1) {
        tmp.push(equip);
      }
    }
    return tmp;
  }

  // 取得設備內容索引
  getDicEquipmentByUnit() {
    return this.dicEquipmentByUnit;
  }
}


export class Equipment {
  equip_unit_name: string; // 單位名稱
  uid: string; // 設備系統編號
  picture: string; // 照片
  name: string; // 設備名稱
  property_no: string; // 財產編號
  company: string; // 廠牌
  model_no: string; // 型號
  status: string; // 設備狀態
  deadline: string; // 未取用解除預約時間
  place: string; // 放置位置
  ref_unit_id: string; // 管理單位編號
  create_time: string; // 建立日期
  created_by: string; // 建立者帳號
  category: string; // 類別
}
