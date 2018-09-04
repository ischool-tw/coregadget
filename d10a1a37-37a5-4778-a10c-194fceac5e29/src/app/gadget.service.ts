import { Injectable, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class GadgetService {

  connection: any;
  application: string;
  authorizationUrl: string;

  constructor(private route: Router, private zone: NgZone) {

    var url_var: any = {};
    var hashes = window.location.hash.replace(/\#/, "").split('&');
    var searchs = window.location.search.replace(/\?/, "").split('&');
    for (var i = 0; i < hashes.length; i++) {
      var hash = decodeURIComponent(hashes[i]);
      var key = hash.substring(0, hash.indexOf("="));
      url_var[key] = hash.substring(hash.indexOf("=") + 1);
    }
    for (var i = 0; i < searchs.length; i++) {
      var search = decodeURIComponent(searchs[i]);
      var key = search.substring(0, search.indexOf("="));
      url_var[key] = search.substring(search.indexOf("=") + 1);
    }


    var clientID = "7165f90a1118a04c40870d31f64e03bb";
    this.application = url_var["dsns"] || "test.p.kcbs.hc.edu.tw";

    var routePath = location.href.lastIndexOf('#') >= 0 ? location.href.substr(location.href.lastIndexOf('#') + 1) : "";
    var source = location.href.lastIndexOf('#') >= 0 ? location.href.substr(0, location.href.lastIndexOf('#')) : location.href;
    source = source.lastIndexOf('?') >= 0 ? source.substr(0, source.lastIndexOf('?')) : source;
    var redirect_page = source.substr(0, source.lastIndexOf('/')) + "/signin.html";
    var redirect_uri = encodeURIComponent(redirect_page + "?dsns=" + this.application + "&source=" + source + "&route=" + routePath);

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
        this.application = vars.dsns;
        // redirect_uri = redirect_uri + encodeURIComponent("#dsns=" + application);
      }
      else {
        missingDSNS = true;
      }

      this.authorizationUrl =
        "https://auth.ischool.com.tw/logout.php?next=" + encodeURIComponent(
          "/oauth/authorize.php?lang=English"
          + "&client_id=" + clientID
          + "&response_type=token&redirect_uri=" + redirect_uri
          + "&application=" + this.application
          + "&scope=" + this.application + ":kcis"
        );
      if (vars.sessionID) {
        var resignUrl = this.authorizationUrl;

        this.connection = dsutil.creatConnection(this.application + "/kcis", vars.sessionID);
        this.connection.OnLoginError(function (err) {
          if (err.message != "SessionID doesn't exist.")
            alert("Login Failed：\n" + err.XMLHttpRequest.responseText);
          window.location.assign(resignUrl);
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
        window.location.assign(this.authorizationUrl);
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
