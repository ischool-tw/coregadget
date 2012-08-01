var _gg = _gg || {};
_gg = {
    connection : gadget.getContract("ischool.transcript.student"),
    Students : [],
    ScoreRule : [],
    GraduationPlan : [],
    SemsSubjScore : [],
    SemsEntryScore : [],
    Student : '',
    schoolYear :'',
    semester : ''
}


$(document).ready(function () {
    gadget.onSizeChanged(function (size) {
        $("#container-nav, #container-main").height(size.height - 50);
    });

    $('.my-schoolyear-semester-widget btn').live("click", function () {
        _gg.schoolYear = $(this).attr("school-year");
        _gg.semester = $(this).attr("semester");
        _gg.SetScoreData();
    });

    _gg.ResetData();

    // TODO: 取得學生資料
    _gg.connection.send({
        service: "_.GetStudentInfo",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetStudentInfo)\n</div>");
            } else {
                $(response.Student).each(function (index, item) {
                    if (index === 0) { _gg.Student = item; }
                    
                     if (!_gg.Students[item.StudentID]) {
                        _gg.Students[item.StudentID] = item;

                        // TODO: 設定學生使用的畢業條件，以學生優先，班級次之
                        if (item.StudentScoreCalcRuleID) {
                            _gg.Students[item.StudentID].ScoreCalcRuleID = item.StudentScoreCalcRuleID;
                        } else {
                            _gg.Students[item.StudentID].ScoreCalcRuleID = item.ClassScoreCalcRuleID;
                        }

                        // TODO: 設定學生使用的課程規範，以學生優先，班級次之
                        if (item.StudentGraduationPlanID) {
                            _gg.Students[item.StudentID].GraduationPlanID = item.StudentGraduationPlanID;
                        } else {
                            _gg.Students[item.StudentID].GraduationPlanID = item.ClassGraduationPlanID;
                        }
                    }                    
                });                                

                _gg.GetSemsEntryScore(); // TODO: 取得學期成績
                _gg.GetSemsSubjScore(); // TODO: 取得分項成績
                _gg.GetScoreRule(_gg.Student.ScoreCalcRuleID); // TODO: 取得畢業條件
                _gg.GetGraduationPlan(_gg.Student.GraduationPlanID); // TODO: 取得課規

                // TODO: 學期對照表
                var items = [];
                $(_gg.Student.SemsHistory.History).each(function (index, item) {
                    _gg.schoolYear = item.SchoolYear;
                    _gg.semester = item.Semester;

                    items.push("<button class='btn btn-large' grade-year='" + item.GradeYear + "' school-year='" + item.SchoolYear + "' semester='" + item.Semester + "'>" + item.SchoolYear + item.Semester + "</button>");
                });

                $(".my-schoolyear-semester-widget div").html(items.reverse().join(""));
                $(".my-schoolyear-semester-widget button:first").addClass("active");
            }
        }
    });
});

// TODO: 處理畢業條件、各項學分資訊
_gg.SetStudentCreditData = function () {
    var student = _gg.Student;
    var ScoreRule, GraduationPlan, SemsSubjScore, SemsEntryScore;

    if (_gg.ScoreRule[student.ScoreCalcRuleID] &&
            _gg.GraduationPlan[student.GraduationPlanID] &&
            _gg.SemsSubjScore[student.StudentID] &&
            _gg.SemsEntryScore[student.StudentID]) {

        student.GraduationPlanName = _gg.GraduationPlan[student.GraduationPlanID].Name; // TODO: 設定學生課規名稱


        // TODO: 處理畢業條件、各項學分資訊 

        ScoreRule = _gg.ScoreRule[student.ScoreCalcRuleID].Content;
        GraduationPlan = _gg.GraduationPlan[student.GraduationPlanID].Content;

        $("#graduation small").html(ScoreRule.ScoreCalcRule.學期科目成績屬性採計方式); // TODO: 畢業條件

        $("#graduation div[credit-type=total] .my-slate-total").html(ScoreRule.ScoreCalcRule.畢業學分數.學科累計總學分數 || '--'); // TODO: 應修總學分
        $("#graduation div[credit-type=required] .my-slate-total").html(ScoreRule.ScoreCalcRule.畢業學分數.必修學分數 || '--'); // TODO: 應修必修學分
        $("#graduation div[credit-type=choose] .my-slate-total").html(ScoreRule.ScoreCalcRule.畢業學分數.選修學分數 || '--'); // TODO: 應修選修學分
        $("#graduation div[credit-type=edu-required] .my-slate-total").html(ScoreRule.ScoreCalcRule.畢業學分數.部訂必修學分數 || '--'); // TODO: 應修部定必修學分
        $("#graduation div[credit-type=internships] .my-slate-total").html(ScoreRule.ScoreCalcRule.畢業學分數.實習學分數 || '--'); // TODO: 應修實習學分
        $("#graduation div[credit-type=school-required] .my-slate-total").html(ScoreRule.ScoreCalcRule.畢業學分數.校訂必修學分數 || '--'); // TODO: 應修校訂必修學分

        _gg.SetScoreData(); // TODO: 學年度成績資訊
    }
};


