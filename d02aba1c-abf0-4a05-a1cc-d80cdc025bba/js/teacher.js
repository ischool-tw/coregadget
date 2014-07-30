var _gg = _gg || {};

jQuery(function () {
	gadget.onLanguageChanged(function(lang){
		if(lang=="zh-CN"){
			$("body").attr("lang","zh-CN");
		}
		else{
			$("body").attr("lang","zh-TW");
		}
	});
    _gg.updatePhoto();
    $('#edit-Birthdate').datepicker();
    $('#save-myself').addClass('hide');
    $('span.my-trash').click(function() {
        $("#edit-Photo div.my-proimg").attr('photo-base64', '');
        $("#edit-Photo div.my-proimg").css('background-image', 'url(css/images/nophoto.png)');
    });

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
        if ($('#inputCode').val()) {
            //$(this).button("loading");
			$(this).attr("multi-lang-text", "送出中").addClass("disabled");
            _gg.setAccount();
        } else {
            $('#inputCode').focus().addClass('error');
            $('#errorMessage').html("<div class='alert alert-error' multi-lang-text='請輸入代碼'>\n  <button class='close' data-dismiss='alert'>×</button></div>");
        }
    });

    // TODO: 基本資料儲存鈕
    $('#save-myself').click(function() {
		if($(this).hasClass("disabled"))return;
        $('#mainMsg').html('');
        if ($("#profile form").valid()) {
            // TODO: 驗證通過
            //$(this).button("loading");
			$(this).attr("multi-lang-text", "儲存變更中").addClass("disabled");
            _gg.saveMyInfo();
        } else {
            $('#mainMsg').html("<div class='alert alert-error' multi-lang-text='資料驗證失敗'>\n  <button class='close' data-dismiss='alert'>×</button></div>");
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

    // TODO: 個性簽名的 tooltip
    $('#edit-Photo').tooltip();
});

// TODO: 個人基本資料-上傳照片
_gg.updatePhoto = function() {
    // TODO: 處理上傳圖片
    $('#edit-Photo').click(function(evt) {
        $('#mainMsg').html('');
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

        // TODO: 限制檔案大小
        var fileSize = 0; //檔案大小
        var SizeLimit = 1024 * 50;  //上傳上限，單位:byte, 50KB
        if ($.browser.msie) {
            //FOR IE
            var img = new Image();
            img.onload = checkSize;
            img.src = file.value;
            fileSize = this.fileSize;
        }
        else {
            //FOR Firefox,Chrome
            fileSize = file.size;
        }

        if (fileSize > SizeLimit) {
            var _filesize = (fileSize / 1024).toPrecision(4);
            var _limit = (SizeLimit / 1024).toPrecision();
            var msg = "<span multi-lang-text='圖片過大'>" + _filesize + "</span>"
            $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + msg + "\n</div>");
            return;
        }

        if (!(file.type == "image/png" || file.type == "image/jpeg")) {
            $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button><span multi-lang-text='圖片格式錯誤'></span></div>");
            return;
        }

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
        request.push('<TeacherName>' + teachername + '</TeacherName>');

        _gg.connection.send({
            service: "_.SetMyInfo",
            body: '<Request><Profile><Field>' + request.join('') + '</Field></Profile></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    //$("#save-myself").button("reset");
					$("#save-myself").attr("multi-lang-text", "儲存變更").removeClass("disabled");
                    _gg.set_error_message('#mainMsg', 'SetMyInfo', error);
                } else {
                    window.parent.appsLoader.reflashApplicationList(); //重新整理選單
                }
            }
        });
    } else {
        //$("#save-myself").button("reset");
		$("#save-myself").attr("multi-lang-text", "儲存變更").removeClass("disabled");
        $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button><span multi-lang-text='姓名為必填值'></span></div>");
    }
};


// TODO: 建立帳號關連
_gg.setAccount = function() {
    var code = $('#inputCode').val();
    if (code) {
        var public_connection = public_connection || gadget.getContract("auth.guest");
        public_connection.send({
            service: "Join.AsTeacher",
            body: '<Request><TeacherCode>' + code + '</TeacherCode></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#errorMessage', 'Join.AsTeacher', error);
                    //$('#save-data').button("reset");
					$('#save-data').attr("multi-lang-text", "送出").removeClass("disabled");
                } else {
                    _gg.connection = gadget.getContract("campuslite.directory.teacher");

                    // TODO: 取得我的基本資料
                    _gg.connection.send({
                        service: "_.GetMyInfo",
                        body: '',
                        result: function (response, error, http) {
                            if (error !== null) {
                                _gg.set_error_message('#mainMsg', 'GetMyInfo', error);
                            } else {
                                _gg.myself = [];
                                if (response.TeacherInfo != null) {
                                    $(response.TeacherInfo).each(function(index, item) {
                                        _gg.myself = item;
                                    });
                                    if (_gg.myself.ProfileID) {
                                        window.parent.appsLoader.reflashApplicationList();
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