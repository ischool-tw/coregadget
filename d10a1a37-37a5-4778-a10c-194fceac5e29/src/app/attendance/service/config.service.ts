import { DSAService, Config } from './dsa.service';
import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {

  private _ready: Promise<boolean>;

  private _config: Config;

  constructor(private recall: DSAService) {
    this._ready = this.initConfig();
  }

  public async initConfig() {
    try {
      this._config = await this.recall.getGetConfig();
      return true;
    } catch(error) {
      return false;
    }
  }

  /** 是否已經準備完成。 */
  public get ready() {
    return this._ready;
  }

  public getPeriods() {
    return this._config.Periods.Period.sort((x, y) => (+x.Sort) - (+y.Sort)) as PeriodConf[];
  }

  /**
   * 取得節次設定。
   * @param name 節次名稱：一、二、三
   */
  public getPeriod(name: string) {
    const map = this.getPeriods().find(p => p.Name === name);

    return map as PeriodConf;
  }

  public getAbsences() {
    return this._config.Absences.Absence as AbsenceConf[];
  }

  /**
   * 取得缺曠設定。
   * @param name 缺曠全稱。
   */
  public getAbsence(name: string) {
    return this.getAbsences().find(a => a.Name === name);
  }

  /**
   * 取得缺曠類別的顏色。
   * @param abbr 曠、遲、事、病、公、喪。
   */
  public getAbsenceColor(abbr: string) {
    return [
      '#F44336',
      '#FF9800',
      '#2196F3',
      '#4CAF50',
      '#9C27B0',
      '#607D8B',
    ][
      ['曠', '遲', '事', '病', '公', '喪'].indexOf(abbr)
    ] || '#000';
  }
}

/** 缺曠設定。 */
export interface AbsenceConf {

  /** 節次簡稱。 */
  Abbr: string;

  /** 節次全稱。 */
  Name: string;

  /** 顏色代碼。 */
  Color: string;
}

/** 節次設定。 */
export interface PeriodConf {

  /** 節次名稱：升旗、一、二、三、四....降旗... */
  Name: string;

  Sort: string;

  /** 集會、一般... */
  Type: string;

  Absence: AbsenceConf[];
}