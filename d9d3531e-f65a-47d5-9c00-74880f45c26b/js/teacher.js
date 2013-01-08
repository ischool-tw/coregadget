var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.CampusLite.staff");
_gg.model = 'list';

jQuery(function() {
    _gg.GetAllTeacherInfo();

    // TODO: scroll bar
    $('#namelist').alternateScroll();

    $('#model > button').click(function() {
        var tmp_model = $(this).attr('data-type');
        if (tmp_model === 'list') {
            $('dl[rel=tooltip]').tooltip('disable');
        }
        if (_gg.model !== tmp_model) {
            _gg.ClearTeacherInfo();
            $('#namelist').animate(
                {left:-$('#namelist').width() * 2}
                , 500
                , function() {
                    $('#namelist').css({left:0});
                    _gg.model = tmp_model;
                    _gg.GetAllTeacherInfo();
                }
            );
        }
    });

    // TODO: 點選新增
    $('#addteacher').click(function() {
        _gg.ClearTeacherInfo();
        if (_gg.model === 'img') {
            $('#namelist .my-scrollbar2 .my-photo-focus').removeClass('my-photo-focus');
        } else {
            $('#namelist .my-scrollbar2 .action').removeClass('action');
        }
        _gg.teacher = { TeacherID: '0'};
    });

    // TODO: 點選刪除
    $('#del-data').click(function() {
        $(this).button('loading');
        _gg.delTeacher();
    });

    // TODO: 點選教師
    $('#namelist').on('click', '.my-scrollbar2 dl, .my-scrollbar2 tbody tr', function() {
        _gg.ClearTeacherInfo();
        if (_gg.model === 'img') {
            $(this).closest('.my-scrollbar2').find('.my-photo-focus').removeClass('my-photo-focus');
            $(this).addClass('my-photo-focus');
        } else {
            $(this).closest('.my-scrollbar2').find('.action').removeClass('action');
            $(this).addClass('action');
        }
        var teacherIndex = $(this).attr('teacherIndex');
        _gg.teacher = _gg.teachers[teacherIndex];
        _gg.teacher.index = teacherIndex;
        _gg.GetTeacherInfo();
    });

    // TODO: 搜尋
    $("#filter-keyword").keyup(function() {
        _gg.ClearTeacherInfo();
        _gg.ResetTeacherList();
    });

    $("#filter-teacher").click(function() {
        _gg.ClearTeacherInfo();
        _gg.ResetTeacherList();
    });

    // TODO: 編輯視窗
    $("#editModal")
        .modal({
            show: false
        })
        .on("hidden", function() {
            $("#editModal #errorMessage").html("");
        })
        .on("show", function() {
            // TODO: 清除樣式
            var validator = $("#editModal form").validate();
            validator.resetForm();
            $(this).find('.error').removeClass("error");

            $("#editModal #save-data").button("reset");
            _gg.SetModal();
        })
        .on('click', '#save-data', function() {
            var err_msg = $('#errorMessage');
            err_msg.html('');
            if ($("#editModal form").valid()) {
                // TODO: 驗證通過
                $(this).button("loading");
                _gg.saveBaseInfo();
            } else {
                err_msg.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  資料驗證失敗，請重新檢查！\n</div>");
            }
        });

    $('div[rel=tooltip]').tooltip({'trigger':'hover'});

    // TODO: 刪除照片
    $('#del_photo').click(function() {
        $("#preview-Photo").html('<img id="edit-Photo" class="my-photo" src="" photo-base64="">');
        $(this).hide();
    });

    // TODO: 產生代碼
    $('a[action-type=refresh]').click(function() {
        _gg.GetNewCode();
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

// TODO: 取得全部教師資訊
_gg.GetAllTeacherInfo = function() {
    var _body = '<Request><Field><Gender/><ContactPhone/><StLoginName/><TeacherCode/></Field><Condition></Condition></Request>';
    if (_gg.model === 'img') {
        _body = '<Request><Field><Photo/></Field><Condition></Condition></Request>';
    }

    $('#namelist .my-scrollbar2').html('資料載入中...');

    _gg.connection.send({
        service: "teacher.GetTeacherList",
        body: _body,
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetTeacherList', error);
            } else {
                var _ref, ret = [];
                _gg.teachers = [];
                if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {

                    $(response.Response.Teacher).each(function(index, item) {
                        _gg.teachers[index] = item;
                    });
                }

                _gg.ResetTeacherList();
            }
        }
    });
};

_gg.ResetTeacherList = function() {
    $('#namelist .my-scrollbar2').html('');
    var ret = [];
    $(_gg.teachers).each(function(index, item) {
        if (this.TeacherName.indexOf($("#filter-keyword").val()) !== -1) {
                // TODO: 處理姓名
                var tname = '';
                tname = (item.TeacherName || '');
                if (item.Nickname) {
                    tname += '(' + item.Nickname + ')';
                }

                if (_gg.model === 'img') {
                    // TODO: 處理照片
                    var tphoto;
                    tphoto = (item.Photo) ? '<img src="data:image/png;base64,' + item.Photo + '" class="my-list-photo"/>' : '';
                    if (!tphoto) {
                        if (item.Gender === '1') {
                            tphoto = '<img src="img/photo_male.png" class="my-list-photo"/>';
                        } else {
                            tphoto = '<img src="img/photo_female.png" class="my-list-photo"/>';
                        }
                    }

                    ret.push(
                        '<dl teacherIndex="' + index + '" teacherID="' + item.TeacherID + '" rel="tooltip" data-placement="right" data-original-title="' + tname + '">' +
                        '    <dt>' + tphoto + '</dt>' +
                        '    <dd>' + tname + '</dd>' +
                        '</dl>'
                    );
                } else {
                    var tmp_gender = '';
                    if (item.Gender === '1') {
                        tmp_gender = '男';
                    } else if (item.Gender === '0') {
                        tmp_gender = '女';
                    }
                    ret.push(
                        '<tr teacherIndex="' + index + '" teacherID="' + item.TeacherID + '">' +
                        '    <td>' + tname + '</td>' +
                        '    <td>' + tmp_gender + '</td>' +
                        '    <td>' + (item.ContactPhone || '') + '</td>' +
                        '    <td>' + (item.StLoginName || '') + '</td>' +
                        '    <td>' + (item.TeacherCode || '') + '</td>' +
                        '</tr>'
                    );
                }
        }
    });
    var items = ret.join('');
    if (items) {
        if (_gg.model === 'img') {
            $('#namelist .my-scrollbar2').html(items);
            // TODO: 教師全名 Tooltip
            $('dl[rel=tooltip]').tooltip({'trigger':'hover'});

            if (_gg.teacher) {
                if (_gg.teacher.TeacherID) {
                     $('dl[teacherID=' + _gg.teacher.TeacherID + ']').trigger('click');
                }
            }

        } else {
            $('#namelist .my-scrollbar2').html('<table class="table table-condensed table-striped table-bordered">' +
                '<thead>' +
                '<th>姓名</th>' +
                '<th>性別</th>' +
                '<th>電話</th>' +
                '<th>帳號</th>' +
                '<th>代碼</th>' +
                '</thead><tbody>' + items + '</tbody></table>');

            if (_gg.teacher) {
                if (_gg.teacher.TeacherID) {
                     $('tr[teacherID=' + _gg.teacher.TeacherID + ']').trigger('click');
                }
            }

        }
    } else {
        if ($("#filter-keyword").val()) {
            $('#namelist .my-scrollbar2').html('無符合條件的資料');
        } else {
            $('#namelist .my-scrollbar2').html('目前無資料');
        }
    }
};

_gg.ClearTeacherInfo = function() {
    $('.my-widget-header .btn').addClass('hide');
    $('#t-Photo').html('<img src="" class="my-photo"/>');
    $('#t-TeacherName').html('');
    $('#t-Gender').html('');
    $('#t-ContactPhone').html('');
    $('#t-Email').html('');
    $('#t-StLoginName').html('');
    $('#t-Nickname').html('');
    $('#t-TeacherCode').html('');
};

_gg.GetTeacherInfo = function() {
    var teacher = _gg.teacher;

    if (teacher.TeacherID) {
        var _body = '<Request><Field><Gender/><ContactPhone/><StLoginName/><TeacherCode/><Email/><Photo/></Field>' +
                '<Condition><TeacherID>' + teacher.TeacherID + '</TeacherID></Condition></Request>';
        _gg.connection.send({
            service: "teacher.GetTeacherList",
            body: _body,
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetTeacherList', error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {
                        $(response.Response.Teacher).each(function(index, item) {
                            item.index = _gg.teacher.index;
                            _gg.teacher = item;

                            // TODO: 處理照片
                            var photo;
                            photo = (item.Photo) ? '<img src="data:image/png;base64,' + item.Photo + '" class="my-photo"/>' : '';
                            if (!photo) {
                                if (item.Gender === '1') {
                                    photo = '<img src="img/photo_male.png" class="my-photo"/>';
                                } else {
                                    photo = '<img src="img/photo_female.png" class="my-photo"/>';
                                }
                            }

                            var tmp_gender = '';
                            if (item.Gender === '1') {
                                tmp_gender = '男';
                            } else if (item.Gender === '0') {
                                tmp_gender = '女';
                            }

                            $('#t-Photo').html(photo);
                            $('#t-TeacherName').html(item.TeacherName || '');
                            $('#t-Gender').html(tmp_gender);
                            $('#t-ContactPhone').html(item.ContactPhone || '');
                            $('#t-Email').html(item.Email || '');
                            $('#t-StLoginName').html(item.StLoginName || '');
                            $('#t-Nickname').html(item.Nickname || '');
                            $('#t-TeacherCode').html(item.TeacherCode || '');

                            $('.my-widget-header .btn').removeClass('hide');
                        });
                    }
                }
            }
        });
    } else {
        $('.my-widget-header .btn').addClass('hide');
    }
};

