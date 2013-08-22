var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.retake.teacher");
_gg.col_courses = {};

jQuery(function () {
    // 載入資料
    _gg.loadData();

    // 驗證提示樣式設定
    $.validator.setDefaults({
        debug: true,
        errorElement: "span",
        errorClass: "help-inline",
        highlight: function(element) {
            $(element).parentsUntil('.control-group').parent().addClass("error");
        },
        unhighlight: function(element) {
            $(element).parentsUntil('.control-group').parent().removeClass("error");
        },
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        ignoreTitle: true
    });

    // 編輯畫面
    $("#editModal").modal({
        show: false
    });
    $("#editModal").on("hidden", function () {
        $("#editModal #errorMessage").html("");
    });
    $("#editModal").on("show", function (e) {
        $("#editModal #save-data").button("reset");
    });
    $("#editModal #save-data").click(function () {
        var err_msg = $('#errorMessage');
        err_msg.html('');
        if ($("#editModal form").valid()) {
            $(this).removeClass('btn-danger').addClass('btn-success').button('loading'); // 按鈕為處理中
            _gg.SaveSorce();
        } else {
            err_msg.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  資料驗證失敗，請重新檢查！\n</div>");
        }
    });

    // 切換課程
    $('#changeCourse').bind('change', function(event) {
        _gg.GetScore(this.value);
    });

    // 輸入成績
    $('#score_list').on('click', 'a', function(e) {
        var scoreType, courseID;
        scoreType = $(this).attr("edit-target");
        courseID = $('#changeCourse').val();

        if (courseID) {
            var edit_title, opening = false;
            switch (scoreType) {
                case 'SubScore1':
                    opening = _gg.opening.ss1Status;
                    edit_title = '期中考成績比例(' + (_gg.weight.SS1Weight || '')  + '%)';
                    break;
                case 'SubScore2':
                    opening = _gg.opening.ss2Status;
                    edit_title = '期末考成績比例(' +  (_gg.weight.SS2Weight || '')  + '%)';
                    break;
                case 'SubScore3':
                    opening = _gg.opening.ss3Status;
                    edit_title = '平時成績比例(' + (_gg.weight.SS3Weight || '')  + '%)';
                    break;
                case 'Score':
                    opening = _gg.opening.ss2Status; //學期成績的輸入期間與期末考成績輸入期間相同
                    edit_title = '學期成績';
                    break;
            }

            if (opening) {
                var students = _gg.col_courses[courseID].Students;
                if (students) {
                    var ret = [];
                    $(students).each(function(key, value) {
                        ret.push(
                            '<div class="control-group">' +
                            '    <label class="control-label">' + (value.SCSelectSeatNo || '') + ' ' + (value.StudentName || '') + '</label>' +
                            '    <div class="controls">'
                        );

                        if (value.NotExam === 't') {
                            ret.push('<span class="help-inline" style="padding-top: 5px;">' + (value[scoreType] || '') + ' (扣考)</span>');
                        } else {
                            var input_s1 = (scoreType === 'SubScore1' ? '@@input' : value['SubScore1']);
                            var input_s2 = (scoreType === 'SubScore2' ? '@@input' : value['SubScore2']);
                            var input_s3 = (scoreType === 'SubScore3' ? '@@input' : value['SubScore3']);

                            ret.push(
                                '    <input type="text" name="s' + (value.StudentNumber || '') + '"' +
                                ' class="{digits:true, range:[0, 100]} input-large"' +
                                ' id="' + (value.SCSelectID || '') + '"' +
                                ' placeholder="成績..." value="' + (value[scoreType] || '') + '"'
                            );

                            if (scoreType !== 'Score') {
                                ret.push(' data-s1="' + input_s1 + '"' +
                                    ' data-s2="' + input_s2 + '"' +
                                    ' data-s3="' + input_s3 + '"' +
                                    ' title="試算達60的最低評分：' + (_gg.funMinScore(input_s1, input_s2, input_s3) || '') + '"'
                                );
                            }

                            ret.push('>');

                            // 除了學期成績，皆列出試算學期成績
                            if (scoreType !== 'Score') {
                                ret.push('<span class="my-Unofficial-title">試算 = ' +
                                    '<span class="my-Unofficial">' +
                                    (_gg.funWeightScore(value.SubScore1, value.SubScore2, value.SubScore3) || '') +
                                    '</span></span>'
                                );
                            }
                        }

                        ret.push(
                            '    </div>' +
                            '</div>'
                        );
                    });
                }
                $('#editModal').find('h3').html(edit_title).end().find('fieldset').html(ret.join(''));
                $("#save-data").attr('score-type', scoreType);
                $('#editModal input:text:first').focus();
            } else {
                return false;
            }
        }
    });

    // 登錄資料上下鍵、Enter鍵切換輸入框
    $('#editModal').on('keyup', 'input:text', function(e) {
        if (e.which === 38) {
            $(this).parent().parent().prevAll().find('input:text').first().focus();
        }
        if (e.which === 40 || e.which === 13) {
            $(this).parent().parent().nextAll().find('input:text').first().focus();
        }

        if (this.type === 'text') {
            var s1 = ($(this).attr('data-s1') === '@@input') ? $(this).val() : $(this).attr('data-s1');
            var s2 = ($(this).attr('data-s2') === '@@input') ? $(this).val() : $(this).attr('data-s2');
            var s3 = ($(this).attr('data-s3') === '@@input') ? $(this).val() : $(this).attr('data-s3');
            $(this).closest('.controls').find('.my-Unofficial').html(_gg.funWeightScore(s1, s2, s3));
        }
    });
});

