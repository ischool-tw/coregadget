import { Injectable, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class GadgetService {

  access_token: string;
  connection: any;

  constructor(private route: Router, private zone: NgZone) {
    var clientID = "7165f90a1118a04c40870d31f64e03bb";
    var application = "test.p.kcbs.hc.edu.tw";

    var routePath = location.href.lastIndexOf('#') >= 0 ? location.href.substr(location.href.lastIndexOf('#') + 1) : "";
    var source = location.href.lastIndexOf('#') >= 0 ? location.href.substr(0, location.href.lastIndexOf('#')) : location.href;
    source = source.lastIndexOf('?') >= 0 ? source.substr(0, source.lastIndexOf('?')) : source;
    var redirect_page = source.substr(0, source.lastIndexOf('/')) + "/signin.html";
    var redirect_uri = encodeURIComponent(redirect_page + "?source=" + source + "&route=" + routePath);

    var missingDSNS = false;
    var requireSignIn = false;
    if (location.href.search) {
      var vars: any = {};
      var searchs = window.location.search.replace(/\?/, "").split('&');
      for (var i = 0; i < searchs.length; i++) {
        var search = decodeURIComponent(searchs[i]);
        var key = search.substring(0, search.indexOf("="));
        vars[key] = search.substring(search.indexOf("=") + 1);
      }

      if (vars.dsns) {
        application = vars.dsns;
        // redirect_uri = redirect_uri + encodeURIComponent("#dsns=" + application);
      }
      else {
        missingDSNS = true;
      }
      if (vars.token) {
        this.access_token = vars.token;
        this.connection = dsutil.creatConnection(application + "/kcis", {
          "@": ['Type'],
          Type: 'PassportAccessToken',
          AccessToken: this.access_token
        });
        this.connection.OnLoginError(function (err) {
          //if (err.XMLHttpRequest.responseText.indexOf("User doesn't exist") > 0) {
          //    alert(err.XMLHttpRequest.responseText);
          //    window.location.assign("https://auth.ischool.com.tw/logout.php?next=" + encodeURIComponent("oauth/authorize.php?client_id=" + clientID + "&response_type=token&redirect_uri=" + redirect_uri + "&scope=" + application + ":kcis"));

          //}
          alert(err.XMLHttpRequest.responseText);
          window.location.assign("https://auth.ischool.com.tw/logout.php?next=" + encodeURIComponent("oauth/authorize.php?client_id=" + clientID + "&response_type=token&redirect_uri=" + redirect_uri + "&application=" + application + "&scope=" + application + ":kcis"));
        });
      }
      else {
        requireSignIn = true;
      }
    }
    else {
      missingDSNS = true;
      requireSignIn = true;
    }

    missingDSNS = false;
    if (missingDSNS) {
      alert("Param lost (dsns) ");
      return;
    }
    else {
      if (requireSignIn) {
        window.location.assign("https://auth.ischool.com.tw/oauth/authorize.php?client_id=" + clientID + "&response_type=token&redirect_uri=" + redirect_uri + "&application=" + application + "&scope=" + application + ":kcis");
        return;
      }
    }
  }

  /**
   * 取得 Contract 連接。
   * @param contractName 名稱。
   */
  public async getContract(contractName: string): Promise<Contract> {

    // const contract = gadget.getContract(contractName);

    // return new Promise<any>((r, j) => {
    //   contract.ready(() => {
    //     r(new Contract(contract, this.zone));
    //   });

    //   contract.loginFailed((err) => {
    //     j(err);
    //   });
    // });


    return new Promise<any>((r, j) => {
      this.connection.ready(() => {
        r(new Contract(this.connection, this.zone));
      });

      this.connection.OnLoginError((err) => {
        j(err);
      });
    });
  }
}

/**
 * 代表已連接的 Contract。
 */
export class Contract {

  constructor(private contract: any, private zone: NgZone) { }

  /**
   * 呼叫 dsa service。
   */
  public send(serviceName: string, body: any = {}): Promise<any> {
    return new Promise<any>((r, j) => {
      this.contract.send({
        service: serviceName,
        body: body,
        result: (rsp, err, xmlhttp) => {
          if (err) {
            j(err);
          } else {
            r(rsp);
          }
        }
      });
    });
  }

  /**
   * 取得使用者資訊。
   */
  public get getUserInfo(): any {
    return this.contract.getUserInfo();
  }

  /**
   * 取得連接主機。
   */
  public get getAccessPoint(): string {
    return this.contract.getAccessPoint();
  }

  public get getSessionID(): any {
    return this.contract.getToken().SessionID;
  }
}
