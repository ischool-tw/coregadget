// TODO: 設定編輯時資料
_gg.SetModifyData = function () {
    var data_scope;

    // TODO: 設定編輯內容
    var set_form = function (question, relative_data) {

        // TODO: 建立控制項及預設值
        var get_cotrol = function (question, arydata, aryremark, qplaceholder) {
            var qkey         = question.TagName || (question.GroupName + '_' + question.Name);
            var qoption      = question.Options;
            var usecontrol   = question.ControlType;
            qplaceholder = qplaceholder || question.Title || question.Alias || '請輸入';
            qplaceholder = qplaceholder + '...';
            var tmp_class = '', tmp_defaultState = '', tmp_remark_class = 'input-large';
            var tmp_html = '', tmp_remark_html = '', ret_html = '';
            var tmp_index = -1, qdata = '', qremark = '';

            if (qoption && qoption.item) {
                if (usecontrol === 'radio' || usecontrol === 'select' || usecontrol === 'checkbox') {
                    // TODO: 大於10個就以線性呈現
                    if (qoption.item.length > 10) {
                        tmp_class = ' inline';
                        tmp_remark_class = 'input-mini';
                    }

                    $(qoption.item).each(function (index, opt) {

                        tmp_defaultState = '';

                        // TODO: 預設值
                        tmp_index = $.inArray(opt.key, arydata);
                        if (tmp_index !== -1) {
                            if (usecontrol === 'select') {
                                tmp_defaultState = ' selected="selected"';
                            } else {
                                tmp_defaultState = ' checked="checked"';
                            }
                            qremark = aryremark[tmp_index];
                        }

                        if (opt.has_remark === "True") {
                            tmp_remark_html = '<input type="text" class="' + tmp_remark_class + '" name="' + qkey + '_remark" data-type="' + qkey + '_remark" data-index="' + index + '" placeholder="' + qplaceholder + '" value="' + qremark + '">';
                        }

                        if (usecontrol === 'select') {
                            tmp_html += '<option value="' + opt.key + '"' + tmp_defaultState + '>' + opt.key + '</option>';
                        } else  {
                            tmp_html += '<label class="' + usecontrol + tmp_class +'">' +
                                '<input type="' + usecontrol + '" name="' + qkey + '" data-type="' + qkey + '" data-index="' + index + '" value="' + opt.key + '"' + tmp_defaultState + '>' + opt.key + tmp_remark_html +
                                '</label>';
                        }
                    });

                    if (usecontrol === 'select') {
                        ret_html += '<select name="' + qkey + '" data-type="' + qkey + '"><option>' + qplaceholder + '</option>' + tmp_html + '</select>' + tmp_remark_html;

                    } else  {
                        ret_html += tmp_html;

                    }
                } else {
                    qdata = arydata[0];
                    if (usecontrol === 'textarea') {
                      ret_html = '<textarea class="input-xlarge" name="' + qkey + '" data-type="' + qkey + '" placeholder="' + qplaceholder + '" rows="3">' + qdata + '</textarea>';
                    } else {
                      ret_html = '<input type="text" class="input-large" name="' + qkey + '" data-type="' + qkey + '" placeholder="' + qplaceholder + '" value="' + qdata + '">';
                    }
                }
            } else {
                qdata = arydata[0];
                ret_html = '<input type="text" class="input-large" name="' + qkey + '" data-type="' + qkey + '" placeholder="' + qplaceholder + '" value="' + qdata + '">';
            }
            return ret_html;
        };

        // TODO: 依題目類型決定控制項要執行的方式
        var qvalue = (question.SelectValue || '');
        var qtype  = (question.QuestionType || '');
        var control_html = '';
        var alldata = [], allremark = [];
        switch (qtype.toLowerCase()) {
            case 'single_answer':
                alldata.push(qvalue.Data || '');
                allremark.push(qvalue.Remark || '');
                control_html += get_cotrol(question, alldata, allremark);
                break;
            case 'multi_answer':
                $.each(qvalue, function (index, item) {
                    alldata.push(item.Data || '');
                    allremark.push(item.Remark || '');
                });
                control_html += get_cotrol(question, alldata, allremark);
                break;
            case 'yearly':
                alldata.push(qvalue['G'+_gg.grade] || '');
                control_html += get_cotrol(question, alldata, allremark);
                break;
            case 'priority':
                var tmp_limit = (question.Limit || 10);
                for (var i = 1; i <= parseInt(tmp_limit, 10); i++) {
                    alldata   = [];
                    allremark = [];
                    if (i > 1) {
                        if (question.ControlType === '') {
                            control_html += "、";
                        }
                    }
                    alldata.push(qvalue['P'+i] || '');
                    control_html += get_cotrol(question, alldata, allremark, "第" + i + "優先");
                }
                break;
            case 'relative':
                if (question.TagName === 'IsAlive') {
                    alldata.push((relative_data[question.TagName] === 't') ? '歿':'存');
                } else {
                    alldata.push(relative_data[question.TagName] || '');
                }
                control_html += get_cotrol(question, alldata, allremark);
                break;
            case 'sibling':
                if (question.TagName) {
                    alldata.push(relative_data[question.TagName] || '');
                    control_html += get_cotrol(question, alldata, allremark);
                }
                break;
        }
        return control_html;
    };

    // TODO: 個人資料
    var set_personal = function (questions) {
        var tmp_items = [];
        $(questions).each(function (index, value) {
            tmp_items.push(
                '<div class="control-group">' +
                '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                '    <div class="controls">' +
                set_form(value) +
                '    </div>' +
                '  </label>' +
                '</div>'
            );
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // TODO: 監護人資料
    var set_guardian = function (questions) {
        var tmp_items = [];
        $(questions).each(function (index, value) {
            tmp_items.push(
                '<div class="control-group">' +
                '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                '    <div class="controls">' +
                set_form(value) +
                '    </div>' +
                '  </label>' +
                '</div>'
            );
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // TODO: 尊親屬資料資料
    var set_parents = function (questions) {
        var tmp_items = [];

        tmp_items.push(
            '<div class="accordion" id="accordion' + data_scope + '">'
        );

        $(_gg.relative).each(function (key, relatives) {
            tmp_items.push(
                '  <div class="accordion-group">' +
                '    <div class="accordion-heading">' +
                '      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion' + data_scope + '" href="#collapse' + data_scope + key + '">' +
                '        <i class="icon-chevron-down pull-right"></i>' +
                relatives.Title +
                '      </a>' +
                '    </div>' +
                '    <div id="collapse' + data_scope + key + '" class="accordion-body collapse" unique-value="' + relatives.UID + '">' +
                '      <div class="accordion-inner">'
            );

            $(questions).each(function (index, value) {
                if (value.TagName !== 'Title') {
                    tmp_items.push(
                        '<div class="control-group">' +
                        '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                        '    <div class="controls">' +
                        set_form(value, relatives) +
                        '    </div>' +
                        '  </label>' +
                        '</div>'
                    );
                }
            });

            tmp_items.push(
                '      </div>' +
                '    </div>' +
                '  </div>'
            );
        });

        tmp_items.push('</div>');
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));

    };

    // TODO: 兄弟姊妹資料
    var set_siblings = function (questions, run_model) {

        var tmp_items = [];

        var tmp_resource;

        if (run_model === 'add') {
            var tmp_obj = {};
            $(questions).each(function (index, value) {
                if (value.TagName) {
                    tmp_obj[value.TagName] = '';
                }
            });
            tmp_resource = [];
            tmp_resource.push(tmp_obj);
        } else {
            tmp_resource = _gg.sibling;
        }

        $(tmp_resource).each(function (key, siblings) {
            if (run_model === 'add') {
                key = $('#' + data_scope + ' .accordion-group').size();
            }

            tmp_items.push(
                '  <div class="accordion-group">' +
                '    <div class="accordion-heading">' +
                '      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion' + data_scope + '" href="#collapse' + data_scope + key + '">' +
                '        <i class="icon-chevron-down pull-right"></i>' +
                '        <input type="text" class="input-large" data-type="家庭狀況_兄弟姊妹_姓名" placeholder="請輸入姓名" value="' + siblings.Name + '">' +
                '      </a>' +
                '    </div>' +
                '    <div id="collapse' + data_scope + key + '" class="accordion-body collapse">' +
                '      <div class="accordion-inner">'
            );

            $(questions).each(function (index, value) {
                if (value.Name === '兄弟姊妹_排行') {
                    if (value.SelectValue && value.SelectValue.Data) {
                        $('#' + data_scope + ' [name=AnySiblings][value=more]').trigger('click');
                        $('#' + data_scope + ' [data-type=家庭狀況_兄弟姊妹_排行]').val(value.SelectValue.Data);
                    } else {
                        $('#' + data_scope + ' [name=AnySiblings][value=1]').trigger('click');
                    }
                } else if (value.TagName === 'Name') {
                } else {
                    tmp_items.push(
                        '<div class="control-group">' +
                        '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                        '    <div class="controls">' +
                        set_form(value, siblings) +
                        '    </div>' +
                        '  </label>' +
                        '</div>'
                    );
                }
            });

            tmp_items.push(
                '      </div>' +
                '    </div>' +
                '  </div>'
            );
        });

        if (run_model === 'add') {
            $('#accordionsiblings').append(tmp_items.join(""));
        } else {
            $('#accordionsiblings').html(tmp_items.join(""));
        }
    };

    // TODO: 身高體重
    var set_psize = function (questions) {

        var tmp_data = '', tmp_key = '';

        $(questions).each(function (key, value) {
            tmp_data  = value.SelectValue;
            tmp_key   = value.GroupName + '_' + value.Name;

            $('#' + data_scope + ' [data-type=' + tmp_key + 'S1a]').attr("value", tmp_data.S1a);
            $('#' + data_scope + ' [data-type=' + tmp_key + 'S1b]').attr("value", tmp_data.S1b);
            $('#' + data_scope + ' [data-type=' + tmp_key + 'S2a]').attr("value", tmp_data.S2a);
            $('#' + data_scope + ' [data-type=' + tmp_key + 'S2b]').attr("value", tmp_data.S2b);
            $('#' + data_scope + ' [data-type=' + tmp_key + 'S3a]').attr("value", tmp_data.S3a);
            $('#' + data_scope + ' [data-type=' + tmp_key + 'S3b]').attr("value", tmp_data.S3b);
        });
    };

    // TODO: 家庭訊息
    var set_home = function (questions) {
        var tmp_items = [];
        $(questions).each(function (index, value) {
            tmp_items.push(
                '<div class="control-group">' +
                '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                '    <div class="controls">' +
                set_form(value) +
                '    </div>' +
                '  </label>' +
                '</div>'
            );
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // TODO: 學習
    var set_learn = function (questions) {
        var tmp_items = [];
        $(questions).each(function (index, value) {
            tmp_items.push(
                '<div class="control-group">' +
                '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                '    <div class="controls">' +
                set_form(value) +
                '    </div>' +
                '  </label>' +
                '</div>'
            );
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // TODO: 幹部資訊
    var set_cadre = function (questions) {

        var tmp_data = '', tmp_key = '';

        $(questions).each(function (key, value) {
            tmp_data  = value.SelectValue;
            tmp_key   = value.GroupName + '_' + value.Name;

            $('#' + data_scope + ' [data-type=' + tmp_key + 'a]').html(tmp_data['S' + _gg.grade + 'a'] || '');
            $('#' + data_scope + ' [data-type=' + tmp_key + 'b]').html(tmp_data['S' + _gg.grade + 'b'] || '');
        });
        var tmp_chinese_grade;
        switch (_gg.grade) {
            case 1:
                tmp_chinese_grade = "一";
                break;
            case 2:
                tmp_chinese_grade = "二";
                break;
            case 3:
                tmp_chinese_grade = "三";
                break;
        }
        $('#' + data_scope + ' [data-type=grade]').html(tmp_chinese_grade);
    };

    // TODO: 自我認識
    var set_oneself = function (questions) {
        var tmp_items = [];
        var tmp_grade = (_gg.grade || 1);
        $(questions).each(function (index, value) {
             if (value.Name.slice(-1) === tmp_grade) { // ex.個性_1
                if (value.Name.indexOf("填寫日期") === -1) {
                    tmp_items.push(
                        '<div class="control-group">' +
                        '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                        '    <div class="controls">' +
                        set_form(value) +
                        '    </div>' +
                        '  </label>' +
                        '</div>'
                    );
                }
            }
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // TODO: 生活感想
    var set_life = function (questions) {

        var tmp_data = '', tmp_key = '', tmp_html = '', tmp_items = [];
        var tmp_grade = (_gg.grade || 1);

        $(questions).each(function (key, value) {
            if (value.Name.slice(-1) === tmp_grade) { // ex.內容1_1
                if (value.Name.indexOf("填寫日期") === -1) {
                    tmp_data    = value.SelectValue;
                    tmp_key   = value.GroupName + '_' + value.Name;
                    tmp_html    = '';

                    tmp_html = '' +
                        '<div class="control-group">' +
                        '    <label>' + value.Alias + '</label>' +
                        '    <textarea class="input-xxlarge" data-type="' + tmp_key + '" placeholder="請輸入..." rows="3">' + (value.Data || '') + '</textarea>' +
                        '</div>';

                    tmp_items.push(tmp_html);
                }
            }

            $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
        });

    };

    // TODO: 畢業後規劃
    var set_plan = function (questions) {
        var tmp_items = [];
        $(_gg.col_Question.C1).each(function (index, value) {
            tmp_items.push(
                '<div class="control-group">' +
                '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                '    <div class="controls">' +
                set_form(value) +
                '    </div>' +
                '  </label>' +
                '</div>'
            );
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // TODO: 自傳
    var set_memoir = function (questions) {
        var tmp_items = [];
        $(_gg.col_Question.D1).each(function (index, value) {
            if (value.CanStudentEdit === '是') {
                if (value.Name === '喜歡的人' ||
                    value.Name === '最要好的朋友' ||
                    value.Name === '最喜歡做的事' ||
                    value.Name === '最不喜歡做的事' ||
                    value.Name === '國中時的學校生活' ||
                    value.Name === '最快樂的回憶') {
                    tmp_items.push('<hr />');
                }

                if (value.Name !=='填寫日期') {
                    tmp_items.push(
                        '<div class="control-group">' +
                        '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                        '    <div class="controls">' +
                        set_form(value) +
                        '    </div>' +
                        '  </label>' +
                        '</div>'
                    );
                }
            }
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    return {
        setForm: function (scope){
            data_scope = scope;
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
                        set_siblings(_gg.col_Question.A4, 'edit');
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
            }

        },
        addSibling: function () {
            data_scope = 'siblings';
            set_siblings(_gg.col_Question.A4, 'add');
        }
    }
}();
