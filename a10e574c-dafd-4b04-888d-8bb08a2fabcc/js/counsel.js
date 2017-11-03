var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.counsel.student");
_gg.schoolYear = '';
_gg.grade = ''; // 模組年級 1~max
_gg.contrastGrade = []; // 模組年級 與 學校年級 對照
_gg.init = false;


jQuery(function () {
    $('#baseinfo a[rel="tooltip"]').tooltip({placement: "right"});
    $('#baseinfo a[rel="tooltip"]').tooltip('show');
    $("body").on("click", function(e) {
        $('#baseinfo a[rel="tooltip"]').tooltip('hide');
        $(this).off(e);
    });

    // 點選 checkbox 後的註解輸入框時，使事件失效，才不會影響 checkbox
    $("body").on("click", "input:text[valide-type$=remark]", function(e) {
        e.preventDefault();
    });

    // 設定驗證錯誤時的樣式
    $.validator.setDefaults({
        debug: true,
        errorElement: "span",
        errorClass: "help-inline",
        highlight: function(element) {
            if ($(element).attr("valide-type") === 'remark') {
                $(element).addClass("error-remark");
            } else {
                $(element).parentsUntil('.control-group').parent().addClass("error");
            }
        },
        unhighlight: function(element) {
            if ($(element).attr("valide-type") === 'remark') {
                $(element).removeClass("error-remark");
            } else {
                $(element).parentsUntil('.control-group').parent().removeClass("error");
            }
        },
        errorPlacement: function (error, element) {
            if (element.is(':radio') || element.is(':checkbox')) {
                var eid = element.attr('name');
                $('input[name=' + eid + ']:last').next().after(error);
            }
            else {
                error.insertAfter(element);
            }
        }
    });

    _gg.loadCounselData();

    // 家中排行
    $('#siblings [name=AnySiblings]').bind('click', function (e) {
        if (e.target.value === '1') {
            $('#siblings [data-type=家庭狀況_兄弟姊妹_排行]')
                .addClass("disabled")
                .attr("disabled", "disabled")
                .val("");
        } else {
            $('#siblings [data-type=家庭狀況_兄弟姊妹_排行]')
                .removeClass("disabled")
                .removeAttr("disabled")
                .focus();
        }
    });

    // 尊親屬新增鈕
    $('#parents-add-data').bind('click', function () {
         _gg.SetModifyData.addParent();
    });

     // 兄弟姊妹新增鈕
    $('#siblings-add-data').bind('click', function () {
        $('#siblings [name=AnySiblings][value=more]').trigger('click');
         _gg.SetModifyData.addSibling();
    });

    // 編輯視窗的相關設定
    $('.modal').modal({
        keyboard: false,
        show: false
    });

    $(".modal").on("hidden", function () {
        $(this).find("[id$=_errorMessage]").html("");
        $(this).find("button[edit-target]").removeClass('btn-danger').addClass('btn-success');
    });


    $(".modal").on("show", function (e) {
        var that = this;
        var show_model = function () {
            $(that).find("button[edit-target]").button('reset'); // 重設按鈕

            _gg.SetModifyData.setForm(that.id);

            // 修正 modal 中有 Collapse，Collapse 展開時會觸發 modal 的 show
            $(that).find('.accordion').on('show', function (event) {
                event.stopPropagation();
            });
        };

        // 資料尚未載入完成、開放期限外，使 modal.show 失效
        if (_gg.init && _gg.Opening === "yes") {
            if ($(this).find("[edit-target]").attr("edit-target").slice(0, 1) === 'B') {
                if (_gg.student.GradeYear && _gg.grade && (_gg.student.GradeYear === _gg.grade)) {
                    show_model();
                } else {
                    e.preventDefault();
                }
            } else {
                show_model();
            }
        } else {
            e.preventDefault();
        }
    });

    // 編輯畫面按下儲存鈕
    $('.modal button[edit-target]').bind('click', function(e) {
        var data_scope = $(this).closest(".modal").attr("id");

        if ($("#" + data_scope + " form").valid()) {
            $(this).button('loading'); // 按鈕為處理中
            _gg.SetSaveData(data_scope);
        } else {
            $("#" + data_scope + "_errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  資料驗證失敗，請重新檢查！\n</div>");
        }
    });

    // 切換年級
    $('.my-schoolyear-semester-widget .btn').live("click", function () {
        _gg.grade = $(this).attr("grade");
        _gg.SetData('B1');
        _gg.SetData('B2');
        _gg.SetData('B3');
        _gg.SetData('B4');
        _gg.SetData('B5');
        if (_gg.grade === (_gg.contrastGrade.length-1).toString()) {
            $('#B5').hide();
        } else {
            $('#B5').show();
        }
        if (_gg.Opening === "yes") {
            if (_gg.student.GradeYear && _gg.grade && (_gg.student.GradeYear === _gg.grade)) {
                $('#B1 a[data-toggle=modal], #B2 a[data-toggle=modal], #B3 a[data-toggle=modal], #B4 a[data-toggle=modal], #B5 a[data-toggle=modal]').removeClass("disabled");
            } else {
                $('#B1 a[data-toggle=modal], #B2 a[data-toggle=modal], #B3 a[data-toggle=modal], #B4 a[data-toggle=modal], #B5 a[data-toggle=modal]').addClass("disabled");
            }
        }
    });

    // 顯示資料
    _gg.SetData = function (data_scope) {
        // 處理部份類型的值
        var input_value = function (qtype, qvalue) {
            var tmp_data = '';
            if (qtype) {
                switch (qtype.toLowerCase()) {
                    case 'single_answer':
                        tmp_data = (qvalue.Data || '');
                        if (qvalue.Remark) {
                            tmp_data += ":" + qvalue.Remark;
                        }
                        break;
                    case 'multi_answer':
                        $.each(qvalue, function (index, item) {
                            if (index !== 0) {
                                tmp_data += ", ";
                            }

                            tmp_data += (item.Data || '');
                            if (item.Remark) {
                                tmp_data += ":" + item.Remark;
                            };
                        });
                        break;
                    case 'yearly':
                        tmp_data = (qvalue['G'+_gg.grade] || '');
                        break;
                    case 'priority':
                        for (var i = 1; i <= 10; i++) {
                            if (qvalue['P'+i]) {
                                if (tmp_data) {
                                    tmp_data += ", ";
                                }

                                tmp_data += (qvalue['P'+i] || '');
                            }
                        }
                        break;
                }
            }
            return tmp_data;
        };

        // 個人資料
        var input_A1_value = function() {
            var questions = _gg.col_Question.A1;
            var tmp_key, tmp_data;
            $('#A1 [data-type]').html('');
            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = input_value(item.QuestionType, item.SelectValue);
                $('#A1 [data-type=' + tmp_key + ']').html(tmp_data);
            });
        };

        // 監護人資料
        var input_A2_value = function() {
            var questions = _gg.col_Question.A2;
            var tmp_key, tmp_data;
            $('#A2 [data-type]').html('');
            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = input_value(item.QuestionType, item.SelectValue);
                $('#A2 [data-type=' + tmp_key + ']').html(tmp_data);
            });
        };

        // 尊親屬資料
        var input_A3_value = function() {
            var tmp_html, tmp_items = [];
            $.each(_gg.relative, function (index, item) {
                var tmp_isAlive = '';

                if (item.IsAlive === 't') {
                    tmp_isAlive = '存';
                } else if (item.IsAlive === 'f') {
                    tmp_isAlive = '歿';
                }

                tmp_html = '' +
                    '<td>' + (item.Title || '') + '</td>' +
                    '<td>' + (item.Name || '') + '</td>' +
                    '<td>' + (item.BirthYear || '') + '</td>' +
                    '<td>' + tmp_isAlive + '</td>' +
                    '<td>' + (item.Phone || '') + '</td>' +
                    '<td>' + (item.Job || '') + '</td>' +
                    '<td>' + (item.Institute || '') + '</td>' +
                    '<td>' + (item.JobTitle || '') + '</td>' +
                    '<td>' + (item.EduDegree || '') + '</td>' +
                    '<td>' + (item.National || '') + '</td>';
                tmp_items.push('<tr>' +tmp_html+ '</tr>');
            });
            $('#A3 tbody').html(tmp_items.join(""));
        };

        // 兄弟姊妹資料
        var input_A4_value = function() {
            var tmp_html, tmp_items = [];
            var tmp_key, tmp_data;
            var questions = _gg.col_Question.A4;
            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                if (item.GroupName === '家庭狀況' && item.Name === '兄弟姊妹_排行') {
                    tmp_data = input_value(item.QuestionType, item.SelectValue);
                    if (tmp_data) {
                        $('#A4 [data-type=' + tmp_key + ']').html('我有兄弟姊妹，我排行第' + tmp_data);
                    } else {
                        $('#A4 [data-type=' + tmp_key + ']').html('我是獨子');
                    }
                    return false;
                }
            });

            $.each(_gg.sibling, function (index, item) {
                tmp_html = '' +
                    '<td>' + (item.Title || '') + '</td>' +
                    '<td>' + (item.Name || '') + '</td>' +
                    '<td>' + (item.BirthYear || '') + '</td>' +
                    '<td>' + (item.SchoolName || '') + '</td>' +
                    '<td>' + (item.Remark || '') + '</td>';
                tmp_items.push('<tr>' +tmp_html+ '</tr>');
            });
            $('#A4 tbody').html(tmp_items.join(""));
        };

        // 身高及體重
        var input_A5_value = function() {
            var target = $('#A5');
            var questions = _gg.col_Question.A5;
            var tmp_key, tmp_data;
            $('#A5 [data-type]').html('');
            $(_gg.contrastGrade).each(function(index, contrast){
                target.find('span[js="grade' + index + '"]').html(contrast.TrueGradeYear);
            });
            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = item.SelectValue;
                if (tmp_data) {
                    $('#A5 [data-type=' + tmp_key + 'S1a]').html(tmp_data.S1a || '');
                    $('#A5 [data-type=' + tmp_key + 'S1b]').html(tmp_data.S1b || '');
                    $('#A5 [data-type=' + tmp_key + 'S2a]').html(tmp_data.S2a || '');
                    $('#A5 [data-type=' + tmp_key + 'S2b]').html(tmp_data.S2b || '');
                    $('#A5 [data-type=' + tmp_key + 'S3a]').html(tmp_data.S3a || '');
                    $('#A5 [data-type=' + tmp_key + 'S3b]').html(tmp_data.S3b || '');
                    $('#A5 [data-type=' + tmp_key + 'S4a]').html(tmp_data.S4a || '');
                    $('#A5 [data-type=' + tmp_key + 'S4b]').html(tmp_data.S4b || '');
                    $('#A5 [data-type=' + tmp_key + 'S5a]').html(tmp_data.S5a || '');
                    $('#A5 [data-type=' + tmp_key + 'S5b]').html(tmp_data.S5b || '');
                    $('#A5 [data-type=' + tmp_key + 'S6a]').html(tmp_data.S6a || '');
                    $('#A5 [data-type=' + tmp_key + 'S6b]').html(tmp_data.S6b || '');

                }
            });
        };

        // 家庭訊息
        var input_B1_value = function() {
            var questions = _gg.col_Question.B1;
            var tmp_key, tmp_data, tmp_items = [];
            $('#B1 tbody').html('');
            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = input_value(item.QuestionType, item.SelectValue);
                tmp_items.push('<tr><th>' + item.Alias + '</th><td>' + tmp_data+ '</td></tr>');
            });
            $('#B1 tbody').html(tmp_items.join(""));
        };

        // 學習
        var input_B2_value = function() {
            var questions = _gg.col_Question.B2;
            var tmp_key, tmp_data, tmp_items = [];
            $('#B2 tbody').html('');
            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = input_value(item.QuestionType, item.SelectValue);
                tmp_items.push('<tr><th>' + item.Alias + '</th><td>' + tmp_data+ '</td></tr>');
            });
            $('#B2 tbody').html(tmp_items.join(""));
        };

        // 幹部資訊
        var input_B3_value = function() {
            var questions = _gg.col_Question.B3;
            var tmp_key, tmp_data;
            var tmp_grade = (_gg.grade || "1");
            var tmp_trueGradeYear = _gg.contrastGrade[tmp_grade].TrueGradeYear || '';

            $('#B3 [data-type]').html('');

            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = item.SelectValue;
                if (tmp_data) {
                    $('#B3 [data-type=' + tmp_key + 'a]').html(tmp_data['S' + tmp_grade + 'a'] || '');
                    $('#B3 [data-type=' + tmp_key + 'b]').html(tmp_data['S' + tmp_grade + 'b'] || '');
                }
            });
            $('#B3 [data-type=grade]').html(tmp_trueGradeYear);
        };

        // 自我認識，題目可能因為年級而不同
        var input_B4_value = function() {
            var questions = _gg.col_Question.B4;
            var tmp_key, tmp_data, tmp_items = [];
            var tmp_grade = (_gg.grade || "1");

            $('#B4 tbody').html('');

            $.each(questions, function (index, item) {
                if (item.Name.slice(-1) === tmp_grade) { // ex.個性_1
                    tmp_key = item.GroupName + '_' + item.Name;
                    tmp_data = input_value(item.QuestionType, item.SelectValue);
                    if (item.Name.indexOf("填寫日期") !== -1) {
                        if (tmp_data) {
                            tmp_data = $.formatDate(new Date(tmp_data), "yyyyMMdd");
                        }
                    }
                    tmp_items.push('<tr><th>' + item.Alias + '</th><td>' + tmp_data + '</td></tr>');
                }
            });
            $('#B4 tbody').html(tmp_items.join(""));
        };

        // 生活感想，題目可能因為年級而不同
        var input_B5_value = function() {
            var questions = _gg.col_Question.B5;
            var tmp_key, tmp_data, tmp_items = [];
            var tmp_grade = (_gg.grade || "1");

            $('#B5 tbody').html('');

            $.each(questions, function (index, item) {
                if (item.Name.slice(-1) === tmp_grade) { // ex.內容1_1
                    tmp_key = item.GroupName + '_' + item.Name;
                    tmp_data = input_value(item.QuestionType, item.SelectValue);
                    if (item.Name.indexOf("填寫日期") !== -1) {
                        if (tmp_data) {
                            tmp_data = $.formatDate(new Date(tmp_data), "yyyyMMdd");
                        }
                    }
                    tmp_items.push(
                        '<div class="accordion-group">' +
                        '  <div class="accordion-heading">' +
                        '    <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseB5' + index + '">' +
                        '      <i class="icon-chevron-down pull-right"></i>' + item.Alias + '</a>' +
                        '  </div>' +
                        '  <div id="collapseB5' + index + '" class="accordion-body collapse">' +
                        '    <div class="accordion-inner">' + tmp_data +'</div>' +
                        '  </div>' +
                        '</div>'
                    );
                }
            });
            $('#B5 #accordion2').html(tmp_items.join(""));
        };

        // 畢業後規劃
        var input_C1_value = function() {
            var questions = _gg.col_Question.C1;
            var tmp_key, tmp_data, tmp_items = [];
            $('#C1 tbody').html('');
            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = input_value(item.QuestionType, item.SelectValue);
                tmp_items.push('<tr><th>' + item.Alias + '</th><td>' + tmp_data+ '</td></tr>');
            });
            $('#C1 tbody').html(tmp_items.join(""));
        };

        // 自傳
        var input_D1_value = function() {
            var questions = _gg.col_Question.D1;
            var tmp_key, tmp_data;
            $('#D1 [data-type]').html('');
            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = input_value(item.QuestionType, item.SelectValue);
                if (item.Name.indexOf("填寫日期") !== -1) {
                    if (tmp_data) {
                        tmp_data = $.formatDate(new Date(tmp_data), "yyyyMMdd");
                    }
                }
                $('#D1 [data-type=' + tmp_key + ']').html(tmp_data);
            });
        };

        // 如果未指定範圍，就重新顯示全部資料
        if (_gg.init) {
            if (data_scope === 'All') {
                if (_gg.Opening === "yes") {
                    $('a[data-toggle=modal]').removeClass("disabled");
                }

                $.each(_gg.col_Question, function(key, value) {
                    eval('input_' + key + '_value()');
                });
            } else {
                eval('input_' + data_scope + '_value()');
            }
        }
    };
});
