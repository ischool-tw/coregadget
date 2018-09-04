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
    this.logoutUrl = gadget.authorizationUrl;
  }
  async logout() {
    window.open('', '_gradebook').close();
    const contract = await this.gadget.getContract('kcis');
    const rsp = await contract.send('DS.Base.InvalidateSession',{SessionID: contract.getSessionID});
    window.location.replace(this.logoutUrl);
  }
}
