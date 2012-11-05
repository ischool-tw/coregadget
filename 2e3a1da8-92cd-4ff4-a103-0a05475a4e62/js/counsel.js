var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.counsel.teacher");
_gg.schoolYear = '';
_gg.grade = '';
_gg.chineseGrade = '';
_gg.init = false;
_gg.students = [];

jQuery(function () {
    // TODO: 點選 checkbox 後的註解輸入框時，使事件失效，才不會影響 checkbox
    $("body").on("click", "input:text[valide-type$=remark]", function(e) {
        e.preventDefault();
    });

    // TODO: datepicker 中文化
    $.datepicker.setDefaults({
        dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"]
        ,monthNames: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
    });


    $("#filter-keyword").keyup(function() {
      _gg.resetStudentList();
    });

    $("#filter-student").click(function() {
      _gg.resetStudentList();
    });

    // TODO: 學生清單事件
    $("#student-list").on("click", ".accordion-body a", function(e) {
        if (_gg.init) {
            $('#student-list li').removeClass('active');
            e.preventDefault();
            $(this).tab("show");

            _gg.student = _gg.students[$(this).attr("student-index")];
            _gg.loadCounselData();
        } else {
            e.preventDefault();
        }
    });

    // TODO: 學生關鍵字搜尋
    _gg.resetStudentList = function() {
        var accordionHTML, className, firstClassName, items;
        className = "";
        items = [];
        accordionHTML = "";
        firstClassName = "";
        _gg.students.each(function(index, student) {
            if (this.StudentName.indexOf($("#filter-keyword").val()) !== -1) {
                if (this.ClassName !== className) {
                    className = this.ClassName;
                    if (accordionHTML != null) {
                        accordionHTML += items.join("");
                        accordionHTML += "      </ul>\n    </div>\n  </div>\n</div>";
                        items.splice(0);
                    }
                    accordionHTML += "<div class='accordion-group'>\n  <div class='accordion-heading'>\n    <a class='accordion-toggle' data-toggle='collapse' data-parent='#student-list' href='#collapse" + index + "'><i class='icon-user'></i>" + this.ClassName + "</a>\n  </div>\n  <div id='collapse" + index + "' class='accordion-body collapse " + (firstClassName === '' ? 'in' : '') + "'>\n    <div class='accordion-inner'>\n      <ul class='nav nav-pills nav-stacked'>";
                    if (firstClassName === '') {
                        firstClassName = this.ClassName;
                    }
                }
                items.push("<li>\n  <a href='#' student-index='" + index + "'>\n    <span class='my-seat-no label label-inverse my-label'>" + this.SeatNo + "</span>\n    <span class='my-student-name'>" + this.StudentName + "</span>\n    <span class='my-student-number'>" + this.StudentNumber + "</span>\n    <i class='icon-chevron-right pull-right'></i>\n  </a>\n</li>");
            }
        });
        accordionHTML += items.join("");
        accordionHTML += "      </ul>\n    </div>\n  </div>\n</div>";
        $("#student-list").html(accordionHTML);
    };

    // TODO: 取得帶班學生、認輔學生
    _gg.connection.send({
        service: "_.GetClassStudent",
        body: "",
        result: function(response, error, xhr) {
            var accordionHTML, className, items, _ref, classStudentCount = 0;
            if (error != null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>\n</div>");
            } else {
                if (((_ref = response.Response) != null ? _ref.Student : void 0) != null) {
                    _gg.students = $(response.Response.Student);
                    className = "";
                    items = [];
                    accordionHTML = "";
                    _gg.students.each(function(index, student) {
                        classStudentCount += 1;
                        if (this.ClassName !== className) {
                            className = this.ClassName;
                            if (accordionHTML != null) {
                                accordionHTML += items.join("");
                                accordionHTML += "      </ul>\n    </div>\n  </div>\n</div>";
                                items.splice(0);
                            }
                            accordionHTML += "<div class='accordion-group'>\n  <div class='accordion-heading'>\n    <a class='accordion-toggle' data-toggle='collapse' data-parent='#student-list' href='#collapse" + index + "'><i class='icon-user'></i>" + this.ClassName + "</a>\n  </div>\n  <div id='collapse" + index + "' class='accordion-body collapse " + (index === 0 ? 'in' : '') + "'>\n    <div class='accordion-inner'>\n      <ul class='nav nav-pills nav-stacked'>";
                        }
                        items.push("<li " + (index === 0 ? " class='active'" : '') + ">\n  <a href='#' student-index='" + index + "'>\n    <span class='my-seat-no label label-inverse my-label'>" + this.SeatNo + "</span>\n    <span class='my-student-name'>" + this.StudentName + "</span>\n    <span class='my-student-number'>" + this.StudentNumber + "</span>\n    <i class='icon-chevron-right pull-right'></i>\n  </a>\n</li>");
                        if (index === 0) {
                            _gg.student = student;
                            _gg.loadCounselData();
                        }
                    });
                    accordionHTML += items.join("");
                    accordionHTML += "      </ul>\n    </div>\n  </div>\n</div>";
                    $("#student-list").html(accordionHTML);
                }
            }

            // TODO: 認輔學生
            _gg.connection.send({
                service: "_.GetCounselStudent",
                body: "",
                result: function(response, error, xhr) {
                    var accordionHTML, className, items, _ref, total_index;
                    if (error != null) {
                        $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>\n</div>");
                    } else {
                        if (((_ref = response.Response) != null ? _ref.Student : void 0) != null) {
                            className = "認輔學生";
                            items = [];
                            accordionHTML = "";
                            $(response.Response.Student).each(function(index, student) {
                                _gg.students.push(student);
                                student.ClassName = className;
                                total_index = index + classStudentCount;
                                if (index === 0) {
                                    accordionHTML += "<div class='accordion-group'>\n  <div class='accordion-heading'>\n    <a class='accordion-toggle' data-toggle='collapse' data-parent='#student-list' href='#collapse" + total_index + "'><i class='icon-user'></i>" + className + "</a>\n  </div>\n  <div id='collapse" + total_index + "' class='accordion-body collapse " + (total_index === 0 ? 'in' : '') + "'>\n    <div class='accordion-inner'>\n      <ul class='nav nav-pills nav-stacked'>";
                                }
                                items.push("<li " + (total_index === 0 ? " class='active'" : '') + ">\n  <a href='#' student-index='" + total_index + "'>\n    <span class='my-seat-no label label-inverse my-label'>" + this.SeatNo + "</span>\n    <span class='my-student-name'>" + this.StudentName + "</span>\n    <span class='my-student-number'>" + this.StudentNumber + "</span>\n    <i class='icon-chevron-right pull-right'></i>\n  </a>\n</li>");
                                if (total_index === 0 ) {
                                    _gg.student = student;
                                    _gg.loadCounselData();
                                }
                            });
                            accordionHTML += items.join("");
                            accordionHTML += "      </ul>\n    </div>\n  </div>\n</div>";
                            $("#student-list").append(accordionHTML);
                        }
                    }
                }
            });

        }

    });

    $("#student-list").hover(function() {
      $(this).css("overflow", "auto");
    }, function() {
      $(this).css("overflow", "hidden");
    });

    // TODO: 設定驗證錯誤時的樣式
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

    // TODO: 驗證時間格式 hh:mm
    jQuery.validator.addMethod("time", function(value, element) {
        return this.optional(element) || /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/i.test(value);
    }, "請輸入正確格式，如「12:00」");

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

    // TODO: 尊親屬新增鈕
    $('#parents-add-data').bind('click', function () {
         _gg.SetModifyData.addParent();
    });

     // TODO: 兄弟姊妹新增鈕
    $('#siblings-add-data').bind('click', function () {
         _gg.SetModifyData.addSibling();
    });

    // TODO: 晤談紀錄新增鈕
    $('#talk-add-data').bind('click', function () {
        _gg.editInterview = null;
    });

    // TODO: 晤談紀錄編輯、刪除鈕
    $("#E1").on("click", "a[data-toggle=modal]", function(e) {
        _gg.editInterview = _gg.interviewRecord[$(this).attr("interview-index")];
    });

    // TODO: 晤談紀錄設定
    _gg.SetModifyData.setTalkValidRules();

    // TODO: 晤談紀錄查詢
    $("#filter-interview-start").datepicker({ dateFormat: "yy/mm/dd" });
    $("#filter-interview-end").datepicker({ dateFormat: "yy/mm/dd" });
    $("#filter-interview").validate();
    $("#search-interview").bind("click", function(e) {
        var startD = $('#filter-interview-start').val();
        var endD = $('#filter-interview-end').val();
        var start_date = startD + " 00:00:00";
        var end_date = endD + " 00:00:00";

        if (startD || endD) {
            $(_gg.interviewRecord).each(function() {
                var iDate = new Date(this.InterviewDate);
                var iNode = $('#interview-' + this.UID);
                iNode.hide();

                if (iDate) {

                    if (startD && endD)  {
                        // TODO: 限制區間
                        if (new Date(start_date) <= iDate && new Date(end_date) >= iDate) {
                            iNode.show();
                        }
                    } else if (startD) {
                        // TODO: 開始日之後
                        if (new Date(start_date) <= iDate) {
                            iNode.show();
                        }
                    } else if (endD) {
                        // TODO: 結束日之前
                        if (new Date(end_date) >= iDate) {
                            iNode.show();
                        }
                    }
                }
            });

            // TODO: 搜尋結果不分頁
            $("#E1Page").hide();
        } else {
            $('#E1 div.my-baseinfo-item').show();
            $('#E1Page a:eq(1)').triggerHandler('click');
            $("#E1Page").show();
        }
    });

    // TODO: 晤談新增編輯日期
    $("#InterviewDate").datepicker({ dateFormat: "yy/mm/dd" });

    // TODO: 編輯視窗的相關設定
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
            // TODO: 重設按鈕
            $(that).find("button[edit-target]").button('reset');

            // TODO: 移除表單驗證訊息
            var validator = $(that).find('form').validate();
            validator.resetForm();
            $(that).find('.error').removeClass("error");

            // TODO: 產生表單
            _gg.SetModifyData.setForm(that.id);

            // TODO: 修正 modal 中有 Collapse，Collapse 展開時會觸發 modal 的 show
            $(that).find('.accordion').on('show', function (event) {
                event.stopPropagation();
            });
        };

        // TODO: 資料尚未載入完成，使 modal.show 失效
        if (_gg.init) {
            if (this.id === 'deltalk') {
                // TODO: 重設按鈕
                $(that).find("button[edit-target]").button('reset');
            } else if ($(this).find("[edit-target]").attr("edit-target") === 'E1' && !_gg.editInterview) {
                $(that).find("button[edit-target]").button('reset'); // TODO: 重設按鈕
                // TODO: 移除表單驗證訊息
                var validator = $(that).find('form').validate();
                validator.resetForm();
                $(that).find('.error').removeClass("error");

                _gg.SetModifyData.addTalk(); // TOODO: 新增晤談紀錄
            } else {
                show_model();
            }
        } else {
            e.preventDefault();
        }
    });

    // TODO: 編輯畫面按下儲存鈕
    $('.modal').on('click', 'button[edit-target]', function(e) {
        var data_scope = $(this).closest(".modal").attr("id");

        if ($("#" + data_scope + " form").valid()) {
            $(this).button('loading'); // TODO: 按鈕為處理中
            _gg.SetSaveData(data_scope);
        } else {
            $("#" + data_scope + "_errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  資料驗證失敗，請重新檢查！\n</div>");
        }
    });

    // TODO: 切換年級
    $('.my-schoolyear-semester-widget').on("click", '.btn', function () {
        _gg.grade = $(this).attr("grade");
        _gg.chineseGrade = $(this).attr("chinese-grade");
        _gg.SetData('B1');
        _gg.SetData('B2');
        _gg.SetData('B3');
        _gg.SetData('B4');
        _gg.SetData('B5');

         if (_gg.grade === "3") {
            $('#B5').hide();
        } else {
            $('#B5').show();
        }
    });

    // TODO: 顯示資料
    _gg.SetData = function (data_scope) {
        // TODO: 處理部份類型的值
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
                    '<td>' + (item.EduDegree || '') + '</td>';
                tmp_items.push('<tr>' +tmp_html+ '</tr>');
            });
            $('#A3 tbody').html(tmp_items.join(""));
        };

        // TODO: 兄弟姊妹資料
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
            var tmp_grade = (_gg.grade || "1");
            var tmp_chinese_grade = (_gg.chineseGrade || '一');

            $('#B3 [data-type]').html('');

            $.each(questions, function (index, item) {
                tmp_key = item.GroupName + '_' + item.Name;
                tmp_data = item.SelectValue;
                if (tmp_data) {
                    $('#B3 [data-type=' + tmp_key + 'a]').html(tmp_data['S' + tmp_grade + 'a'] || '');
                    $('#B3 [data-type=' + tmp_key + 'b]').html(tmp_data['S' + tmp_grade + 'b'] || '');
                }
            });
            $('#B3 [data-type=grade]').html(tmp_chinese_grade);
        };

        // TODO: 自我認識，題目可能因為年級而不同
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

        // TODO: 生活感想，題目可能因為年級而不同
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

        // TODO: 畢業後規劃
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
                    if (tmp_data) {
                        tmp_data = $.formatDate(new Date(tmp_data), "yyyyMMdd");
                    }
                }
                $('#D1 [data-type=' + tmp_key + ']').html(tmp_data);
            });
        };

        // TODO: 晤談紀錄
        var input_E1_value = function() {
            var obj2str = function(content) {
                var ret_str = '';
                $(content.Item).each(function(index, item){
                    if (index !== 0) ret_str += ", ";
                    ret_str += item.name;
                    if (item.remark) {
                        ret_str += ":" + item.remark;
                    }
                });
                return ret_str;
            }

            $('#E1').html('');
            $("#tab5 .pagination").html('');

            var questions = _gg.interviewRecord;
            if (questions.length === 0) {
                $('#E1').html('目前尚無資料');
            } else {
                var tmp_items = [];
                var student = _gg.student;
                $.each(questions, function (index, item) {
                    var date1 = (item.InterviewDate) ? $.formatDate(new Date(item.InterviewDate), "yyyyMMdd") : '';

                    tmp_items.push('<div class="my-baseinfo-item well" id="interview-' + item.UID + '">' +
                      '<div class="my-label-title">' +
                        '<a class="btn btn-success" data-toggle="modal" href="#talk" interview-index="' + index + '">' +
                          '<i class="icon-edit icon-white"></i>編號：' + (item.InterviewNo || '') + '</a>' +
                        '<a class="btn pull-right" data-toggle="modal" href="#deltalk" interview-index="' + index + '">' +
                          '<i class="icon-trash"></i> 刪除</a>' +
                      '</div>' +
                      '<div class="row-fluid">' +
                        '<div class="span4">' +
                          '<table class="table my-lineheight">' +
                            '<tr>' +
                              '<th width="40%">年級</th>' +
                              '<td width="60%">' + (student.GradeYear || '') + '</td>' +
                            '</tr>' +
                            '<tr>' +
                              '<th>班級</th>' +
                              '<td>' + (student.ClassName || '') + '</td>' +
                            '</tr>' +
                            '<tr>' +
                              '<th>姓名</th>' +
                              '<td>' + (student.StudentName || '') + '</td>' +
                            '</tr>' +
                          '</table>' +
                        '</div>' +
                        '<div class="span4">' +
                          '<table class="table my-lineheight">' +
                            '<tr>' +
                              '<th width="40%">晤談老師</th>' +
                              '<td width="60%">' + (item.TeacherName || '') + '</td>' +
                            '</tr>' +
                            '<tr>' +
                              '<th>晤談對象</th>' +
                              '<td>' + (item.InterviewType || '') + '</td>' +
                            '</tr>' +
                            '<tr>' +
                              '<th>晤談方式</th>' +
                              '<td>' + (item.IntervieweeType || '') + '</td>' +
                            '</tr>' +
                          '</table>' +
                        '</div>' +
                        '<div class="span4">' +
                          '<table class="table my-lineheight">' +
                            '<tr>' +
                              '<th width="40%">日期</th>' +
                              '<td width="60%" class="my-Date">' + date1 + '</td>' +
                            '</tr>' +
                            '<tr>' +
                              '<th>時間</th>' +
                              '<td>' + (item.InterviewTime || '') + '</td>' +
                            '</tr>' +
                            '<tr>' +
                              '<th>地點</th>' +
                              '<td>' + (item.Place || '') + '</td>' +
                            '</tr>' +
                          '</table>' +
                        '</div>' +
                      '</div>' +
                      '<table class="table my-lineheight">' +
                        '<tr>' +
                          '<th nowrap="nowrap" width="13%">晤談事由</th>' +
                          '<td width="87%">' + (item.Cause || '') + '</td>' +
                        '</tr>' +
                        '<tr>' +
                          '<th nowrap="nowrap">參與人員</th>' +
                          '<td>' + obj2str(item.Attendees) + '</td>' +
                        '</tr>' +
                        '<tr>' +
                          '<th nowrap="nowrap">輔導方式</th>' +
                          '<td>' + obj2str(item.CounselType) + '</td>' +
                        '</tr>' +
                        '<tr>' +
                          '<th nowrap="nowrap">輔導歸類</th>' +
                          '<td>' + obj2str(item.CounselTypeKind) + '</td>' +
                        '</tr>' +
                      '</table>' +
                      '<div class="accordion" id="accordionE1' + item.UID + '">' +
                        '<div class="accordion-group">' +
                          '<div class="accordion-heading">' +
                            '<a class="accordion-toggle" data-parent="#accordionE1' + item.UID + '" data-toggle="collapse" href="#collapse' + item.UID + '">' +
                              '<i class="icon-chevron-down pull-right"></i>' +
                              '內容要點' +
                            '</a>' +
                          '</div>' +
                          '<div class="accordion-body collapse" id="collapse' + item.UID + '">' +
                            '<div class="accordion-inner">' +
                              (item.ContentDigest || '') +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                      '<hr/>' +
                      '<p class="pull-right">紀錄者：' + (item.AuthorName || '') + '</p>' +
                    '</div>');
                });
                $('#E1').html(tmp_items.join(""));

                // TODO: 分頁
                $("#E1").pager('div.my-baseinfo-item', {navId: 'E1Page'});
            }
        };

        // TODO: 心理測驗
        var input_F1_value = function() {
            var questions = _gg.quizData;
            var tmp_items = [];
            $('#F1').html('');
            if (questions.length === 0) {
                tmp_items.push("目前尚無資料")
            } else {
                $.each(questions, function (index, item) {
                    if (item.ImplementationDate) {
                        var tmp_data = $.formatDate(new Date(item.ImplementationDate), "yyyyMMdd");
                    } else {
                        tmp_data = '';
                    }

                    tmp_items.push('<div class="my-baseinfo-item well">' +
                        '<div class="my-label-title">' +
                            '<a class="btn btn-success disabled" data-toggle="modal" href="#" disabled >' +
                            '<i class="icon-book icon-white"></i>' +
                            tmp_data + ' ' + (item.QuizName || '') + '</a>' +
                        '</div>');

                    var _ref, tmp_content = {};
                    if (((_ref = item.Content) != null ? _ref.Item : void 0) != null) {
                        $(item.Content.Item).each(function() {
                            tmp_content[this.name] = this.value;
                        });
                    }

                    if (((_ref = item.QuizDataField) != null ? _ref.Field : void 0) != null) {
                        $(item.QuizDataField.Field).sort(by('asc', 'order')).each(function(key, value){
                            tmp_items.push('<p class="my-lineheight"><b>' + value.name + '</b>：' +
                                '' + (tmp_content[value.name] || '') + '</p>'
                            );
                        });
                    }

                    tmp_items.push('</div>');
                });
            }
            $('#F1').html(tmp_items.join(""));
        };

        // 如果未指定範圍，就重新顯示全部資料
        if (_gg.init) {
            if (data_scope === 'All') {
                $('a[data-toggle=modal]').removeClass("disabled");

                $.each(_gg.col_Question, function(key, value) {
                    eval('input_' + key + '_value()');
                });
            } else {
                eval('input_' + data_scope + '_value()');
            }
        }
    };
});
