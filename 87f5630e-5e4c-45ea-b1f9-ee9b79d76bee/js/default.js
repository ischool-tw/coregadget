$(function(){
    $('input:text').hide();
    gadget.onLeave(function() {
        if (!CreditsManager.getSaveStatus()) {
            return '您尚未儲存，確認要離開此網頁嗎?';
        }
        return '';
    });

    $.validator.addMethod("customrule", function(value, element, obj) {
        return obj.myrule(value);
    }, $.validator.format("請輸入正確的值！"));

    // 設定成績驗證規則
    $('form').validate({
        debug: true,
        errorElement: "span", //錯誤時使用元素
        errorClass: "help-inline", //錯誤時使用樣式
        highlight: function(element) {
            // 將未通過驗證的表單元素設置高亮度
            $(element).closest('tr').addClass("error");
        },
        unhighlight: function(element) {
            // 與 highlight 相反
            $(element).closest('tr').removeClass("error");
        },
        errorPlacement: function (error, element) {
            // 錯誤標籤的顯示位置
            error.insertAfter(element);
        },
        rules: {
            balanced: {
                required: true,
                min: 0,
                max: 10,
                customrule: {
                    myrule: function(value) {
                        var correct = ['0','3','6','10'];
                        return ($.inArray(value, correct) === -1) ? false : true;
                    }
                }
            },
            services: {
                required: true,
                min: 0,
                max: 10,
                customrule: {
                    myrule: function(value) {
                        var correct = ['0','2','4','6','8','10','2.5','5','7.5'];
                        value = value.replace('.0', '');
                        return ($.inArray(value, correct) === -1) ? false : true;
                    }
                }
            },
            fitness: {
                required: true,
                min: 0,
                max: 20,
                digits: true,
                customrule: {
                    myrule: function(value) {
                        if (Number(value) < 20) {
                            return (Number(value) % 3 === 0);
                        } else {
                            return true;
                        }
                    }
                }
            },
            competition: {
                required: true,
                min: 0,
                max: 20,
                digits: true,
                customrule: {
                    myrule: function(value) {
                        if (Number(value) < 20) {
                            return (Number(value) % 3 === 0);
                        } else {
                            return true;
                        }
                    }
                }
            },
            verification: {
                required: true,
                min: 0,
                max: 20,
                digits: true
            },
            meritA: {
                customrule: {
                    myrule: function() {
                        var value = $('#merit').text();
                        if (value) {
                            if ($.isNumeric(value)) {
                                if (Number(value) >= 0 || Number(value) <= 20) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                }
            },
            term: {
                required: true,
                min: 0,
                max: 10,
                digits: true,
                customrule: {
                    myrule: function(value) {
                        return Number(value) % 2 === 0;
                    }
                }
            }
        }
    });

    // 按下儲存鈕，驗證成績
    $('a[data-action="save"]').click(function(){
        if (!$(this).hasClass('disabled')) {
            CreditsManager.save();
        }
    });

    // 輸入後變更為尚未儲存的狀態，並偵測是否鍵盤事件，自動跳往上、下輸入框
    $('input:text').keyup(function(e) {
        CreditsManager.setSaveStatus();
        if (e.which === 13 || e.which === 40) {
            // enter:13 ,down:40
            if ($(this).nextAll('input:text').length > 0) {
                $(this).nextAll('input:text:first').select().focus();
            } else {
                $(this).closest('tr').next('tr').find('input:text:first').select().focus();
            }
        } else if (e.which === 38) {
            // up:38
            if ($(this).prevAll('input:text').length > 0) {
                $(this).prevAll('input:text:first').select().focus();
            } else {
                $(this).closest('tr').prev('tr').find('input:text:last').select().focus();
            }
        }
    });

    // 獎勵紀錄即時加總
    $('input:text[id^=merit]').keyup(function(e) {
        var values = [
            {
                x: 5,
                y: $('#meritA').val() || 0
            },
            {
                x: 2,
                y: $('#meritB').val() || 0
            },
            {
                x: 0.3,
                y: $('#meritC').val() || 0
            }
        ];
        var total = 0;
        $(values).each(function(index, item) {
            var x = item.x;
            var y = (/^\d+$/.test(item.y)) ? Number(item.y) : 0;
            total = $.FloatMath($.FloatMath(x,'*', y), '+', total);
        });
        total = (total > 10) ? 10 : total;
        $('#merit').html(total);
    });
});

var CreditsManager = function() {
    var _connection = gadget.getContract('kh.EnrolmentExcess.student');
    var _isOpening = false; // 目前是否為開放期間
    var _saved_status = true; // 變更已儲存

    var main = function() {
        var bSysTime = false;
        var sysTime;
        var bOpening = false;
        var startdate;
        var enddate;

        _isOpening = false;
        _saved_status = true;

        var finish = function() {
            if (bSysTime && bOpening) {
                // 顯示日期及設定是否為開放期間
                if (startdate && enddate) {
                    startdate = new Date(startdate);
                    enddate = new Date(enddate);

                    if (startdate <= sysTime && enddate >= sysTime) {
                        _isOpening = true;
                        $("span[data-type=Opening]").html($.formatDate(startdate, "yyyyMMdd") + " " + $.formatDate(startdate, "HHmm") + " ~ " + $.formatDate(enddate, "yyyyMMdd") + " " + $.formatDate(enddate, "HHmm"));
                    } else {
                        $("span[data-type=Opening]").html("目前未開放");
                    }
                } else {
                    $("span[data-type=Opening]").html("未指定");
                }

                getCredits(showCredits);
            }
        }

        // 取得目前系統時間
        var getSysDateTime = function() {
            _connection.send({
                service: "_.GetNow",
                body: {},
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetNow', error);
                    } else {
                        sysTime = new Date(response.DateTime);
                        bSysTime = true;
                        finish();
                    }
                }
            });
        }();

        // 取得開放時間
        var getOpening = function() {
            _connection.send({
                service: "_.GetOpening",
                body: {},
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetOpening', error);
                    } else {
                        startdate = response.Opening.StartDate || '';
                        enddate = response.Opening.EndDate || '';
                        bOpening = true;
                        finish();
                    }
                }
            });
        }();
    };

    // 取得成績
    var getCredits = function(callBack) {
        _connection.send({
            service: "_.GetCredits",
            body: {},
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetCredits', error);
                } else {
                    var credits = response.Credits;
                    if (callBack && $.isFunction(callBack)) {
                        callBack(credits);
                    }
                }
            }
        });
    };

    // 顯示成績
    var showCredits = function(curr_credits) {
        if (_isOpening) {
            $('div.my-sure').removeClass('hide');
            $('input:text').show();
            $('#balanced').val(curr_credits.Balanced || '0');
            $('#services').val(curr_credits.Services || '0');
            $('#fitness').val(curr_credits.Fitness || '0');
            $('#competition').val(curr_credits.Competition || '0');
            $('#verification').val(curr_credits.Verification || '0');
            $('#merit').html(curr_credits.Merit || '0');
            $('#meritA').val((curr_credits.Detail && curr_credits.Detail.MeritA) ? curr_credits.Detail.MeritA : '0');
            $('#meritB').val((curr_credits.Detail && curr_credits.Detail.MeritB) ? curr_credits.Detail.MeritB : '0');
            $('#meritC').val((curr_credits.Detail && curr_credits.Detail.MeritC) ? curr_credits.Detail.MeritC : '0');
            $('#term').val(curr_credits.Term || '0');
        } else {
            $('#balanced').after(curr_credits.Balanced || '').remove();
            $('#services').after(curr_credits.Services || '').remove();
            $('#fitness').after(curr_credits.Fitness || '').remove();
            $('#competition').after(curr_credits.Competition || '').remove();
            $('#verification').after(curr_credits.Verification || '').remove();
            $('#merit').closest('td').html(curr_credits.Merit || '');
            $('#term').after(curr_credits.Term || '').remove();
        }
    };

    // 儲存成績
    var saveCredits = function() {
        $('#mainMsg').html('');
        $('a[data-action="save"]').text("儲存中...").addClass("disabled");
        _connection.send({
            service: "_.UpdateCredits",
            body: {
                Request: {
                    Credits: {
                        Balanced: $('#balanced').val() || '',
                        Competition: $('#competition').val() || '',
                        Fitness: $('#fitness').val() || '',
                        Merit: $('#merit').text() || '',
                        Services: $('#services').val() || '',
                        Term: $('#term').val() || '',
                        Verification: $('#verification').val() || '',
                        Condition: $('#condition').val() || '',
                        Detail: {
                            MeritA: $('#meritA').val() || '',
                            MeritB: $('#meritB').val() || '',
                            MeritC: $('#meritC').val() || ''
                        }
                    }
                }
            },
            result: function (response, error, http) {
                if (error !== null) {
                    $('a[data-action="save"]').text("儲存").removeClass("disabled");
                    set_error_message('#mainMsg', 'UpdateCredits', error);
                } else {
                    _saved_status = true;
                    $('a[data-action="save"]').text("儲存").removeClass("disabled");
                    $('body').scrollTop(0);
                    $('#mainMsg').html('<div class="alert alert-success">\n  儲存成功！\n</div>');
                    setTimeout("$('#mainMsg').html('')", 1500);
                }
            }
        });
    };

    // 錯誤訊息
    var set_error_message = function(select_str, serviceName, error) {
        if (serviceName) {
            var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            if (error !== null) {
                if (error.dsaError) {
                    if (error.dsaError.status === "504") {
                        switch (error.dsaError.message) {
                            case '502':
                                tmp_msg = '<strong>很抱歉，目前尚未開放！</strong>';
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
        $('body').scrollTop(0);
    };

    // 初始化
    main();

    return {
        save: function() {
            if ($('form').valid()) {
                saveCredits();
            }
        },
        getSaveStatus: function() {
            return _saved_status;
        },
        setSaveStatus: function() {
            _saved_status = false;
        }
    }
}();
