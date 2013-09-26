jQuery(function () {

    // 切換試別
    $("#selectExam li a").click(function(){
        $('#selectExam span[data-type=menu-name]').html($(this).text());
        var sid = $('#inputScore').attr('data-sid');
        if (sid) {
            ScoreManager.SetScore.clickStudent(sid);
        }
    });


    // 座號移出焦點後，重設學生
    $("#seatNo").on("focusout", function() {
        if ($(this).val()) { ScoreManager.SetScore.changeStudent(); }
    });

    // 登錄資料按下Enter、向下鍵切換輸入框
    $("#seatNo").on("keyup", function(e) {
        if (e.which === 13 || e.which === 40) {
            $("#inputScore").select().focus();
        }
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
                ScoreManager.SetScore.saveScore();
            } else {
                $(this).select().focus();
                ScoreManager.Util.msg('#mainMsg', '', '成績格式應為「數字」');
            }
        }
    });

    // 點選學生，進行編輯
    $("#examTable").on("click", "tr", function(){
        var sid = $(this).attr('data-sid');
        if (sid) {
            ScoreManager.SetScore.clickStudent(sid);
        }
    });

    // 下一位學生
    var nextStudent = function(sid) {
        var _course = ScoreManager.StartUp.getCurrCourse();
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

        // 儲存後，自動跳號後的focus元素
        var _model = getInputModel();
        if (_model === 'SeatNo') {
            $('#seatNo').select().focus();
        }
    };
});

ScoreManager.SetScore = function() {
    // 編輯模式
    var getInputModel = function() {
        return 'SeatNo';
    };

    // 儲存成績
    var saveExamScore = function() {
        var _course = ScoreManager.StartUp.getCurrCourse();
        var _pass = ScoreManager.StartUp.getPassScore();
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
                that_exam = ScoreManager.Util.handle_array(that_exam);
                $(that_exam).each(function(index, subExam) {
                    if (subExam.Name === 'GradeBook') {
                        bSubExam = true;
                        var subExamName = $('#selectExam span[data-type=menu-name]').text();
                        if (subExam.Exam && subExam.Exam.Item) {
                            subExam.Exam.Item = ScoreManager.Util.handle_array(subExam.Exam.Item);
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
        var _course = ScoreManager.StartUp.getCurrCourse();
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

    // 使用座號指定學生
    var useSeatNo = function() {
        var _course = ScoreManager.StartUp.getCurrCourse();
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

    return {
        clickStudent: function(sid) {
            setFormStudent(sid);
        },
        changeStudent: function() {
            var _model = getInputModel();
            var sid;
            if (_model === 'SeatNo') {
                sid = useSeatNo.getSid();
            }
            setFormStudent(sid);
        },
        saveScore: function() {
            saveExamScore();
        }
    }

}();