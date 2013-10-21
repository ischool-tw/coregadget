var StudentManager = StudentManager || {};
StudentManager.connection_public = gadget.getContract("cloud.public");
StudentManager.connection_staff = gadget.getContract("cloud.staff");

jQuery(function () {
    $('#myTab')
        .click(function() {
            $(this).find('li.active').removeClass('active');
        })
        .find('a').click(function(){
            $('#tabName').html($(this).html());
        })
        .first().trigger('click');

    // scroll bar
    $('.my-scrollbar2, #namelist').alternateScroll();

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

    // tooltip
    $('div[rel=tooltip]').tooltip({'trigger':'hover'});

    // 點選新增學生
    $('#addstudent').click(function() {
        $('#editModal').trigger('editStudent', null);
    });

    // 搜尋
    $("#filter-keyword").on('change', function() {
        var keyword = $('#filter-keyword').val();
        if (keyword.length >= 2) {
            var allStudents = [];
            $(StudentManager.students).each(function(index, student){
                if (student.StudentName.indexOf($("#filter-keyword").val()) !== -1
                    || student.LinkAccount.indexOf($("#filter-keyword").val()) !== -1
                    || student.StudentNumber.indexOf($("#filter-keyword").val()) !== -1
                ) {
                    allStudents.push(student);
                }
            });
            $('#namelist').trigger('resetListEvent', ['keyword', allStudents]);
        } else {
            $('#filter-keyword').tooltip('show');
        }
    });

    // 班級列表
    $('#class-list').each(function(index, target) {
        target = $(target);

        // 取得全部班級資訊
        var getAllClassList = function(callback) {
            StudentManager.connection_staff.send({
                service: "beta.GetClass",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        StudentManager.Util.msg('#mainMsg', 'GetClass', error);
                    } else {
                        StudentManager.classes = [];
                        StudentManager.classes.GradeYear = [];
                        StudentManager.classes.ColGradeYearClasses = {};
                        if (response.Class) {
                            response.Class = StudentManager.Util.handle_array(response.Class);
                            response.Class.push({
                                ClassId: '',
                                ClassName: '',
                                GradeYear: ''
                            });
                            $(response.Class).each(function(index, clasx) {
                                if (!StudentManager.classes.ColGradeYearClasses['year'+clasx.GradeYear]) {
                                    StudentManager.classes.GradeYear.push(clasx.GradeYear);
                                    StudentManager.classes.ColGradeYearClasses['year'+clasx.GradeYear] = [];
                                }
                                StudentManager.classes.ColGradeYearClasses['year'+clasx.GradeYear].push(clasx);
                                StudentManager.classes['clasx'+clasx.ClassId] = clasx;
                                StudentManager.classes.push(clasx);
                            });
                        }
                        if (callback && $.isFunction(callback)) {
                            callback(StudentManager.classes);
                        }
                    }
                }
            });
        };

        // 顯示班級清單
        var setClassList = function(classes) {
            var ret = [];
            if (classes.GradeYear) {
                $(classes.GradeYear).each(function(index, gradeYear){
                    ret.push(
                        '<div class="accordion-group">' +
                        '    <div class="accordion-heading my-nav-header">' +
                        '        <a class="accordion-toggle" data-toggle="collapse" data-parent="#class-list" href="#collapse' + gradeYear + '">' +
                        '            <i class="icon-folder-open"></i> ' + (gradeYear || '未分') + '年級 <span js="year' + gradeYear + '"></span>' +
                        '        </a>' +
                        '    </div>' +
                        '    <div id="collapse' + gradeYear + '" class="accordion-body collapse">' +
                        '        <div class="accordion-inner">' +
                        '            <ul class="nav nav-tabs nav-stacked">'
                    );

                    var yearClasses = classes.ColGradeYearClasses['year'+gradeYear];
                    if (yearClasses) {
                        yearClasses = yearClasses.sort(StudentManager.Util.comparer);
                        $(yearClasses).each(function(index, clasx){
                            ret.push(
                                '<li classId="' + clasx.ClassId + '">' +
                                '    <a href="#">' + (clasx.ClassName || '未分班') +
                                '<span js="class' + clasx.ClassId + '"></span>' +
                                '  <i class="icon-chevron-right pull-right icon-white"></i>' +
                                '</a></li>'
                            );
                        });
                    }

                    ret.push(
                        '            </ul>' +
                        '        </div>' +
                        '    </div>' +
                        '</div>'
                    );
                });
            }

            var items = ret.join('');
            if (items) {
                $('#class-list').html(items);
            } else {
                $('#class-list').html('目前無資料');
            }
        };

        // 編輯時班級自動選單
        var setAutoComplete = function(classes) {
            var classNames = [];
            $(classes).each(function(index, clasx){
               classNames.push(clasx.ClassName);
            })
            $('#edit-ClassName').autocomplete({
                source: classNames
            });
        };

        // 取得全部學生資訊
        var getStudent = function(callback) {
            var classes = StudentManager.classes;
            StudentManager.connection_staff.send({
                service: "beta.GetStudent",
                body: {StudentStatus: '1, 2'},
                result: function (response, error, http) {
                    if (error !== null) {
                        StudentManager.Util.msg('#mainMsg', 'GetStudent', error);
                    } else {
                        StudentManager.students = [];
                        $(response.Student).each(function(index, student) {
                            StudentManager.students['s'+student.StudentId] = student;
                            StudentManager.students.push(student);

                            if (classes['clasx'+student.ClassId]) {
                                if (!classes['clasx'+student.ClassId].Students) {
                                    classes['clasx'+student.ClassId].Students = [];
                                }
                                classes['clasx'+student.ClassId].Students.push(student);
                            }
                        });

                        if (callback && $.isFunction(callback)) {
                            callback(StudentManager.students);
                        }
                    }
                }
            });
        };

        // 顯示班級、年級學生總數
        var setStudentCount = function() {
            var classes = StudentManager.classes;
            if (classes.GradeYear) {
                $(classes.GradeYear).each(function(index, gradeYear){
                    var totoal = 0;
                    if (classes.ColGradeYearClasses['year'+gradeYear]) {
                        $(classes.ColGradeYearClasses['year'+gradeYear]).each(function(index, clasx){
                            var count = 0;
                            if (clasx.Students) {
                                count = clasx.Students.length || 0;
                                totoal += count;
                            }
                            target.find('[js=class' + clasx.ClassId + ']').html('(' + count + ')');
                        });
                    }
                    target.find('[js=year' + gradeYear + ']').html('(' + totoal + ')');
                });
            }
        };

        // 點選班級
        target.on('click', 'li', function() {
            target.find('.active').removeClass('active').find('i').addClass('icon-white');
            $(this).addClass('active').find('i').removeClass('icon-white');

            var classid = $(this).attr('classid');
            var allStudents = StudentManager.classes['clasx' + classid].Students || null;
            $('#namelist').trigger('resetListEvent', ['class', allStudents]);
        });

        target.on('modifyStudent', function(e){
            $(StudentManager.classes).each(function(index, clasx) {
                clasx.Students = [];
            });
            getStudent(function(students){
                setStudentCount(students);
            });
        });

        var Init = function() {
            getAllClassList(function(classes){
                setClassList(classes);
                setAutoComplete(classes);
                getStudent(function(students){
                    $('#filter-keyword').prop('disabled', false);
                    setStudentCount(students);
                });
            });
        };
        Init();
    });

    // 學生列表
    $('#namelist').each(function(index, target) {
        target = $(target);
        var currStudentList;

        // 點選學生
        target.on('click', 'tbody tr', function() {
            var sid = $(this).attr('studentId');
            if (StudentManager.students['s'+sid]) {
                $(this).closest('tbody').find('.action').removeClass('action');
                $(this).addClass('action');
                $('#infolist').trigger('changeStudent', [StudentManager.students['s'+sid]]);
            }
        });

        target.on('resetListEvent', function(e, search_type, students) {
            currStudentList = students;
            target.find('tbody').html('');

            var ret = [], pre_classname = '';
            if (students) {
                students = StudentManager.Util.handle_array(students);
                students = students.sort($.by('asc', 'ClassName', $.by('asc', 'SeatNo')));
                $(students).each(function(index, student) {
                    if (search_type === 'keyword') {
                        if (student.ClassName !== pre_classname) {
                            ret.push(
                                '<tr>' +
                                '    <th class="my-classname" colspan="2">' + (student.ClassName || '未分班') + '</th>' +
                                '</tr>'
                            );
                            pre_classname = student.ClassName;
                        }
                    }

                    ret.push(
                        '<tr studentId="' + student.StudentId + '">' +
                        '    <td>' + (student.SeatNo || '') + '</td>' +
                        '    <td>' + (student.StudentName || '') + '</td>' +
                        '</tr>'
                    );
                });
            }

            var items = ret.join('');
            if (items) {
                target.find('tbody').html(items);
            } else {
                if (search_type === 'keyword') {
                    target.find('tbody').html('<tr><td colspan="2">無符合條件的學生</td></tr>');
                } else {
                    target.find('tbody').html('<tr><td colspan="2">無學生</td></tr>');
                }
            }
        });

        target.on('removeStudent', function(e, student) {
            target.find('[studentId=' + student.StudentId+ ']').remove();
        });

        target.on('modifyStudent', function(e, student) {
            var items = '    <td>' + (student.SeatNo || '') + '</td>' +
                '    <td>' + (student.StudentName || '') + '</td>';
            target.find('[studentId=' + student.StudentId+ ']').html(items);
        });
    });

    // 學生家長資訊
    $('#infolist').each(function(index, target) {
        target = $(target);
        var currStudent;

        var clearStudentInfo = function() {
            target.find('.my-widget-header .btn').addClass('hide');
            target.find('[js="s-StudentName"]').html('');
            target.find('[js="s-SeatNo"]').html('');
            target.find('[js="s-StudentNumber"]').html('');
            target.find('[js="s-LinkAccount"]').html('');
            target.find('[js="s-Gender"]').html('');
            target.find('[js="s-ParentCode"]').html('');
            target.find('[js="s-StudentCode"]').html('');
            target.find('[js="s-ClassName"]').html('');
            target.find('#parentInfo tbody').html('');
        };

        // 設定學生資訊
        var setStudent = function (student) {
            if (student) {
                target.find('.my-widget-header .btn').removeClass('hide');
                target.find('[js="s-StudentName"]').html(student.StudentName || '');
                target.find('[js="s-SeatNo"]').html(student.SeatNo || '');
                target.find('[js="s-StudentNumber"]').html(student.StudentNumber || '');
                target.find('[js="s-LinkAccount"]').html(student.LinkAccount || '');
                target.find('[js="s-Gender"]').html(student.Gender || '');
                target.find('[js="s-ParentCode"]').html(student.ParentCode || '');
                target.find('[js="s-StudentCode"]').html(student.StudentCode || '');
                target.find('[js="s-ClassName"]').html(student.ClassName || '');
            }
        };

        var getParentInfo = function(student) {
            if (student) {
                if (student.Parents) {
                    setParentInfo(student);
                } else {
                    if (student.StudentId) {
                        StudentManager.connection_staff.send({
                            service: "beta.GetParent",
                            body: { StudentId: student.StudentId },
                            result: function (response, error, http) {
                                if (error !== null) {
                                    StudentManager.Util.msg('#mainMsg', 'GetParent', error);
                                } else {
                                    student.Parents = StudentManager.Util.handle_array(response.StudentParent);
                                    $(response.StudentParent).each(function(index, parent){
                                        student.Parents['p' + parent.RelationId] = parent;
                                    });
                                    setParentInfo(student);
                                }
                            }
                        });
                    }
                }
            }
        };

        var setParentInfo = function(student) {
            var ret = [];
            if (student && student.Parents) {
                $(student.Parents).each(function(index, parent) {
                    ret.push(
                        '<tr relationId="' + parent.RelationId + '">' +
                        '    <td>' + (parent.LastName || '') + (parent.FirstName || '') + '</td>' +
                        '    <td>' + (parent.RelationName || '') + '</td>' +
                        '    <td>' + (parent.LinkAccount || '') + '</td>' +
                        '</tr>'
                    );
                });
                var items = ret.join('');
                if (items) {
                    target.find('#parentInfo tbody').html(items);
                } else {
                    target.find('#parentInfo tbody').html('<tr><td colspan="3">目前無資料</td></tr>');
                }
            }
        };

        // 點選刪除學生
        target.find('[action-type="del"]').on('click', function() {
            $('#delModal').trigger('delStudent', currStudent);
        });

        // 點選編輯學生
        target.find('[action-type="edit"]').on('click', function() {
            $('#editModal').trigger('editStudent', currStudent);
        });

        // 點選新增家長
        target.find('[action-type="add"]').on('click', function() {
            $('#parentModal').trigger('editParent', [currStudent, null]);
        });

        // 點選家長
        target.find('#parentInfo').on('click', 'tr', function() {
            var relationId = $(this).attr('relationId');
            $('#parentModal').trigger('editParent', [currStudent, relationId]);
        });

        target.on('changeStudent', function(e, student) {
            clearStudentInfo();
            currStudent = student;
            setStudent(currStudent);
            getParentInfo(currStudent);
        });

        target.on('modifyParent', function(e) {
            getParentInfo(currStudent);
        });
    });

    // 編輯學生視窗
    $("#editModal").each(function(index, target){
        target = $(target);
        var currStudent;

        var clearModal = function() {
            target.find('h3').html('');
            target.find('#edit-StudentName').val('');
            target.find('#edit-SeatNo').val('');
            target.find('#edit-StudentNumber').val('');
            target.find('#edit-LinkAccount').val('');
            target.find('#edit-Gender').val('');
            target.find('#edit-ParentCode').html('');
            target.find('#edit-StudentCode').html('');
            target.find('#edit-ClassName').val('');
            target.find('#edit-ClassName').attr('ClassId', '');
            target.find('#edit-ClassName').attr('ClassName', '');
        };

        var setModal = function(student) {
            if (student) {
                target.find('h3').html('資料修改');
                target.find('#edit-StudentName').val(student.StudentName || '');
                target.find('#edit-SeatNo').val(student.SeatNo || '');
                target.find('#edit-StudentNumber').val(student.StudentNumber || '');
                target.find('#edit-LinkAccount').val(student.LinkAccount || '');
                target.find('#edit-Gender').val(student.Gender || '');
                target.find('#edit-ParentCode').html(student.ParentCode || '');
                target.find('#edit-StudentCode').html(student.StudentCode || '');
                target.find('#edit-ClassName').val(student.ClassName || '');
                target.find('#edit-ClassName').attr('ClassId', student.ClassId || '');
                target.find('#edit-ClassName').attr('ClassName', student.ClassName || '');
            } else {
                target.find('h3').html('新增');
            }
        };

        // 儲存學生
        var saveBaseInfo = function() {
            var student = currStudent;
            var studentName = $('#edit-StudentName').val() || '';
            var studentId;

            if (studentName) {
                var studentName = $('#edit-StudentName').val() || '';
                var seatNo = $('#edit-SeatNo').val() || '';
                var studentNumber = $('#edit-StudentNumber').val() || '';
                var linkAccount = $('#edit-LinkAccount').val() || '';
                var gender = $('#edit-Gender').val() || '';
                var parentCode = $('#edit-ParentCode').html() || '';
                var studentCode = $('#edit-StudentCode').html() || '';
                var classId = '';
                var classname = $('#edit-ClassName').val();

                if ($('#edit-ClassName').val()) {
                    classId = $('#edit-ClassName').attr('ClassId') || '';
                }
                var request = {
                    StudentName: studentName,
                    SeatNo: seatNo,
                    StudentNumber: studentNumber,
                    LinkAccount: linkAccount,
                    Gender: gender,
                    ParentCode: parentCode,
                    StudentCode: studentCode,
                    ClassId: classId,
                    ClassName: classname,
                    Status: '1'
                };

                var send;
                if (student) {
                    studentId = student.StudentId;
                    send = {
                        action: 'update',
                        successMsg: '儲存成功',
                        service: 'beta.UpdateStudent',
                        body: {
                            Student: [{
                                StudentId: studentId,
                                StudentName: studentName,
                                Gender: gender,
                                StudentNumber: studentNumber,
                                SeatNo: seatNo,
                                LinkAccount: linkAccount,
                                StudentCode: studentCode,
                                ParentCode: parentCode,
                                ClassId: classId,
                                StudentStatus: '1'
                            }]
                        }
                    };
                } else {
                    send = {
                        action: 'add',
                        successMsg: '新增成功',
                        service: 'beta.AddStudent',
                        body: {
                            Student: [{
                                StudentName: studentName,
                                Gender: gender,
                                StudentNumber: studentNumber,
                                SeatNo: seatNo,
                                LinkAccount: linkAccount,
                                StudentCode: studentCode,
                                ParentCode: parentCode,
                                ClassId: classId,
                                StudentStatus: '1'
                            }]
                        }
                    };
                }

                StudentManager.connection_staff.send({
                    service: send.service,
                    body: send.body,
                    result: function (response, error, http) {
                        if (error !== null) {
                            $("#save-data").button("reset");
                            StudentManager.Util.msg('#editModal [js="errorMessage"]', send.service, error);
                        } else {
                            if (send.action === 'add') {
                                request.StudentId = response.NewId;
                                StudentManager.students.push(request);
                                StudentManager.students['s'+request.StudentId] = request;
                            } else {
                                $.extend(StudentManager.students['s'+studentId], request);
                                $('#infolist').trigger('changeStudent', [StudentManager.students['s'+studentId]]);
                                $('#namelist').trigger('modifyStudent', [StudentManager.students['s'+studentId]]);
                            }
                            $('#class-list').trigger('modifyStudent');

                            target.modal('hide');
                            $('#mainMsg').html("<div class='alert alert-success'>\n  " + send.successMsg + "\n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                target.find("#save-data").button("reset");
                StudentManager.Util.msg('#editModal [js="errorMessage"]', '', '姓名為必填值！');
            }
        };

        target.modal({
            show: false
        });

        target.on("hidden", function() {
            target.find('[js="errorMessage"]').html('');
        });

        target.on('click', '#save-data', function() {
            var err_msg = target.find('[js="errorMessage"]');
            err_msg.html('');
            if (target.find("form").valid()) {
                // 驗證通過
                $(this).button("loading");
                saveBaseInfo();
            }
        });

        target.on('editStudent', function(e, student) {
            // 清除樣式
            var validator = target.find("form").validate();
            validator.resetForm();
            $(this).find('.error').removeClass("error");

            target.find("#save-data").button("reset");

            currStudent = student;
            clearModal();
            setModal(currStudent);

            target.modal('show');
        });

        // 產生代碼
        target.find('[js=refresh]').click(function() {
            var elem = $(this).attr('data-target');
            StudentManager.connection_public.send({
                service: "beta.GetNewCode",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        StudentManager.Util.msg('#editModal [js="errorMessage"]', 'GetNewCode', error);
                    } else {
                        $(elem).html(response.Code || '');
                    }
                }
            });
        });

        target.find('[js=delcode]').click(function() {
            var elem = $(this).attr('data-target');
            $(elem).html('');
        });
    });

    // 刪除學生視窗
    $("#delModal").each(function(index, target){
        target = $(target);
        var currStudent;

        // 點選刪除
        target.find('#del-data').click(function() {
            $(this).button('loading');
            var studentId = currStudent.StudentId;
            if (studentId) {
                StudentManager.connection_staff.send({
                    service: "beta.DelStudent",
                    body: { StudentId: studentId },
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('#del-data').button('reset');
                            StudentManager.Util.msg('#delModal [js="errorMessage"]', 'DelStudent', error);
                        } else {
                            $('#infolist').trigger('changeStudent', null);
                            $('#namelist').trigger('removeStudent', [currStudent]);

                            var idx = $(StudentManager.students).index(currStudent);
                            if (idx !== -1) {
                                StudentManager.students.splice(idx, 1);
                                StudentManager.students['s' + currStudent.StudentId] = undefined;
                            }
                            $('#class-list').trigger('modifyStudent');

                            currStudent = null;

                            target.find('#del-data').button('reset');
                            target.modal('hide');
                            $('#mainMsg').html("<div class='alert alert-success'>\n  刪除成功！\n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                target.modal('hide');
                StudentManager.Util.msg('#mainMsg', '', '學生編號不正確，無法刪除！');
            }
        });

        target.on('delStudent', function(e, student){
            currStudent = student;
            target.modal('show');
        });
    });

    // 編輯家長視窗
    $("#parentModal").each(function(index, target){
        target = $(target);
        var currStudent, currParent;

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
                target.find('[js="action-del"]').show();
            } else {
                target.find('h3').html('新增');
                target.find('[js="action-del"]').hide();
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
                        service: 'beta.UpdateParent',
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
                        service: 'beta.AddParent',
                        body: {
                            Parent: [{
                                StudentId: currStudent.StudentId,
                                LastName: lastName,
                                FirstName: firstName,
                                RelationName: relationName,
                                LinkAccount: linkAccount
                            }]
                        }
                    };
                }

                StudentManager.connection_staff.send({
                    service: send.service,
                    body: send.body,
                    result: function (response, error, http) {
                        if (error !== null) {
                            $("#save-data").button("reset");
                            StudentManager.Util.msg('#parentModal [js="errorMessage"]', send.service, error);
                        } else {
                            if (send.action === 'add') {
                                request.RelationId = response.NewId;
                                currStudent.Parents.push(request);
                                currStudent.Parents['p'+request.RelationId] = request;
                            } else {
                                $.extend(currStudent.Parents['p'+relationId], request);
                            }
                            $('#infolist').trigger('modifyParent');

                            target.modal('hide');
                            $('#mainMsg').html("<div class='alert alert-success'>\n  " + send.successMsg + "\n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                target.find("#save-data").button("reset");
                StudentManager.Util.msg('#parentModal [js="errorMessage"]', '', '帳號為必填值！');
            }
        };

        var delParentInfo = function() {
            var relationId = currParent.RelationId;
            if (relationId) {
                StudentManager.connection_staff.send({
                    service: "beta.DelParent",
                    body: {
                        RelationId: relationId
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            target.find('[js^="action-"]').removeClass("disabled");
                            StudentManager.Util.msg('#parentModal [js="errorMessage"]', 'DelParent', error);
                        } else {
                            var idx = $(currStudent.Parents).index(currParent);
                            if (idx !== -1) {
                                currStudent.Parents.splice(idx, 1);
                                currStudent.Parents['p' + currParent.RelationId] = undefined;
                            }
                            $('#infolist').trigger('modifyParent');

                            target.find('[js^="action-"]').removeClass("disabled");
                            target.modal('hide');

                            $('#mainMsg').html("<div class='alert alert-success'>\n 刪除成功！ \n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                        }
                    }
                });
            } else {
                StudentManager.Util.msg('#parentModal [js="errorMessage"]', '', '家長編號不正確，無法刪除！');
                target.find('[js^="action-"]').removeClass("disabled");
            }
        };

        target.modal({
            show: false
        });

        target.on("hidden", function() {
            target.find('[js="errorMessage"]').html('');
        });

        target.find('[js="action-save"]').on('click', function() {
            var err_msg = target.find('[js="errorMessage"]');
            err_msg.html('');
            if (target.find("form").valid()) {
                // 驗證通過
                $(this).button("loading");
                saveParentInfo();
            }
        });

        target.find('[js="action-del"]').click(function() {
            target.find('[js="errorMessage"]').html('');
            var confirmText = '<span>永久刪除無法回復，您確定要刪除嗎？</span>' +
                '   <a href="javascript:void(0);" data-dismiss="alert">取消</a>' +
                ' | <a href="javascript:void(0);" js="del-parent">確定</a>';

            StudentManager.Util.msg('#parentModal [js="errorMessage"]', '', confirmText);
        });

        target.on('click', '[js="del-parent"]', function() {
            if (target.find('[js="action-del"]').hasClass("disabled")) return;
            StudentManager.Util.msg('#parentModal [js="errorMessage"]', '', '刪除中...');
            target.find('[js^="action-"]').addClass("disabled");
            delParentInfo(currParent);
        });

        target.on('editParent', function(e, student, relationId) {
            // 清除樣式
            var validator = target.find("form").validate();
            validator.resetForm();
            target.find('.error').removeClass("error");

            target.find('[js="action-save"]').button("reset");

            currStudent = student;
            currParent = (relationId) ? currStudent.Parents['p'+relationId] : null;
            clearModal();
            setModal(currParent);

            target.modal('show');
        });
    })

});

