import { Injectable } from '@angular/core';
import { GadgetService } from './gadget.service';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {

  private schoolMap = new Map<string, SchoolInfo>([
    ['p.kcbs.hc.edu.tw', { //康橋國小
      title: 'Kang Chiao International School',
      iconUrl: 'assets/img/logo.png',
    }],
    ['test.p.kcbs.hc.edu.tw', { //康橋國小測試
      title: 'Kang Chiao International School(測試機)',
      iconUrl: 'assets/img/dev_logo.png',
    }],
    ['卡爾', {
      title: '卡爾 Title',
      iconUrl: 'assets/img/卡爾_logo.png',
    }],
    ['', { // 都找不到會顯示這個。
      title: 'Kang Chiao International School(開發)',
      iconUrl: 'assets/img/dev_logo.png',
    }]
  ]);

  constructor(
    private gadget: GadgetService
  ) { }

  public get info() {
    if (this.schoolMap.has(this.gadget.application)) {
      return this.schoolMap.get(this.gadget.application);
    } else {
      return this.schoolMap.get('');
    }
  }
}

export interface SchoolInfo {

  title: string;

  iconUrl: string;
}