var GroupManager = GroupManager || {};
GroupManager.connection_staff = gadget.getContract('cloud.staff');
GroupManager.connection_public = gadget.getContract('cloud.public');
GroupManager.groups = [];

$(document).ready(function () {
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
        $('#mainMsg').html('');
        var GroupName = $('#create-GroupName').val() || '';

        if (GroupName) {
            GroupManager.connection_staff.send({
                service: 'beta.AddGroup',
                body: {
                    Group: [{
                        GroupName: GroupName
                    }]
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        GroupManager.Util.msg($('#mainMsg'), 'AddGroup', error);
                    } else {
                        if (response.Group) {
                            var request = {
                                GroupId: response.Group.GroupId,
                                GroupName: response.Group.GroupName,
                                GroupCode: response.Group.GroupCode
                            };
                            GroupManager.groups.push(request);
                            GroupManager.groups['g'+response.Group.GroupId] = request;
                            $('#create-GroupName').val('');
                            $('[js="panel_group_list"]').trigger('modifyGroup');

                            $('#mainMsg').html("<div class='alert alert-success'>\n  新增成功！\n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                }
            });
        } else {
            $('#create-GroupName').focus();
        }
    });

    $('[js="panel_group_list"]').each(function(index, target){
        target = $(target);
        var groups;

        var getGroup = function() {
            GroupManager.groups = [];
            GroupManager.connection_staff.send({
                service: "beta.GetMyGroup",
                body: {},
                result: function (response, error, http) {
                    if (error !== null) {
                        GroupManager.Util.msg($('#mainMsg'), 'GetMyGroup', error);
                    } else {
                        if (response.Group) {
                            GroupManager.groups = GroupManager.Util.handle_array(response.Group);
                            groups = GroupManager.groups;
                            $(groups).each(function(index, item){
                                if (!groups['g'+item.GroupId]) {
                                    groups['g'+item.GroupId] = item;
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
                        '<li data-gid="' + group.GroupId + '" js="toInfo"><a href="javascript:void(0);">' + group.GroupName + '</a></li>' +
                        '<li data-gid="' + group.GroupId + '" js="edit">' +
                        '  <a href="javascript:void(0);" role="button">' +
                        '    <i class="icon-edit"></i>' +
                        '  </a>' +
                        '</li>'
                    );
                });
            }
            var items = ret.join('');
            if (items) {
                target.find('ul').html(items);
            } else {
                target.find('ul').html('<li>目前無資料</li>');
            }
        };

        // 點選群組名稱
        target.on('click', 'li[js="toInfo"]:not(".active")', function() {
            target.find('li.active').removeClass('active');
            $(this).addClass('active');
            var groupId = $(this).attr('data-gid');
            var group = GroupManager.groups['g' + groupId];
            $('[js="panel_single_group"]').trigger('changeGroup', group);
        });

        // 點選編輯
        target.on('click', 'li[js="edit"]', function() {
            var groupId = $(this).attr('data-gid');
            var group = GroupManager.groups['g' + groupId];
            $('[js="panel_editGroup"]').trigger('editGroup', group);
        });

        target.on('modifyGroup', function(e) {
            setGroup(GroupManager.groups);
        });

        // 初始時載入
        getGroup();
    });

    $('[js="panel_single_group"]').each(function(index, target){
        target = $(target);
        var currGroup;

        var clearList = function() {
            target.find('[js="groupName"]').html('');
            target.find('[js="groupCode"]').html('');
            target.find('[js="totalMember"]').html('');
            target.find('tbody').html('');
        };

        var refreshCode = function() {
            GroupManager.connection_public.send({
                service: "beta.GetNewCode",
                body: {},
                result: function (response, error, http) {
                    if (error !== null) {
                        GroupManager.Util.msg($('#mainMsg'), 'GetNewCode', error);
                    } else {
                        var newCode = response.Code;
                        GroupManager.connection_staff.send({
                            service: "beta.UpdateGroup",
                            body: {
                                Group: {
                                    GroupId: currGroup.GroupId,
                                    GroupCode: newCode
                                }
                            },
                            result: function (response, error, http) {
                                if (error !== null) {
                                    if (error.dsaError &&
                                        error.dsaError.header &&
                                        error.dsaError.header.DSFault &&
                                        error.dsaError.header.DSFault.Fault) {
                                        if (error.dsaError.header.DSFault.Fault.Code === '905') {
                                            refreshCode();
                                        }
                                    } else {
                                        GroupManager.Util.msg($('#mainMsg'), 'UpdateGroup', error);
                                    }
                                } else {
                                    target.find('[js="groupCode"]').html(newCode);
                                }
                            }
                        });
                    }
                }
            });
        };

        var getMember = function() {
            currGroup.Members = [];
            GroupManager.connection_staff.send({
                service: "beta.GetMyGroupMember",
                body: {
                    GroupId: currGroup.GroupId,
                    StudentStatus: '1'
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        GroupManager.Util.msg($('#mainMsg'), 'GetMyGroupMember', error);
                    } else {
                        if (response.Group && response.Group.Student) {
                            currGroup.Members = GroupManager.Util.handle_array(response.Group.Student);
                            $(currGroup.Members).each(function(index, item){
                                currGroup.Members['s' + item.StudentId] = item;
                            });
                        }
                        setMember(currGroup.Members);
                    }
                }
            });
        };

        var setMember = function(members) {
            var ret = [];
            if (members) {
                $(members).each(function(index, member) {
                    ret.push(
                        '<tr data-sid="' + member.StudentId + '">' +
                        '  <td>' + member.StudentName + '</td>' +
                        '  <td>' +
                        '    <span js="parentCode">' + member.ParentCode + '</span>' +
                        '    <a href="javascript:void(0);"><i class="icon-user"></i></a>' +
                        '  </td>' +
                        '  <td>' +
                        '    <a href="javascript:void(0);" class="btn btn-link" js="remove">' +
                        '      <i class="icon-trash"></i>' +
                        '    </a>' +
                        '  </td>' +
                        '</tr>'
                    );
                });
            }
            var items = ret.join('');
            target.find('[js="totalMember"]').html(ret.length);

            if (items) {
                target.find('tbody').html(items);
            } else {
                target.find('tbody').html('<tr><td colspan="3">目前無資料</td></tr>');
            }
        };

        var getParent = function(sid, callback) {
            var items = [];
            if (sid) {
                GroupManager.connection_staff.send({
                    service: "beta.GetStudentParent",
                    body: {
                        StudentId: sid,
                        Kind: 'group'
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            set_error_message('#mainMsg', 'GetStudentParent', error);
                        } else {
                            if (response.Student && response.Student.Parent) {
                                $(response.Student.Parent).each(function(index, item) {
                                    items.push('<p>' + item.LastName + item.FirstName + '</p>');
                                });
                            } else {
                                items.push('目前無資料');
                            }
                            if (callback && $.isFunction(callback)) {
                                callback(items.join(''));
                            }
                        }
                    }
                });
            }
        };

        target.find('[js="refresh"]').click(function(){
            if (currGroup) {
                refreshCode();
            }
        });

        target.on('click', '[js="remove"]', function(){
            var sid = $(this).closest('tr').attr('data-sid');
            var student = currGroup.Members['s' + sid];
            $('[js="panel_remove"]').trigger('removeStudent', [currGroup, student]);
        });

        target.on('hover', 'i.icon-user', function(event){
            var sid = $(this).closest('tr').attr('data-sid');
            var that = $(this);
            if (sid && that.attr('data-parent')!=='y') {
                that.attr('data-parent', 'y');
                getParent(sid, function(parents){
                    that.popover({
                        title: '家長',
                        content: parents
                    });
                    that.popover('show');
                });
            }
        });

        target.on('changeGroup', function(e, group){
            clearList();
            if (group) {
                currGroup = group;
                target.find('[js="groupName"]').html(currGroup.GroupName);
                target.find('[js="groupCode"]').html(currGroup.GroupCode);
                getMember();
            } else {
                currGroup = group;
            }
        });

        target.on('reloadMember', function(e){
            setMember(currGroup.Members);
        });
    });

    $('[js="panel_editGroup"]').each(function(index, target){
        target = $(target);
        var currGroup;

        var clearModal = function() {
            $('#mainMsg').html('');
            target.find('h3').html('');
            target.find('[name="edit-GroupName"]').val('');
        };

        var setModal = function(group) {
            if (group) {
                target.find('h3').html('修改群組名稱');
                target.find('[name="edit-GroupName"]').val(group.GroupName || '');
            } else {
                target.find('h3').html('新增群組名稱');
            }
        };

        // 儲存
        var saveGroupInfo = function() {
            var group = currGroup;
            var GroupName = target.find('[name="edit-GroupName').val() || '';
            var groupId;

            if (GroupName) {
                var request = {
                    GroupName: GroupName
                };

                if (group) {
                    groupId = group.GroupId;
                    var send = {
                        action: 'update',
                        successMsg: '儲存成功',
                        service: 'beta.UpdateGroup',
                        body: {
                            Group: [{
                                GroupId: groupId,
                                GroupName: GroupName
                            }]
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
                            $.extend(GroupManager.groups['g'+groupId], request);
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
                            target.find('.modal-footer a.btn[js]').removeClass("disabled");
                            GroupManager.Util.msg(target.find('[js="errorMessage"]'), 'DelGroup', error);
                        } else {
                            var idx = $(GroupManager.groups).index(currGroup);
                            if (idx !== -1) {
                                GroupManager.groups.splice(idx, 1);
                                GroupManager.groups['g' + currGroup.groupId] = undefined;
                            }
                            target.find('.modal-footer a.btn[js]').removeClass("disabled");
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
                target.find('.modal-footer a.btn[js]').removeClass("disabled");
            }
        };

        target.modal({
            show: false
        });

        target.on("hidden", function() {
            target.find('[js="errorMessage"]').html('');
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
            target.find('.modal-footer a.btn[js]').addClass("disabled");
            delGroupInfo();
        });

        target.on('editGroup', function(e, group) {
            if (group) {
                // 清除樣式
                var validator = target.find("form").validate();
                validator.resetForm();
                target.find('.error').removeClass("error");

                target.find('[js="errorMessage"]').html('');
                target.find('[js="save"]').button("reset");

                currGroup = group;
                clearModal();
                setModal(currGroup);

                target.modal('show');
            }
        });
    });

    $('[js="panel_remove"]').each(function(index, target){
        target = $(target);
        var currGroup, currStudent;

        var delGroupMember = function() {
            var StudentId = currStudent.StudentId;
            if (StudentId) {
                GroupManager.connection_staff.send({
                    service: "beta.DelGroupMember",
                    body: {
                        Group: {
                            GroupId: currGroup.GroupId,
                            StudentId: StudentId
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js="delete"]').button("reset");
                            GroupManager.Util.msg(target.find('[js="errorMessage"]'), 'DelGroupMember', error);
                        } else {
                            var idx = $(currGroup.Members).index(currStudent);
                            if (idx !== -1) {
                                currGroup.Members.splice(idx, 1);
                                currGroup.Members['s' + currStudent.StudentId] = undefined;
                            }
                            $('[js="panel_single_group"]').trigger('reloadMember');

                            target.find('[js="delete"]').button("reset");
                            target.modal('hide');

                            GroupManager.Util.msg($('#mainMsg'), '', '刪除成功！');
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                GroupManager.Util.msg(target.find('[js="errorMessage"]'), '', '學生編號不正確，無法刪除！');
                target.find('[js="delete"]').button("reset");
            }
        };

        target.find('[js="delete"]').on('click', function() {
            target.find('[js="delete"]').button("loading");
            delGroupMember();
        });

        target.on('removeStudent', function(e, group, student) {
            $('#mainMsg').html('');
            target.find('[js="errorMessage"]').html('');
            target.find('[js="delete"]').button("reset");
            currGroup = group;
            currStudent = student;
            target.modal('show');
        });
    });
});
