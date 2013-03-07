jQuery(function () {
    _gg.on_init();
    //     .on('click', 'table[data-type=all] tbody tr', function() {
    //         $('#sall table[data-type=all]').animate(
    //             {left:-$(this).width() * 2}
    //             , 500
    //             , function() {
    //                 $(this).hide();
    //                 $('#sall div.my-detail').css({left:0}).show();
    //             }
    //         );
    //         _gg.studentid = $(this).attr('studentid');
    //         _gg.GetStudentDetail();
    //     })

    $('#tab_survey_list').on('click', 'a[data-index]', function() {
            var index = $(this).attr('data-index');
            _gg.load_form(index);
        });
    $('#tab_form')
        .on('click', 'button[data-action=preview]', function() {
            if ($('#form1').valid()) {
                // TODO: 驗證通過
            } else {
                _gg.set_error_message('#mainMsg', '', '資料驗證失敗，請重新檢查！');
            }
        })

    //#region 驗證提示樣式設定
    $.validator.setDefaults({
        debug: true, // 為 true 時不會 submit
        errorElement: "span", //錯誤時使用元素
        errorClass: "help-inline", //錯誤時使用樣式
        highlight: function(element) {
            // 將未通過驗證的表單元素設置高亮度
            $(element).parentsUntil('.control-group').parent().addClass("error");
        },
        unhighlight: function(element) {
            // 與 highlight 相反
            $(element).parentsUntil('.control-group').parent().removeClass("error");
        },
        errorPlacement: function (error, element) {
            // 錯誤標籤的顯示位置
            error.insertAfter(element);
        }
    });
    //#endregion
});