// TODO: 學年度成績資訊
_gg.SetScoreData = function () {
    var student = _gg.Student;
    var SemsSubjScore, SemsEntryScore;

    // TODO: 本學期分項成績
    SemsEntryScore = _gg.SemsEntryScore[student.StudentID].Result;
    var tmp_academic = '--', tmp_internship = '--';
    $(SemsEntryScore).each(function (index, item) {
        // TODO: 目前要顯示的學年度學期
        if (_gg.schoolYear === item.SchoolYear && _gg.semester === item.Semester) {
            if (this.ScoreInfo.SemesterEntryScore.Entry.分項 === "學業") {
                tmp_academic = this.ScoreInfo.SemesterEntryScore.Entry.成績;
            };
            if (this.ScoreInfo.SemesterEntryScore.Entry.分項 === "實習科目") {
                tmp_internship = this.ScoreInfo.SemesterEntryScore.Entry.成績;
            };
        };

        $("#EntryScore span[entry-type=academic]").html(tmp_academic);
        $("#EntryScore span[entry-type=internship]").html(tmp_internship);
    });

    // TODO: 本學期科目成績
    SemsSubjScore = _gg.SemsSubjScore[student.StudentID].Result;
    $.each(SemsSubjScore, function (index, item) {
        // TODO: 目前要顯示的學年度學期
        var items = [];
        if (_gg.schoolYear === item.SchoolYear && _gg.semester === item.Semester) {
            $(item.ScoreInfo.SemesterSubjectScoreInfo.Subject).each(function () {
                items.push('<tr>');

                // TODO: 成績擇優顯示
                var tmp_score = '';
                if (this.不計學分 === "否" || this.不需評分 === "否") {
                    tmp_score = Math.max(this.原始成績, this.學年調整成績, this.擇優採計成績, this.補考成績, this.重修成績, 0);
                    if (parseInt(this.補考成績, 10) === tmp_score) { tmp_score += '(補)'; }
                    if (parseInt(this.重修成績, 10) === tmp_score) { tmp_score += '(重)'; }
                    if (parseInt(this.擇優採計成績, 10) === tmp_score) { tmp_score += '(手)'; }
                    if (parseInt(this.學年調整成績, 10) === tmp_score) { tmp_score += '(調)'; }
                    tmp_score = (this.是否取得學分 === "是" ? tmp_score : '<span class="lost-credit">' + tmp_score + '</span>');
                }
                items.push('<td>' + tmp_score + '</td>');

                // TODO: 課程規劃表
                var tmp_use_graduationPlan = {
                    Entry: this.Entry,
                    SubjectName: this.SubjectName,
                    startLevel: this.startLevel,
                    Credit: this.Credit,
                    RequiredBy: this.RequiredBy,
                    Required: this.Required
                };

                // TODO: 實際學期科目成績內容
                var tmp_use_semsSubjScore = {
                    Entry: this.開課分項類別,
                    SubjectName: this.科目,
                    startLevel: this.科目級別,
                    Credit: this.開課學分數,
                    RequiredBy: this.修課校部訂,
                    Required: this.修課必選修
                };

                $.each(tmp_use_graduationPlan, function (name, value) {
                    items.push(fun_SubjectScore_tooltip = (tmp_use_graduationPlan[name], tmp_use_semsSubjScore.name));
                });

                // TODO: 是否取得學分
                items.push('<td>' + (this.是否取得學分 === "是" ? '<i class="icon-ok"></i>' : '<i class="icon-remove"></i>') + '</td>');
                items.push('</tr>');

            });
            $("#SubjectScore tbody").html(items.join(""));
        }
    });

    // TODO: 本學期學分資訊
    $("#Credit .my-slate-number").html(""); // TODO: 實得
    $("#Credit .my-slate-total").html("");  // TODO: 已修
    $("#Credit tbody").html("");

    
    // TODO: 處理分項成績中的 Tooltip
    var fun_SubjectScore_tooltip = function (mainData, compareData) {
        if (mainData !== compareData) {
            return '<td rel="tooltip" data-original-title="在課程規劃表「' + _gg.student.GraduationPlanName + '」中值為' + compareData + '">' + mainData + '</td>';
        } else {
            return '<td>' + mainData + '</td>';
        }
    };
};


// TODO: 取得畢業條件
_gg.GetScoreRule = function (id) {
    _gg.connection.send({
        service: "_.GetScoreRule",
        body: "<Request><Condition><Id>" + id + "</Id></Condition></Request>",
        result: function (response, error, http) {
            if (error !== null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetScoreRule)\n</div>");
            } else {
                $(response.ScoreCalcRule).each(function (index, item) {
                    if (!_gg.ScoreRule[item.Id]) {
                        _gg.ScoreRule[item.Id] = item;
                    }
                });
                _gg.SetStudentCreditData();
            }
        }
    });
};

