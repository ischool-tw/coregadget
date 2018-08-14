import { Injectable } from '@angular/core';
import { GadgetService, Contract } from "../gadget.service";

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  teachers: Teacher[];
  contract: any;
  _isAdmin: boolean = false;
  _isUnitAdmin: boolean = false;
  _equipUnits: EquipUnits[];

  constructor(
    private gadget: GadgetService,
  ) {

  }

  async getContract() {
    if (!this.contract) this.contract = await this.gadget.getContract("ischool.equipment");
  }

  async getTeachers() {
    await this.getContract();
    try {
      // 呼叫 service。
      const _temp = await this.contract.send("GetTeachers");
      this.teachers = _temp.teacher;

      // console.log( this.meetingRooms);
    } catch (err) {
      console.log(err);
    } finally {
    }

    return this.teachers as Teacher[];
  }

  // 檢查管理者
  async checkAdmin() {
    await this.getContract();
    try {
      // 呼叫 service。
      const _temp = await this.contract.send("IsAdmin");
      // 如果有資料表示管理者
      this._isAdmin = (_temp.admin === 't');
      this._equipUnits = [].concat(_temp.equipUnits || []);
      this._isUnitAdmin = (this._equipUnits.length > 0);

      // console.log( this.meetingRooms);
    } catch (err) {
      console.log(err);
    } finally {
    }
  }

  // 是否管理者
  IsAdmin() {
    return this._isAdmin;
  }

  // 是否為單位管理者
  IsUnitAdmin() {
    return this._isUnitAdmin;
  }

  // 我具管理權限的單位
  MyEquipUnits() {
    return this._equipUnits;
  }
}

export class Teacher {
  id: string;
  name: string;
}

export class EquipUnits {
  equip_units_name: string;
  equip_units_uid: string;
  unit_admin_is_boss: string;
}