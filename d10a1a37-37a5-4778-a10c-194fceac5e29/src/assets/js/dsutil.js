/// <reference path="parseXml.js"/>
/// <reference path="xml2json.js"/>
/// <reference path="xmlWriter.js"/>
/// <reference path="dsnsLookup.js"/>
var dsutil = dsutil || {};
dsutil.creatConnection = function (accessPoint, account, password) {
    if (!!!accessPoint) {
        alert("accessPoint is empty");
    }
    var _accessPoint = accessPoint || '';
    var _token = {};
    if (password) {
        _token = {
            '@': ['type'],
            Type: 'Basic',
            UserName: account || '',
            Password: password || ''
        };
    }
    else {
        if (account) {
            if (typeof account != "object") {
                _token = {
                    "@": ['Type'],
                    Type: 'Session',
                    SessionID: account
                };
            }
            else {
                _token = account;
            }
        }
    }
    var _IsLogin = false;
    var _SendingRequests = [];
    var _LoginError = null;
    var _ErrorCallBack = [];
    var _LoginErrorCallBack = [];
    var _UserInfo = {};
    var _ReadyCallBack = [];
    var _LoginRetry = 0;
    function login() {
        _LoginError = null;
        _IsLogin = false;
        if (window.XDomainRequest && !("withCredentials" in new XMLHttpRequest())) {
            var xdr = new XDomainRequest();
            try {
                if (xdr) {
                    xdr.onerror = function () {
                        if (_LoginRetry < 3) {
                            _LoginRetry++;
                            setTimeout(login, 500);
                            return;
                        }
                        var result = xdr.abort();
                        _LoginError = {
                            'data': 'onerror',
                            'textStatus': 'onerror',
                            'XMLHttpRequest': xdr,
                            'statusCode': "",
                            'message': ""
                        };
                        for (index in _LoginErrorCallBack) {
                            _LoginErrorCallBack[index](_LoginError);
                        }
                        SendAllRequest();
                    };
                    xdr.ontimeout = function () {
                        _LoginError = {
                            'data': 'ontimeout',
                            'textStatus': 'ontimeout',
                            'XMLHttpRequest': xdr,
                            'statusCode': "",
                            'message': ""
                        };
                        for (index in _LoginErrorCallBack) {
                            _LoginErrorCallBack[index](_LoginError);
                        }
                        SendAllRequest();
                    };
                    xdr.onprogress = function () { };
                    xdr.onload = function () {
                        var resp = xml2json.parser(xdr.responseText);
                        if (resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status && resp.Envelope.Header.Status.Code == "0") {
                            if (_token.Type != 'Session') {
                                _token = {
                                    "@": ['Type'],
                                    Type: 'Session',
                                    SessionID: (resp.Envelope && resp.Envelope.Body) ? resp.Envelope.Body.SessionID : ""
                                }
                            }
                            _UserInfo = resp.Envelope.Header.UserInfo;
                            _LoginError = null;
                            _IsLogin = true;
                            for (var i = 0; i < _ReadyCallBack.length; i++) {
                                _ReadyCallBack[i]();
                            }
                            SendAllRequest();
                        }
                        else {
                            _LoginError = {
                                'data': xdr.responseText,
                                'textStatus': 'unknow',
                                'XMLHttpRequest': xdr,
                                'statusCode': (resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status) ? resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status && resp.Envelope.Header.Status.Code : "",
                                'message': (resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status) ? resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status && resp.Envelope.Header.Status.Message : ""
                            };
                            for (index in _LoginErrorCallBack) {
                                _LoginErrorCallBack[index](_LoginError);
                            }
                            SendAllRequest();
                        }
                    };
                    xdr.open("POST", _accessPoint);
                    xdr.accessPoint = _accessPoint;
                    xdr.token = _token;
                    xdr.send(
                        parseXml.CreateParser().parse({
                            Header: {
                                TargetService: 'DS.Base.Connect',
                                SecurityToken: _token
                            },
                            Body: (_token.Type != 'Session') ? { RequestSessionID: '' } : {}
                        },
                            'Envelope')
                    );
                }
            }
            catch (ex) {
                if (_LoginRetry < 3) {
                    _LoginRetry++;
                    setTimeout(login, 500);
                    return;
                }
                _LoginError = {
                    'data': ex,
                    'textStatus': '',
                    'XMLHttpRequest': null,
                    'statusCode': "",
                    'message': ""
                };
                for (index in _LoginErrorCallBack) {
                    _LoginErrorCallBack[index](_LoginError);
                }
                SendAllRequest();
            }
        }
        else {
            try {
                $.ajax({
                    url: _accessPoint,
                    crossDomain: true,
                    type: 'POST',
                    dataType: 'xml',
                    beforeSend: function (XMLHttpRequest) {
                        XMLHttpRequest.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
                    },
                    data: parseXml.CreateParser().parse({
                        Header: {
                            TargetService: 'DS.Base.Connect',
                            SecurityToken: _token
                        },
                        Body: (_token.Type != 'Session') ? { RequestSessionID: '' } : {}
                    }, 'Envelope'),
                    success: function (data, textStatus, XMLHttpRequest) {
                        //			alert('succ');
                        var resp = $(data);
                        if (resp.find("Header Status Code").text() == "0") {
                            if (_token.Type != 'Session') {
                                _token = {
                                    "@": ['Type'],
                                    Type: 'Session',
                                    SessionID: resp.find('Body SessionID').text()
                                }
                            }
                            _UserInfo = xml2json.parser(XMLHttpRequest.responseText).Envelope.Header.UserInfo;
                            _LoginError = null;
                            _IsLogin = true;
                            for (var i = 0; i < _ReadyCallBack.length; i++) {
                                _ReadyCallBack[i]();
                            }
                            //                        result.loginCallBack('success');
                            SendAllRequest();
                        }
                        else {
                            //Login Faild
                            //                        _LoginError = 'login faild:' + XMLHttpRequest.responseText;
                            //                        result.loginCallBack('faild');
                            _LoginError = {
                                'data': data,
                                'textStatus': textStatus,
                                'XMLHttpRequest': XMLHttpRequest,
                                'statusCode': "" + resp.find("Header Status Code").text(),
                                'message': "" + resp.find("Header Status Message").text()
                            };
                            for (index in _LoginErrorCallBack) {
                                _LoginErrorCallBack[index](_LoginError);
                            }
                            SendAllRequest();
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        if (_LoginRetry < 3) {
                            _LoginRetry++;
                            setTimeout(login, 500);
                            return;
                        }
                        _LoginError = {
                            'data': errorThrown,
                            'textStatus': textStatus,
                            'XMLHttpRequest': XMLHttpRequest,
                            'statusCode': "",
                            'message': ""
                        };
                        for (index in _LoginErrorCallBack) {
                            _LoginErrorCallBack[index](_LoginError);
                        }
                        SendAllRequest();
                    }
                });
            }
            catch (ex) {
                if (_LoginRetry < 3) {
                    _LoginRetry++;
                    setTimeout(login, 500);
                    return;
                }
                _LoginError = {
                    'data': ex,
                    'textStatus': '',
                    'XMLHttpRequest': null,
                    'statusCode': "",
                    'message': ""
                };
                for (index in _LoginErrorCallBack) {
                    _LoginErrorCallBack[index](_LoginError);
                }
                SendAllRequest();
            }
        }
    }
    if (_accessPoint.indexOf("://") < 0) {
        var index = _accessPoint.indexOf("/");
        if (index > 0) {
            var dsnsName = _accessPoint.substring(0, index);
            dsutil.dsnsLookup(dsnsName).complite(function (accesspoint) {
                _accessPoint = accesspoint.replace(/\/$/g, '') + _accessPoint.substring(index);
                login();
            });
        }
        else {
            dsutil.dsnsLookup(_accessPoint).complite(function (accesspoint) {
                _accessPoint = accesspoint;
                login();
            });
        }
    }
    else {
        login();
    }
    function SendAllRequest() {
        if (_IsLogin === true) {
            for (index in _SendingRequests) {
                SendRequest(_SendingRequests[index]);
            }
            _SendingRequests = [];
        }
        else
            if (_LoginError !== null) {
                for (index in _SendingRequests) {
                    for (index in _ErrorCallBack) {
                        _ErrorCallBack[index](_SendingRequests[index], {
                            'loginError': _LoginError,
                            'dsaError': null,
                            'networkError': null,
                            'ajaxException': null
                        });
                    }
                    _SendingRequests[index].result(null, {
                        'loginError': _LoginError,
                        'dsaError': null,
                        'networkError': null,
                        'ajaxException': null
                    }, null);
                }
                _SendingRequests = [];
            }
    }
    function SendRequest(req) {
        if (window.XDomainRequest && !("withCredentials" in new XMLHttpRequest())) {
            var xdr = new XDomainRequest();
            try {
                if (xdr) {
                    xdr.onerror = function () {
                        for (index in _ErrorCallBack) {
                            _ErrorCallBack[index](req, {
                                'loginError': null,
                                'dsaError': null,
                                'networkError': null,
                                'ajaxException': 'xdr.onerror'
                            });
                        }
                        req.result(null, {
                            'loginError': null,
                            'dsaError': null,
                            'networkError': null,
                            'ajaxException': 'xdr.onerror'
                        }, null);
                    };
                    xdr.ontimeout = function () {
                        //NetWork Faild
                        if (req.autoRetry)
                            SendRequest(req);
                        else {
                            //Service Faild
                            for (index in _ErrorCallBack) {
                                _ErrorCallBack[index](req, {
                                    'loginError': null,
                                    'dsaError': null,
                                    'networkError': {
                                        textStatus: 'ontimeout',
                                        errorThrown: null,
                                        XMLHttpRequest: xdr
                                    },
                                    'ajaxException': null
                                });
                            }
                            req.result(null, {
                                'loginError': null,
                                'dsaError': null,
                                'networkError': {
                                    textStatus: 'ontimeout',
                                    errorThrown: null,
                                    XMLHttpRequest: xdr
                                },
                                'ajaxException': null
                            }, xdr);
                        }
                    };
                    xdr.onprogress = function () { };
                    xdr.onload = function () {
                        var resp = xml2json.parser(xdr.responseText);
                        if (resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status && resp.Envelope.Header.Status.Code == "0") {
                            req.result(resp.Envelope.Body || {}, null, xdr, resp);
                        }
                        else {
                            //Service Faild
                            for (index in _ErrorCallBack) {
                                _ErrorCallBack[index](req, {
                                    'loginError': null,
                                    'dsaError': {
                                        header: resp.Envelope ? resp.Envelope.Header : null,
                                        status: (resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status) ? resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status && resp.Envelope.Header.Status.Code : "",
                                        message: (resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status) ? resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status && resp.Envelope.Header.Status.Message : ""
                                    },
                                    'networkError': null,
                                    'ajaxException': null
                                });
                            }
                            req.result(null, {
                                'loginError': null,
                                'dsaError': {
                                    header: resp.Envelope ? resp.Envelope.Header : null,
                                    status: (resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status) ? resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status && resp.Envelope.Header.Status.Code : "",
                                    message: (resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status) ? resp.Envelope && resp.Envelope.Header && resp.Envelope.Header.Status && resp.Envelope.Header.Status.Message : ""
                                },
                                'networkError': null,
                                'ajaxException': null
                            }, xdr, resp);
                        }
                    };
                    xdr.open("POST", _accessPoint);
                    xdr.send(
                        (typeof req.body == "string") ?
                            (parseXml.CreateParser().parse({
                                Header: {
                                    TargetService: req.service,
                                    SecurityToken: _token
                                },
                                Body: 'bodytemplated'
                            }, 'Envelope')).replace('<Body>bodytemplated</Body>', '<Body>' + req.body + '</Body>') :
                            (parseXml.CreateParser().parse({
                                Header: {
                                    TargetService: req.service,
                                    SecurityToken: _token
                                },
                                Body: req.body
                            }, 'Envelope'))
                    );
                }
            }
            catch (ex) {
                for (index in _ErrorCallBack) {
                    _ErrorCallBack[index](req, {
                        'loginError': null,
                        'dsaError': null,
                        'networkError': null,
                        'ajaxException': ex
                    });
                }
                req.result(null, {
                    'loginError': null,
                    'dsaError': null,
                    'networkError': null,
                    'ajaxException': ex
                }, null);
            }
        }
        else {
            try {
                $.ajax({
                    url: _accessPoint,
                    crossDomain: true,
                    type: 'POST',
                    dataType: 'xml',
                    beforeSend: function (XMLHttpRequest) {
                        XMLHttpRequest.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
                    },
                    data: (typeof req.body == "string") ?
                        (parseXml.CreateParser().parse({
                            Header: {
                                TargetService: req.service,
                                SecurityToken: _token
                            },
                            Body: 'bodytemplated'
                        }, 'Envelope')).replace('<Body>bodytemplated</Body>', '<Body>' + req.body + '</Body>') :
                        (parseXml.CreateParser().parse({
                            Header: {
                                TargetService: req.service,
                                SecurityToken: _token
                            },
                            Body: req.body
                        }, 'Envelope')),
                    success: function (data, textStatus, XMLHttpRequest) {
                        var resp = $(data);
                        if (resp.find("Header Status Code").text() == "0") {
                            var fullresp = xml2json.parser(XMLHttpRequest.responseText);
                            req.result(fullresp.Envelope.Body || {}, null, XMLHttpRequest, fullresp);
                        }
                        else {
                            //Service Faild
                            jresp = xml2json.parser(XMLHttpRequest.responseText);
                            for (index in _ErrorCallBack) {
                                _ErrorCallBack[index](req, {
                                    'loginError': null,
                                    'dsaError': {
                                        header: jresp.Envelope ? jresp.Envelope.Header : null,
                                        status: resp.find("Header Status Code").text(),
                                        message: resp.find("Header Status Message").text()
                                    },
                                    'networkError': null,
                                    'ajaxException': null
                                });
                            }
                            req.result(null, {
                                'loginError': null,
                                'dsaError': {
                                    header: jresp.Envelope ? jresp.Envelope.Header : null,
                                    status: resp.find("Header Status Code").text(),
                                    message: resp.find("Header Status Message").text()
                                },
                                'networkError': null,
                                'ajaxException': null
                            }, XMLHttpRequest, jresp);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        //NetWork Faild
                        if (req.autoRetry)
                            SendRequest(req);
                        else {
                            //Service Faild
                            for (index in _ErrorCallBack) {
                                _ErrorCallBack[index](req, {
                                    'loginError': null,
                                    'dsaError': null,
                                    'networkError': {
                                        textStatus: textStatus,
                                        errorThrown: errorThrown,
                                        XMLHttpRequest: XMLHttpRequest
                                    },
                                    'ajaxException': null
                                });
                            }
                            req.result(null, {
                                'loginError': null,
                                'dsaError': null,
                                'networkError': {
                                    textStatus: textStatus,
                                    errorThrown: errorThrown,
                                    XMLHttpRequest: XMLHttpRequest
                                },
                                'ajaxException': null
                            }, XMLHttpRequest);
                        }
                    }
                });
            }
            catch (ex) {
                for (index in _ErrorCallBack) {
                    _ErrorCallBack[index](req, {
                        'loginError': null,
                        'dsaError': null,
                        'networkError': null,
                        'ajaxException': ex
                    });
                }
                req.result(null, {
                    'loginError': null,
                    'dsaError': null,
                    'networkError': null,
                    'ajaxException': ex
                }, null);
            }
        }
    }

    var result = {
        getUserInfo: function () { return _UserInfo; },
        getAccessPoint: function () { return _accessPoint; },
        getToken: function () { return _token; },
        send: function (req) {
            req.service = req.service || '';
            req.body = req.body || {};
            req.autoRetry = req.autoRetry || false;
            req.result = req.result ||
                function (resp, errorInfo, XMLHttpRequest) {// errorInfo=null||{'loginError': null,'dsaError': null,'networkError': null,'ajaxException': null} 
                };
            if (_IsLogin === false && _LoginError !== null) {
                req.result(null, {
                    'loginError': _LoginError,
                    'dsaError': null,
                    'networkError': null,
                    'ajaxException': null
                }, null);
            }
            else {
                _SendingRequests.push(req);
                if (_IsLogin)
                    SendAllRequest();
            }
        },
        reConnect: function (account, password) {
            _LoginError = null;
            _IsLogin = false;
            _token = {};
            if (password) {
                _token = {
                    '@': ['type'],
                    Type: 'Basic',
                    UserName: account || '',
                    Password: password || ''
                };
            }
            else {
                if (account) {
                    if (typeof account != "object") {
                        _token = {
                            "@": ['Type'],
                            Type: 'Session',
                            SessionID: account
                        };
                    }
                    else {
                        _token = account;
                    }
                }
            }
            _IsLogin = false;
            login();
        },
        ready: function (fn) {
            if (fn) {
                _ReadyCallBack.push(fn);
                if (_IsLogin) {
                    fn();
                }
            }
        },
        OnLoginError: function (fn) {
            if (fn) {
                _LoginErrorCallBack.push(fn);
                if (_IsLogin === false && _LoginError !== null) {
                    fn(_LoginError);
                }
            }
        },
        OnError: function (fn) {
            if (fn) {
                _ErrorCallBack.push(fn);
            }
        }
    };
    return result;
}
