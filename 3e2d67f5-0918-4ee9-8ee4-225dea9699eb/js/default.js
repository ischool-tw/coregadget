var GroupManager = GroupManager || {};
GroupManager.connection_student = gadget.getContract('basic.student');
GroupManager.groups = [];

$(document).ready(function () {
    $('[js="join"]').click(function(){
        $('#mainMsg').html('');
        var groupCode = $('#join-Group').val() || '';
        var bExist = false;
        var groupName = '';
        if (groupCode) {
            $(GroupManager.groups).each(function(index, group){
                if (group.GroupCode === groupCode) {
                    groupName = group.GroupName;
                    bExist = true;
                    return false;
                }
            });
            if (!bExist) {
                GroupManager.connection_student.send({
                    service: 'beta.JoinGroup',
                    body: {
                        GroupCode: groupCode
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            GroupManager.Util.msg($('#mainMsg'), 'JoinGroup', error);
                        } else {
                            if (response.Group) {
                                GroupManager.groups.push(response.Group);
                                GroupManager.groups['g'+response.Group.GroupId] = response.Group;
                                $('#join-Group').val('');
                                $('[js="panel_group_list"]').trigger('modifyGroup');

                                $('#mainMsg').html("<div class='alert alert-success'>\n  加入成功！\n</div>");
                                setTimeout("$('#mainMsg').html('')", 1500);
                            }
                        }
                    }
                });
            } else {
                GroupManager.Util.msg($('#mainMsg'), '', '已經是「' + groupName + '」的成員了！');
            }
        } else {
            $('#join-Group').focus();
        }
    });

    $('[js="panel_group_list"]').each(function(index, target){
        target = $(target);
        var groups;

        var clearList = function() {
            target.html('');
        };

        var getGroup = function() {
            GroupManager.groups = [];
            GroupManager.connection_student.send({
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
                        '<div class="my-group">' +
                        '  <div>' + group.GroupName + '</div>' +
                        '  <div data-gid="' + group.GroupId + '" js="quit">' +
                        '    <a href="javascript:void(0);" class="btn" role="button">' +
                        '      <i class="icon-trash"></i>' +
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

        // 點選退出
        target.on('click', '[js="quit"]', function() {
            var groupId = $(this).attr('data-gid');
            var group = GroupManager.groups['g' + groupId];
            $('[js="panel_quit"]').trigger('quitGroup', [GroupManager.groups, group]);
        });

        target.on('modifyGroup', function(e) {
            clearList();
            setGroup(GroupManager.groups);
        });

        // 初始時載入
        getGroup();
    });

    $('[js="panel_quit"]').each(function(index, target){
        target = $(target);
        var currGroup, allGroup;

        var quitGroupMember = function() {
            var GroupId = currGroup.GroupId;
            if (GroupId) {
                GroupManager.connection_student.send({
                    service: "beta.QuitGroup",
                    body: {
                        GroupId: currGroup.GroupId
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js="quit"]').button("reset");
                            GroupManager.Util.msg(target.find('[js="errorMessage"]'), 'QuitGroup', error);
                        } else {
                            var idx = $(allGroup).index(currGroup);
                            if (idx !== -1) {
                                allGroup.splice(idx, 1);
                                allGroup['g' + currGroup.GroupId] = undefined;
                            }
                            $('[js="panel_group_list"]').trigger('modifyGroup');

                            target.find('[js="quit"]').button("reset");
                            target.modal('hide');

                            $('#mainMsg').html("<div class='alert alert-success'>\n  退出成功！\n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                GroupManager.Util.msg(target.find('[js="errorMessage"]'), '', '群組編號不正確，無法刪除！');
                target.find('[js="quit"]').button("reset");
            }
        };

        target.find('[js="quit"]').on('click', function() {
            target.find('[js="quit"]').button("loading");
            quitGroupMember();
        });

        target.on('quitGroup', function(e, groups, group) {
            $('#mainMsg').html('');
            target.find('[js="errorMessage"]').html('');
            target.find('[js="quit"]').button("reset");
            allGroup = groups;
            currGroup = group;
            target.modal('show');
        });
    });
});
