import { Injectable } from '@angular/core';
import { GadgetService, Contract } from "../gadget.service";
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class SakuraService {

  my_role: MyRole;
  contract: any;

  constructor(
    private gadget: GadgetService,
  ) {

  }

  async getContract() {
    this.contract = await this.gadget.getContract("sakura");
  }

  async getMyRole() {
    await this.getContract();
    try {
      // 呼叫 service。
      const _temp = await this.contract.send("GetMyRole");
      _temp.IsTeacher = _temp.IsTeacher === 'true';

      this.my_role = _temp;


    } catch (err) {
      alert(JSON.stringify(err));
    } finally {
    }
    return this.my_role;
  }

  // 是否有教師身份
  isTeacher() {
    return this.my_role.IsTeacher;
    // return false;
  }

  getMyTeacherID() {
    return this.my_role.TeacherId;
  }

  getMyTeacherName() {
    return this.my_role.TeacherName;
  }

}

export class MyRole {
  IsTeacher: boolean;
  TeacherId: string;
  TeacherName: string;

}
