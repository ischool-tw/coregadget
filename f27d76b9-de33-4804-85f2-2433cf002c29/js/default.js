jQuery(function () {
    ScoreManager.init();

    // 固定輸入區塊，隨捲軸移動
    function fixDiv() {
        var $cache = $('#inputArea');
        if ($(window).scrollTop() > 130)
            $cache.css({'position': 'fixed', 'top': '0px'});
        else
            $cache.css({'position': 'relative', 'top': 'auto'});
    }
    $(window).scroll(fixDiv);
    fixDiv();

    // 切換課程
    $("#selectCourse").on('click', 'li a', function(){
        $('#selectCourse span[data-type=menu-name]').html($(this).text()).attr('data-cid', $(this).attr('data-cid'));
        ScoreManager.courseChange($(this).attr('data-index'));
    });

    // 切換試別
    $("#selectExam li a").click(function(){
        $('#selectExam span[data-type=menu-name]').html($(this).text());
        var sid = $('#inputScore').attr('data-sid');
        if (sid) {
            ScoreManager.clickStudent(sid);
        }
    });

    // 登錄資料按下Enter、向下鍵切換輸入框
    $("#seatNo").on("keyup", function(e) {
        if (e.which === 13 || e.which === 40) {
            $("#inputScore").select().focus();
        }
    });

    // 座號移出焦點後，重設學生
    $("#seatNo").on("focusout", function() {
        if ($(this).val()) { ScoreManager.changeStudent(); }
    });


    // 成績輸入框按下Enter儲存成績
    $("#inputScore").on("keyup", function(e) {
        if (e.which === 13 || e.which === 40) {
            // 驗證成績是否為空值 或 數值
            var score = $(this).val();
            var valid = false;
            if (score) {
                if (parseInt(score, 10)) {
                    valid = true;
                }
            } else {
                valid = true;
            }
            if (valid) {
                $(this).prop('disabled', true);
                ScoreManager.saveScore();
            } else {
                $(this).select().focus();
                ScoreManager.msg('#mainMsg', '', '成績格式應為「數字」');
            }
        }
    });

    // 點選學生，進行編輯
    $("#examTable").on("click", "tr", function(){
        var sid = $(this).attr('data-sid');
        if (sid) {
            ScoreManager.clickStudent(sid);
        }
    });
});

