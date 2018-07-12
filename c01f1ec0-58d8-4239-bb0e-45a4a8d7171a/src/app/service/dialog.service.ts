import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from './../shared/confirm-dialog.component';
import { ConfirmCancelComponent } from '../shared/confirm-cancel.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(public dialog: MatDialog) { }

  /**
   * 簡單的詢問視窗(僅確定 or 取消)
   * @param title 標題
   * @param body 內容
   */
  public async confirm(title: string, body: string):Promise<boolean> {

    return new Promise<boolean>((r, j) => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '250px',
        data: { title: title, body: body }
      });

      dialogRef.afterClosed().subscribe(result => {
        r(result);
      });
    });

  }


  /**
   * 取消預約，並輸入原因(僅確定 or 取消)
   * @param title 標題
   * @param body 內容
   */
  public async confirmCancel(title: string, body: string, reason: string = '', width: string = '300px'):Promise<CancelResult> {

    return new Promise<CancelResult>((r, j) => {
      const dialogRef = this.dialog.open(ConfirmCancelComponent, {
        width: width,
        data: { title: title, body: body, reason: reason }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          r(result);
        } else {
          r({
            reason: reason,
            confirm: false,
          })
        }
      });
    });

  }
}


export interface CancelResult {
  reason: string;
  confirm: boolean;
}