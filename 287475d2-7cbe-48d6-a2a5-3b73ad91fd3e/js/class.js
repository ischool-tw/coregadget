var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.CampusLite.staff");

jQuery(function () {
    // TODO: 載入資料
    _gg.GetTeacherList();
    _gg.GetClassList();

    // TODO: 點選新增
    $('#addclass').click(function() {
        _gg.myclass = { ClassID: '-1'};
    });

    // TODO: 點選刪除
    $('#container-main').on('click', 'a[action-type=del]', function() {
        var classIndex = $(this).attr('classIndex');
        _gg.myclass = _gg.classes[classIndex];
        _gg.myclass.index = classIndex;
    });

    $('#del-data').click(function() {
        _gg.delClass();
    });


    // TODO: 點選班級
    $('#container-main').on('click', 'li a', function() {
        var classIndex = $(this).attr('classIndex');
        _gg.myclass = _gg.classes[classIndex];
    });

    // TODO: 編輯視窗
    $("#editModal").modal({
        show: false
    });
    $("#editModal").on("hidden", function () {
        $("#editModal #errorMessage").html("");
    });
    $("#editModal").on("show", function () {
        // TODO: 清除樣式
        var validator = $("#editModal form").validate();
        validator.resetForm();
        $(this).find('.error').removeClass("error");

        $("#editModal #save-data").button("reset");
        _gg.SetModal();
    });
    $("#editModal #save-data").click(function () {
        var err_msg = $('#errorMessage');
        err_msg.html('');
        if ($("#editModal form").valid()) {
            // TODO: 驗證通過
            $(this).button("loading");
            _gg.saveClassInfo();
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

// TODO: 取得全部班級資訊
_gg.GetClassList = function() {
    _gg.connection.send({
        service: "class.GetClassList",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetClassList)\n</div>");
            } else {
                var _ref, ret = [];
                _gg.classes = [];
                if (((_ref = response.Response) != null ? _ref.Class : void 0) != null) {
                    var gradeyear = '', classdata = [];
                    $(response.Response.Class).each(function(index, item) {
                        _gg.classes[index] = item;
                        _gg.classes[index].index = index;

                        // TODO: 處理外框
                        if (gradeyear !== item.GradeYear && index !== 0) {
                            ret.push(
                                '<div class="row-fluid">' +
                                '    <div class="span12">' +
                                '        <div class="my-widget" data-type="info">' +
                                '            <div class="my-widget-header">' +
                                '                <i class="icon-info-sign"></i>' +
                                '                <h3>' + (gradeyear ? gradeyear : '未分') + '年級</h3>' +
                                '            </div>' +
                                '            <div class="my-widget-content">' +
                                '                <div class="my-classlist">' +
                                '                    <ul>' +
                                classdata.join('') +
                                '                    </ul>' +
                                '                </div>' +
                                '            </div>' +
                                '        </div>' +
                                '    </div>' +
                                '</div>'
                            );

                            classdata = [];
                        }
                        gradeyear = item.GradeYear;

                        // TODO: 處理班導師姓名
                        var tname = '';
                        tname = (item.TeacherName || '');
                        if (item.Nickname) {
                            tname += '(' + item.Nickname + ')';
                        }

                        // TODO: 處理班級內容
                        classdata.push(
                            '<li classIndex="' + index + '">' +
                            '   <a data-toggle="modal" href="#delModal" action-type="del" classIndex="' + index + '"><i class="icon-trash"></i> </a>' +
                            '   <a data-toggle="modal" href="#editModal" classIndex="' + index + '">' +
                            '<span data-type="classname">' + item.ClassName + '</span>' +
                            ' - <span class="my-teacher-name" classIndex="' + index + '">' + tname + '</span>' +
                            '</a></li>'
                        );
                    });

                    // TODO: 處理最後一個年級的外框
                    ret.push(
                        '<div class="row-fluid">' +
                        '    <div class="span12">' +
                        '        <div class="my-widget" data-type="info">' +
                        '            <div class="my-widget-header">' +
                        '                <i class="icon-info-sign"></i>' +
                        '                <h3>' + (gradeyear ? gradeyear : '未分') + '年級</h3>' +
                        '            </div>' +
                        '            <div class="my-widget-content">' +
                        '                <div class="my-classlist">' +
                        '                    <ul>' +
                        classdata.join('') +
                        '                    </ul>' +
                        '                </div>' +
                        '            </div>' +
                        '        </div>' +
                        '    </div>' +
                        '</div>'
                    );
                }
                var items = ret.join('');
                if (items) {
                    $('#container-main').alternateScroll('remove')
                    $('#container-main').html(items);
                    // TODO: scroll bar
                    $('#container-main').alternateScroll();
                } else {
                    $('#container-main').html('目前無資料');
                }

            }
        }
    });
};

_gg.GetTeacherList = function() {
    _gg.connection.send({
        service: "class.GetTeacherList",
        body: '<Request><Condition></Condition></Request>',
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
                        var tmp_data = item;
                        tmp_data.tname = tname;

                        items.push(tname);
                        _gg.teachers.push(tmp_data);
                    });

                    // TODO: 導師自動選單
                    $('#edit-TeacherName').autocomplete({
                        source: items
                    });
                }
            }
        }
    });
};

