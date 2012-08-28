// TODO: 設定編輯時資料
_gg.SetSaveData = function (data_scope) {
    var tmp_singleRecord = [];
    var tmp_multipleRecord = [];
    var tmp_semesterData = [];
    var tmp_yearlyData = [];
    var tmp_priorityData = [];
    var tmp_relative = [];
    var tmp_sibling = [];

    // TODO: 設定service內容
    var get_request = function (question, contents) {

        var get_part = function (question) {
            var qkey         = question.TagName || (question.GroupName + '_' + question.Name);
            var qoption      = question.Options;
            var usecontrol   = question.ControlType;
            var ret_value = [], tmp_value = {};
            contents = contents || $('#' + data_scope);

            if (qoption && qoption.item) {
                switch (usecontrol) {
                    case 'radio':
                        contents.find('[data-type=' + qkey + ']:checked').each(function () {
                            tmp_value.Data   = $(this).val() || '';
                            tmp_value.Remark = contents.find('[data-index=' + $(this).attr('data-index') + '][data-type=' + qkey + '_remark]').val() || '';
                        });
                        ret_value.push(tmp_value);
                        break;
                    case 'checkbox':
                        contents.find('[data-type=' + qkey + ']:checked').each(function () {
                            var tmp_value = {};
                            tmp_value.Data   = $(this).val() || '';
                            tmp_value.Remark = contents.find('[data-index=' + $(this).attr('data-index') + '][data-type=' + qkey + '_remark]').val() || '';
                            ret_value.push(tmp_value);
                        });
                        break;
                    case 'select':
                        tmp_value.Data   = contents.find('[data-type=' + qkey + ']:selected').val() || '';
                        tmp_value.Remark = contents.find('[data-type=' + qkey + '_remark]').val() || '';
                        ret_value.push(tmp_value);
                        break;
                    case 'textarea':
                        tmp_value.Data   = contents.find('[data-type=' + qkey + ']').html() || '';
                        tmp_value.Remark = '';
                        ret_value.push(tmp_value);
                        break;
                    default:
                        tmp_value.Data   = contents.find('[data-type=' + qkey + ']').val() || '';
                        tmp_value.Remark = '';
                        ret_value.push(tmp_value);
                }
            } else {
                tmp_value.Data   = contents.find('[data-type=' + qkey + ']').val() || '';
                tmp_value.Remark = '';
                ret_value.push(tmp_value);
            }
            return ret_value;
        };

        // TODO: 依題目類型決定控制項要執行的方式
        var qtype = (question.QuestionType || '');
        var qkey  = question.TagName || (question.GroupName + '_' + question.Name);
        var control_html = '';
        var form_value;
        switch (qtype.toLowerCase()) {
            case 'single_answer':
                form_value = get_part(question);
                $(form_value).each(function() {
                    tmp_singleRecord.push('<SingleRecord>');
                    tmp_singleRecord.push('<Key>' + qkey + '</Key>');
                    tmp_singleRecord.push('<Data>' + this.Data  + '</Data>');
                    if (this.Remark) {
                        tmp_singleRecord.push('<Remark>' + this.Remark  + '</Remark>');
                    }
                    tmp_singleRecord.push('</SingleRecord>');
                    return false;
                });
                break;
            case 'multi_answer':
                form_value = get_part(question);
                $(form_value).each(function() {
                    tmp_multipleRecord.push('<MultipleRecord>');
                    tmp_multipleRecord.push('<Key>' + qkey + '</Key>');
                    tmp_multipleRecord.push('<Data>' + this.Data  + '</Data>');
                    if (this.Remark) {
                        tmp_multipleRecord.push('<Remark>' + this.Remark  + '</Remark>');
                    }
                    tmp_multipleRecord.push('</MultipleRecord>');
                });
                break;
            case 'yearly':
                form_value = get_part(question);

                tmp_yearlyData.push('<YearlyData>');
                tmp_yearlyData.push('<Key>' + qkey + '</Key>');

                if (question.SelectValue) {
                    for (var i=1; i<=6 ; i+=1) {
                        if ((i + '') === _gg.grade) {
                            $(form_value).each(function() {
                                tmp_yearlyData.push('<G' + i + '>' + this.Data  + '</G' + i + '>');
                                return false;
                            });

                        } else {
                            tmp_yearlyData.push('<G' + i + '>' + question.SelectValue['G' + i]  + '</G' + i + '>');

                        }
                    }
                } else {
                    $(form_value).each(function() {
                        tmp_yearlyData.push('<G' + _gg.grade + '>' + this.Data  + '</G' + _gg.grade + '>');
                        return false;
                    });
                }

                tmp_yearlyData.push('</YearlyData>');
                break;
            case 'priority':
                form_value = get_part(question);
                tmp_priorityData.push('<PriorityData>');
                tmp_priorityData.push('<Key>' + qkey + '</Key>');

                $(form_value).each(function(index, value) {
                    tmp_priorityData.push('<P' + (index+1) + '>' + this.Data  + '</P' + (index+1) + '>');
                });

                tmp_priorityData.push('</PriorityData>');
                break;
            case 'relative':
                form_value = get_part(question);

                $(form_value).each(function() {
                    if (this.Data) {
                        if (question.TagName === 'IsAlive') {
                            tmp_relative.push((this.Data === '歿') ? 't':'f');
                        } else {
                            tmp_relative.push(this.Data);
                        }
                    }
                });
                break;
            case 'sibling':
                form_value = get_part(question);

                if (question.TagName) {
                    $(form_value).each(function() {
                        if (this.Data) {
                            tmp_relative.push(this.Data);
                        }
                    });
                }
                break;
        }
        return control_html;
    };

    // TODO: 個人資料
    var set_personal = function (questions) {
        $(questions).each(function (index, value) {
            get_request(value);
        });
    };

    // TODO: 監護人資料
    var set_guardian = function (questions) {
        $(questions).each(function (index, value) {
            get_request(value);
        });
    };

    // TODO: 尊親屬資料資料
    var set_parents = function (questions) {
        $(_gg.relative).each(function (key, relatives) {
            tmp_relative.push('<Relative>');
            tmp_relative.push('<Condition><Uid>' + relatives.UID + '</Uid></Condition>');

            $(questions).each(function (index, value) {
                if (value.TagName !== 'Title') {
                    tmp_relative.push('<' + value.TagName + '>');
                    get_request(value, $('#' + data_scope + ' [unique-value=' + relatives.UID + ']'));
                    tmp_relative.push('</' + value.TagName + '>');
                }
            });

            tmp_relative.push('</Relative>');
        });
    };

    // TODO: 兄弟姊妹資料
    var set_siblings = function (questions) {
        $('#' + data_scope + ' .accordion-group').each(function () {

            tmp_sibling.push('<Sibling>');

            $(questions).each(function (index, value) {
                if (value.Name === '兄弟姊妹_排行') {
                    if ($('#' + data_scope + ' [name=AnySiblings]:checked').val() === 'more') {
                        tmp_singleRecord.push('<SingleRecord>');
                        tmp_singleRecord.push('<Key>家庭狀況_兄弟姊妹_排行</Key>');
                        tmp_singleRecord.push('<Data>' + ($('#' + data_scope + ' [data-type=家庭狀況_兄弟姊妹_排行]').val() || '')  + '</Data>');
                        tmp_singleRecord.push('</SingleRecord>');
                    }
                } else {
                    tmp_sibling.push('<' + value.TagName + '>');
                    get_request(value, this);
                    tmp_sibling.push('</' + value.TagName + '>');
                }
            });

            tmp_sibling.push('</Sibling>');
        });
    };

    // TODO: 身高體重
    var set_psize = function (questions) {

        var tmp_key = '';

        $(questions).each(function (key, value) {
            tmp_key = value.GroupName + '_' + value.Name;

            tmp_semesterData.push('<SemesterData>');
            tmp_semesterData.push('<Key>' + tmp_key + '</Key>');
            tmp_semesterData.push('<S1a>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S1a]').val() || '') + '</S1a>');
            tmp_semesterData.push('<S1b>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S1b]').val() || '') + '</S1b>');
            tmp_semesterData.push('<S2a>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S2a]').val() || '') + '</S2a>');
            tmp_semesterData.push('<S2b>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S2b]').val() || '') + '</S2b>');
            tmp_semesterData.push('<S3a>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S3a]').val() || '') + '</S3a>');
            tmp_semesterData.push('<S3b>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S3b]').val() || '') + '</S3b>');
            tmp_semesterData.push('</SemesterData>');
        });
    };

    // TODO: 家庭訊息
    var set_home = function (questions) {
        $(questions).each(function (index, value) {
            get_request(value);
        });
    };

    // TODO: 學習
    var set_learn = function (questions) {
        $(questions).each(function (index, value) {
            get_request(value);
        });
    };

    // TODO: 幹部資訊
    var set_cadre = function (questions) {
        var tmp_key = '';

        $(questions).each(function (key, value) {
            tmp_key = value.GroupName + '_' + value.Name;
            tmp_semesterData.push('<SemesterData>');
            tmp_semesterData.push('<Key>' + tmp_key + '</Key>');


            if (question.SelectValue) {
                for (var i=1; i<=3 ; i+=1) {
                    if ((i + '') === _gg.grade) {
                        $(form_value).each(function() {
                            tmp_semesterData.push('<S' + i + 'a>' + ($('#' + data_scope + ' [data-type=' + tmp_key + 'a]').val() || '') + '</S' + i + 'a>');
                            tmp_semesterData.push('<S' + i + 'b>' + ($('#' + data_scope + ' [data-type=' + tmp_key + 'b]').val() || '') + '</S' + i + 'b>');
                            return false;
                        });

                    } else {
                        tmp_semesterData.push('<S' + i + 'a>' + question.SelectValue['S' + i + 'a'] + '</S' + i + 'a>');
                        tmp_semesterData.push('<S' + i + 'b>' + question.SelectValue['S' + i + 'b'] + '</S' + i + 'b>');
                    }
                }
            } else {
                $(form_value).each(function() {
                    tmp_semesterData.push('<S' + _gg.grade + 'a>' + ($('#' + data_scope + ' [data-type=' + tmp_key + 'a]').val() || '') + '</S' + _gg.grade + 'a>');
                    tmp_semesterData.push('<S' + _gg.grade + 'b>' + ($('#' + data_scope + ' [data-type=' + tmp_key + 'b]').val() || '') + '</S' + _gg.grade + 'b>');
                    return false;
                });
            }

            tmp_semesterData.push('</SemesterData>');
        });
    };

    // TODO: 自我認識
    var set_oneself = function (questions) {
        $(questions).each(function (index, value) {
            if (value.Name.indexOf("填寫日期") === -1) {
                get_request(value);
            } else {
                var d = new Date();
                tmp_singleRecord.push('<SingleRecord>');
                tmp_singleRecord.push('<Key>' + qkey + '</Key>');
                tmp_singleRecord.push('<Data>' + d + '</Data>');
                tmp_singleRecord.push('</SingleRecord>');
            }
        });
    };

    // TODO: 生活感想
    var set_life = function (questions) {

        var tmp_grade = (_gg.grade || 1);

        $(questions).each(function (key, value) {
            if (value.Name.slice(-1) === tmp_grade) { // ex.內容1_1
                if (value.Name.indexOf("填寫日期") === -1) {
                    get_request(value);
                } else {
                    var qkey  = question.TagName || (question.GroupName + '_' + question.Name);
                    var d = new Date();
                    tmp_singleRecord.push('<SingleRecord>');
                    tmp_singleRecord.push('<Key>' + qkey + '</Key>');
                    tmp_singleRecord.push('<Data>' + d + '</Data>');
                    tmp_singleRecord.push('</SingleRecord>');
                }
            }
        });
    };

    // TODO: 畢業後規劃
    var set_plan = function (questions) {
        $(questions).each(function (index, value) {
            get_request(value);
        });
    };

    // TODO: 自傳
    var set_memoir = function (questions) {
        $(questions).each(function (index, value) {
            if (value.Name.indexOf("填寫日期") === -1) {
                get_request(value);
            } else {
                var qkey  = question.TagName || (question.GroupName + '_' + question.Name);
                var d = new Date();
                tmp_singleRecord.push('<SingleRecord>');
                tmp_singleRecord.push('<Key>' + qkey + '</Key>');
                tmp_singleRecord.push('<Data>' + d + '</Data>');
                tmp_singleRecord.push('</SingleRecord>');
            }
        });
    };

    // TODO: 編輯畫面
    if (data_scope) {
        switch (data_scope) {
            case 'personal':
                set_personal(_gg.col_Question.A1);
                break;
            case 'guardian':
                set_guardian(_gg.col_Question.A2);
                break;
            case 'parents':
                set_parents(_gg.col_Question.A3);
                break;
            case 'siblings':
                set_siblings(_gg.col_Question.A4);
                break;
            case 'psize':
                set_psize(_gg.col_Question.A5); //特別
                break;
            case 'home':
                set_home(_gg.col_Question.B1);
                break;
            case 'learn':
                set_learn(_gg.col_Question.B2);
                break;
            case 'cadre':
                set_cadre(_gg.col_Question.B3); //特別
                break;
            case 'oneself':
                set_oneself(_gg.col_Question.B4);
                break;
            case 'life':
                set_life(_gg.col_Question.B5); //特別
                break;
            case 'plan':
                set_plan(_gg.col_Question.C1);
                break;
            case 'memoir':
                set_memoir(_gg.col_Question.D1);
                break;
        }

/*    console.log(tmp_singleRecord.join(''));
    console.log(tmp_multipleRecord.join(''));
    console.log(tmp_semesterData.join(''));
    console.log(tmp_yearlyData.join(''));
    console.log(tmp_priorityData.join(''));
    console.log(tmp_relative.join(''));
    console.log(tmp_sibling.join(''));*/
/*
        if (tmp_singleRecord.join("")) {
            _gg.connection.send({
            service: "_.InsertSingleRecord",
                body: '<Request>' + tmp_singleRecord.join("") + '</Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        $("#" + data_scope + " #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>儲存失敗，請稍候重試!</strong>(InsertSingleRecord)\n</div>");
                    } else {
                        $("#" + data_scope).modal("hide");
                        //_gg.Student.ClubID = "";
                        //_gg.RefreshCount();
                    }
                }
            });
        }
        if (tmp_multipleRecord.join("")) {
            _gg.connection.send({
            service: "_.InsertMultipleRecord",
                body: '<Request>' + tmp_multipleRecord.join("") + '</Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        $("#" + data_scope + " #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>儲存失敗，請稍候重試!</strong>(InsertMultipleRecord)\n</div>");
                    } else {
                        $("#" + data_scope).modal("hide");
                        //_gg.Student.ClubID = "";
                        //_gg.RefreshCount();
                    }
                }
            });
        }
        if (tmp_semesterData.join("")) {
            _gg.connection.send({
            service: "_.InsertSemesterData",
                body: '<Request>' + tmp_semesterData.join("") + '</Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        $("#" + data_scope + " #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>儲存失敗，請稍候重試!</strong>(InsertSemesterData)\n</div>");
                    } else {
                        $("#" + data_scope).modal("hide");
                        //_gg.Student.ClubID = "";
                        //_gg.RefreshCount();
                    }
                }
            });
        }
        if (tmp_yearlyData.join("")) {
            _gg.connection.send({
            service: "_.InsertYearlyData",
                body: '<Request>' + tmp_yearlyData.join("") + '</Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        $("#" + data_scope + " #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>儲存失敗，請稍候重試!</strong>(InsertYearlyData)\n</div>");
                    } else {
                        $("#" + data_scope).modal("hide");
                        //_gg.Student.ClubID = "";
                        //_gg.RefreshCount();
                    }
                }
            });
        }
        if (tmp_priorityData.join("")) {
            _gg.connection.send({
            service: "_.InsertPriorityData",
                body: '<Request>' + tmp_priorityData.join("") + '</Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        $("#" + data_scope + " #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>儲存失敗，請稍候重試!</strong>(InsertPriorityData)\n</div>");
                    } else {
                        $("#" + data_scope).modal("hide");
                        //_gg.Student.ClubID = "";
                        //_gg.RefreshCount();
                    }
                }
            });
        }
        if (tmp_relative.join("")) {
            _gg.connection.send({
            service: "_.UpdateRelative",
                body: '<Request>' + tmp_relative.join("") + '</Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        $("#" + data_scope + " #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>儲存失敗，請稍候重試!</strong>(UpdateRelative)\n</div>");
                    } else {
                        $("#" + data_scope).modal("hide");
                        //_gg.Student.ClubID = "";
                        //_gg.RefreshCount();
                    }
                }
            });
        }
        if (tmp_sibling.join("")) {
            _gg.connection.send({
            service: "_.InsertSibling",
                body: '<Request>' + tmp_sibling.join("") + '</Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        if (error.dsaError.status === "504") {
                             $("#" + data_scope + " #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>儲存失敗，兄弟姊妹的姓名重複!</strong>\n</div>");
                        } else {
                            $("#" + data_scope + " #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>儲存失敗，請稍候重試!</strong>(InsertSibling)\n</div>");
                        }
                    } else {
                        $("#" + data_scope).modal("hide");
                        //_gg.Student.ClubID = "";
                        //_gg.RefreshCount();
                    }
                }
            });
        }
*/
    }
};