_gg.SetModal = function() {
    $('#files').val('');

    var teacher = _gg.teacher;
    if (teacher.TeacherID) {
        if (teacher.TeacherID === '0') {
            $('#editModal h3').html('新增');
        }

        $('#edit-TeacherName').val(teacher.TeacherName || '');
        $('#edit-Gender').val(teacher.Gender || '');
        $('#edit-ContactPhone').val(teacher.ContactPhone || '');
        $('#edit-Email').val(teacher.Email || '');
        $('#edit-StLoginName').val(teacher.StLoginName || '');
        $('#edit-Nickname').val(teacher.Nickname || '');
        $('#edit-TeacherCode').val(teacher.TeacherCode || '');

        // TODO: 處理上傳圖片
        $('#files').click(function(evt){
            $(this).val('');
        });
        $('#files').change(function(evt) {
            if (evt.target == undefined ||
            evt.target.files == undefined ||
            evt.target.files.length == 0) {
                alert("您的瀏覽器並未支援讀取檔案功能，請更新您的瀏覽器，謝謝!\n\n建議瀏覽器：Chrome 10+, IE 10+, Firefox 10+");
                return;
            }

            var file = evt.target.files[0];

            if (!(file.type == "image/png" || file.type == "image/jpeg" || file.type == "image/gif")) {
                return;
            }

            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var image = new Image();
                    image.src = e.target.result;
                    image.onload = function () {
                        var maxWidth = 225, maxHeight = 300, imageHeight = image.height, imageWidth = image.width;

                        if (imageHeight > maxHeight) {
                            imageWidth *= maxHeight / imageHeight;
                            imageHeight = maxHeight;
                        }
                        if (imageWidth > maxWidth) {
                            imageHeight *= maxWidth / imageWidth;
                            imageWidth = maxWidth;
                        }

                        var canvas = document.createElement('canvas');
                        canvas.width = imageWidth;
                        canvas.height = imageHeight;

                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

                        var finalFile = canvas.toDataURL("image/png");

                        $("#edit-Photo").attr('src', finalFile);

                        var photo_base64 = finalFile.replace("data:image/png;base64,", "");

                        $("#edit-Photo").attr("photo-base64", photo_base64);
                    }
                };
            })(file);
            reader.readAsDataURL(file);
            $('#del_photo').show();
        });

        if (teacher.Photo) {
            $('#edit-Photo').attr('src', 'data:image/png;base64,'+teacher.Photo).attr('photo-base64', teacher.Photo);
            $('#del_photo').show();
        } else  {
            $('#edit-Photo').attr('src', '').attr('photo-base64', '');
            $('#del_photo').hide();
        }
    } else {
        $('#editModal').modal('hide');
    }
};