_gg.SetModal = function() {
    var myclass = _gg.myclass;

    if (myclass.ClassID === '-1') {
        $('#editModal h3').html('新增');
    }

    $('#edit-GradeYear').val(myclass.GradeYear || '');
    $('#edit-ClassName').val(myclass.ClassName || '');

    // TODO: 處理姓名
    var tname = '';
    tname = (myclass.TeacherName || '');
    if (myclass.Nickname) {
        tname += '(' + myclass.Nickname + ')';
    }
    $('#edit-TeacherName').val(tname);
    $('#edit-TeacherName')
        .attr('TeacherID', myclass.TeacherID || '')
        .attr('TeacherName', myclass.TeacherName || '')
        .attr('Nickname', myclass.Nickname ||'');
};

_gg.saveClassInfo = function() {
    var myclass = _gg.myclass;
    var className = $('#edit-ClassName').val() || '';
    var classid = myclass.ClassID;

    if (className && classid) {
        var gradeYear = $('#edit-GradeYear').val() || '';
        var teacherID = '';
        if ($('#edit-TeacherName').val()) {
            teacherID = $('#edit-TeacherName').attr('TeacherID') || '';
        }

        gradeYear = (gradeYear == '') ? '' : parseInt(gradeYear, 10) + '';

        var request = [];
        request.push('<ClassName>' + className + '</ClassName>');
        request.push('<GradeYear>' + gradeYear + '</GradeYear>');
        request.push('<TeacherID>' + teacherID + '</TeacherID>');

        var _service, _body, _txt;
        if (classid === '-1') {
            _service = 'class.AddClass';
            _body ='<Request><Class><Field>' + request.join('') + '</Field></Class></Request>';
            _txt = '新增成功';
        } else {
            _service = 'class.SetClassInfo';
            _body ='<Request><Class><Field>' + request.join('') + '</Field><Condition><ClassID>' + classid + '</ClassID></Condition></Class></Request>';
            _txt = '儲存成功';
        }

        _gg.connection.send({
            service: _service,
            body: _body,
            result: function (response, error, http) {
                if (error !== null) {
                    $("#save-data").button("reset");
                    _gg.set_error_message('#errorMessage', _service, error);
                } else {
                    _gg.GetClassList();
                    $('#editModal').modal('hide');
                    $('#mainMsg').html("<div class='alert alert-success'>\n  " + _txt + "\n</div>");
                    setTimeout("$('#mainMsg').html('')", 1500);
                }
            }
        });
    } else {
        $("#save-data").button("reset");
        var _txt;
        if (className) {
            _txt='班級編號不正確，無法儲存！';
        } else {
            _txt='班級為必填值！';
        }
        $('#errorMessage').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n " + _txt + "\n</div>");
    }
};

// TODO: 刪除班級
_gg.delClass = function() {
    var classid = _gg.myclass.ClassID;
    if (classid) {
        _gg.connection.send({
            service: "class.DelClass",
            body: '<Request><Class><Condition><ClassID>' + classid + '</ClassID></Condition></Class></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'DelClass', error);
                } else {
                    $('#delModal').modal('hide');
                    $('li[classIndex=' + _gg.myclass.index + ']').remove();
                    $('#mainMsg').html("<div class='alert alert-success'>\n  刪除成功！\n</div>");
                    setTimeout("$('#mainMsg').html('')", 1500);
                }
            }
        });
    } else {
        $('#errorMessage').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n 班級編號不正確，無法刪除！ \n</div>");
    }
};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i> <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case '901':
                        tmp_msg = '<strong>班級名稱重複，請改用其他名稱!</strong>';
                        break;
                }
            }
        }
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
        $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
    }
};


// TODO: 驗證班導師
jQuery.validator.addMethod("TeacherName", function(value, element) {
    if (value) {
        if (_gg.teachers) {
            var tmp_check = false;
            $(_gg.teachers).each(function(index, item) {
                if (value === item.tname) {
                    $('#edit-TeacherName')
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
        return true;
    }
}, "無此教師");