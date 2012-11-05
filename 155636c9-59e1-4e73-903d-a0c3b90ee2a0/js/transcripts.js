var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.transcript.student");
_gg.Students = [];
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
                    }
                });

                var student = _gg.Student;
                _gg.GetSemsSubjScore();                          // TODO: 取得學期成績
            }
        }
    });
});

// TODO: 處理畢業條件、各項學分資訊
_gg.SetStudentCreditData = function () {
    var student = _gg.Student;
    if (student.MySemsSubjScore) {
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
    var SemsSubjScore = student.MySemsSubjScore;

    var items = [];

    // TODO: 本學期科目成績
    $.each(SemsSubjScore, function (index, item) {
        // TODO: 目前要顯示的學年度學期
        if (_gg.schoolYear === item.SchoolYear && _gg.semester === item.Semester) {

            // TODO: 領域成績
            $.each(item.ScoreInfo.Domains.Domain, function (domainIndex, domainItem) {
                var intDomainScore = parseInt((domainItem.成績 || '0'), 10);

                var domainClassification = ''; --(intDomainScore);

                var domainScore = '', domainPass = '';
                if (intDomainScore >= 60) {
                    domainScore = '<td>' + (domainItem.成績 || '') + '</td>';
                    domainPass = '<i class="icon-ok"></i>';
                } else {
                    domainScore = '<td class="my-lost-credit">' + (domainItem.成績 || '') + '</td>';
                    domainPass = '<i class="icon-remove"></i>';
                }

                var domainPeriod = (domainItem.節數 || '');
                var domainWeight = (domainItem.權數 || '');
                var domainPeriod_Weight = domainPeriod;

                if (domainPeriod !== domainWeight) {
                    domainPeriod_Weight += '/' + domainWeight;
                }

                items.push(
                    '<thead>' +
                    '    <tr>' +
                    '        <td><i class="icon-book"></i> ' + (domainItem.領域 || '') + '</td>' +
                    '        <td>&nbsp;</td>' +
                    '        <td>' + domainPeriod_Weight + '</td>' +
                    domainScore +
                    '        <td>' + (domainItem.文字描述 || '') + '</td>' +
                    '        <td>' + domainPass + '</td>' +
                    '    </tr>' +
                    '</thead>'
                );


                // TODO: 科目成績
                $.each(item.ScoreInfo.SemesterSubjectScoreInfo.Subject, function () {
                    if (this.領域 === domainItem.領域) {

                        items.push('<tr>');

                        var tmp_semsSubjScore = {};


                        // TODO: 實際學期科目成績內容
                        tmp_semsSubjScore = {
                            Areas       : (this.領域 || ''),
                            SubjectName : (this.科目 || ''),
                            Weight      : (this.權數 || ''),
                            Period      : (this.節數 || ''),
                            Score       : (this.成績 || ''),
                            Description : (this.文字描述 || '')
                        };


                        var intScore = parseInt((tmp_semsSubjScore.Score || '0'), 10);

                        var score = '', pass = '';
                        if (intScore >= 60) {
                            score = '<td>' + (tmp_semsSubjScore.Score || '') + '</td>';
                            pass = '<i class="icon-ok"></i>';
                        } else {
                            score = '<td class="my-lost-credit">' + (tmp_semsSubjScore.Score || '') + '</td>';
                            pass = '<i class="icon-remove"></i>';
                        }

                        var period_Weight = tmp_semsSubjScore.Period;

                        if (tmp_semsSubjScore.Period !== tmp_semsSubjScore.Weight) {
                            period_Weight += '/' + tmp_semsSubjScore.Weight;
                        }

                        items.push('<tbody>');
                        items.push('<td>&nbsp;</td>');
                        items.push('<td>' + (tmp_semsSubjScore.SubjectName || '') + '</td>');
                        items.push('<td>' + period_Weight + '</td>');
                        items.push(score);
                        items.push('<td>' + (tmp_semsSubjScore.Description || '') + '</td>');
                        items.push('<td>' + pass + '</td>');
                        items.push('</tr>');
                        items.push('</tbody>');
                    }

                });
            });
            return false; // TODO: 跳出each
        }
    });

    var main_thead ='<thead>' +
        '  <tr>' +
        '    <th width="20%"><span>領域</span></th>' +
        '    <th width="20%"><span>科目</span></th>' +
        '    <th width="10%"><span>節/權數</span></th>' +
        '    <th width="10%"><span>成績</span></th>' +
        '    <th><span>文字描述</span></th>' +
        '    <th width="7%"><span>及格</span></th>' +
        '  </tr>' +
        '</thead>';

    var html = items.join('');

    if (html) {
        html = main_thead + html;
    } else {
        html = main_thead + '<tbody><tr><td colspan="8">無資料</td></tr></tbody>';
    }

    $("#SubjectScore table").html(html);
    $('td[rel=tooltip]').tooltip("show").tooltip("toggle");


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


// TODO: 清除資訊
_gg.ResetData = function () {
    // TODO: 本學期科目成績
    $("#SubjectScore tbody").html("");
};
