var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.counsel101.student");
_gg.schoolYear = '';
_gg.grade = '';
_gg.chineseGrade = '';
_gg.init = false;

jQuery(function () {
    _gg.loadCounselData();

    // TODO: 家中排行
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

    // TODO: 兄弟姊妹新增鈕
    $('#siblings-add-data').bind('click', function () {
         _gg.SetModifyData.addSibling();
    });

    $('#plan [name=future_planning]').bind('click', function (e) {
        if (e.target.value === 'learning') {
            $('#plan [plan-data-group=learning]').show();
            $('#plan [plan-data-group=job]').hide();
        } else {
            $('#plan [plan-data-group=learning]').hide();
            $('#plan [plan-data-group=job]').show();
        }
    });

    $('.modal').modal({
        keyboard: false,
        show: false
    });

    $(".modal").on("hidden", function () {
        $(this).find("#errorMessage").html("");
    });

    $(".modal").on("show", function (e) {
_gg.Opening = "yes";
        // TODO: 資料尚未載入完成、開放期限外，使 modal.show 失效
        if (_gg.init && _gg.Opening === "yes") {

            $(this).find("[edit-target]").show(); // 顯示儲存鈕

            _gg.SetModifyData.setForm(this.id);

            // TODO: 修正 modal 中有 Collapse，Collapse 展開時會觸發 modal 的 show
            $(this).find('.accordion').on('show', function (event) {
                event.stopPropagation();
            });
        } else {
            e.preventDefault();
        }
    });

    // TODO: 編輯畫面按下儲存鈕
    $('.modal [edit-target]').bind('click', function(e) {
        // alert("Valid: " + $("#" + $(this).closest(".modal").attr("id") + " form").valid());
        var data_scope = $(this).closest(".modal").attr("id");
        // if ($("#" + data_scope + " form").valid()) {
            $(this).hide(); // 隱藏儲存鈕
            _gg.SetSaveData(data_scope);
        // }
    });

    // TODO: 切換年級
    $('.my-schoolyear-semester-widget .btn').live("click", function () {
        _gg.grade = $(this).attr("grade");
        _gg.chineseGrade = $(this).attr("chinese-grade");
        _gg.SetData('B1');
        _gg.SetData('B2');
        _gg.SetData('B3');
        _gg.SetData('B4');
        _gg.SetData('B5');
    });

    // TODO: 顯示資料
    _gg.SetData = function (data_scope) {
        // TODO: 處理部份類型的值
        var input_value = function (qtype, qvalue) {
            var tmp_data = '';
            if (qtype) {
                switch (qtype.toLowerCase()) {
                    case 'single_answer':
                        tmp_data = (qvalue.Data || '') + ((qvalue.Remark) || '');
                        break;
                    case 'multi_answer':
                        $.each(qvalue, function (index, item) {
                            if (index !== 0) {
                                tmp_data += ", ";
                            }

                            tmp_data += (item.Data || '') + ($.HTMLEncode(item.Remark) || '');
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

        // TODO: 個人資料
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

        // TODO: 監護人資料
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

        // TODO: 尊親屬資料
        var input_A3_value = function() {
            var tmp_html, tmp_items = [];
            $.each(_gg.relative, function (index, item) {
                tmp_html = '' +
                    '<td>' + (item.Title || '') + '</td>' +
                    '<td>' + (item.Name || '') + '</td>' +
                    '<td>' + (item.BirthYear || '') + '</td>' +
                    '<td>' + (item.IsAlive === 't' ? '歿':'存') + '</td>' +
                    '<td>' + (item.Phone || '') + '</td>' +
                    '<td>' + (item.Job || '') + '</td>' +
                    '<td>' + (item.Institute || '') + '</td>' +
                    '<td>' + (item.JobTitle || '') + '</td>' +
                    '<td>' + (item.EduDegree || '') + '</td>';
                tmp_items.push('<tr>' +tmp_html+ '</tr>');
            });
            $('#A3 tbody').html(tmp_items.join(""));
        };

        // TODO: 兄弟姊妹資料
        var input_A4_value = function() {
            var tmp_html, tmp_items = [];
            var tmp_key, tmp_data;
            var questions = _gg.col_Question.A1;
            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                if (item.GroupName === '家庭狀況' && item.Name === '兄弟姊妹_排行') {
                    tmp_data = input_value(item.QuestionType, item.SelectValue);
                    if (tmp_data) {
                        $('#A4 [data-type=' + tmp_key + ']').html('我是獨子');
                    } else {
                        $('#A4 [data-type=' + tmp_key + ']').html('我有兄弟姊妹，我排行第' + tmp_data);
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

        // TODO: 身高及體重
        var input_A5_value = function() {
            var questions = _gg.col_Question.A5;
            var tmp_key, tmp_data;
            $('#A5 [data-type]').html('');
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
                }
            });
        };

        // TODO: 家庭訊息
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

        // TODO: 學習
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

        // TODO: 幹部資訊
        var input_B3_value = function() {
            var questions = _gg.col_Question.B3;
            var tmp_key, tmp_data;
            var tmp_grade = (_gg.grade || 1);
            var tmp_chinese_grade = (_gg.chineseGrade || '一');

            $('#B3 [data-type]').html('');

            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = item.SelectValue;
                if (tmp_data) {
                    $('#B3 [data-type=' + tmp_key + 'a]').html(tmp_data['S' + tmp_grade + 'a'] || '');
                    $('#B3 [data-type=' + tmp_key + 'b]').html(tmp_data['S' + tmp_grade + 'b'] || '');
                    $('#B3 [data-type=grade]').html(tmp_chinese_grade);
                }
            });
        };

        // TODO: 自我認識，題目可能因為年級而不同
        var input_B4_value = function() {
            var questions = _gg.col_Question.B4;
            var tmp_key, tmp_data, tmp_items = [];
            var tmp_grade = (_gg.grade || 1);

            $('#B4 tbody').html('');

            $.each(questions, function (index, item) {
                if (item.Name.slice(-1) === tmp_grade) { // ex.個性_1
                    tmp_key = item.GroupName + '_' + item.Name;
                    tmp_data = input_value(item.QuestionType, item.SelectValue);
                    if (item.Name.indexOf("填寫日期") !== -1) {
                        tmp_data = $.formatDate(new Date(tmp_data), "yyyyMMdd");
                    }
                    tmp_items.push('<tr><th>' + item.Alias + '</th><td>' + tmp_data + '</td></tr>');
                }
            });
            $('#B4 tbody').html(tmp_items.join(""));
        };

        // TODO: 生活感想，題目可能因為年級而不同
        var input_B5_value = function() {
            var questions = _gg.col_Question.B5;
            var tmp_key, tmp_data, tmp_items = [];
            var tmp_grade = (_gg.grade || 1);

            $('#B5 tbody').html('');

            $.each(questions, function (index, item) {
                if (item.Name.slice(-1) === tmp_grade) { // ex.內容1_1
                    tmp_key = item.GroupName + '_' + item.Name;
                    tmp_data = input_value(item.QuestionType, item.SelectValue);
                    if (item.Name.indexOf("填寫日期") !== -1) {
                        tmp_data = $.formatDate(new Date(tmp_data), "yyyyMMdd");
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

        // TDOO: 畢業後規劃
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

        // TDOO: 自傳
        var input_D1_value = function() {
            var questions = _gg.col_Question.D1;
            var tmp_key, tmp_data;
            $('#D1 [data-type]').html('');
            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = input_value(item.QuestionType, item.SelectValue);
                if (item.Name.indexOf("填寫日期") !== -1) {
                    tmp_data = $.formatDate(new Date(tmp_data), "yyyyMMdd");
                }
                $('#D1 [data-type=' + tmp_key + ']').html(tmp_data);
            });
        };

        // 如果未指定範圍，就重新顯示全部資料
        if (data_scope === 'All') {
            $.each(_gg.col_Question, function(key, value) {
                eval('input_' + key + '_value()');
            });
        } else {
            eval('input_' + data_scope + '_value()');
        }
    };
});
