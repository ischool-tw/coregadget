var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.transcript.student");
_gg.Students = [];
_gg.ScoreRules = [];
_gg.GraduationPlans = [];
_gg.Student = '';
_gg.schoolYear = '';
_gg.semester = '';


$(document).ready(function () {
    $('.my-schoolyear-semester-widget').on("click", ".btn", function () {
        _gg.schoolYear = $(this).attr("school-year");
        _gg.semester = $(this).attr("semester");
        _gg.SetScoreData();
    });

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

                var student = _gg.Student;
                _gg.GetSemsEntryScore();                         // TODO: 取得學期成績
                _gg.GetSemsSubjScore();                          // TODO: 取得分項成績
                _gg.GetScoreRule(student.ScoreCalcRuleID);       // TODO: 取得畢業條件
                _gg.GetGraduationPlan(student.GraduationPlanID); // TODO: 取得課規
            }
        }
    });
});

// TODO: 處理畢業條件、各項學分資訊
_gg.SetStudentCreditData = function () {
    var student = _gg.Student;

    if (_gg.ScoreRules[student.ScoreCalcRuleID] &&
        _gg.GraduationPlans[student.GraduationPlanID] &&
        student.MySemsSubjScore &&
        student.MySemsEntryScore) {

        student.MyScoreRule = (_gg.ScoreRules[student.ScoreCalcRuleID] || '');            // TODO: 設定全域學生畢業條件
        student.MyGraduationPlan =(_gg.GraduationPlans[student.GraduationPlanID] || '');  // TODO: 設定全域學生課規表
        student.CreditCount = {
            Credits            : []   //各學期學分數
        };

        var SemsSubjScore = student.MySemsSubjScore;

        $(SemsSubjScore).each(function (index, item) {

                var tmp_SemsCredit = {
                    SchoolYear           : item.SchoolYear,
                    Semester             : item.Semester,
                    S_Total_Credit       : 0,                //單一學期已修總學分
                    S_True_Credit        : 0,                //單一學期實得總學分
                    S_Required           : 0,                //單一學期必修
                    S_Choose             : 0,                //單一學期選修
                    S_Required_By_Edu    : 0,                //單一學期部定必修
                    S_Required_By_School : 0,                //單一學期校訂必修
                    S_Choose_By_Edu      : 0,                //單一學期部定選修
                    S_Choose_By_School   : 0,                //單一學期校訂選修
                    S_Internships        : 0                 //單一學期實習
                };

                // TODO: 實際學期科目成績內容
                var tmp_semsSubjScore = {};

                $.each(item.ScoreInfo.SemesterSubjectScoreInfo.Subject, function () {
                            // TODO: 實際學期科目成績內容
                            tmp_semsSubjScore = {
                                Entry: this.開課分項類別,
                                Credit: this.開課學分數,
                                RequiredBy: this.修課校部訂,
                                Required: this.修課必選修,
                                NotIncludedInCredit: (this.不計學分 === "否") ? "False" : "True"
                            };

                            // TODO: 採計方式以學生個人修習為主
                            var tmp_use_data = tmp_semsSubjScore;
                            // TODO: 學分數轉數字
                            var tmp_credit = parseInt(tmp_use_data.Credit, 10) || 0;

                            if (tmp_use_data.NotIncludedInCredit === "False") {
                                // TODO: 單一學期
                                tmp_SemsCredit.S_Total_Credit += tmp_credit;

                                if (this.是否取得學分 === "是") {
                                    tmp_SemsCredit.S_True_Credit += tmp_credit;
                                    tmp_SemsCredit.S_Required += (tmp_use_data.Required === "必修") ? tmp_credit : 0;
                                    tmp_SemsCredit.S_Choose += (tmp_use_data.Required === "選修") ? tmp_credit : 0;
                                    tmp_SemsCredit.S_Required_By_Edu += (tmp_use_data.Required === "必修" && tmp_use_data.RequiredBy === "部訂") ? tmp_credit : 0;
                                    tmp_SemsCredit.S_Required_By_School += (tmp_use_data.Required === "必修" && tmp_use_data.RequiredBy === "校訂") ? tmp_credit : 0;
                                    tmp_SemsCredit.S_Choose_By_Edu += (tmp_use_data.Required === "選修" && tmp_use_data.RequiredBy === "部訂") ? tmp_credit : 0;
                                    tmp_SemsCredit.S_Choose_By_School += (tmp_use_data.Required === "選修" && tmp_use_data.RequiredBy === "校訂") ? tmp_credit : 0;
                                    tmp_SemsCredit.S_Internships += (tmp_use_data.Entry === "實習科目") ? tmp_credit : 0;
                                }
                            }
                });

                student.CreditCount.Credits.push(tmp_SemsCredit);

        });

        // TODO: 學期對照表
        var items = [];
        $(student.SemsHistory.History).each(function (key, item) {
            items.push("<button class='btn btn-large' grade-year='" + item.GradeYear + "' school-year='" + item.SchoolYear + "' semester='" + item.Semester + "'>" + item.SchoolYear + item.Semester + "</button>");
        });

        $(".my-schoolyear-semester-widget div").html(items.reverse().join(""));
        $(".my-schoolyear-semester-widget button:first").addClass("active").trigger('click');

        _gg.SetScoreData(); // TODO: 學年度成績資訊
    }
};