ScoreManager = function() {
    var tt = new Date();
    var _connection_basic = gadget.getContract("basic.teacher");
    _connection_basic.ready(function() {
        console.log(new Date() - tt);
    });
    var _connection_score = gadget.getContract("couldSchool.multi")
    var _courses = [];
    var _course = {};
    var _subExam = ['第1次段考','第2次段考','第3次段考','第1次小考','第2次小考','第3次小考','第4次小考','第5次小考'];
    var _model = 'SeatNo'; // 編輯模式
    var _pass = 60;
    var _autofocus = 'SeatNo'; // 自動跳號後的focus

    var main = function() {
        var t0 = new Date();
        _connection_basic.send({
            service: "GetMyCourse",
            body: {},
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetMyCourse', error);
                } else {
                    console.log(new Date() - t0);
                    var ret = [];
                    if (response.Course) {
                        _courses = myHandleArray(response.Course);
                        $(response.Course).each(function(index, item) {
                            ret.push('<li><a href="javascript:void(0);" data-index="' + index + '" data-cid="' + item.CourseId + '">' +
                                (item.SchoolYear || '') +
                                (item.Semester || '') + ' ' +
                                (item.CourseName || '') +
                                '</a></li>');
                        });
                        $("#selectCourse ul.dropdown-menu").html(ret.join(''));
                        $("#selectCourse li a:first").trigger('click');
                    } else {
                        $("#selectCourse").html('目前無資料');
                    }
                }
            }
        });
    };

    // 取得成績、課程學生
    var getCourseData = function() {
        var bStudent = false;
        var bScore = false;
        var col_exams = [];
        var col_students = [];
        var aStudent_order = [];
        var finish = function() {
            if (bStudent && bScore) {
                var t1 = new Date();
                $(col_students).each(function(index, item){
                    if (col_exams['s' + item.StudentId]) {
                        $.extend(item, col_exams['s' + item.StudentId]);
                    }
                });
                _course.Students = col_students;
                _course.student_order = aStudent_order;
                console.log(new Date() - t1);
                showScoreManager();
            }
        };

        var getData = function() {
            var t2 = new Date();
            // 取得成績
            _connection_score.send({
                service: "beta.GetCourseScore",
                body: {
                    CourseId: _course.CourseId
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'beta.GetCourseScore', error);
                    } else {
                        if (response.Student) {
                            col_exams = myHandleArray(response.Student);
                            $(col_exams).each(function(index, student) {
                                col_exams['s' + student.StudentId] = student;

                                $(student.Exam).each(function(index, item) {
                                    col_exams['s' + student.StudentId]['exam' + item.ExamId] = item;
                                });
                            });
                        }
                        bScore = true;
                        console.log(new Date() - t2);
                        finish();
                    }
                }
            });


            // 取得課程學生
            var t3 = new Date();
            _connection_basic.send({
                service: "GetMyCourseStudent",
                body: {
                    CourseId: _course.CourseId
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetMyCourseStudent', error);
                    } else {
                        if (response.Course && response.Course.Student) {
                            response.Course.Student = myHandleArray(response.Course.Student);
                            aStudent_order = response.Course.Student.sort($.by('asc', 'SeatNo'));
                            $(response.Course.Student).each(function(index, item) {
                                col_students['s' + item.StudentId] = item;
                                col_students.push(item);
                            });
                        }
                        bStudent = true;
                        console.log(new Date() - t3);
                        finish();
                    }
                }
            });
        };

        if (_course.Students) {
            showScoreManager();
        } else {
            getData();
        }
    };

    // 顯示課程成績
    var showScoreManager = function() {
        console.log(_course);
        var items = [];
        if (_course.CourseId === $('#selectCourse span[data-type=menu-name]').attr('data-cid')) {
            $(_course.Students).each(function(index, student){
                items.push('<tr data-sid="' + student.StudentId + '">' +
                      '<td>' + (student.StudentNumber || '') + '</td>' +
                      '<td>' + (student.SeatNo || '') + '</td>' +
                      '<td>' + (student.StudentName || '') + '</td>'
                );

                var that_exam = null;
                var score_data = [];
                if (student.ExtScore
                    && student.ExtScore.Extensions
                    && student.ExtScore.Extensions.Extension) {

                    that_exam = student.ExtScore.Extensions.Extension;
                    $(that_exam).each(function(index, subExam){
                        if (subExam.Name === 'GradeBook') {
                            $(_subExam).each(function(index, examName){
                                var bSubExam = false;
                                if (subExam.Exam && subExam.Exam.Item) {
                                    $(subExam.Exam.Item).each(function(index, item) {
                                        if (item.SubExamID === examName) {
                                            var iScore = (item.Score) ? parseInt(item.Score, 10) : 0;
                                            var thatCSS = (iScore < _pass) ? ' my-no-pass' : '';
                                            bSubExam = true;
                                            score_data.push('<td class="' + thatCSS + '" data-exam="' + examName + '">' + (item.Score || '')  + '</td>');
                                        }
                                    });
                                }
                                if (!bSubExam) {
                                    score_data.push('<td data-exam="' + examName + '"></td>');
                                }
                            });
                        }
                    });
                }

                if (score_data.length) {
                    items.push(score_data.join(''));
                } else {
                    $(_subExam).each(function(index, examName){
                        items.push('<td data-exam="' + examName + '"></td>');
                    });
                }

                items.push('</tr>');
            });

            if (items.length > 0) {
                $('#examTable tbody').addClass('my-student-list').html(items.join(''));
            } else {
                $('#examTable tbody').html('<tr><td colspan="11">目前無資料</td></tr>');
            }
        }
    };

    // 儲存成績
    var saveExamScore = function() {
        var elem = $('#inputScore');
        var sid = elem.attr('data-sid');
        var score = elem.val();
        var subExamName = $('#selectExam span[data-type=menu-name]').text();
        var student = _course.Students['s' + sid];

        if (student) {
            var sample = {
                'Extensions':{
                    'Extension':{
                        '@':['Name'],
                        'Name':'GradeBook',
                        'Exam':{
                            '@':['ExamID','Score'],
                            'ExamID':'',
                            'Score':'',
                            'Item':[
                                {
                                    '@':['Score','SubExamID'],
                                    'Score': score,
                                    'SubExamID': subExamName
                                }
                            ]
                        }
                    }
                }
            };

            var tmp_score = $.extend({}, student.ExtScore);

            if (tmp_score.Extensions && tmp_score.Extensions.Extension) {
                var that_exam = tmp_score.Extensions.Extension;
                var bSubExam = false;
                var bItem = false;
                that_exam = myHandleArray(that_exam);
                $(that_exam).each(function(index, subExam) {
                    if (subExam.Name === 'GradeBook') {
                        bSubExam = true;
                        var subExamName = $('#selectExam span[data-type=menu-name]').text();
                        if (subExam.Exam && subExam.Exam.Item) {
                            subExam.Exam.Item = myHandleArray(subExam.Exam.Item);
                            $(subExam.Exam.Item).each(function(index, item) {
                                if (item.SubExamID === subExamName) {
                                    bItem = true;
                                    item.Score = score || '';
                                }
                            });
                            if (!bItem) {
                                that_exam[index].Exam.Item.push(sample.Extensions.Extension.Exam.Item[0]);
                            }
                        } else {
                            that_exam[0].Exam = sample.Extensions.Extension.Exam;
                        }
                    }
                });
                if (!bSubExam) {
                    that_exam.push(sample.Extensions.Extension);
                }
            } else {
                tmp_score = sample;
            }


            _connection_score.send({
                service: "beta.UpdateSubExamScore",
                body: {
                    Course: {
                        CourseId: _course.CourseId,
                        Student: {
                            StudentId: sid,
                            Extension: tmp_score
                        }
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        $('#inputScore').prop('disabled', false);
                        set_error_message('#mainMsg', 'UpdateSubExamScore', error);
                    } else {
                        student.ExtScore = tmp_score;

                        // 更新前端表格內容顯示
                        var iScore = (score) ? parseInt(score, 10) : 0;
                        var thatCSS = (score < _pass) ? ' my-no-pass' : '';
                        $('#examTable tr[data-sid=' + sid + '] td[data-exam=' + subExamName + ']').removeClass('my-no-pass').addClass(thatCSS).html(score);
                        $('#inputScore').prop('disabled', false);
                        nextStudent(sid);
                    }
                }
            });
        } else {
            $('#inputScore').prop('disabled', false);
        }
    };

    // 顯示指定的學生於表單中
    var setFormStudent = function(sid) {
        if (_course.Students['s' + sid]) {
            var student = _course.Students['s' + sid];
            var score = '';
            if (student.ExtScore
                && student.ExtScore.Extensions
                && student.ExtScore.Extensions.Extension) {

                var that_exam = student.ExtScore.Extensions.Extension;
                $(that_exam).each(function(index, subExam){
                    if (subExam.Name === 'GradeBook') {
                        var subExamName = $('#selectExam span[data-type=menu-name]').text();
                        if (subExam.Exam && subExam.Exam.Item) {
                            $(subExam.Exam.Item).each(function(index, item) {
                                if (item.SubExamID === subExamName) {
                                    score = item.Score;
                                }
                            });
                        }
                    }
                });
            }

            $('#studentName').html(student.StudentName);
            $('#studentNumber').html(student.StudentNumber);
            $('#seatNo').val(student.SeatNo);
            $('#inputScore').val(score).attr('data-sid', student.StudentId).select().focus();
            $('#examTable')
                .find('tr.my-focus-student').removeClass('my-focus-student')
                .end().find('tr[data-sid=' + sid + ']').addClass('my-focus-student');

            // 跳至該學生
            var offset_top = $("tr[data-sid=" + sid + "]").offset().top - 205;
            $(document).scrollTop(offset_top);

            return false;
        } else {
            set_error_message('#mainMsg', '', '座號不正確');
        }
    };

    // 下一位學生
    var nextStudent = function(sid) {
        var next_idx = 0;
        $(_course.student_order).each(function(index, student) {
            if (student.StudentId === sid) {
                if (_course.student_order[index + 1]) {
                    next_idx = index + 1;
                }
                return false;
            }
        });
        $('#seatNo').val(_course.student_order[next_idx].SeatNo);
        setFormStudent(_course.student_order[next_idx].StudentId);
        if (_autofocus === 'SeatNo') {
            $('#seatNo').select().focus();
        }
    };

    // 使用座號指定學生
    var useSeatNo = function() {
        var preSid = '';
        return {
            getSid: function() {
                var seatNo = $('#seatNo').val();
                var items = [];
                // 記錄所有相同座號的sid
                $(_course.student_order).each(function(index, item){
                    if (item.SeatNo === seatNo) {
                        items.push(item.StudentId);
                    }
                });


                // 如果有相同座號，上次key的座號與這次相同，則顯示下一位相同座號的學生
                // 若已到達最後一筆，顯示第一位學生
                var preIdx = -1;
                $(items).each(function(index, sid){
                    if (sid === preSid) {
                        preIdx = index;
                        return false;
                    }
                });

                // 重設preSid
                preSid = (items[preIdx + 1]) ? items[preIdx + 1] : items[0];
                return preSid;
            }
        };
    }();

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
        courseChange: function(id) {
            $('#examTable tbody').removeClass('my-student-list').html('<tr><td colspan="11">載入中...</td></tr>');
            $('#seatNo').val('');
            $('#studentName').html('');
            $('#studentNumber').html('');
            $('#inputScore').val('').attr('data-sid', '');
            _course = _courses[id];
            getCourseData();
        },
        clickStudent: function(sid) {
            setFormStudent(sid);
        },
        changeStudent: function() {
            var sid;
            if (_model === 'SeatNo') {
                sid = useSeatNo.getSid();
            }
            setFormStudent(sid);
        },
        saveScore: function() {
            saveExamScore();
        },
        msg: function(select_str, serviceName, error) {
            set_error_message(select_str, serviceName, error);
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
