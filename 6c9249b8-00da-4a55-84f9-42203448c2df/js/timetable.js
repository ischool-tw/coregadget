$(document).ready( function () {
    _gg.on_init();

    $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>載入中...</td></tr>');

    $('#keyword').focus(function() {
        $('#search').html('搜尋');
    });

    //#region 搜尋、取消搜尋
    var search_btn = function() {
        $('#search').html(function() {
            if ($('#search').html() === '搜尋') {
                if ($('#keyword').val()) {
                    _gg.on_search($('#keyword').val());
                    return '<i class="icon-remove"></i> 取消搜尋';
                }
            } else {
                $('#keyword').val('');
                _gg.on_runMydata();
                return '搜尋';
            }
        });
    };
    //#endregion

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
        _gg.printScheduler();
    });

    $('#menu1').on('click', 'li', function() {
        var pre_schoolyear = $('#tabName').attr('data-schoolyear');
        var pre_semester = $('#tabName').attr('data-semester');
        var new_schoolyear = $(this).find('a').attr('schoolyear');
        var new_semester = $(this).find('a').attr('semester');

        if (pre_schoolyear !== new_schoolyear || pre_semester !== new_semester) {
            $('#tabName')
                .attr('data-schoolyear', new_schoolyear)
                .attr('data-semester', new_semester)
                .html($(this).find('a').html());
            $('#menu1 li.active').removeClass('active');
            $(this).addClass('active');

            var new_kind = $('#menu2 li.active a').attr('kind');
            var new_kid = $('#menu2 li.active a').attr('kid');
            var request = {
                SchoolYear : new_schoolyear,
                Semester   : new_semester,
                kind       : new_kind,
                kid        : new_kid
            };
            _gg.getScheduler(request);

            if (new_kind === 'class') { _gg.getClassBusy(new_kid) ; }
        }
    });

    $('#menu2').on('click', 'li', function() {
        var pre_kind = $('#tabSearch').attr('data-kind');
        var pre_kid = $('#tabSearch').attr('data-kid');
        var new_kind = $(this).find('a').attr('kind');
        var new_kid = $(this).find('a').attr('kid');

        if (pre_kind !== new_kind || pre_kid !== new_kid) {
            $('#timeTable td[rel=tooltip]').tooltip('hide');
            $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>載入中...</td></tr>');
            $('#tabSearch')
                .attr('data-kind', new_kind)
                .attr('data-kid', new_kid)
                .html($(this).find('a').html());
            $('#tabName')
                .attr('data-schoolyear', '')
                .attr('data-semester', '')
                .html('');
            $('#menu2 li.active').removeClass('active');
            $(this).addClass('active');
            // TODO: 重取學年度學期，觸發第一筆學年度學期
            var request = {
                kind : new_kind,
                kid  : new_kid
            };
            _gg.getSemester(request);
        }
    });

    $('#timeTable, #myTabContent').on('click', 'a[kind]', function() {
        var kind = $(this).attr('kind');
        var kid = $(this).attr('kid');
        var keyword = $(this).html();
        if (kind && kid) {
            $('#keyword').val(keyword);
            $('#search').html('<i class="icon-remove"></i> 取消搜尋');
            _gg.setTCCDropDownList({
                Kind : kind,
                ID   : kid,
                Name : keyword
            });
        }
    });

    $('#class').on('click', 'li.nav-header', function() {
        // $('#class li').not('.nav-header').hide();
        if ($(this).find('i.icon-chevron-down').size()) {
            $(this).nextUntil('li.nav-header').hide();
        } else {
            $(this).nextUntil('li.nav-header').show();
        }
        $(this).find('i').toggleClass('icon-chevron-down icon-chevron-up');
    });
});

