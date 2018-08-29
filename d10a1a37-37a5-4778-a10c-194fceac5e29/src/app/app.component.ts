import { Component } from '@angular/core';
import { GadgetService, Contract } from 'src/app/gadget.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app';
  logoutUrl: string;
  constructor(private gadget: GadgetService) {
    this.logoutUrl = "https://auth.ischool.com.tw/logout.php?next=" + encodeURIComponent(gadget.authorizationUrl);
  }
  logout() {
    window.open('', '_gradebook').close();
    window.location.replace(this.logoutUrl);
  }
}
