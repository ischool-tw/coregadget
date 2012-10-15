var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.exam.parent");

jQuery(function () {
    // TODO: 切換學年度學期
    $("#Semester").on('click', '.btn', function(event) {
        _gg.exam = {
            schoolYear: $(this).attr("school-year"),
            semester: $(this).attr("semester")
        }
        _gg.loadScore();
    });

    // TODO: 切換學生
    $("#children-list").on("click", "a", function(e) {
        $('#children-list li[class=active]').removeClass('active');
        $(this).parent().addClass('active');
        _gg.student = _gg.students[$(this).attr("children-index")];
        _gg.resetData();
        _gg.resetSchoolYearSeme();
    });

    // TODO: 取得學生資料
    _gg.connection.send({
        service: "_.GetStudentInfo",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetStudentInfo)\n</div>");
            } else {
                var items, _ref;
                if (error != null) {
                    return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetStudentInfo)\n</div>");
                } else {
                    if (((_ref = response.Result) != null ? _ref.Student : void 0) != null) {
                        _gg.resetData();
                        _gg.students = $(response.Result.Student);
                        items = [];
                        _gg.students.each(function(index, student) {
                        return items.push("<li " + (index === 0 ? " class='active'" : '') + ">\n  <a href='#' children-index='" + index + "'>" + this.StudentName + "</a>\n</li>");
                    });
                    $("#children-list").html(items.join("")).find('a:first').trigger('click');
                }
              }
            }
        }
    });
});

_gg.resetSchoolYearSeme = function() {
    _gg.connection.send({
        service: "_.GetAllCourseSemester",
        body: '<Request><Condition><StudentID>' + _gg.student.StudentID + '</StudentID></Condition></Request>',
        result: function (response, error, http) {
            if (error !== null) {
                $("#editModal #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetAllCourseSemester)\n</div>");
            } else {
                var _ref;
                if (((_ref = response.Course) != null ? _ref.Semester : void 0) != null) {
                    var items = [];
                    $(response.Course.Semester).each(function(index, item) {
                        items.push("<button class='btn btn-large' school-year='" + this.SchoolYear + "' semester='" + this.Semester + "'>" + (this.SchoolYear + '' + this.Semester) + "</button>");
                        if (index === 0) {
                            _gg.exam = {
                                schoolYear: this.SchoolYear,
                                semester: this.Semester
                            }
                        }
                    });
                    $("#Semester .btn-group").html(items.join("")).find('.btn:first').addClass('active');
                }
                _gg.loadScore();
            }
        }
    });
};

_gg.resetData = function() {
    $("#ExamScore thead").html('');
    $("#ExamScore tbody").html('');
};

// TODO: 下載評量成績
_gg.loadScore = function() {
    _gg.connection.send({
        service: "_.GetCourseExamScore",
        body: {
            Content: {
                Condition: {
                    SchoolYear: _gg.exam.schoolYear,
                    Semester: _gg.exam.semester,
                    StudentID: _gg.student.StudentID
                },
                Field: {
                    Subject: ''
                }
            }
        },
        result: function(response, error, http) {
            var _ref;
            if (((_ref = response.ExamScoreList) != null ? _ref.ExamScore : void 0) != null) {

                var thead = "<th rowspan='2'>課程名稱</th>", thead2 = "", tbody = "", tfooter = "<th>總分</th>";
                var items = [], exams = [];

                $(response.ExamScoreList.ExamScore).each(function(i, exam) {

                    thead += '<th colspan="2">' + exam.ExamName + '</th>';
                    thead2 += '<th colspan="2">成績</th>';

                    exams.push(exam);

                    var tmp_course = '';

                    $(exam.ScoreDetail).each(function(j, course) {

                        var include = false;

                        $(items).each(function(i, item) {
                            if (course.CourseID === item.CourseID) {
                                include = true;
                                item["Exam_" + exam.ExamID] = course.Score;
                                return false;
                            }
                        });

                        if (!include) {
                            var item = {};
                            item.CourseID   = course.CourseID;
                            item.Subject    = course.Subject;
                            item.CourseName = course.CourseName;
                            item["Exam_" + exam.ExamID] = course.Score;

                            items.push(item);
                        }

                        tmp_course += course.Subject;
                    });

                    if (tmp_course === '體育') {
                        tfooter += '<td class="sum-score" my-data="' + exam.ExamID + '" my-type="no"></td><td>&nbsp;</td>';
                    } else {
                        tfooter += '<td class="sum-score" my-data="' + exam.ExamID + '"></td><td>&nbsp;</td>';
                    }
                });

                thead = '<tr class="my-nofill">' + thead + '</tr>';
                thead += '<tr class="my-nofill">' + thead2 + '</tr>';

                $(items).each(function(i, item) {

                    var tr = "<th>" + item.CourseName + "</th>";
                    var pre_score = -999;

                    $(exams).each(function(j, exam) {
                        var currse_score = item["Exam_" + exam.ExamID];
                        if (currse_score == undefined || currse_score === "") {
                            tr += '<td class="my-nofill">&nbsp;</td>';
                            tr += '<td class="my-nofill">&nbsp;</td>';
                        } else {
                            currse_score = parseInt(currse_score, 10);

                            // TODO: 顯示成績，未達60分以紅色表示
                            if (currse_score < 60) {
                                tr += '<td class="my-fail" my-data="' + exam.ExamID + '">' + currse_score + '</td>';
                            } else {
                                tr += '<td my-data="' + exam.ExamID + '">' + currse_score + '</td>';
                            }

                            // TODO: 除了科目為「體育」和第一次考試，皆與上次比較進退步
                            if (item.Subject === '體育' || pre_score === -999) {
                                tr += '<td>&nbsp;</td>';
                                pre_score = currse_score;
                            } else {
                                if (currse_score > pre_score) {
                                    tr += '<td><span class="my-progress">↑</span></td>';
                                } else if (currse_score < pre_score) {
                                    tr += '<td><span class="my-regress">↓</span></td>';
                                } else {
                                    tr += '<td>&nbsp;</td>';
                                }
                                pre_score = currse_score;
                            }
                        }

                    });

                    tbody += "<tr>" + tr + "</tr>";
                });

                tbody += "<tr>" + tfooter + "</tr>";
                $("#ExamScore thead").html(thead);
                $("#ExamScore tbody").html(tbody);

                var pre_score = -999;
                $("#ExamScore .sum-score").each(function() {
                    var tmp_id = $(this).attr('my-data');
                    var currse_score = 0;
                    $('#ExamScore td[my-data=' + tmp_id +']').each(function() {
                        if ($.isNumeric($(this).text())) {
                            currse_score += parseInt($(this).text(), 10);
                        }
                    })
                    $(this).text(currse_score);

                    // TODO: 除了科目為「體育」和第一次考試，皆與上次比較進退步
                    if ($(this).attr('my-type') !== "no") {
                        var tmp_next= $(this).next();
                        if (pre_score === -999) {
                            pre_score = currse_score;
                        } else {
                            if (currse_score > pre_score) {
                                tmp_next.html('<span class="my-progress">↑</span>');
                            } else if (currse_score < pre_score) {
                                tmp_next.html('<span class="my-regress">↓</span>');
                            }
                            pre_score = currse_score;
                        }
                    }
                });
            } else {
                $("#ExamScore tbody").html('目前無資料');
            }
        }
    });
};