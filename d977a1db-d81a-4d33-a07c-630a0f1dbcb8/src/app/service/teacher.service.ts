import { Injectable } from '@angular/core';
import { GadgetService, Contract } from "../gadget.service";

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  contract: any;

  constructor(private gadget: GadgetService) {
  }

  async getContract() {
    if (!this.contract) this.contract = await this.gadget.getContract("ischool.public.booking");
  }

  async getTeachers() {
    await this.getContract();
    try {
      // 呼叫 service。
      const rsp = await this.contract.send("GetTeachers");
      const teachers: Teacher[] = [].concat(rsp.teacher || []);

      // console.log(teachers);
      return teachers;

    } catch (err) {
      console.log(err);
      return [];
    } finally {
    }


  }
}

export class Teacher {
  id: string;
  name: string;
}
