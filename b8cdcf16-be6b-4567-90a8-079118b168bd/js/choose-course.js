var _gg = _gg || {};
_gg.connection = gadget.getContract("emba.choose_course.student");
jQuery(function () {
    var vm = MyViewModel;
    ko.applyBindings(vm);

    var stop_exit = function() {
        var _quit = vm.get_quit_list();
        var _add = vm.get_add_list();
        if (_quit.length > 0 || _add.length > 0) {
            return true;
        }
        return false;
    };

    $(window).bind('beforeunload', function() {
        if (stop_exit()) {
            return '您尚未儲存選課結果，確認要離開此網頁嗎?';
        }
    });

    $('#myTab a[data-toggle="tab"]').on('show', function (e) {
        if ($(e.relatedTarget).attr('href') === '#sa01') {
            if (stop_exit()) {
                if (!confirm('您尚未儲存選課結果，確認要離開此網頁嗎?')) {
                    e.preventDefault();
                }
            }
        }
    })

    $('#myModal')
        .on('show', function() {
            $('#save-data').button('reset');
            $('#errorMessage').html('');
        })
        .on('click', '#save-data', function() {
            $(this).button("loading");
            if ($(this).attr('action-type') === 'quit-add') {
                vm.save_quit_add();
            } else {

            }
        });

    $('#sa01')
        .on('click', 'input:checkbox', function() {
            var status = $(this).prop('checked');
            vm.set_add_cousre($(this).val(), status);
        })
        .on('click', '.my-sure button[action-type=save]', function() {
            var quit_list = [], add_list = [];
            var quit_txt = '', add_txt = '', html_txt = '', title = '課程確認';

            var _quit = vm.get_quit_list();
            var _add = vm.get_add_list();

            if (_quit.length > 0 || _add.length > 0) {
                $(_quit).each(function(index, item) {
                    quit_list.push(item.CourseName);
                });
                $(_add).each(function(index, item) {
                    add_list.push(item.CourseName);
                });

                quit_txt = quit_list.join(', ');
                add_txt = add_list.join(', ');

                html_txt = '<div>' +
                    '<p>請確認以下資訊：</p>' +
                    '<p>退出課程：' + (quit_txt || '無') + '</p>' +
                    '<p>加選課程：' + (add_txt || '無') + '</p>' +
                    '</div>';

                $('#myModal').find('h3').html(title)
                    .end().find('.modal-body').html(html_txt)
                    .end().find('#save-data').show().attr('action-type', 'quit-add');
            } else {
                $('#myModal').find('h3').html(title)
                    .end().find('.modal-body').html('<p>未有任何異動！</p>')
                    .end().find('#save-data').hide();
            }
        });
});

