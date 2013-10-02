ParentManager.Util = function() {
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
    var mySetErrorMessage = function(element, serviceName, error) {
        if (serviceName) {
            var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗</strong>(' + serviceName + ')';
            if (error !== null) {
                if (error.dsaError) {
                    if (error.dsaError.status === "504") {
                        switch (error.dsaError.message) {
                            case '501':
                                tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                                break;
                            default:
                                tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
                                tmp_msg = tmp_msg.replace('StudentId', '系統編號');
                                tmp_msg = tmp_msg.replace('RelationId', '家長系統編號');
                                tmp_msg = tmp_msg.replace('ParentCode', '家長代碼');
                        }
                    } else if (error.dsaError.message) {
                        tmp_msg = error.dsaError.message;
                    }
                } else if (error.loginError.message) {
                    tmp_msg = error.loginError.message;
                } else if (error.message) {
                    tmp_msg = error.message;
                }
                element.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
                element.find('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
            }
        } else {
            element.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
        }
        if (element.attr('id') === 'mainMsg') { $('body').scrollTop(0); }
    };

    return {
        handle_array : function(obj) {
            return myHandleArray(obj);
        },
        msg : function(select_str, serviceName, error) {
            return mySetErrorMessage(select_str, serviceName, error)
        }
    }
}();