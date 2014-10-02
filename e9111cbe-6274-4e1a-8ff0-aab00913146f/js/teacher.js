jQuery(function () {

    gadget.onLanguageChanged(function(lang){
     if(lang=="zh-CN"){
      $("body").attr("lang","zh-CN");
  } else if (lang=="en-US"){
      $("body").attr("lang","en-US");
  } else{
      $("body").attr("lang","zh-TW");
  }
});

    $('[js="myModal"]').each(function(index, target){
        target = $(target);

        // 錯誤訊息
        var set_error_message = function(element, serviceName, error) {
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

                                // 2014/10/1 實驗中學英文語系(黃耀明)。
                                if($("body").attr("lang")=="en-US"){
                                    var errMsg = error.dsaError.message;

                                    if(errMsg == '教師代碼不正確或是已經被使用過了。'){
                                        tmp_msg = "<strong>Invalid code or the code has been taken.</strong>"
                                    } else if (errMsg == '此代碼已經設定過了。'){
                                        tmp_msg = "<strong>The email address has been connected with this student.</strong>"
                                    }
                                }
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
            if (code) {
                var public_connection = public_connection || gadget.getContract("auth.guest");
                public_connection.send({
                    service: "Join.AsTeacher",
                    body: {
                        Request: {
                            TeacherCode: code
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            set_error_message(target.find('[js="errorMessage"]'), 'Join.AsTeacher', error);
                            target.find('[js="save-data"]').attr("multi-lang-text", "送出").removeClass("disabled");
                        } else {
                            window.parent.appsLoader.reflashApplicationList();
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
            if (target.find('[js="inputCode"]').val()) {
                $(this).attr("multi-lang-text", "送出中").addClass("disabled");
                setAccount();
            } else {
                target.find('[js="inputCode"]').focus().addClass('error');
                //set_error_message(target.find('[js="errorMessage"]'), '','請輸入代碼');
                set_error_message(target.find('[js="errorMessage"]'), '','Please enter the code.');
            }
        });
    });

});
