jQuery(function () {
    gadget.onLanguageChanged(function(lang){
        if(lang=="zh-CN"){
            $("body").attr("lang","zh-CN");
        }
        else{
            $("body").attr("lang","zh-TW");
        }
    });

    $('[js="myModal"]').each(function(index, target){
        target = $(target);

        // 錯誤訊息
        var set_error_message = function(element, serviceName, error) {
            if (serviceName) {
                var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong multi-lang-text="呼叫服務失敗"></strong>(' + serviceName + ')';
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
                    element.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
                    element.find('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
                }
            } else {
                element.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
            }
            if (element.attr('id') === 'mainMsg') { $('body').scrollTop(0); }
        };

        // 建立帳號關連
        var setAccount = function() {
            var code = target.find('[js="inputCode"]').val();
            var relationship = target.find('[js="relationship"]').val();
            if (code && relationship) {
                var public_connection = public_connection || gadget.getContract("auth.guest");
                var parent_connection = gadget.getContract("cloud.parent");
                public_connection.send({
                    service: "Join.AsParent",
                    body: {
                        Request: {
                            ParentCode: code,
                            Relationship: relationship
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            set_error_message(target.find('[js="errorMessage"]'), 'Join.AsParent', error);
                            target.find('[js="save-data"]').attr("multi-lang-text", "送出").removeClass("disabled");
                        } else {
                            public_connection.ready(function(){
                                // var account = public_connection.getUserInfo().UserName;
                                $.ajax({
                                    // url: 'https://auth.ischool.com.tw/service/getaccountinfo.php?account='+ encodeURIComponent(account),
                                    url: 'https://auth.ischool.com.tw/service/checkstatus.php',
                                    dataType: 'json',
                                    success: function(data){
                                        if (data && (data.lastName || data.firstName)) {
                                            parent_connection.send({
                                                service: "beta.UpdateMyInfo",
                                                body: {
                                                    LastName: data.lastName || '',
                                                    FirstName: data.firstName || '',
                                                    UUID: data.uuid || ''
                                                },
                                                result: function (response, error, http) {
                                                    if (error !== null) {
                                                        set_error_message(target.find('[js="errorMessage"]'), 'UpdateMyInfo', error);
                                                    } else {
                                                        window.parent.appsLoader.reflashApplicationList(); // 重新整理選單
                                                    }
                                                }
                                            });
                                        } else {
                                            set_error_message(target.find('[js="errorMessage"]'), '', '<strong multi-lang-text="設定帳戶"></strong>');
                                            target.find('[js="save-data"]').attr("multi-lang-text", "送出").removeClass("disabled");
                                        }
                                    }
                                });
                            });
                        }
                    }
                });
            }
        };

        // 點選取消鈕退出小工具
        target.find('[js="exit-gadget"]').bind('click', function() {
            gadget.backToMenu(true); //顯示主選單
        });

        // 預設輸入代碼為focus
        target.find('[js="inputCode"]').focus();

        // 代碼確認
        target.find('[js="save-data"]').bind('click', function() {
            if($(this).hasClass("disabled"))return;
            target.find('[js="errorMessage"]').html('');
            if (target.find('[js="inputCode"]').val() && target.find('[js="relationship"]').val()) {
                $(this).attr("multi-lang-text", "送出中").addClass("disabled");
                setAccount();
            } else {
                target.find('[js="inputCode"]').focus().addClass('error');
                if (!target.find('[js="inputCode"]').val() && !target.find('[js="relationship"]').val()) {
                    set_error_message(target.find('[js="errorMessage"]'), '', '請輸入代碼、稱謂');
                } else if (!(target.find('[js="inputCode"]').val())) {
                    set_error_message(target.find('[js="errorMessage"]'), '', '請輸入代碼');
                } else {
                    set_error_message(target.find('[js="errorMessage"]'), '', '請輸入稱謂');
                }
            }
        });
    });
});

