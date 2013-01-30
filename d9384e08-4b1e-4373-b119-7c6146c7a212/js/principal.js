var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.CampusLite.staff");

jQuery(function () {
    $("#save-data").click(function () {
        var err_msg = $('#mainMsg');
        err_msg.html('');
        if ($("#myform").valid()) {
            // TODO: 驗證通過
            $(this).button("loading");
            _gg.savePrincipal();
        } else {
            err_msg.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  資料驗證失敗，請重新檢查！\n</div>");
        }
    });

    // TODO: 驗證設定
    $.validator.setDefaults({
        debug: false, // 為 true 時不會 submit
        errorElement: "span", //錯誤時使用元素
        errorClass: "help-inline", //錯誤時使用樣式
        highlight: function(element) {
            // 將未通過驗證的表單元素設置高亮度
            $(element).parent().addClass("validerror");
        },
        unhighlight: function(element) {
            // 與 highlight 相反
            $(element).parent().removeClass("validerror");
        },
        errorPlacement: function (error, element) {
            // 錯誤標籤的顯示位置
            error.insertAfter(element);
        }
    });
    $('#myform').validate();

    _gg.connection.send({
        service: "schoolInformation.GetPrincipalTagID",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', '.GetPrincipalTagID', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.Tag : void 0) != null) {
                    $(response.Response.Tag).each(function(index, item) {
                        _gg.tagID = item.ID;
                    });
                }
            }
        }
    });

    _gg.connection.send({
        service: "schoolInformation.GetTeacherList",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetTeacherList', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {
                    var items = [];
                    _gg.teachers = [];
                    $(response.Response.Teacher).each(function(index, item) {
                        // TODO: 處理姓名
                        var tname = '';
                        tname = (item.TeacherName || '');
                        if (item.Nickname) {
                            tname += '(' + item.Nickname + ')';
                        }

                        item.tname = tname;

                        items.push(tname);

                        _gg.teachers.push(item);

                        if (item.TagID) {
                            _gg
                        .TeacherID = (item.TeacherID || '');
                            _gg
                        .TeacherName = (item.TeacherName || '');
                            _gg
                        .Nickname = (item.Nickname ||'');
                            _gg
                        .ChancellorChineseName = (tname);

                            $('#edit-Principal')
                                .val(tname)
                                .attr('TeacherID', item.TeacherID || '')
                                .attr('TeacherName', item.TeacherName || '')
                                .attr('Nickname', item.Nickname ||'');
                        }
                    });

                    // TODO: 校長自動選單
                    $('#edit-Principal').autocomplete({
                        source: items
                    });
                }
            }
        }
    });
});

_gg.savePrincipal = function() {
    var request = [], teacherID = '', teacherName = '', nickname = '', tname = '';

    if ($('#edit-Principal').val()) {
        teacherID = $('#edit-Principal').attr('TeacherID') || '';
        teacherName = $('#edit-Principal').attr('TeacherName') || '';
        nickname = $('#edit-Principal').attr('Nickname') || '';

        // TODO: 處理姓名
        tname = (teacherName || '');
        if (nickname) {
            tname += '(' + nickname + ')';
        }
    }

    if (teacherID) {
        if (_gg.tagID) {
            _gg.connection.send({
                service: "schoolInformation.SetPrincipal",
                body: '<Request><Principal><TeacherID>' + teacherID + '</TeacherID><TagID>' + _gg.tagID + '</TagID></Principal></Request>',

                result: function (response, error, http) {
                    if (error !== null) {
                        $("#save-data").button("reset");
                        _gg.set_error_message('#mainMsg', 'SetPrincipal', error);
                    } else {
                        $("#save-data").button("reset");
                        $('#mainMsg').html("<div class='alert alert-success'>\n  儲存成功！\n</div>");
                        setTimeout("$('#mainMsg').html('')", 1500);
                    }
                }
            });
        } else {
            $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  請先建立校長標籤！\n</div>");
        }
    } else {
        _gg.connection.send({
            service: "schoolInformation.DelPrincipal",
            body: '<Request><TagTeacher><Condition><TagID></TagID></Condition></TagTeacher></Request>',

            result: function (response, error, http) {
                if (error !== null) {
                    $("#save-data").button("reset");
                    _gg.set_error_message('#mainMsg', 'DelPrincipal', error);
                } else {
                    $("#save-data").button("reset");
                    $('#mainMsg').html("<div class='alert alert-success'>\n  儲存成功！\n</div>");
                    setTimeout("$('#mainMsg').html('')", 1500);
                }
            }
        });
    }
};



// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i> <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
    if (error !== null) {
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
        $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
    }
};

// TODO: 驗證校長
jQuery.validator.addMethod("TeacherName", function(value, element) {
    if (value) {
        if (_gg.teachers) {
            var tmp_check = false;
            $(_gg.teachers).each(function(index, item) {
                if (value === item.tname) {
                    $('#edit-Principal')
                        .attr('TeacherID', item.TeacherID)
                        .attr('TeacherName', item.TeacherName)
                        .attr('Nickname', item.Nickname);
                    tmp_check = true;
                    return false; // TODO: 跳出迴圈
                }
            });
            return tmp_check;
        } else {
            // TODO: 無教師時，只允許空值
            if (value === '') {
                return true;
            } else {
                return false;
            }
        }
    } else {
        $('#edit-Principal')
            .attr('TeacherID', '')
            .attr('TeacherName', '')
            .attr('Nickname', '');
        return true;
    }
}, "無此教師");