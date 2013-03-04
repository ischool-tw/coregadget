jQuery(function () {
    _gg.on_init();

    $('#tab_survey_list').on('click', 'a[data-index]', function() {
        var index = $(this).attr('data-index');
        _gg.load_form(index);

        $('#tab_survey_list').hide();
        $('#tab_form').show();
    });

    $('#tab_form')
        .hide().find('[data-type=preview]').hide().end()
        .on('click', '[data-action=form_cancel]', function() { formCancel(); })
        .on('click', '[data-action=preview_cancel]', function() { previewCancel(); })
        .on('click', 'button[data-action=preview]', function() {
            $('#mainMsg').html('');
            if ($('#form1').valid()) {
                // TODO: 驗證通過，預覽
                previewClick();
            } else {
                $('tr.error:first').find('textarea, input').first().focus();
                _gg.set_error_message('#mainMsg', '', '資料驗證失敗，請重新檢查！');
            }
        })
        .on('click', 'button[data-action=temp]', function() {
            $('#mainMsg').html('');
            _gg.saveReply('0', getReply2Obj());
        });
    $('#save-data').click(function() {
        $("#save-data").button('loading'); // 按鈕設為處理中
        _gg.saveReply('1', getReply2Obj());
    });

    //#region 將結果轉成物件
    var getReply2Obj = function() {
        var reply = {
            'Answers':[]
        };
        $('#tab_form td[data-qid]').each(function(index, val) {
            var tmp = {
                'Question':{
                    '@'          : ['QuestionID'],
                    'QuestionID' : $(this).attr('data-qid') || '',
                    'Answer'     : []
                }
            }
            $(this).each(function(index, val) {
                $(val).find('input[data-caseid]:checked, textarea').each(function(index, item) {
                    tmp.Question.Answer.push({
                        '@text'  : $(item).val() || '',
                        '@'      : ['CaseID'],
                        'CaseID' : $(item).attr('data-caseid') || ''
                    });
                });
            });
            reply.Answers.push(tmp);
        });
        return reply;
    };
    //#endregion

    //#region 預覽
    var previewClick = function() {
        $('#tab_form')
            .find('[data-type=form]').hide().end()
            .find('[data-type=preview]').show().end()
            .find('form')
            .find('input:radio').each(function(){
                $(this).hide();
                if (!this.checked) {
                    $(this).parent('label').hide();
                }
            }).end()
            .find('textarea').hide().each(function(){
                $(this).after('<span data-type="preview">' + $(this).val() + '</span>');
            });
    };
    //#endregion

    //#region 返回編輯
    var previewCancel = function() {
        $('#mainMsg').html('');
        $('#tab_form')
            .find('[data-type=form]').show().end()
            .find('[data-type=preview]').hide().end()
            .find('form')
            .find('label, input:radio').each(function(){
                $(this).show();
            }).end()
            .find('textarea').show().each(function(){
                $(this).find('span[data-type=preview]').remove();
            });
    };
    //#endregion

    //#region 返回評鑑列表
    var formCancel = function() {
        $('#mainMsg').html('');
        $('#tab_form').hide();
        $('#tab_survey_list').show();
    };
    //#endregion

    //#region 驗證提示樣式設定
    $.validator.setDefaults({
        debug: true, // 為 true 時不會 submit
        errorElement: "span", //錯誤時使用元素
        errorClass: "help-inline", //錯誤時使用樣式
        highlight: function(element) {
            // 將未通過驗證的表單元素設置高亮度
            $(element).parentsUntil('tr').parent('tr').addClass("error");
        },
        unhighlight: function(element) {
            // 與 highlight 相反
            $(element).parentsUntil('tr').parent('tr').removeClass("error");
        },
        errorPlacement: function (error, element) {
            // 錯誤標籤的顯示位置
            if (element.is(':radio') || element.is(':checkbox')) {
                error.appendTo(element.closest('td'));
            }
            else {
                error.insertAfter(element);
            }
        }
    });
    //#endregion
});


