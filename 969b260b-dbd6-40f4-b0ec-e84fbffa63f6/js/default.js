jQuery(function () {
    gadget.onLanguageChanged(function(lang){
        if(lang=="zh-CN"){
            $("body").attr("lang","zh-CN");
        }else{
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

        // 點選取消鈕退出小工具
        target.find('[js="exit-gadget"]').bind('click', function() {
            gadget.backToMenu(true); //顯示主選單
        });


        // 1. 取得account
        // 2. 註冊成老師
        var connection = gadget.getContract("cloud.guest");
        target.find('[js="create"]').click(function(){
            var that = $(this);
            if(that.hasClass("disabled"))return;
            target.find('[js="errorMessage"]').html('');
            that.attr("multi-lang-text", "處理中").addClass("disabled");
            // connection.send({
            //     service: "beta.GetAccount",
            //     body: {},
            //     result: function (response, error, http) {
            //         if (error !== null) {
            //             set_error_message(target.find('[js="errorMessage"]'), 'GetAccount', error);
            //             that.attr("multi-lang-text", "註冊成為老師").removeClass("disabled");
            //         } else {
            //             if (account) {
                            $.ajax({
                                // url: 'https://auth.ischool.com.tw/service/getaccountinfo.php?account='+ encodeURIComponent(account),
                                url: 'https://auth.ischool.com.tw/service/checkstatus.php',
                                dataType: 'json',
                                success: function(data){
                                    if (data && (data.lastName || data.firstName)) {
                                        connection.send({
                                            service: "beta.BecomeTeacher",
                                            body: {
                                                TeacherName: (data.lastName || '') + (data.firstName || '')
                                            },
                                            result: function (response, error, http) {
                                                if (error !== null) {
                                                    if (error.dsaError &&
                                                        error.dsaError.header &&
                                                        error.dsaError.header.DSFault &&
                                                        error.dsaError.header.DSFault.Fault) {
                                                        if (error.dsaError.header.DSFault.Fault.Code === '901') {
                                                            target.find('.modal-body').html('<p multi-lang-text="您已具有老師身份"></p>');
                                                        }
                                                    } else {
                                                        set_error_message(target.find('[js="errorMessage"]'), 'BecomeTeacher', error);
                                                        that.attr("multi-lang-text", "註冊成為老師").removeClass("disabled");
                                                    }
                                                } else {
                                                    target.find('.modal-body').html('<p multi-lang-text="您已具有老師身份"></p>');
                                                    window.parent.appsLoader.reflashApplicationList(); // 重新整理選單
                                                }
                                            }
                                        });
                                    } else {
                                        set_error_message(target.find('[js="errorMessage"]'), '', '<strong multi-lang-text="設定帳戶"></strong>');
                                        that.attr("multi-lang-text", "註冊成為老師").removeClass("disabled");
                                    }
                                }
                            });
            //             }
            //         }
            //     }
            // });
        });

    });
});

