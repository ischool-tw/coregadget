jQuery(function () {
    $("#ExamScore tbody").html('<tr><td>載入中...</td></tr>');

    // TODO: 切換學年度學期
    $("#Semester").on('click', '.btn', function(event) {
        var schoolYear = $(this).attr("school-year");
        var semester = $(this).attr("semester");
        Exam.score(schoolYear, semester);
        $('.tooltip').remove();
    });
});


var Exam = function() {
    var connection = gadget.getContract("ischool.exam.student");
    var _curr_schoolyear
        , _curr_semester
        , _exam
        , _system_type = 'kh'
        , _places
        , _math_type;

    var getCurrSemester = function() {
        connection.send({
            service: "_.GetCurrentSemester",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetCurrentSemester', error);
                } else {
                    if (response.Current) {
                        _curr_schoolyear = response.Current.SchoolYear || '';
                        _curr_semester = response.Current.Semester || '';
                    }
                    resetSchoolYearSeme();
                }
            }
        });
    };

    var resetSchoolYearSeme = function() {
        connection.send({
            service: "_.GetScoreCalcRule",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetScoreCalcRule', error);
                } else {
                    if (response.ScoreCalcRule
                        && response.ScoreCalcRule.Content
                        && response.ScoreCalcRule.Content.ScoreCalcRule
                        && response.ScoreCalcRule.Content.ScoreCalcRule['成績計算規則']
                        && response.ScoreCalcRule.Content.ScoreCalcRule['成績計算規則']['各項成績計算位數']
                        && response.ScoreCalcRule.Content.ScoreCalcRule['成績計算規則']['各項成績計算位數']['科目成績計算']) {
                        var obj = response.ScoreCalcRule.Content.ScoreCalcRule['成績計算規則']['各項成績計算位數']['科目成績計算'];
                        _places = obj['位數'] || 0;
                        switch (obj['進位方式']) {
                            case '無條件進位':
                                _math_type = 'ceil';
                                break;
                            case '無條件捨去':
                                _math_type = 'floor';
                                break;
                            case '四捨五入':
                                _math_type = 'round';
                                break;
                        }
                    }

                    connection.send({
                        service: "_.GetAllCourseSemester",
                        body: '',
                        result: function (response, error, http) {
                            if (error !== null) {
                                set_error_message('#mainMsg', 'GetAllCourseSemester', error);
                            } else {
                                var _ref;
                                if (((_ref = response.Course) != null ? _ref.Semester : void 0) != null) {
                                    var items = [];
                                    $(response.Course.Semester).each(function(index, item) {
                                        items.push("<button class='btn btn-large' school-year='" + this.SchoolYear + "' semester='" + this.Semester + "'>" + (this.SchoolYear + '' + this.Semester) + "</button>");
                                    });
                                    $("#Semester .btn-group").html(items.join("")).find('.btn:first').trigger('click');
                                } else {
                                    $("#ExamScore tbody").html('<tr><td>目前無資料</td></tr>');
                                }
                            }
                        }
                    });

                }
            }
        });
    };

    var resetData = function() {
        $("#ExamScore thead").html('');
        $("#ExamScore tbody").html('');
    };

    //#region 取得評量成績
    var loadScore = function(schoolYear, semester) {
        connection.send({
            service: "_.GetJHCourseExamScore",
            body: {
                Content: {
                    Condition: {
                        SchoolYear: schoolYear,
                        Semester: semester
                    },
                    Field: {
                        Subject: '',
                        Extension: ''
                    }
                }
            },
            result: function(response, error, http) {
                if ($('#Semester button.active').attr('school-year') === schoolYear && $('#Semester button.active').attr('semester') === semester) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetJHCourseExamScore', error);
                    } else {
                        // 解析樣版產出 exam_list
                        // 高雄有固定的平時成績，OrdinarilyScore為其成績，FixTime是繳交期限
                        // 新竹每次皆有對等的定期、平時成績，AssignmentScore為其成績，EndTime是繳交期限
                        // 如為目前學年度學期，如在繳交期限前不顯示
                        var isCurrSemester = false;
                        var exam_list = [];
                        var courses = [];
                        var thead1 = [], thead2 = [], thead_html = '';
                        var tbody1 = [], tbody_html = '';

                        var getIndex = function(cid, exams){
                            var ret;
                            $(exams).each(function(index, item){
                                if (item.ExamID === cid) {
                                    ret = item;
                                }
                            });
                            return ret;
                        };

                        if (response.ExamScoreList && response.ExamScoreList.Seme) {
                            isCurrSemester = (schoolYear === _curr_schoolyear && semester === _curr_semester);
                            if (response.ExamScoreList.Seme.Course) {
                                $(response.ExamScoreList.Seme.Course).each(function(index, course) {
                                    $(course.Exam).each(function(index, exam) {
                                        if ($.inArray(exam.ExamID, exam_list) === -1) {
                                            exam_list.push(exam.ExamID);
                                            thead1.push('<th colspan="2">' + exam.ExamName + '</th>');
                                            thead2.push('<th colspan="2">成績</th>');
                                        }
                                    });
                                });

                                $(response.ExamScoreList.Seme.Course).each(function(index, course) {
                                    tbody1.push('<tr><th>' + course.CourseName + '</th>');

                                    var pre_score = -999;
                                    $(exam_list).each(function(key, value) {
                                        var tmp_obj = {};
                                        var now, endtime, show_data = true;
                                        var exam = getIndex(value, course.Exam);
                                        var extension;
                                        var ext_score, ext_text, ext_assignmentScore, avg_score, td_score;

                                        if (exam) {
                                            if (isCurrSemester) {
                                                if (exam.ScoreDetail && exam.ScoreDetail.EndTime) {
                                                    var now = new Date();
                                                    var endtime  = new Date(exam.ScoreDetail.EndTime);

                                                    if (endtime >= now) {
                                                        show_data = false;
                                                    }
                                                }
                                            }
                                            if (exam.ScoreDetail && exam.ScoreDetail.Extension && show_data) {
                                                extension = exam.ScoreDetail.Extension.Extension;
                                                switch (_system_type) {
                                                    case 'kh':
                                                        // 高雄的分數評量
                                                        ext_score = extension.Score || '';
                                                        avg_score = parseInt(ext_score, 10);
                                                        td_score = (ext_score) ? Number(avg_score).toFixed(_places) : '';
                                                        break;
                                                    case 'hs':
                                                        // 新竹定期分數
                                                        ext_score = extension.Score || '';
                                                        // 新竹平時分數
                                                        ext_assignmentScore = extension.AssignmentScore || '';
                                                        if (ext_score && ext_assignmentScore) {
                                                            avg_score = FloatMath(FloatDiv(FloatAdd(ext_score, ext_assignmentScore), 2), _math_type, _places);
                                                            td_score = '<span class="my-avg-score">' + Number(avg_score).toFixed(_places) + '</span>'
                                                                + ' (' + ext_score
                                                                + ' / ' + ext_assignmentScore
                                                                + ')';
                                                        } else if (ext_score) {
                                                            avg_score = parseInt(ext_score, 10);
                                                            td_score = (ext_score) ? Number(avg_score).toFixed(_places) : '';
                                                        } else {
                                                            avg_score = parseInt(ext_assignmentScore, 10);
                                                            td_score = (ext_assignmentScore) ? Number(avg_score).toFixed(_places) : '';
                                                        }
                                                        break;
                                                }

                                                // 顯示成績，未達60分以紅色表示
                                                if (avg_score && avg_score < 60) {
                                                    tbody1.push('<td class="my-fail" my-data="' + exam.ExamID + '">' + td_score + '</td>');
                                                } else {
                                                    tbody1.push('<td my-data="' + exam.ExamID + '">' + td_score + '</td>');
                                                }

                                                // TODO: 除了科目為「體育」和第一次考試，皆與上次比較進退步
                                                if (course.Subject === '體育' || pre_score === -999) {
                                                    tbody1.push('<td>&nbsp;</td>');
                                                } else {
                                                    if (avg_score > pre_score) {
                                                        tbody1.push('<td><span class="my-progress">↑</span></td>');
                                                    } else if (avg_score < pre_score) {
                                                        tbody1.push('<td><span class="my-regress">↓</span></td>');
                                                    } else {
                                                        tbody1.push('<td>&nbsp;</td>');
                                                    }
                                                }
                                                pre_score = avg_score;

                                            } else if (show_data === false) {
                                                tbody1.push('<td colspan="2"' +
                                                    ' rel="tooltip"' +
                                                    ' title="' + (exam.ScoreDetail.EndTime ? exam.ScoreDetail.EndTime + '後開放' : '尚未開放') + '"' +
                                                    '>未開放</td>'
                                                );
                                            } else {
                                                tbody1.push('<td></td><td></td>');
                                            }
                                        } else {
                                            tbody1.push('<td></td><td></td>');
                                        }
                                    });

                                    if (_system_type === 'kh') {
                                        var now, fixenddate, show_fix = true, fix_score;
                                        if (isCurrSemester) {
                                            if (course.FixTime && course.FixTime.Extension && course.FixTime.Extension.OrdinarilyEndTime) {
                                                now = new Date();
                                                fixenddate  = new Date(course.FixTime.Extension.OrdinarilyEndTime);

                                                if (fixenddate >= now) {
                                                    show_fix = false;
                                                }
                                            }
                                        }

                                        if (show_fix) {
                                            if (course.FixExtension && course.FixExtension.Extension && course.FixExtension.Extension.OrdinarilyScore) {
                                                fix_score = course.FixExtension.Extension.OrdinarilyScore;
                                                if (fix_score) {
                                                    if (parseInt(fix_score, 10) < 60) {
                                                        tbody1.push('<td class="my-fail" my-data="Ordinarily">' + Number(fix_score).toFixed(_places) + '</td>');
                                                    } else {
                                                        tbody1.push('<td my-data="Ordinarily">' + Number(fix_score).toFixed(_places) + '</td>');
                                                    }
                                                } else {
                                                    tbody1.push('<td></td>');
                                                }
                                            } else {
                                                tbody1.push('<td></td>');
                                            }
                                        } else {
                                            tbody1.push('<td></td>');
                                        }
                                    }

                                    tbody1.push('</tr>');
                                });
                            }

                            switch (_system_type) {
                                case 'kh':
                                    thead_html = '<tr class="my-nofill"><th rowspan="2">課程名稱</th>' + thead1.join('') + '<th>平時評量</th></tr>';
                                    thead_html += '<tr class="my-nofill">' + thead2.join('') + '<th>成績</th></tr>';
                                    break;
                                default:
                                    thead_html = '<tr class="my-nofill"><th rowspan="2">課程名稱</th>' + thead1.join('') + '</tr>';
                                    thead_html += '<tr class="my-nofill">' + thead2.join('') + '</tr>';
                            }

                            tbody_html = tbody1.join('');
                            $("#ExamScore").find('thead').html(thead_html)
                                .end().find('tbody').html(tbody_html)
                                .end().find('td[rel="tooltip"]').tooltip();
                        } else {
                            $("#ExamScore").find('thead').html('').end().find('tbody').html('<tr><td>目前無資料</td></tr>');
                        }
                    }
                }
            }
        });
    };
    //#endregion

    //#region 錯誤訊息
    set_error_message = function(select_str, serviceName, error) {
        var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
        if (error !== null) {
            if (error.dsaError) {
                if (error.dsaError.status === "504") {
                    switch (error.dsaError.message) {
                        case '501':
                            tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                            break;
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
    };
    //#endregion

    //浮點數相加
    var FloatAdd = function(arg1, arg2) {
        var r1, r2, m;
        try { r1 = arg1.toString().split(".")[1].length; } catch (e) { r1 = 0; }
        try { r2 = arg2.toString().split(".")[1].length; } catch (e) { r2 = 0; }
        m = Math.pow(10, Math.max(r1, r2));
        return (FloatMul(arg1, m) + FloatMul(arg2, m)) / m;
    };
    //浮點數相除
    var FloatDiv = function(arg1, arg2) {
        var t1 = 0, t2 = 0, r1, r2;
        try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
        try { t2 = arg2.toString().split(".")[1].length } catch (e) { }
        with (Math) {
            r1 = Number(arg1.toString().replace(".", ""))
            r2 = Number(arg2.toString().replace(".", ""))
            return (r1 / r2) * pow(10, t2 - t1);
        }
    };
    //浮點數相乘
    var FloatMul = function(arg1, arg2) {
        var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try { m += s1.split(".")[1].length; } catch (e) { }
        try { m += s2.split(".")[1].length; } catch (e) { }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
    }
    //四捨五入、無條件捨去、無條件進位
    var FloatMath = function(arg1, type, places) {
        places = places || 0;
        switch (type) {
            case 'ceil':
                return (Math.ceil(arg1 * Math.pow(10, places))) / Math.pow(10, places); //無條件進位
            case 'floor':
                return (Math.floor(arg1 * Math.pow(10, places))) / Math.pow(10, places); //無條件捨去
            case 'round':
                return (Math.round(arg1 * Math.pow(10, places))) / Math.pow(10, places); //四捨五入
            default:
                return arg1;
        }
    };

    getCurrSemester();

    return {
        'score' : function(schoolYear, semester) {
            loadScore(schoolYear, semester);
        }

    }
}();