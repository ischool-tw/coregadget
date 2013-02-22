<script type="text/javascript" src="http://140.126.57.213/web/js/jquery-1.4.4.min.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/jquery.history.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/windowSize.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/xmlWriter.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/xml2json.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/parseXml.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/dsnsLookup.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/dsutil.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/log.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/authentication.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/gadgetPreference.js"></script>
<script type="text/javascript" src="http://140.126.57.213/web/js/analytics.js"></script>
<script type="text/javascript">
    //http://closure-compiler.appspot.com/home
    // ==ClosureCompiler==
    // @output_file_name gadget.js
    // @compilation_level WHITESPACE_ONLY
    // @code_url http://140.126.57.213/web/js/jquery-1.4.4.min.js
    // @code_url http://140.126.57.213/web/js/jquery.history.js
    // @code_url http://140.126.57.213/web/js/windowSize.js
    // @code_url http://140.126.57.213/web/js/xmlWriter.js
    // @code_url http://140.126.57.213/web/js/xml2json.js
    // @code_url http://140.126.57.213/web/js/parseXml.js
    // @code_url http://140.126.57.213/web/js/dsnsLookup.js
    // @code_url http://140.126.57.213/web/js/dsutil.js
    // @code_url http://140.126.57.213/web/js/log.js
    // @code_url http://140.126.57.213/web/js/authentication.js
    // @code_url http://140.126.57.213/web/js/gadgetPreference.js
    // @code_url http://140.126.57.213/web/js/analytics.js
    // ==/ClosureCompiler==

    function init(config) {
        var urlValues = (function () {
            var vars = [], hash;
            var p = window.location.href.slice(window.location.href.indexOf('?') + 1);
            if (p.indexOf("#") >= 0)
                p = p.substring(0, p.indexOf("#"));
            var hashes = p.split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = decodeURI(hashes[i]);
                var key = hash.substring(0, hash.indexOf("="));
                vars.push(key);
                vars[key] = hash.substring(hash.indexOf("=") + 1);
            }
            return vars;
        })();
        config = config || {};
        application = urlValues.application || config.application || "";
        paramValues = urlValues.paramValues || urlValues.paraValues || config.paramValues || config.paraValues || {};
        requireLogin = (config.requireLogin === undefined ? true : (!!config.requireLogin));
        displayMenu = (config.displayMenu === undefined ? true : (!!config.displayMenu));

        var url = window.location.href.lastIndexOf("?") > 0 ?
            window.location.href.substring(0, window.location.href.lastIndexOf("?")) :
            (window.location.href.lastIndexOf("#") > 0 ? window.location.href.substring(0, window.location.href.lastIndexOf("#")) : window.location.href);
        var finalPage = (url.substring(0, url.lastIndexOf("/")) + "/ischoolauth.htm");
        var loginSpySrc = "http://web.ischool.com.tw/loginSpy.htm?" + "next=" + finalPage;
        var loginFrame = $("<iframe style='border:0px none;position: absolute;top:0px;left:0px;z-index:5000;background-color:white;display:none' src='" + loginSpySrc + "' ></iframe>");
        var logoutFrame = null;
        var menuElement = null;
        var userInfo = {};
        var devTool = $('<div style="overflow: hidden;border:0px none;position: absolute;top:0px;left:0px;z-index:4999;background-color:white;display:none;"><div id="left" style="position: absolute; overflow: auto;"></div><div id="right" style="position: absolute;"><textarea id="txtjsonresult" rows="22" cols="60" style="width: 100%; height: 100%"></textarea></div></div>');
        $(function () {
            devTool.appendTo('body');
            $("<a style='position: absolute;right:5px;top:5px;cursor:pointer;color:red;'>close</a>").click(function () {
                devTool.hide();
            }).appendTo(devTool);

            var ui = $("<ol></ol>");
            var list = log.getRequestLog();
            function addItem(req) {
                $("<li style='cursor:pointer;'>" +
                                    "<b>" + req.title + "</b><br/>" +
                //                                        "<b>Server：</b>" + req.connection.getAccessPoint() +
                                    "</li>")
                .click(function () {

                    var value = ''; //xml2json.show_json_structure(req);
                    var order = { 'service': 'ServiceName', 'body': 'RequestBody', 'response': 'Response' };

                    for (var key in order) {
                        if (req[key]) {
                            value += order[key] + "：" + xml2json.show_json_structure(req[key]) + "\n";
                        }
                    }
                    for (var key in req) {
                        if (order[key] || key == 'title')
                            continue;
                        value += key + "：" + xml2json.show_json_structure(req[key]) + "\n";
                    }

                    $("#txtjsonresult").val(value);
                    $("#left ol li").css("background-color", "");
                    $(this).css("background-color", "yellow");
                    return false;
                })
                .appendTo(ui);
            }
            for (var i = 0; i < list.length; i++) {
                addItem(list[i]);
            }
            log.onRequestLogged(function (list) {
                addItem(list[list.length - 1]);
            });
            ui.appendTo(devTool.find("#left"));

            loginFrame.appendTo('body');
            if (auth.getStatus() != "authorized" && requireLogin)
                loginFrame.show();
        });

        windowSize.onChanged(function (newSize) {
            if (loginFrame) {
                loginFrame.css({
                    height: newSize.height + "px",
                    width: newSize.width + "px"
                });
            }

            var menuWidth = (newSize.width * 0.3) > 300 ? 300 : (newSize.width * 0.3);
            if (devTool) {
                devTool.css({
                    height: newSize.height + "px",
                    width: newSize.width + "px"
                });
                devTool.find("#left").css({
                    top: 0,
                    left: 0,
                    height: newSize.height,
                    width: menuWidth
                });
                devTool.find("#right").css({
                    top: 0,
                    left: $("#left").css("width"),
                    height: newSize.height,
                    width: newSize.width - menuWidth
                });
            }
            if (menuElement) {
                menuElement.css({ width: newSize.width + "px" });
            }
        });
        auth.onStatusChanged(function (newStatus) {
            if (newStatus == "authorized") {
                userInfo = {};
                $(function () {
                    if (loginFrame) {
                        loginFrame.hide();
                    }
                    if (menuElement) {
                        menuElement.remove();
                    }
                });
                var greeningConnection = auth.connectTo("http://web.ischool.com.tw/service/shared/user");
                //                    greeningConnection.ready(function () {
                //                    });
                greeningConnection.send({
                    service: 'DS.Base.GetPassportToken',
                    body: {},
                    autoRetry: true,
                    result: function (resp, errorInfo, XMLHttpRequest) {
                        if (resp) {
                            var validateRequest = {
                                'Header': {
                                    'TargetService': 'DS.Base.Connect',
                                    'SecurityToken': {
                                        '@Type': 'Passport',
                                        'DSAPassport': resp.DSAPassport
                                    }
                                },
                                'Body': {
                                }
                            };
                            userInfo = greeningConnection.getUserInfo();
                            if (userInfo && userInfo.Property) {
                                for (var i = 0; i < userInfo.Property.length; i++) {
                                    userInfo[userInfo.Property[i].Name] = userInfo.Property[i]['@text'];
                                }
                            }
                            if (displayMenu) {
                                $(function () {
                                    menuElement = $("<div style='height:28px;width:100%;margin: 0;left:0; padding: 0;position: absolute;top:0;margin-top:-27px;background-color:white;;font-size:12px;font-family:Helvetica Neue,Arial,Helvetica,'Liberation Sans',FreeSans,sans-serif;' border=\"0\"></div>");
                                    menuElement.hover(
                                                            function () {
                                                                $(this).css("margin-top", "0px");
                                                            },
                                                            function () {
                                                                $(this).css("margin-top", "-27px");
                                                            }
                                                        );
                                    menuElement.appendTo('body');
                                    var table = $("<table style='position: absolute;left:0;top:0;width:100%;padding:8px;' border=\"0\" cellspacing=\"0\" cellpadding=\"0\"></table>");
                                    var tr = $("<tr border='0'></tr>");
                                    var td = $("<td align='left' nowrap='nowrap' border='0' style='text-align:left;vertical-align:text-bottom;'></td>");
                                    $("<a style='padding-left:10px;font-size:12px;' href='javascript:void(0)'>回首頁</a>").appendTo(td);
                                    td.appendTo(tr);
                                    var td2 = $("<td align='right' nowrap='nowrap' border='0' style='text-align:right;vertical-align:text-bottom;font-size:12px;'></td>");
                                    $("<a style='padding-right:10px;font-size:12px;' href='javascript:void(0)'>開發工具</a>").click(function () {
                                        devTool.show();
                                    }).appendTo(td2);
                                    $("<a style='padding-right:10px;font-size:12px;' href='javascript:void(0)'>登出</a>").click(function () {
                                        auth.logout();
                                        return false;
                                    }).appendTo(td2);
                                    td2.appendTo(tr);
                                    table.appendTo(menuElement);
                                    tr.appendTo(table);

                                    greeningConnection.send({
                                        service: 'GetMyDomainInfo',
                                        result: function (resp, errorInfo, XMLHttpRequest) {
                                            if (resp) {
                                                document.title = "ischool web" + ((resp.DomainInfo && resp.DomainInfo.Caption) ? "(" + resp.DomainInfo.Caption + ")" : "");
                                                // $("<span style='width:100%;position: absolute;left:0;top:0;text-align:center;vertical-align:text-bottom;font-weight:bold;font-size:20px;padding-top:7px'>" + resp.DomainInfo.Caption + "</span>").prependTo(menuElement);
                                                if (resp.DomainInfo.DomainName) {
                                                    $("<a style='padding-right:10px;font-size:12px;'>" + (userInfo.FirstName ? (userInfo.FirstName + "(" + userInfo.UserName + ")") : userInfo.UserName) + "</a>").prependTo(td2);
                                                    if (userInfo.LoginType && userInfo.LoginType.replace(/^\s+|\s+$/g, '').toUpperCase() == "GOOGLE") {
                                                        $("<a target='_blank' style='padding-left:10px;font-size:12px;' href='https://mail.google.com/a/" + resp.DomainInfo.DomainName + "/'>郵件</a>").appendTo(td);
                                                        $("<a target='_blank' style='padding-left:10px;font-size:12px;' href='https://www.google.com/calendar/hosted/" + resp.DomainInfo.DomainName + "/'>日曆</a>").appendTo(td);
                                                        $("<a target='_blank' style='padding-left:10px;font-size:12px;' href='https://docs.google.com/a/" + resp.DomainInfo.DomainName + "/'>文件</a>").appendTo(td);
                                                        $("<a target='_blank' style='padding-left:10px;font-size:12px;' href='https://sites.google.com/a/" + resp.DomainInfo.DomainName + "/'>協作平台</a>").appendTo(td);
                                                    }
                                                }
                                            }
                                            else {
                                                $("<a style='padding-right:10px;font-size:12px;'>" + (userInfo.FirstName ? (userInfo.FirstName + "(" + userInfo.UserName + ")") : userInfo.UserName) + "</a>").prependTo(td2);
                                                alert('GetMyDomainInfo Error!!');
                                            }
                                        }
                                    });
                                });
                            }
                            for (var i = 0; i < authStatusChangedCallBack.length; i++) {
                                authStatusChangedCallBack[i](newStatus, userInfo, parseXml.CreateParser().parse(validateRequest, 'Envelope'));
                            }
                        }
                    }
                });
            }
            else {
                $(function () {
                    if (newStatus == "unauthorized") {
                        userInfo = {};
                        if (logoutFrame) {
                            logoutFrame.remove();
                        }
                        logoutFrame = $("<iframe style='display:none' src='" + loginSpySrc + "&action=logout" + "' ></iframe>");
                        logoutFrame.appendTo("body");
                        if (loginFrame) {
                            loginFrame.remove();
                            loginFrame = $("<iframe style='border:0px none;position: absolute;top:0px;left:0px;z-index:5000;background-color:white;display:inline;height:" + windowSize.height + "px;width:" + windowSize.width + "px' src='" + loginSpySrc + "' ></iframe>");
                            loginFrame.appendTo("body");
                        }
                    }
                    if (requireLogin) {
                        $(function () {
                            loginFrame.show();
                        });
                    }
                });
                for (var i = 0; i < authStatusChangedCallBack.length; i++) {
                    authStatusChangedCallBack[i](newStatus, userInfo);
                }
            }
        });

        window.gadget = (function () {
            var sizeChangedCallBack = [];
            var leaveCallBack = [];
            var autoSizeElement = null;
            var autoFit = function (size) {
                if (autoSizeElement) {
                    for (var i = 0; i < autoSizeElement.length; i++) {
                        size = (size ? { width: 0 + size.width, height: 0 + size.height } : { width: 0 + windowSize.width, height: 0 + windowSize.height });
                        var l = autoSizeElement[i].style["margin-left"].replace("px", "");
                        var r = autoSizeElement[i].style["margin-right"].replace("px", "");
                        var t = autoSizeElement[i].style["margin-top"].replace("px", "");
                        var b = autoSizeElement[i].style["margin-bottom"].replace("px", "");
                        l = (l / 1) ? l : "0";
                        r = (r / 1) ? r : "0";
                        t = (t / 1) ? t : "0";
                        b = (b / 1) ? b : "0";
                        size.width = size.width - l - r;
                        size.height = size.height - t - b;
                        if (size.width > 0 && size.height > 0) {
                            $(autoSizeElement[i]).width(size.width);
                            $(autoSizeElement[i]).height(size.height);
                        }
                    }
                }
            }
            sizeChangedCallBack.push(autoFit);
            windowSize.onChanged(function (newSize) {
                for (var i = 0; i < sizeChangedCallBack.length; i++) {
                    sizeChangedCallBack[i](newSize);
                }
            });
            var onBookmarkChangedCallBack = [];
            var currentBookMark = "";
            function loadContent(bookmark) {
                currentBookMark = bookmark;
                for (var i = 0; i < onBookmarkChangedCallBack.length; i++) {
                    onBookmarkChangedCallBack[i](bookmark);
                }
            }
            var $history = $.history;
            $(function () {
                $history.init(loadContent);
                $('body').css({
                    'margin': '0',
                    'background-color': '#FFFFFF'
                });
            });

            //#region 處理window的關閉視窗
            $(function () {
                window.onbeforeunload = function () {
                    var errorStatus = "";
                    for (var i = 0; i < leaveCallBack.length; i++) {
                        var s = "" + leaveCallBack[i]();
                        if (s != "") {
                            return s;
                        }
                    }
                    return;
                }
            });
            //#endregion
            var result = {
                connect: function (accesspoint, account, password) {
                    return auth.connectTo(accesspoint, account, password);
                },
                getContract: function (contractName) {
                    return auth.connectTo(application.replace(/\/$/g, '') + "/" + contractName);
                },
                params: paramValues,
                getSize: function () {
                    return {
                        height: windowSize.height,
                        width: windowSize.width
                    }
                },
                setExterior: function (config) { },
                onSizeChanged: function (callBack) {
                    if (!callBack)
                        return;
                    sizeChangedCallBack.push(callBack);
                    callBack({
                        height: windowSize.height,
                        width: windowSize.width
                    });
                },
                onLeave: function (callBack) {
                    if (!callBack)
                        return;
                    leaveCallBack.push(callBack);
                },
                getPreference: function (callBack) {
                    gadgetPreference.getPreference("devgadget", function (obj) { callBack(obj); });
                },
                setPreference: function (obj) {
                    gadgetPreference.setPreference("devgadget", obj);
                },
                autofit: function (element) {
                    autoSizeElement = (element ? $(element) : null);
                    autoFit();
                },
                onBookmarkChanged: function (callBack) {
                    if (callBack) {
                        onBookmarkChangedCallBack.push(callBack);
                        callBack(currentBookMark);
                    }
                },
                setBookmark: function (bookmark) {
                    if (currentBookMark != bookmark) {
                        $.history.load(bookmark);
                    }
                },
                getGroupGadgets: function () {
                    var groups = [];
                    //                        $(gadget.getGroup()).each(function (index, item) {
                    //                            createGadgetProxy(item.id);
                    groups.push(result);
                    //                        });
                    return groups;
                },
                getLanguage: function () {
                    return "zh-TW";
                },
                onLanguageChanged: function (callBack) {
                    if (callBack && $.isFunction(callBack)) {
                        callBack("zh-TW");
                    }
                },
                backToMenu: function (killstatus) {

                }
            }
            return result;
        }());

        var authStatusChangedCallBack = [];
        var openingWindow = null;
        var controller = {
            logout: function () {
                if (auth.getStatus() == "authorized") {
                    auth.logout();
                }
            },
            login: function (container) {
                if (container) {
                    var loginFrame = $("<iframe style='border:0px none;position: relative;top:0px;left:0px;right:0px;bottom:0px;width:100%;height:100%;background-color:white;' src='" + loginSpySrc + "' ></iframe>")
                    loginFrame.appendTo(container);
                    auth.onStatusChanged(function (newStatus) {
                        if (newStatus == "authorized") {
                            loginFrame.remove();
                        }
                    });
                }
                else {
                    loginFrame.attr("src", loginSpySrc);
                    loginFrame.show();
                }
            },
            popuplogin: function (config) {
                if (config.openid) {
                    analytics.trackAction("CrossSitesAuth(openid=" + config.openid + ")");
                    if (openingWindow && !openingWindow.closed) {
                        //                            openingWindow.location = "http://test.iteacher.tw/gs4/login?reauth=yes&openid=" + encodeURIComponent(config.openid) + "&final=" + finalPage;
                        openingWindow.location = "http://web.ischool.com.tw/login?reauth=yes&openid=" + encodeURIComponent(config.openid) + "&final=" + finalPage;
                        openingWindow.focus();
                    }
                    else {
                        //                            openingWzindow = window.open("http://test.iteacher.tw/gs4/login?reauth=yes&openid=" + encodeURIComponent(config.openid) + "&final=" + finalPage, "foo", "width=900,height=650,location=no,menubar=no,toolbar=no,status=no,directories=no");
                        openingWindow = window.open("http://web.ischool.com.tw/login?reauth=yes&openid=" + encodeURIComponent(config.openid) + "&final=" + finalPage, "foo", "width=900,height=650,location=no,menubar=no,toolbar=no,status=no,directories=no");
                    }
                }
                else {
                    analytics.trackAction("CrossSitesAuth(Hosted Account)");
                    if (openingWindow && !openingWindow.closed) {
                        openingWindow.location = "http://web.ischool.com.tw/authpwd?userid=" + encodeURIComponent(config.userid || "") + "&pwd=" + encodeURIComponent(config.pwd || "") + "&final=" + finalPage;
                        openingWindow.focus();
                    }
                    else {
                        openingWindow = window.open("http://web.ischool.com.tw/authpwd?userid=" + encodeURIComponent(config.userid || "") + "&pwd=" + encodeURIComponent(config.pwd || "") + "&final=" + finalPage, "foo", "width=900,height=650,location=no,menubar=no,toolbar=no,status=no,directories=no");
                    }
                }
            },
            authStatus: function () {
                return auth.getStatus();
            },
            authStatusChanged: function (fn) {
                authStatusChangedCallBack.push(fn);
            },
            getUserInfo: function () {
                return userInfo;
            }
        };
        return controller;
    }
</script>