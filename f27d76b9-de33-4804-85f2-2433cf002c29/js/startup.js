// util.js @ 共用程式
// setscore.js @ 成績輸入、儲存

jQuery(function () {
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
        ScoreManager.StartUp.courseChange($(this).attr('data-index'));
    });
});

var _connection_basic = gadget.getContract("basic.teacher");
var _connection_score = gadget.getContract("couldSchool.multi");
var ScoreManager = ScoreManager || {};

ScoreManager.StartUp = function() {
    var _subExam = ['第1次段考','第2次段考','第3次段考','第1次小考','第2次小考','第3次小考','第4次小考','第5次小考'];
    var _courses = [];
    var _course = {};
    var _pass = 60;

    _connection_basic.send({
        service: "GetMyCourse",
        body: {},
        result: function (response, error, http) {
            if (error !== null) {
                ScoreManager.Util.msg('#mainMsg', 'GetMyCourse', error);
            } else {
                var ret = [];
                if (response.Course) {
                    _courses = ScoreManager.Util.handle_array(response.Course);
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
                _course.StudentOrder = aStudent_order;
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
                        ScoreManager.Util.msg('#mainMsg', 'beta.GetCourseScore', error);
                    } else {
                        if (response.Student) {
                            col_exams = ScoreManager.Util.handle_array(response.Student);
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
                        ScoreManager.Util.msg('#mainMsg', 'GetMyCourseStudent', error);
                    } else {
                        if (response.Course && response.Course.Student) {
                            response.Course.Student = ScoreManager.Util.handle_array(response.Course.Student);
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

    return {
        getCurrCourse: function() {
            return _course;
        },
        getPassScore: function() {
            return _pass;
        },
        courseChange: function(id) {
            $('#examTable tbody').removeClass('my-student-list').html('<tr><td colspan="11">載入中...</td></tr>');
            $('#seatNo').val('');
            $('#studentName').html('');
            $('#studentNumber').html('');
            $('#inputScore').val('').attr('data-sid', '');
            _course = _courses[id];
            getCourseData();
        }
    }

}();