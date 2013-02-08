var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.scheduler.teacher");

$(document).ready( function () {
    $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>載入中...</td></tr>');

    // var vm = new MyViewModel();
    window.vm = new MyViewModel();
    ko.applyBindings(vm);

    $('#keyword').focus(function() {
        $('#search').html('搜尋');
    });

    var search_btn = function() {
        $('#search').html(function() {
            if ($('#search').html() === '搜尋') {
                if ($('#keyword').val()) {
                    $('#timeTable td[rel=tooltip]').tooltip('hide');
                    $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>載入中...</td></tr>');
                    vm.search($('#keyword').val());
                    return '<i class="icon-remove"></i> 取消搜尋';
                }
            } else {
                $('#keyword').val('');
                vm.runMydata();
                return '搜尋';
            }
        });
    };

    $('#keyword').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            if ($('#keyword').val()) {
                search_btn();
            }
        }
    });

    $('#search').click(function() {
        search_btn();
    });

    $('#print').click(function() {
        vm.printScore();
    });

    $('#menu1').on('click', 'li', function() {
        $('#tabName').html($(this).find('a').html());
        $('#menu1 li.active').removeClass('active');
        $(this).addClass('active');

        var request = {
            SchoolYear : $(this).find('a').attr('schoolyear'),
            Semester   : $(this).find('a').attr('semester'),
            kind       : $('#menu2 li.active a').attr('kind'),
            kid        : $('#menu2 li.active a').attr('kid')
        };
        vm.getScheduler(request);
    });

    $('#menu2').on('click', 'li', function() {
        $('#tabSearch').html($(this).find('a').html());
        $('#menu2 li.active').removeClass('active');
        $(this).addClass('active');
        // TODO: 重取學年度學期，觸發第一筆學年度學期
        var request = {
            kind : $(this).find('a').attr('kind'),
            kid  : $(this).find('a').attr('kid')
        };
        vm.getSemester(request);
    });

    $('#timeTable tbody').on('click', 'td a[kind]', function() {
        var kind = $(this).attr('kind');
        var kid = $(this).attr('kid');
        var keyword = $(this).html();
        if (kind && kid) {
            $('#timeTable td[rel=tooltip]').tooltip('hide');
            $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>載入中...</td></tr>');
            $('#keyword').val(keyword);
            $('#search').html('<i class="icon-remove"></i> 取消搜尋');
            vm.correspond_list.removeAll();
            vm.correspond_list.push({
                Kind : kind,
                ID   : kid,
                Name : keyword
            });
            $('#menu2 li:first').click();
        }
    });

    _gg.connection.send({
        service: "_.GetMyInfo",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetMyInfo', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {
                    $(response.Response.Teacher).each(function(index, item) {
                        vm.myid = item.Id;
                        vm.myname = item.TeacherName;
                    });
                }
                if (vm.myid) {
                    vm.correspond_list.push({
                        Kind : 'teacher',
                        ID   : vm.myid,
                        Name : vm.myname
                    });
                    $('#menu2 li:first').click();
                }
            }
        }
    });
});