// 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case '501':
                        tmp_msg = '<strong>很抱歉，您無存取資料權限！</strong>';
                        break;
                    case '502':
                        tmp_msg = '<strong>儲存失敗，目前未開放填寫!</strong>';
                        break;
                    default:
                        tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
                }
            } else {
                tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            }
        } else {
            tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
        }
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
    }
};

// 載入資料
_gg.loadData = function () {
    // 取得重補修期間名冊
    _gg.connection.send({
        service: "_.GetTimeList",
        body: {
            Request: {
                Condition: ''
            }
        },
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetTimeList', error);
            } else {
                var _ref;
                if (((_ref = response.TimeList) != null ? _ref.Name : void 0) != null) {
                    $('#opening h3').html(response.TimeList.Name || '');
                } else {
                    $('#opening h3').html('無開放中的重補修');
                }
            }
        }
    });

    // 取得比重
    _gg.connection.send({
        service: "_.GetWeight",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetWeight', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.Weight : void 0) != null) {
                    $(response.Response.Weight).each(function (index, item) {
                        _gg.weight = item;
                    });
                    $('a[edit-target=SubScore1]').append( '(' + (_gg.weight.SS1Weight || '')  + '%)' );
                    $('a[edit-target=SubScore2]').append( '(' + (_gg.weight.SS2Weight || '')  + '%)' );
                    $('a[edit-target=SubScore3]').append( '(' + (_gg.weight.SS3Weight || '')  + '%)' );
                }
            }
        }
    });

    // 判斷是否為開放期間
    var check_opening = function(data) {
        var ret = {};
        if (data.StartDate && data.EndDate) {
            var tmp_Date  = new Date();
            var Startdate = $.parseDate(data.StartDate);
            var Enddate   = $.parseDate(data.EndDate);

            ret.DateRange = $.formatDate(Startdate, "yyyyMMdd") + " " + $.formatDate(Startdate, "HHmm") + " ~ " + $.formatDate(Enddate, "yyyyMMdd") + " " + $.formatDate(Enddate, "HHmm")

            if (Startdate <= tmp_Date && Enddate >= tmp_Date) {
                ret.Status = true;
            } else {
                ret.Status = false;
            }
        } else {
            ret.Status = false;
        }
        return ret;
    };

    // 取得開放期間
    _gg.connection.send({
        service: "_.GetScoreInputDate",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetScoreInputDate', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.ScoreInputDate : void 0) != null) {
                    _gg.opening = {};
                    $(response.Response.ScoreInputDate).each(function (index, item) {
                        var openDate = check_opening(item);
                        switch (item.ScoreName) {
                            case '期中考':
                                _gg.opening.ss1Status = openDate.Status;
                                if (_gg.opening.ss1Status) {
                                    $('#ss1_date').html(openDate.DateRange);
                                    $('a[edit-target=SubScore1]').removeClass("disabled");
                                } else {
                                    $('#ss1_date').html('未開放');
                                }
                                break;
                            case '期末考':
                                _gg.opening.ss2Status = openDate.Status;
                                if (_gg.opening.ss2Status) {
                                    $('#ss2_date').html(openDate.DateRange);
                                    $('a[edit-target=SubScore2]').removeClass("disabled");
                                    $('a[edit-target=Score]').removeClass("disabled");
                                } else {
                                    $('#ss2_date').html('未開放');
                                }
                                break;
                            case '平時成績':
                                _gg.opening.ss3Status = openDate.Status;
                                if (_gg.opening.ss3Status) {
                                    $('#ss3_date').html(openDate.DateRange);
                                    $('a[edit-target=SubScore3]').removeClass("disabled");
                                } else {
                                    $('#ss3_date').html('未開放');
                                }
                                break;
                        }
                    });
                }
            }
        }
    });

    // 重補修授課課程清單
    _gg.connection.send({
        service: "_.GetCourse",
        body: {
            Request: {
                Condition: ''
            }
        },
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetCourse', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.Course : void 0) != null) {
                    var items = [], tmp_courseID = 0;
                    $(response.Response.Course).each(function(index, item) {
                        if (index === 0) {
                            tmp_courseID = item.CourseID;
                        }
                        items.push('<option value="' + item.CourseID + '">' + (item.CourseName || '') + '</option>');
                    });
                    $('#changeCourse').html(items.join(''));
                    _gg.GetScore(tmp_courseID);
                } else {
                    $('#changeCourse').parent().remove();
                    $('#score_list').html('您無重補修授課資料！');
                }
            }
        }
    });
};


