jQuery(function() {
    _gg.GetAllTeacherInfo();

    $('#myTab')
        .click(function() {
            $(this).find('li.active').removeClass('active');
        })
        .find('a').click(function(){
            $('#tabName').html($(this).html());
        })
        .first().trigger('click');

    // TODO: 匯入設定
    var field = {
        TeacherName: '姓名',
        Nickname: '暱稱',
        Gender: '性別',
        StLoginName: '帳號',
        ContactPhone: '電話',
        Email: 'Email',
        TeacherCode: '教師代碼'
    };
    $('#import').importlist({
        columns          : field,
        oncomplete       : _gg.validate_import,
        haveTitleControl : '#import input:checkbox[data-action=checktitle]',
        inputControl     : '#import textarea',
        outputControl    : '#import div[data-tab=result]',
        parseControl     : '#import button[data-action=parse]',
        importControl    : '#import button[data-action=done]',
        errorElement     : '#mainMsg'
    });

    // TODO: 匯出全選
    $('#tab_export')
        .find('#checkall').click(function() {
            var that = this;
            $('#tab_export .controls input:checkbox').prop('checked', function() {
                return $(that).prop('checked');
            });
        }).end()
        .find('button[data-action=export]').click(function() {
            if ($('#tab_export .controls input:checkbox:checked').length === 0) {
                $('#tab_export textarea').val('無匯出資料');
            } else {
                _gg.export_data();
            }
        });

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
        _gg.OnAddTeacher();
        // _gg.teacher = { TeacherID: '0'};
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
        _gg.SetCurrTeacher(teacherIndex);
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
                _gg.set_error_message('#errorMessage', '', '資料驗證失敗，請重新檢查！');
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

var _gg = function () {
    var connection = gadget.getContract("ischool.CampusLite.staff");
    var model = 'list';
    var teachers = [];
    var teacher = {};

    // TODO: 取得全部教師資訊
    var GetAllTeacherInfo = function() {
        var _body = '<Request><Field><Gender/><ContactPhone/><StLoginName/><TeacherCode/></Field><Condition></Condition></Request>';
        if (model === 'img') {
            _body = '<Request><Field><Photo/></Field><Condition></Condition></Request>';
        }

        $('#namelist .my-scrollbar2').html('資料載入中...');

        connection.send({
            service: "teacher.GetTeacherList",
            body: _body,
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetTeacherList', error);
                } else {
                    var _ref, ret = [];
                    teachers = [];
                    if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {

                        $(response.Response.Teacher).each(function(index, item) {
                            teachers[index] = item;
                        });
                    }

                    ResetTeacherList();
                }
            }
        });
    };

    var ResetTeacherList = function() {
        $('#namelist .my-scrollbar2').html('');
        var ret = [];
        $(teachers).each(function(index, item) {
            if (this.TeacherName.indexOf($("#filter-keyword").val()) !== -1) {
                    // TODO: 處理姓名
                    var tname = '';
                    tname = (item.TeacherName || '');
                    if (item.Nickname) {
                        tname += '(' + item.Nickname + ')';
                    }

                    if (model === 'img') {
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
            if (model === 'img') {
                $('#namelist .my-scrollbar2').html(items);
                // TODO: 教師全名 Tooltip
                $('dl[rel=tooltip]').tooltip({'trigger':'hover'});

                if (teacher) {
                    if (teacher.TeacherID) {
                         $('dl[teacherID=' + teacher.TeacherID + ']').trigger('click');
                    }
                }

            } else {
                $('#namelist .my-scrollbar2').html('<table class="table table-condensed table-striped table-bordered">' +
                    '<thead>' +
                    '<th>姓名</th>' +
                    '<th width="46px">性別</th>' +
                    '<th>電話</th>' +
                    '<th>帳號</th>' +
                    '<th>代碼</th>' +
                    '</thead><tbody>' + items + '</tbody></table>')
                .find('table').dataTable({
                    "bPaginate" : false,
                    "bFilter"   : false,
                    "bInfo"     : true,
                    "bDestroy"  : true,
                    "oLanguage" : {
                        "sInfo": "總人數：_TOTAL_"
                    }
                });

                if (teacher) {
                    if (teacher.TeacherID) {
                         $('tr[teacherID=' + teacher.TeacherID + ']').trigger('click');
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

    var ClearTeacherInfo = function() {
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

    var GetTeacherInfo = function() {
        var teacher = teacher;

        if (teacher.TeacherID) {
            var _body = '<Request><Field><Gender/><ContactPhone/><StLoginName/><TeacherCode/><Email/><Photo/></Field>' +
                    '<Condition><TeacherID>' + teacher.TeacherID + '</TeacherID></Condition></Request>';
            connection.send({
                service: "teacher.GetTeacherList",
                body: _body,
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetTeacherList', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {
                            $(response.Response.Teacher).each(function(index, item) {
                                item.index = teacher.index;
                                teacher = item;

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

    var SetModal = function() {
        $('#files').val('');

        var teacher = teacher;
        if (teacher.TeacherID) {
            if (teacher.TeacherID === '0') {
                $('#editModal h3').html('新增');
            } else {
                $('#editModal h3').html('資料修改');
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

    var saveBaseInfo = function() {
        var teacher = teacher;
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
                _body ='<Request><Teacher>' + request.join('') + '</Teacher></Request>';
                _txt = '新增成功';
            } else {
                _type = 'update';
                _service = 'teacher.SetTeacherInfo';
                _body ='<Request><Teacher><Field>' + request.join('') + '</Field><Condition><TeacherID>' + teacher.TeacherID + '</TeacherID></Condition></Teacher></Request>',
                _txt = '儲存成功';
            }

            connection.send({
                service: _service,
                body: _body,
                result: function (response, error, http) {
                    if (error !== null) {
                        $("#save-data").button("reset");
                        set_error_message('#errorMessage', _service, error);
                    } else {
                        var _ref;
                        if (_type === "add") {
                            if (((_ref = response.Result) != null ? _ref.NewID : void 0) != null) {
                                teacher.TeacherID = response.Result.NewID;
                                teacher.index = 0;
                            }
                            teachers.splice(0, 0, teacher);
                        }

                        // TODO: 重設資料
                        ClearTeacherInfo();

                        var _teacher = teachers[teacher.index];
                        _teacher.Nickname = nickname;
                        _teacher.TeacherCode = teachercode;
                        _teacher.TeacherName = teacherName;

                        if (model === 'img') {
                            _teacher.Photo = photo;
                        } else {
                            _teacher.ContactPhone = contactPhone;
                            _teacher.Gender = gender;
                            _teacher.StLoginName = stLoginName;
                        }

                        jQuery.extend(teacher, _teacher);

                        teacher.Email = email;

                        ResetTeacherList();

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
            set_error_message('#errorMessage', '', _txt);
        }
    };

    // TODO: 刪除教師
    var delTeacher = function() {
        var teacherid = teacher.TeacherID;
        if (teacherid) {
            connection.send({
                service: "teacher.DelTeacher",
                body: '<Request><Teacher><Condition><TeacherID>' + teacherid + '</TeacherID></Condition></Teacher></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        $('#del-data').button('reset');
                        set_error_message('#delMessage', 'DelTeacher', error);
                    } else {
                        $('#del-data').button('reset');
                        $('#delModal').modal('hide');
                        teachers.splice(teacher.index, 1);
                        teacher.TeacherID = null;
                        ResetTeacherList();
                        ClearTeacherInfo();

                        $('#mainMsg').html("<div class='alert alert-success'>\n  刪除成功！\n</div>");
                        setTimeout("$('#mainMsg').html('')", 1500);
                    }
                }
            });
        } else {
            set_error_message('#mainMsg', '', '教師編號不正確，無法刪除！');
        }
    };

    // TODO: 產生代碼
    var GetNewCode = function() {
        connection.send({
            service: "teacher.GetNewCode",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#errorMessage', 'GetNewCode', error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Code : void 0) != null) {
                        $('#edit-TeacherCode').val(response.Response.Code || '');
                    }
                }
            }
        });
    };

    // TODO: 驗證批次匯入資料的正確性
    var validate_import = function(list) {
        $("#tab_import button[data-action=done]").button("loading");

        var _name = [], _fullname = [], _st_login_name = [], _teacher_code = [];
        var error_item = {
            teachername : true,
            fullname    : [],
            loginname   : [],
            teachercode : [],
            gender      : []
        };

        $(list).each(function(index, item) {
            // 姓名 必填
            // 姓名 + 暱稱, 帳號, 教師代碼  不可重複
            // 性別轉換 1:男 0:女

            if (item.TeacherName) {
                _name.push(item.TeacherName);
            } else {
                error_item.teachername = false;
            }

            var fullname = item.TeacherName + (item.Nickname || '');
            if ($.inArray(fullname, _fullname) === -1) {
                _fullname.push(fullname);
            } else {
                error_item.fullname.push(fullname);
            }

            var loginname = (item.StLoginName || '');
            if (loginname) {
                if ($.inArray(loginname, _st_login_name) === -1) {
                    _st_login_name.push(loginname);
                } else {
                    error_item.loginname.push(loginname);
                }
            }

            var teachercode = (item.TeacherCode || '');
            if (teachercode) {
                if ($.inArray(teachercode, _teacher_code) === -1) {
                    _teacher_code.push(teachercode);
                } else {
                    error_item.teachercode.push(teachercode);
                }
            }

            var gender = (item.Gender || '');
            if (gender) {
                if (gender !== '男' && gender !== '女') {
                    error_item.gender.push(gender);
                }
            }
        });

        connection.send({
            service: "teacher.ValidateImport",
            body: {
                Request: {
                    Condition : {
                        'FullName' : "'" +  _fullname.join("', '") + "'",
                        'StLoginName' : "'" +  _st_login_name.join("', '") + "'",
                        'TeacherCode' : "'" +  _teacher_code.join("', '") + "'"
                    }
                }
            },
            result: function (response, error, http) {
                if (error !== null) {
                    $("#tab_import button[data-action=done]").button("reset");
                    set_error_message('#mainMsg', 'ValidateImport', error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Fail : void 0) != null) {
                        $(response.Response.Fail).each(function(index, item) {
                            if (item.Value) {
                                switch (item.Title) {
                                    case 'full_name':
                                        error_item.fullname.push(item.Value);
                                        break;
                                    case 'login_name':
                                        error_item.loginname.push(item.Value);
                                        break;
                                    case 'teacher_code':
                                        error_item.teachercode.push(item.Value);
                                        break;
                                }
                            }
                        });
                    }

                    var error_txt = [];
                    if (!error_item.teachername) { error_txt.push('姓名為必填值！'); };

                    if (error_item.fullname.length > 0) {
                        error_txt.push('姓名+暱稱不可重複！(' + htmlEncode(error_item.fullname.join(', ')) + ')');
                    }
                    if (error_item.loginname.length > 0) {
                        error_txt.push('帳號不可重複！(' + htmlEncode(error_item.loginname.join(', ')) + ')');
                    }
                    if (error_item.teachercode.length > 0) {
                        error_txt.push('教師代碼不可重複！(' + htmlEncode(error_item.teachercode.join(', ')) + ')');
                    }
                    if (error_item.gender.length > 0) {
                        error_txt.push('性別請使用「男」、「女」！(' + htmlEncode(error_item.gender.join(', ')) + ')');
                    }

                    if (error_txt.length > 0) {
                        $("#tab_import button[data-action=done]").button("reset");
                        set_error_message('#mainMsg', '', error_txt.join('<br />'));
                    } else {
                        $(list).each(function(index, item) {
                            if (item.StLoginName) {
                                delete item.TeacherCode;
                            } else {
                                if (!item.TeacherCode) {
                                    item.TeacherCode = null;
                                }
                            }
                        });
                        import_status = true;
                        save_import(list);
                    }
                }
            }
        });
    };

    // TODO: 儲存批次匯入
    var save_import = function(list) {
        if (list && import_status) {
            import_status = false;
            connection.send({
                service: "teacher.AddTeacher",
                body: {
                    Request: {
                        Teacher: list
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        $("#tab_import button[data-action=done]").button("reset");
                        set_error_message('#mainMsg', 'AddTeacher', error);
                    } else {
                        var success_count = 0;

                        if (response.Result && response.Result.EffectRows) {
                            success_count = response.Result.EffectRows;
                            GetAllTeacherInfo();
                        }

                        $("#tab_import button[data-action=done]").button("reset");
                        $('#mainMsg').html("<div class='alert alert-success'>\n  儲存成功，共匯入" + success_count + "筆！\n</div>");
                        setTimeout("$('#mainMsg').html('')", 3000);
                    }
                }
            });
        }
    };

    // TODO: 匯出資料
    var export_data = function() {
        var items = [];
        var checkboxs = $('#tab_export .controls input:checkbox:checked');
        var titles = $('#tab_export .controls input:checkbox:checked').map(function() { return $(this).attr('data-title'); }).get();
        items.push(titles.join('\t'));
        $(teachers).each(function(index, item) {
            var data1 = [];
            $(checkboxs).each(function(key, value) {
                var name = $(this).val();
                data1.push(item[name]);
            })
            items.push(data1.join('\t'));
        });
        $('#tab_export textarea').val(items.join('\n'));
    };

    // TODO: 錯誤訊息
    var set_error_message = function(select_str, serviceName, error) {
        if (serviceName) {
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
        } else {
            $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
        }
    };

    var htmlEncode = function(value) {
        return $('<div/>').text(value).html();
    };

    var result = {
        model : function() {
            return model;
        },
        getTeacher : function() {
            return teacher;
        },
        getTeachers : function() {
            return teachers;
        },
        GetAllTeacherInfo : function() {
            return GetAllTeacherInfo();
        },
        validate_import : function() {
            return validate_import();
        },
        save_import : function() {
            return save_import();
        },
        ClearTeacherInfo : function() {
            return ClearTeacherInfo();
        },
        delTeacher : function() {
            return delTeacher();
        },
        GetTeacherInfo : function() {
            return GetTeacherInfo();
        },
        ResetTeacherList : function() {
            return ResetTeacherList();
        },
        SetModal : function() {
            return SetModal();
        },
        saveBaseInfo : function() {
            return saveBaseInfo();
        },
        set_error_message : function(select_str, serviceName, error) {
            return set_error_message(select_str, serviceName, error);
        },
        GetNewCode : function() {
            return validate_import();
        },
        OnAddTeacher : function() {
            teacher = { TeacherID: '0'};
        },
        SetCurrTeacher : function(teacherIndex) {
            teacher = teachers[teacherIndex];
            teacher.index = teacherIndex;
        }
    };
    return result;
}();