var MyViewModel = function() {
    var self = this;
    // TODO: 我的資料
    self.myid = '';
    self.myname = '';
    self.mysemester_list = null;
    self.myschedulers = null;
    self.myscheduler_year = null;
    self.myscheduler_seme = null;
    self.mytimetable = null;
    // TODO: 所有的 timetable，用來計算最大節數、星期、上課時段、節次名稱
    self.all_timetable = {};

    // TODO: 符合的名單
    self.correspond_list = ko.observableArray();
    // TODO: 當前條件的所有學年度學期列表
    self.semester_list = ko.observableArray();
    // TODO: 當前顯示課表
    self.curr_scheduler = [];
    self.curr_timetable = [];

    self.runing = {
        scheduler : false,
        timetable : false
    }

    self.process = function() {
        if (self.runing.scheduler && self.runing.timetable) {
            var check_timetable = true;
            $(self.curr_timetable).each(function(key, value) {
                if (!self.all_timetable[value]) { check_timetable = false; }
            });
            var max_Weekday = 0, max_Period = 0;
            var _thead = [], _tbody = [], kind=[];

            if (check_timetable) {
                kind = $('#menu2 li.active a').attr('kind') || 'teacher';

                if (self.curr_scheduler.length === 0) {
                    $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>目前無資料</td></tr>');
                } else {
                    self.setMydata();
                    var extendTimetable = {};

                    $(self.curr_timetable).each(function(key, value) {
                        max_Weekday = (self.all_timetable[value].max_Weekday > max_Weekday) ? self.all_timetable[value].max_Weekday : max_Weekday;
                        max_Period = (self.all_timetable[value].max_Period > max_Period) ? self.all_timetable[value].max_Period : max_Period;
                        $.extend(extendTimetable, self.all_timetable[value]);
                    });

                    for (var ii=0; ii<=max_Period; ii+=1) {
                        (ii===0) ? _thead.push('<tr>') : _tbody.push('<tr>');

                        for (var jj=0; jj<=max_Weekday; jj+=1) {
                            if (ii===0) {
                                var title = ((jj === 0) ? '&nbsp;' : $.funGetDayName(jj || ''));
                                _thead.push('<td>' + title + '</td>');
                            } else {
                                if (jj===0) {
                                    _tbody.push('<td>' + ii + '</td>');
                                } else {
                                    var tt = extendTimetable['' + ii + jj];
                                    if (tt) {

                                        var flag = '', course_time = '', tool_tip = '', group_tip = [];

                                        //節次的開始時間、結束時間
                                        var beginTime = new Date(tt.BeginTime);
                                        var minutesLater = new Date(tt.BeginTime);
                                        minutesLater.setMinutes(minutesLater.getMinutes() + parseInt(tt.Duration, 10));
                                        course_time = $.formatDate(beginTime, 'HHmm')  + ' - ' + $.formatDate(minutesLater, 'HHmm');

                                        if (tt.Disable === 't') {
                                            _tbody.push('<td rel="tooltip" data-placement="top" data-original-title="' + course_time + '">' + tt.DisableMessage + '</td>');
                                        } else {
                                            if (self.curr_scheduler[ii] && self.curr_scheduler[ii][jj]) {
                                                var that = self.curr_scheduler[ii][jj], info = '', subject = '', teachers_link = [], classroomlink = '', classlink = '';

                                                $(that).each(function(index, item) {
                                                    if (index === 0) {
                                                        switch (item.WeekFlag) {
                                                            case '1':
                                                                flat = '單週';
                                                                break;
                                                            case '2':
                                                                flat = '雙週';
                                                                break;
                                                        }

                                                        if (item.CourseGroup) {
                                                            tool_tip = '【' + item.CourseGroup + '】' + flag + ' ' + course_time;
                                                            info = item.CourseGroup || '';
                                                        } else {
                                                            tool_tip = flag + ' ' + course_time;
                                                        }
                                                    }

                                                    var level = item.Level;
                                                    if (level) {
                                                        level = $.arabic2roman(level);
                                                    }
                                                    subject = (item.Subject || '') + level;

                                                    var teachername = (item.TeacherName || '');
                                                    var classroomname = (item.ClassroomName || '');
                                                    var classname = (item.ClassName || '');

                                                    if (teachername) {
                                                        teacherlink = '<a href="#" kind="teacher" kid="' + (item.TeacherID || '') + '">' + teachername + '</a>';
                                                        teachers_link.push(teacherlink);
                                                    }
                                                    classroomlink = '<a href="#" kind="classroom" kid="' + (item.ClassroomID || '') + '">' + classroomname + '</a>';
                                                    classlink = '<a href="#" kind="class" kid="' + (item.ClassID || '') + '">' + classname + '</a>' ;

                                                    if (item.CourseGroup) {
                                                        group_tip.push('<li>' +
                                                            subject +
                                                            ' - ' + teachername +
                                                            ' - ' + classroomname +
                                                            '</li>'
                                                        );
                                                    }
                                                });


                                                if (group_tip.length > 0) {
                                                    tool_tip = tool_tip + '<ol>' + group_tip.join('') + '</ol>';
                                                } else {
                                                    switch (kind) {
                                                        case 'teacher':
                                                            info = '<ul>' +
                                                            '<li>' + classlink + '</li>' +
                                                            '<li>' + subject + '</li>' +
                                                            '<li>' + classroomlink + '</li>' +
                                                            '</ul>';
                                                            break;
                                                        case 'classroom':
                                                            info = '<ul>' +
                                                            '<li>' + classlink + '</li>' +
                                                            '<li>' + subject + '</li>' +
                                                            '<li>' + (teachers_link.join(', ')) + '</li>' +
                                                            '</ul>';
                                                            break;
                                                        case 'class':
                                                            info = '<ul>' +
                                                            '<li>' + subject + '</li>' +
                                                            '<li>' + (teachers_link.join(', ')) + '</li>' +
                                                            '<li>' + classroomlink + '</li>' +
                                                            '</ul>';
                                                            break;
                                                    };
                                                }

                                                _tbody.push(
                                                    '<td rel="tooltip" data-placement="top" data-original-title="' + tool_tip + '">' +
                                                    info +
                                                    '</td>'
                                                );
                                            } else {
                                                _tbody.push('<td></td>');
                                            }
                                        }
                                    } else {
                                        _tbody.push('<td></td>');
                                    }
                                }
                            }
                        }

                        (ii===0) ? _thead.push('</tr>') : _tbody.push('</tr>');
                    }

                    $('#timeTable thead').html(_thead.join(''));
                    $('#timeTable tbody').html(_tbody.join(''));
                    $('#timeTable td[rel=tooltip]').tooltip();
                }
            }
        }
    };

    self.setMydata = function() {
        if (!self.myschedulers && !self.mysemester_list) {
            self.mysemester_list = [];
            $.extend(self.mysemester_list, self.semester_list());
            self.myschedulers = self.curr_scheduler;
            self.mytimetable = self.curr_timetable;
        }
    };

    self.runMydata = function() {
        $('#timeTable td[rel=tooltip]').tooltip('hide');
        vm.correspond_list.removeAll();
        vm.correspond_list.push({
            Kind : 'teacher',
            ID   : self.myid,
            Name : self.myname
        });
        self.semester_list(self.mysemester_list || []);
        self.curr_scheduler = self.myschedulers || [];
        self.curr_timetable = self.mytimetable || [];
        self.runing.scheduler = true;
        self.runing.timetable = true;
        $('#tabName').html($('#menu1 li:first').html());
        $('#tabSearch').html(self.myname);
        $('#menu1 li:first').addClass('active');
        $('#menu2 li:first').addClass('active');
        self.process();
    };

    self.getSemester = function(request) {
        self.semester_list.removeAll();
        var kind = request.kind || '';
        var kid = request.kid || '';

        if (kind && kid) {

            switch (kind) {
                case 'teacher':
                    request.TeacherID = kid;
                    break;
                case 'classroom':
                    request.ClassroomID = kid;
                    break;
                case 'class':
                    request.ClassID = kid;
                    break;
                default:
                    return false;
            };


            _gg.connection.send({
                service: "_.GetSemester",
                body: {Request: request },
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetSemester', error);
                    } else {
                        if ($('#menu2 li.active a').attr('kind') === kind && $('#menu2 li.active a').attr('kid') === kid) {
                            var _ref;
                            if (((_ref = response.Schedule) != null ? _ref.CourseSection : void 0) != null) {
                                $(response.Schedule.CourseSection).each(function(index, item) {
                                    item.FullName = (item.SchoolYear || '') + '學年度 '+ (item.Semester || '') + '學期';
                                    self.semester_list.push(item);

                                    if (index === 0 && !self.mysemester_list) {
                                        self.myscheduler_year = item.SchoolYear;
                                        self.myscheduler_seme = item.Semester;
                                    }
                                });
                            }

                            if (self.semester_list().length > 0) {
                                $('#menu1 li:first').click();
                            } else {
                                $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>目前無資料</td></tr>');
                            }
                        }
                    }
                }
            });
        }
    };

    self.getScheduler = function(request) {
        self.runing.scheduler = false;
        self.curr_scheduler = [];
        self.curr_timetable = [];
        var schoolyear = request.SchoolYear || '';
        var semester = request.Semester || '';
        var kind = request.kind || '';
        var kid = request.kid || '';

        if (schoolyear && semester && kind && kid) {
            switch (kind) {
                case 'teacher':
                    request.TeacherID = kid;
                    break;
                case 'classroom':
                    request.ClassroomID = kid;
                    break;
                case 'class':
                    request.ClassID = kid;
                    break;
                default:
                    return false;
            };
            _gg.connection.send({
                service: "_.GetScheduler",
                body: {Request: request },
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetScheduler', error);
                    } else {
                        if ($('#menu2 li.active a').attr('kind') === kind
                            && $('#menu2 li.active a').attr('kid') === kid
                            && $('#menu1 li.active a').attr('schoolyear') === schoolyear
                            && $('#menu1 li.active a').attr('semester') === semester) {

                            var _ref;
                            if (((_ref = response.Schedule) != null ? _ref.CourseSection : void 0) != null) {
                                $(response.Schedule.CourseSection).each(function(index, item) {
                                    if (!self.all_timetable[item.TimetableID]) {
                                        self.all_timetable[item.TimetableID] = {
                                            max_Weekday : item.Weekday,
                                            max_Period  : item.Period
                                        }
                                        self.getTimetable(item.TimetableID);
                                    }

                                    if ($.inArray(item.TimetableID, self.curr_timetable) < 0) {
                                        self.curr_timetable.push(item.TimetableID);
                                    }

                                    var len = parseInt((item.Length || 0), 10);
                                    if (len > 0) {
                                        var period = parseInt((item.Period || 0), 10);

                                        for (var ii=period; ii<len+period; ii++) {
                                            if (!self.curr_scheduler[period]) {
                                                self.curr_scheduler[period] = [];
                                            }

                                            if (!self.curr_scheduler[period][item.Weekday]) {
                                                self.curr_scheduler[period][item.Weekday] = [];
                                            }
                                            self.curr_scheduler[period][item.Weekday].push(item);
                                        }
                                    }
                                });
                            }

                            if (self.curr_scheduler.length > 0) {
                                self.runing.scheduler = true;
                                self.process();
                            } else {
                                $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>目前無資料</td></tr>');
                            }
                        }
                    }
                }
            });
        }
    };

    self.getTimetable = function(ttid) {
        if (ttid) {
            self.runing.scheduler = false;
            _gg.connection.send({
                service: "_.GetTimetable",
                body: '<Request><Condition><TimetableID>' + ttid + '</TimetableID></Condition></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetTimetable', error);
                    } else {
                        var _ref;
                        if (((_ref = response.TimeTableSections) != null ? _ref.TimeTableSection : void 0) != null) {
                            $(response.TimeTableSections.TimeTableSection).each(function(index, item) {
                                if (!self.all_timetable[item.TimetableID]) {
                                    self.all_timetable[item.TimetableID] = {
                                        max_Weekday : item.Weekday,
                                        max_Period  : item.Period
                                    }
                                } else {
                                    if (parseInt(self.all_timetable[item.TimetableID].max_Weekday, 10) < parseInt(item.Weekday, 10)) {
                                        self.all_timetable[item.TimetableID].max_Weekday = item.Weekday;
                                    }
                                    if (parseInt(self.all_timetable[item.TimetableID].max_Period, 10) < parseInt(item.Period, 10)) {
                                        self.all_timetable[item.TimetableID].max_Period = item.Period;
                                    }
                                }

                                self.all_timetable[item.TimetableID][item.Period + item.Weekday] = item;
                            });
                            self.runing.timetable = true;
                            self.process();
                        }
                    }
                }
            });
        }
    };

    self.search = function(keyword) {
        self.correspond_list.removeAll();

        var reft = null, refc = null, refm = null;
        var joinData = function () {
            if (reft && refc && refm) {
                self.correspond_list(reft.concat(refc, refm));
                if (self.correspond_list().length > 0) {
                    $('#menu2 li:first').click();
                } else {
                    $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>目前無資料</td></tr>');
                }
            }
        }

        var getLikeTeacher = function(keyword) {
            _gg.connection.send({
                service: "_.GetTeachers",
                body: {Request: {TeacherName : '%' + keyword + '%' } },
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetTeachers', error);
                    } else {
                        if (keyword === $('#keyword').val()) {
                            var _ref, items = [];
                            if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {
                                $(response.Response.Teacher).each(function(index, item) {
                                    items.push({
                                        Kind : 'teacher',
                                        ID   : item.ID,
                                        Name : item.TeacherName
                                    });
                                });
                            }
                            reft = items;
                            joinData();
                        }
                    }
                }
            });
        };

        var getLikeClasses = function(keyword) {
            _gg.connection.send({
                service: "_.GetClasses",
                body: {Request: {ClassName : '%' + keyword + '%' } },
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetClasses', error);
                    } else {
                        if (keyword === $('#keyword').val()) {
                            var _ref, items = [];
                            if (((_ref = response.Response) != null ? _ref.Class : void 0) != null) {
                                $(response.Response.Class).each(function(index, item) {
                                    items.push({
                                        Kind : 'class',
                                        ID   : item.ID,
                                        Name : item.ClassName
                                    });
                                });
                            }
                            refc = items;
                            joinData();
                        }
                    }
                }
            });
        };

        var getLikeClassroom = function(keyword) {
            _gg.connection.send({
                service: "_.GetClassrooms",
                body: {Request: {ClassroomName : '%' + keyword + '%' } },
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetClassrooms', error);
                    } else {
                        if (keyword === $('#keyword').val()) {
                            var _ref, items = [];
                            if (((_ref = response.Response) != null ? _ref.Classroom : void 0) != null) {
                                $(response.Response.Classroom).each(function(index, item) {
                                    items.push({
                                        Kind : 'classroom',
                                        ID   : item.Uid,
                                        Name : item.Name
                                    });
                                });
                            }
                            refm = items;
                            joinData();
                        }
                    }
                }
            });
        };

        getLikeTeacher(keyword);
        getLikeClasses(keyword);
        getLikeClassroom(keyword);
    };

    self.printScore = function(type) {
        var content, doc, page0;
        page0 = $('#timeTable').html();
        page1 = $(page0)[0];
        $(page1).find('a').wrapInner('<span>').find('span').unwrap('a');
        content = '<html>\n' +
            '<head>\n' +
            '    <link type="text/css" rel="stylesheet" href="css/default.css"/>\n' +
            '</head>\n' +
            '<body>\n' +
            '<div class="my-print">\n' +
            '   <div class="title">' + $('#tabName').html() + ' ' + $('#tabSearch').html() + ' 課表</div>\n' +
            '   <table class="table">' + $(page1).html() + '</table>\n' +
            '</div></body>\n' +
            '</html>'

        doc = window.open('about:blank', '_blank', '');
        doc.document.open();
        doc.document.write(content);
        doc.document.close();
        return doc.focus();
    };

};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case '501':
                        tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
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

