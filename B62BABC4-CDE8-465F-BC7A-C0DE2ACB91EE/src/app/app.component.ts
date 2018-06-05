import { GadgetService } from './gadget.service';
import { Component, OnInit, NgZone } from '@angular/core';

import { MatDialog } from '@angular/material';
import { DialogComponent } from './dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {

  head: string;
  accessPoint: string;
  schoolInfo: any;
  loading: boolean;
  error: any;

  langs = ['英文', '中文', '日文'];

  page:"main"|"add"|"list"|'comment' = "main";

  constructor(
    private gadget: GadgetService,
    private dialog: MatDialog,
  ) {
  }

  async ngOnInit() {

    // this.head = 'Hello Gadget!';

    // try {
    //   this.loading = true;

    //   // 取得 contract 連線。
    //   const contract = await this.gadget.getContract('kcis');

    //   this.accessPoint = contract.getAccessPoint;

    //   // 呼叫 service。
    //   this.schoolInfo = await contract.send('behavior.GetCommentTemplate', {
        
    //   });

    // } catch (err) {
    //   this.error = err;
    // } finally {
    //   this.loading = false;
    // }
    
  }

  async showDialog() {
    const dig = this.dialog.open(DialogComponent, {
      data: {name: 'zoe'}
    });

    dig.afterClosed().subscribe((v) => {
      alert(JSON.stringify(v));
    });

    // const output = await dig.afterClosed()
    //   .toPromise()

    //   alert(JSON.stringify(output));
  }
}
