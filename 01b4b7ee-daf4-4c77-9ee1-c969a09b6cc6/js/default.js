var ParentManager = ParentManager || {};
ParentManager.connection_public = gadget.getContract("basic.public");
ParentManager.connection_student = gadget.getContract("basic.student");
ParentManager.parents = [];

jQuery(function () {
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

    $('[js="create"').click(function(){
        $('[js="editParent"]').trigger('editParent', null);
    });

    $('[js="configCode"]').each(function(index, target){
        target = $(target);

        var init = function() {
            ParentManager.connection_student.send({
                service: "beta.GetMyInfo",
                body: {},
                result: function (response, error, http) {
                    if (error !== null) {
                        ParentManager.Util.msg($('#mainMsg'), 'GetMyInfo', error);
                    } else {
                        target.find('[js="parentCode"]').html(response.ParentCode || '');
                    }
                }
            });
        };

        var refreshCode = function() {
            ParentManager.connection_public.send({
                service: "beta.GetNewCode",
                body: {},
                result: function (response, error, http) {
                    if (error !== null) {
                        ParentManager.Util.msg($('#mainMsg'), 'GetNewCode', error);
                    } else {
                        var newCode = response.Code;
                        ParentManager.connection_student.send({
                            service: "beta.UpdateMyInfo",
                            body: {
                                ParentCode: newCode
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
                                        ParentManager.Util.msg($('#mainMsg'), 'UpdateMyInfo', error);
                                    }
                                } else {
                                    target.find('[js="parentCode"]').html(newCode);
                                }
                            }
                        });
                    }
                }
            });
        };

        target.find('[js="refresh"]').click(function(){
            refreshCode();
        });

        target.find('[js="empty"]').click(function(){
            ParentManager.connection_student.send({
                service: "beta.UpdateMyInfo",
                body: {
                    ParentCode: ''
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        ParentManager.Util.msg($('#mainMsg'), 'UpdateMyInfo', error);
                    } else {
                        target.find('[js="parentCode"]').html('');
                    }
                }
            });
        });

        init();
    });

    $('#parentDBTable').each(function(index, target){
        target = $(target);

        var getParentInfo = function() {
            ParentManager.connection_student.send({
                service: "beta.GetMyParent",
                body: {},
                result: function (response, error, http) {
                    if (error !== null) {
                        ParentManager.Util.msg($('#mainMsg'), 'GetMyParent', error);
                    } else {
                        ParentManager.parents = ParentManager.Util.handle_array(response.StudentParent);
                        var parents = ParentManager.parents;
                        $(response.StudentParent).each(function(index, parent){
                            parents['p' + parent.RelationId] = parent;
                        });
                        setParentInfo(parents);
                    }
                }
            });
        };

        var setParentInfo = function(parents) {
            var ret = [];
            if (parents) {
                $(parents).each(function(index, parent) {
                    ret.push(
                        '<tr relationId="' + parent.RelationId + '">' +
                        '    <td>' + (parent.LastName || '') + (parent.FirstName || '') + '</td>' +
                        '    <td>' + (parent.RelationName || '') + '</td>' +
                        '    <td>' + (parent.LinkAccount || '') + '</td>' +
                        '    <td>' +
                        '      <a href="#" role="button" js="edit"><i class="icon-edit"></i></a>' +
                        '    </td>' +
                        '    <td>' +
                        '      <a href="#" role="button" js="delete"><i class="icon-trash"></i></a>' +
                        '    </td>' +
                        '</tr>'
                    );
                });
            }
            var items = ret.join('');
            if (items) {
                target.find('tbody').html(items);
            } else {
                target.find('tbody').html('<tr><td colspan="5">目前無資料</td></tr>');
            }
        };

        // 點選編輯
        target.on('click', 'tr a[js="edit"]', function() {
            var relationId = $(this).closest('tr').attr('relationId');
            $('[js="editParent"]').trigger('editParent', relationId);
        });
        target.on('click', 'tr a[js="delete"]', function() {
            var relationId = $(this).closest('tr').attr('relationId');
            $('[js="delParent"]').trigger('delParent', relationId);
        });

        target.on('modifyParent', function(e) {
            setParentInfo(ParentManager.parents);
        });

        // 初始時載入
        getParentInfo();
    });

    $('[js="editParent"]').each(function(index, target){
        target = $(target);

        var currParent;

        var clearModal = function() {
            target.find('h3').html('');
            target.find('[name="edit-LastName"]').val('');
            target.find('[name="edit-FirstName"]').val('');
            target.find('[name="edit-RelationName"]').val('');
            target.find('[name="edit-LinkAccount"]').val('');
        };

        var setModal = function(parent) {
            if (parent) {
                target.find('h3').html('資料修改');
                target.find('[name="edit-LastName"]').val(parent.LastName || '');
                target.find('[name="edit-FirstName"]').val(parent.FirstName || '');
                target.find('[name="edit-RelationName"]').val(parent.RelationName || '');
                target.find('[name="edit-LinkAccount"]').val(parent.LinkAccount || '');
            } else {
                target.find('h3').html('新增');
            }
        };

        // 儲存家長
        var saveParentInfo = function() {
            var parent = currParent;
            var linkAccount = target.find('[name="edit-LinkAccount').val() || '';
            var relationId;

            if (linkAccount) {
                var lastName = target.find('[name="edit-LastName"]').val() || '';
                var firstName = target.find('[name="edit-FirstName"]').val() || '';
                var relationName = target.find('[name="edit-RelationName"]').val() || '';

                var request = {
                    LastName: lastName,
                    FirstName: firstName,
                    RelationName: relationName,
                    LinkAccount: linkAccount
                };

                var send;
                if (parent) {
                    relationId = parent.RelationId;
                    send = {
                        action: 'update',
                        successMsg: '儲存成功',
                        service: 'beta.UpdateMyParent',
                        body: {
                            Parent: [{
                                RelationId: relationId,
                                LastName: lastName,
                                FirstName: firstName,
                                RelationName: relationName,
                                LinkAccount: linkAccount
                            }]
                        }
                    };
                } else {
                    send = {
                        action: 'add',
                        successMsg: '新增成功',
                        service: 'beta.AddMyParent',
                        body: {
                            Parent: [{
                                LastName: lastName,
                                FirstName: firstName,
                                RelationName: relationName,
                                LinkAccount: linkAccount
                            }]
                        }
                    };
                }

                ParentManager.connection_student.send({
                    service: send.service,
                    body: send.body,
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js="save"]').button("reset");
                            ParentManager.Util.msg(target.find('[js="errorMessage"]'), send.service, error);
                        } else {
                            if (send.action === 'add') {
                                request.RelationId = response.NewId;
                                ParentManager.parents.push(request);
                                ParentManager.parents['p'+request.RelationId] = request;
                            } else {
                                $.extend(ParentManager.parents['p'+relationId], request);
                            }
                            $('#parentDBTable').trigger('modifyParent');

                            target.modal('hide');
                            $('#mainMsg').html("<div class='alert alert-success'>\n  " + send.successMsg + "\n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                target.find('[js="save"]').button("reset");
                ParentManager.Util.msg(target.find('[js="errorMessage"]'), '', '帳號為必填值！');
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
                saveParentInfo();
            }
        });

        target.on('editParent', function(e, relationId) {
            // 清除樣式
            var validator = target.find("form").validate();
            validator.resetForm();
            target.find('.error').removeClass("error");

            target.find('[js="save"]').button("reset");

            currParent = (relationId) ? ParentManager.parents['p'+relationId] : null;
            clearModal();
            setModal(currParent);

            target.modal('show');
        });

    });

    $('[js="delParent"]').each(function(index, target){
        target = $(target);

        var currParent;

        var delParentInfo = function() {
            var relationId = currParent.RelationId;
            if (relationId) {
                ParentManager.connection_student.send({
                    service: "beta.DelMyParent",
                    body: {
                        RelationId: relationId
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js="delete"]').button("reset");
                            ParentManager.Util.msg(target.find('[js="errorMessage"]'), 'DelMyParent', error);
                        } else {
                            var idx = $(ParentManager.parents).index(currParent);
                            if (idx !== -1) {
                                ParentManager.parents.splice(idx, 1);
                                ParentManager.parents['p' + currParent.RelationId] = undefined;
                            }
                            $('#parentDBTable').trigger('modifyParent');

                            target.find('[js="delete"]').button("reset");
                            target.modal('hide');

                            ParentManager.Util.msg($('#mainMsg'), '', '刪除成功！');
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                ParentManager.Util.msg(target.find('[js="errorMessage"]'), '', '家長編號不正確，無法刪除！');
                target.find('[js="delete"]').button("reset");
            }
        };

        target.find('[js="delete"]').on('click', function() {
            target.find('[js="delete"]').button("loading");
            delParentInfo(currParent);
        });

        target.on('delParent', function(e, relationId) {
            target.find('[js="save"]').button("reset");
            currParent = (relationId) ? ParentManager.parents['p'+relationId] : null;
            target.modal('show');
        });

    });
});

