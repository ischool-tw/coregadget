import { Component, OnInit } from '@angular/core';
import { SakuraService } from './service/sakura.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {

  loading: boolean = true;

  constructor(private sakura: SakuraService) {
  }

  async ngOnInit() {
    this.loading = true;
    // 取得是否教師
    await this.sakura.getMyRole();
    this.loading = false;
  }
}
