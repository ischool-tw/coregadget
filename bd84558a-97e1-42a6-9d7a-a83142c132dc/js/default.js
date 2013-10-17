var GroupManager = GroupManager || {};
GroupManager.connection_public = gadget.getContract("cloud.public");
GroupManager.connection_staff = gadget.getContract("cloud.staff");
GroupManager.groups = [];

$(document).ready(function () {
    // 取得全部老師
    GroupManager.connection_staff.send({
        service: "beta.GetTeacher",
        body: {},
        result: function (response, error, http) {
            if (error !== null) {
                GroupManager.Util.msg($('#mainMsg'), 'GetTeacher', error);
            } else {
                if (response.Teacher) {
                    var items = [];
                    GroupManager.teachers = [];
                    response.Teacher = GroupManager.Util.handle_array(response.Teacher);
                    $(response.Teacher).each(function(index, teacher) {
                        if (teacher.TeacherStatus === '1') {
                            if (!GroupManager.teachers['t' + teacher.TeacherId]) {
                                // 處理姓名
                                var tname = teacher.TeacherName || '';
                                if (teacher.Nickname) {
                                    tname += '(' + teacher.Nickname + ')';
                                }
                                var tch = {
                                    TeacherId: teacher.TeacherId || '',
                                    TeacherName: teacher.TeacherName || '',
                                    Nickname: teacher.Nickname || '',
                                    TName: tname
                                };
                                GroupManager.teachers['t' + teacher.TeacherId] = tch;
                                GroupManager.teachers.push(tch)
                                items.push(tname);
                            }
                        }
                    });

                    // 老師自動選單
                    $('#edit-TeacherName').autocomplete({
                        source: items
                    });
                }
            }
        }
    });

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

    $('[js="create"]').click(function(){
        $('[js="panel_editGroup"]').trigger('editGroup', null);
    });

    $('[js="panel_group_list"]').each(function(index, target){
        target = $(target);
        var groups;

        var clearList = function() {
            target.html('');
        };

        var getGroup = function() {
            GroupManager.groups = [];
            GroupManager.connection_staff.send({
                service: "beta.GetGroup",
                body: {},
                result: function (response, error, http) {
                    if (error !== null) {
                        GroupManager.Util.msg($('#mainMsg'), 'GetMyGroup', error);
                    } else {
                        if (response.Group) {
                            GroupManager.groups = GroupManager.Util.handle_array(response.Group);
                            groups = GroupManager.groups;
                            $(groups).each(function(index, group){
                                // 組合老師群的姓名
                                var teachers = [];
                                if (group.Teacher) {
                                    var tch = GroupManager.Util.handle_array(group.Teacher);
                                    $(tch).each(function(index, teacher){
                                        var tname = teacher.TeacherName || '';
                                        if (teacher.Nickname) {
                                            tname += '(' + teacher.Nickname + ')';
                                        }
                                        teachers.push(tname);
                                    });
                                }
                                group.GroupTeachers = teachers.join('');

                                if (!groups['g'+group.GroupId]) {
                                    groups['g'+group.GroupId] = group;
                                }
                            });
                        }
                        setGroup(groups);
                    }
                }
            });
        };

        var setGroup = function(groups) {
            var ret = [];
            if (groups) {
                $(groups).each(function(index, group) {
                    ret.push(
                        '<div class="my-group">' +
                        '  <div>' +
                        '    <div class="my-groupName">' + group.GroupName + '</div>' +
                        '    <div>' +
                        '      <small class="my-group-subtitle">' + (group.GroupTeachers || '未指定')  + ' / ' +
                        '      <span class="monospaced">' + (group.GroupCode || '未指定') + '</span></small>' +
                        '    </div>' +
                        '  </div>' +
                        '  <div class="pull-right" data-gid="' + group.GroupId + '" js="edit">' +
                        '    <a href="javascript:void(0);" class="btn" role="button">' +
                        '      <i class="icon-edit"></i>' +
                        '    </a>' +
                        '  </div>' +
                        '</div>'
                    );
                });
            }
            var items = ret.join('');
            if (items) {
                target.html(items);
            } else {
                target.html('<p>目前無資料</p>');
            }
        };

        // 點選編輯
        target.on('click', '[js="edit"]', function() {
            var groupId = $(this).attr('data-gid');
            var group = GroupManager.groups['g' + groupId];
            $('[js="panel_editGroup"]').trigger('editGroup', group);
        });

        target.on('modifyGroup', function(e) {
            clearList();
            setGroup(GroupManager.groups);
        });

        // 初始時載入
        target.html('<p>載入中...</p>');
        getGroup();
    });

    $('[js="panel_editGroup"]').each(function(index, target){
        target = $(target);
        var currGroup;

        var clearModal = function() {
            $('#mainMsg').html('');
            target.find('h3').html('');
            target.find('[name="edit-GroupName"]').val('');
            target.find('#edit-TeacherName').val('');
            target.find('#edit-TeacherName')
                .attr('TeacherID', '')
                .attr('TeacherName', '')
                .attr('Nickname', '');
            target.find('[js="edit-GroupCode"]').html('');
        };

        var setModal = function(group) {
            target.find('[data-type="action"]').removeClass("disabled");
            if (group) {
                target.find('h3').html('修改群組');
                target.find('[name="edit-GroupName"]').val(group.GroupName || '');
                target.find('[js="edit-GroupCode"]').html(group.GroupCode || '');
                // 處理姓名
                if (group.Teacher) {
                    var tch = GroupManager.Util.handle_array(group.Teacher);
                    $(tch).each(function(index, teacher){
                        var tname = teacher.TeacherName || '';
                        if (teacher.Nickname) {
                            tname += '(' + teacher.Nickname + ')';
                        }
                        target.find('#edit-TeacherName').val(tname);
                        target.find('#edit-TeacherName')
                            .attr('TeacherID', group.Teacher.TeacherID || '')
                            .attr('TeacherName', group.Teacher.TeacherName || '')
                            .attr('Nickname', group.Teacher.Nickname || '');

                        return false;
                    });
                }

                target.find('[js="delete"]').show();
            } else {
                target.find('h3').html('新增群組');
                target.find('[js="delete"]').hide();
            }
        };

        // 儲存
        var saveGroupInfo = function() {
            var group = currGroup;
            var groupName = target.find('[name="edit-GroupName').val() || '';
            var teacherId = target.find('#edit-TeacherName').attr('TeacherID') || '';
            var teacherName = target.find('#edit-TeacherName').attr('TeacherName') || '';
            var teacherNickname = target.find('#edit-TeacherName').attr('Nickname') || '';
            var groupCode = target.find('[js="edit-GroupCode"]').html() || '';
            var groupId;
            var send;

            if (groupName) {
                var request = {
                    GroupName: groupName,
                    GroupCode: groupCode,
                    Teacher: [{
                        TeacherId: teacherId,
                        TeacherName: teacherName,
                        Nickname: teacherNickname
                    }],
                    GroupTeachers: teacherName + (teacherNickname ? teacherNickname : '')
                };

                if (group) {
                    groupId = group.GroupId;
                    send = {
                        action: 'update',
                        successMsg: '儲存成功',
                        service: 'beta.UpdateGroup',
                        body: {
                            Group: {
                                GroupId: groupId,
                                GroupName: groupName,
                                GroupCode: groupCode,
                                Sequence: '1',
                                TeacherId: teacherId
                            }
                        }
                    };
                } else {
                    send = {
                        action: 'add',
                        successMsg: '新增成功',
                        service: 'beta.AddGroup',
                        body: {
                            Group: {
                                GroupName: groupName,
                                GroupCode: groupCode,
                                TeacherId: teacherId
                            }
                        }
                    };
                }

                GroupManager.connection_staff.send({
                    service: send.service,
                    body: send.body,
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js="save"]').button("reset");
                            GroupManager.Util.msg(target.find('[js="errorMessage"]'), send.service, error);
                        } else {
                            if (send.action === "add") {
                                if (response.Group) {
                                    var groups = GroupManager.Util.handle_array(response.Group);
                                    $(groups).each(function(index, group){
                                        // 組合老師群的姓名
                                        var teachers = [];
                                        if (group.Teacher) {
                                            var tch = GroupManager.Util.handle_array(group.Teacher);
                                            $(tch).each(function(index, teacher){
                                                var tname = teacher.TeacherName || '';
                                                if (teacher.Nickname) {
                                                    tname += '(' + teacher.Nickname + ')';
                                                }
                                                teachers.push(tname);
                                            });
                                        }
                                        group.GroupTeachers = teachers.join('');

                                        if (!GroupManager.groups['g'+group.GroupId]) {
                                            GroupManager.groups.push(group);
                                            GroupManager.groups['g'+group.GroupId] = group;
                                        }
                                    });
                                }
                            } else {
                                $.extend(GroupManager.groups['g'+groupId], request);
                            }
                            $('[js="panel_group_list"]').trigger('modifyGroup');

                            target.modal('hide');
                            $('#mainMsg').html("<div class='alert alert-success'>\n  " + send.successMsg + "\n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                target.find('[js="save"]').button("reset");
                GroupManager.Util.msg(target.find('[js="errorMessage"]'), '', '群組名稱為必填值！');
            }
        };

        var delGroupInfo = function() {
            var groupId = currGroup.GroupId;
            if (groupId) {
                GroupManager.connection_staff.send({
                    service: "beta.DelGroup",
                    body: {
                        GroupId: groupId
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[data-type="action"]').removeClass("disabled");
                            GroupManager.Util.msg(target.find('[js="errorMessage"]'), 'DelGroup', error);
                        } else {
                            var idx = $(GroupManager.groups).index(currGroup);
                            if (idx !== -1) {
                                GroupManager.groups.splice(idx, 1);
                                GroupManager.groups['g' + currGroup.groupId] = undefined;
                            }
                            target.find('[data-type="action"]').removeClass("disabled");
                            target.modal('hide');
                            $('[js="panel_group_list"]').trigger('modifyGroup');
                            $('[js="panel_single_group"]').trigger('changeGroup', null);

                            $('#mainMsg').html("<div class='alert alert-success'>\n 刪除成功！ \n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                GroupManager.Util.msg(target.find('[js="errorMessage"]'), '', '編號不正確，無法刪除！');
                target.find('[data-type="action"]').removeClass("disabled");
            }
        };

        target.modal({
            show: false
        });

        target.on("hidden", function() {
            target.find('[js="errorMessage"]').html('');
        });

        // 產生代碼
        target.find('[js=refresh]').click(function() {
            GroupManager.connection_public.send({
                service: "beta.GetNewCode",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        GroupManager.Util.msg(target.find('[js="errorMessage"]'), 'GetNewCode', error);
                    } else {
                        if (response.Code) {
                            target.find('[js="edit-GroupCode"]').html(response.Code || '');
                        }
                    }
                }
            });
        });

        target.find('[js=delcode]').click(function() {
           target.find('[js="edit-GroupCode"]').html('');
        });

        target.find('[js="save"]').on('click', function() {
            var err_msg = target.find('[js="errorMessage"]');
            err_msg.html('');
            if (target.find("form").valid()) {
                // 驗證通過
                $(this).button("loading");
                saveGroupInfo();
            }
        });

        target.find('[js="delete"]').click(function() {
            target.find('[js="errorMessage"]').html('');
            var confirmText = '<span>永久刪除無法回復，您確定要刪除嗎？</span>' +
                '   <a href="javascript:void(0);" data-dismiss="alert">取消</a>' +
                ' | <a href="javascript:void(0);" js="del-group">確定</a>';

            GroupManager.Util.msg(target.find('[js="errorMessage"]'), '', confirmText);
        });

        target.on('click', '[js="del-group"]', function() {
            if (target.find('[js="delete"]').hasClass("disabled")) return;
            GroupManager.Util.msg(target.find('[js="errorMessage"]'), '', '刪除中...');
            target.find('[data-type="action"]').removeClass("disabled");
            delGroupInfo();
        });

        target.on('editGroup', function(e, group) {
            // 清除樣式
            var validator = target.find("form").validate();
            validator.resetForm();
            target.find('.error').removeClass("error");

            target.find('[js="errorMessage"]').html('');
            target.find('[data-type="action"]').button("reset");

            currGroup = group;
            clearModal();
            setModal(currGroup);

            target.modal('show');
        });
    });
});
