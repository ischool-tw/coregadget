var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.counsel.teacher");
_gg.schoolYear = '';
_gg.grade = '';
_gg.chineseGrade = '';
_gg.init = false;

jQuery(function () {
    // TODO: 點選 checkbox 後的註解輸入框時，使事件失效，才不會影響 checkbox
    $("body").on("click", "input:text[data-type$=remark]", function(e) {
        e.preventDefault();
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
        errorElement: "span",
        errorClass: "help-inline",
        highlight: function(element) {
            $(element).parentsUntil('.control-group').parent().addClass("error");
        },
        unhighlight: function(element) {
            $(element).parentsUntil('.control-group').parent().removeClass("error");
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

    // TODO: 晤談紀錄新增鈕
    $('#talk-add-data').bind('click', function () {
        _gg.editInterview = null;
    });

    // TODO: 晤談紀錄編輯鈕
    $("#E1").on("click", "a[data-toggle=modal]", function(e) {
        _gg.editInterview = _gg.interviewRecord[$(this).attr("interview-index")];
    });

    // TODO: 晤談紀錄設定
    _gg.SetModifyData.setTalkValidRules();

    // TODO: 晤談紀錄分頁
    $("#tab5 .pagination").on("click", "a", function(e) {
        var before_page = $("#tab5 .pagination a.active").html();
        var this_page = $(this).html();

        switch (this_page) {
            case 'Prev':
                this_page = parseInt(this_page, 10) - 1;
                $("#E1 .my-baseinfo-item").pager(5, this_page);
                $("#tab5 .pagination li").removeClass("active");
                $("#tab5 .pagination li:eq(' + this_page + ')").addClass("active");
                break;
            case 'Next':
                this_page = parseInt(this_page, 10) + 1;
                $("#E1 .my-baseinfo-item").pager(5, this_page);
                $("#tab5 .pagination li").removeClass("active");
                $("#tab5 .pagination li:eq(' + this_page + ')").addClass("active");
                break;
            default:
                $("#E1 .my-baseinfo-item").pager(5, this_page);
                $("#tab5 .pagination li").removeClass("active");
                $(this).parent().addClass("active");
        }
    });

    // TODO: 晤談紀錄查詢
    $("#filter-interview").validate();
    $("#search-interview").bind("click", function(e) {
        debugger
        var start_date = $('#filter-interview-start').val();
        var end_date = $('#filter-interview-end').val();

        $(_gg.interviewRecord).each(function() {
            var iDate = new Date(this.InterviewDate);
            var iNode = $('#interview-' + this.UID);
            iNode.removeClass("hide");

            if (iDate) {

                if (start_date && end_date)  {
                    // TODO: 限制區間
                    if (!(new Date(start_date) <= iDate && new Date(end_date) >= iDate)) {
                        iNode.addClass("hide");
                    }
                } else if (start_date) {
                    // TODO: 開始日之後
                    if (!(new Date(start_date) <= iDate)) {
                        iNode.addClass("hide");
                    }
                } else if (end_date) {
                    // TODO: 結束日之前
                    if (!(new Date(end_date) >= iDate)) {
                        iNode.addClass("hide");
                    }
                }
            }
        });

    });


    // TODO: 編輯視窗的相關設定
    $('.modal').modal({
        keyboard: false,
        show: false
    });

    $(".modal").on("hidden", function () {
        $(this).find("[id$=_errorMessage]").html("");
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
            if ($(this).find("[edit-target]").attr("edit-target") === 'E1') {
                if (_gg.editInterview) {
                    show_model();
                } else {
                    $(that).find("button[edit-target]").button('reset'); // TODO: 重設按鈕
                    // TODO: 移除表單驗證訊息
                    var validator = $(that).find('form').validate();
                    validator.resetForm();
                    $(that).find('.error').removeClass("error");
                    _gg.SetModifyData.addTalk(); // TOODO: 新增晤談紀錄
                }
            } else {
                e.preventDefault();
            }

            // TODO: ooooxxxx
            // if ($(this).find("[edit-target]").attr("edit-target").slice(0, 1) === 'B') {
            //     if (_gg.student.GradeYear && _gg.grade && (_gg.student.GradeYear === _gg.grade)) {
            //         show_model();
            //     } else {
            //         e.preventDefault();
            //     }
            // } else if ($(this).find("[edit-target]").attr("edit-target") === 'E1' && !_gg.editInterview) {
            //     $(that).find("button[edit-target]").button('reset'); // TODO: 重設按鈕
            //     // TODO: 移除表單驗證訊息
            //     var validator = $(that).find('form').validate();
            //     validator.resetForm();
            //     $(that).find('.error').removeClass("error");

            //     _gg.SetModifyData.addTalk(); // TOODO: 新增晤談紀錄
            // } else {
            //     show_model();
            // }
        } else {
            e.preventDefault();
        }
    });

    // TODO: 編輯畫面按下儲存鈕
    $('.modal button[edit-target]').bind('click', function(e) {
        var data_scope = $(this).closest(".modal").attr("id");

        if ($("#" + data_scope + " form").valid()) {
            $(this).button('loading'); // TODO: 按鈕為處理中
            _gg.SetSaveData(data_scope);
        }
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

        // TODO: ooooxxxx
        // if (_gg.student.GradeYear && _gg.grade && (_gg.student.GradeYear === _gg.grade)) {
        //     $('#B1 a[data-toggle=modal], #B2 a[data-toggle=modal], #B3 a[data-toggle=modal], #B4 a[data-toggle=modal], #B5 a[data-toggle=modal]').removeClass("disabled");
        // } else {
        //     $('#B1 a[data-toggle=modal], #B2 a[data-toggle=modal], #B3 a[data-toggle=modal], #B4 a[data-toggle=modal], #B5 a[data-toggle=modal]').addClass("disabled");
        // }
    });

    // TODO: 顯示資料
    _gg.SetData = function (data_scope) {
        // TODO: 處理部份類型的值
        var input_value = function (qtype, qvalue) {
            var tmp_data = '';
            if (qtype) {
                switch (qtype.toLowerCase()) {
                    case 'single_answer':
                        tmp_data = (qvalue.Data || '') + (qvalue.Remark || '');
                        break;
                    case 'multi_answer':
                        $.each(qvalue, function (index, item) {
                            if (index !== 0) {
                                tmp_data += ", ";
                            }

                            tmp_data += (item.Data || '') + (item.Remark || '');
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
                    '<td>' + (item.IsAlive === 't' ? '存':'歿') + '</td>' +
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
                    $('#B3 [data-type=grade]').html(tmp_chinese_grade);
                }
            });
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
                              '<td width="60%">' + date1 + '</td>' +
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
                /*
                var totalpage = $("#E1 .my-baseinfo-item").pager(5);

                if (totalpage > 1) {
                    var tmp_page = [];
                    for (var i=1; i<=totalpage; i+=1) {
                        tmp_page.push('<li' + ((i === 1) ? 'class="active"' : '') + '><a href="#">' + i + '</a></li>');
                    }

                    var page_str = '<ul>' + tmp_page.join("") + '</ul>';

                    $("#tab5 .pagination").html(page_str);
                    $("#tab5 .pagination:eq(1)").triggle();
                } else {
                    $('#E1 .hide').removeClass("hide");
                }
                */
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
                        $(item.QuizDataField.Field).each(function(key, value){
                            tmp_items.push('<p>' + value.name + '</p>' +
                                '<p class="my-lineheight">' + (tmp_content[value.name] || '') + '</p>'
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
                // TODO: ooooxxxx
                //$('a[data-toggle=modal]').removeClass("disabled");
                // TODO: ooooxxxx
                $('#talk-add-data').removeClass("disabled");


                $.each(_gg.col_Question, function(key, value) {
                    eval('input_' + key + '_value()');
                });
            } else {
                eval('input_' + data_scope + '_value()');
            }
        }
    };
});


(function($) {

    //EX1 回傳頁數:
    //$(Xml).find('xml或html').pager(指定一頁的數量)

    //EX2 回傳指定頁數的內容:
    //$(Xml).find('xml或html').pager(指定一頁的數量,指定的頁數)

    $.fn.pager = function(page, number) {

        //取得內容
        var t = this.text();

        //取得數量
        var _length = $(this).length;

        page = parseInt(page, 10);

        //共幾頁
        var pageTotal = Math.ceil(_length / page);

        //回傳指定頁數內容
        if (number != null) {
            $(this).filter(".my-baseinfo-item").addClass("hide");

            number = parseInt(number, 10);
            (number < 0) ? 0 : number;
            number = number - 1;
            var w = number * page;
            var a = w + page;
            if (a > _length) {
                a = _length;
            }
            /*return $(this).slice(w, a);*/
            for (var s=w; s<a; s+=1) {
                $(this).filter(':eq(' + s + ')').removeClass("hide");
            }
        } else {
        //回傳頁數量
            return pageTotal;
        }
    }
})(jQuery);