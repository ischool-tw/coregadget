jQuery(function () {
    Attendance.init();

    $('#student-list').on('click', 'li a', function(e){
        Attendance.studentChange($(this).attr('data-studentId') || '');
    });
});

Attendance = function() {
    var _connection = gadget.getContract('ischool.retake.teacher');
    var _students = [];
    var _showSId = '';

    var main = function() {
        // 取得年級、班級、學生
        _connection.send({
            service: "_.GetRetakeClassStudent",
            body: {},
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetClassStudent', error);
                } else {
                    var classCollapse = [];
                    if (response.Classes && response.Classes.Class) {
                        $(response.Classes.Class).each(function(index, xclass){
                            // 班級
                            classCollapse.push('<div class="accordion-heading">' +
                                '<a class="accordion-toggle" data-parent="#student-list" data-toggle="collapse" href="#collapse' + (xclass.ClassId || '') + '">' +
                                '<i class="icon-user"></i>' + (xclass.ClassName || '') + '</a>' +
                                '</div>');

                            classCollapse.push('<div class="accordion-body collapse ' + (index === 0 ? 'in' : '') + '" id="collapse' + xclass.ClassId + '">' +
                                '<div class="accordion-inner">' +
                                    '<ul class="nav nav-pills nav-stacked">');

                            // 學生
                            xclass.Student = myHandleArray(xclass.Student);
                            if (xclass.Student.length > 0) {
                                $(xclass.Student).each(function(index, student){
                                    // 記錄全部學生
                                    _students['s' + student.StudentId] = student;
                                    _students.push(student);

                                    var seatNo = student.SeatNo;
                                    if (student.SeatNo.length === 0) {
                                        seatNo = '&nbsp;&nbsp;&nbsp;&nbsp;' + seatNo;
                                    } else if (student.SeatNo.length === 1) {
                                        seatNo = '&nbsp;&nbsp;' + seatNo;
                                    }

                                    classCollapse.push('' +
                                        '<li class="" data-studentId="' + student.StudentId + '">' +
                                        '  <a data-toggle="tab" href="#" data-studentId="' + student.StudentId + '">' +
                                        '    <span class="my-seat-no label label-inverse my-label">' + seatNo + '</span>' +
                                        '    <span class="my-student-name">' + student.StudentName + '</span>' +
                                        '    <span class="my-student-number">' + student.StudentNumber + '</span>' +
                                        '    <i class="icon-chevron-right pull-right"></i>' +
                                        '  </a>' +
                                        '</li>');
                                });
                            } else {
                                classCollapse.push('<li>目前無學生</li>');
                            }

                            classCollapse.push('' +
                                    '</ul>' +
                                  '</div>' +
                                '</div>');
                        });
                        $('#student-list').html(classCollapse.join(''));
                        $('#student-list li:first a').trigger('click');
                    } else {
                        $('#student-list').html('目前無資料');
                        $('#NotExam tbody').html('<tr><td colspan="3">目前無資料</td></tr>');
                        $('#Attendance tbody').html('<tr><td colspan="10">目前無資料</td></tr>');
                    }
                }
            }
        });


        // 目前開放梯次名稱
        _connection.send({
            service: "_.GetTimeList",
            body: {},
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetTimeList', error);
                } else {
                    var course = [];
                    if (response.TimeList && response.TimeList.Name) {
                        $('#retakeName').html(' - ' + response.TimeList.Name);
                    }
                }
            }
        });
    };

    // 取得學生重補修資料
    var getStudentRetake = function(student) {
        var bNotExam = false;
        var bAttendance = false;

        // 資料處理
        var dataFinish = function() {
            if (bNotExam && bAttendance) {
                // 統計缺課次數
                $(student.attendances).each(function(index, day) {
                    $(day.Course).each(function(index, course) {
                        if (course.Period) {
                            var count = course.Period.split(',').length;
                            student.notExam['c' + course.CourseId].SumPeriod += count;
                        }
                    });
                });

                if (_showSId === student.StudentId) {
                    showNotExam(student);
                    showAttendance(student);
                }
            }
        };

        // 取得學生的扣考狀態
        var getNotExam = function() {
            // 取得年級、班級、學生
            _connection.send({
                service: "_.GetNotExam",
                body: {
                    Request: {
                        StudentId: student.StudentId
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetNotExam', error);
                    } else {
                        var course = [];
                        if (response.Response && response.Response.Course) {
                            course = myHandleArray(response.Response.Course);
                            $(course).each(function(index, item) {
                                if (!course['c' + item.CourseId]) {
                                    item.SumPeriod = 0;
                                    course['c' + item.CourseId] = item;
                                }
                            });
                        }
                        student.notExam = course;
                        bNotExam = true;
                        dataFinish();
                    }
                }
            });
        };

        // 取得學生的缺課資料
        var getAttendance = function() {
            // 取得年級、班級、學生
            _connection.send({
                service: "_.GetAttendance",
                body: {
                    Request: {
                        StudentId: student.StudentId
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetAttendance', error);
                    } else {
                        attendances = [];
                        if (response.Attendances && response.Attendances.Attendance) {
                            attendances = myHandleArray(response.Attendances.Attendance);
                        }
                        student.attendances = attendances;
                        bAttendance = true;
                        dataFinish();
                    }
                }
            });
        };

        if (student.attendances && student.notExam) {
            bNotExam = true;
            bAttendance = true;
            dataFinish();
        } else {
            getNotExam();
            getAttendance();
        }
    };

    // 重設資料
    var resetData = function() {
        $('#NotExam tbody').html('<tr><td colspan="3">載入中...</td></tr>');
        $('#Attendance tbody').html('<tr><td colspan="10">載入中...</td></tr>');
    };

    // 顯示扣考
    var showNotExam = function(student) {
        var items = [];
        $(student.notExam).each(function(index, course){
            items.push('' +
                '<tr>' +
                  '<td>' + (course.CourseName || '') + '</td>' +
                  '<td>' + (course.SumPeriod || 0) + '</td>' +
                  '<td>' + (course.NotExam === 't' ? 'V' : '&nbsp;') + '</td>' +
                '</tr>'
            );
        });

        if (items.length > 0) {
            $('#NotExam tbody').html(items.join(''));
        } else {
            $('#NotExam tbody').html('<tr><td colspan="3">目前無資料</td></tr>');
        }
    };

    // 顯示缺曠
    var showAttendance = function(student) {
        var items = [];

        $(student.attendances).each(function(index, day){
            $(day.Course).each(function(index, course){
                var periods = {};
                if (course.Period) {
                    $(course.Period.split(',')).each(function(index, item){
                        periods['Periods' + item] = course.Type;
                    });
                }

                items.push('<tr>' +
                    '<td>' + course.CourseName + '</td>' +
                    '<td>' + day.Date + '</td>' +
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
        });

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
        studentChange: function(id) {
            _showSId = id;
            if (id) {
                getStudentRetake(_students['s' + id]);
            } else {
                $('#NotExam tbody').html('<tr><td colspan="3">目前無資料</td></tr>');
                $('#Attendance tbody').html('<tr><td colspan="10">目前無資料</td></tr>');
            }
        }
    }
}();