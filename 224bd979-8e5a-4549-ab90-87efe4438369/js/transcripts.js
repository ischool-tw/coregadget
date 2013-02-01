var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.transcript.parent");
_gg.Students = [];
_gg.Student = '';
_gg.schoolYear = '';
_gg.semester = '';


$(document).ready(function() {
    // TODO: 切換學年度學期
    $('.my-schoolyear-semester-widget').on("click", ".btn", function() {
        _gg.schoolYear = $(this).attr("school-year");
        _gg.semester = $(this).attr("semester");
        _gg.SetScoreData();
    });

    // TODO: 切換學生
    $('#children-list').on('click', 'a', function(e) {
        $('#children-list li[class=active]').removeClass('active');
        $(this).parent().addClass('active');
        _gg.Student = _gg.Students[$(this).attr('children-index')];
        var student = _gg.Student;
        _gg.GetSemsSubjScore();                         // TODO: 取得學期成績
    });

    // TODO: 取得學生資料
    _gg.connection.send({
        service: "_.GetStudentInfo",
        body: '',
        result: function(response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetStudentInfo', error);
            } else {
                var _ref;
                if (((_ref = response.Students) != null ? _ref.StudentInfo : void 0) != null) {
                    var student_list = [];
                    $(response.Students.StudentInfo).each(function(index, item) {
                        if (!_gg.Students[item.StudentID]) {
                            _gg.Students[item.StudentID] = item;
                        }
                        if (index === 0) {
                            _gg.Student = item;
                            var student = _gg.Student;
                            _gg.GetSemsSubjScore();                          // TODO: 取得學期成績
                        }
                        student_list.push('<li' + ((index === 0) ? ' class="active"' : '') + '><a href="#" children-index="' + item.StudentID + '">' + item.StudentName + '</a></li>');
                    });
                    $('#children-list').html(student_list.join(''));
                }
            }
        }
    });
});


// TODO: 處理畢業條件、各項學分資訊
_gg.SetStudentCreditData = function() {
    var student = _gg.Student;
    if (student.MySemsSubjScore) {
        // TODO: 學期對照表
        var items = [];
        $(student.SemsHistory.History.sort($.by('desc', 'SchoolYear', $.by('desc', 'Semester')))).each(function(key, item) {
            items.push("<button class='btn btn-large' grade-year='" + item.GradeYear + "' school-year='" + item.SchoolYear + "' semester='" + item.Semester + "'>" + item.SchoolYear + item.Semester + "</button>");
        });

        $(".my-schoolyear-semester-widget div").html(items.join(""));
        $(".my-schoolyear-semester-widget button:first").addClass("active").trigger('click');

        _gg.SetScoreData(); // TODO: 學年度成績資訊
    }
};