(function() {
    this.MyViewModel = {
        // TODO: 取得開放的學年度、學期、階段
        get_openingdata : function() {
            var self = MyViewModel;
            var set_currentData = function(item) {
                self.currentData.Item(item.Item || '');
                self.currentData.SchoolYear(item.SchoolYear || '');
                self.currentData.Semester(item.Semester || '');
                switch (self.currentData.Semester()) {
                    case '0':
                        self.currentData.FullSemester('暑期');
                        break;
                    case '1':
                        self.currentData.FullSemester('第一學期');
                        break;
                    case '2':
                        self.currentData.FullSemester('第二學期');
                        break;
                    default :
                        self.currentData.FullSemester('');
                }
            };
            var set_course_opening_info = function(item) {
                var tmp_txt = '';
                switch(item.Item) {
                    case '1':
                        tmp_txt = '第一階段電腦選課：' +  (item.BeginTime || '未設定') + ' 至 ' + (item.EndTime || '未設定') + ' 止。';
                        self.course_opening_info.Item1(self.course_opening_info.Item1() + tmp_txt);
                        break;
                    case '2':
                        tmp_txt = '<br />第二階段電腦選課：' +  (item.BeginTime || '未設定') + ' 至 ' + (item.EndTime || '未設定') + ' 止。';
                        self.course_opening_info.Item1(self.course_opening_info.Item1() + tmp_txt);
                        break;
                    case '0':
                        tmp_txt = '加退選：' +  (item.BeginTime || '未設定') + ' 至 ' + (item.EndTime || '未設定') + ' 止。';
                        self.course_opening_info.Item0(self.course_opening_info.Item0() + tmp_txt);
                        break;
                }
            };
            _gg.connection.send({
                service: "_.GetCSOpeningInfo",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetCSOpeningInfo', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.OpeningInfo : void 0) != null) {
                            $(response.Response.OpeningInfo).each(function(index, item) {
                                set_course_opening_info(item);

                                if (index === 0) {
                                    self.currentData.SchoolYear(item.SchoolYear || '');
                                    self.currentData.Semester(item.Semester || '');
                                }

                                if (item.Status === 't') {
                                    set_currentData(item);
                                }
                            });

                            if (self.currentData.SchoolYear() && self.currentData.Semester()) {
                                self.get_all_course();
                            }
                            $('#myTab li > a:first').trigger('click');
                        }
                        if (self.currentData.Item()) {
                            self.get_student_info();
                        }
                    }
                }
            });
        },
        currentData : {
            Item         : ko.observable(''),
            SchoolYear   : ko.observable(''),
            Semester     : ko.observable(''),
            FullSemester : ko.observable('')
        },
        course_opening_info : {
            Item1 : ko.observable(''),
            Item0 : ko.observable('')
        },
        // TODO: 可選課程(已選)
        curr_attend : ko.observableArray([]),
        get_attend : function() {
            var self = MyViewModel;

            var condition = '<SchoolYear>' + (self.currentData.SchoolYear() || '') + '</SchoolYear>' +
                '<Semester>' + (self.currentData.Semester() || '') + '</Semester>';

            _gg.connection.send({
                service: "_.GetCSAttend",
                body: '<Request><Condition>' + condition + '</Condition></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        MyViewModel.set_error_message('#mainMsg', 'GetCSAttend', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.Attend : void 0) != null) {
                            $(response.Response.Attend).each(function(index, item) {
                                var _course = self.all_col_course[item.CourseID];
                                if (_course) {
                                    _course.WillQuit = ko.observable(false);
                                    _course.HaveConflict = ko.observableArray();
                                    self.curr_attend.push(_course);
                                }
                            });

                        }
                    }
                }
            });
        },
        set_quit_cousre : function(data) {
            data.WillQuit(true);
            data.HaveConflict([]);
            var _courseID = data.CourseID;
            var self = MyViewModel;
            if (self.conflict_col_course[_courseID]) {
                $(self.conflict_col_course[_courseID]).each(function(key, value) {
                    $(self.can_choose_course()).each(function(index, item) {
                        if (item.CourseID === value && item.WillAdd()) {
                            item.HaveConflict.remove(_courseID);
                        }
                    });
                });
                self.check_add_quit_btn();
            }
        },

        // TODO: 可選課程(可加選)
        can_choose_course : ko.observableArray(),
        get_can_choose_course : function() {
            var self = MyViewModel;

            var condition = '<SchoolYear>' + (self.currentData.SchoolYear() || '') + '</SchoolYear>' +
                '<Semester>' + (self.currentData.Semester() || '') + '</Semester>';

            _gg.connection.send({
                service: "_.GetCanChooseCourse",
                body: '<Request><Condition>' + condition + '</Condition></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        MyViewModel.set_error_message('#mainMsg', 'GetCanChooseCourse', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.Course : void 0) != null) {
                            $(response.Response.Course).each(function(index, item) {
                                var _course = self.all_col_course[item.CourseID];
                                if (_course) {
                                    _course.WillAdd = ko.observable(false);
                                    _course.HaveConflict = ko.observableArray();
                                    self.can_choose_course.push(_course);
                                }
                            });
                        }
                    }
                }
            });
        },
        set_add_cousre : function(_courseID, status) {
            if (_courseID) {
                var self = MyViewModel;
                if (self.conflict_col_course[_courseID]) {
                    var _conflict = [];
                    $(self.conflict_col_course[_courseID]).each(function(key, value) {
                        // TODO: 與已選課程比較
                        $(self.curr_attend()).each(function(index, item) {
                            if (item.CourseID === value && !item.WillQuit()) {
                                if (status) {
                                    _conflict.push(item.CourseID);
                                    item.HaveConflict.push(_courseID);
                                } else {
                                    item.HaveConflict.remove(_courseID);
                                }
                            }
                        });

                        // TODO: 與加選課程比較
                        $(self.can_choose_course()).each(function(index, item) {
                            if (item.CourseID === value && item.WillAdd()) {
                                if (status) {
                                    _conflict.push(item.CourseID);
                                    item.HaveConflict.push(_courseID);
                                } else {
                                    item.HaveConflict.remove(_courseID);
                                }
                            }
                        });
                    });

                    // TODO: 有衝堂，幫自己加註
                    if (status && _conflict) {
                        $(self.can_choose_course()).each(function(index, item) {
                            if (item.CourseID === _courseID) {
                                item.HaveConflict(_conflict);
                            }
                        });
                    }

                    // TODO: 取消勾選，幫自己清除衝堂
                    if (!status) {
                        $(self.can_choose_course()).each(function(index, item) {
                            if (item.CourseID === _courseID) {
                                item.HaveConflict([]);
                            }
                        });
                    }
                }
                self.check_add_quit_btn();
            }
        },

        // TODO: 選課最終確認
        sc_attend : ko.observableArray(),
        get_sc_attend : function() {
            var self = MyViewModel;

            var condition = '<SchoolYear>' + (self.currentData.SchoolYear() || '') + '</SchoolYear>' +
                '<Semester>' + (self.currentData.Semester() || '') + '</Semester>';

            _gg.connection.send({
                service: "_.GetSCAttend_ext",
                body: '<Request><Condition>' + condition + '</Condition></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        MyViewModel.set_error_message('#mainMsg', 'GetSCAttend_ext', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.SCattendExt : void 0) != null) {
                            $(response.Response.SCattendExt).each(function(index, item) {
                                var _course = self.all_col_course[item.CourseID];
                                if (_course) {
                                    self.sc_attend.push(self.all_col_course[item.CourseID]);
                                }
                            });
                        }
                    }
                }
            });
        },
        sc_confirm : ko.observable(false),
        get_registration_confirm : function() {
            var self = MyViewModel;
            _gg.connection.send({
                service: "_.GetRegistrationConfirm",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetRegistrationConfirm', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.Confirm : void 0) != null) {
                            if (response.Response.Confirm.Confirm === 't') {
                                self.sc_confirm(true);
                            }
                        }
                    }
                }
            });

        },

        // TODO: 課程總表
        all_course : ko.observableArray(),
        all_col_course : {},
        get_all_course : function() {
            var self = MyViewModel;
            var condition = '<SchoolYear>' + (self.currentData.SchoolYear() || '') + '</SchoolYear>' +
                '<Semester>' + (self.currentData.Semester() || '') + '</Semester>';

            _gg.connection.send({
                service: "_.GetAllCourse",
                body: '<Request><Condition>' + condition + '</Condition></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        MyViewModel.set_error_message('#mainMsg', 'GetAllCourse', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.Course : void 0) != null) {
                            self.all_course(response.Response.Course);
                            $(response.Response.Course).each(function(index, item) {
                                self.all_col_course[item.CourseID] = item;
                            });

                            self.get_conflict_course();
                            // if (self.currentData.Item === '0') {
                            //     self.get_sc_attend();
                            //     self.get_registration_confirm();
                            // } else {
                            //     self.get_attend();
                            //     self.get_can_choose_course();
                            // }
                            self.get_sc_attend();
                            self.get_attend();
                            self.get_can_choose_course();
                        }
                    }
                }
            });
        },

        // TODO: 衝堂課程
        conflict_col_course : {},
        get_conflict_course : function() {
            var self = MyViewModel;
            var condition = '<SchoolYear>' + (self.currentData.SchoolYear() || '') + '</SchoolYear>' +
                '<Semester>' + (self.currentData.Semester() || '') + '</Semester>';

            _gg.connection.send({
                service: "_.GetConflictCourse",
                body: '<Request><Condition>' + condition + '</Condition></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        MyViewModel.set_error_message('#mainMsg', 'GetConflictCourse', error);
                    } else {
                        var _ref, items = {};
                        if (((_ref = response.Response) != null ? _ref.ConflictCourse : void 0) != null) {
                            $(response.Response.ConflictCourse).each(function(index, item) {
                                if (!items[item.CourseIDA]) {
                                    items[item.CourseIDA] = [];
                                }
                                items[item.CourseIDA].push(item.CourseIDB);
                            });
                        }
                        self.conflict_col_course = items;
                        self.show_conflict_course();
                    }
                }
            });
        },
        show_conflict_course : function() {
            var self = MyViewModel;
            var _txt = [];
            $.each(self.conflict_col_course, function(CourseIDA, B) {
                var _courseA = self.all_col_course[CourseIDA];
                var _conflict_txt = '';

                $(B).each(function(index, item) {
                    var _courseB = self.all_col_course[item];
                    _conflict_txt += '<span class="my-conflict">' +
                            _gg.getCourseType(_courseB.CourseType || '') +
                            ' <span>' + (_courseB.CourseName || '') + '</span>' +
                        '</span>';
                });

                _txt.push(
                    '<table class="table table-bordered table-striped">' +
                    '  <thead>' +
                    '    <tr>' +
                    '      <th>衝堂（必/選修）課程名稱</th>' +
                    '    </tr>' +
                    '  </thead>' +
                    '  <tbody>' +
                    '    <tr>' +
                    '      <td>' +
                    _gg.getCourseType(_courseA.CourseType || '') +
                    '        <span>' + (_courseA.CourseName || '') + '</span>' +
                    '      </td>' +
                    '    </tr>' +
                    '    <tr>' +
                    '      <td>' +
                    _conflict_txt +
                    '      </td>' +
                    '    </tr>' +
                    '  </tbody>' +
                    '</table>'
                );
            });

            var _html = _txt.join('');
            if (_html) {
                $('#sa03').html(_html);
            } else {
                $('#sa03').html('<div>目前無資料</div>');
            }
        },

        // TODO: 選課注意事項, 選課問答集
        faq : {
            'A' : ko.observableArray(), //選課注意事項
            'B' : ko.observableArray() //選課問答
        },
        get_faq : function() {
            var self = MyViewModel;

            _gg.connection.send({
                service: "_.GetCSFaq",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        MyViewModel.set_error_message('#mainMsg', 'GetCSFaq', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.Faq : void 0) != null) {
                            $(response.Response.Faq).each(function(index, item) {
                                if (item.Category === '選課注意事項') {
                                    item.Id = 'collapseA' + index;
                                    item.Href = '#' + item.Id;
                                    self.faq.A.push(item);
                                } else if (item.Category === '選課問答') {
                                    item.Id = 'collapseB' + index;
                                    item.Href = '#' + item.Id;
                                    self.faq.B.push(item);
                                }
                            });
                        }
                    }
                }
            });
        },

        student : {
            Email         : ko.observable(''),
            ClassName     : ko.observable(''),
            DeptName      : ko.observable(''),
            StudentName   : ko.observable(''),
            StudentNumber : ko.observable('')
        },
        get_student_info : function() {
            var self = MyViewModel;
            var set_student = function(item) {
                self.student.ClassName(item.ClassName || '');
                self.student.DeptName(item.DeptName || '');
                self.student.StudentName(item.StudentName || '');
                self.student.StudentNumber(item.StudentNumber || '');
                self.student.Email(item.Email || '');
            };
            _gg.connection.send({
                service: "_.GetMyInfo",
                body: '<Request><Condition></Condition></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        _gglf.set_error_message('#mainMsg', 'GetMyInfo', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.StudentInfo : void 0) != null) {
                            $(response.Response.StudentInfo).each(function(index, item) {
                                set_student(item);
                            });
                        }
                    }
                }
            });

        },

        // TODO: 列印
        printCourse : function() {
            var content = '', print_content = [];
            content = "<!DOCTYPE html>\n<html>\n <head>\n        <link type=\"text/css\" rel=\"stylesheet\" href=\"css/default.css\"/>\n    </head>\n" +
                "<body>\n        <div style='width:880px;padding:40px 20px' class='my-print-page'>" +
                $('div.my-print-page').html() +
                "</div>\n  </body>\n</html>";
            var doc = window.open('about:blank', '_blank', '');
            doc.document.open();
            doc.document.write(content);
            doc.document.close();
            doc.focus();
        }
        ,
        reset_add_quit : function() {
            var self = MyViewModel;
            $(self.curr_attend()).each(function(index, item) {
                item.WillQuit(false);
                item.HaveConflict({});
            });
            $(self.can_choose_course()).each(function(index, item) {
                item.WillAdd(false);
                item.HaveConflict({});
            });
            self.check_add_quit_btn();
        },

        check_add_quit_btn : function() {
            if ($('#sa01 tr.my-error').length > 0) {
                $('#sa01 button[action-type=save]').hide();
            } else {
                $('#sa01 button[action-type=save]').show();
            }
        },

        get_quit_list : function() {
            var self = MyViewModel;
            var quit_list = [];
            $(self.curr_attend()).each(function(index, item) {
                if (item.WillQuit()) {
                    quit_list.push(item);
                }
            });
            return quit_list;
        },
        get_add_list : function() {
            var self = MyViewModel;
            var add_list = [];
            $(self.can_choose_course()).each(function(index, item) {
                if (item.WillAdd()) {
                    add_list.push(item);
                }
            });
            return add_list;
        },
        save_quit_add : function() {
            var self = MyViewModel;
            var add_list = [], add_log = [], add_complete = false;
            var quit_list = [], quit_log = [], quit_complete = false;

            var complete_process = function() {
                if (add_complete && quit_complete) {
                    self.curr_attend.sort(function(left, right) { return left.SerialNo == right.SerialNo ? 0 : (left.SerialNo < right.SerialNo ? -1 : 1) })
                    self.can_choose_course.sort(function(left, right) { return left.SerialNo == right.SerialNo ? 0 : (left.SerialNo < right.SerialNo ? -1 : 1) })
                    self.reset_add_quit();
                    $('#myModal').modal('hide');
                    $('#mainMsg').html("<div class='alert alert-success'>\n  儲存成功！\n</div>");
                    setTimeout("$('#mainMsg').html('')", 1500);
                }
            }

            var _add = self.get_add_list();
            if (_add.length > 0) {
                $(_add).each(function(index, item) {
                    add_list.push('<Course><CourseID>' + item.CourseID + '</CourseID></Course>');
                    add_log.push('<Course><CourseID>' + item.CourseID + '</CourseID>' +
                        '<Action>insert</Action><ActionBy>student</ActionBy></Course>');
                });

                _gg.connection.send({
                    service: "_.AddCSAttend",
                    body: '<Request>' + add_list.join('') + '</Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            $('#save-data').button('reset');
                            _gg.set_error_message('#errorMessage', 'AddCSAttend', error);
                        } else {
                            // TODO: add to curr_attend, remove to can_choose_course
                            $(self.can_choose_course()).each(function(index, item) {
                                if (item.WillAdd()) {
                                    if (item.hasOwnProperty("WillQuit")) {
                                        item.WillQuit(false);
                                    } else {
                                        item.WillQuit = ko.observable(false);
                                    }
                                    self.curr_attend.push(item);
                                    self.can_choose_course.remove(item);
                                }
                            });

                            _gg.connection.send({
                                service: "_.AddCSAttendLog",
                                body: '<Request>' + add_log.join('') + '</Request>',

                                result: function (response, error, http) {
                                    if (error !== null) {
                                        $('#save-data').button('reset');
                                        _gg.set_error_message('#errorMessage', 'AddCSAttendLog', error);
                                    } else {
                                        add_complete = true;
                                        complete_process();
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                add_complete = true;
                complete_process();
            }


            var _quit = self.get_quit_list();
            if (_quit.length > 0) {
                $(_quit).each(function(index, item) {
                    quit_list.push('<Course><CourseID>' + item.CourseID + '</CourseID></Course>');
                    quit_log.push('<Course><CourseID>' + item.CourseID + '</CourseID>' +
                        '<Action>delete</Action><ActionBy>student</ActionBy></Course>');
                });

                _gg.connection.send({
                    service: "_.DelCSAttend",
                    body: '<Request>' + quit_list.join('') + '</Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            $('#save-data').button('reset');
                            _gg.set_error_message('#errorMessage', 'DelCSAttend', error);
                        } else {
                            // TODO: add to can_choose_course, remove to curr_attend
                            $(self.curr_attend()).each(function(index, item) {
                                if (item.WillQuit()) {
                                    if (item.hasOwnProperty("WillAdd")) {
                                        item.WillAdd(false);
                                    } else {
                                        item.WillAdd = ko.observable(false);
                                    }
                                    self.can_choose_course.push(item);
                                    self.curr_attend.remove(item);
                                }
                            });
                            _gg.connection.send({
                                service: "_.AddCSAttendLog",
                                body: '<Request>' + quit_log.join('') + '</Request>',

                                result: function (response, error, http) {
                                    if (error !== null) {
                                        $('#save-data').button('reset');
                                        _gg.set_error_message('#errorMessage', 'AddCSAttendLog', error);
                                    } else {
                                        quit_complete = true;
                                        complete_process();
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                quit_complete = true;
                complete_process();
            }
        }
    };

    MyViewModel.get_openingdata();
    MyViewModel.get_faq();
}).call(this);

_gg.getCourseType = function(type) {
    switch(type) {
        case '核心必修':
            return '<span class="label label-important">核必</span>';
        case '核心選修':
            return '<span class="label label-warning">組必</span>';
        case '分組必修':
            return '<span class="label label-success">共選</span>';
        case '選修':
            return '<span class="label label-info">選修</span>';
        default:
            return '<span class="label">' + type + '</span>';
    }
};

ko.bindingHandlers.type_format = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var $elem = $(element);
        var val = valueAccessor();
        $elem.prepend(_gg.getCourseType(val));
    }
};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case '502':
                        tmp_msg = '<strong>很抱歉，目前尚未開放！</strong>';
                        break;
                }
            } else if (error.dsaError.message) {
                tmp_msg = error.dsaError.message;
            }
        } else if (error.loginError.message) {
            tmp_msg = error.loginError.message;
        } else if (error.message) {
            tmp_msg = error.message;
        }
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
        $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
    }
};