var _gg = function() {
    var connection = gadget.getContract("emba.survey.student"),
        school_year,
        semester,
        surveylist = [],
        courses = [],
        questions = [],
        curr_survey;

    //#region 取得學年度學期
    var getCurrentSemester = function() {
        connection.send({
            service: "_.GetCurrentSemester",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetCurrentSemester', error);
                } else {
                    if ((_ref = response.Current) != null) {
                        $(response.Current).each(function(index, item) {
                            school_year = item.SchoolYear;
                            semester = item.Semester;
                        });
                    }
                    initialize();
                }
            }
        });
    };
    //#endregion

    //#region 填寫狀態
    var getStatus= function(_item, _index) {
        switch(_item.ReplyStatus) {
            case '0':
                return '<td><a href="javascript: void(0);" class="btn btn-warning" data-index="' + _index + '">暫存</a></td>';
                break;
            case '1':
                return '<td><span class="btn disabled">已完成</span></td>';
                break;
            default:
                return '<td><a href="javascript: void(0);" class="btn btn-danger" data-index="' + _index + '">尚未填寫</a></td>';
        }
    };
    //#endregion

    //#region 取得問卷
    var getSurveyList = function(_schoolyear, _semester) {
        connection.send({
            service: "_.GetSurvey",
            body: {
                Request: {
                    Condition: {
                        SchoolYear: _schoolyear || '',
                        Semester: _semester || ''
                    }
                }
            },
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetSurvey', error);
                } else {
                    var _ref, items = [];
                    if (((_ref = response.Response) != null ? _ref.Survey : void 0) != null) {
                        surveylist = response.Response.Survey;
                        $(response.Response.Survey).each(function(index, item) {
                            // TODO: 填寫評鑑鈕
                            var status_html = getStatus(item, index);
                            items.push(
                                '<tr>' +
                                '  <td>' + (item.CourseName || '') + '</td>' +
                                '  <td>' + (item.TeacherName || '') + '</td>' +
                                '  <td>' + (item.OpeningTime || '') + ' ~ ' + (item.EndTme || '') +'</td>' +
                                status_html +
                                '</tr>'
                            );
                        });
                    }
                    if (items.length > 0) {
                        $('#tab_survey_list tbody').html(items.join(''));
                    } else {
                        $('#tab_survey_list tbody').html('<tr><td colspan="4">目前無資料</td></tr>');
                    }
                }
            }
        });
    };
    //#endregion

    //#region 取得課程資訊
    var getCourseInfo = function(_course_id) {
        if (_course_id) {
            if (!courses[_course_id]) {
                courses[_course_id] = [];
                connection.send({
                    service: "_.GetCourseInfo",
                    body: {
                        Request: {
                            Condition: {
                                CourseID: _course_id
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetCourseInfo', error);
                        } else {
                            var _ref;
                            if (((_ref = response.Response) != null ? _ref.Course : void 0) != null) {
                                courses[_course_id] = response.Response.Course;
                            }
                            show_FormCurseInfo(courses[_course_id]);
                        }
                    }
                });
            } else {
                show_FormCurseInfo(courses[_course_id]);
            }
        }
    };
    //#endregion

    //#region 取得題目及選項及個案
    var show_question = function(_survey_id, _course_id, _teacher_id) {
        var req_q, req_c, that_questions, that_case;
        var processQuestion = function() {
            if (req_q && req_c) {
                var down_question = [], top_question = [], unique;

                //#region 選項
                var get_option = function(item, unique) {
                    var validate_css = (item.IsRequired === 't' ? 'required' : '');
                    var tmp_html = [];
                    tmp_html.push('<td data-qid="' + (item.QuestionID || '') + '">');
                    switch (item.Type) {
                        case '單選題':
                            $(item.Options).each(function(order, value) {
                                tmp_html.push(
                                    '<label class="radio">' +
                                    '<input type="radio" name="q' + (unique || '') + '" class="' + validate_css + '" value="' + (value.OptionTitle || '') + '">' + (value.OptionTitle || '') +
                                    '</label>'
                                );
                            });
                            break;
                        case '問答題':
                            tmp_html.push('<textarea name="q' + (unique || '') + '" rows="5" class="' + validate_css + ' input-xxlarge"></textarea>');
                            break;
                    }

                    tmp_html.push('</td>');
                    return tmp_html.join('');
                };
                //#endregion

                $(that_questions).each(function(index, item) {
                    var question_html = '', idx;

                    if (item.IsSelfAssessment === 't') {
                        idx = top_question.length + 1;
                    } else {
                        idx = down_question.length + 1;
                    }

                    //#region 題目
                    if (item.IsCase === 't') {
                        // 個案題
                        question_html = '<tr class="my-iscase"><th colspan="2">' +
                            (item.IsRequired === 't' ? '<span class="text-error">*</span>' : '') +
                            idx + '.' +
                            (item.QuestionTitle || '') + '</th></tr>';

                        $(that_case).each(function(key, data) {
                            unique = 'q' + item.QuestionID + data.CaseID;
                            question_html += '<tr class="my-iscase">' +
                                '<td class="my-casename">' + data.CaseName + '</td>' + get_option(item, unique) + '</tr>';
                        });
                    } else {
                        // 其他
                        unique = 'q' + item.QuestionID;
                        question_html = '<tr><td>' +
                            (item.IsRequired === 't' ? '<span class="text-error">*</span>' : '') +
                            idx + '.' +
                            (item.QuestionTitle || '') + '</td>' +
                            get_option(item, unique) +
                            '</tr>';
                    }
                    //#endregion

                    //#region 完整的題目
                    if (item.IsSelfAssessment === 't') {
                        // TODO: 置頂
                        top_question.push(question_html);
                    } else {
                        down_question.push(question_html);
                    }
                    //#endregion
                });
                $('#tab_form tbody[data-type=questions]').html(top_question.join('') + down_question.join(''));
            }
        };

        if (_survey_id && _course_id && _teacher_id) {
            //#region 取得個案
            connection.send({
                service: "_.GetCourseTeacherCase",
                body: {
                    Request: {
                        Condition: {
                            CourseID: _course_id,
                            TeacherID: _teacher_id
                        },
                        Order: {
                            CaseID: 'asc'
                        }
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetCourseTeacherCase', error);
                    } else {
                        var _ref; that_case = [];
                        if (((_ref = response.Response) != null ? _ref.Case : void 0) != null) {
                            $(response.Response.Case).each(function(index, item) {
                                that_case.push({
                                    CaseID : item.CaseID,
                                    CaseName : item.CaseName
                                });
                            });
                        }
                        req_c = true;
                        processQuestion();
                    }
                }
            });
            //#endregion

            //#region 取得題目及選項
            if (!questions[_survey_id]) {
                var tmp = questions[_survey_id] = [];
                connection.send({
                    service: "_.GetQuestion",
                    body: {
                        Request: {
                            Condition: {
                                SurveyID: _survey_id
                            },
                            Order: {
                                QuestionOrder: 'asc', OptionOrder: 'asc'
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetQuestion', error);
                        } else {
                            var _ref, col_q = [];
                            if (((_ref = response.Response) != null ? _ref.Question : void 0) != null) {
                                $(response.Response.Question).each(function(index, item) {
                                    if ($.inArray(item.QuestionID, col_q) === -1) {
                                        col_q.push(item.QuestionID);
                                        tmp.push({
                                            QuestionID       : item.QuestionID,
                                            QuestionOrder    : item.QuestionOrder,
                                            IsCase           : item.IsCase,
                                            IsRequired       : item.IsRequired,
                                            IsSelfAssessment : item.IsSelfAssessment,
                                            QuestionTitle    : item.QuestionTitle,
                                            Type             : item.Type,
                                            Options          : []
                                        });
                                    }
                                    var curr_id = $.inArray(item.QuestionID, col_q);
                                    tmp[curr_id].Options.push({
                                        OptionOrder : item.OptionOrder,
                                        OptionTitle : item.OptionTitle
                                    });
                                });
                            }
                            req_q = true;
                            that_questions = tmp;
                            processQuestion();
                        }
                    }
                });
            } else {
                req_q = true;
                that_questions = questions[_survey_id];
                processQuestion();
            }
            //#endregion
        }
    };
    //#endregion

    //#region 錯誤訊息
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
    };
    //#endregion

    //#region 顯示初始畫面
    var initialize = function() {
        if (school_year && semester) {
            $('#tabName').html(school_year + '學年度' + (semester === '0' ? '暑期' : '第' + semester + '學期'));
            getSurveyList(school_year, semester);
        }
    };
    //#endregion

    //#region 顯示填寫畫面的課程資訊
    var show_FormCurseInfo = function(_course) {
        var teacher_name, description, items = [];
        teacher_name = curr_survey.TeacherName;
        description = curr_survey.Description;

        items.push(
            '<tr class="my-table">' +
                '<td>' + (_course.NewSubjectCode || '') + '</td>' +
                '<td>' + (_course.CourseName || '') + '</td>' +
                '<td>' + (teacher_name || '') + '</td>' +
                '<td>' + (_course.StudentCount || '') + '</td>' +
            '</tr>'
        );
        $('#tab_form tbody[data-type=title]').html(items.join(''));
        $('#tab_form tbody[data-type=note]').html(description || '');
    };
    //#endregion

    //#region 回傳值
    return {
        on_init: function() {
            getCurrentSemester();
            initialize();
        },
        load_form: function(_index) {
            var _course_id, _teacher_id, _survey_id;
            curr_survey = surveylist[_index];

            if (curr_survey) {
                _course_id = curr_survey.CourseID;
                _teacher_id = curr_survey.TeacherID;
                _survey_id = curr_survey.SurveyID;
            }
            getCourseInfo(_course_id);
            show_question(_survey_id, _course_id, _teacher_id);
        },
        load_preview: function() {

        },
        set_error_message: function(select_str, serviceName, error) {
            set_error_message(select_str, serviceName, error);
        }
    };
    //#endregion
}();
