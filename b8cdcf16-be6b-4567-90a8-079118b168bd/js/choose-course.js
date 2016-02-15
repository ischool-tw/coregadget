
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

    gadget.onLeave(function() {
        if (stop_exit()) {
            return '您尚未儲存選課結果，確認要離開此網頁嗎?';
        }
        return '';
    });

    $('#myTab a[data-toggle="tab"]').on('show', function (e) {
        if ($(e.relatedTarget).attr('href') === '#sa01') {
            if (stop_exit()) {
                if (!confirm('您尚未儲存選課結果，確認要離開此網頁嗎?')) {
                    e.preventDefault();
                } else {
                    $('#sa01 button[ac-type=save1]').tooltip('hide');
                }
            }
        }
    });

    $('#myModal').on('click', '#save-data', function() {
        if ($(this).prop('disabled') === false) {
            $(this).button("loading");
            $('#myModal [data-dismiss="modal"]').hide();
            var _action = $(this).attr('action-type');
            if (_action === 'quit-add') {
                vm.save_quit_add();
            } else if (_action === 'reg-confirm') {
                vm.set_registration_confirm();
            }
        }
    });

    $('#sa01')
        .on('click', 'tbody[data-type=quit] input:checkbox', function() {
            var status = $(this).prop('checked');
            vm.set_quit_cousre($(this).val(), status);
        })
        .on('click', 'tbody[data-type=add] input:checkbox', function() {
            var status = $(this).prop('checked');
            vm.set_add_cousre($(this).val(), status);
        });


    $('body').on('click', 'button[data-target=#myModal]', function(e) {
        $('#save-data').button('reset');
        $('#myModal [data-dismiss="modal"]').show();
        $('#errorMessage').html('');
        $('#myModal .alert-danger').removeClass('alert-danger');

        var html_txt = '', title = '';
        var action_type = $(this).attr('ac-type');

        if (action_type === 'save1') {
            title = '課程確認';

            var quit_list = [], add_list = [];
            var quit_txt = '', add_txt = '';

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

                if (vm.currentData.Item() === '1') {
                    html_txt = vm.configuration.cs_cancel1_content_template();
                } else if (vm.currentData.Item() === '2') {
                    html_txt = vm.configuration.cs_cancel2_content_template();
                }
                html_txt += '<p><font size="4" color="red">退出課程</font>：' + (quit_txt || '無') + '</p><p><font size="4" color="red">加選課程</font>：' + (add_txt || '無') + '</p>';

                $('#myModal').find('h3').html(title)
                    .end().find('.modal-body').html('<div>' + html_txt + '</div>')
                    .end().find('#save-data').show().attr('action-type', 'quit-add');
            } else {
                $('#myModal').find('h3').html(title)
                    .end().find('.modal-body').html('<p>未有任何異動！</p>')
                    .end().find('#save-data').hide();
            }
        } else if (action_type === 'save0') {
            if (vm.sc_confirm() === true) {
                title = '確認最終選課結果';
                html_txt = '<p>您已在 ' + vm.sc_date_confirm() + ' 進行過確認</p>';

                $('#myModal').find('h3').html(title)
                    .end().find('.modal-body').html(html_txt).addClass('alert-danger')
                    .end().find('#save-data').hide()
                    .end().modal('show');
            } else {
                title = '確認最終選課結果';
                html_txt = '<p>送出後不能再列印加退選單，您確定要送出嗎？</p>';

                $('#myModal').find('h3').html(title)
                    .end().find('.modal-body').html(html_txt).addClass('alert-danger')
                    .end().find('#save-data').show().attr('action-type', 'reg-confirm')
                    .end().modal('show');
            }
        } else if (action_type === 'printCourse') {
            if (vm.sc_confirm() === true) {
                title = '列印加退選單';
                html_txt = '<p>您已於 ' + vm.sc_date_confirm() + ' 進行確認，請先致電EMBA辦公室進行註銷，才能列印加退選單</p>';

                $('#myModal').find('h3').html(title)
                    .end().find('.modal-body').html(html_txt).addClass('alert-danger')
                    .end().find('#save-data').hide()
                    .end().modal('show');
            } else {
                vm.printCourse();
            }
        }
    });
});

