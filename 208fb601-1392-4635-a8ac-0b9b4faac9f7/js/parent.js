var _gg = _gg || {};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                if (error.dsaError.message) {
                    tmp_msg = '<strong>' + error.dsaError.message + '</strong><br />(' + serviceName + ')';
                } else {
                    tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
                }
            } else {
                tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            }
        } else {
            tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
        }
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
    }
};

jQuery(function () {
    _gg.updatePhoto();
    $('#edit-Birthdate').datepicker();
    $('#save-myself').addClass('hide');

    // TODO: 出現 code 的強制視窗
    $('#myModal').modal({
      keyboard : false,
      show     : true
    })

    // TODO: 預設輸入代碼為focus
    $('#inputCode').focus();

    // TODO: 代碼確認
    $('#save-data').bind('click', function() {
        $('#errorMessage').html('');
        if ($('#inputCode').val() && $('#relationship').val()) {
            $(this).button("loading");
            _gg.setAccount();
        } else {
            $('#inputCode').focus().addClass('error');
            if (!($('#inputCode').val())) {
                $('#errorMessage').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  請輸入代碼！\n</div>");
            } else {
                $('#errorMessage').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  請輸入親子關係！\n</div>");
            }
        }
    });

    // TODO: 基本資料儲存鈕
    $('#save-myself').click(function() {
        $('#mainMsg').html('');
        if ($("#profile form").valid()) {
            // TODO: 驗證通過
            $(this).button("loading");
            _gg.saveMyInfo();
        } else {
            $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  資料驗證失敗，請重新檢查！\n</div>");
        }
    });

    // TODO: 基本資料取消鈕
    $('#cancel-myself').click(function() {
        $('#profile').find('input:text, textarea').val('')
            .end().find('#edit-Photo').html('<div class="my-proimg" style="background-image:url(css/images/nophoto.png);"></div>');
    });

    $.datepicker.setDefaults({
        dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"]
        ,monthNames: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
        ,dateFormat: "yy/mm/dd"
    });


    // TODO: 驗證設定
    $.validator.setDefaults({
        debug: false, // 為 true 時不會 submit
        errorElement: "span", //錯誤時使用元素
        errorClass: "help-inline", //錯誤時使用樣式
        highlight: function(element) {
            // 將未通過驗證的表單元素設置高亮度
            $(element).parentsUntil('.control-group').parent().addClass("error");
        },
        unhighlight: function(element) {
            // 與 highlight 相反
            $(element).parentsUntil('.control-group').parent().removeClass("error");
        },
        errorPlacement: function (error, element) {
            // 錯誤標籤的顯示位置
            error.insertAfter(element);
        }
    });
});

// TODO: 個人基本資料-上傳照片
_gg.updatePhoto = function() {
    // TODO: 處理上傳圖片
    $('#edit-Photo').click(function(evt){
        $('#files').val('').trigger('click');
    });
    $('#files').change(function(evt) {
        if (evt.target == undefined ||
        evt.target.files == undefined ||
        evt.target.files.length == 0) {
            alert("您的瀏覽器並未支援讀取檔案功能，請更新您的瀏覽器，謝謝!\n\n建議瀏覽器：Chrome 10+, IE 10+, Firefox 10+");
            return;
        }

        var file = evt.target.files[0];

        if (!(file.type == "image/png" || file.type == "image/jpeg"))
            return;

        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                $("#edit-Photo div.my-proimg").css('background-image', 'url(' + e.target.result + ')');

                var photo_base64 = e.target.result
                .replace("data:image/png;base64,", "")
                .replace("data:image/jpeg;base64,", "");

                $("#edit-Photo div.my-proimg").attr("photo-base64", photo_base64);
            };
        })(file);
        reader.readAsDataURL(file);
    });
};

// TODO: 儲存個人基本資料
_gg.saveMyInfo = function() {
    var teachername = $('#edit-TeacherName').val() || '';
    if (teachername) {
        var photo = $('#edit-Photo div.my-proimg').attr('photo-base64') || '';
        var gender = $('#edit-Gender').val() || '';
        var aboutme = $('#edit-AboutMe').val() || '';
        var birthdate = $('#edit-Birthdate').val() || '';
        var cellphone = $('#edit-CellPhone').val() || '';
        var contactaddress = $('#edit-ContactAddress').val() || '';
        var contactphone = $('#edit-ContactPhone').val() || '';
        var email = $('#edit-Email').val() || '';
        var tagline = $('#edit-Tagline').val() || '';

        var request = [];
        request.push('<AboutMe>' + aboutme + '</AboutMe>');
        request.push('<Birthdate>' + birthdate + '</Birthdate>');
        request.push('<CellPhone>' + cellphone + '</CellPhone>');
        request.push('<ContactAddress>' + contactaddress + '</ContactAddress>');
        request.push('<ContactPhone>' + contactphone + '</ContactPhone>');
        request.push('<Email>' + email + '</Email>');
        request.push('<Gender>' + gender + '</Gender>');
        request.push('<Photo>' + photo + '</Photo>');
        request.push('<Tagline>' + tagline + '</Tagline>');
        request.push('<ParentName>' + teachername + '</ParentName>');

        _gg.connection.send({
            service: "_.SetMyInfo",
            body: '<Request><Profile><Field>' + request.join('') + '</Field></Profile></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    $("#save-myself").button("reset");
                    _gg.set_error_message('#mainMsg', 'SetMyInfo', error);
                } else {
                    window.parent.setTimeout(window.parent.menuRander.show,500);
                    window.parent.displayManager.refreshGadget((function () {
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
                    }()).id);
                }
            }
        });
    } else {
        $("#save-myself").button("reset");
        $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  姓名為必填值！\n</div>");
    }
};


// TODO: 建立帳號關連
_gg.setAccount = function() {
    var code = $('#inputCode').val();
    var relationship = $('#relationship').val();
    if (code && relationship) {
        var public_connection = public_connection || gadget.getContract("auth.guest");
        public_connection.send({
            service: "Join.AsParent",
            body: '<Request><ParentCode>' + code + '</ParentCode><Relationship>' + relationship + '</Relationship></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#errorMessage', 'Join.AsParent', error);
                    $('#save-data').button("reset");
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
                                    if (_gg.myself.ProfileID) {
                                        window.parent.setTimeout(window.parent.menuRander.show,500);
                                        window.parent.displayManager.refreshGadget((function () {
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
                                        }()).id);
                                    } else {
                                        $('#save-myself').removeClass('hide');
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