// TODO: 學年度成績資訊
_gg.SetScoreData = function () {
    _gg.ResetData();

    var student = _gg.Student;
    var ScoreRule = student.MyScoreRule.Content.ScoreCalcRule;
    var GraduationPlan = student.MyGraduationPlan.Content.GraduationPlan.Subject;
    var SemsSubjScore = student.MySemsSubjScore;
    var SemsEntryScore = student.MySemsEntryScore;

    // TODO: 本學期分項成績
    var tmp_academic = '--'
    var tmp_internship = '--';
    $(SemsEntryScore.SemsEntryScore).each(function (index, item) {
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

    // TODO: 處理分項成績中與課程規劃表的差異 Tooltip
    var fun_SubjectScore_tooltip = function (mainData, compareData) {
        if (compareData) {
            if (mainData !== compareData) {
                return '<td rel="tooltip" data-original-title="課程規劃表「' + student.MyGraduationPlan.Name + '」<br/>設定為' + compareData + '">' + mainData + '</td>';
            } else {
                return '<td>' + mainData + '</td>';
            }
        } else {
            return '<td>' + mainData + '</td>';
        }
    };

    // TODO: 本學期科目成績
    $.each(SemsSubjScore, function (index, item) {
        // TODO: 目前要顯示的學年度學期
        var items = [];
        if (_gg.schoolYear === item.SchoolYear && _gg.semester === item.Semester) {
            $.each(item.ScoreInfo.SemesterSubjectScoreInfo.Subject, function () {
                // TODO: 取得學分
                var tmp_credit = '不列入';
                if (this.不計學分 === "否") {
                    tmp_credit = (this.是否取得學分 === "是" ? '<i class="icon-ok"></i>' : '<i class="icon-remove"></i>');
                }

                if (tmp_credit === '不列入') {
                    items.push('<tr class="my-ignore">');
                } else {
                    items.push('<tr>');
                }

                var tmp_graduationPlan = {};
                var tmp_semsSubjScore = {};

                // TODO: 課程規劃表
                var that = this;
                $.each(GraduationPlan, function () {
                    if (that.科目 === this.SubjectName && that.科目級別 === this.Level) {
                        tmp_graduationPlan = {
                            Entry: this.Entry,
                            SubjectName: this.SubjectName,
                            Level: this.Level,
                            Credit: this.Credit,
                            RequiredBy: this.RequiredBy,
                            Required: this.Required,
                            NotIncludedInCredit: this.NotIncludedInCredit,
                            NotIncludedInCalc: this.NotIncludedInCalc
                        };
                        return false; // TODO: 跳出each
                    }
                });

                // TODO: 實際學期科目成績內容
                tmp_semsSubjScore = {
                    Entry: this.開課分項類別,
                    SubjectName: this.科目,
                    Level: this.科目級別,
                    Credit: this.開課學分數,
                    RequiredBy: this.修課校部訂,
                    Required: this.修課必選修,
                    NotIncludedInCredit: (this.不計學分 === "否") ? "False" : "True",
                    NotIncludedInCalc: (this.不需評分 === "否") ? "False" : "True"
                };

                // TODO: 以實際學期科目成績內容為準
                //var tmp_use_data = (ScoreRule.學期科目成績屬性採計方式 === "以課程規劃表內容為準") ? this : tmp_graduationPlan;
                var tmp_use_data = tmp_semsSubjScore;


                // TODO: 成績擇優顯示，不需評分顯示空白
                var tmp_score = '';
                if (tmp_use_data.NotIncludedInCalc === "False") {
                    if (this.原始成績 === '' && this.學年調整成績 === '' && this.擇優採計成績 === '' && this.補考成績 === '' && this.重修成績 === '') {
                        tmp_score = '';
                    } else {
                        tmp_score = Math.max(this.原始成績, this.學年調整成績, this.擇優採計成績, this.補考成績, this.重修成績, 0);
                        if (parseInt(this.補考成績, 10) === tmp_score)     { tmp_score += '(補)'; }
                        if (parseInt(this.重修成績, 10) === tmp_score)     { tmp_score += '(重)'; }
                        if (parseInt(this.擇優採計成績, 10) === tmp_score) { tmp_score += '(手)'; }
                        if (parseInt(this.學年調整成績, 10) === tmp_score) { tmp_score += '(調)'; }
                    }
                    tmp_score = (this.是否取得學分 === "是" ? tmp_score : '<span class="my-lost-credit">' + tmp_score + '</span>');
                }

                // TODO: 分項類別   ,科目,級別,學分,校訂/部定,必修/選修
                $.each(tmp_semsSubjScore, function (name, value) {
                    if (name !== "NotIncludedInCredit" && name !== "NotIncludedInCalc") {
                        items.push(fun_SubjectScore_tooltip(tmp_semsSubjScore[name], tmp_graduationPlan[name]));
                    }
                });

                items.push('<td>' + tmp_score + '</td>');
                items.push('<td>' + tmp_credit + '</td>');
                items.push('</tr>');

            });
            $("#SubjectScore tbody").html(items.join(""));
            $('td[rel=tooltip]').tooltip("show").tooltip("toggle");

            return false; // TODO: 跳出each
        }
    });

    // TODO: 本學期學分資訊
    $(student.CreditCount.Credits).each(function (index, item) {
        if (_gg.schoolYear === item.SchoolYear && _gg.semester === item.Semester) {
            var items = '<tr>' +
                '<th><span>必修</span> </th><td><span>' + item.S_Required + '</span></td>' +
                '<td>&nbsp;</td>' +
                '<th><span>選修</span> </th><td><span>' + item.S_Choose + '</span></td>' +
                '<td>&nbsp;</td>' +
            '</tr>' +
            '<tr>' +
                '<th><span>部定必修</span> </th><td><span>' + item.S_Required_By_Edu + '</span></td>' +
                '<td>&nbsp;</td>' +
                '<th><span>部定選修</span> </th><td><span>' + item.S_Choose_By_Edu + '</span></td>' +
                '<td>&nbsp;</td>' +
            '</tr>' +
            '<tr>' +
                '<th><span>校定必修</span> </th><td><span>' + item.S_Required_By_School + '</span></td>' +
                '<td>&nbsp;</td>' +
                '<th><span>校定選修</span> </th><td><span>' + item.S_Choose_By_School + '</span></td>' +
                '<td>&nbsp;</td>' +
            '</tr>' +
            '<tr>' +
                '<th><span>實習</span> </th><td><span>' + item.S_Internships + '</span></td>' +
                '<td colspan="4">&nbsp;</td>' +
            '</tr>';

            $("#Credit .my-slate-number").html(item.S_True_Credit); // TODO: 實得
            $("#Credit .my-slate-total").html(item.S_Total_Credit);  // TODO: 已修
            $("#Credit tbody").html(items);

            return false; // TODO: 跳出each
        }
    });
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
                    if (!_gg.ScoreRules[item.Id]) {
                        _gg.ScoreRules[item.Id] = item;
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
                    if (!_gg.GraduationPlans[item.Id]) {
                        _gg.GraduationPlans[item.Id] = item;
                    }
                });
                _gg.SetStudentCreditData();
            }
        }
    });
};

