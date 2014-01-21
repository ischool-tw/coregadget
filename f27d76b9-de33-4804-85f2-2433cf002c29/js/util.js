ScoreManager.Util = function() {
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
            var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            if (error !== null) {
                if (error.dsaError) {
                    if (error.dsaError.status === "504") {
                        switch (error.dsaError.message) {
                            case '501':
                                tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                                break;
                            default:
                                tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
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
        handle_array : function(obj) {
            return myHandleArray(obj);
        },
        msg : function(select_str, serviceName, error) {
            return mySetErrorMessage(select_str, serviceName, error)
        }
    }
}();


(function($) {
    // 排序
    //ex: s.sort($.by('desc', 'last', $.by('asc', 'first')));
    $.by = function(model, name, minor) {
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


    // 阿拉伯數字 轉 羅馬數字
    $.arabic2roman = function(numeral) {
        //NUMBER & ITS CHAR LENGTH, FROM INPUT TAG
        var l = numeral.length;
        //NUMBER PATTERN FOR VALIDITY
        var num = /^[0-9]+$/;
        //ROMAN NUMERAL PATTERN FOR VALIDITY
        var roman = /^(M{1,4})?(CD|CM|D?C{0,3})?(XL|XC|L?X{0,3})?(IV|IX|V?I{0,3})?$/i;

        //ROMAN/ARABIC CONVERSION TABLE
        r = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM", "M", "MM", "MMM", "MMMM"];
        n = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 4000];



        //IF ROMAN NUMERAL IS VALID, IT'LL CONVERT TO THE NEW SYSTEM
        if (numeral.match(roman)) {
            var converted = 0;
            var numeral = numeral.toUpperCase();
            var group = roman.exec(numeral); //GROUPS THE PATTERN

            //CONVERSION PROCESS
            for (i = 1; i < group.length; i++) {
                for (j = 0; j < r.length; j++) {
                    if (group[i] == r[j]) {
                        converted += n[j];
                    }
                }
            }
        } else {
            if (numeral.match(num)) {
                var converted = '';
                //IF NUMBER < 5000, IT'LL CONVERT TO A ROMAN NUMERAL
                if (numeral > 0 && numeral < 5000) {
                    for (i = 0; i < l; i++) {
                        var digit = numeral[i];
                        var e = (l - 1) - i; //REVERSE THE ORDER FOR EACH DIGIT

                        var place = Math.pow(10, e); //EXPONENT FOR EACH DIGIT
                        var pv = digit * place; //PLACE VALUE TO BE COMPARED WITH THE NUMBER ARRAY

                        //CONVERSION PROCESS
                        for (j = 0; j < n.length; j++) {
                            if (pv == n[j]) {
                                converted += r[j];
                            }
                        }
                    }
                }
            } else {
                converted = 'Invalid number';
            }
        }
        return converted;
    };
})(jQuery);