var _gg = function() {
    var connection = gadget.getContract("emba.survey.student"),
        student_name,
        school_year,
        semester,
        surveylist = [],
        courses = [],
        questions = [],
        curr_survey,
        conn_log = gadget.getContract("emba.student");

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

    //#region 取得個人基本資料
    var getMyInfo = function() {
        connection.send({
            service: "_.GetMyInfo",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetMyInfo', error);
                } else {
                    if ((_ref = response.StudentInfo) != null) {
                        $(response.StudentInfo).each(function(index, item) {
                            student_name = item.StudentName;
                        });
                    }
                }
            }
        });
    };
    //#endregion

    //#region 填寫狀態
    var getStatus = function(_status, _index) {
        switch(_status) {
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
                            var status_html;

                            if (item.ReplyStatus !== '1') {
                                if (item.OpeningTime && item.EndTme) {
                                    var tmp_Date  = new Date();
                                    var Startdate = new Date(item.OpeningTime);
                                    var Enddate   = new Date(item.EndTme);

                                    if (Startdate <= tmp_Date && Enddate >= tmp_Date) {
                                        status_html = getStatus(item.ReplyStatus, index);
                                    } else {
                                        status_html = '<td>未開放登錄</td>';
                                    }
                                }
                            } else {
                                status_html = getStatus(item.ReplyStatus, index);
                            }
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
    var show_question = function(_curr_survey) {
        $('#tab_form tbody[data-type=questions]').html('');
        if (curr_survey) {
            var _course_id = curr_survey.CourseID,
                _teacher_id = curr_survey.TeacherID,
                _survey_id = curr_survey.SurveyID,
                _reply_answer =  curr_survey.ReplyAnswer,
                _reply_status = curr_survey.ReplyStatus,
                req_q, req_c, that_questions, that_case;

            var processQuestion = function() {
                if (req_q && req_c) {
                    var down_question = [], top_question = [];

                    //#region 選項
                    var get_option = function(item, _caseid) {
                        var validate_css = (item.IsRequired === 't' ? 'required' : '');
                        var unique = 'q' + (item.QuestionID || '') + (_caseid || '');
                        var tmp_html = [];
                        tmp_html.push('<td data-qid="' + (item.QuestionID || '') + '">');

                        switch (item.Type) {
                            case '單選題':
                                $(item.Options).each(function(order, value) {
                                    tmp_html.push(
                                        '<label class="radio">' +
                                        '<input type="radio" name="' + unique + '" class="' + validate_css + '"' +
                                        ' data-caseid="' + _caseid + '"' +
                                        ' value="' + (value.OptionTitle || '') + '">' + (value.OptionTitle || '') +
                                        '</label>'
                                    );
                                });
                                break;
                            case '問答題':
                                tmp_html.push('<textarea name="' + unique + '" rows="5" class="' + validate_css + ' input-xxlarge"' +
                                    ' data-caseid="' + _caseid + '"' +
                                    '></textarea>');
                                break;
                        }

                        tmp_html.push('</td>');
                        return tmp_html.join('');
                    };
                    //#endregion

                    if (that_questions.length > 0) {
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
                                    question_html += '<tr class="my-iscase">' +
                                        '<td class="my-casename">' + data.CaseName + '</td>' + get_option(item, data.CaseID) + '</tr>';
                                });
                            } else {
                                // 其他
                                question_html = '<tr><td>' +
                                    (item.IsRequired === 't' ? '<span class="text-error">*</span>' : '') +
                                    idx + '.' +
                                    (item.QuestionTitle || '') + '</td>' +
                                    get_option(item, '') +
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
                        var tbody = $('#tab_form tbody[data-type=questions]');
                        tbody.html(top_question.join('') + down_question.join(''));

                        //#region 設定預設值
                        if (_reply_answer.Answers) {
                            $(_reply_answer.Answers).each(function(index, question) {
                                $(question.Question).each(function(key, answer) {
                                    var caseid, option,
                                        qid = answer.QuestionID || '';
                                    $(answer.Answer).each(function(a, b) {
                                        caseid = b.CaseID || '';
                                        option = b['@text'] || '';
                                        $('input[name=q' + qid + caseid + ']', tbody).filter('[value="' + option + '"]').prop('checked', true);
                                        $('textarea[name=q' + qid + caseid + ']', tbody).val(option);
                                    });
                                });
                            });
                        }
                        //#endregion
                    } else {
                        var tbody = $('#tab_form tbody[data-type=questions]').html('<tr><td colspan="2">目前無題目</td></tr>');
                    }
                }
            };

            if (_reply_status === '1') {
                // 已送出
                $('#tab_form tbody[data-type=questions]').html('<tr><td colspan="2">本評鑑已作答</td></tr>');
            } else {
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
            }
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
                                tmp_msg = '<strong>很抱歉，您無存取資料權限！</strong>';
                                break;
                            case '502':
                                tmp_msg = '<strong>很抱歉，目前未開放！</strong>';
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
        set_error_message: function(select_str, serviceName, error) {
            set_error_message(select_str, serviceName, error);
        },
        on_init: function() {
            getCurrentSemester();
            getMyInfo();
            initialize();
        },
        load_form: function(_index) {
            $('#tab_form').find('[data-type=form]').show().end().find('[data-type=preview]').hide();
            var _course_id;
            curr_survey = surveylist[_index];
            if (curr_survey) {
                curr_survey.idx = _index;
                _course_id = curr_survey.CourseID;
                getCourseInfo(_course_id);
                show_question(curr_survey);
            }
        },
        //#region 儲存評鑑結果
        saveReply: function(_status, _answer) {
            if (curr_survey) {
                connection.send({
                    service: "_.SetReply",
                    body: {
                        'Request':{
                            'Reply':{
                                'Field':{
                                    'Answer': _answer || '',
                                    'Status': _status || ''
                                },
                                'Condition':{
                                    'CourseID'  : curr_survey.CourseID || '',
                                    'SurveyID'  : curr_survey.SurveyID || '',
                                    'TeacherID' : curr_survey.TeacherID || ''
                                }
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            set_error_message('#mainMsg', 'SetReply', error);
                        } else {
                            curr_survey.ReplyAnswer = _answer;
                            curr_survey.ReplyStatus = _status;
                            $('#tab_survey_list td').has('a[data-index=' + curr_survey.idx + ']').after(getStatus(_status, curr_survey.idx)).remove();
                            $("#save-data").button("reset");
                            $('#mainMsg').html("<div class='alert alert-success'>\n  儲存成功！\n</div>");
                            setTimeout("$('#mainMsg').html('')", 1500);
                            $('#tab_form').hide();
                            $('#tab_survey_list').show();

                            //#region 儲存log
                            var status_name = (_status === '1') ? '儲存' : '暫存';
                            var log_add_content = [];
                            log_add_content.push(
                                '學生「' + (student_name || '') + '」' +
                                status_name +
                                '「' + school_year + '學年度' + (semester === '0' ? '暑期' : '第' + semester + '學期') + '」' +
                                ' 課程「' + (curr_survey.CourseName || '') + '」' +
                                ' 老師「' + (curr_survey.TeacherName || '') + '」' +
                                '的教學評鑑'
                            );

                            $('#tab_form tbody[data-type=questions] tr').each(function() {
                                log_add_content.push('「' + ($(this).find('td:eq(0), th:eq(0)').text() || '') + '」');
                                $(this).find('td:eq(1) input[data-caseid]:checked, textarea').each(function(index, item) {
                                    log_add_content.push($(item).val() || '');
                                });
                            });

                            gadget.getContract("emba.student").send({
                                service: "public.AddLog",
                                body: "<Request>\n  <Log>\n     <Actor>" + conn_log.getUserInfo().UserName + "</Actor>\n        <ActionType>" + status_name + "</ActionType>\n       <Action>" + status_name + "評鑑</Action>\n       <TargetCategory>student</TargetCategory>\n      <ClientInfo><ClientInfo></ClientInfo></ClientInfo>\n        <ActionBy>ischool web 教學評鑑小工具</ActionBy>\n      <Description>" + log_add_content.join('\n') + "</Description>\n    </Log>\n</Request>"
                            });
                            //#endregion
                        }
                    }
                });
            }
        }
        //#endregion
    };
    //#endregion
}();
