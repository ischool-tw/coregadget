/// <reference path="parseXml.js"/>
/// <reference path="xml2json.js"/>
/// <reference path="xmlWriter.js"/>
/// <reference path="config.js"/>
var dsutil = dsutil || {};
dsutil.dsnsLookup = (function () {
    //#region DSNSCache
    var dsnsCache = {};
    //#endregion
    return function (dsnsName) {
        //#region DSNS Lookup
        dsnsName = dsnsName || '';
        //#region 查詢完成後CallBack
        var lookupResult = dsnsName;
        var lookupFinish = false;
        var lookupCallBack = [];
        function dsnsLookupFinish(result) {
            lookupResult = result || lookupResult;
            //#region 存入Cache
            if (!!!dsnsCache[dsnsName]) {
                dsnsCache[dsnsName] = lookupResult;
            }
            //#endregion
            lookupFinish = true;
            for (var i = 0; i < lookupCallBack.length; i++) {
                lookupCallBack[i](lookupResult);
            }
        }
        //#endregion
        if (!!dsnsCache[dsnsName]) {
            //#region 回傳Cache內容
            dsnsLookupFinish(dsnsCache[dsnsName]);
            //#endregion
        }
        else {
            //#region 向DSNS Server查詢
            function queryDSNS(target, dsnsList) {
                if (window.XDomainRequest && !("withCredentials" in new XMLHttpRequest())) {
                    var xdr = new XDomainRequest();
                    try {
                        if (xdr) {
                            xdr.onerror = xdr.ontimeout = function () {
                                if (dsnsList.length == 0) {
                                    dsnsLookupFinish();
                                }
                                else
                                    queryDSNS(target, dsnsList);
                            };
                            xdr.onload = function () {
                                var resp = xml2json.parser(xdr.responseText);
                                if (resp && resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status && resp.Envelope.Header.Status.Code == "0") {
                                    if (resp && resp.Envelope && resp.Envelope.Body && resp.Envelope.Body.DoorwayURL) {
                                        if (window.location.protocol.match('^https')) {
                                            var lookupValue = resp.Envelope.Body.DoorwayURL.SecuredUrl || resp.Envelope.Body.DoorwayURL["@text"] || ("" + resp.Envelope.Body.DoorwayURL);
                                            dsnsLookupFinish(lookupValue);
                                        }
                                        else {
                                            var lookupValue = resp.Envelope.Body.DoorwayURL["@text"] || ("" + resp.Envelope.Body.DoorwayURL);
                                            dsnsLookupFinish(lookupValue);
                                        }
                                    }
                                    else
                                        dsnsLookupFinish();
                                }
                                else {
                                    if (dsnsList.length == 0) {
                                        dsnsLookupFinish();
                                    }
                                    else
                                        queryDSNS(target, dsnsList);
                                }
                            };
                            xdr.onprogress = function () { };
                            xdr.open("POST", dsnsList.pop());
                            xdr.send(
                                parseXml.CreateParser().parse({
                                    Header: {
                                        TargetService: 'DS.NameService.GetDoorwayURL',
                                        SecurityToken: {
                                            '@': ['type'],
                                            Type: 'Basic',
                                            UserName: 'anonymous',
                                            Password: ''
                                        }
                                    },
                                    Body: {
                                        DomainName: target
                                    }
                                }, 'Envelope')
                            );
                        }
                    }
                    catch (ex) {
                        if (dsnsList.length == 0) {
                            dsnsLookupFinish();
                        }
                        else
                            queryDSNS(target, dsnsList);
                    }
                }
                else {
                    try {
                        $.ajax({
                            url: dsnsList.pop(),
                            crossDomain: true,
                            type: 'POST',
                            dataType: 'xml',
                            beforeSend: function (XMLHttpRequest) {
                                XMLHttpRequest.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
                            },
                            data: parseXml.CreateParser().parse({
                                Header: {
                                    TargetService: 'DS.NameService.GetDoorwayURL',
                                    SecurityToken: {
                                        '@': ['type'],
                                        Type: 'Basic',
                                        UserName: 'anonymous',
                                        Password: ''
                                    }
                                },
                                Body: {
                                    DomainName: target
                                }
                            }, 'Envelope'),
                            success: function (data, textStatus, XMLHttpRequest) {
                                var resp = $(data);
                                if (resp.find('Header Status Code') && resp.find('Header Status Code').text() == "0") {
                                    if (window.location.protocol.match('^https') && resp.find('Body DoorwayURL') && resp.find('Body DoorwayURL').attr("SecuredUrl")) { dsnsLookupFinish(resp.find('Body DoorwayURL').attr("SecuredUrl")); }
                                    else if (resp.find('Body DoorwayURL') && resp.find('Body DoorwayURL').text()) { dsnsLookupFinish(resp.find('Body DoorwayURL').text()); }
                                    else { dsnsLookupFinish(); }
                                }
                                else {
                                    if (dsnsList.length == 0) {
                                        dsnsLookupFinish();
                                    }
                                    else
                                        queryDSNS(target, dsnsList);
                                }
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                if (dsnsList.length == 0) {
                                    dsnsLookupFinish();
                                }
                                else
                                    queryDSNS(target, dsnsList);
                            }
                        });
                    }
                    catch (ex) {
                        if (dsnsList.length == 0) {
                            dsnsLookupFinish();
                        }
                        else
                            queryDSNS(target, dsnsList);
                    }
                }
            }
            var dsnsList = [
                'http://dsns5.ischool.com.tw/dsns/dsns',
                'http://dsns4.ischool.com.tw/dsns/dsns',
                'http://dsns3.ischool.com.tw/dsns/dsns',
                'http://dsns2.ischool.com.tw/dsns/dsns',
                'http://dsns1.ischool.com.tw/dsns/dsns',

                'https://dsns1.ischool.com.tw/dsns/dsns',
                'https://dsns.ischool.com.tw/dsns/dsns'
            ];
            if (window.config && config.getDsns && config.getDsns())
                dsnsList = dsnsList.concat(config.getDsns());
            queryDSNS(
                dsnsName
                , dsnsList
            );
            //#endregion
        }
        return {
            complite: function (fn) {
                lookupCallBack.push(fn);
                if (lookupFinish) {
                    fn(lookupResult);
                }
            }
        };
        //#endregion
    }
})();