// 載入學生成績
_gg.GetScore = function (courseID) {
    if (courseID) {
        if (!_gg.col_courses[courseID]) {
            _gg.connection.send({
                service: "_.GetSCSelect",
                body: {
                    Request: {
                        Condition: {
                            CourseID: courseID
                        }
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetSCSelect', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.SCSelect : void 0) != null) {
                            var tmp_col_courses = {};
                            $(response.Response.SCSelect).each(function (index, item) {
                                var courseid = item.CourseID;
                                if (!tmp_col_courses[courseid]) {
                                    var tmp_course = {
                                        CourseID   : item.CourseID,
                                        Students : []
                                    };
                                    tmp_col_courses[courseid] = tmp_course;
                                }

                                tmp_col_courses[courseid].Students.push(item);
                            });

                            _gg.col_courses = tmp_col_courses;
                            _gg.SetScore(courseID);
                        }
                    }
                }
            });
        } else {
            _gg.SetScore(courseID);
        }
    }
};

// 成績列表
_gg.SetScore = function (courseID) {
    if (courseID) {
        var students = _gg.col_courses[courseID].Students;
        var items = [];
        $(students).each(function(key, value) {
            var notexam_css = '', notexam_tooltip = '';
            if (value.NotExam === 't') {
                notexam_css = 'my-noexam';
                notexam_tooltip = ' rel="tooltip" title="扣考"';
            }

            items.push('<tr class="' + notexam_css + '" ' + notexam_tooltip + '>' +
                '  <td>' + (value.SCSelectSeatNo || '') + '</td>' +
                '  <td>' + (value.StudentNumber || '') + '</td>' +
                '  <td>' + (value.ClassName || '') + '</td>' +
                '  <td>' + (value.SeatNo || '')   + '</td>' +
                '  <td>' + (value.StudentName || '') + '</td>' +
                '  <td>' + (value.SubScore1 || '') + '</td>' +
                '  <td>' + (value.SubScore2 || '') + '</td>' +
                '  <td>' + (value.SubScore3 || '') + '</td>' +
                '  <td>' + _gg.funWeightScore(value.SubScore1, value.SubScore2, value.SubScore3) + '</td>' +
                '  <td>' + (value.Score || '') + '</td>' +
                '</tr>');
        });

        var ret = items.join('');
        if (ret) {
            $('#score_list tbody').html(ret);
            // 扣考 tooltip
            $('#score_list tr.my-noexam').tooltip();
        } else {
            $('#score_list tbody').html('<tr><td colspan="10">無學生資料</td></tr>');
        }
    }
};

