var _gg = _gg || {};

jQuery(function () {
    // TODO: 點選取消鈕退出小工具
    $('#exit-gadget').bind('click', function() {
        gadget.backToMenu(true); //顯示主選單
    });

    // TODO: 出現 code 的強制視窗
    $('#myModal').modal({
        keyboard : false,
        show     : true
    })

    // TODO: 預設輸入代碼為focus
    $('#inputCode').focus();

    // TODO: 代碼確認
    $('#save-data').bind('click', function() {
        if($(this).hasClass("disabled"))return;
        $('#errorMessage').html('');
        if ($('#inputCode').val() && $('#relationship').val() && $('#relationship').val() !="請選擇") {
            $(this).attr("multi-lang-text", "送出中").addClass("disabled");
            _gg.setAccount();
        } else {
            $('#inputCode').focus().addClass('error');
            if (!($('#inputCode').val())) {
                $('#errorMessage').html("<div class='alert alert-error' multi-lang-text='請輸入代碼'>\n  <button class='close' data-dismiss='alert'>×</button></div>");
            } else {
                $('#errorMessage').html("<div class='alert alert-error' multi-lang-text='請選擇稱謂'>\n  <button class='close' data-dismiss='alert'>×</button></div>");
            }
        }
    });
});

// TODO: 建立帳號關連
_gg.setAccount = function() {
    var code = $('#inputCode').val();
    var relationship = $('#relationship').val();
    if (code && relationship) {
        var public_connection = public_connection || gadget.getContract("auth.guest");
        public_connection.send({
            service: "Join.AsParent",
            body: {
                Request: {
                    ParentCode: code
                    , Relationship: relationship
                }
            },//'<Request><ParentCode>' + code + '</ParentCode><Relationship>' + relationship + '</Relationship></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#errorMessage', 'Join.AsParent', error);
                    $('#save-data').attr("multi-lang-text", "送出").removeClass("disabled");
                } else {
                    _gg.connection = gadget.getContract("campuslite.directory.parent");

                    // TODO: 取得我的基本資料
                    _gg.connection.send({
                        service: "_.GetMyInfo",
                        body: '',
                        result: function (response, error, http) {
                            if (error !== null) {
                                _gg.set_error_message('#mainMsg', 'GetMyInfo', error);
                            } else {
                                _gg.myself = [];
                                if (response.ParentInfo != null) {
                                    $(response.ParentInfo).each(function(index, item) {
                                        _gg.myself = item;
                                    });
                                    if (_gg.myself.ParentName) {
                                        window.parent.appsLoader.reflashApplicationList(); // 重新整理選單
                                    } else {
                                        //$('#save-myself').removeClass('hide');
                                    }
                                }
                            }
                        }
                    });
                    $('#myModal').modal('hide');
                }
            }
        });
    }
};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong multi-lang-text="呼叫服務失敗"></strong>(' + serviceName + ')';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                if (error.dsaError.message) {
                    tmp_msg = '<strong>' + error.dsaError.message + '</strong><br />(' + serviceName + ')';
                }
            }
        }
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
        $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
    }
};