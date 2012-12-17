var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.catering_service.student");
_gg.timelist = {};
_gg.opening_state='no';
_gg.subject = {};
_gg.answers = {};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case '501':
                        tmp_msg = '<strong>很抱歉，您無此權限!</strong>';
                        break;
                    case '502':
                        tmp_msg = '<strong>儲存失敗，尚未開放填寫!</strong>';
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

jQuery(function () {

    $.metadata.setType("attr", "validate");
    $.validator.setDefaults({
        debug: false, // 為 true 時不會 submit
        highlight: function(element) {
            // 將未通過驗證的表單元素設置高亮度
            $(element).parentsUntil('tr').parent('tr').addClass("error");
        },
        unhighlight: function(element) {
            // 與 highlight 相反
            $(element).parentsUntil('tr').parent('tr').removeClass("error");
        }
    });

    $('body').on('click', '#save-data', function() {
        if ($("#questions form").valid()) {
            $(this).button('loading'); // TODO: 按鈕為處理中
            _gg.SetReply();
        }
    });

    // TODO: 確認是否為班級的團膳股長
    _gg.connection.send({
        service: "_.GetIsChief",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetIsChief', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.CateringServiceChief : void 0) != null) {
                    $(response.Response.CateringServiceChief).each(function(index, item) {
                        _gg.class_id = item.ClassID;
                        if (item.Chief === 'True') {
                            // TODO: 取得問卷清單
                            _gg.GetSurveys();
                        } else {
                            // TODO: 不是團膳股長
                            $('#container').html('您不是團膳股長，無法使用本功能');
                        }
                    });
                } else {
                    // TODO: 不是團膳股長
                    $('#container').html('您不是團膳股長，無法使用本功能');
                }
            }
        }
    });
});


// TODO: 取得問卷清單 + 填寫期間
_gg.GetSurveys = function() {
    _gg.connection.send({
         service: "_.GetSurvey",
         body: '',
         result: function (response, error, http) {
            if (error !== null) {
                set_error_message('#mainMsg', 'GetSurvey', error);
            } else {
                var _ref;
                _gg.surveys = [];
                if (((_ref = response.Response) != null ? _ref.Survey : void 0) != null) {
                    $(response.Response.Survey).each(function(index, item) {
                        _gg.surveys[index] = item;
                        if (index === 0) {
                            _gg.survey = item;
                            $('#opening').html((item.Name || '') + ' 填寫期間：' + (item.BeginDate || '') + ' ~ ' + (item.EndDate || ''));

                            // TODO: 取得問卷回覆內容
                            _gg.connection.send({
                                service: "_.GetReply",
                                body: '<Request><Condition><SurveyID>' + (_gg.survey.SurveyID || '') + '</SurveyID></Condition></Request>',
                                result: function (response, error, http) {
                                    if (error !== null) {
                                        _gg.set_error_message('#mainMsg', 'GetReply', error);
                                    } else {
                                        var _ref, _ref2, _ref3;
                                        if (((_ref = response.Response) != null ? (_ref1 = _ref.Reply) != null ? (_ref2 = _ref1.Answer) != null ? (_ref3 = _ref2.Answers) != null ? _ref3.Answer : void 0 : void 0 : void 0 : void 0) != null) {
                                            _gg.supplier_id = (response.Response.Reply.SuppliersID || '');
                                            $(response.Response.Reply.Answer.Answers.Answer).each(function(index, item) {
                                                _gg.answers['q' + item.QuestionID] = item['@text'];
                                            });
                                        }
                                        // TODO: 取得廠商清單
                                        _gg.GetSuppliers();
                                    }
                                }
                            });
                        }
                    });
                } else {
                    $('#opening').html('尚未開放填寫');
                }
            }
        }
    });
};

// TODO: 取得廠商清單
_gg.GetSuppliers = function() {
    $('form[date-type=suppliers]').html('');
    _gg.connection.send({
        service: "_.GetSuppliers",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetSuppliers', error);
            } else {
                var _ref, items = [];
                if (((_ref = response.Response) != null ? _ref.Suppliers : void 0) != null) {
                    $(response.Response.Suppliers).each(function(index, item) {
                        items.push(
                            '<option value="' + (item.SupplierID || '') + '">' + (item.Company || '') + '</option>'
                        );
                    });
                }
                var ret = items.join('');
                if (ret) {
                    $('form[date-type=suppliers]').html('廠商：<select id="suppliers">' + ret + '</select>');
                    if (_gg.supplier_id) {
                        $('#suppliers').val(_gg.supplier_id);
                    }

                    _gg.GetQuestion();
                } else {
                    $('form[date-type=suppliers]').html('目前尚無廠商');
                }
            }
        }
    });
};