// TODO: 取得學期成績
_gg.GetSemsSubjScore = function (schoolYear, semester) {
    var student = _gg.Student;
    _gg.connection.send({
        service: "_.GetSemsSubjScore",
        body: '<Request><Condition></Condition></Request>',
        result: function (response, error, http) {
            if (error !== null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetSemsSubjScore)\n</div>");
            } else {
                student.MySemsSubjScore = response.Students.SemsSubjScore;
                _gg.SetStudentCreditData();
            }
        }
    });
};

// TODO: 取得分項成績
_gg.GetSemsEntryScore = function (schoolYear, semester) {
    var student = _gg.Student;
    _gg.connection.send({
        service: "_.GetSemsEntryScore",
        body: '<Request><Condition></Condition></Request>',
        result: function (response, error, http) {
            if (error !== null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetSemsEntryScore)\n</div>");
            } else {
                student.MySemsEntryScore = response.Students;
                _gg.SetStudentCreditData();
            }
        }
    });
};


// TODO: 清除資訊
_gg.ResetData = function () {
    $("#Credit .my-slate-number").html("尚無資料"); // TODO: 實得
    $("#Credit .my-slate-total").html("");  // TODO: 已修
    $("#Credit tbody").html("");

    // TODO: 本學期分項成績
    $("#EntryScore span[entry-type=academic]").html("");
    $("#EntryScore span[entry-type=internship]").html("");

    // TODO: 本學期科目成績
    $("#SubjectScore tbody").html("");
};
