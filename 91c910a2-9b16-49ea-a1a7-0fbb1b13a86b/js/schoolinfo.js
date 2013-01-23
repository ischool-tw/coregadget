var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.CampusLite.staff");
_gg.schoolinfo = {};

jQuery(function () {
    $('#cancel').click(function() {
        // $('#edit-Code').val(_gg.schoolinfo.Code);
        $('#edit-ChineseName').val(_gg.schoolinfo.ChineseName);
        $('#edit-EnglishName').val(_gg.schoolinfo.EnglishName);
        $('#edit-Address').val(_gg.schoolinfo.Address);
        $('#edit-EnglishAddress').val(_gg.schoolinfo.EnglishAddress);
        $('#edit-Fax').val(_gg.schoolinfo.Fax);
        $('#edit-Telephone').val(_gg.schoolinfo.Telephone);
        $('#edit-ChancellorChineseName').val(_gg.schoolinfo.ChancellorChineseName)
            .attr('TeacherID', _gg.schoolinfo.TeacherID || '')
            .attr('TeacherName', _gg.schoolinfo.TeacherName || '')
            .attr('Nickname', _gg.schoolinfo.Nickname ||'');
        $('#edit-ChancellorEnglishName').val(_gg.schoolinfo.ChancellorEnglishName);
        $('#edit-EduDirectorName').val(_gg.schoolinfo.EduDirectorName);
        $('#edit-StuDirectorName').val(_gg.schoolinfo.StuDirectorName);
        $('#edit-DefaultSchoolYear').val(_gg.schoolinfo.DefaultSchoolYear);
        $('#edit-DefaultSemester').val(_gg.schoolinfo.DefaultSemester);
    });

    $("#save-data").click(function () {
        var err_msg = $('#mainMsg');
        err_msg.html('');
        if ($("#myform").valid()) {
            // TODO: 驗證通過
            $(this).button("loading");
            _gg.saveSchoolInfo();
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
        service: "schoolInformation.GetSchoolInfo",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetSchoolInfo', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.SchoolInfo : void 0) != null) {
                    $(response.Response.SchoolInfo).each(function(index, item) {
                        if (item.Name === '學校資訊') {
                            var _refa;
                            if (((_refa = item.Content) != null ? _refa.SchoolInformation : void 0) != null) {
                                $(item.Content.SchoolInformation).each(function() {
                                    $('#edit-ChineseName').val(this.ChineseName || '');
                                    $('#edit-EnglishName').val(this.EnglishName || '');
                                    $('#edit-Address').val(this.Address || '');
                                    $('#edit-EnglishAddress').val(this.EnglishAddress || '');
                                    // $('#edit-Code').val(this.Code || '');
                                    $('#edit-Fax').val(this.Fax || '');
                                    $('#edit-Telephone').val(this.Telephone || '');
                                    // $('#edit-ChancellorChineseName').val(this.ChancellorChineseName || '');
                                    $('#edit-ChancellorEnglishName').val(this.ChancellorEnglishName || '');
                                    $('#edit-EduDirectorName').val(this.EduDirectorName || '');
                                    $('#edit-StuDirectorName').val(this.StuDirectorName || '');

                                    // _gg.schoolinfo.Code = (this.Code || '');
                                    _gg.schoolinfo.ChineseName = (this.ChineseName || '');
                                    _gg.schoolinfo.EnglishName = (this.EnglishName || '');
                                    _gg.schoolinfo.Address = (this.Address || '');
                                    _gg.schoolinfo.EnglishAddress = (this.EnglishAddress || '');
                                    _gg.schoolinfo.Fax = (this.Fax || '');
                                    _gg.schoolinfo.Telephone = (this.Telephone || '');
                                    // _gg.schoolinfo.ChancellorChineseName = (this.ChancellorChineseName || '');
                                    _gg.schoolinfo.ChancellorEnglishName = (this.ChancellorEnglishName || '');
                                    _gg.schoolinfo.EduDirectorName = (this.EduDirectorName || '');
                                    _gg.schoolinfo.StuDirectorName = (this.StuDirectorName || '');
                                });
                            }
                        }
                        if (item.Name === '系統設定') {
                            var _refa;
                            if (((_refa = item.Content) != null ? _refa.SystemConfig : void 0) != null) {
                                $(item.Content.SystemConfig).each(function() {
                                    $('#edit-DefaultSchoolYear').val(this.DefaultSchoolYear || '');
                                    $('#edit-DefaultSemester').val(this.DefaultSemester || '');

                                    _gg.schoolinfo.DefaultSchoolYear = (this.DefaultSchoolYear || '');
                                    _gg.schoolinfo.DefaultSemester = (this.DefaultSemester || '');
                                });
                            }
                        }
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
                            _gg.schoolinfo.TeacherID = (item.TeacherID || '');
                            _gg.schoolinfo.TeacherName = (item.TeacherName || '');
                            _gg.schoolinfo.Nickname = (item.Nickname ||'');
                            _gg.schoolinfo.ChancellorChineseName = (tname);

                            $('#edit-ChancellorChineseName')
                                .val(tname)
                                .attr('TeacherID', item.TeacherID || '')
                                .attr('TeacherName', item.TeacherName || '')
                                .attr('Nickname', item.Nickname ||'');
                        }
                    });

                    // TODO: 校長自動選單
                    $('#edit-ChancellorChineseName').autocomplete({
                        source: items
                    });
                }
            }
        }
    });


});