// TODO: 問卷內容
_gg.GetQuestion = function() {
    var survey_id = _gg.survey.SurveyID;
    $('#questions').html('');
    if (survey_id) {
        // TODO: 取得問卷內容
        _gg.connection.send({
            service: "_.GetQuestion",
            body: '<Request><Condition><SurveyID>' + survey_id + '</SurveyID></Condition></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetQuestion', error);
                } else {
                    var _ref, items = [];
                    _gg.questions = {};
                    if (((_ref = response.Response) != null ? _ref.Question : void 0) != null) {
                        var pre_qid = '', options = [];
                        $(response.Response.Question).each(function(index, item) {
                            var valid = '';

                            if (pre_qid !== item.QuestionID) {
                                if (index !== 0) {
                                    items.push('<label for="q' + pre_qid + '" class="error">必選</label>');
                                    items.push('</td></tr>');
                                    _gg.questions['q' + pre_qid].Options = options;
                                }

                                // TODO: 建立新的題目
                                _gg.questions['q' + item.QuestionID] = {
                                    QuestionID   : item.QuestionID,
                                    Required     : item.Required,
                                    Title        : item.Title,
                                    Type         : item.Type,
                                    DisplayOrder : item.DisplayOrder,
                                    Options      : []
                                };

                                items.push(
                                    '<tr>' +
                                    '    <td>' + (item.Title || '') + '</td>' +
                                    '    <td>'
                                );

                                // TODO: 必填
                                if (item.Required === 't') {
                                    valid = ' required';
                                    valid = 'validate="required:true"';
                                }

                                pre_qid = item.QuestionID;
                            } else {
                                options.push({
                                    OptionItem  : item.OptionItem,
                                    OptionOrder : item.OptionOrder
                                });
                            }

                            // TODO: 預設值
                            var attr_txt = '';

                            // TODO: 選項
                            if (item.Type === '單選題') {
                                // TODO: 預設值
                                if (_gg.answers['q' + item.QuestionID]) {
                                    if (_gg.answers['q' + item.QuestionID] === item.OptionItem) {
                                        attr_txt = ' checked="checked"';
                                    }
                                }

                                items.push(
                                    '<label class="radio">' +
                                    '    <input type="radio" name="q' + (item.QuestionID || '') + '" value="' + (item.OptionItem || '') + '" ' + attr_txt + valid + '>' +
                                    '<span>' + (item.OptionItem || '') + '</span>' +
                                    '</label>'
                                );
                            } else if (item.Type === '問答題') {
                                 // TODO: 預設值
                                if (_gg.answers['q' + item.QuestionID]) {
                                    attr_txt = _gg.answers['q' + item.QuestionID];
                                }
                                items.push(
                                    '<textarea rows="5" name="q' + (item.QuestionID || '') + '" input-xxlarge" ' + valid + '>' + attr_txt + '</textarea>'
                                );
                            }
                        });
                        _gg.questions['q' + pre_qid].Options = options;
                    }

                    var html_txt = items.join('');
                    if (html_txt) {
                        var ret = '<form class="form-horizontal my-cmxform">' +
                            '<table class="table table-bordered table-striped">' +
                            '<thead>' +
                            '  <tr>' +
                            '    <th>題項</th>' +
                            '    <th>選項</th>' +
                            '  </tr>' +
                            '</thead>' +
                            '<tbody>' +
                            html_txt +
                            '<label for="q' + pre_qid + '" class="error">必填</label>' +
                            '</td></tr>' +
                            '</tbody></table>' +
                            '<div class="my-sure">' +
                            '    <button type="button" class="btn btn-success" id="save-data" autocomplete="off" data-loading-text="儲存中...">送出</button>' +
                            ' <button type="reset" class="btn" data-original-title="">取消</button>' +
                            '</div>' +
                            '</form>';
                        $('#questions').html(ret);
                    } else {
                        $('#questions').html('題目尚未建置');
                    }
                }
            }
        });
    }
};


// TODO: 更新問卷回覆
_gg.SetReply = function() {
    var class_id = _gg.class_id;
    var supplier_id = $('#suppliers').val() || '';
    var survey_id = _gg.survey.SurveyID;

    if (class_id && supplier_id && survey_id) {
        var computerName = '';
        try
        {
            var network = new ActiveXObject('WScript.Network');
            computerName = network.computerName;
        }
        catch (e) {
        }

        var answer = [];
        if (_gg.questions) {
            $.each(_gg.questions, function(index, item) {
                var option = '';
                if (item.Type === '單選題') {
                    option = $('[name=' + index + ']:checked').val() || '';
                } else if (item.Type === '問答題') {
                    option = $('[name=' + index + ']').val() || '';
                }
                answer.push('<Answer QuestionID="' + (item.QuestionID || '') + '" Delimiter="">' + option + '</Answer>');
            });
        }

        var request = '<Reply>' +
            '<ClassID>' + (class_id || '') + '</ClassID>' +
            '<SuppliersID>' + (supplier_id || '') + '</SuppliersID>' +
            '<SurveyID>' + (survey_id || '') + '</SurveyID>' +
            '<Answer><Answers>' + answer.join('') + '</Answers></Answer>' +
            '<Log><Log RespondentsID="@@MyStudentID" RespondentsType="STUDENT" FillTime="@@GetNow" HostName="' + computerName + '" HostAddress="@@MyIPAddress" /></Log>' +
            '</Reply>';

        _gg.connection.send({
            service: "_.SetReply",
            body: '<Request>' + request + '</Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    $('#save-data').button('reset');
                    _gg.set_error_message('#mainMsg', 'SetReply', error);
                } else {
                    $('#save-data').button('reset');
                    $('#mainMsg').html('<div class="alert alert-success">儲存成功！</div>');
                    setTimeout("$('#mainMsg').html('')", 1500);
                }
            }
        });
    } else {
        $('#mainMsg').html('<div class="alert alert-error"><button class="close" data-dismiss="alert">×</button>資料不足無法送出！</div>');
    }
};