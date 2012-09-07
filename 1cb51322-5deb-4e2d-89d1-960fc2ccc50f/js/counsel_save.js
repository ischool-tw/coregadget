// TODO: 設定編輯時資料
_gg.SetSaveData = function (data_scope) {
    var tmp_singleRecord = [];
    var tmp_multipleRecord = [];
    var tmp_semesterData = [];
    var tmp_yearlyData = [];
    var tmp_priorityData = [];
    var tmp_relative = [];
    var tmp_sibling = [];
    var tmp_reset_data = {};

    // TODO: 設定service內容
    var get_request = function (question, contents) {

        var get_part = function (question) {
            var qkey         = question.TagName || (question.GroupName + '_' + question.Name);
            var qoption      = question.Options;
            var usecontrol   = question.ControlType;
            var ret_value = [];
            var tmp_value = { Data: '', Remark: ''};
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
                            tmp_value = {};
                            tmp_value.Data   = $(this).val() || '';
                            tmp_value.Remark = contents.find('[data-index=' + $(this).attr('data-index') + '][data-type=' + qkey + '_remark]').val() || '';
                            tmp_value.Remark = tmp_value.Remark;
                            ret_value.push(tmp_value);
                        });
                        break;
                    case 'select':
                        contents.find('[data-type=' + qkey + '] option:selected').each(function () {
                            tmp_value = {};
                            tmp_value.Data   = $(this).val() || '';
                            tmp_value.Remark = contents.find('[data-type=' + qkey + '_remark]').val() || '';
                            ret_value.push(tmp_value);
                        });
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
        var form_value;
        var tmp_x, tmp_join;
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

                    tmp_reset_data[question.Name] = {
                        Key: qkey,
                        Data: this.Data,
                        Remark: this.Remark
                    };

                    return false;
                });
                break;
            case 'multi_answer':
                tmp_reset_data[question.Name] = [];

                form_value = get_part(question);

                $(form_value).each(function() {
                    tmp_multipleRecord.push('<MultipleRecord>');
                    tmp_multipleRecord.push('<Key>' + qkey + '</Key>');
                    tmp_multipleRecord.push('<Data>' + this.Data  + '</Data>');
                    if (this.Remark) {
                        tmp_multipleRecord.push('<Remark>' + this.Remark  + '</Remark>');
                    }
                    tmp_multipleRecord.push('</MultipleRecord>');

                    tmp_reset_data[question.Name].push(
                        {
                            Key: qkey,
                            Data: this.Data,
                            Remark: this.Remark
                        }
                    );
                });
                break;
            case 'yearly':
                tmp_x = {};
                tmp_x.Key = qkey;

                form_value = get_part(question);

                tmp_yearlyData.push('<YearlyData>');
                tmp_yearlyData.push('<Key>' + qkey + '</Key>');

                for (var i=1; i<=6 ; i+=1) {
                    if ((i + '') === _gg.grade) {
                        tmp_join = [];
                        $(form_value).each(function(index, value) {
                            tmp_join.push(this.Data);
                        });
                        tmp_yearlyData.push('<G' + i + '>' + tmp_join.join(",")  + '</G' + i + '>');
                        tmp_x['G' +  i] = tmp_join.join(",");
                    } else {
                        if (question.SelectValue) {
                            tmp_yearlyData.push('<G' + i + '>' + question.SelectValue['G' + i] + '</G' + i + '>');
                            tmp_x['G' +  i] = question.SelectValue['G' + i];
                        } else {
                            tmp_yearlyData.push('<G' + i + '></G' + i + '>');
                            tmp_x['G' +  i] = '';
                        }
                    }
                }

                tmp_yearlyData.push('</YearlyData>');

                tmp_reset_data[question.Name] = tmp_x;
                break;
            case 'priority':
                form_value = get_part(question);
                tmp_x = {};
                tmp_x.Key = qkey;

                tmp_priorityData.push('<PriorityData>');
                tmp_priorityData.push('<Key>' + qkey + '</Key>');

                $(form_value).each(function(index, value) {
                    tmp_priorityData.push('<P' + (index+1) + '>' + this.Data + '</P' + (index+1) + '>');
                    tmp_x['P' + (index+1)] = this.Data;
                });

                if (question.Limit) {
                    for (var j=(parseInt(question.Limit, 10) + 1); j<=10 ; j+=1) {
                        tmp_priorityData.push('<P' + j + '></P' + j + '>');
                        tmp_x['P' + j] = '';
                    }
                }

                tmp_priorityData.push('</PriorityData>');

                tmp_reset_data[question.Name] = tmp_x;
                break;
            case 'relative':
                form_value = get_part(question);

                $(form_value).each(function() {
                    if (this.Data) {
                        if (question.TagName === 'IsAlive') {
                            tmp_relative.push((this.Data === '存') ? 't':'f');
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
                            tmp_sibling.push(this.Data);
                        }
                    });
                }
                break;
        }
    };

    // TODO: 個人資料
    var set_personal = function (questions) {
        $(questions).each(function (index, value) {
            if (value.CanStudentEdit === "是") {
                get_request(value);
            }
        });
    };

    // TODO: 監護人資料
    var set_guardian = function (questions) {
        $(questions).each(function (index, value) {
            if (value.CanStudentEdit === "是") {
                get_request(value);
            }
        });
    };

    // TODO: 尊親屬資料資料
    var set_parents = function (questions) {
        $(_gg.relative).each(function (key, relatives) {
            tmp_relative.push('<Relative>');
            tmp_relative.push('<Condition><Uid>' + relatives.UID + '</Uid></Condition>');

            $(questions).each(function (index, value) {
                if (value.CanStudentEdit === "是") {
                    if (value.TagName !== 'Title') {
                        tmp_relative.push('<' + value.TagName + '>');
                        get_request(value, $('#' + data_scope + ' [unique-value=' + relatives.UID + ']'));
                        tmp_relative.push('</' + value.TagName + '>');
                    }
                }
            });

            tmp_relative.push('</Relative>');
        });
    };

    // TODO: 兄弟姊妹資料
    var set_siblings = function (questions) {
        $(questions).each(function (index, value) {
            if (value.Name === '兄弟姊妹_排行') {
                if (value.CanStudentEdit === "是") {
                    get_request(value);
                }
                return false;
            }
        });

        $('#' + data_scope + ' .accordion-group').each(function (a, b) {

            tmp_sibling.push('<Sibling>');

            $(questions).each(function (index, value) {
                if (value.CanStudentEdit === "是") {
                    if (value.Name !== '兄弟姊妹_排行') {
                        tmp_sibling.push('<' + value.TagName + '>');
                        get_request(value, $(b));
                        tmp_sibling.push('</' + value.TagName + '>');
                    }
                }
            });

            tmp_sibling.push('</Sibling>');
        });
    };

    // TODO: 身高體重
    var set_psize = function (questions) {

        $(questions).each(function (key, value) {
            if (value.CanStudentEdit === "是") {
                var tmp_key = value.GroupName + '_' + value.Name;

                tmp_semesterData.push('<SemesterData>');
                tmp_semesterData.push('<Key>' + tmp_key + '</Key>');
                tmp_semesterData.push('<S1a>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S1a]').val() || '') + '</S1a>');
                tmp_semesterData.push('<S1b>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S1b]').val() || '') + '</S1b>');
                tmp_semesterData.push('<S2a>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S2a]').val() || '') + '</S2a>');
                tmp_semesterData.push('<S2b>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S2b]').val() || '') + '</S2b>');
                tmp_semesterData.push('<S3a>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S3a]').val() || '') + '</S3a>');
                tmp_semesterData.push('<S3b>' + ($('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S3b]').val() || '') + '</S3b>');
                tmp_semesterData.push('</SemesterData>');

                tmp_reset_data[value.Name] = {
                    S1a : $('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S1a]').val() || '',
                    S1b : $('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S1b]').val() || '',
                    S2a : $('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S2a]').val() || '',
                    S2b : $('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S2b]').val() || '',
                    S3a : $('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S3a]').val() || '',
                    S3b : $('#' + data_scope + ' .controls [data-type=' + tmp_key + 'S3b]').val() || ''
                };
            }
        });
    };

    // TODO: 家庭訊息
    var set_home = function (questions) {
        $(questions).each(function (index, value) {
            if (value.CanStudentEdit === "是") {
                get_request(value);
            }
        });
    };

    // TODO: 學習
    var set_learn = function (questions) {
        $(questions).each(function (index, value) {
            if (value.CanStudentEdit === "是") {
                get_request(value);
            }
        });
    };

    // TODO: 幹部資訊
    var set_cadre = function (questions) {
        $(questions).each(function (key, value) {
            if (value.CanStudentEdit === "是") {
                var tmp_key = value.GroupName + '_' + value.Name;
                tmp_semesterData.push('<SemesterData>');
                tmp_semesterData.push('<Key>' + tmp_key + '</Key>');
                var tmp_x = {};

                if (value.SelectValue) {
                    for (var i=1; i<=3 ; i+=1) {
                        if ((i + '') === _gg.grade) {
                                tmp_semesterData.push('<S' + i + 'a>' + ($('#' + data_scope + ' [data-type=' + tmp_key + 'a]').val() || '') + '</S' + i + 'a>');
                                tmp_semesterData.push('<S' + i + 'b>' + ($('#' + data_scope + ' [data-type=' + tmp_key + 'b]').val() || '') + '</S' + i + 'b>');
                                tmp_x['S' + i + 'a'] = $('#' + data_scope + ' [data-type=' + tmp_key + 'a]').val() || '';
                                tmp_x['S' + i + 'b'] = $('#' + data_scope + ' [data-type=' + tmp_key + 'b]').val() || '';
                        } else {
                            tmp_semesterData.push('<S' + i + 'a>' + (value.SelectValue['S' + i + 'a'] || '') + '</S' + i + 'a>');
                            tmp_semesterData.push('<S' + i + 'b>' + (value.SelectValue['S' + i + 'b'] || '') + '</S' + i + 'b>');
                            tmp_x['S' + i + 'a'] = value.SelectValue['S' + i + 'a'] || '';
                            tmp_x['S' + i + 'b'] = value.SelectValue['S' + i + 'b'] || '';
                        }
                    }
                }

                tmp_semesterData.push('</SemesterData>');

                tmp_reset_data[value.Name] = tmp_x;
            }
        });
    };

    // TODO: 自我認識
    var set_oneself = function (questions) {
        var tmp_grade = (_gg.grade || "1");
        $(questions).each(function (index, value) {
            if (value.CanStudentEdit === "是") {
                if (value.Name.slice(-1) === tmp_grade) { // ex.內容1_1
                    if (value.Name.indexOf("填寫日期") === -1) {
                        get_request(value);
                    } else {
                        var tmp_key = value.GroupName + '_' + value.Name;
                        var d = $.formatDate(new Date(), "yyyyMMdd");
                        tmp_singleRecord.push('<SingleRecord>');
                        tmp_singleRecord.push('<Key>' + tmp_key + '</Key>');
                        tmp_singleRecord.push('<Data>' + d + '</Data>');
                        tmp_singleRecord.push('</SingleRecord>');
                        tmp_reset_data[value.Name] = {
                            Key: tmp_key,
                            Data: d
                        };
                    }
                }
            }
        });
    };

    // TODO: 生活感想
    var set_life = function (questions) {
        var tmp_grade = (_gg.grade || "1");
        $(questions).each(function (key, value) {
            if (value.CanStudentEdit === "是") {
                if (value.Name.slice(-1) === tmp_grade) { // ex.內容1_1
                    if (value.Name.indexOf("填寫日期") === -1) {
                        get_request(value);
                    } else {
                        var tmp_key  = value.TagName || (value.GroupName + '_' + value.Name);
                        var d = $.formatDate(new Date(), "yyyyMMdd");
                        tmp_singleRecord.push('<SingleRecord>');
                        tmp_singleRecord.push('<Key>' + tmp_key + '</Key>');
                        tmp_singleRecord.push('<Data>' + d + '</Data>');
                        tmp_singleRecord.push('</SingleRecord>');
                        tmp_reset_data[value.Name] = {
                            Key: tmp_key,
                            Data: d
                        };
                    }
                }
            }
        });
    };

    // TODO: 畢業後規劃
    var set_plan = function (questions) {
        $(questions).each(function (index, value) {
            if (value.CanStudentEdit === "是") {
                get_request(value);
            }
        });
    };

    // TODO: 自傳
    var set_memoir = function (questions) {
        $(questions).each(function (index, value) {
            if (value.CanStudentEdit === "是") {
                if (value.Name.indexOf("填寫日期") === -1) {
                    get_request(value);
                } else {
                    var tmp_key  = value.TagName || (value.GroupName + '_' + value.Name);
                    var d = $.formatDate(new Date(), "yyyyMMdd");
                    tmp_singleRecord.push('<SingleRecord>');
                    tmp_singleRecord.push('<Key>' + tmp_key + '</Key>');
                    tmp_singleRecord.push('<Data>' + d + '</Data>');
                    tmp_singleRecord.push('</SingleRecord>');
                    tmp_reset_data[value.Name] = {
                        Key: tmp_key,
                        Data: d
                    };
                }
            }
        });
    };

    // TODO: 儲存範圍
    var tmp_colID;
    switch (data_scope) {
        case 'personal':
            tmp_colID = 'A1';
            set_personal(_gg.col_Question.A1);
            break;
        case 'guardian':
            tmp_colID = 'A2';
            set_guardian(_gg.col_Question.A2);
            break;
        case 'parents':
            tmp_colID = 'A3';
            set_parents(_gg.col_Question.A3);
            break;
        case 'siblings':
            tmp_colID = 'A4';
            set_siblings(_gg.col_Question.A4);
            break;
        case 'psize':
            tmp_colID = 'A5';
            set_psize(_gg.col_Question.A5); //特別
            break;
        case 'home':
            tmp_colID = 'B1';
            set_home(_gg.col_Question.B1);
            break;
        case 'learn':
            tmp_colID = 'B2';
            set_learn(_gg.col_Question.B2);
            break;
        case 'cadre':
            tmp_colID = 'B3';
            set_cadre(_gg.col_Question.B3); //特別
            break;
        case 'oneself':
            tmp_colID = 'B4';
            set_oneself(_gg.col_Question.B4);
            break;
        case 'life':
            tmp_colID = 'B5';
            set_life(_gg.col_Question.B5); //特別
            break;
        case 'plan':
            tmp_colID = 'C1';
            set_plan(_gg.col_Question.C1);
            break;
        case 'memoir':
            tmp_colID = 'D1';
            set_memoir(_gg.col_Question.D1);
            break;
    }

    var save_singleRecord = false;
    var save_multipleRecord = false;
    var save_semesterData = false;
    var save_yearlyData = false;
    var save_priorityData = false;
    var save_relative = false;
    var save_sibling = false;
    var tmp_del_request;

    // TODO: 重設表單結果
    var reset_data = function () {
        if (save_singleRecord && save_multipleRecord && save_semesterData && save_yearlyData && save_priorityData && save_relative && save_sibling) {
            switch (tmp_colID) {
                case 'A3':
                    // TODO: 取得親屬資訊
                    _gg.connection.send({
                        service: "_.GetRelative",
                        body: '',
                        result: function (response, error, http) {
                            if (error !== null) {
                                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetRelative)\n</div>");
                            } else {
                                _gg.relative = [];
                                $(response.Response.Relative).each(function (index, item) {
                                    _gg.relative.push(item);
                                });
                                _gg.SetData(tmp_colID);
                                $(".modal").modal("hide");
                            }
                        }
                    });
                    break;
                case 'A4':
                    $(_gg.col_Question[tmp_colID]).each(function (key, value) {
                        if (value.CanStudentEdit === "是") {
                            if (value.Name === "兄弟姊妹_排行") {
                                value.SelectValue = tmp_reset_data[value.Name];
                            }
                        }
                    });

                    // TODO: 取得兄弟姐妹資訊
                    _gg.connection.send({
                        service: "_.GetSibling",
                        body: '',
                        result: function (response, error, http) {
                            if (error !== null) {
                                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetSibling)\n</div>");
                            } else {
                                _gg.sibling = [];
                                $(response.Response.Sibling).each(function (index, item) {
                                    _gg.sibling.push(item);
                                });
                                _gg.SetData(tmp_colID);
                                $(".modal").modal("hide");
                            }
                        }
                    });
                    break;
                default:
                    var tmp_grade = (_gg.grade || "1");
                    $(_gg.col_Question[tmp_colID]).each(function (key, value) {
                        if (value.CanStudentEdit === "是") {
                            if (tmp_colID === 'B4' ||  tmp_colID === 'B5') {
                                if (this.Name.slice(-1) === tmp_grade) { // ex.內容1_1
                                    value.SelectValue = tmp_reset_data[value.Name];
                                }
                            } else {
                                value.SelectValue = tmp_reset_data[value.Name];
                            }
                        }
                    });
                    _gg.SetData(tmp_colID);
                    $(".modal").modal("hide");
            }
        }
    };


    var set_error_message = function(serviceName, error) {
        if (error.dsaError.status === "504") {
            if (error.dsaError.message === "已過開放填寫時間") {
                $("#" + data_scope + "_errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>儲存失敗，目前未開放填寫!</strong>\n</div>");
            } else {
                $("#" + data_scope + "_errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>儲存失敗，請稍候重試!</strong>\n</div>");
                $("#" + data_scope + " button[edit-target]").button('reset'); // TODO: 重設按鈕
            }
        } else {
            $("#" + data_scope + "_errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>x</button>\n  <strong>儲存失敗，請稍候重試!</strong>(" + serviceName +")\n</div>");
            $("#" + data_scope + " button[edit-target]").button('reset'); // TODO: 重設按鈕
        }
    };


    if (tmp_singleRecord.join("")) {
        tmp_del_request = [];
        var tmp_grade = (_gg.grade || "1");
        $(_gg.col_Question[tmp_colID]).each(function(){
            if (this.CanStudentEdit === "是") {
                if (((this.QuestionType || '').toLowerCase()) === 'single_answer') {
                    if (tmp_colID === 'B4' ||  tmp_colID === 'B5') {
                        if (this.Name.slice(-1) === tmp_grade) { // ex.內容1_1
                            tmp_del_request.push('<Key>' + this.GroupName + '_' + this.Name + '</Key>');
                        }
                    } else {
                        tmp_del_request.push('<Key>' + this.GroupName + '_' + this.Name + '</Key>');
                    }
                }
            }
        });

        _gg.connection.send({
            service: "_.DelSingleRecord",
            body: '<Request><SingleRecord>' + tmp_del_request.join("") + '</SingleRecord></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('DelSingleRecord', error);
                } else {
                    _gg.connection.send({
                        service: "_.InsertSingleRecord",
                        body: '<Request>' + tmp_singleRecord.join("") + '</Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                set_error_message('InsertSingleRecord', error);
                            } else {
                                save_singleRecord = true;
                                reset_data();
                            }
                        }
                    });
                }
            }
        });
    } else {
        save_singleRecord = true;
    }

    if (tmp_multipleRecord.join("")) {
        tmp_del_request = [];
        var tmp_grade = (_gg.grade || "1");
        $(_gg.col_Question[tmp_colID]).each(function(){
            if (this.CanStudentEdit === "是") {
                if (((this.QuestionType || '').toLowerCase()) === 'multi_answer') {
                    if (tmp_colID === 'B4' ||  tmp_colID === 'B5') {
                        if (this.Name.slice(-1) === tmp_grade) { // ex.內容1_1
                            tmp_del_request.push('<Key>' + this.GroupName + '_' + this.Name + '</Key>');
                        }
                    } else {
                        tmp_del_request.push('<Key>' + this.GroupName + '_' + this.Name + '</Key>');
                    }
                }
            }
        });

        _gg.connection.send({
            service: "_.DelMultipleRecord",
            body: '<Request><MultipleRecord>' + tmp_del_request.join("") + '</MultipleRecord></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('DelMultipleRecord', error);
                } else {
                    _gg.connection.send({
                        service: "_.InsertMultipleRecord",
                        body: '<Request>' + tmp_multipleRecord.join("") + '</Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                set_error_message('InsertMultipleRecord', error);
                            } else {
                                save_multipleRecord = true;
                                reset_data();
                            }
                        }
                    });
                }
            }
        });
    } else {
        save_multipleRecord = true;
    }

    if (tmp_semesterData.join("")) {
        tmp_del_request = [];
        $(_gg.col_Question[tmp_colID]).each(function(){
            if (((this.QuestionType || '').toLowerCase()) === 'semester') {
                if (this.CanStudentEdit === "是") {
                    tmp_del_request.push('<Key>' + this.GroupName + '_' + this.Name + '</Key>');
                }
            }
        });

        _gg.connection.send({
            service: "_.DelSemesterData",
            body: '<Request><SemesterData>' + tmp_del_request.join("") + '</SemesterData></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('DelSemesterData', error);
                } else {
                    _gg.connection.send({
                        service: "_.InsertSemesterData",
                        body: '<Request>' + tmp_semesterData.join("") + '</Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                set_error_message('InsertSemesterData', error);
                            } else {
                                save_semesterData = true;
                                reset_data();
                            }
                        }
                    });
                }
            }
        });
    } else {
        save_semesterData = true;
    }

    if (tmp_yearlyData.join("")) {
        tmp_del_request = [];
        $(_gg.col_Question[tmp_colID]).each(function(){
            if (((this.QuestionType || '').toLowerCase()) === 'yearly') {
                if (this.CanStudentEdit === "是") {
                    tmp_del_request.push('<Key>' + this.GroupName + '_' + this.Name + '</Key>');
                }
            }
        });

        _gg.connection.send({
            service: "_.DelYearlyData",
            body: '<Request><YearlyData>' + tmp_del_request.join("") + '</YearlyData></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('DelYearlyData', error);
                } else {
                    _gg.connection.send({
                        service: "_.InsertYearlyData",
                        body: '<Request>' + tmp_yearlyData.join("") + '</Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                set_error_message('InsertYearlyData', error);
                            } else {
                                save_yearlyData = true;
                                reset_data();
                            }
                        }
                    });
                }
            }
        });
    } else {
        save_yearlyData = true;
    }

    if (tmp_priorityData.join("")) {
        tmp_del_request = [];
        $(_gg.col_Question[tmp_colID]).each(function(){
            if (((this.QuestionType || '').toLowerCase()) === 'priority') {
                if (this.CanStudentEdit === "是") {
                    tmp_del_request.push('<Key>' + this.GroupName + '_' + this.Name + '</Key>');
                }
            }
        });

        _gg.connection.send({
            service: "_.DelPriorityData",
            body: '<Request><PriorityData>' + tmp_del_request.join("") + '</PriorityData></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('DelPriorityData', error);
                } else {
                    _gg.connection.send({
                        service: "_.InsertPriorityData",
                        body: '<Request>' + tmp_priorityData.join("") + '</Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                set_error_message('InsertPriorityData', error);
                            } else {
                                save_priorityData = true;
                                reset_data();
                            }
                        }
                    });
                }
            }
        });
    } else {
        save_priorityData = true;
    }

    if (tmp_relative.join("")) {
        _gg.connection.send({
            service: "_.UpdateRelative",
            body: '<Request>' + tmp_relative.join("") + '</Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('UpdateRelative', error);
                } else {
                    save_relative = true;
                    reset_data();
                }
            }
        });
    } else {
        save_relative = true;
    }

    if (tmp_colID === 'A4') {
        _gg.connection.send({
            service: "_.DelSibling",
            body: '<Request><Sibling></Sibling></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('DelSibling', error);
                } else {
                    if (tmp_sibling.join("")) {
                        _gg.connection.send({
                            service: "_.InsertSibling",
                            body: '<Request>' + tmp_sibling.join("") + '</Request>',
                            result: function (response, error, http) {
                                if (error !== null) {
                                    set_error_message('InsertSibling', error);
                                } else {
                                    save_sibling = true;
                                    reset_data();
                                }
                            }
                        });
                    } else {
                        save_sibling = true;
                        reset_data();
                    }
                }
            }
        });
    } else {
        save_sibling = true;
    }
};
