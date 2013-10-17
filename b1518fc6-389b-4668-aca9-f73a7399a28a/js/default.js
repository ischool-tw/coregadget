var GroupManager = GroupManager || {};
GroupManager.connection_teacher = gadget.getContract('cloud.teacher');
GroupManager.connection_public = gadget.getContract('cloud.public');
GroupManager.connection_guest = gadget.getContract('cloud.guest');
GroupManager.groups = [];

$(document).ready(function () {
    GroupManager.system_category = gadget.params.system_category || "campus";

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
            GroupManager.connection_teacher.send({
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
                            GroupManager.groups.unshift(request);
                            GroupManager.groups['g'+response.Group.GroupId] = request;
                            $('#create-GroupName').val('');
                            $('[js="panel_group_list"]').trigger('modifyGroup', request.GroupId);

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
            GroupManager.connection_teacher.send({
                service: "beta.GetMyGroup",
                body: {},
                result: function (response, error, http) {
                    if (error !== null) {
                        GroupManager.Util.msg($('#mainMsg'), 'GetMyGroup', error);
                    } else {
                        var first_groupId = 0;
                        if (response.Group) {
                            GroupManager.groups = GroupManager.Util.handle_array(response.Group);
                            groups = GroupManager.groups;
                            $(groups).each(function(index, item){
                                if (index === 0) { first_groupId = item.GroupId; }
                                if (!groups['g'+item.GroupId]) {
                                    groups['g'+item.GroupId] = item;
                                }
                            });
                        }
                        setGroup(groups, first_groupId);
                    }
                }
            });
        };

        var setGroup = function(groups, groupId) {
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
                if (groupId) {
                    target.find('li[js="toInfo"][data-gid="' + groupId + '"]').trigger('click');
                }
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

        target.on('modifyGroup', function(e, groupId) {
            setGroup(GroupManager.groups, groupId);
        });

        // 初始時載入
        getGroup();
    });

    $('[js="panel_single_group"]').each(function(index, target){
        target = $(target);
        var currGroup;

        var clearList = function() {
            $('div.popover').remove();
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
                        GroupManager.connection_teacher.send({
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
            GroupManager.connection_teacher.send({
                service: "beta.GetMyGroupMember",
                body: {
                    GroupId: currGroup.GroupId
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
                $(members.sort($.by('asc', 'SeatNo'))).each(function(index, member) {
                    ret.push(
                        '<tr data-sid="' + member.StudentId + '">' +
                        '  <td>' + member.SeatNo + '</td>' +
                        '  <td>' + member.StudentName + '</td>' +
                        '  <td>' +
                        '    <a href="javascript:void(0);"><i class="icon-user"></i></a>' +
                        '    <span class="monospaced" js="parentCode">' + (member.ParentCode || '未設定') + '</span>' +
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
                target.find('tbody').html('<tr><td colspan="4">目前無資料</td></tr>');
            }
        };

        var getParent = function(sid, callback) {
            var items = [];
            if (sid) {
                GroupManager.connection_teacher.send({
                    service: "beta.GetStudentParent",
                    body: {
                        StudentId: sid,
                        Kind: 'group',
                        KindId: currGroup.GroupId
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            set_error_message('#mainMsg', 'GetStudentParent', error);
                        } else {
                            if (response.Student && response.Student.Parent) {
                                $(response.Student.Parent).each(function(index, item) {
                                    items.push('<p>' + (item.ParentName || '未設定姓名') + '</p>');
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

        target.find('[js="empty"]').click(function(){
            GroupManager.connection_teacher.send({
                service: "beta.UpdateGroup",
                body: {
                    Group: {
                        GroupId: currGroup.GroupId,
                        GroupCode: ''
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        GroupManager.Util.msg($('#mainMsg'), 'UpdateGroup', error);
                    } else {
                        target.find('[js="groupCode"]').html('');
                    }
                }
            });
        });

        target.find('[js="joinMember"]').click(function(){
            if (currGroup) {
                $('[js="panel_joinMember"]').trigger('addMember', currGroup);
            }
        });

        target.on('click', '[js="remove"]', function(){
            var sid = $(this).closest('tr').attr('data-sid');
            var student = currGroup.Members['s' + sid];
            $('[js="panel_remove"]').trigger('removeStudent', [currGroup, student]);
        });

        target.on('mouseenter mouseleave', 'i.icon-user', function(event){
            var that = $(this);
            var sid = that.closest('tr').attr('data-sid');
            if (event.type === 'mouseenter') {
                if (that.data('popover')
                    && that.data('popover').options
                    && that.data('popover').options.title) {
                    that.popover('show');
                } else if (sid) {
                    that.removeData('popover');
                    getParent(sid, function(parents){
                        that.popover({
                            title: '家長',
                            content: parents
                        });
                        that.popover('show');
                    });
                }
            } else {
                that.popover('hide');
            }
        });

        target.on('changeGroup', function(e, group){
            clearList();
            if (group) {
                currGroup = group;
                target.find('tbody').html('<tr><td colspan="4">載入中...</td></tr>');
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
            var groupName = target.find('[name="edit-GroupName').val() || '';
            var groupId;

            if (groupName) {
                var request = {
                    GroupName: groupName
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
                                GroupName: groupName
                            }]
                        }
                    };
                }

                GroupManager.connection_teacher.send({
                    service: send.service,
                    body: send.body,
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js="save"]').button("reset");
                            GroupManager.Util.msg(target.find('[js="errorMessage"]'), send.service, error);
                        } else {
                            $.extend(GroupManager.groups['g'+groupId], request);
                            $('[js="panel_group_list"]').trigger('modifyGroup', request.GroupId);

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
                GroupManager.connection_teacher.send({
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
                            $('[js="panel_group_list"]').trigger('modifyGroup', null);
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
            var studentId = currStudent.StudentId;
            if (studentId) {
                GroupManager.connection_teacher.send({
                    service: "beta.DelGroupMember",
                    body: {
                        Group: {
                            GroupId: currGroup.GroupId,
                            StudentId: studentId
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

    $('[js="panel_joinMember"]').each(function(index, target){
        target = $(target);
        var currGroup, bClasses = false, bCourses = false;
        var classes = [], courses = [];

        var clearModal = function() {
            $('#mainMsg').html('');
            target.find('[name="mainChoose"]').val('').prepend('<option value=""></option>');
            target.find('[name="subChoose"]').val('').html('');
            target.find('[js="subPanel_list"]').addClass('hide');
            target.find('[js="subPanel_members"]').addClass('hide').find('[js="chooseMember"]').html('');
            target.find('[js="subPanel_invite"]').addClass('hide').find('[name="email"]').val('');
            target.find('[js="controlCKB"]').closest('p').addClass('hide');
            target.find('[js="controlCKB"]').prop('checked', false);
        };

        var setModal = function() {
            var finish = function() {
                if (bClasses && bCourses) {
                    target.find('[name="mainChoose"]').removeClass('disabled').prop('disabled', false);
                    target.find('[name="mainChoose"] option[value="invite"]').remove();
                }
            };

            var getClass = function() {
                GroupManager.connection_teacher.send({
                    service: "beta.GetMyClass",
                    body: {},
                    result: function (response, error, http) {
                        if (error !== null) {
                            GroupManager.Util.msg(target.find('[js="errorMessage"]'), send.service, error);
                        } else {
                            if (response.Class) {
                                classes = GroupManager.Util.handle_array(response.Class);
                                $(classes).each(function(index, clasx){
                                    classes['class'+clasx.ClassId] = clasx;
                                });
                            }
                            bClasses = true;
                            finish();
                        }
                    }
                });
            };

            var getCourse = function() {
                GroupManager.connection_teacher.send({
                    service: "beta.GetMyCourse",
                    body: {CurrentSemester: 'true'},
                    result: function (response, error, http) {
                        if (error !== null) {
                            GroupManager.Util.msg(target.find('[js="errorMessage"]'), send.service, error);
                        } else {
                            if (response.Course) {
                                courses = GroupManager.Util.handle_array(response.Course);
                                $(courses).each(function(index, course){
                                    courses['course'+course.CourseId] = course;
                                });
                            }
                            bCourses = true;
                            finish();
                        }
                    }
                });
            };

            if (GroupManager.system_category === 'campus') {
                if (bClasses && bCourses) {
                    finish();
                } else {
                    target.find('[name="mainChoose"]').addClass('disabled').prop('disabled', true);
                    getClass();
                    getCourse();
                }
            } else {
                target.find('[name="mainChoose"] option[value="class"]').remove();
                target.find('[name="mainChoose"] option[value="course"]').remove();
                target.find('[name="mainChoose"]').removeClass('disabled').prop('disabled', false);
                target.find('[name="mainChoose"] option:first').trigger('change');
            }
        };

        var getStudent = function(kind, id) {
            var send = {};
            if (!(kind && id)) return;

            var getData = function(send){
                GroupManager.connection_teacher.send({
                    service: send.service,
                    body: send.body,
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js="join"]').button("reset");
                            GroupManager.Util.msg(target.find('[js="errorMessage"]'), send.service, error);
                        } else {
                            send.callback(response);
                        }
                    }
                });
            }

            if (kind === 'class') {
                if (classes['class' + id].students) {
                    setStudent(classes['class' + id].students);
                } else {
                    send = {
                        service  : 'beta.GetMyClassStudent',
                        body     : {ClassId: id, StudentStatus: '1'},
                        callback : function(response) {
                            classes['class' + id].students = GroupManager.Util.handle_array(response.Student);
                            setStudent(classes['class' + id].students);
                        }
                    }
                    getData(send);
                }
            } else {
                if (courses['course' + id].students) {
                    setStudent(courses['course' + id].students);
                } else {
                    send = {
                        service  : 'beta.GetMyCourseStudent',
                        body     : {CourseId: id, StudentStatus: '1'},
                        callback : function(response) {
                            var stu;
                            if (response.Course && response.Course.Student) {
                                stu = GroupManager.Util.handle_array(response.Course.Student);
                            }
                            courses['course' + id].students = stu || [];
                            setStudent(courses['course' + id].students);
                        }
                    }
                    getData(send);
                }
            }
        };

        var setStudent = function(students) {
            var items = [];
            if (students) {
                $(students).each(function(index, student){
                    if (!(currGroup.Members && currGroup.Members['s' + student.StudentId])) {
                        items.push('<label class="checkbox">' +
                          '<input type="checkbox" data-sid="' + student.StudentId + '" data-seatno="' + student.SeatNo + '">' +
                          student.StudentName +
                          '</label>');
                    }
                });
            }
            if (items.length) {
                target.find('[js="chooseMember"]').html(items.join(''));
                target.find('[js="controlCKB"]').closest('p').removeClass('hide');
            } else {
                target.find('[js="chooseMember"]').html('<p>所有學生已加入。</p>');
            }
        };

        // 儲存
        var joinNewMember = function() {
            var groupId = currGroup.GroupId;
            var students = target.find('[js="chooseMember"] :checkbox:checked').map(function(){
                var stu = {
                    StudentId: $(this).attr('data-sid')
                    // SeatNo: $(this).attr('data-seatno')
                };
                return stu;
            }).get();
            if (groupId) {
                GroupManager.connection_teacher.send({
                    service: "beta.JoinMyGroupMember",
                    body: {
                        Group: {
                            GroupId: groupId,
                            Student: students
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js="join"]').button("reset");
                            GroupManager.Util.msg(target.find('[js="errorMessage"]'), 'JoinMyGroupMember', error);
                        } else {
                            target.find('[js="join"]').button("reset");
                            target.modal('hide');
                            $('[js="panel_single_group"]').trigger('changeGroup', currGroup);

                            $('#mainMsg').html("<div class='alert alert-success'>\n 加入成功！ \n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                GroupManager.Util.msg(target.find('[js="errorMessage"]'), '', '編號不正確，無法加入！');
                target.find('[js="join"]').button("reset");
            }
        };

        target.on("hidden", function() {
            target.find('[js="errorMessage"]').html('');
        });

        target.on('change', '[name="mainChoose"]', function(){
            target.find('[name="mainChoose"] option[value=""]').remove();
            target.find('[name="subChoose"]').html('<option>載入中...</option>').addClass('disabled').prop('disabled', true);
            target.find('[js="subPanel_list"]').addClass('hide');
            target.find('[js="subPanel_members"]').addClass('hide').find('[js="chooseMember"]').html('');
            target.find('[js="subPanel_invite"]').addClass('hide').find('[name="email"]').val('');
            target.find('[js="controlCKB"]').closest('p').addClass('hide');
            var items = [];
            switch ($(this).val()) {
                case 'class':
                    if (classes.length) {
                        items.push('<option value=""></option>');
                        $(classes).each(function(index, clasx){
                            items.push('<option value="' + clasx.ClassId + '">' + clasx.ClassName + '</option>');
                        });
                    } else {
                        items.push('<option value="">目前無資料</option>');
                    }
                    target.find('[js="subPanel_list"]').removeClass('hide')
                        .find('[name="subChoose"]').html(items.join('')).removeClass('disabled').prop('disabled', false)
                        .find('option:first').trigger('change');
                    target.find('[js="controlCKB"]').prop('checked', false);
                    break;
                case 'course':
                    if (courses.length) {
                        items.push('<option value=""></option>');
                        $(courses).each(function(index, course){
                            items.push('<option value="' + course.CourseId + '">' + course.CourseName + '</option>');
                        });
                    } else {
                        items.push('<option value="">目前無資料</option>');
                    }
                    target.find('[js="subPanel_list"]').removeClass('hide')
                        .find('[name="subChoose"]').html(items.join('')).removeClass('disabled').prop('disabled', false)
                        .find('option:first').trigger('change');
                    target.find('[js="controlCKB"]').prop('checked', false);
                    break;
                case 'invite':
                    target.find('[js="subPanel_invite"]').removeClass('hide');
                    break;
            }
        });

        target.on('change', '[name="subChoose"]', function(){
            if ($(this).val()) {
                target.find('[name="subChoose"] option[value=""]').remove();
                target.find('[js="chooseMember"]').html('載入中...');
                target.find('[js="subPanel_members"]').removeClass('hide');
                target.find('[js="controlCKB"]').closest('p').addClass('hide');
                var kind = target.find('[name="mainChoose"]').val() || '';
                getStudent(kind, $(this).val());
            }
        });

        target.on('change', '[js="controlCKB"]', function(){
            target.find('[js="chooseMember"] :checkbox').prop('checked', $(this).prop('checked'));
        });

        target.find('[js="join"]').on('click', function() {
            target.find('[js="errorMessage"]').html('');
            var kind = target.find('[name="mainChoose"]').val();
            if (kind === 'class' || kind === 'course') {
                if (target.find('[js="chooseMember"] :checkbox:checked').length) {
                    // 驗證通過
                    $(this).button("loading");
                    joinNewMember();
                } else {
                    GroupManager.Util.msg(target.find('[js="errorMessage"]'), '', '您尚未選擇新增名單');
                }
            } else if (kind === 'invite') {
                // 發送邀請
                if (target.find('[name="email"]').val()) {
                    $(this).button("loading");

                    var getMyInfo = function(callback) {
                        if (GroupManager.TeacherName) {
                            if (callback && $.isFunction(callback)) {
                                callback(GroupManager.TeacherName);
                            }
                        } else {
                            GroupManager.connection_teacher.send({
                                service: "beta.GetMyInfo",
                                body: {},
                                result: function (response, error, http) {
                                    if (error !== null) {
                                        target.find('[js="join"]').button("reset");
                                        GroupManager.Util.msg(target.find('[js="errorMessage"]'), 'GetMyInfo', error);
                                    } else {
                                        GroupManager.TeacherName = response.TeacherName || '';
                                    }
                                    if (callback && $.isFunction(callback)) {
                                        callback(GroupManager.TeacherName);
                                    }
                                }
                            });
                        }
                    };

                    var sendMail = function(teacherName) {
                        var content = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">' +
                          '<html>' +
                            '<head>' +
                              '<META http-equiv="Content-Type" content="text/html; charset=utf-8">' +
                            '</head>' +
                            '<body>' +
                              '<div>' +
                                '<div style="line-height:23px;padding:0 20px 20px 20px;border:1px solid #ccc;color:#666">' +
                                  '<h1 style="padding-bottom:15px;border-bottom:1px solid #ccc">雲端學院 邀請函</h1>' +
                                  '<h3>您好：</h3>' +
                                  '<p>誠擎的邀請您加入雲端學院的「' + currGroup.GroupName + '」群組。</p>' +
                                  '<p>請您登入 <a href="https://web2.ischool.com.tw/?school=classroom" target="_blank">雲端學院</a> ，點選「學生」身份的「群組」小工具，輸入群組編號「' + currGroup.GroupCode + '」立即加入我們吧！</p>' +
                                  '<br /><p>如果您尚未註冊，請先註冊並「成為學生」。</p>' +
                                  '<p style="text-align:right">' + teacherName + ' 敬啟</p>' +
                                  '<p style="font-size:12px;text-align:center;padding-top:15px;border-top:1px solid #ccc"><a href="http://www.ischool.com.tw" target="_blank">www.ischool.com.tw</a>　服務信箱：<a href="mailto:support@ischool.com.tw" target="_blank">support@ischool.com.tw</a></p>' +
                                '</div>' +
                              '</div>' +
                            '</body>' +
                          '</html>';

                        GroupManager.connection_guest.send({
                            service: "beta.SendMail",
                            body: {
                                Request: {
                                    Receiver    : target.find('[name="email"]').val(),
                                    Subject     : teacherName + '邀請您加入群組',
                                    HtmlContent : content
                                }
                            },
                            result: function (response, error, http) {
                                if (error !== null) {
                                    target.find('[js="join"]').button("reset");
                                    GroupManager.Util.msg(target.find('[js="errorMessage"]'), 'SendMail', error);
                                } else {
                                    target.find('[js="join"]').button("reset");
                                    target.modal('hide');
                                    $('#mainMsg').html("<div class='alert alert-success'>\n  送出成功！\n</div>");
                                    setTimeout("$('#mainMsg').html('')", 1500);
                                }
                            }
                        });
                    };

                    getMyInfo(sendMail);

                } else {
                    GroupManager.Util.msg(target.find('[js="errorMessage"]'), '', '請輸入Email');
                }
            }
        });

        target.on('addMember', function(e, group) {
            if (group) {
                target.find('[js="errorMessage"]').html('');
                target.find('[js="join"]').button("reset");

                currGroup = group;
                clearModal();
                setModal();

                target.modal('show');
            }
        });
    });
});