(function() {
	this.MyViewModel = (function () {
        var conn_log = gadget.getContract("emba.student");
        var _all_opening_data = {};
        return {
            weburl: ko.observable('javascript:void(0);'),
            get_weburl: function() {
                var self = MyViewModel;
                _gg.connection.send({
                    service: "_.GetWebUrl",
                    body: {
                        Request: {
                            Name: '課程計劃'
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetWebUrl', error);
                        } else {
                            if (response.Response && response.Response.Urls) {
                                self.weburl(response.Response.Urls.Url || 'javascript:void(0);');
                            }
                        }
                    }
                });
            },
            get_openingdata : function() {
                var self = MyViewModel;
                var set_currentData = function(item) {
                    self.currentData.Item(item.Item || '');
                    self.currentData.SchoolYear(item.SchoolYear || '');
                    self.currentData.Semester(item.Semester || '');
                    self.currentData.BeginTime(item.BeginTime || '');
                    self.currentData.EndTime(item.EndTime || '');
                };
                var set_course_opening_info = function(item) {
                    var tmp_txt = '';
                    _all_opening_data['Level' + item.Item + '_BeginTime'] = item.BeginTime || '';
                    _all_opening_data['Level' + item.Item + '_EndTime'] = item.EndTime || '';

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
                            if (response.Response && response.Response.OpeningInfo) {
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
                            }
                            self.checkNowStatus();
                        }
                    }
                });
            },
            currentData : {
                Item         : ko.observable(''),
                SchoolYear   : ko.observable(''),
                Semester     : ko.observable(''),
                FullSemester : ko.observable(''),
                BeginTime    : ko.observable(''),
                EndTime      : ko.observable('')
            },
            course_opening_info : {
                Item1 : ko.observable(''),
                Item0 : ko.observable('')
            },

            // 課程總表
            all_course : ko.observableArray(),
            all_col_course : {},
            get_all_course : function() {
                var self = MyViewModel;

                _gg.connection.send({
                    service: "_.GetAllCourse",
                    body: {
                        Request: {
                            Condition: {
                                SchoolYear: self.currentData.SchoolYear() || '',
                                Semester: self.currentData.Semester() || ''
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetAllCourse', error);
                        } else {
                            if (response.Response && response.Response.Course) {
                                $(response.Response.Course).each(function(index, item) {
                                    var tmp = '', _teachers = [];
                                    if (item.TeacherURLName) {
                                        tmp = item.TeacherURLName.split(', ');
                                        $(tmp).each(function(index, teacher) {
                                            if (($(teacher).attr('href'))) {
                                                _teachers.push('<a href="' + $(teacher).attr('href') + '" target="_blank">' + $(teacher).html() + '</a>') ;
                                            } else {
                                                _teachers.push($(teacher).html());
                                            }
                                        })
                                        item.TeacherURLName = _teachers.join(', ');
                                    }

                                    self.all_course.push(item);
                                    self.all_col_course[item.CourseID] = item;
                                });

                                if (self.currentData.Item() === '0') {
                                    self.get_conflict_course();
                                    self.get_sc_attend();
                                    self.get_registration_confirm();
                                } else if (self.currentData.Item() === '1' || self.currentData.Item() === '2') {
                                    self.get_conflict_course();
                                    self.get_attend();
                                    self.get_can_choose_course();
                                } else if (self.currentData.Item() === 's2' || self.currentData.Item() === 's3') {
                                    self.get_conflict_course();
                                } else if (self.currentData.Item() === 's4') {
                                    self.get_registration_confirm();
                                    self.get_sc_attend();
                                } else if (self.currentData.Item() === 's5') {
                                    self.get_conflict_course();
                                }
                            }
                        }
                    }
                });
            },

            // 退選訊息、Mail樣版
            configuration : {
                email_content1_template				: ko.observable(),
                email_content2_template			    : ko.observable(),
                cs_cancel1_content_template			: ko.observable(),
                cs_cancel2_content_template			: ko.observable(),
                cs_final_message			        : ko.observable(),
                cs_content1_template			    : ko.observable(),
                cs_content2_template				: ko.observable(),
                email_content1_template_subject		: ko.observable(),
                email_content2_template_subject		: ko.observable(),
                retreat_notices_word                : ko.observable()
            },
            get_configuration : function() {
                var self = MyViewModel;

                _gg.connection.send({
                    service: "_.GetSConfiguration",
                    body: {
                        Request: {
                            Condition: {
                                ConfName: [
                                    'cs_cancel1_content_template',
                                    'cs_final_message',
                                    'email_content2_template',
                                    'email_content1_template',
                                    'cs_cancel2_content_template',
                                    'cs_content1_template',
                                    'cs_content2_template',
									'email_content1_template_subject',
									'email_content2_template_subject',
                                    'retreat_notices_word'
                                ]
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetSConfiguration', error);
                        } else {
                            if (response.Response && response.Response.Configuration) {
                                $(response.Response.Configuration).each(function(index, item) {
                                    self.configuration[item.ConfName](item.ConfContent);
                                });
                            }
                        }
                    }
                });
            },

            // 可選課程(已選)
            curr_attend : ko.observableArray([]),
            get_attend : function(callback) {
                var self = MyViewModel;

                _gg.connection.send({
                    service: "_.GetCSAttend",
                    body: {
                        Request: {
                            Condition: {
                                SchoolYear: self.currentData.SchoolYear() || '',
                                Semester: self.currentData.Semester() || ''
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                        	_gg.set_error_message('#mainMsg', 'GetCSAttend', error);
                        } else {
                            if (response.Response && response.Response.Attend) {
                                $(response.Response.Attend).each(function(index, item) {
                                    var _course = self.all_col_course[item.CourseID];
                                    if (_course) {
                                        _course.WillQuit = ko.observable(false);
                                        _course.HaveConflict = ko.observableArray();
                                        _course.ChooseItem = item.Item;
                                        self.curr_attend.push(_course);
                                    }
                                });
                            }
                            if (callback) {
                                callback();
                            }
                        }

                        //self.CallbackQueue.JobFinished();
                    }
                });
            },
            get_attend_no_callback: function () {
            	var self = MyViewModel;

            	_gg.connection.send({
            		service: "_.GetCSAttend",
            		body: {
            			Request: {
            				Condition: {
            					SchoolYear: self.currentData.SchoolYear() || '',
            					Semester: self.currentData.Semester() || ''
            				}
            			}
            		},
            		result: function (response, error, http) {
            			if (error !== null) {
            				_gg.set_error_message('#mainMsg', 'GetCSAttend', error);
            			} else {
            				if (response.Response && response.Response.Attend) {
            					$(response.Response.Attend).each(function (index, item) {
            						var _course = self.all_col_course[item.CourseID];
            						if (_course) {
            							_course.WillQuit = ko.observable(false);
            							_course.HaveConflict = ko.observableArray();
            							_course.ChooseItem = item.Item;
            							self.curr_attend.push(_course);
            						}
            					});
            				}
            			}
            			self.CallbackQueue.JobFinished();
            		}
            	});
            },
            set_quit_cousre : function(_courseID, status) {
                if (_courseID) {
                    var self = MyViewModel;
                    if (self.conflict_col_course[_courseID]) {
                        var _conflict = [];
                        $(self.conflict_col_course[_courseID]).each(function(key, value) {
                            // 與已選課程比較
                            $(self.curr_attend()).each(function(index, item) {
                                if (item.CourseID === value && !item.WillQuit()) {
                                    if (!status) {
                                        _conflict.push(item.CourseID);
                                        item.HaveConflict.push(_courseID);
                                    } else {
                                        item.HaveConflict.remove(_courseID);
                                    }
                                }
                            });

                            // 與加選課程比較
                            $(self.can_choose_course()).each(function(index, item) {
                                if (item.CourseID === value && item.WillAdd()) {
                                    if (!status) {
                                        _conflict.push(item.CourseID);
                                        item.HaveConflict.push(_courseID);
                                    } else {
                                        item.HaveConflict.remove(_courseID);
                                    }
                                }
                            });
                        });

                        // 有衝堂，幫自己加註
                        if (!status && _conflict) {
                            $(self.curr_attend()).each(function(index, item) {
                                if (item.CourseID === _courseID) {
                                    item.HaveConflict(_conflict);
                                }
                            });
                        }

                        // 勾選，幫自己清除衝堂
                        if (status) {
                            $(self.curr_attend()).each(function(index, item) {
                                if (item.CourseID === _courseID) {
                                    item.HaveConflict([]);
                                }
                            });
                        }
                    }
                    self.check_add_quit_btn();
                }
            },

            // 可選課程(可加選)
            can_choose_course : ko.observableArray(),
            get_can_choose_course : function() {
                var self = MyViewModel;

                _gg.connection.send({
                    service: "_.GetCanChooseCourse",
                    body: {
                        Request: {
                            Condition: {
                                SchoolYear: self.currentData.SchoolYear() || '',
                                Semester: self.currentData.Semester() || ''
                            }
                        }
                    },
                    result: function (response, error, http) {
                    	if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetCanChooseCourse', error);
                        } else {
                            if (response.Response && response.Response.Course) {
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
                    	//self.CallbackQueue.JobFinished();
                    }
                });
            },
            set_add_cousre : function(_courseID, status) {
                if (_courseID) {
                    var self = MyViewModel;
                    if (self.conflict_col_course[_courseID]) {
                        var _conflict = [];
                        $(self.conflict_col_course[_courseID]).each(function(key, value) {
                            // 與已選課程比較
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

                            // 與加選課程比較
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

                        // 有衝堂，幫自己加註
                        if (status && _conflict) {
                            $(self.can_choose_course()).each(function(index, item) {
                                if (item.CourseID === _courseID) {
                                    item.HaveConflict(_conflict);
                                }
                            });
                        }

                        // 取消勾選，幫自己清除衝堂
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

            // 選課最終確認
            sc_attend : ko.observableArray(),
            get_sc_attend : function() {
                var self = MyViewModel;

                _gg.connection.send({
                    service: "_.GetSCAttend_ext",
                    body: {
                        Request: {
                            Condition: {
                                SchoolYear: self.currentData.SchoolYear() || '',
                                Semester: self.currentData.Semester() || ''
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetSCAttend_ext', error);
                        } else {
                            if (response.Response && response.Response.SCattendExt) {
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

            // 確認最終選課結果
            sc__confirm_load : ko.observable(false),
            sc_confirm : ko.observable(false),
            sc_date_confirm : ko.observable(''),
            sc_msg_received : ko.observable(''),
            get_registration_confirm : function() {
                var self = MyViewModel;

                _gg.connection.send({
                    service: "_.GetRegistrationConfirm",
                    body: {
                        Request: {
                            Condition: {
                                SchoolYear: self.currentData.SchoolYear() || '',
                                Semester: self.currentData.Semester() || ''
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetRegistrationConfirm', error);
                        } else {
                            self.sc__confirm_load(true);
                            if (response.Response && response.Response.Confirm) {
                                if (response.Response.Confirm.Confirm === 't') {
                                    self.sc_confirm(true);
                                    if (response.Response.Confirm.ConfirmDate) {
                                        var d1 = new Date(response.Response.Confirm.ConfirmDate);
                                        self.sc_date_confirm(d1.getFullYear() + '/' + (d1.getMonth() + 1) + '/' + d1.getDate());
                                    }
                                }
                                if (response.Response.Confirm.ReceivedDate) {
                                    if (response.Response.Confirm.ReceivedDate) {
                                        var d2 = new Date(response.Response.Confirm.ReceivedDate);
                                        var rDate = d2.getFullYear() + '/' + (d2.getMonth() + 1) + '/' + d2.getDate() + ' ';
                                        rDate += (d2.getHours().toString().length == 1 ? '0' : '') + d2.getHours();
                                        rDate += ":" + (d2.getMinutes().toString().length == 1 ? '0' : '') + d2.getMinutes();
                                    }
                                    self.sc_msg_received('EMBA辦公室已於 ' + rDate + ' 收到' + self.student.StudentName() + '同學的加退選單');
                                }
                            }
                        }
                    }
                });
            },
            set_registration_confirm : function() {
                var self = MyViewModel;
                conn_log.ready(function(){
                    _gg.connection.send({
                        service: "_.SetRegistrationConfirm",
                        body: '<Request><Request><Confirm>true</Confirm></Request></Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                $('#save-data').button('reset');
                                $('#myModal [data-dismiss="modal"]').show();
                                _gg.set_error_message('#errorMessage', 'SetRegistrationConfirm', error);
                            } else {
                                if (response.Result && response.Result.ExecuteCount) {
                                    if (parseInt(response.Result.EffectRows, 10) > 0) {
                                        self.sc_confirm(true);
                                        var d = new Date();
                                        self.sc_date_confirm(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate());

                                        gadget.getContract("emba.student").send({
                                            service: "public.AddLog",
                                            body: {
                                                Request: {
                                                    Log: {
                                                        Actor: conn_log.getUserInfo().UserName,
                                                        ActionType: "確認最終選課結果",
                                                        Action: "送出最終選課結果",
                                                        TargetCategory: "student",
                                                        ClientInfo: {
                                                            ClientInfo: {}
                                                        },
                                                        ActionBy: "ischool web 選課小工具",
                                                        Description: '學生「' + self.student.StudentName() + '」送出最終選課結果'
                                                    }
                                                }
                                            }
                                        });

                                        $('#myModal').modal('hide');
                                        $('body').scrollTop(0);
                                        $('#mainMsg').html("<div class='alert alert-success'>\n  儲存成功！\n</div>");
                                        setTimeout("$('#mainMsg').html('')", 5000);
                                    }
                                }
                            }
                        }
                    });
                });
            },

            // 衝堂課程
            conflict_col_course : {},
            get_conflict_course : function() {
                var self = MyViewModel;

                _gg.connection.send({
                    service: "_.GetConflictCourse",
                    body: {
                        Request: {
                            Condition: {
                                SchoolYear: self.currentData.SchoolYear() || '',
                                Semester: self.currentData.Semester() || ''
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetConflictCourse', error);
                        } else {
                            var items = {};
                            if (response.Response && response.Response.ConflictCourse) {
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
                        if (_courseB) {
                            _conflict_txt += '<span class="my-conflict">' +
                                    _gg.getCourseType(_courseB.CourseType || '') +
                                    ' <span>' + (_courseB.CourseName || '') + '</span>' +
                                '</span>';
                        }
                    });

                    if (_courseA) {
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
                    }
                });

                var _html = _txt.join('');
                if (_html) {
                    $('#sa03').html(_html);
                } else {
                    $('#sa03').html('<div>目前無資料</div>');
                }
            },

            // 選課注意事項, 選課問答集
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
                            _gg.set_error_message('#mainMsg', 'GetCSFaq', error);
                        } else {
                            if (response.Response && response.Response.Faq) {
                                $(response.Response.Faq).each(function(index, item) {
                                    if (item.Category === '選課注意事項') {
                                        item.Id = 'collapseA' + index;
                                        item.Href = '#' + item.Id;
                                        item.Content = item.Content.replace(/\n/g, '<br />');
                                        self.faq.A.push(item);
                                    } else if (item.Category === '選課問答') {
                                        item.Id = 'collapseB' + index;
                                        item.Href = '#' + item.Id;
                                        item.Content = item.Content.replace(/\n/g, '<br />');
                                        self.faq.B.push(item);
                                    }
                                });
                            }
                        }
                    }
                });
            },

            student : {
                Email1        : ko.observable(''),
                Email2        : ko.observable(''),
                Email3        : ko.observable(''),
                Email4        : ko.observable(''),
                Email5        : ko.observable(''),
                ClassName     : ko.observable(''),
                DeptName      : ko.observable(''),
                StudentName   : ko.observable(''),
                StudentNumber : ko.observable(''),
                Status        : ko.observable('')
            },
            get_student_info : function() {
                var self = MyViewModel;
                var set_student = function(item) {
                    self.student.ClassName(item.ClassName || '');
                    self.student.DeptName(item.DeptName || '');
                    self.student.StudentName(item.StudentName || '');
                    self.student.StudentNumber(item.StudentNumber || '');
                    self.student.Email1(item.Email1 || '');
                    self.student.Email2(item.Email2 || '');
                    self.student.Email3(item.Email3 || '');
                    self.student.Email4(item.Email4 || '');
                    self.student.Email5(item.Email5 || '');
                    self.student.Status(item.Status || '');
                };
                _gg.connection.send({
                    service: "_.GetMyInfo",
                    body: '',
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetMyInfo', error);
                        } else {
                            if (response.Response && response.Response.StudentInfo) {
                                $(response.Response.StudentInfo).each(function(index, item) {
                                    set_student(item);
                                });
                            }
                            self.checkStudentStatus();
                        }
                    }
                });

            },

            // 列印
            printCourse : function() {
                var self = MyViewModel;
                var content = '', page_count;
                conn_log.ready(function(){
                    _gg.connection.send({
                        service: "_.SetRegistrationPrint",
                        body: '<Request><SetStatus></SetStatus></Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                $('#save-data').button('reset');
                                $('#myModal [data-dismiss="modal"]').show();
                                _gg.set_error_message('#errorMessage', 'SetRegistrationPrint', error);
                            } else {
                                if (response.Result && response.Result.ExecuteCount) {
                                    if (parseInt(response.Result.EffectRows, 10) > 0) {
                                        gadget.getContract("emba.student").send({
                                            service: "public.AddLog",
                                            body: {
                                                Request: {
                                                    Log: {
                                                        Actor: conn_log.getUserInfo().UserName,
                                                        ActionType: "列印加退選單",
                                                        Action: "點選列印加退選單",
                                                        TargetCategory: "student",
                                                        ClientInfo: {
                                                            ClientInfo: {}
                                                        },
                                                        ActionBy: "ischool web 選課小工具",
                                                        Description: '學生「' + self.student.StudentName() + '」點選列印加退選單'
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    });
                });

                if (self.all_course().length <= 14) {
                    content = $('div.my-print-page').html();
                } else {
                    $('.my-print-page tbody[data-type=none]').remove();
                    page_count = (parseInt(self.sc_attend().length / 28, 10)) + (self.sc_attend().length % 28 > 14 ? 2 : 1) ;

                    for (i=1; i<=page_count; i+=1) {
                        content += $('.my-print-page > div[data-area=title]').html();
                        if (page_count > 1) { content += '<div class="my-pages">頁次：' + i + '/' + page_count + '</div>' };

                        var start = 28 * (i - 1);
                        var end   = (28 * i ) - 1;
                        var page = $('.my-print-page > div[data-area=course]').clone();
                        $(page).find('tbody tr').each(function(index, item) {
                            if (!(index >= start && index <= end)) {
                                $(item).remove();
                            }
                        });
                        content += $(page).html();

                        if (i <= (parseInt(self.sc_attend().length / 28, 10))) {
                            content += "<P style='page-break-after:always'>&nbsp;</P>";
                        } else {
                            if (self.sc_attend().length % 28 > 14) {
                                content += "<P style='page-break-after:always'>&nbsp;</P>";
                            }
                        }
                    }
                    if (self.sc_attend().length % 28 > 14) {
                        content += $('.my-print-page > div[data-area=title]').html();
                        if (page_count > 1) { content += '<div class="my-pages">頁次：' + page_count + '/' + page_count + '</div>' };
                        content += $('.my-print-page > div[data-area=sign]').html();
                    } else {
                        content += $('.my-print-page > div[data-area=sign]').html();
                    }
                }

                var tmp = $(content);
                // $(tmp).find('#printEndTime').append(self.currentData.EndTime() || '');
                // 要判斷2次是因為jquery會自動變陣列，沒規則
                if (tmp.find('#noteInfo').length) {
                    tmp.find('#noteInfo').append(self.configuration['retreat_notices_word']() || '');
                } else if (tmp.filter('#noteInfo').length) {
                    tmp.filter('#noteInfo').append(self.configuration['retreat_notices_word']() || '');
                }

                content = $('<div>').append(tmp).html();

                content = "<!DOCTYPE html>\n" +
                        "<html>\n" +
                        "<head>\n" +
                        "<title>加退選單</title>\n" +
                        "<link type=\"text/css\" rel=\"stylesheet\" href=\"css/default.css\"/>\n" +
                        "</head>\n" +
                        "<body style='width:880px;padding:40px 20px' onload=\"window.print();\">\n" +
                        "<div class='my-print-page'>" +
                        content +
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
                    item.HaveConflict([]);
                });
                $(self.can_choose_course()).each(function(index, item) {
                    item.WillAdd(false);
                    item.HaveConflict([]);
                });
                self.check_add_quit_btn();
            },

            check_add_quit_btn : function() {
                if ($('#sa01 tr.my-error').length > 0) {
                    $('#sa01 button[ac-type=save1]').attr('disabled', true).html('衝堂或不得重複加選').tooltip('show');
                } else {
                    $('#sa01 button[ac-type=save1]').attr('disabled', false).html('送出').tooltip('hide');
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
                var add_list = [], add_log = [], add_complete = false, log_add_content = [];
                var quit_list = [], quit_log = [], quit_complete = false, log_quit_content = [];
                var course_add_html = '', course_quit_html = '';

                var get_course_html = function(courses) {
                    var _txt = [];
                    _txt.push(
                        '<table border="1" cellpadding="5px" style="border: 1px solid #C3C3C3; border-collapse: collapse;">' +
                        '    <thead>' +
                        '      <tr>' +
                        '        <th>課程編號</th>' +
                        '        <th>班次</th>' +
                        '        <th>（必/選修）課程名稱</th>' +
                        '        <th>授課教師</th>' +
                        '        <th>學分</th>' +
                        '        <th>人數上限</th>' +
                        '        <th>教室</th>' +
                        '        <th>上課時間</th>' +
                        '      </tr>' +
                        '    </thead>' +
                        '    <tbody>'
                    );
                    if (courses.length === 0) {
                        _txt.push('<tr><td colspan="8">無課程</td>');
                    } else {
                        $(courses).each(function(index, item) {
                            _txt.push(
                                '<tr>' +
                                '    <td>' + (item.NewSubjectCode || '') + '</td>' +
                                '    <td>' + (item.ClassName || '') + '</td>' +
                                '    <td>' +
                                '      <span>' + _gg.getCourseType(item.CourseType) + '</span>' +
                                '      <span>' + (item.CourseName || '') + '</span>' +
                                '    </td>' +
                                '    <td>' + (item.TeacherURLName || '') + '</td>' +
                                '    <td>' + (item.Credit || '') + '</td>' +
                                '    <td>' + (item.Capacity || '') + '</td>' +
                                '    <td>' + (item.Classroom || '') + '</td>' +
                                '    <td>' + (item.CourseTimeInfo || '') + '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '    <td colspan="8">' + (item.Memo || '') + '</td>' +
                                '</tr>'
                            );
                        });
                    }
                    _txt.push('</tbody></table>');

                    return _txt.join('');
                };

                var complete_process = function() {
                	if (add_complete && quit_complete) {
                		$('#myModal').modal('hide');
                        $('body').scrollTop(0);
                		$('#mainMsg').html("<div class='alert alert-success'>\n  儲存成功！\n</div>");
                		setTimeout("$('#mainMsg').html('')", 5000);
                        // 送出Email
                		var send_Mail = function (add_list_backup, quit_list_backup, course_add_html_backup, course_quit_html_backup) {
							//	收件人
                            var receiver = [], mail_tmpl_name = '', course_html = '';
                            for (var ii=1; ii<=5; ii+=1) {
                                if (self.student['Email' + ii]()) {
                                    // receiver.push(
                                    // {
                                    //     'email': self.student['Email' + ii](),
                                    //     'name': self.student.StudentName() || '',
                                    //     'type': 'to'
                                    // });
                                    receiver.push((self.student.StudentName() || '') + '<' + self.student['Email' + ii]() + '>');
                                }
                            }
                            var receivers = receiver.join(',');
                            if (receivers) {
                            	//	選課結果寄出時間
                            	var n = new Date();
                            	var y = n.getFullYear();
                            	var m = (n.getMonth() + 1 < 10) ? ("0" + (n.getMonth() + 1)) : (n.getMonth() + 1);
                            	var d = (n.getDate() < 10) ? ("0" + (n.getDate())) : (n.getDate());
                            	var h = (n.getHours() < 10) ? ("0" + (n.getHours())) : (n.getHours());
                            	var mi = (n.getMinutes() < 10) ? ("0" + (n.getMinutes())) : (n.getMinutes());
                            	var s = (n.getSeconds() < 10) ? ("0" + (n.getSeconds())) : (n.getSeconds());
                            	var mail_sending_time = y + "/" + m + "/" + d + " " + h + ":" + mi + ":" + s;

                            	//	信件主旨
                            	var mail_subject = '';
                            	//	信件內容
                            	var mail_content = '';
                            	//	階段別
                            	var period = '';
                            	if (self.currentData.Item() === '1') {
                            		mail_subject = self.configuration['email_content1_template_subject']();
                            		mail_content = self.configuration['email_content1_template']();
                            		period = '第一階段';
                            	} else if (self.currentData.Item() === '2') {
                            		mail_subject = self.configuration['email_content2_template_subject']();
                            		mail_content = self.configuration['email_content2_template']();
                            		period = '第二階段';
                            	}

                            	//	加選課程清單
                            	//course_add_html

                            	//	退選課程清單
                            	//course_quit_html
                            	//	加退選狀態
                            	var status = '';
                            	if (add_list_backup.length > 0)
                            		status += '加';
                            	if (quit_list_backup.length > 0)
                            		status += '退';
                            	status += '選';

                            	mail_subject = mail_subject.replace(/\[\[學年度\]\]/g, self.currentData.SchoolYear());
                            	mail_subject = mail_subject.replace(/\[\[學期\]\]/g, self.currentData.FullSemester());
                            	mail_subject = mail_subject.replace(/\[\[階段別\]\]/g, period);
                            	mail_subject = mail_subject.replace(/\[\[選課結果寄出時間\]\]/g, mail_sending_time);
                            	mail_subject = mail_subject.replace(/\[\[加退選狀態\]\]/g, status);
                            	mail_subject = mail_subject.replace(/\[\[加選堂數\]\]/g, add_list_backup.length);
                            	mail_subject = mail_subject.replace(/\[\[退選堂數\]\]/g, quit_list_backup.length);
                            	mail_subject = mail_subject.replace(/\[\[加選課程\]\]/g, (add_list_backup.length > 0) ? '<p>加選課程：</p>' + course_add_html_backup : '');
                            	mail_subject = mail_subject.replace(/\[\[退選課程\]\]/g, (quit_list_backup.length > 0) ? '<p>退選課程：</p>' + course_quit_html_backup : '');
                            	mail_subject = mail_subject.replace(/\[\[選課結果\]\]/g, '<p>選課結果：</p>' + get_course_html(self.curr_attend()));

                            	mail_content = mail_content.replace(/\[\[學年度\]\]/g, self.currentData.SchoolYear());
                            	mail_content = mail_content.replace(/\[\[學期\]\]/g, self.currentData.FullSemester());
                            	mail_content = mail_content.replace(/\[\[階段別\]\]/g, period);
                            	mail_content = mail_content.replace(/\[\[選課結果寄出時間\]\]/g, mail_sending_time);
                            	mail_content = mail_content.replace(/\[\[加退選狀態\]\]/g, status);
                            	mail_content = mail_content.replace(/\[\[加選堂數\]\]/g, add_list_backup.length);
                            	mail_content = mail_content.replace(/\[\[退選堂數\]\]/g, quit_list_backup.length);
                            	mail_content = mail_content.replace(/\[\[加選課程\]\]/g, (add_list_backup.length > 0) ? '<p>加選課程：</p>' + course_add_html_backup : '');
                            	mail_content = mail_content.replace(/\[\[退選課程\]\]/g, (quit_list_backup.length > 0) ? '<p>退選課程：</p>' + course_quit_html_backup : '');
                            	mail_content = mail_content.replace(/\[\[選課結果\]\]/g, '<p>選課結果：</p>' + get_course_html(self.curr_attend()));

                                _gg.connection.send({
                                    service: "_.SendMail",
                                    body: {
                                        Request: {
                                            Receiver: receivers,
                                            Subject: mail_subject,
                                            HtmlContent: mail_content
                                        }
                                    },
                                    result: function (response, error, http) {
                                        if (error) {
                                            conn_log.ready(function(){
                                                gadget.getContract("emba.student").send({
                                                    service: "public.AddLog",
                                                    body: {
                                                        Request: {
                                                            Log: {
                                                                Actor: conn_log.getUserInfo().UserName,
                                                                ActionType: "選課結果通知",
                                                                Action: "發送選課結果通知失敗",
                                                                TargetCategory: "student",
                                                                ClientInfo: {
                                                                    ClientInfo: {}
                                                                },
                                                                ActionBy: "ischool web 選課小工具",
                                                                Description: '學生「' + self.student.StudentName() + '」發送選課結果通知失敗：' +  JSON.stringify(error)
                                                            }
                                                        }
                                                    }
                                                });
                                            });
                                        } else {
                                            conn_log.ready(function(){
                                                gadget.getContract("emba.student").send({
                                                    service: "public.AddLog",
                                                    body: {
                                                        Request: {
                                                            Log: {
                                                                Actor: conn_log.getUserInfo().UserName,
                                                                ActionType: "選課結果通知",
                                                                Action: "發送選課結果通知成功",
                                                                TargetCategory: "student",
                                                                ClientInfo: {
                                                                    ClientInfo: {}
                                                                },
                                                                ActionBy: "ischool web 選課小工具",
                                                                Description: '學生「' + self.student.StudentName() + '」發送選課結果通知成功'
                                                            }
                                                        }
                                                    }
                                                });
                                            });
                                        }
                                    }
                                });
                            } else {
                                conn_log.ready(function(){
                                    gadget.getContract("emba.student").send({
                                        service: "public.AddLog",
                                        body: {
                                            Request: {
                                                Log: {
                                                    Actor: conn_log.getUserInfo().UserName,
                                                    ActionType: "選課結果通知",
                                                    Action: "發送選課結果通知失敗",
                                                    TargetCategory: "student",
                                                    ClientInfo: {
                                                        ClientInfo: {}
                                                    },
                                                    ActionBy: "ischool web 選課小工具",
                                                    Description: '學生「' + self.student.StudentName() + '」未設定Email'
                                                }
                                            }
                                        }
                                    });
                                });
                            }
                            self.CallbackQueue.JobFinished();
                    	};

						//	以下4行是原來的程式
                    	//self.curr_attend.removeAll();
                    	//self.can_choose_course.removeAll();
                    	//self.get_attend(send_Mail);
                    	//self.get_can_choose_course();

						//	以下程式是為了重構寄信而新寫的
                		//	1、備份加選課程及退選課程
                    	var add_list_backup = self.get_add_list() || [];
                    	var quit_list_backup = self.get_quit_list() || [];
                    	var course_add_html_backup = get_course_html(add_list_backup) || '';
                    	var course_quit_html_backup = get_course_html(quit_list_backup) || '';

                		//	2、清空curr_attend及can_choose_course
                    	self.curr_attend.removeAll();
                    	self.can_choose_course.removeAll();

                		//	3、get_attend
                    	self.CallbackQueue.Push(self.get_attend_no_callback);

                		//	4、send_Mail
                    	self.CallbackQueue.Push(function () {
                    		send_Mail(add_list_backup, quit_list_backup, course_add_html_backup, course_quit_html_backup);
                    	});

                		//	5、get_can_choose_course
                    	self.CallbackQueue.Push(function () {
                    		self.get_can_choose_course();
                    		self.CallbackQueue.JobFinished();
                    	});
						//	6、Let's go！
                    	self.CallbackQueue.Start();
                    }
                };

                var _add = self.get_add_list();
                if (_add.length > 0) {
                    course_add_html = get_course_html(_add);
                    $(_add).each(function(index, item) {
                        add_list.push('<Course><CourseID>' + item.CourseID + '</CourseID></Course>');
                        add_log.push('<Course><CourseID>' + item.CourseID + '</CourseID>' +
                            '<Action>insert</Action><ActionBy>student</ActionBy></Course>');
                        log_add_content.push(
                            '學生「' + self.student.StudentName() + '」加選課程：\n' + item.CourseName
                        );
                    });

                    _gg.connection.send({
                        service: "_.AddCSAttend",
                        body: '<Request>' + add_list.join('') + '</Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                $('#save-data').button('reset');
                                $('#myModal [data-dismiss="modal"]').show();
                                _gg.set_error_message('#errorMessage', 'AddCSAttend', error);
                            } else {
                                conn_log.ready(function(){
                                    _gg.connection.send({
                                        service: "_.AddCSAttendLog",
                                        body: '<Request>' + add_log.join('') + '</Request>',

                                        result: function (response, error, http) {
                                            if (error !== null) {
                                                $('#save-data').button('reset');
                                                $('#myModal [data-dismiss="modal"]').show();
                                                _gg.set_error_message('#errorMessage', 'AddCSAttendLog', error);
                                            } else {
                                                gadget.getContract("emba.student").send({
                                                    service: "public.AddLog",
                                                    body: {
                                                        Request: {
                                                            Log: {
                                                                Actor: conn_log.getUserInfo().UserName,
                                                                ActionType: "加選",
                                                                Action: "加選課程",
                                                                TargetCategory: "student",
                                                                ClientInfo: {
                                                                    ClientInfo: {}
                                                                },
                                                                ActionBy: "ischool web 選課小工具",
                                                                Description: log_add_content.join(',')
                                                            }
                                                        }
                                                    }
                                                });
                                                add_complete = true;
                                                complete_process();
                                            }
                                        }
                                    });
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
                    course_quit_html = get_course_html(_quit);
                    $(_quit).each(function(index, item) {
                        quit_list.push('<Course><CourseID>' + item.CourseID + '</CourseID></Course>');
                        quit_log.push('<Course><CourseID>' + item.CourseID + '</CourseID>' +
                            '<Action>delete</Action><ActionBy>student</ActionBy></Course>');
                        log_quit_content.push(
                            '學生「' + self.student.StudentName() + '」退選課程：\n' + item.CourseName
                        );
                    });

                    _gg.connection.send({
                        service: "_.DelCSAttend",
                        body: '<Request>' + quit_list.join('') + '</Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                $('#save-data').button('reset');
                                $('#myModal [data-dismiss="modal"]').show();
                                _gg.set_error_message('#errorMessage', 'DelCSAttend', error);
                            } else {
                                conn_log.ready(function(){
                                    _gg.connection.send({
                                        service: "_.AddCSAttendLog",
                                        body: '<Request>' + quit_log.join('') + '</Request>',

                                        result: function (response, error, http) {
                                            if (error !== null) {
                                                $('#save-data').button('reset');
                                                $('#myModal [data-dismiss="modal"]').show();
                                                _gg.set_error_message('#errorMessage', 'AddCSAttendLog', error);
                                            } else {
                                                gadget.getContract("emba.student").send({
                                                    service: "public.AddLog",
                                                    body: {
                                                        Request: {
                                                            Log: {
                                                                Actor: conn_log.getUserInfo().UserName,
                                                                ActionType: "退選",
                                                                Action: "退選課程",
                                                                TargetCategory: "student",
                                                                ClientInfo: {
                                                                    ClientInfo: {}
                                                                },
                                                                ActionBy: "ischool web 選課小工具",
                                                                Description: log_quit_content.join(',')
                                                            }
                                                        }
                                                    }
                                                });
                                                quit_complete = true;
                                                complete_process();
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    });
                } else {
                    quit_complete = true;
                    complete_process();
                }
            },
            set_full_semester : function() {
                var self = MyViewModel;

                self.currentData.FullSemester = ko.computed(function(){
                    switch (self.currentData.Semester()) {
                        case '0':
                            return '夏季學期';
                        case '1':
                            return '第一學期';
                        case '2':
                            return '第二學期';
                        default :
                            return '';
                    }
                })
            },

            // 第一、二階段已選課程總數，用於顯示目前無資料
            getLevelItems : function(level) {
                var self = MyViewModel;
                var count = 0;
                $(self.curr_attend()).each(function(index, item) {
                    if (item.ChooseItem === level) {
                        count += 1;
                    }
                });
                return count;
            },

            // 依學生狀態決定顯示內容
            checkNowStatus : function() {
                var self = MyViewModel;
                var today = new Date();
                var Startdate, Enddate;
                var Status;
                var basicDate;
                var addDays;

                if (self.currentData.Item()) {
                    // 在階段內
                    if (MyViewModel.currentData.Item() === '1') {
                        $("#cs_content_template").html(self.configuration.cs_content1_template());
                    };
                    if (MyViewModel.currentData.Item() === '2') {
                        $("#cs_content_template").html(self.configuration.cs_content2_template());
                    };

                    $('#sa01 button[ac-type=save1]').tooltip({
                        trigger : "manual"
                    });
                } else {
                    // 1. 第一階段選課前，可選課程=目前尚未開放選課,課程總表 + 衝堂課程=無資料
                    // 2. 第一第二階段選課中間~可選課程=目前尚未開放第二階段選課
                    // 3. 第二階段後加退選前~選課最終確認=尚未公告選課最終結果
                    // 4. 加退選期間結束後~選課最終確認,課程總表 + 衝堂課程=本學期選課已結束，目前尚未開放下一學期選課
                    // 5. 第一階段選課前五天，可選課程=目前尚未開放選課,課程總表+衝堂課程=正常顯示

                    if (_all_opening_data['Level0_EndTime']) {
                        Enddate = new Date(_all_opening_data['Level0_EndTime']);
                        if (Enddate < today) {
                            Status = 4;
                        }
                    }

                    if (_all_opening_data['Level2_EndTime']) {
                        if (_all_opening_data['Level0_BeginTime']) {
                            Startdate = new Date(_all_opening_data['Level2_EndTime']);
                            Enddate = new Date(_all_opening_data['Level0_BeginTime']);
                            if (Startdate < today && Enddate > today) {
                                Status = 3;
                            }
                        } else {
                            Status = 3;
                        }
                    }

                    if (_all_opening_data['Level1_EndTime']) {
                        Startdate = new Date(_all_opening_data['Level1_EndTime']);
                        if (_all_opening_data['Level2_BeginTime']) {
                            Enddate = new Date(_all_opening_data['Level2_BeginTime']);
                            if (Startdate < today && Enddate > today) {
                                Status = 2;
                            }
                        } else if (Startdate < today) {
                            Status = 2;
                        }
                    }

                    if (_all_opening_data['Level1_BeginTime']) {
                        Startdate = new Date(_all_opening_data['Level1_BeginTime']);
                        addDays = new Date(Startdate.getFullYear(),Startdate.getMonth(),Startdate.getDate()-6);
                        if (Startdate > today) {
                            if (today >= addDays) {
                                Status = 5;
                            } else {
                                Status = 1;
                            }
                        }
                    }

                    switch (Status) {
                        case 5:
                            $('#sa01 .memb-list, #sa06 .memb-list').remove();
                            $('#sa01').html('<p>目前尚未開放選課</p>');
                            MyViewModel.currentData.Item('s5');
                            break;
                        case 1:
                            $('#sa01 .memb-list, #sa06 .memb-list').remove();
                            $('#sa01').html('<p>目前尚未開放選課</p>');
                            $('#sa02, #sa03').html('<p>目前無資料</p>');
                            MyViewModel.currentData.Item('s1');
                            break;
                        case 2:
                            $('#sa01 .memb-list, #sa06 .memb-list').remove();
                            $('#sa01').html('<p>目前尚未開放第二階段選課</p>');
                            MyViewModel.currentData.Item('s2');
                            break;
                        case 3:
                            $('#sa01 .memb-list, #sa06 .memb-list').remove();
                            $('#sa06').html('<p>尚未公告選課最終結果</p>');
                            MyViewModel.currentData.Item('s3');
                            break;
                        case 4:
                            $('#sa01 .memb-list, button[ac-type="save0"], button[ac-type="printCourse"]').remove();
                            $('#sa02, #sa03').html('<p>本學期選課已結束，目前尚未開放下一學期選課</p>');
                            // 收到加退選單資訊，呈現到加退選結束時間+10日
                            if (_all_opening_data['Level0_EndTime']) {
                                basicDate = new Date(_all_opening_data['Level0_EndTime']);
                                addDays = new Date(basicDate.getFullYear(),basicDate.getMonth(),basicDate.getDate()+11);
                                if (today > addDays) {
                                    $('#sa06 .memb-list').remove();
                                }
                            } else {
                                $('#sa06 .memb-list').remove();
                            }

                            MyViewModel.currentData.Item('s4');
                            break;
                        default:
                            $('#sa01 .memb-list, #sa06 .memb-list').remove();
                            $('h1').html('選課');
                            $('#myTabContent').html('<p>目前尚未開放選課</p>');
                    }
                }

                if (self.currentData.SchoolYear() && self.currentData.Semester()) {
                    self.get_all_course();
                }
                $('#myTab li > a:first').trigger('click');
            },

            // 依學生狀態決定顯示內容
            checkStudentStatus : function() {
                var self = MyViewModel;
                if (self.student.Status() === '1' || self.student.Status() === '4') {
                    self.get_openingdata();
                } else {
                    $('h1').html('選課');
                    $('#myTabContent').html('很抱歉，您無權限操作此功能');
                }
            }

        };
    })();
    MyViewModel.get_weburl();
    MyViewModel.set_full_semester();
    MyViewModel.get_student_info();
    MyViewModel.get_faq();
    MyViewModel.get_configuration();
    MyViewModel.CallbackQueue = CreateCallbackQueue();
})();

_gg.getCourseType = function(type) {
    switch(type) {
        case '核心必修':
            return '<span class="label label-important">核必</span>';
        case '核心選修':
            return '<span class="label label-warning">核選</span>';
        case '分組必修':
            return '<span class="label label-success">組必</span>';
        case '選修':
            return '<span class="label my-label-info">選修</span>';
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

ko.bindingHandlers.conflict_list = {
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $elem = $(element);
        var val = valueAccessor();
        var title = [];
        $(val).each(function(index, courseid) {
            if (MyViewModel.all_col_course[courseid]) {
                title.push(MyViewModel.all_col_course[courseid].CourseName || '');
            }
        });

        $elem.tooltip('hide').data('tooltip', false);
        if (title.length) {
            $elem.attr('rel', 'tooltip');
            $elem.tooltip({
                placement :'right',
                title     : '與「' + title.join(', ') + '」衝堂或不得重複加選'
            });
        }
    }
};

// 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    if (serviceName) {
        var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗，請稍候重試!</strong>(' + serviceName + ')';
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
    } else {
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
    }
};

