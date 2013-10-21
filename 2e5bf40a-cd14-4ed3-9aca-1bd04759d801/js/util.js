DirectoryManager.Util = function() {
    // 轉成陣列
    var myHandleArray = function(obj) {
        var result;

        result = void 0;
        if (!$.isArray(obj)) {
            result = [];
           if (obj) {
              result.push(obj);
            }
        } else {
            result = obj;
        }
        return result;
    };

    // 錯誤訊息
    var mySetErrorMessage = function(select_str, serviceName, error) {
        if (serviceName) {
            var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗</strong>(' + serviceName + ')';
            if (error !== null) {
                if (error.dsaError) {
                    if (error.dsaError.status === "504") {
                        switch (error.dsaError.message) {
                            case '777':
                                if (serviceName === 'ResetParentCode') {
                                    DirectoryManager.resetParentCode();
                                    return false;
                                }
                                if (serviceName === 'resetStudentCode') {
                                    DirectoryManager.resetStudentCode();
                                    return false;
                                }
                                break;
                            case '501':
                                tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                                break;
                            default:
                                tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
                                tmp_msg = tmp_msg.replace('GroupId', '群組系統編號');
                                tmp_msg = tmp_msg.replace('GroupName', '群組名稱');
                                tmp_msg = tmp_msg.replace('GroupCode', '群組代碼');
                                tmp_msg = tmp_msg.replace('StudentId', '系統編號');
                        }
                    } else if (error.dsaError.message) {
                        tmp_msg = error.dsaError.message;
                    }
                } else if (error.loginError.message) {
                    tmp_msg = error.loginError.message;
                } else if (error.message) {
                    tmp_msg = error.message;
                }
                $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
                $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
            }
        } else {
            $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
        }
        if (select_str === '#mainMsg') { $('body').scrollTop(0); }

    };

    return {
        handle_array: function(obj) {
            return myHandleArray(obj);
        },
        msg: function(select_str, serviceName, error) {
            return mySetErrorMessage(select_str, serviceName, error)
        },
        htmlEncode: function(value) {
            return $('<div/>').text(value).html();
        }
    }
}();

// 排序
//ex: s.sort($.by('desc', 'last', $.by('asc', 'first')));
(function($) {
    return $.by = function(model, name, minor) {
        return function(o, p) {
            var a, b;
            if (o && p && typeof o === "object" && typeof p === "object") {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return (typeof minor === "function" ? minor(o, p) : 0);
                }
                if (typeof a === typeof b) {
                    if (parseInt(a, 10) && parseInt(b, 10)) {
                        a = parseInt(a, 10);
                        b = parseInt(b, 10);
                    }
                    if (model === "desc") {
                        return (a > b ? -1 : 1);
                    } else {
                        return (a < b ? -1 : 1);
                    }
                }
                if (typeof a < typeof b) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                throw {
                    name: "Error",
                    message: "Expected an object when sorting by " + name
                };
            }
        };
    };
})(jQuery);