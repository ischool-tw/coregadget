var _connection_basic = gadget.getContract("basic.teacher");
var _connection_score = gadget.getContract("couldSchool.multi");

var ScoreManager = function() {
    var _courses = [];
    var _course = {};
    var _pass = 60;
    var _fnBeforeCurrentCourseChanged = [];
    var _fnAfterCurrentCourseChanged = [];
    var _fnUserSelectChangeded = [];
    var _fnBeforeSaveScore = [];
    var _fnAfterSaveScore = [];

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
    var getCourseData = function(callback) {
        var bStudent = false;
        var bScore = false;
        var col_exams = [];
        var col_students = [];
        var aStudent_order = [];
        var finish = function() {
            if (bStudent && bScore) {
                var t1 = new Date();
                // $(col_students).each(function(index, item){
                //     if (col_exams['s' + item.StudentId]) {
                //         $.extend(item, col_exams['s' + item.StudentId]);
                //     }
                // });
                // _course.Students = col_students;
                // _course.StudentOrder = aStudent_order;
                _course.Students = col_students;
                _course.StudentScore = col_exams;
                _course.ExamList = ['第1次段考','第2次段考','第3次段考','第1次小考','第2次小考','第3次小考','第4次小考','第5次小考'];
                console.log(new Date() - t1);
                if (callback && $.isFunction(callback)) {
                    callback();
                }
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
            if (callback && $.isFunction(callback)) {
                callback();
            }
        } else {
            getData();
        }
    };

    // 取得我的所有課程
    // 取得課程學生及課程成績，並整理至課程中

    return {
        setCurrentCourse: function(id) {
            return _course = _courses[id];
        },

        // 指定hightlight目標學生、考試別
        hightLight: function(sid, exam) {
            $('[js=examDateTable]').find('.my-focus-student').removeClass('my-focus-student')
                .end().find('tr[data-sid=' + sid + '] td[data-exam=' + exam + ']').addClass('my-focus-student');
        },

        // 取得目前課程所有學生包含順序
        getCurrentCourse: function() {
            return _course;
        },

        // 取得目前輸入模式
        currentInputPanel: function() {
            return 'JumpSeatNo';
        },

        // 監聽選取課程變更事件
        currentCourseChangedAction: function() {
            $(_fnBeforeCurrentCourseChanged).each(function (index, fn) {
                fn();
            });
            getCourseData(function(){
                $(_fnAfterCurrentCourseChanged).each(function (index, fn) {
                    fn();
                });
            });
        },
        currentCourseChangedConfig: function(callback) {
            if (callback) {
                if (callback.beforeHandler && $.isFunction(callback.beforeHandler))
                    _fnBeforeCurrentCourseChanged.push(callback.beforeHandler);
                if (callback.actionHandler && $.isFunction(callback.actionHandler))
                    _fnAfterCurrentCourseChanged.push(callback.actionHandler);
            }
        },

        // 監聽使用者點選事件（點選學生、考試別）
        userSelectChangededAction: function(stu, exam) {
            $(_fnUserSelectChangeded).each(function (index, fn) {
                fn(stu, exam); // stu, exam
            });
        },
        userSelectChangededConfig: function(callback) {
            if (callback && $.isFunction(callback)) {
                _fnUserSelectChangeded.push(callback);
            }
        },

        // 設定指定學生指定考試成績
        saveScoreAction: function(stu, examName, score) {
            var course = ScoreManager.getCurrentCourse();
            var pass = ScoreManager.getPassScore();
            var sid = stu.StudentId;
            var that_exam = (course.StudentScore && course.StudentScore['s'+stu.StudentId]) ? course.StudentScore['s'+stu.StudentId] : '';
            var finish = function() {
                $(_fnAfterSaveScore).each(function (index, fn) {
                    fn(stu, examName, score);
                });
            };

            $(_fnBeforeSaveScore).each(function (index, fn) {
                fn();
            });

            // 驗證成績是否為空值 或 數值
            var valid = false;
            if (score) {
                if (parseInt(score, 10)) {
                    if (score >= 0 && score <=100) {
                        valid = true;
                    }
                }
            } else {
                valid = true;
            }
            if (!valid) {
                ScoreManager.Util.msg('#scoreMsg', '', '成績格式應為「0~100的數值」');
                return false;
            }


            if (that_exam && examName) {
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
                                        'SubExamID': examName
                                    }
                                ]
                            }
                        }
                    }
                };

                var tmp_score = $.extend({}, that_exam.ExtScore);

                if (tmp_score.Extensions && tmp_score.Extensions.Extension) {
                    var that_exam = tmp_score.Extensions.Extension;
                    var bSubExam = false;
                    var bItem = false;
                    that_exam = ScoreManager.Util.handle_array(that_exam);
                    $(that_exam).each(function(index, subExam) {
                        if (subExam.Name === 'GradeBook') {
                            bSubExam = true;
                            if (subExam.Exam && subExam.Exam.Item) {
                                subExam.Exam.Item = ScoreManager.Util.handle_array(subExam.Exam.Item);
                                $(subExam.Exam.Item).each(function(index, item) {
                                    if (item.SubExamID === examName) {
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
                            CourseId: course.CourseId,
                            Student: {
                                StudentId: sid,
                                Extension: tmp_score
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            $("[js=scoreInput]").prop('disabled', false);
                            ScoreManager.Util.msg('#scoreMsg', 'UpdateSubExamScore', error);
                        } else {
                            that_exam.ExtScore = tmp_score;
                            finish();
                        }
                    }
                });
            } else {
                finish();
            }
        },

        saveScoreConfig: function(callback) {
            if (callback) {
                if (callback.beforeHandler && $.isFunction(callback.beforeHandler))
                    _fnBeforeSaveScore.push(callback.beforeHandler);
                if (callback.afterHandler && $.isFunction(callback.afterHandler))
                    _fnAfterSaveScore.push(callback.afterHandler);
            }
        },

        getPassScore: function() {
            return _pass;
        }
    }
}();

$(function () {
    // 固定輸入區塊，隨捲軸移動
    function fixDiv() {
        var $cache = $('[js=jumpSeatNo]');
        if ($(window).scrollTop() > 130)
            $cache.css({'position': 'fixed', 'top': '0px'});
        else
            $cache.css({'position': 'relative', 'top': 'auto'});
    }
    $(window).scroll(fixDiv);
    fixDiv();

    $("[js=selectCourse]").each(function(index,target){
        target=$(target);
        target.on('click', 'li a', function(){
            target.find('span[js=menu-name]').html($(this).text()).attr('data-cid', $(this).attr('data-cid'));
            ScoreManager.setCurrentCourse($(this).attr('data-index'));
            ScoreManager.currentCourseChangedAction();
        });
    });

    $("[js=examDateTable]").each(function(index,target){
        target=$(target);
        var clear = function() {
            target.find('tbody').removeClass('my-student-list').html('<tr><td colspan="11">載入中...</td></tr>');
        };

        // 顯示課程成績
        var showScoreManager = function(course) {
            var items = [];
            var pass = ScoreManager.getPassScore();
            $(course.Students).each(function(index, student){
                items.push('<tr data-sid="' + student.StudentId + '">' +
                      '<td>' + (student.StudentNumber || '') + '</td>' +
                      '<td>' + (student.SeatNo || '') + '</td>' +
                      '<td>' + (student.StudentName || '') + '</td>'
                );

                var that_exam = null;
                var score_data = [];
                if (course.StudentScore
                    && course.StudentScore['s'+student.StudentId]
                    && course.StudentScore['s'+student.StudentId].ExtScore
                    && course.StudentScore['s'+student.StudentId].ExtScore.Extensions
                    && course.StudentScore['s'+student.StudentId].ExtScore.Extensions.Extension) {

                    that_exam = course.StudentScore['s'+student.StudentId].ExtScore.Extensions.Extension;
                    $(that_exam).each(function(index, subExam){
                        if (subExam.Name === 'GradeBook') {
                            $(course.ExamList).each(function(index, examName){
                                var bSubExam = false;
                                if (subExam.Exam && subExam.Exam.Item) {
                                    $(subExam.Exam.Item).each(function(index, item) {
                                        if (item.SubExamID === examName) {
                                            var iScore = (item.Score) ? parseInt(item.Score, 10) : 0;
                                            var thatCSS = (iScore < pass) ? ' my-no-pass' : '';
                                            bSubExam = true;
                                            score_data.push('<td class="' + thatCSS + '" data-exam="' + examName + '">' + (item.Score || '')  + '</td>');
                                            return false;
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
                    $(course.ExamList).each(function(index, examName){
                        items.push('<td data-exam="' + examName + '"></td>');
                    });
                }

                items.push('</tr>');
            });

            if (items.length > 0) {
                target.find('tbody').addClass('my-student-list').html(items.join(''));
            } else {
                target.find('tbody').html('<tr><td colspan="11">目前無資料</td></tr>');
            }
        };

        target.on('click', 'td[data-exam]', function() {
            var currentCourse=ScoreManager.getCurrentCourse();
            if (currentCourse) {
                var exam = $(this).attr('data-exam');
                var sid = $(this).closest('tr').attr('data-sid');
                var stu = currentCourse.Students['s'+sid];
                ScoreManager.userSelectChangededAction(stu, exam);
            }
        });

        ScoreManager.currentCourseChangedConfig({
            beforeHandler: function() {
                clear();
            },
            actionHandler: function(){
                var currentCourse=ScoreManager.getCurrentCourse();

                if(currentCourse){
                    showScoreManager(currentCourse);
                }
            }
        });

        ScoreManager.saveScoreConfig({
            afterHandler: function(stu,examName,score) {
                // 更新前端表格內容顯示
                var pass = ScoreManager.getPassScore();
                var sid = stu.StudentId;
                var iScore = (score) ? parseInt(score, 10) : 0;
                var thatCSS = (score < pass) ? ' my-no-pass' : '';
                $('[js=examDateTable] tr[data-sid=' + sid + '] td[data-exam=' + examName + ']').removeClass('my-no-pass').addClass(thatCSS).html(score);
            }
        });
    });

    $("[js=jumpSeatNo]").each(function(index,target){
        target=$(target);
        var currentStudent,currentExam;
        function clear(){
            currentStudent=null;
            currentExam=null;
            target.find("[js=seatNo]").val("");
            target.find("[js=studentName]").html("");
            target.find("[js=studentNumber]").html("");
            target.find("[js=examSelect]").html("");
            target.find("[js=scoreInput]").val("").attr('data-sid', '');
            ScoreManager.hightLight(null,null);
        }

        function setCurrentExam(exam){
            currentExam=exam;
            target.find("[js=examSelect]").html(currentExam);
            var score = '';
            if(currentStudent){
                var currentCourse=ScoreManager.getCurrentCourse();
                if (currentCourse && currentCourse.StudentScore
                    && currentCourse.StudentScore['s'+currentStudent.StudentId]
                    && currentCourse.StudentScore['s'+currentStudent.StudentId].ExtScore
                    && currentCourse.StudentScore['s'+currentStudent.StudentId].ExtScore.Extensions
                    && currentCourse.StudentScore['s'+currentStudent.StudentId].ExtScore.Extensions.Extension) {

                    var that_exam = currentCourse.StudentScore['s'+currentStudent.StudentId].ExtScore.Extensions.Extension;
                    $(that_exam).each(function(index, subExam){
                        if (subExam.Name === 'GradeBook') {
                            if (subExam.Exam && subExam.Exam.Item) {
                                $(subExam.Exam.Item).each(function(index, item) {
                                    if (item.SubExamID === currentExam) {
                                        score = item.Score;
                                        return false;
                                    }
                                });
                            }
                        }
                    });
                }
                target.find("[js=scoreInput]").val(score);
                if(ScoreManager.currentInputPanel()=="JumpSeatNo")
                    target.find("[js=scoreInput]").select();
                ScoreManager.hightLight(currentStudent.StudentId,currentExam);
            }
        }


        function setCurrentStudent(stu){
            currentStudent=stu;
            target.find("[js=seatNo]").val(stu.SeatNo);
            target.find("[js=studentName]").html(stu.StudentName);
            target.find("[js=studentNumber]").html(stu.StudentNumber);
            var score = '';
            if(currentExam){
                var currentCourse=ScoreManager.getCurrentCourse();
                if (currentCourse && currentCourse.StudentScore
                    && currentCourse.StudentScore['s'+currentStudent.StudentId]
                    && currentCourse.StudentScore['s'+currentStudent.StudentId].ExtScore
                    && currentCourse.StudentScore['s'+currentStudent.StudentId].ExtScore.Extensions
                    && currentCourse.StudentScore['s'+currentStudent.StudentId].ExtScore.Extensions.Extension) {

                    var that_exam = currentCourse.StudentScore['s'+currentStudent.StudentId].ExtScore.Extensions.Extension;
                    $(that_exam).each(function(index, subExam){
                        if (subExam.Name === 'GradeBook') {
                            if (subExam.Exam && subExam.Exam.Item) {
                                $(subExam.Exam.Item).each(function(index, item) {
                                    if (item.SubExamID === currentExam) {
                                        score = item.Score;
                                        return false;
                                    }
                                });
                            }
                        }
                    });
                }
            }
            target.find("[js=scoreInput]").val(score);
            if(ScoreManager.currentInputPanel()=="JumpSeatNo") {
                target.find("[js=scoreInput]").select();
            }
            ScoreManager.hightLight(currentStudent.StudentId,currentExam);

            // 跳至該學生
            var top_val = $("tr[data-sid=" + currentStudent.StudentId + "]").offset().top-205;
            top_val = (top_val < 0) ? 0 : top_val;
            $('body').animate({scrollTop: top_val}, 500);
        }

        target.find("[js=seatNo]").on("keyup", function(e) {
            if (e.which === 13) {
                var currentCourse=ScoreManager.getCurrentCourse();
                var currentIndex=-1;
                var found=false;

                $(currentCourse.Students).each(function(index,stu){
                    if(found)return;
                    if(stu==currentStudent){
                        currentIndex=index;
                    } else {
                        if(currentIndex>=0){
                            if(stu.SeatNo==target.find("[js=seatNo]").val()){
                                found=true;
                                setCurrentStudent(stu);
                            }
                        }
                    }
                });
                $(currentCourse.Students).each(function(index,stu){
                    if(found||index>=currentIndex)return;
                    if(stu.SeatNo==target.find("[js=seatNo]").val()){
                        found=true;
                        setCurrentStudent(stu);
                    }
                });
                if(!found){
                    //SeatNo doesnt exist
                    target.find("[js=seatNo]").val('');
                }
            }
        });

        target.find("[js=dropdown-menu]").on('click', 'li a', function(e){
            setCurrentExam($(this).text());
        });

        target.find("[js=scoreInput]").on("keyup", function(e) {
            if (e.which === 13 || e.which === 40) {
                target.find("[js=save]").focus();
            }
        });

        target.find("[js=save]").on('click', function(e){
            if ($(this).hasClass("disabled")) return;
            if (currentStudent && currentExam) {
                ScoreManager.saveScoreAction(currentStudent,currentExam,target.find("[js=scoreInput]").val());
            }
        });

        ScoreManager.currentCourseChangedConfig({
            beforeHandler: function() {
                clear();
                target.find('[js=examSelect]').html('');
            },
            actionHandler: function(currentCourse){
                var currentCourse=ScoreManager.getCurrentCourse();
                if(currentCourse){
                    if (currentCourse.Students.length) {
                        setCurrentStudent(currentCourse.Students[0]);
                    }
                    if (currentCourse.ExamList.length) {
                        setCurrentExam(currentCourse.ExamList[0]);
                    }
                    $(currentCourse.ExamList).each(function(index, examName){
                        target.find('[js=dropdown-menu]').append('<li><a href="javascript:void(0);">' + examName + '</a></li>')
                    });
                }
            }
        });

        ScoreManager.userSelectChangededConfig(function(stu,exam){
            clear();
            setCurrentStudent(stu);
            setCurrentExam(exam);
        });

        ScoreManager.saveScoreConfig({
            beforeHandler: function() {
                $(this).addClass("disabled");
                target.find('[js="scoreMsg"]').html('');
            },
            afterHandler: function() {
                $(this).removeClass("disabled");

                var currentIndex=-1;
                var currentCourse=ScoreManager.getCurrentCourse();
                var tmpStudent=null;
                $(currentCourse.Students).each(function(index,stu){
                    if(currentIndex>=0)return;
                    if(stu==currentStudent){
                        currentIndex=index;
                    }
                });
                if(currentIndex==currentCourse.Students.length-1){
                    tmpStudent=currentCourse.Students[0];
                    target.find("[js=seatNo]").val(tmpStudent.SeatNo);
                }
                else{
                    tmpStudent=currentCourse.Students[currentIndex+1];
                    target.find("[js=seatNo]").val(tmpStudent.SeatNo);
                }
                target.find("[js=seatNo]").select();
            }
        });
    });

});