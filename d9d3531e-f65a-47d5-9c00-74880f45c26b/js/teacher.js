var _connection_public = gadget.getContract("basic.public");
var _connection_basic = gadget.getContract("basic.staff");
jQuery(function() {
    TeacherManager.init();

    // 驗證設定
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

    // 點選新增
    $('#addteacher').on('click', function() {
        $('#editModal').data('teacherId', null);
        TeacherManager.clearInfo();
    });

    // 搜尋
    $("#filter-keyword").change(function() {
        TeacherManager.clearInfo();
        TeacherManager.resetList();
    });

    $('#namelist').each(function(index, target){
        target = $(target);

        // 點選教師
        target.on('click', 'tr', function() {
            TeacherManager.clearInfo();
            target.find('.action').removeClass('action');
            $(this).addClass('action');
            var tid = $(this).attr('data-tid');
            $('#editModal').data('teacherId', tid).modal('show');
        });
    });


    // 編輯視窗
    $("#editModal").each(function(index, target){
        target = $(target);
        var currteacher;

        var saveBaseInfo = function(teacher) {
            var teacherName = target.find('[js="edit-TeacherName"]').val() || '';
            var send;

            if (teacherName) {
                var nickname = target.find('[js="edit-Nickname"]').val() || '';
                var gender = target.find('[js="edit-Gender"]').val() || '';
                var linkAccount = target.find('[js="edit-LinkAccount"]').val() || '';
                var teachercode = target.find('[js="edit-TeacherCode"]').text() || '';
                var request = {
                    TeacherName: teacherName,
                    Nickname: nickname,
                    Gender: gender,
                    LinkAccount: linkAccount,
                    TeacherCode: teachercode
                };

                if (teacher && teacher.TeacherId) {
                    send = {
                        action: 'update',
                        successMsg: '儲存成功',
                        service: 'beta.UpdateTeacher',
                        body: {
                            Teacher: [{
                                TeacherId: teacher.TeacherId,
                                TeacherName: teacherName,
                                Nickname: nickname,
                                Gender: gender,
                                LinkAccount: linkAccount,
                                TeacherCode: teachercode
                            }]
                        }
                    };
                } else {
                    send = {
                        action: 'add',
                        successMsg: '新增成功',
                        service: 'beta.AddTeacher',
                        body: {
                            Teacher: [{
                                TeacherName: teacherName,
                                Nickname: nickname,
                                Gender: gender,
                                LinkAccount: linkAccount,
                                TeacherCode: teachercode
                            }]
                        }
                    };
                }

                _connection_basic.send({
                    service: send.service,
                    body: send.body,
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js^="action-"]').removeClass("disabled");
                            TeacherManager.Util.msg('#errorMessage', send.service, error);
                        } else {
                            if (send.action === "add") {
                                request.TeacherId = response.NewId;
                                TeacherManager.addTeacher(request);
                            } else {
                                request.TeacherId = teacher.TeacherId;
                                TeacherManager.updateTeacher(request);
                            }

                            // 重設資料
                            TeacherManager.clearInfo();
                            TeacherManager.resetList();
                            target.modal('hide');
                            $('#mainMsg').html("<div class='alert alert-success'>\n  " + send.successMsg + "\n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }

                });
            } else {
                TeacherManager.Util.msg('#errorMessage', '', '姓名為必填值！');
                target.find('[js^="action-"]').removeClass("disabled");
            }
        };

        // 刪除教師
        var delBaseInfo = function(teacher) {
            var teacherId = teacher.TeacherId;
            if (teacherId) {
                _connection_basic.send({
                    service: "beta.DelTeacher",
                    body: {
                        TeacherId: teacherId
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js^="action-"]').removeClass("disabled");
                            TeacherManager.Util.msg('#errorMessage', 'DelTeacher', error);
                        } else {
                            target.find('[js^="action-"]').removeClass("disabled");
                            target.modal('hide');
                            TeacherManager.delTeacher(teacher);
                            TeacherManager.clearInfo();
                            TeacherManager.resetList();

                            $('#mainMsg').html("<div class='alert alert-success'>\n 刪除成功！ \n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                TeacherManager.Util.msg('#errorMessage', '', '教師編號不正確，無法刪除！');
                target.find('[js^="action-"]').removeClass("disabled");
            }
        };

        target.modal({
            show: false
        }).on("hidden", function() {
            $("#errorMessage").html("");
        }).on("show", function() {
            // 清除樣式
            var validator = $("#editModal form").validate();
            validator.resetForm();
            $(this).find('.error').removeClass("error");

            target.find('[js^="action-"]').removeClass("disabled");

            var tid = target.data('teacherId');
            currteacher = TeacherManager.getInfo(tid);
            if (currteacher) {
                target.find('h3').html('資料修改');
                target.find('[js="edit-TeacherName"]').val(currteacher.TeacherName || '');
                target.find('[js="edit-Gender"]').val(currteacher.Gender || '');
                target.find('[js="edit-LinkAccount"]').val(currteacher.LinkAccount || '');
                target.find('[js="edit-Nickname"]').val(currteacher.Nickname || '');
                target.find('[js="edit-TeacherCode"]').html(currteacher.TeacherCode || '');
                target.find('[js="action-del"]').show();
                target.find('[js="edit-TeacherCode"]').closest('div.control-group').show();
            } else {
                target.find('h3').html('新增');
                target.find('[js="action-del"]').hide();
            }
        });

        target.find('[js="action-save"]').on('click', function() {
            if ($(this).hasClass("disabled")) return;
            target.find('#errorMessage').html('');
            if (target.find("form").valid()) {
                // 驗證通過
                target.find('[js^="action-"]').addClass("disabled");
                saveBaseInfo(currteacher);
            }
        });

        target.find('[js="action-del"]').click(function() {
            target.find('#errorMessage').html('');
            var confirmText = '<span>永久刪除無法回復，您確定要刪除嗎？</span>' +
                '   <a href="javascript:void(0);" data-dismiss="alert">取消</a>' +
                ' | <a href="javascript:void(0);" js="del-teacher">確定</a>';

            TeacherManager.Util.msg('#errorMessage', '', confirmText);
        });

        target.on('click', '[js="del-teacher"]', function() {
            if (target.find('[js="action-del"]').hasClass("disabled")) return;
            TeacherManager.Util.msg('#errorMessage', '', '刪除中...');
            target.find('[js^="action-"]').addClass("disabled");
            delBaseInfo(currteacher);
        });

        // 產生代碼
        target.find('[js=refresh]').click(function() {
            _connection_public.send({
                service: "beta.GetNewCode",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        TeacherManager.Util.msg('#errorMessage', 'GetNewCode', error);
                    } else {
                        if (response.Code) {
                            target.find('[js="edit-TeacherCode"]').html(response.Code || '');
                        }
                    }
                }
            });
        });

        target.find('[js=delcode]').click(function() {
           target.find('[js="edit-TeacherCode"]').html('');
        });
    });
});

var TeacherManager = function () {
    var _teachers = [];

    // 取得全部教師資訊
    var getAllTeacherInfo = function() {
        _teachers = [];
        $('#namelist').html('資料載入中...');

        _connection_basic.send({
            service: "GetTeacher",
            body: {
                TeacherStatus: '1'
            },
            result: function (response, error, http) {
                if (error !== null) {
                    TeacherManager.Util.msg('#mainMsg', 'GetTeacher', error);
                } else {
                    if (response.Teacher) {
                        response.Teacher = TeacherManager.Util.handle_array(response.Teacher);
                        $(response.Teacher).each(function(index, teacher) {
                            if (teacher.TeacherStatus === '1') {
                                if (!_teachers['t' + teacher.TeacherId]) {
                                    var tch = {
                                        TeacherId: teacher.TeacherId || '',
                                        TeacherName: teacher.TeacherName || '',
                                        Nickname: teacher.Nickname || '',
                                        Gender: teacher.Gender || '',
                                        LinkAccount: teacher.LinkAccount || '',
                                        TeacherCode: teacher.TeacherCode || '',
                                        Classes: []
                                    };
                                    _teachers['t' + teacher.TeacherId] = tch;
                                    _teachers.push(tch)
                                }
                                _teachers['t' + teacher.TeacherId].Classes.push({
                                    ClassId: teacher.ClassId,
                                    ClassName: teacher.ClassName
                                });
                            }
                        });
                    }
                    resetTeacherList();
                }
            }
        });
    };

    // 顯示教師清單
    var resetTeacherList = function() {
        $('#namelist').html('');
        var items = [];
        _teachers.sort($.by('asc', 'TeacherName'));
        $(_teachers).each(function(index, teacher) {
            if (teacher.TeacherCode === undefined) console.log(teacher);
            if (teacher.TeacherName.indexOf($("#filter-keyword").val()) !== -1
                || teacher.LinkAccount.indexOf($("#filter-keyword").val()) !== -1
                || teacher.TeacherCode.indexOf($("#filter-keyword").val()) !== -1
            ) {
                var nickname = (teacher.Nickname ? '(' + teacher.Nickname + ')' : '');
                var classes = [];
                $(teacher.Classes).each(function(index, classx){
                    classes.push(classx.ClassName);
                });
                items.push(
                    '<tr data-tid="' + teacher.TeacherId + '">' +
                    '    <td>' + (teacher.TeacherName || '') + nickname + '</td>' +
                    '    <td>' + (teacher.Gender || '') + '</td>' +
                    '    <td>' + (teacher.LinkAccount || '') + '</td>' +
                    '    <td class="monospaced">' + (teacher.TeacherCode || '') + '</td>' +
                    '    <td>' + classes.join(', ') + '</td>' +
                    '</tr>'
                );
            }
        });
        if (items.length > 0) {
            $('#namelist').html('<table class="table table-bordered table-striped">' +
                '<thead>' +
                '<th>姓名</th>' +
                '<th width="46px">性別</th>' +
                '<th>帳號</th>' +
                '<th>代碼</th>' +
                '<th>帶班班級</th>' +
                '</thead><tbody>' + items.join('') + '</tbody></table>');
        } else {
            if ($("#filter-keyword").val()) {
                $('#namelist').html('無符合條件的資料');
            } else {
                $('#namelist').html('目前無資料');
            }
        }
    };

    var htmlEncode = function(value) {
        return $('<div/>').text(value).html();
    };

    var result = {
        init: function() {
            return getAllTeacherInfo();
        },
        clearInfo: function() {
            var profile = $('#editModal');
            profile.find('[js="edit-TeacherName"]').val('');
            profile.find('[js="edit-Gender"]').val('');
            profile.find('[js="edit-LinkAccount"]').val('');
            profile.find('[js="edit-Nickname"]').val('');
            profile.find('[js="edit-TeacherCode"]').html('');
        },
        getInfo: function(tid) {
            if (tid) {
                return _teachers['t' + tid];
            } else {
                return null;
            }
        },
        resetList: function() {
            return resetTeacherList();
        },
        addTeacher: function(tch) {
            if (tch) {
                tch.classes = [];
                _teachers['t' + tch.TeacherId] = tch;
                _teachers.push(_teachers['t' + tch.TeacherId]);
            }
        },
        delTeacher: function(tch) {
            var idx = $(_teachers).index(tch);
            if (idx !== -1) {
                _teachers.splice(idx, 1);
                _teachers['t' + tch.TeacherId] = undefined;
            }
        },
        updateTeacher: function(tch) {
            if (tch) {
                var teacher = _teachers['t' + tch.TeacherId];
                if (teacher) {
                    teacher.TeacherName = tch.TeacherName;
                    teacher.Nickname = tch.Nickname;
                    teacher.Gender = tch.Gender;
                    teacher.LinkAccount = tch.LinkAccount;
                    teacher.TeacherCode = tch.TeacherCode;
                }
            }
        }
    };
    return result;
}();