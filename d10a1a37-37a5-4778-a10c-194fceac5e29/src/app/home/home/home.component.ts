import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from 'src/app/gadget.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: []
})
export class HomeComponent implements OnInit {

  contract: Contract;
  constructor(private gadget: GadgetService) { }

  async ngOnInit() {
    this.contract = await this.gadget.getContract('kcis');
  }
  goGradebook() {
    location.assign("https://web2.ischool.com.tw/deployment/F57B2E7C-EAD5-4A51-8F45-141D9BC76912/content.kcis.htm#dsns=test.p.kcbs.hc.edu.tw&session_id=" + this.contract.getSessionID);
  }
}