var _gg = function() {
    var connection = gadget.getContract("ischool.scheduler.teacher"),
        myself = {
            tcc_list       : null,
            semester_list  : null,
            scheduler_list : null
        },
        teachers,
        classes,
        classrooms,
        alloptions = [],
        all_timetable = {}, //所有的 timetable，用來計算最大節數、星期、上課時段、節次名稱
        semester_list = [], //當前條件的所有學年度學期列表
        curr_scheduler = [],
        curr_timetable = [],
        curr_classbusy = [],
        runing = {
            scheduler : false,
            classbusy : false
        };

    //#region 錯誤訊息
    var set_error_message = function(select_str, serviceName, error) {
        if (serviceName) {
            var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            if (error !== null) {
                if (error.dsaError) {
                    if (error.dsaError.status === "504") {
                        switch (error.dsaError.message) {
                            case '501':
                                tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                                break;
                            default:
                                tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
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
    //#endregion

    //#region 取得我的姓名，完成後呼叫 setTCCDropDownList()
    var initialize = function() {
        connection.send({
            service: "_.GetMyInfo",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetMyInfo', error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {
                        $(response.Response.Teacher).each(function(index, item) {
                            setTCCDropDownList({
                                Kind : 'teacher',
                                ID   : item.TeacherID,
                                Name : item.TeacherName
                            });
                        });
                    }
                }
            }
        });
    };
    //#endregion

    //#region 取得所有老師、所有班級、所有場地
    var getAllSearchItem = function() {
        var checkResult = function() {
            if (teachers && classes && classrooms) {
                alloptions = teachers.concat(classes, classrooms);
            }
        };

        var getTeachers = function() {
            connection.send({
                service: "_.GetTeachers",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetTeachers', error);
                    } else {
                        var _ref, items = [], teacher_list = [];
                        if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {
                            $(response.Response.Teacher).each(function(index, item) {
                                items.push({
                                    Kind : 'teacher',
                                    ID   : item.ID,
                                    Name : item.TeacherName
                                });
                                teacher_list.push('<li><a href="#" kind="teacher" kid="' + (item.ID || '') + '">' + (item.TeacherName) + '</a></li>');
                            });
                        }
                        teachers = items;
                        checkResult();
                        $('#teacher ul').html(teacher_list.join(''));
                    }
                }
            });
        };

        var getClasses = function() {
            connection.send({
                service: "_.GetClasses",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetClasses', error);
                    } else {
                        var _ref, items = [], class_list = [], grader_year, grader_name;
                        if (((_ref = response.Response) != null ? _ref.Class : void 0) != null) {
                            $(response.Response.Class).each(function(index, item) {
                                items.push({
                                    Kind : 'class',
                                    ID   : item.ID,
                                    Name : item.ClassName
                                });
                                if (item.GraderYear !== grader_year) {
                                    if (item.GraderYear === '') {
                                        grader_name = '未分年級';
                                    } else {
                                        grader_name = item.GraderYear + '年級';
                                    }
                                    class_list.push('<li class="nav-header"><a href="#"><i class="icon-chevron-down"></i> ' + grader_name + '</a></li>');
                                    grader_year = item.GraderYear;
                                }
                                class_list.push('<li><a href="#" kind="class" kid="' + (item.ID || '') + '">' + (item.ClassName || '') + '</a></li>');
                            });
                        }



                        classes = items;
                        checkResult();
                        $('#class ul').html(class_list.join(''));
                    }
                }
            });
        };

        var getClassrooms = function() {
            connection.send({
                service: "_.GetClassrooms",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetClassrooms', error);
                    } else {
                        var _ref, items = [], classroom_list = [];
                        if (((_ref = response.Response) != null ? _ref.Classroom : void 0) != null) {
                            $(response.Response.Classroom).each(function(index, item) {
                                items.push({
                                    Kind : 'classroom',
                                    ID   : item.Uid,
                                    Name : item.Name
                                });
                                classroom_list.push('<li><a href="#" kind="classroom" kid="' + (item.Uid || '') + '">' + (item.Name || '') + '</a></li>');
                            });
                        }
                        classrooms = items;
                        checkResult();
                        $('#place ul').html(classroom_list.join(''));
                    }
                }
            });
        };
        getTeachers();
        getClasses();
        getClassrooms();
    };
    //#endregion

    //#region 顯示課表
    var process = function() {
        //#region 依據儲存格內容取得表格 CSS
        var getTDCSS = function(_len) {
            if (_len <= 1) {
                return 'my-list1';
            } else if (_len >= 4) {
                return 'my-list4';
            } else {
                return 'my-list' + _len;
            }
        };
        var getTableCSS = function(_len) {
            if (_len <= 6) {
                return 'my-row6';
            } else if (_len >= 12) {
                return 'my-row12';
            } else {
                return 'my-row' + _len;
            }
        };
        //#endregion

        var kind = ($('#menu2 li.active a').attr('kind') || 'teacher');

        if (runing.scheduler && (kind === 'class' ? runing.classbusy : true)) {
            var check_timetable = true,
                max_Weekday = 0,
                max_Period = 0,
                _thead = [],
                _tbody = [],
                extendTimetable = {},
                ii, jj,
                weekday_name,
                tt, def_time = [],
                flag_x, flag_h, course_time, tool_tip, tooltip_html,
                beginTime, minutesLater,
                that, info, course_group_name;

            $(curr_timetable).each(function(key, value) {
                if (!all_timetable[value]) { check_timetable = false; }
            });

            if (check_timetable) {
                if (curr_scheduler.length === 0) {
                    $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>目前無資料</td></tr>');
                } else {
                    extendTimetable = {};

                    //#region 最大星期、節次
                    $(curr_timetable).each(function(key, value) {
                        max_Weekday = (all_timetable[value].max_Weekday > max_Weekday) ? all_timetable[value].max_Weekday : max_Weekday;
                        max_Period = (all_timetable[value].max_Period > max_Period) ? all_timetable[value].max_Period : max_Period;
                        $.extend(extendTimetable, all_timetable[value]);
                    });
                    //#endregion

                    //#region 節次
                    for (ii=0; ii<=max_Period; ii+=1) {
                        (ii===0) ? _thead.push('<tr>') : _tbody.push('<tr>');

                        //#region 星期
                        for (jj=0; jj<=max_Weekday; jj+=1) {
                            if (ii===0) {
                                // TODO: 星期
                                weekday_name = (jj === 0 ? '&nbsp;' : $.funGetDayName(jj || ''));
                                _thead.push('<th>' + weekday_name + '</th>');
                            } else {
                                if (jj===0) {
                                    // TODO: 節次
                                    course_time = '';
                                    for (kk=1; kk<=max_Weekday; kk+=1) {
                                        tt = extendTimetable['' + ii + kk];
                                        if (tt) {
                                            //節次的開始時間、結束時間
                                            beginTime = new Date(tt.BeginTime);
                                            minutesLater = new Date(tt.BeginTime);
                                            minutesLater.setMinutes(minutesLater.getMinutes() + parseInt(tt.Duration, 10));
                                            course_time = $.formatDate(beginTime, 'HHmm')  + '<br />|<br />' + $.formatDate(minutesLater, 'HHmm');
                                            def_time[ii] = {
                                                orgBeginTime: tt.BeginTime,
                                                duration: tt.Duration,
                                            };
                                            break;
                                        }
                                    }

                                    if (!def_time[ii]) {
                                        def_time[ii] = {
                                            orgBeginTime: '',
                                            duration: '',
                                        };
                                    }
                                    _tbody.push('<th>' + ii + '<div class="my-time">' + course_time +'</div></th>');
                                } else {
                                    flag = '', course_time = '', tool_tip = [], tooltip_html = '', info = [], course_group_name = '';
                                    tt = extendTimetable['' + ii + jj];
                                    if (tt) {
                                        //節次的開始時間、結束時間
                                        if (def_time[ii].orgBeginTime !== tt.BeginTime || def_time[ii].duration !== tt.Duration) {
                                            beginTime = new Date(tt.BeginTime);
                                            minutesLater = new Date(tt.BeginTime);
                                            minutesLater.setMinutes(minutesLater.getMinutes() + parseInt(tt.Duration, 10));
                                            course_time = '<li class="my-time">(' + $.formatDate(beginTime, 'HHmm')  + '-' + $.formatDate(minutesLater, 'HHmm') + ')</li>';
                                        }

                                        if (tt.Disable === 't') {
                                            // TODO: timetable不排課
                                            _tbody.push(
                                                '<td class="' + getTDCSS(1) + '">' +
                                                '    <ul>' +
                                                '        <li class="my-subject">' + tt.DisableMessage + '</li>' +
                                                course_time +
                                                '    </ul>' +
                                                '</td>'
                                            );
                                        } else {
                                            if (curr_classbusy['' + ii + jj]) {
                                                _tbody.push(
                                                    '<td class="' + getTDCSS(1) + '">' +
                                                    '    <ul>' +
                                                    '        <li class="my-subject">' + curr_classbusy['' + ii + jj] + '</li>' +
                                                    course_time +
                                                    '    </ul>' +
                                                    '</td>'
                                                );
                                            } else {
                                                if (curr_scheduler[ii] && curr_scheduler[ii][jj]) {
                                                    that = curr_scheduler[ii][jj];
                                                    $(that).each(function(index, item) {
                                                        switch (item.WeekFlag) {
                                                            case '1':
                                                                flag_h = '<li class="my-week">(單)</li>';
                                                                flag_x = '(單)';
                                                                break;
                                                            case '2':
                                                                flag_h = '<li class="my-week">(雙)</li>';
                                                                flag_x = '(雙)';
                                                                break;
                                                            default:
                                                                flag_h = '';
                                                                flag_x = '';
                                                        }

                                                        var subject = (item.Subject || '') + (item.level ? $.arabic2roman(item.level) : '');
                                                        var teachername = (item.TeacherName || '');
                                                        var classroomname = (item.ClassroomName || '');
                                                        var classname = (item.ClassName || '');
                                                        var teacherlink = (teachername ? '<a href="#" kind="teacher" kid="' + (item.TeacherID || '') + '">' + teachername + '</a>' : '');
                                                        var classroomlink = (classroomname ? '<a href="#" kind="classroom" kid="' + (item.ClassroomID || '') + '">' + classroomname + '</a>' : '');
                                                        var classlink = (classname ? '<a href="#" kind="class" kid="' + (item.ClassID || '') + '">' + classname + '</a>' : '');

                                                        if (index > 3) {
                                                            switch (kind) {
                                                                case 'teacher':
                                                                    tool_tip.push('<li>' + flag_x + classname + ' - ' + subject + ' - ' + classroomname + '</li>');
                                                                    break;
                                                                case 'classroom':
                                                                    tool_tip.push('<li>' + flag_x + classname + ' - ' + subject + ' - ' + teachername + '</li>');
                                                                    break;
                                                                case 'class':
                                                                    tool_tip.push('<li>' + flag_x + subject + ' - ' + teachername + ' - ' + classroomname + '</li>');
                                                                    break;
                                                            };
                                                        } else {
                                                            switch (kind) {
                                                                case 'teacher':
                                                                    info.push(
                                                                        '<ul>' +
                                                                        flag_h +
                                                                        '<li>' + classlink + '</li>' +
                                                                        '<li>' + subject + '</li>' +
                                                                        '<li>' + classroomlink + '</li>' +
                                                                        '</ul>'
                                                                    );
                                                                    break;
                                                                case 'classroom':
                                                                    info.push(
                                                                        '<ul>' +
                                                                        flag_h +
                                                                        '<li>' + classlink + '</li>' +
                                                                        '<li>' + subject + '</li>' +
                                                                        '<li>' + teacherlink + '</li>' +
                                                                        '</ul>'
                                                                    );
                                                                    break;
                                                                case 'class':
                                                                    info.push(
                                                                        '<ul>' +
                                                                        flag_h +
                                                                        '<li>' + subject + '</li>' +
                                                                        '<li>' + teacherlink + '</li>' +
                                                                        '<li>' + classroomlink + '</li>' +
                                                                        '</ul>'
                                                                    );
                                                                    break;
                                                            };
                                                        }

                                                        if (kind === 'class' && item.CourseGroup) {
                                                            course_group_name = ('【' + item.CourseGroup + '】' || '');
                                                        }

                                                        if (index > 3) {
                                                            info.push('<div class="my-more">' + (that.length - 4)+ '+</div>');
                                                        }
                                                    });

                                                    if (course_group_name || tool_tip.length > 0) {
                                                        tooltip_html = '' +
                                                        'rel="tooltip" data-placement="top" data-original-title="' +
                                                        course_group_name +
                                                        '<ol>' + tool_tip.join('') + '</ol>"';
                                                    }

                                                    _tbody.push(
                                                        '<td class="' + getTDCSS(that.length) + '" ' + tooltip_html + '>' +
                                                        (that.length > 4 ? '<div style="position:relative;">' : '') +
                                                        info.join('') +
                                                        course_time +
                                                        (that.length > 4 ? '</div>' : '') +
                                                        '</td>'
                                                    );
                                                } else {
                                                    _tbody.push('<td class="' + getTDCSS(1) + '"></td>');
                                                }
                                            }
                                        }
                                    } else {
                                        _tbody.push('<td class="' + getTDCSS(1) + '"></td>');
                                    }
                                }
                            }
                        }
                        //#endregion

                        (ii===0) ? _thead.push('</tr>') : _tbody.push('</tr>');
                    }
                    //#endregion

                    $('#timeTable')
                        .find('table').removeClass().addClass('table table-bordered ' + getTableCSS(max_Period)).end()
                        .find('thead').html(_thead.join('')).end()
                        .find('tbody').html(_tbody.join(''))
                        .find('td[rel=tooltip]').tooltip();
                    if (!myself.scheduler_list) {
                        myself.scheduler_list = $('#timeTable').html();
                    }
                }
            }
        }
    };
    //#endregion

    var runMydata = function() {
        var tmp;
        if (!(myself.tcc_list && myself.semester_list && myself.scheduler_list)) {
            initialize();
        } else {
            tmp = $('<div />').append(myself.semester_list).find('li.active a');
            $('#tabName')
                .attr('data-schoolyear', tmp.attr('schoolyear'))
                .attr('data-semester', tmp.attr('semester'))
                .html(tmp.html());

            tmp = $($('<div>').append(myself.tcc_list).find('li.active a'));
            $('#tabSearch')
                .attr('data-kind', tmp.attr('kind'))
                .attr('data-kid', tmp.attr('kid'))
                .html(tmp.html());

            $('#menu2').html(myself.tcc_list);
            $('#menu1').html(myself.semester_list);
            $('#timeTable').html(myself.scheduler_list);
        }
    };

    //#region 設定學年度學期的下拉，完成後觸發第一筆
    var getSemester = function(request) {
        var kind = (request.kind || ''),
            kid = (request.kid || ''),
            m2 = $('#menu2 li.active a'),
            items = [];

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

            connection.send({
                service: "_.GetSemester",
                body: {Request: request },
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetSemester', error);
                    } else {
                        if (m2.attr('kind') === kind && m2.attr('kid') === kid) {
                            var _ref;
                            if (((_ref = response.Schedule) != null ? _ref.CourseSection : void 0) != null) {
                                $(response.Schedule.CourseSection).each(function(index, item) {
                                    items.push({
                                        SchoolYear : item.SchoolYear,
                                        Semester   : item.Semester
                                    });
                                });
                            }
                        }
                    }
                    setSemeDownList(items);
                }
            });
        }
    };
    //#endregion

    //#region 取得課程分段，完成後呼叫 process();
    var getScheduler = function(request) {
        runing.scheduler = false;
        var schoolyear = (request.SchoolYear || ''),
            semester = (request.Semester || ''),
            kind = (request.kind || ''),
            kid = (request.kid || ''),
            m2 = $('#menu2 li.active a'),
            m1 = $('#menu1 li.active a');

        curr_scheduler = [];
        curr_timetable = [];

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
            connection.send({
                service: "_.GetScheduler",
                body: { Request: request },
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetScheduler', error);
                    } else {
                        if (m2.attr('kind') === kind
                            && m2.attr('kid') === kid
                            && m1.attr('schoolyear') === schoolyear
                            && m1.attr('semester') === semester)
                        {
                            var _ref;
                            if (((_ref = response.Schedule) != null ? _ref.CourseSection : void 0) != null) {
                                $(response.Schedule.CourseSection).each(function(index, item) {
                                    if ($.inArray(item.TimetableID, curr_timetable) < 0) {
                                        getTimetable(item.TimetableID);
                                        curr_timetable.push(item.TimetableID);
                                    }

                                    var len = parseInt((item.Length || 0), 10);
                                    if (len > 0) {
                                        var period = parseInt((item.Period || 0), 10);

                                        for (var ii=period; ii<len+period; ii++) {
                                            if (!curr_scheduler[ii]) {
                                                curr_scheduler[ii] = [];
                                            }

                                            if (!curr_scheduler[ii][item.Weekday]) {
                                                curr_scheduler[ii][item.Weekday] = [];
                                            }
                                            curr_scheduler[ii][item.Weekday].push(item);
                                        }
                                    }
                                });
                            }

                            if (curr_scheduler.length > 0) {
                                runing.scheduler = true;
                                process();
                            } else {
                                $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>目前無資料</td></tr>');
                            }
                        }
                    }
                }
            });
        }
    };
    //#endregion

    //#region 取得timetable，完成後呼叫 process();
    getTimetable = function(ttid) {
        if (ttid) {
            if (all_timetable[ttid]) {
                process();
            } else {
                connection.send({
                    service: "_.GetTimetable",
                    body: '<Request><Condition><TimetableID>' + ttid + '</TimetableID></Condition></Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            set_error_message('#mainMsg', 'GetTimetable', error);
                        } else {
                            var _ref;
                            if (((_ref = response.TimeTableSections) != null ? _ref.TimeTableSection : void 0) != null) {
                                $(response.TimeTableSections.TimeTableSection).each(function(index, item) {
                                    if (!all_timetable[item.TimetableID]) {
                                        all_timetable[item.TimetableID] = {
                                            max_Weekday : item.Weekday,
                                            max_Period  : item.Period
                                        }
                                    } else {
                                        if (parseInt(all_timetable[item.TimetableID].max_Weekday, 10) < parseInt(item.Weekday, 10)) {
                                            all_timetable[item.TimetableID].max_Weekday = item.Weekday;
                                        }
                                        if (parseInt(all_timetable[item.TimetableID].max_Period, 10) < parseInt(item.Period, 10)) {
                                            all_timetable[item.TimetableID].max_Period = item.Period;
                                        }
                                    }

                                    all_timetable[item.TimetableID][item.Period + item.Weekday] = item;
                                });
                            }
                            process();
                        }
                    }
                });
            }
        }
    };
    //#endregion

    //#region 取得班級不排課，只有班級課表才使用
    getClassBusy = function(cid) {
        runing.classbusy = false;
        curr_classbusy = [];
        if (cid) {
            connection.send({
                service: "_.GetClassBusy",
                body: {
                    Request: {
                        Condition: {
                            ClassID: cid
                        }
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetClassBusy', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.ClassBusy : void 0) != null) {
                            $(response.Response.ClassBusy).each(function(index, item) {
                                curr_classbusy[item.Period + item.Weekday] = item.BusyDescription;
                            });
                        }
                        runing.classbusy = true;
                        process();
                    }
                }
            });
        }
    };
    //#endregion

    //#region 過濾搜尋條件
    var search = function(keyword) {
        var correspond_list = [];
        $(alloptions).each(function() {
            if (this.Name.indexOf(keyword) !== -1) {
                correspond_list.push(this);
            }
        });
        setTCCDropDownList(correspond_list);
    };
    //#endregion

    //#region 列印
    var printScheduler = function() {
        var content, doc, page;
        $('#timeTable caption').html($('#tabName').html() + ' ' + $('#tabSearch').html() + '課表');
        page = $($('#timeTable').html())
        page.find('a').wrapInner('<span>').find('span').unwrap('a');
        content = '<!DOCTYPE html>\n' +
            '<html>\n' +
            '<head>\n' +
            '  <link type="text/css" href="css/bootstrap.css" rel="stylesheet" />\n' +
            '  <link type="text/css" href="css/bootstrap-responsive.css" rel="stylesheet" />\n' +
            '  <link type="text/css" href="css/mybootstrap.css" rel="stylesheet" />\n' +
            '  <link type="text/css" href="css/base.css" rel="stylesheet" />\n' +
            '  <link type="text/css" href="css/default.css" rel="stylesheet"/>\n' +
            '</head>\n' +
            '<body>\n' +
            '<div class="my-print">\n' +
            $('<div/>').append(page).html() + '\n' +
            '</div></body>\n' +
            '</html>';

        doc = window.open('about:blank', '_blank', '');
        doc.document.open();
        doc.document.write(content);
        doc.document.close();
        return doc.focus();
    };
    //#endregion

    //#region 設定學年度學期下拉清單，並運行第一筆，以取得課程分段
    var setSemeDownList = function(_list) {
        var items = [];
        $('#menu1').html('');

        $(_list).each(function() {
            var FullName = (this.SchoolYear || '') + '學年度 '+ (this.Semester || '') + '學期';
            items.push('<li>' +
                '<a href="#" schoolyear="' + (this.SchoolYear || '') + '" semester="' + (this.Semester || '') + '">' +
                FullName +
                '</a></li>'
            );
        });

        if (items.length > 0) {
            $('#menu1').html(items.join('')).find('li:first').click();
        } else {
            $('#tabName').html('無資料');
            $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>目前無資料</td></tr>');
        }

        if (!myself.semester_list) {
            myself.semester_list = $('#menu1').html();
        }
    };
    //#endregion

    //#region 設定符合姓名、場地、班級的下拉名單，並運行第一筆，以取得學年度學期
    var setTCCDropDownList = function(_list) {
        var items = [];
        $('#menu1, #menu2').html('');

        $(_list).each(function() {
            items.push('<li><a href="#" kid="' + (this.ID || '') +'" kind="' + (this.Kind || '') + '">' + (this.Name || '') + '</a></li>');
        });

        if (items.length > 0) {
            $('#menu2').html(items.join('')).find('li:first').click();
        } else {
            $('#tabSearch, #tabName').html('無資料');
            if (_list.length) {
                $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>目前無資料</td></tr>');
            } else {
                $('#timeTable').find('thead').html('').end().find('tbody').html('<tr><td>查無此資料</td></tr>');
            }
        }

        if (!myself.tcc_list) {
            myself.tcc_list = $('#menu2').html();
        }
    };
    //#endregion

    return {
        on_init : function() {
            initialize();
            return getAllSearchItem();
        },
        on_search : function(_keyword) {
            return search(_keyword);
        },
        on_runMydata : function() {
            return runMydata();
        },
        on_printScheduler : function() {
            return printScheduler();
        },
        getScheduler : function(_request) {
            return getScheduler(_request);
        },
        getSemester : function(_request) {
            return getSemester(_request);
        },
        getClassBusy : function(_cid) {
            return getClassBusy(_cid);
        },
        setTCCDropDownList : function(_list) {
            return setTCCDropDownList(_list);
        },
        printScheduler : function() {
            return printScheduler();
        }
    };
}();