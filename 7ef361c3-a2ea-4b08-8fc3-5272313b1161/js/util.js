StudentManager.Util = function() {
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
                            case '501':
                                tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                                break;
                            default:
                                tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
                                tmp_msg = tmp_msg.replace('StudentId', '系統編號');
                                tmp_msg = tmp_msg.replace('StudentName', '姓名');
                                tmp_msg = tmp_msg.replace('StudentNumber', '學號');
                                tmp_msg = tmp_msg.replace('SeatNo', '座號');
                                tmp_msg = tmp_msg.replace('StudentStatus', '狀態');
                                tmp_msg = tmp_msg.replace('Gender', '性別');
                                tmp_msg = tmp_msg.replace('LinkAccount', '帳號');
                                tmp_msg = tmp_msg.replace('ClassId', '班級');
                                tmp_msg = tmp_msg.replace('StudentCode', '學生代碼');
                                tmp_msg = tmp_msg.replace('ParentCode', '家長代碼');

                                tmp_msg = tmp_msg.replace('RelationId', '家長系統編號');
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

    var _compareBasic = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛",
    "忠", "孝", "仁", "愛", "信", "義", "和", "平",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

    var myComparer = function(s1, s2) {
        var ComparerWithKeys;

        ComparerWithKeys = null;
        ComparerWithKeys = function(s1, s2) {
            var b1, b2, i, index, key, maxLength;

            b1 = null;
            b2 = null;
            i = null;
            index = null;
            key = null;
            maxLength = null;
            if (s1 === s2) {
                return 0;
            }
            if (s1.length === 0) {
            return 1;
            }
            if (s2.length === 0) {
                return -1;
            }
            maxLength = (s1.length > s2.length ? s2.length : s1.length);
            i = 0;
            while (i < maxLength) {
                for (index in _compareBasic) {
                    b1 = false;
                    b2 = false;
                    key = _compareBasic[index];
                    b1 = (s1.indexOf(key) === 0 ? true : false);
                    b2 = (s2.indexOf(key) === 0 ? true : false);
                    if (b1 && !b2) {
                        return -1;
                    }
                    if (b2 && !b1) {
                        return 1;
                    }
                }
                if (s1.substring(0, 1) === s2.substring(0, 1)) {
                    s1 = s1.substring(1, s1.length);
                    s2 = s2.substring(1, s2.length);
                } else {
                    return (s1.substring(0, 1) < s2.substring(0, 1) ? -1 : 1);
                }
                i++;
            }
            if (s1 === s2) {
                return 0;
            }
            if (!s1) {
                return -1;
            }
            if (!s2) {
                return 1;
            }
            return ComparerWithKeys(s1, s2);
        };
        return ComparerWithKeys(s1.ClassName, s2.ClassName);
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
        },
        comparer: function(a, b) {
            return myComparer(a, b);
        }
    }
}();

// 驗證班級
jQuery.validator.addMethod("ClassName", function(value, element) {
    if (value) {
        if (StudentManager.classes) {
            var tmp_check = false;
            $(StudentManager.classes).each(function(index, item) {
                if (value === item.ClassName) {
                    $('#edit-ClassName')
                        .attr('ClassId', item.ClassId)
                        .attr('ClassName', item.ClassName)
                    tmp_check = true;
                    return false; // 跳出迴圈
                }
            });
            return tmp_check;
        } else {
            // 無班級時，只允許空值
            if (value === '') {
                return true;
            } else {
                return false;
            }
        }
    } else {
        return true;
    }
}, "無此班級");

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