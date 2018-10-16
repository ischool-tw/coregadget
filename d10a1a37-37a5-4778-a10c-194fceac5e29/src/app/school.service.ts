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
      // gadgets: // 空陣列是一個都不顯示，undefined 是顯示全部。
    }],
    ['test.p.kcbs.hc.edu.tw', { //康橋國小測試
      title: 'Kang Chiao International School(測試機)',
      iconUrl: 'assets/img/dev_logo.png',
    }],
    ['h.karlschool.org', { // 卡爾高中
      title: 'Karl International Experimental Education Institution',
      iconUrl: 'assets/img/karl_logo.png',
      gadgets: ['gradebook', 'attendence']
    }],
    ['j.karlschool.org', { // 卡爾國中
      title: 'Karl International Experimental Education Institution',
      iconUrl: 'assets/img/karl_logo.png',
      gadgets: ['gradebook', 'attendence']
    }],
    ['', { // DSNS 都找不到，會顯示這個。
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

  /**
   * 學校標題。
   */
  title: string;

  /**
   * 學校 Logo
   */
  iconUrl: string;

  /**
   * 要顯示的 gadget，不指定就全部顯示，空陣列是全部不顯示...
   */
  gadgets?: string[]
}