// TODO: 取得課規
_gg.GetGraduationPlan = function (id) {
    _gg.connection.send({
        service: "_.GetGraduationPlan",
        body: "<Request><Condition><Id>" +id+ "</Id></Condition></Request>",
        result: function (response, error, http) {
            if (error !== null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetGraduationPlan)\n</div>");
            } else {
                $(response.GraduationPlan).each(function (index, item) {
                    if (!_gg.GraduationPlan[item.Id]) {
                        _gg.GraduationPlan[item.Id] = item;
                    }
                });
                _gg.SetStudentCreditData();
            }
        }
    });
};

// TODO: 取得學期成績
_gg.GetSemsSubjScore = function (schoolYear, semester) {
    var tmp_request = {
        Request: {
            Condition: {
            }
        }
    };
    if (schoolYear) tmp_request.Request.Condition.SchoolYear = schoolYear;
    if (semester) tmp_request.Request.Condition.Semester = semester;

    //"<Request><Condition><SchoolYear>" +schoolYear+"</SchoolYear><Semester>"+semester+"</Semester></Condition></Request>";
    _gg.connection.send({
        service: "_.GetSemsSubjScore",
        body: tmp_request,
        result: function (response, error, http) {
            if (error !== null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetSemsSubjScore)\n</div>");
            } else {
                var tmp_studentid;

                $(response.Students.SemsSubjScore).each(function (index, item) {
                    tmp_studentid = item.StudentID;

                    if (!_gg.SemsSubjScore[tmp_studentid]) {
                        var tmp_obj = {
                            Result: []
                        };
                        _gg.SemsSubjScore[tmp_studentid] = tmp_obj;
                    }

                    _gg.SemsSubjScore[tmp_studentid].Result.push(item);

                });
                _gg.SetStudentCreditData();
            }
        }
    });
};

// TODO: 取得分項成績
_gg.GetSemsEntryScore = function (schoolYear, semester) {
    var tmp_request = {
        Request: {
            Condition: {
            }
        }
    };
    if (schoolYear) tmp_request.Request.Condition.SchoolYear = schoolYear;
    if (semester) tmp_request.Request.Condition.Semester = semester;

    //"<Request><Condition><SchoolYear>" +schoolYear+"</SchoolYear><Semester>"+semester+"</Semester></Condition></Request>";
    _gg.connection.send({
        service: "_.GetSemsEntryScore",
        body: tmp_request,
        result: function (response, error, http) {
            if (error !== null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetSemsEntryScore)\n</div>");
            } else {
                var tmp_studentid;

                $(response.Students.SemsEntryScore).each(function (index, item) {
                    tmp_studentid = item.StudentID;

                    if (!_gg.SemsEntryScore[tmp_studentid]) {
                        var tmp_obj = {
                            Result: []
                        };
                        _gg.SemsEntryScore[tmp_studentid] = tmp_obj;
                    }

                    _gg.SemsEntryScore[tmp_studentid].Result.push(item);

                });

                _gg.SetStudentCreditData();
            }
        }
    });
};


// TODO: 清除資訊
_gg.ResetData = function () {
    $("#graduation small").html(""); // TODO: 畢業條件

    $("#graduation div[credit-type=total] .my-slate-number").html(""); // TODO: 實得總學分
    $("#graduation div[credit-type=required] .my-slate-number").html(""); // TODO: 實得必修學分
    $("#graduation div[credit-type=choose] .my-slate-number").html(""); // TODO: 實得選修學分
    $("#graduation div[credit-type=edu-required] .my-slate-number").html(""); // TODO: 實得部定必修學分
    $("#graduation div[credit-type=internships] .my-slate-number").html(""); // TODO: 實得實習學分
    $("#graduation div[credit-type=school-required] .my-slate-number").html(""); // TODO: 實得校訂必修學分

    $("#graduation div[credit-type=total] .my-slate-total").html(""); // TODO: 應修總學分
    $("#graduation div[credit-type=required] .my-slate-total").html(""); // TODO: 應修必修學分
    $("#graduation div[credit-type=choose] .my-slate-total").html(""); // TODO: 應修選修學分
    $("#graduation div[credit-type=edu-required] .my-slate-total").html(""); // TODO: 應修部定必修學分
    $("#graduation div[credit-type=internships] .my-slate-total").html(""); // TODO: 應修實習學分
    $("#graduation div[credit-type=school-required] .my-slate-total").html(""); // TODO: 應修校訂必修學分

    $(".my-schoolyear-semester-widget div").html("");

    $("#Credit .my-slate-number").html(""); // TODO: 實得
    $("#Credit .my-slate-total").html("");  // TODO: 已修
    $("#Credit tbody").html("");

    // TODO: 本學期分項成績
    $("#EntryScore span[entry-type=academic]").html("");
    $("#EntryScore span[entry-type=internship]").html("");

    // TODO: 本學期科目成績
    $("#SubjectScore tbody").html("");
};