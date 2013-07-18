jQuery(function () {
    Attendance.init();
});

Attendance = function() {
    _connection = gadget.getContract('ischool.retake.student');
    _attendances = [];

    var main = function() {
        _connection.send({
            service: "_.GetAttendance",
            body: {},
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetAttendance', error);
                } else {
                    if (response.Attendance && response.Attendance.Seme) {
                        _attendances = myHandleArray(response.Attendance.Seme);
                        _attendances.sort($.by('desc', 'SchoolYear', $.by('desc', 'Semester', $.by('desc', 'Month'))));
                    } else {
                        $('#Attendance tbody').html('<tr><td colspan="10">目前無資料</td></tr>');
                    }

                    setSemeSelectList();
                }
            }
        });
    }

    // 顯示梯次的下拉選單
    var setSemeSelectList = function() {
        var optionsSeme = [];
        $(_attendances).each(function(index, item){
            var text = item.SchoolYear + '學年度';
            text += (item.Semester === '0') ? '暑期' : '第' + item.Semester + '學期';
            text += '第' + item.Month + '梯次';
            optionsSeme.push('<option value="' + index + '"' +
                ' data-schoolYear="' + item.SchoolYear + '"' +
                ' data-semester="' + item.Semester + '"' +
                ' data-month="' + item.Month + '">' + text + '</option>'
            );
        });
        $('#select1').html(optionsSeme.join(''));
        $('#select1').change(function(){
            Attendance.semeChange();
        });
        $('#select1 option:first').trigger('change');
    };

    // 顯示課程的下拉選單
    var setCourseSelectList = function() {
        var optionsCourse = [];
        var key = $('#select1').val();
        optionsCourse.push('<option value="-1">所有課程</option>');

        if (_attendances[key]) {
            _attendances[key].Course = myHandleArray(_attendances[key].Course);
            $(_attendances[key].Course).each(function(index, course){
                optionsCourse.push('<option value="' + index + '">' + course.CourseName + '</option>');
            });
            $('#select2').html(optionsCourse.join(''));
            $('#select2').change(function(){
                Attendance.courseChange($(this).val());
            });
            $('#select2 option:first').trigger('change');
        }
    };

    // 顯示缺曠
    var setAttendance = function() {
        var key1 = $('#select1').val();
        var key2 = $('#select2').val();
        var items = [];
        var courseName = '';
        var attendance = _attendances[key1];

        var processData = function(data) {
            $(data).each(function(index, adate){
                var periods = {};
                $(adate['Attendance']).each(function(index, item){
                    periods['Periods' + item.Period] = item.Type;
                });

                items.push('<tr>' +
                    '<td>' + courseName + '</td>' +
                    '<td>' + adate.Date + '</td>' +
                    '<td>' + (periods['Periods1'] ? 'X' : '&nbsp;') + '</td>' +
                    '<td>' + (periods['Periods2'] ? 'X' : '&nbsp;') + '</td>' +
                    '<td>' + (periods['Periods3'] ? 'X' : '&nbsp;') + '</td>' +
                    '<td>' + (periods['Periods4'] ? 'X' : '&nbsp;') + '</td>' +
                    '<td>' + (periods['Periods5'] ? 'X' : '&nbsp;') + '</td>' +
                    '<td>' + (periods['Periods6'] ? 'X' : '&nbsp;') + '</td>' +
                    '<td>' + (periods['Periods7'] ? 'X' : '&nbsp;') + '</td>' +
                    '<td>' + (periods['Periods8'] ? 'X' : '&nbsp;') + '</td>' +
                    '</tr>'
                );
            });
        };

        if (attendance) {
            if (key2 === '-1') {
                // 所有課程
                if (!(attendance && attendance.AllDates)) {
                    attendance.AllDates = [];
                    $(attendance.Course).each(function(index, course){
                        $(course.AttendanceDate).each(function(index, adate){
                            if (!attendance.AllDates['D' + adate.Date]) {
                                var tmp = {
                                    Date: new Date(adate.Date || ''),
                                    Courses: []
                                };
                                tmp['Course' + course.CourseId] = adate;
                                tmp['Course' + course.CourseId].CourseName = course.CourseName;
                                tmp.Courses.push(adate);
                                attendance.AllDates['D' + adate.Date] = tmp;
                                attendance.AllDates.push(tmp);
                            } else {
                                if (!attendance.AllDates['D' + adate.Date]['Course' + course.CourseId]) {
                                    attendance.AllDates['D' + adate.Date]['Course' + course.CourseId] = adate;
                                    attendance.AllDates['D' + adate.Date]['Courses'].push(adate);
                                }
                            }
                        });
                    });
                    attendance.AllDates.sort($.by('desc', 'Date'));
                }


                $(attendance.AllDates).each(function(index, adate){
                    $(adate.Courses).each(function(index, course){
                        courseName = course.CourseName;
                        processData(course);
                    });
                });
            } else {
                // 單一課程
                courseName = attendance['Course'][key2]['CourseName'];
                if (attendance['Course'][key2] && attendance['Course'][key2]['AttendanceDate']) {
                    processData(attendance['Course'][key2]['AttendanceDate']);
                }
            }
        }

        if (items.length > 0) {
            $('#Attendance tbody').html(items.join(''));
        } else {
            $('#Attendance tbody').html('<tr><td colspan="10">目前無資料</td></tr>');
        }
    };

    // 轉成陣列
    var myHandleArray = function(obj) {
        var result;

        result = void 0;
        if (!$.isArray(obj)) {
            result = [];
           if (obj) {
              result.push(obj);
            }
        } else {
            result = obj;
        }
        return result;
    };

    // 錯誤訊息
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
        $('body').scrollTop(0);
    };




    return {
        init: function() {
            main();
        },
        semeChange: function() {
            setCourseSelectList();
        },
        courseChange: function() {
            setAttendance();
        }
    }
}();

// 排序
//ex: s.sort($.by('desc', 'last', $.by('asc', 'first')));
(function($) {
    return $.by = function(model, name, minor) {
        return function(o, p) {
            var a, b;
            if (o && p && typeof o === "object" && typeof p === "object") {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return (typeof minor === "function" ? minor(o, p) : 0);
                }
                if (typeof a === typeof b) {
                    if (parseInt(a, 10) && parseInt(b, 10)) {
                        a = parseInt(a, 10);
                        b = parseInt(b, 10);
                    }
                    if (model === "desc") {
                        return (a > b ? -1 : 1);
                    } else {
                        return (a < b ? -1 : 1);
                    }
                }
                if (typeof a < typeof b) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                throw {
                    name: "Error",
                    message: "Expected an object when sorting by " + name
                };
            }
        };
    };
})(jQuery);