// 試算學期成績
_gg.funWeightScore = function (SubScore1, SubScore2, SubScore3) {
    if (_gg.weight) {
        var a = 0, b = 0, c = 0;
        if ($.isNumeric(SubScore1) && $.isNumeric(_gg.weight.SS1Weight)) {
            a = parseInt(SubScore1, 10) * parseInt(_gg.weight.SS1Weight, 10);
        }
        if ($.isNumeric(SubScore2) && $.isNumeric(_gg.weight.SS2Weight)) {
            b = parseInt(SubScore2, 10) * parseInt(_gg.weight.SS2Weight, 10);
        }
        if ($.isNumeric(SubScore3) && $.isNumeric(_gg.weight.SS3Weight)) {
            c = parseInt(SubScore3, 10) * parseInt(_gg.weight.SS3Weight, 10);
        }

        return Math.round((a + b + c) / 100);
    }
    return 0;
};

// 本次成績若要使試算成績達60分，最低需評幾分
_gg.funMinScore = function (SubScore1, SubScore2, SubScore3) {
    // 目前評分項目，請傳入「@@input」
    if (_gg.weight) {
        var total_other_score = 0;
        var input_weight = 0;
        if (SubScore1 !== '@@input') {
            if ($.isNumeric(SubScore1) && $.isNumeric(_gg.weight.SS1Weight)) {
                total_other_score += parseInt(SubScore1, 10) * parseInt(_gg.weight.SS1Weight, 10);
            }
        } else {
            input_weight = _gg.weight.SS1Weight;
        }
        if (SubScore2 !== '@@input') {
            if ($.isNumeric(SubScore2) && $.isNumeric(_gg.weight.SS2Weight)) {
                total_other_score += parseInt(SubScore2, 10) * parseInt(_gg.weight.SS2Weight, 10);
            }
        } else {
            input_weight = _gg.weight.SS2Weight;
        }
        if (SubScore3 !== '@@input') {
            if ($.isNumeric(SubScore3) && $.isNumeric(_gg.weight.SS3Weight)) {
                total_other_score += parseInt(SubScore3, 10) * parseInt(_gg.weight.SS3Weight, 10);
            }
        } else {
            input_weight = _gg.weight.SS3Weight;
        }

        input_weight = ($.isNumeric(input_weight)) ? parseInt(input_weight, 10) : 0;

        return Math.ceil((5950 - total_other_score) / input_weight);
    }
    return 0;
};

// 儲存成績
_gg.SaveSorce = function () {

    var courseid, scoreType;
    scoreType = $("#save-data").attr('score-type');
    courseid = $('#changeCourse').val();

    if (courseid) {
        if (scoreType === 'SubScore1' || scoreType === 'SubScore2' || scoreType === 'SubScore3' || scoreType === 'Score') {
            var students = _gg.col_courses[courseid].Students;
            if (students) {
                var arys = [];
                $(students).each(function(key, value) {
                    if (!(value.NotExam === 't')) {
                        arys.push('<Students><Condition><UID>' + (value.SCSelectID || '0')  + '</UID></Condition>');
                        var tmp_score = $('#'+(value.SCSelectID)).val();
                        if (tmp_score !== '') {
                            tmp_score = parseInt(tmp_score, 10) + '';
                            tmp_score = isNaN(tmp_score) ? '' : tmp_score;
                        } else {
                            tmp_score = '';
                        }
                        arys.push('<' + scoreType + '>' + tmp_score + '</' + scoreType + '>');
                        arys.push('</Students>');
                    }
                });

                var serviceName = '';
                switch (scoreType) {
                    case 'SubScore1': serviceName = '_.UpdateScore1'; break;
                    case 'SubScore2': serviceName = '_.UpdateScore2'; break;
                    case 'SubScore3': serviceName = '_.UpdateScore3'; break;
                    case 'Score': serviceName = '_.UpdateScore2'; break;
                }

                _gg.connection.send({
                    service: serviceName,
                    body: '<Request>' + arys.join('') + '</Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#errorMessage', serviceName, error);
                        } else {
                            $(students).each(function(key, value) {
                                if (!(value.NotExam === 't')) {
                                    var tmp_score = $('#'+(value.SCSelectID)).val();
                                    if (tmp_score !== '') {
                                        tmp_score = parseInt(tmp_score, 10) + '';
                                        tmp_score = isNaN(tmp_score) ? '' : tmp_score;
                                    } else {
                                        tmp_score = '';
                                    }
                                    value[scoreType] = tmp_score;
                                    $('#' + scoreType + value.SCSelectID).html(tmp_score);
                                }
                            });

                            _gg.SetScore(courseid);

                            $('#editModal').modal("hide");
                        }
                    }
                });
            }
        }
    }
};