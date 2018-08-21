import { DebugComponent } from './../modal/debug.component';
import { MatDialog } from '@angular/material/dialog';
import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material';
import { WaitingComponent } from '../modal/waiting.component';

@Injectable()
export class AlertService {

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  /** 顯示 JSON 資料。 */
  public json(json: any) {
    return this.dialog.open(DebugComponent, {
      data: json
    });
  }

    /** 顯示訊息。 */
  public snack(msg: string, duration: number = 2000) {
    this.snackbar.open(msg, undefined, {
      duration: duration
    });
  }

  /** 顯示一個無法手動關閉的畫面。 */
  public waiting(msg: string) {
    return this.dialog.open(WaitingComponent, {
      data: msg,
      disableClose: true
    });
  }
}