// TODO: 學年度成績資訊
_gg.SetScoreData = function() {
    _gg.ResetData();

    var student = _gg.Student;
    var SemsSubjScore = student.MySemsSubjScore;

    var items = [], itemNoDoamin = [], totalscore = [];

    // TODO: 本學期科目成績
    $.each(SemsSubjScore, function(index, item) {
        // TODO: 目前要顯示的學年度學期
        if (_gg.schoolYear === item.SchoolYear && _gg.semester === item.Semester) {

            var col_score = {};
            $.each(item.ScoreInfo.Domains.Domain, function(domainIndex, domainItem) {
                if (!col_score[domainItem.領域]) {
                    domainItem.subject = [];
                    col_score[domainItem.領域] = domainItem;
                }
            });

            $.each(item.ScoreInfo.SemesterSubjectScoreInfo.Subject, function(subjectIndex, subjectItem) {
                var  domainName = subjectItem.領域;
                if (!domainName) {
                    domainName = '無領域';
                }

                if (!col_score[domainName]) {
                    col_score[domainName] = {
                        '領域'    :domainName,
                        subject : []
                    }
                    col_score[domainName].subject = [];
                }

                col_score[domainName].subject.push(subjectItem);
            });

            // TODO: 領域成績
            $.each(col_score, function(domainIndex, domainItem) {
                var intDomainScore = parseInt((domainItem.成績 || '0'), 10);

                var domainClassification = '';

                var domainScore, domainPass;
                if (domainItem.成績) {
                    if (intDomainScore >= 60) {
                        domainScore = '<td>' + (domainItem.成績 || '') + '</td>';
                        domainPass = '<i class="icon-ok"></i>';
                    } else {
                        domainScore = '<td class="my-lost-credit">' + (domainItem.成績 || '') + '</td>';
                        domainPass = '<i class="icon-remove"></i>';
                    }
                } else {
                    domainScore = '<td></td>';
                    domainPass = '';
                }

                var domainPeriod = (domainItem.節數 || '');
                var domainWeight = (domainItem.權數 || '');
                var domainPeriod_Weight = domainPeriod;

                if (domainPeriod !== domainWeight) {
                    domainPeriod_Weight += '/' + domainWeight;
                }

                var domainName = domainItem.領域;

                if (domainName === '無領域') {
                    itemNoDoamin.push('<thead><tr><td colspan="6">以下為彈性課程</td></tr></thead>');
                } else {
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
                }

                // TODO: 科目成績
                $.each(domainItem.subject, function() {
                    var tmp_item = [];
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

                    tmp_item.push('<tbody>');
                    tmp_item.push('<tr>');
                    tmp_item.push('<td>&nbsp;</td>');
                    tmp_item.push('<td>' + (tmp_semsSubjScore.SubjectName || '') + '</td>');
                    tmp_item.push('<td>' + period_Weight + '</td>');
                    tmp_item.push(score);
                    tmp_item.push('<td>' + (tmp_semsSubjScore.Description || '') + '</td>');
                    tmp_item.push('<td>' + pass + '</td>');
                    tmp_item.push('</tr>');
                    tmp_item.push('</tbody>');

                    if (domainName === '無領域') {
                        itemNoDoamin.push(tmp_item);
                    } else {
                        items.push(tmp_item);
                    }
                });
            });

            // TODO: 總成績
            var LearnDomainScore = item.ScoreInfo.LearnDomainScore;
            var CourseLearnScore = item.ScoreInfo.CourseLearnScore;
            var intLearnDomainScore = parseInt((LearnDomainScore || '0'), 10);
            var intCourseLearnScore = parseInt((CourseLearnScore || '0'), 10);

            var css1 = '', css2 = '';
            if (intLearnDomainScore < 60) {
                css1 = ' my-lost-credit';
            }
            if (intCourseLearnScore < 60) {
                css2 = ' my-lost-credit';
            }

            totalscore.push(
                '<table class="my-table my-table-bordered my-well-table-striped">' +
                '  <tbody>' +
                '    <tr>' +
                '      <th class="my-scorename">學期領域成績(七大學習領域)</th>' +
                '      <td class="my-totalscore' + css1 + '">' + (LearnDomainScore || '') + '</td>' +
                '      <th class="my-scorename">課程學習成績(含彈性課程)</th>' +
                '      <td class="my-totalscore' + css2 + '">' + (CourseLearnScore || '') + '</td>' +
                '    </tr>' +
                '  </tbody>' +
                '</table>'
            );

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

    var html = items.join('') + itemNoDoamin.join('');

    if (html) {
        html = main_thead + html;
    } else {
        html = main_thead + '<tbody><tr><td colspan="6">無資料</td></tr></tbody>';
    }

    $("#SubjectScore table").html(html);
    $("#SubjectTotalScore").html(totalscore.join(''));
};


// TODO: 取得學期成績
_gg.GetSemsSubjScore = function(schoolYear, semester) {
    var student = _gg.Student;
    _gg.connection.send({
        service: "_.GetSemsSubjScore",
        body: '<Request><Condition><StudentID>' + student.StudentID + '</StudentID></Condition></Request>',
        result: function(response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetSemsSubjScore', error);
            } else {
                student.MySemsSubjScore = response.Students.SemsSubjScore;
                _gg.SetStudentCreditData();
            }
        }
    });
};


// TODO: 清除資訊
_gg.ResetData = function() {
    // TODO: 本學期科目成績
    $("#SubjectScore tbody").html('');
    $('#SubjectTotalScore').html('');
};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.message) {
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
};