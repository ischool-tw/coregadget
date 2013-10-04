// 設定編輯時資料
_gg.SetModifyData = function () {
    var data_scope;

    // 設定編輯內容
    var set_form = function (question, relative_data) {

        // 建立控制項及預設值
        var get_cotrol = function (question, arydata, aryremark, qplaceholder) {
            var qkey         = question.TagName || (question.GroupName + '_' + question.Name);
            var qoption      = question.Options;
            var usecontrol   = question.ControlType;
            qplaceholder = qplaceholder || question.Title || question.Alias || '請輸入';
            qplaceholder = qplaceholder + '...';
            var qValidator   = (question.Validator) ? ' ' + question.Validator : '';
            var tmp_class = '', tmp_defaultState = '', tmp_remark_class = 'input-large';
            var tmp_html = '', tmp_remark_html = '', ret_html = '';
            var tmp_index = -1, qdata = '', qremark = '';

            if (qoption && qoption.item) {
                if (usecontrol === 'radio' || usecontrol === 'select' || usecontrol === 'checkbox') {
                    // 大於10個就以線性呈現
                    if (qoption.item.length > 10) {
                        tmp_class = ' inline';
                        tmp_remark_class = 'input-mini';
                    }

                    $(qoption.item).each(function (index, opt) {

                        tmp_defaultState = '';
                        qremark = '';
                        tmp_remark_html = '';

                        // 預設值
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
                            tmp_remark_html = '<input type="text" class="' + tmp_remark_class + '" name="' + qkey + '_remark" data-type="' + qkey + '_remark" valide-type="remark" data-index="' + index + '" placeholder="' + qplaceholder + '" value="' + qremark + '">';
                        }

                        if (usecontrol === 'select') {
                            tmp_html += '<option value="' + opt.key + '"' + tmp_defaultState + '>' + opt.key + '</option>';
                        } else  {
                            tmp_html += '<label class="' + usecontrol + tmp_class +'">' +
                                '<input type="' + usecontrol + '" class="" name="' + qkey + '" data-type="' + qkey + '" data-index="' + index + '" value="' + opt.key + '"' + tmp_defaultState + '>' + opt.key + tmp_remark_html +
                                '</label>';
                        }
                    });

                    if (usecontrol === 'select') {
                        ret_html += '<select class="" name="' + qkey + '" data-type="' + qkey + '"><option value=""></option>' + tmp_html + '</select>' + tmp_remark_html;

                    } else  {
                        ret_html += tmp_html;

                    }
                } else {
                    qdata = arydata[0];
                    if (usecontrol === 'textarea') {
                      ret_html = '<textarea class="input-xlarge" name="' + qkey + '" data-type="' + qkey + '" placeholder="' + qplaceholder + '" rows="3">' + qdata + '</textarea>';
                    } else {
                      ret_html = '<input type="text" class="' +qValidator+ ' input-large" name="' + qkey + '" data-type="' + qkey + '" placeholder="' + qplaceholder + '" value="' + qdata + '">';
                    }
                }
            } else {
                qdata = arydata[0];
                if (usecontrol === 'textarea') {
                  ret_html = '<textarea class="input-xlarge" name="' + qkey + '" data-type="' + qkey + '" placeholder="' + qplaceholder + '" rows="3">' + qdata + '</textarea>';
                } else {
                  ret_html = '<input type="text" class="' +qValidator+ ' input-large" name="' + qkey + '" data-type="' + qkey + '" placeholder="' + qplaceholder + '" value="' + qdata + '">';
                }
            }
            return ret_html;
        };

        // 依題目類型決定控制項要執行的方式
        var qvalue = (question.SelectValue || '');
        var qtype  = (question.QuestionType || '');
        var qplaceholder = (question.Placeholder || '');
        var control_html = '';
        var alldata = [], allremark = [];
        switch (qtype.toLowerCase()) {
            case 'single_answer':
                alldata.push(qvalue.Data || '');
                allremark.push(qvalue.Remark || '');
                control_html += get_cotrol(question, alldata, allremark, qplaceholder);
                break;
            case 'multi_answer':
                $.each(qvalue, function (index, item) {
                    alldata.push(item.Data || '');
                    allremark.push(item.Remark || '');
                });
                control_html += get_cotrol(question, alldata, allremark, qplaceholder);
                break;
            case 'yearly':
                if (question.ControlType === 'radio' || question.ControlType === 'checkbox') {
                    if (qvalue['G'+_gg.grade]) {
                        alldata = qvalue['G'+_gg.grade].split(',');
                    } else {
                        alldata.push('');
                    }
                } else {
                    alldata.push(qvalue['G'+_gg.grade] || '');
                }

                control_html += get_cotrol(question, alldata, allremark, qplaceholder);
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
                    if (relative_data[question.TagName] === 't') {
                        alldata.push('存');
                    } else if (relative_data[question.TagName] === 'f') {
                        alldata.push('歿');
                    } else {
                        alldata.push('');
                    }
                } else {
                    alldata.push(relative_data[question.TagName] || '');
                }
                control_html += get_cotrol(question, alldata, allremark, qplaceholder);
                break;
            case 'sibling':
                if (question.TagName) {
                    alldata.push(relative_data[question.TagName] || '');
                    control_html += get_cotrol(question, alldata, allremark, qplaceholder);
                }
                break;
        }
        return control_html;
    };

    // 個人資料
    var set_personal = function (questions) {
        var tmp_items = [];
        $(questions).each(function (index, value) {
            if (value.CanTeacherEdit === "是") {
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
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // 監護人資料
    var set_guardian = function (questions) {
        var tmp_items = [];
        $(questions).each(function (index, value) {
            if (value.CanTeacherEdit === "是") {
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
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // 尊親屬資料資料
    var set_parents = function (questions, run_model) {

        var tmp_items = [];

        var tmp_resource;

        if (run_model === 'edit') {
            tmp_resource = _gg.relative;
        }

        var tmp_name_edit = false, tmp_name_obj = {};
        $(questions).each(function (index, value) {
            if (run_model === 'add') {
                var tmp_obj = {};
                $(questions).each(function (index, value) {
                    if (value.CanTeacherEdit === "是") {
                        if (value.TagName) {
                            tmp_obj[value.TagName] = '';
                        }
                    }
                });
                tmp_resource = [];
                tmp_resource.push(tmp_obj);
            }

            if (value.Name === '直系血親_姓名') {
                if (value.CanTeacherEdit === "是") {
                    tmp_name_edit = true;
                    tmp_name_obj = value;
                }
            }

        });

        $(tmp_resource).each(function (key, relatives) {
            var tmp_number;
            if (run_model === 'add') {
                tmp_number = ($('#parents-add-data').attr("new-id") || 0);
            } else {
                tmp_number = key;
            }
            $('#parents-add-data').attr("new-id", parseInt(tmp_number, 10) + 1);

            tmp_items.push(
                '  <div class="accordion-group">' +
                '    <div class="accordion-heading">' +
                '      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion' + data_scope + '" href="#collapse' + data_scope + tmp_number + '">' +
                '        <i class="icon-chevron-down pull-right"></i>'
            );

            if (tmp_name_edit) {
                tmp_items.push(
                    set_form(tmp_name_obj, relatives) +
                    '        <button class="btn" data-action="del"><i class="icon-minus-sign"></i>刪除</button>'
                );
            } else {
                tmp_items.push(relatives.Title || '&nbsp;');
            }

            tmp_items.push(
                '      </a>' +
                '    </div>' +
                '    <div id="collapse' + data_scope + tmp_number + '" class="accordion-body collapse" unique-value="' + relatives.UID + '">' +
                '      <div class="accordion-inner">'
            );

            $(questions).each(function (index, value) {
                if (value.CanTeacherEdit === "是") {
                    if (value.Name !== '直系血親_姓名') {
                        var tmp_x = set_form(value, relatives);
                        var tmp_searchvalue = ' name="' + $(tmp_x).attr("name") + '"';
                        var tmp_newvalue = ' name="' + $(tmp_x).attr("name") + key + '"';
                        tmp_x = tmp_x.replace(tmp_searchvalue, tmp_newvalue);

                        if (value.Name === '直系血親_稱謂') {
                            var tmp_class1 = ' class="' + $(tmp_x).attr("class") + '"';
                            var tmp_class2 = ' class="' + $(tmp_x).attr("class") + " distincttitles {notEqualToGroup: ['.distincttitles']}" + '"';
                            tmp_x = tmp_x.replace(tmp_class1, tmp_class2);
                        }

                        tmp_items.push(
                            '<div class="control-group">' +
                            '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                            '    <div class="controls">' +
                            tmp_x +
                            '    </div>' +
                            '  </label>' +
                            '</div>'
                        );
                    }
                }
            });

            tmp_items.push(
                '      </div>' +
                '    </div>' +
                '  </div>'
            );
        });

        if (run_model === 'add') {
            $('#accordionparents').append(tmp_items.join(""));
        } else {
            $('#accordionparents').html(tmp_items.join(""));
        }

        // 尊親屬刪除鈕
        $('#accordionparents [data-action=del]').bind('click', function () {
            $(this).closest(".accordion-group").remove();
        });

    };

    // 兄弟姊妹資料
    var set_siblings = function (questions, run_model) {

        var tmp_items = [];

        var tmp_resource;

        if (run_model === 'edit') {
            tmp_resource = _gg.sibling;
        }

        var tmp_name_edit = false, tmp_name_obj = {};
        $(questions).each(function (index, value) {
            if (run_model === 'add') {
                var tmp_obj = {};
                $(questions).each(function (index, value) {
                    if (value.CanTeacherEdit === "是") {
                        if (value.TagName) {
                            tmp_obj[value.TagName] = '';
                        }
                    }
                });
                tmp_resource = [];
                tmp_resource.push(tmp_obj);
            }
            if (value.Name === '兄弟姊妹_排行') {
                if (run_model === 'edit') {
                    if (value.SelectValue && value.SelectValue.Data) {
                        $('#' + data_scope + ' [name=AnySiblings][value=more]').trigger('click');
                        $('#' + data_scope + ' [data-type=家庭狀況_兄弟姊妹_排行]').val(value.SelectValue.Data);
                    } else {
                        $('#' + data_scope + ' [name=AnySiblings][value=1]').trigger('click');
                    }
                }
            } else if (value.Name === '兄弟姊妹_姓名') {
                if (value.CanTeacherEdit === "是") {
                    tmp_name_edit = true;
                    tmp_name_obj = value;
                }
            }
        });

        $(tmp_resource).each(function (key, siblings) {
            var tmp_number;
            if (run_model === 'add') {
                tmp_number = $('#siblings-add-data').attr("new-id") || 0;
            } else {
                tmp_number = key;
            }
            $('#siblings-add-data').attr("new-id", parseInt(tmp_number, 10) + 1);

            tmp_items.push(
                '  <div class="accordion-group">' +
                '    <div class="accordion-heading">' +
                '      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion' + data_scope + '" href="#collapse' + data_scope + tmp_number + '">' +
                '        <i class="icon-chevron-down pull-right"></i>'
            );

            if (tmp_name_edit) {
                tmp_items.push(
                    set_form(tmp_name_obj, siblings) +
                    '        <button class="btn" data-action="del"><i class="icon-minus-sign"></i>刪除</button>'
                );
            } else {
                tmp_items.push(siblings.Name || '&nbsp;');
            }


            tmp_items.push(
                '      </a>' +
                '    </div>' +
                '    <div id="collapse' + data_scope + tmp_number + '" class="accordion-body collapse">' +
                '      <div class="accordion-inner">'
            );

            $(questions).each(function (index, value) {
                if (value.Name === '兄弟姊妹_排行') {
                } else if (value.Name === '兄弟姊妹_姓名') {
                } else {
                    if (value.CanTeacherEdit === "是") {
                        var tmp_x = set_form(value, siblings);
                        var tmp_searchvalue = ' name="' + $(tmp_x).attr("name") + '"';
                        var tmp_newvalue = ' name="' + $(tmp_x).attr("name") + tmp_number + '"';
                        tmp_x = tmp_x.replace(tmp_searchvalue, tmp_newvalue);
                        tmp_items.push(
                            '<div class="control-group">' +
                            '  <label class="control-label">' + (value.Title || value.Alias || '') + '</label>' +
                            '    <div class="controls">' +
                            tmp_x +
                            '    </div>' +
                            '  </label>' +
                            '</div>'
                        );
                    }
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

        // 兄弟姊妹刪除鈕
        $('#accordionsiblings [data-action=del]').bind('click', function () {
            $(this).closest(".accordion-group").remove();
        });
    };

    // 身高體重
    var set_psize = function (questions) {
        $('#' + data_scope + ' input:text').val('');

        var target = $('#'+ data_scope);
        $(_gg.contrastGrade).each(function(index, contrast){
            target.find('span[js="grade' + index + '"]').html(contrast.TrueGradeYear);
        });

        $(questions).each(function (key, value) {
            if (value.CanTeacherEdit === "是") {
                var tmp_data  = value.SelectValue;
                var tmp_key   = value.GroupName + '_' + value.Name;

                if (tmp_data) {
                    $('#' + data_scope + ' [data-type=' + tmp_key + 'S1a]').val(tmp_data.S1a);
                    $('#' + data_scope + ' [data-type=' + tmp_key + 'S1b]').val(tmp_data.S1b);
                    $('#' + data_scope + ' [data-type=' + tmp_key + 'S2a]').val(tmp_data.S2a);
                    $('#' + data_scope + ' [data-type=' + tmp_key + 'S2b]').val(tmp_data.S2b);
                    $('#' + data_scope + ' [data-type=' + tmp_key + 'S3a]').val(tmp_data.S3a);
                    $('#' + data_scope + ' [data-type=' + tmp_key + 'S3b]').val(tmp_data.S3b);
                }
            }
        });
    };

    // 家庭訊息
    var set_home = function (questions) {
        var tmp_items = [];
        $(questions).each(function (index, value) {
            if (value.CanTeacherEdit === "是") {
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
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // 學習
    var set_learn = function (questions) {
        var tmp_items = [];
        $(questions).each(function (index, value) {
            if (value.CanTeacherEdit === "是") {
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
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // 幹部資訊
    var set_cadre = function (questions) {
        $('#' + data_scope + ' input:text').val('');

        $(questions).each(function (key, value) {
            if (value.CanTeacherEdit === "是") {
                var tmp_data  = value.SelectValue;
                var tmp_key   = value.GroupName + '_' + value.Name;
                if (tmp_data) {
                    $('#' + data_scope + ' [data-type=' + tmp_key + 'a]').val(tmp_data['S' + _gg.grade + 'a'] || '');
                    $('#' + data_scope + ' [data-type=' + tmp_key + 'b]').val(tmp_data['S' + _gg.grade + 'b'] || '');
                }
            }
        });

        var trueGradeYear = _gg.contrastGrade[_gg.grade].TrueGradeYear || '';
        $('#' + data_scope + ' [data-type=grade]').html(trueGradeYear);
    };

    // 自我認識
    var set_oneself = function (questions) {
        var tmp_items = [];
        var tmp_grade = (_gg.grade || "1");
        $(questions).each(function (index, value) {
            if (value.CanTeacherEdit === "是") {
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
            }
        });
        $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
    };

    // 生活感想
    var set_life = function (questions) {

        var tmp_items = [];
        var tmp_grade = (_gg.grade || "1");

        $(questions).each(function (key, value) {
            if (value.CanTeacherEdit === "是") {
                if (value.Name.slice(-1) === tmp_grade) { // ex.內容1_1
                    if (value.Name.indexOf("填寫日期") === -1) {
                        var tmp_key = value.GroupName + '_' + value.Name;

                        var tmp_html = '' +
                            '<div class="control-group">' +
                            '    <label>' + value.Alias + '</label>' +
                            set_form(value) +
                            '</div>';

                        tmp_items.push(tmp_html);
                    }
                }
                $('#' + data_scope + ' fieldset').html(tmp_items.join(""));
            }
        });

    };

    // 畢業後規劃
    var set_plan = function (questions) {
        $(questions).each(function (index, value) {
            if (value.CanTeacherEdit === "是") {
                var tmp_key = value.GroupName + '_' + value.Name;
                $('#' + data_scope + ' [data-type=' + tmp_key + ']').html(set_form(value));
            }
        });
    };

    // 自傳
    var set_memoir = function (questions) {
        var tmp_items = [];
        $(questions).each(function (index, value) {
            if (value.CanTeacherEdit === '是') {
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

    // 晤談紀錄
    var set_talk = function () {
        var item = _gg.editInterview;

        var date1 = (item.InterviewDate) ? $.formatDate(new Date(item.InterviewDate), "yyyyMMdd") : '';
        $("#InterviewDate").val(date1);

        $("#InterviewNo").val(item.InterviewNo || '');
        $("#InterviewTime").val(item.InterviewTime || '');
        $("#Place").val(item.Place || '');
        $("#Cause").val(item.Cause || '');
        $("#ContentDigest").val(item.ContentDigest || '');
        $("#InterviewType").val(item.InterviewType || '');
        $("#IntervieweeType").val(item.IntervieweeType || '');
        $('#Attendees :checked').removeAttr("checked");
        $('#CounselType :checked').removeAttr("checked");
        $('#CounselTypeKind :checked').removeAttr("checked");

        var setDefault = function(id, content) {
            var attr_str = '';
            $(content.Item).each(function(index, item){
                if (index !== 0) {
                    attr_str += ',';
                }
                attr_str += '[value=' + item.name + ']';
                switch (id) {
                    case 'Attendees':
                        if (item.name === '其他') {
                            $("#AttendeesOtherRemark").val(item.remark || '');
                        }
                        break;
                    case 'CounselType':
                        switch (item.name) {
                            case '轉介':
                                $("#CounselType1Remark").val(item.remark || '');
                                break;
                            case '就醫':
                                $("#CounselType2Remark").val(item.remark || '');
                                break;
                            case '其他':
                                $("#CounselTypeOtherRemark").val(item.remark || '');
                                break;
                        }
                        break;
                    case 'CounselTypeKind':
                        if (item.name === '其他') {
                            $("#CounselTypeKindOtherRemark").val(item.remark || '');
                        }
                        break;
                }

            });

            if (attr_str) {
                $("#" + id + " :checkbox").filter(attr_str).attr("checked", "checked");
            }
        }


        setDefault('Attendees', item.Attendees);
        setDefault('CounselType', item.CounselType);
        setDefault('CounselTypeKind', item.CounselTypeKind);

        //$("#TeacherName").html(item.TeacherName || '') ;
    };

    return {
        setForm: function (scope){
            data_scope = scope;
            // 編輯畫面
            if (data_scope) {
                switch (data_scope) {
                    case 'personal':
                        set_personal(_gg.col_Question.A1);
                        break;
                    case 'guardian':
                        set_guardian(_gg.col_Question.A2);
                        break;
                    case 'parents':
                        set_parents(_gg.col_Question.A3, 'edit');
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
                    case 'talk':
                        set_talk();
                        break;
                }
            }
            $("#" + data_scope + " form").validate();
        },
        addParent: function () {
            // 新增尊親屬
            data_scope = 'parents';
            set_parents(_gg.col_Question.A3, 'add');
            $("#" + data_scope + " form").validate();
        },
        addSibling: function() {
            // 新增兄弟姐妹
            data_scope = 'siblings';
            set_siblings(_gg.col_Question.A4, 'add');
            $("#" + data_scope + " form").validate();
        },
        addTalk: function() {
            // 新增晤談紀錄
            $("#InterviewDate").val('');
            $("#InterviewNo").val('');
            $("#InterviewTime").val('');
            $("#Place").val('');
            $("#Cause").val('');
            $("#ContentDigest").val('');
            $("#InterviewType").val('');
            $("#IntervieweeType").val('');
            $('#Attendees :checked').removeAttr("checked");
            $('#CounselType :checked').removeAttr("checked");
            $('#CounselTypeKind :checked').removeAttr("checked");
            $("#AttendeesOtherRemark").val('');
            $("#CounselType1Remark").val('');
            $("#CounselType2Remark").val('');
            $("#CounselTypeOtherRemark").val('');
            $("#CounselTypeKindOtherRemark").val('');
        },
        setTalkValidRules: function() {
            $("#talk form").validate({
                rules: {
                    Attendees: {
                        required: true
                    }
                    ,AttendeesOtherRemark: {
                        required: function(element) {
                          return $("#AttendeesOther").is(':checked');
                        }
                    },
                    CounselType: {
                        required: true
                    }
                    ,CounselType1Remark: {
                        required: function(element) {
                          return $("#CounselType1").is(':checked');
                        }
                    },
                    CounselType2Remark: {
                        required: function(element) {
                          return $("#CounselType2").is(':checked');
                        }
                    },
                    CounselTypeOtherRemark: {
                        required: function(element) {
                          return $("#CounselTypeOther").is(':checked');
                        }
                    },
                    CounselTypeKind: {
                        required: true
                    },
                    CounselTypeKindOtherRemark: {
                        required: function(element) {
                          return $("#CounselTypeKindOther").is(':checked');
                        }
                    }
                },
                messages: {
                    Attendees: "<span style='color:#B94A48;'>請至少選擇一個項目</span>"
                    ,AttendeesOtherRemark: "<span style='color:#B94A48;'>請填寫或取消勾選</span>"
                    ,CounselType: "<span style='color:#B94A48;'>請至少選擇一個項目</span>"
                    ,CounselType1Remark: "<span style='color:#B94A48;'>請填寫或取消勾選</span>"
                    ,CounselType2Remark: "<span style='color:#B94A48;'>請填寫或取消勾選</span>"
                    ,CounselTypeOtherRemark: "<span style='color:#B94A48;'>請填寫或取消勾選</span>"
                    ,CounselTypeKind: "<span style='color:#B94A48;'>請至少選擇一個項目</span>"
                    ,CounselTypeKindOtherRemark: "<span style='color:#B94A48;'>請填寫或取消勾選</span>"
                }
            });
        }
    }
}();

jQuery.validator.addMethod("notEqualToGroup", function(value, element, options) {
  // get all the elements passed here with the same class
  var elems = $(element).parents('form').find(options[0]);
  // the value of the current element
  var valueToCompare = value;
  // count
  var matchesFound = 0;
  // loop each element and compare its value with the current value
  // and increase the count every time we find one
  jQuery.each(elems, function(){
    thisVal = $(this).val();
    if(thisVal == valueToCompare){
      matchesFound++;
    }
  });
  // count should be either 0 or 1 max
  if(this.optional(element) || matchesFound <= 1) {
          elems.removeClass('error');
          return true;
      } else {
          elems.addClass('error');
      }
}, jQuery.format("請輸入不重複的數值"))