_gg.saveBaseInfo = function() {
    var teacher = _gg.teacher;
    var teacherName = $('#edit-TeacherName').val() || '';
    var teacherid = teacher.TeacherID;

    if (teacherName && teacherid) {
        var photo = $('#edit-Photo').attr('photo-base64') || '';
        var nickname = $('#edit-Nickname').val() || '';
        var gender = $('#edit-Gender').val() || '';
        var stLoginName = $('#edit-StLoginName').val() || '';
        var contactPhone = $('#edit-ContactPhone').val() || '';
        var email = $('#edit-Email').val() || '';
        var teachercode = $('#edit-TeacherCode').val() || ''

        var request = [];

        request.push('<TeacherName>' + teacherName + '</TeacherName>');
        request.push('<Photo>' + photo + '</Photo>');
        request.push('<Nickname>' + nickname + '</Nickname>');
        request.push('<Gender>' + gender + '</Gender>');
        request.push('<StLoginName>' + stLoginName + '</StLoginName>');
        request.push('<ContactPhone>' + contactPhone + '</ContactPhone>');
        request.push('<Email>' + email + '</Email>');
        request.push('<TeacherCode>' + teachercode + '</TeacherCode>');

        var _service, _body, _txt, _type;
        if (teacherid === '0') {
            _type = 'add';
            _service = 'teacher.AddTeacher';
            _body ='<Request><Teacher><Field>' + request.join('') + '</Field></Teacher></Request>';
            _txt = '新增成功';
        } else {
            _type = 'update';
            _service = 'teacher.SetTeacherInfo';
            _body ='<Request><Teacher><Field>' + request.join('') + '</Field><Condition><TeacherID>' + teacher.TeacherID + '</TeacherID></Condition></Teacher></Request>',
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
                    var _ref;
                    if (_type === "add") {
                        if (((_ref = response.Result) != null ? _ref.NewID : void 0) != null) {
                            teacher.TeacherID = response.Result.NewID;
                            teacher.index = 0;
                        }
                        _gg.teachers.splice(0, 0, teacher);
                    }

                    // TODO: 重設資料
                    _gg.ClearTeacherInfo();

                    teacher.Photo = photo;
                    teacher.TeacherName = teacherName;
                    teacher.Nickname = nickname;
                    teacher.Gender = gender;
                    teacher.StLoginName = stLoginName;
                    teacher.ContactPhone = contactPhone;
                    teacher.Email = email;
                    teacher.TeacherCode = teachercode;

                    if (_type === "add") {
                        _gg.ResetTeacherList();
                    } else {
                        _gg.GetTeacherInfo();

                        // TODO: 處理姓名
                        var tname = '';
                        tname = (teacher.TeacherName || '');
                        if (teacher.Nickname) {
                            tname += '(' + teacher.Nickname + ')';
                        }

                        if (_gg.model === 'img') {
                            // TODO: 處理照片
                            var tphoto;
                            tphoto = ($('#edit-Photo').attr('photo-base64')) ? 'data:image/png;base64,' + teacher.Photo : '';
                            if (!tphoto) {
                                if (teacher.Gender === '1') {
                                    tphoto = 'img/photo_male.png';
                                } else {
                                    tphoto = 'img/photo_female.png';
                                }
                            }
                            $('.my-scrollbar2 dl[teacherIndex=' + teacher.index + ']')
                                .attr('data-original-title', tname)
                                .find('img').attr('src', tphoto)
                                .end().find('dd').html(tname);
                        } else {
                            var tmp_gender = '';
                            if (teacher.Gender === '1') {
                                tmp_gender = '男';
                            } else if (teacher.Gender === '0') {
                                tmp_gender = '女';
                            }
                            $('.my-scrollbar2 tr[teacherIndex=' + teacher.index + ']')
                                .find('td:eq(0)').html(tname)
                                .end().find('td:eq(1)').html(tmp_gender)
                                .end().find('td:eq(2)').html(teacher.ContactPhone || '')
                                .end().find('td:eq(3)').html(teacher.StLoginName || '')
                                .end().find('td:eq(4)').html(teacher.TeacherCode || '');
                        }
                    }

                    $('#editModal').modal('hide');
                    $('#mainMsg').html("<div class='alert alert-success'>\n  " + _txt + "\n</div>");
                    setTimeout("$('#mainMsg').html('')", 1500);
                }
            }
        });
    } else {
        $("#save-data").button("reset");
        var _txt;
        if (teacherName) {
            _txt='教師編號不正確，無法儲存！';
        } else {
            _txt='姓名為必填值！';
        }
        $('#errorMessage').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n " + _txt + " \n</div>");
    }
};