_gg.saveSchoolInfo = function() {
    var request = [], teacherID = '', teacherName = '', nickname = '', tname = '';

    if ($('#edit-ChancellorChineseName').val()) {
        teacherID = $('#edit-ChancellorChineseName').attr('TeacherID') || '';
        teacherName = $('#edit-ChancellorChineseName').attr('TeacherName') || '';
        nickname = $('#edit-ChancellorChineseName').attr('Nickname') || '';

        // TODO: 處理姓名
        tname = (teacherName || '');
        if (nickname) {
            tname += '(' + nickname + ')';
        }
    }

    request.push(
        '<SchoolInfo>' +
        '    <Field>' +
        '        <Content>' +
        '            <SystemConfig>' +
        '                <DefaultSchoolYear>' + ($('#edit-DefaultSchoolYear').val() || '100') + '</DefaultSchoolYear>' +
        '                <DefaultSemester>' + ($('#edit-DefaultSemester').val() || '1') + '</DefaultSemester>' +
        '            </SystemConfig>' +
        '        </Content>' +
        '    </Field>' +
        '    <Condition>' +
        '        <Name>系統設定</Name>' +
        '    </Condition>' +
        '</SchoolInfo>'
    );

    // '           <Code>' + ($('#edit-Code').val() || '') + '</Code>' +
    request.push(
        '<SchoolInfo>' +
        '    <Field>' +
        '        <Content>' +
        '          <SchoolInformation>' +
        '           <ChineseName>' + ($('#edit-ChineseName').val() || '') + '</ChineseName>' +
        '           <EnglishName>' + ($('#edit-EnglishName').val() || '') + '</EnglishName>' +
        '           <Address>' + ($('#edit-Address').val() || '') + '</Address>' +
        '           <EnglishAddress>' + ($('#edit-EnglishAddress').val() || '') + '</EnglishAddress>' +
        '           <Fax>' + ($('#edit-Fax').val() || '') + '</Fax>' +
        '           <Telephone>' + ($('#edit-Telephone').val() || '') + '</Telephone>' +
        '           <ChancellorChineseName>' + teacherName + '</ChancellorChineseName>' +
        '           <ChancellorEnglishName>' + ($('#edit-ChancellorEnglishName').val() || '') + '</ChancellorEnglishName>' +
        '           <EduDirectorName>' + ($('#edit-EduDirectorName').val() || '') + '</EduDirectorName>' +
        '           <StuDirectorName>' + ($('#edit-StuDirectorName').val() || '') + '</StuDirectorName>' +
        '          </SchoolInformation>' +
        '        </Content>' +
        '    </Field>' +
        '    <Condition>' +
        '        <Name>學校資訊</Name>' +
        '    </Condition>' +
        '</SchoolInfo>'
    );

    var save_info;

    if (teacherID) {
        _gg.connection.send({
            service: "schoolInformation.SetPrincipal",
            body: '<Request><Principal><TeacherID>' + teacherID + '</TeacherID><TagID>' + (_gg.tagID || '') + '</TagID></Principal></Request>',

            result: function (response, error, http) {
                if (error !== null) {
                    $("#save-data").button("reset");
                    _gg.set_error_message('#mainMsg', 'SetPrincipal', error);
                } else {
                    save_info();
                }
            }
        });
    } else {
        _gg.connection.send({
            service: "schoolInformation.DelPrincipal",
            body: '<Request><TagTeacher><Condition><TagID></TagID></Condition></TagTeacher></Request>',

            result: function (response, error, http) {
                if (error !== null) {
                    $("#save-data").button("reset");
                    _gg.set_error_message('#mainMsg', 'DelPrincipal', error);
                } else {
                    save_info();
                }
            }
        });
    }

    save_info = function() {
        _gg.connection.send({
            service: "schoolInformation.SetSchoolInfo",
            body: '<Request>' + request.join('') + '</Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'SetSchoolInfo', error);
                    $("#save-data").button("reset");
                } else {
                    $("#save-data").button("reset");
                    $('#mainMsg').html("<div class='alert alert-success'>\n  儲存成功！\n</div>");
                    setTimeout("$('#mainMsg').html('')", 1500);

                    _gg.schoolinfo = {
                        // Code                  : ($('#edit-Code').val() || ''),
                        ChineseName           : ($('#edit-ChineseName').val() || ''),
                        EnglishName           : ($('#edit-EnglishName').val() || ''),
                        Address               : ($('#edit-Address').val() || ''),
                        EnglishAddress        : ($('#edit-EnglishAddress').val() || ''),
                        Fax                   : ($('#edit-Fax').val() || ''),
                        Telephone             : ($('#edit-Telephone').val() || ''),
                        ChancellorChineseName : tname,
                        ChancellorEnglishName : ($('#edit-ChancellorEnglishName').val() || ''),
                        EduDirectorName       : ($('#edit-EduDirectorName').val() || ''),
                        StuDirectorName       : ($('#edit-StuDirectorName').val() || ''),
                        DefaultSchoolYear     : ($('#edit-DefaultSchoolYear').val() || '100'),
                        DefaultSemester       : ($('#edit-DefaultSemester').val() || '1'),
                        TeacherID             : (teacherID || ''),
                        TeacherName           : (teacherName || ''),
                        Nickname              : (nickname ||'')
                    };
                }
            }
        });
    };

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
                    $('#edit-ChancellorChineseName')
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
        $('#edit-ChancellorChineseName')
            .attr('TeacherID', '')
            .attr('TeacherName', '')
            .attr('Nickname', '');
        return true;
    }
}, "無此教師");