// TODO: 刪除教師
_gg.delTeacher = function() {
    var teacherid = _gg.teacher.TeacherID;
    if (teacherid) {
        _gg.connection.send({
            service: "teacher.DelTeacher",
            body: '<Request><Teacher><Condition><TeacherID>' + teacherid + '</TeacherID></Condition></Teacher></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    $('#del-data').button('reset');
                    _gg.set_error_message('#mainMsg', 'DelTeacher', error);
                } else {
                    $('#del-data').button('reset');
                    $('#delModal').modal('hide');
                    _gg.teachers.splice(_gg.teacher.index, 1);
                    _gg.teacher.TeacherID = null;
                    _gg.ResetTeacherList();
                    _gg.ClearTeacherInfo();

                    $('#mainMsg').html("<div class='alert alert-success'>\n  刪除成功！\n</div>");
                    setTimeout("$('#mainMsg').html('')", 1500);
                }
            }
        });
    } else {
        $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n 教師編號不正確，無法刪除！ \n</div>");
    }
};

// TODO: 產生代碼
_gg.GetNewCode = function() {
    _gg.connection.send({
        service: "teacher.GetNewCode",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#errorMessage', 'GetNewCode', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.Code : void 0) != null) {
                    $('#edit-TeacherCode').val(response.Response.Code || '');
                }
            }
        }
    });
};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i> <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case '901':
                        tmp_msg = '<strong>帳號重複，請改用其他帳號!</strong>';
                        break;
                    case '902':
                        if ($('#edit-Nickname').val() === '') {
                            tmp_msg = '<strong>姓名重複，請填寫暱稱!</strong>';
                        } else {
                            tmp_msg = '<strong>暱稱重複，請改用其他暱稱!</strong>';
                        }
                        break;
                    case '904':
                        tmp_msg = '<strong>教師代碼重複，請改用其他代碼!</strong>';
                        break;
                }
            }
        }
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
        $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
    }
};