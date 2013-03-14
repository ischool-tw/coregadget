jQuery(function () {
    $('#mainMsg').html('資料載入中...');

    // TODO: 載入資料
    _gg.loadData();

    // TODO: 驗證提示樣式設定
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
        }
    });

    // TODO: 編輯畫面
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
        if ($("#editModal form").valid()) {
            // TODO: 驗證通過
            $(this).button("loading");
            if ($(this).attr('data-type') === 'cadres') {
                _gg.SaveCadres();
            } else {
                _gg.SaveSorce();
            }
        } else {
            $("#editModal #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  資料驗證失敗，請重新檢查！\n</div>");
        }
    });

    // TODO: 社團紀錄切換學年度學期
    $('body').on('click', 'button[tab-id]', function(event) {
        var tmp_tab = $(this).attr('tab-id');
        var tmp_year_semes = $(this).attr('year-semes');
        $('#' + tmp_tab + ' .row-fluid').addClass('hide');
        $('#' + tmp_tab + ' [year-semes=' + tmp_year_semes + ']').removeClass('hide');
    });

    // TODO: 成績登錄切換社團
    $('#changeClub_Score').bind('change', function(event) {
        _gg.SetScore(this.value);
    });

    // TODO: 幹部登錄切換社團
    $('#changeClub_Cadres').bind('change', function(event) {
        _gg.SetCadres(this.value);
    });

    // TODO: 點選編輯成績鈕
    $('#tabClub').on('click', '.my-baseinfo-item a', function(e) {
        if (_gg.GetOpeningState() === "yes") {
            $("#editModal #save-data").button("reset");
            var edit_target, clubid;
            edit_target = $(this).attr("edit-target");
            index = $(this).attr('data-index');
            clubid = $('#changeClub_Score').val();
            if (clubid) {
                _gg.EditScore(clubid, edit_target, index);
            }
        } else {
            e.preventDefault();
            return false;
        }
    });

    // TODO: 點選編輯幹部鈕
    $('#tabCadres').on('click', 'a', function(e) {
        var clubid = $('#changeClub_Cadres').val();
        if (clubid) {
            _gg.EditCadres(clubid);
        }
    });

    // TODO: 點選刪除幹部鈕
    $("#editModal").on('click', '.del_cadres', function(e) {
        $(this).closest('.control-group').remove();
    });

    // TODO: 登錄資料上下鍵、Enter鍵切換輸入框
    $('#editModal').on('keyup', 'input:text', function(e) {
        if (e.which === 38) {
            $(this).parent().parent().prev().find('input:text').focus();
        }
        if (e.which === 40 || e.which === 13) {
            $(this).parent().parent().next().find('input:text').focus();
        }
    });
});

var _gg = function() {
    var connection = gadget.getContract("ischool.universal_club.teacher"),
    col_class = null,
    col_clubs = null,
    col_cadres = null,
    weight = null,
    opening = {
        state: "no"
    };

    // TODO: 載入資料
    var loadData = function () {
        // TODO: 取回全部社團紀錄資料後，呼叫社團紀錄呈現
        var getClassStudent_data, getNoClubResultScore_data, getClubScore, getClubCadres;
        var check_ClassData = function() {
            if (getClassStudent_data && getNoClubResultScore_data && weight) {
                SetClass();
            }
        };

        var check_AllModuleData = function() {
            if (getClassStudent_data && getNoClubResultScore_data && weight && getClubScore && getClubCadres) {
                if (!$.isEmptyObject(col_clubs)) {
                    SetScore($('#changeClub_Score').val());
                }

                var navlist = [];
                $.each(col_class, function(myClassID, myClass) {
                    var tabid = 'Tab' + myClassID;
                    navlist.push('<li><a href="#' + tabid + '" data-toggle="tab">' + myClass.ClassName + '</a></li>')
                });

                if (!($.isEmptyObject(col_clubs))) {
                    navlist.push('<li id="navClub"><a href="#tabClub" data-toggle="tab">成績登錄</a></li>');
                }
                if (!($.isEmptyObject(col_cadres))) {
                    navlist.push('<li id="navCadres"><a href="#tabCadres" data-toggle="tab">幹部登錄</a></li>');
                }

                $('#mainMsg').html('');
                $('.nav').html(navlist.join('')).removeClass('hide').find('li:first a').trigger('click');
            }
        };

        // TODO: 取得比重
        connection.send({
            service: "_.GetWeight",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetWeight', error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Weight : void 0) != null) {
                        weight = [];
                        var items = [];
                        $(response.Response.Weight.Xml.Item).each(function (index, item) {
                            weight.push(item);

                            items.push(
                                '<th>' +
                                '    <a data-toggle="modal" href="#editModal" class="btn btn-success disabled"' +
                                ' edit-target="' + (item.Name || '') + '"' +
                                ' data-index="' + (index + 1) + '"' +
                                ' rel="tooltip" title="' + (item.Name || '') + '(' + (item.Proportion || '')  + '%)"><i class="icon-edit icon-white">' +
                                '    </i>成績 ' + (index + 1) + '</a>' +
                                '</th>'
                            );
                        });

                        $('#tabClub thead').html(
                            '<tr>' +
                            '    <th nowrap>學號</th>' +
                            '    <th nowrap>班級</th>' +
                            '    <th nowrap>座號</th>' +
                            '    <th nowrap>姓名</th>' +
                            items.join('') +
                            '    <th nowrap>試算學期成績</th>' +
                            '    <th nowrap>學期成績</th>' +
                            '</tr>'
                        ).find('a[rel=tooltip]').tooltip();

                        check_ClassData();
                        check_AllModuleData();
                    }
                }
            }
        });


        // TODO: 取得社團紀錄
        connection.send({
            service: "_.GetClassStudent",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetClassStudent', error);
                } else {
                    var _ref;
                    if (!col_class) { col_class = {}; }

                    if (((_ref = response.Response) != null ? _ref.Students : void 0) != null) {

                        var tmp_col_class = col_class;

                        $(response.Response.Students).each(function (index, item) {
                            var classid = item.ClassID;

                            if (!tmp_col_class[classid]) {
                                var tmp_class = {
                                    ClassID   : item.ClassID,
                                    ClassName : item.ClassName,
                                    Semes     : {}
                                };
                                tmp_col_class[classid] = tmp_class;
                            }

                            var tmp_this_semes = tmp_col_class[classid].Semes;
                            var semeid = ('' + item.ClubSchoolYear + item.ClubSemester) || '0';

                            if (semeid !== '0') {

                                if (!tmp_this_semes[semeid]) {
                                    tmp_this_semes[semeid] = {
                                        Students : []
                                    };
                                }

                                var tmp_cadreName = '';
                                var tmp_cn = item.CadreName.split(',');
                                $(tmp_cn).each(function(key, value) {
                                    if (value) {
                                        if (tmp_cadreName) tmp_cadreName += ', ';
                                        tmp_cadreName += value;
                                    }
                                });

                                var tmp_student = {
                                    StudentID      : item.StudentID,
                                    StudentName    : item.StudentName,
                                    StudentNumber  : item.StudentNumber,
                                    SeatNo         : item.SeatNo,
                                    SemsHistory    : item.SemsHistory,
                                    ColScore          : {},
                                    ClubID         : item.ClubID,
                                    ClubName       : item.ClubName,
                                    CadreName      : tmp_cadreName,
                                    ResultScore    : item.ResultScore,
                                    SCUID          : item.SCUID
                                };

                                if (item.Score.Xml && item.Score.Xml.Item) {
                                    $(item.Score.Xml.Item).each(function(idx, that_score) {
                                        tmp_student.ColScore[that_score.Name] = that_score.Score;
                                    });
                                }
                                tmp_this_semes[semeid].Students.push(tmp_student);
                            }

                        });
                    }
                }
                getClassStudent_data = true;
                check_ClassData();
                check_AllModuleData();
            }
        });


        // TODO: 轉學生的社團紀錄
        connection.send({
            service: "_.GetNoClubResultScore",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetNoClubResultScore', error);
                } else {
                    var _ref;
                    if (!col_class) { col_class = {}; }

                    if (((_ref = response.Response) != null ? _ref.ResultScore : void 0) != null) {

                        var tmp_col_class = col_class;

                        $(response.Response.ResultScore).each(function (index, item) {
                            var classid = item.ClassID;

                            if (!tmp_col_class[classid]) {
                                var tmp_class = {
                                    ClassID   : item.ClassID,
                                    ClassName : item.ClassName,
                                    Semes     : {}
                                };
                                tmp_col_class[classid] = tmp_class;
                            }

                            var tmp_this_semes = tmp_col_class[classid].Semes;
                            var semeid = ('' + item.ClubSchoolYear + item.ClubSemester) || '0';
                            if (semeid !== '0') {

                                if (!tmp_this_semes[semeid]) {
                                    tmp_this_semes[semeid] = {
                                        Students : []
                                    };
                                }

                                var tmp_cadreName = '';
                                var tmp_cn = item.CadreName.split(',');
                                $(tmp_cn).each(function(key, value) {
                                    if (value) {
                                        if (tmp_cadreName) tmp_cadreName += ', ';
                                        tmp_cadreName += value;
                                    }
                                });

                                var tmp_student = {
                                    StudentID      : item.StudentID,
                                    StudentName    : item.StudentName,
                                    StudentNumber  : item.StudentNumber,
                                    SeatNo         : item.SeatNo,
                                    SemsHistory    : item.SemsHistory,
                                    Score          : {},
                                    ClubID         : '',
                                    ClubName       : item.ClubName,
                                    CadreName      : tmp_cadreName,
                                    ResultScore    : item.ResultScore,
                                    SCUID          : ''
                                };
                                tmp_this_semes[semeid].Students.push(tmp_student);
                            }
                        });
                    }
                }
                getNoClubResultScore_data = true;
                check_ClassData();
                check_AllModuleData();
            }
        });


        // TODO: 成績登錄
        connection.send({
            service: "_.GetClubStudent",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetClubStudent', error);
                } else {
                    if (!col_clubs) { col_clubs = {}; }

                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Students : void 0) != null) {

                        var tmp_col_club = {};
                        var options = [];

                        $(response.Response.Students).each(function (index, item) {
                            var clubid = item.ClubID;
                            if (!tmp_col_club[clubid]) {
                                var tmp_club = {
                                    ClubID   : item.ClubID,
                                    ClubName : item.ClubName,
                                    Students : []
                                };
                                tmp_col_club[clubid] = tmp_club;
                                options.push('<option value="' + clubid + '">' + item.ClubName + '</option>');
                            }

                            if (item.StudentID) {
                                var tmp_student = {
                                    StudentID     : item.StudentID,
                                    StudentName   : item.StudentName,
                                    StudentNumber : item.StudentNumber,
                                    SeatNo        : item.SeatNo,
                                    GradeYear     : item.GradeYear,
                                    ClassID       : item.ClassID,
                                    ClassName     : item.ClassName,
                                    DisplayOrder  : item.DisplayOrder,
                                    ColScore         : {},
                                    ClubID        : item.ClubID,
                                    ClubName      : item.ClubName,
                                    ResultScore   : item.ResultScore,
                                    SCUID         : item.SCUID,
                                    Score         : item.Score
                                };
                                if (item.Score.Xml && item.Score.Xml.Item) {
                                    $(item.Score.Xml.Item).each(function(idx, that_score) {
                                        tmp_student.ColScore[that_score.Name] = that_score.Score;
                                    });
                                }
                                tmp_col_club[clubid].Students.push(tmp_student);
                            }

                        });

                        col_clubs = tmp_col_club;
                        $('#changeClub_Score').html(options.join(''));
                    }

                    getClubScore = true;
                    check_AllModuleData();

                    if ($.isEmptyObject(col_clubs)) {
                        $('#tabClub').remove();
                    } else {
                        // TODO: 取得目前學年度 及 開放期間
                        connection.send({
                            service: "_.GetDTScore",
                            body: '',
                            result: function (response, error, http) {
                                if (error !== null) {
                                    set_error_message('#mainMsg', 'GetDTScore', error);
                                } else {
                                    if (response.DTScore != null) {
                                        var schoolYear = '', semester = '';
                                        $(response.DTScore).each(function (index, item) {
                                            opening = item;
                                            schoolYear = item.Result.SystemConfig.DefaultSchoolYear;
                                            semester = item.Result.SystemConfig.DefaultSemester;
                                        });

                                        opening.state = "no";

                                        if (opening.Start && opening.End) {
                                            var tmp_Date  = new Date();
                                            var Startdate = $.parseDate(opening.Start);
                                            var Enddate   = $.parseDate(opening.End);

                                            if (Startdate <= tmp_Date && Enddate >= tmp_Date) {
                                                opening.state = "yes";
                                                var tmp_html = '' +
                                                    '<div class="alert alert-error">' +
                                                        schoolYear + ' 學年度第 ' + semester +
                                                        ' 學期　成績輸入區間： ' + opening.Start + ' ~ ' + opening.End +
                                                    '</div>';
                                                $('#opening').html(tmp_html);
                                                $('a[data-toggle=modal]').removeClass("disabled");
                                            }
                                        }
                                    }

                                    if (opening.state === "no") {
                                        $('#opening').html('<div class="alert alert-error">未開放登錄</div>');
                                    }
                                }
                            }
                        });

                    }
                }
            }
        });


        // TODO: 幹部登錄
        connection.send({
            service: "_.GetCadresRecord",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetCadresRecord', error);
                } else {
                    if (!col_cadres) { col_cadres = {}; }

                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.CadresRecord : void 0) != null) {

                        var tmp_col_cadres = {};
                        var options = [];

                        $(response.Response.CadresRecord).each(function (index, item) {
                            var clubid = item.ClubID;
                            if (!tmp_col_cadres[clubid]) {
                                var tmp_club = {
                                    ClubID   : item.ClubID,
                                    ClubName : item.ClubName,
                                    Cadres : []
                                };
                                tmp_col_cadres[clubid] = tmp_club;
                                options.push('<option value="' + clubid + '">' + item.ClubName + '</option>');
                            }

                            var tmp_cadres = item;

                            tmp_col_cadres[clubid].Cadres.push(tmp_cadres);
                        });

                        col_cadres = tmp_col_cadres;
                        $('#changeClub_Cadres').html(options.join(''));
                    }

                    getClubCadres = true;
                    check_AllModuleData();

                    if ($.isEmptyObject(col_cadres)) {
                        $('#tabCadres').remove();
                    } else {
                        SetCadres($('#changeClub_Cadres').val());
                    }
                }
            }
        });
    };

    // TODO: 處理社團紀錄
    var SetClass = function () {
        $.each(col_class, function(myClassID, myClass) {
            var tabid = 'Tab' + myClassID;
            var arys = [], btns = [], thead_html = [], proportions_html = [];

            if ($.isEmptyObject(myClass.Semes)) {
                arys.push('無社團紀錄');
            } else {
                thead_html.push(
                    '        <thead>' +
                    '          <tr>' +
                    '            <th rowspan="2">座號</th>' +
                    '            <th rowspan="2">學號</th>' +
                    '            <th rowspan="2">姓名</th>' +
                    '            <th rowspan="2">社團</th>' +
                    '            <th rowspan="2">幹部</th>'
                );

                $(weight).each(function(_index, _weight) {
                    thead_html.push('<th>' + (_weight.Name || '') + '</th>');
                    proportions_html.push('<th>(' + (_weight.Proportion || '') + '%)</th>');
                });

                thead_html.push(
                    '            <th rowspan="2">學期成績</th>' +
                    '          </tr>' +
                    '          <tr>' + proportions_html.join('') + '</tr>' +
                    '        </thead>'
                );

                $.each(myClass.Semes, function(mySemes, myStudents) {
                    btns.push('<button class="btn btn-large" tab-id="' + tabid + '" year-semes="' + mySemes + '">' + mySemes.slice(0, -1) + '學年度第' + mySemes.slice(-1) + '學期</button>');
                    arys.push('<div class="row-fluid hide" year-semes="' + mySemes + '">' +
                        '  <div class="span12">' +
                        '    <div class="my-baseinfo-item">' +
                        '      <table class="table table-bordered table-striped">' +
                        thead_html.join('') +
                        '        <tbody>'
                    );

                    $(myStudents.Students).each(function(key, value) {
                        var score_html = [];
                        var _resultScore = (value.ResultScore || '');
                        if ($.isNumeric(_resultScore)) {
                            _resultScore = parseInt(_resultScore, 10);
                            if (_resultScore < 60) {
                                _resultScore = '<span class="failscore">' + _resultScore + '</span>';
                            }
                        }

                        $(weight).each(function(_index, _weight) {
                            var _score = (value.ColScore[_weight.Name] || '');
                            if ($.isNumeric(_score)) {
                                _score = parseInt(_score, 10);
                                if (_score < 60) {
                                    _score = '<span class="failscore">' + _score + '</span>';
                                }
                            }
                            score_html.push('<td id="s' + (_weight.Name || '') + (value.SCUID || '') + '">' + _score + '</td>');
                        });

                        arys.push('<tr>' +
                            '  <td clsss="my-nowrap">' + (value.SeatNo || '')        + '</td>' +
                            '  <td class="my-nowrap">' + (value.StudentNumber || '') + '</td>' +
                            '  <td class="my-nowrap">' + (value.StudentName || '')   + '</td>' +
                            '  <td class="my-min-width1">' + (value.ClubName || '')      + '</td>' +
                            '  <td class="my-min-width2" clubid="' + value.ClubID + '" studentID="' + value.StudentID + '">' + (value.CadreName || '')     + '</td>' +
                            score_html.join('') +
                            '  <td>' + _resultScore   + '</td>' +
                            '</tr>');
                    });
                    arys.push('</tbody></table></div></div></div>');
                });
            }

            var sortYearSemesDesc = function(a, b) {
                return $(b).attr('year-semes') - $(a).attr('year-semes');
            };

            var html_s = '<div class="tab-pane" id="' + tabid + '">' +
                '<div class="btn-group" data-toggle="buttons-radio">' + btns.sort(sortYearSemesDesc).join('') + '</div>' +
                arys.join('') +
                '</div>';

            $('.tab-content').append(html_s);
            $('#'+ tabid).find('.btn-group>.btn:first').trigger('click');
        });
    };

    // TODO: 試算學期成績
    var funWeightScore = function(_all_score) {
        var total_score = 0, avg_score = 0;
        $(weight).each(function(_index, _weight) {
            if (_all_score) {
                var _score = (_all_score[_weight.Name] || '');
                if ($.isNumeric(_score) && $.isNumeric(_weight.Proportion)) {
                    total_score += parseInt(_score, 10) * parseInt(_weight.Proportion, 10);
                }
            }
        });
        avg_score = Math.round((total_score) / 100);
        if (avg_score < 60) {
            avg_score = '<span class="failscore">' + avg_score + '</span>';
        }
        return avg_score;
    };

    // TODO: 成績登錄畫面
    var SetScore = function (clubid) {
        if (clubid) {
            var students = col_clubs[clubid].Students;
            if (students) {
                var arys = [];
                $(students).each(function(key, value) {
                    var score_html = [];
                    var _resultScore = (value.ResultScore || '');
                    if ($.isNumeric(_resultScore)) {
                        _resultScore = parseInt(_resultScore, 10);
                        if (_resultScore < 60) {
                            _resultScore = '<span class="failscore">' + _resultScore + '</span>';
                        }
                    }

                    $(weight).each(function(_index, _weight) {
                        var _score = (value.ColScore[_weight.Name] || '');
                        if ($.isNumeric(_score)) {
                            _score = parseInt(_score, 10);
                            if (_score < 60) {
                                _score = '<span class="failscore">' + _score + '</span>';
                            }
                        }
                        score_html.push('<td>' + _score + '</td>');
                    });

                    arys.push('<tr>' +
                        '  <td>' + (value.StudentNumber || '') + '</td>' +
                        '  <td>' + (value.ClassName || '') + '</td>' +
                        '  <td>' + (value.SeatNo || '')   + '</td>' +
                        '  <td>' + (value.StudentName || '') + '</td>' +
                        score_html.join('') +
                        '  <td>' + funWeightScore(value.ColScore) + '</td>' +
                        '  <td>' + _resultScore + '</td>' +
                        '</tr>');
                });

                $('#tabClub tbody').html(arys.join(''));
            } else {
                $('#tabClub tbody').html('<tr><td>目前無學生</td></tr>');
            }
        }
    };

    // TODO: 成績登錄編輯畫面
    var EditScore = function (clubid, edit_target, _index) {
        if (clubid) {
            var edit_title, scoreType;
            edit_title = _index + '：' + edit_target + '(' + (weight[edit_target] || '')  + '%)';
            scoreType = edit_target;

            var students = col_clubs[clubid].Students;
            if (students) {
                var arys = [];
                $(students).each(function(key, value) {
                    arys.push('<div class="control-group">' +
                        '    <label class="control-label">' + (value.StudentNumber || '') + ' ' + (value.StudentName || '') + '</label>' +
                        '    <div class="controls">' +
                        '        <input type="text" name="s' + (value.StudentNumber || '') + '" class="{digits:true, range:[0, 100]} input-large" id="' + (value.SCUID || '') + '"' +
                        ' placeholder="成績..." value="' + (value.ColScore[scoreType] || '') + '">' +
                        '    </div>' +
                        '</div>');
                });
            }

            $('#editModal').find('h3').html(edit_title).end().find('fieldset').html(arys.join(''));
            $("#save-data").attr('data-type', scoreType);
            $('#editModal input:text:first').focus();
        }
    };

    // TODO: 成績登錄儲存
    var SaveSorce = function () {
        var scoreType = $("#save-data").attr('data-type'),
            clubid = $('#changeClub_Score').val(),
            students, ori_ss,
            request = [],
            change_data;

        if (clubid) {
                students = col_clubs[clubid].Students;
                if (students) {
                    ori_ss = $.extend(true, [], students);
                    $(students).each(function(key, student) {
                        change_data = false;
                        var tmp_obj = {
                            Condition: {
                                UID: (student.SCUID || '0')
                            },
                            Score: function () {
                                var that_score = $.trim($('#'+(student.SCUID)).val() || '');
                                if (that_score !== '') {
                                    that_score = parseInt(that_score, 10) + '';
                                } else {
                                    that_score = '';
                                }

                                student.ColScore[scoreType] = that_score;
                                if (student.Score.Xml && student.Score.Xml.Item) {
                                    $(student.Score.Xml.Item).each(function() {
                                        if (this.Name === scoreType) {
                                            this.Score = that_score;
                                            change_data = true;
                                        }
                                    });
                                    if (!change_data) {
                                        if (!$.isArray(student.Score.Xml.Item)) {
                                            student.Score.Xml.Item = [student.Score.Xml.Item];
                                        }
                                        student.Score.Xml.Item.push({
                                            '@'     : ['Name', 'Score'],
                                            'Name'  : scoreType,
                                            'Score' : that_score
                                        });
                                    }
                                } else {
                                    student.Score = {
                                        Xml: {
                                            Item: [{
                                                '@'     : ['Name', 'Score'],
                                                'Name'  : scoreType,
                                                'Score' : that_score
                                            }]
                                        }
                                    };
                                }

                                return student.Score;
                            }()
                        };
                        request.push(tmp_obj);
                    });

                    connection.send({
                        service: "_.UpdateScore",
                        body: {
                            Request: {
                                Students: request
                            }
                        },
                        result: function (response, error, http) {
                            if (error !== null) {
                                students = $.extend(true, [], ori_ss);
                                set_error_message('#errorMessage', 'UpdateScore', error);
                            } else {
                                // TODO: 處理同是班導師又是社團老師，且社團學生與所帶班級相同之學生社團成績
                                $(students).each(function(key, value) {
                                    var tmp_score = $('#'+(value.SCUID)).val();
                                    if (tmp_score !== '') {
                                        tmp_score = parseInt(tmp_score, 10) + '';
                                    } else {
                                        tmp_score = '';
                                    }
                                    value[scoreType] = tmp_score;
                                    $('#s' + scoreType + value.SCUID).html(tmp_score);
                                });

                                SetScore(clubid);

                                $('#editModal').modal("hide");
                            }
                        }
                    });
                }
        }
    };


    // TODO: 幹部登錄畫面
    var SetCadres = function (clubid) {
        if (clubid) {
            var cdres = col_cadres[clubid].Cadres;
            if (cdres) {
                var arys = [];
                $(cdres).each(function(key, value) {
                    arys.push('<tr>' +
                        '  <td>' + (value.CadreName || '') + '</td>' +
                        '  <td>' + (value.StudentNumber || '') + '</td>' +
                        '  <td>' + (value.ClassName || '') + '</td>' +
                        '  <td>' + (value.SeatNo || '')   + '</td>' +
                        '  <td>' + (value.StudentName || '') + '</td>' +
                        '</tr>');
                });
                $('#tabCadres tbody').html(arys.join(''));
            }
        }
    };

    // TODO: 幹部登錄編輯畫面
    var EditCadres = function (clubid) {
        if (clubid) {
            var items = [], maxCadresNum = 2;

            items.push(
                '<div class="my-emptyline"></div>' +
                '<a href="#" class="btn pull-right" id="cadres-add">' +
                    '<i class="icon-plus-sign"></i>新增幹部</a>' +
                '<hr />'
            );

            var cadres = col_cadres[clubid].Cadres;
            var options = ['<option value="">請選擇...</option>'];
            var students = col_clubs[clubid].Students;
            if (students) {
                $(students).each(function(key, value) {
                    options.push('<option ');
                    options.push('value="' + (value.StudentID || '') + '"');
                    options.push('>' + (value.StudentName || '') + '</option>');
                });
            }

            if (cadres) {
                $(cadres).each(function(key, value) {
                    var index = $.inArray('value="' + (value.StudentID || '') + '"', options);
                    var option1 = options.slice();
                    option1[index] += ' selected';

                    if (value.CadreName === '社長' || value.CadreName === '副社長') {
                        items.push('<div class="control-group">' +
                            '    <label class="control-label">' + (value.CadreName || '') + '</label>' +
                            '    <div class="controls">' +
                            '        <select name="s' + key + '">' + option1.join('') + '</select>' +
                            '    </div>' +
                            '</div>'
                        );
                    } else {
                        items.push(
                            '<div class="control-group">' +
                            '    <label class="control-label">其他幹部<br/>' +
                            '<a href="#" class="btn btn-danger del_cadres" title="刪除"><i class="icon-trash icon-white"></i></a>' +
                            '</label>' +
                            '    <div class="controls">' +
                            '        <input type="text" class="{required:true} input-large my-cadres-input" name="c' + key + '" placeholder="幹部名稱..." value="' + (value.CadreName || '') + '">' +
                            '        <select name="s' + key + '" class="{required:true}">' + option1.join('') + '</select>' +
                            '    </div>' +
                            '</div>'
                        );
                    }
                    maxCadresNum = key;
                });
            }

            $('#editModal').find('h3').html('新增幹部').end().find('fieldset').html(items.join(''));
            $("#save-data").attr('data-type', 'cadres');
            $("#cadres-add").attr("new-id", maxCadresNum);
            $('#editModal input:text:first').focus();

            // TODO: 點選新增幹部鈕
            $("#cadres-add").on('click', '', function(e) {
                var cadresNum = parseInt($("#cadres-add").attr("new-id"), 10) + 1;
                $("#cadres-add").attr("new-id", cadresNum);

                $('#editModal fieldset').append(
                    '<div class="control-group">' +
                    '    <label class="control-label">其他幹部<br/>' +
                    '<a href="#" class="btn btn-danger del_cadres" title="刪除"><i class="icon-trash icon-white"></i></a>' +
                    '</label>' +
                    '    <div class="controls">' +
                    '        <input type="text" class="{required:true} input-large my-cadres-input" name="c' + cadresNum + '"' +
                    ' placeholder="幹部名稱..." value="">' +
                    '        <select name="s' + cadresNum + '" class="{required:true}">' + options.join('') + '</select>' +
                    '    </div>' +
                    '</div>'
                );
            });
        }
    };

    // TODO: 幹部登錄儲存
    var SaveCadres = function () {
        var clubid;
        clubid = $('#changeClub_Cadres').val();

        if (clubid) {
            var run_ClubCadres = false, run_CadresRecord = false;
            var tmp_cadresListA = [], tmp_cadresListB = [];

            // TODO: 重設資料
            var ResetData = function() {
                if (run_ClubCadres && run_CadresRecord) {
                    var cadres = tmp_cadresListA.concat(tmp_cadresListB);
                    col_cadres[clubid].Cadres = cadres;
                    SetCadres(clubid);

                    // TODO: 處理同是班導師又是社團老師，且社團學生與所帶班級相同之學生幹部名稱
                    $('td[clubid=' + clubid + ']').html('');
                    $(cadres).each(function(){
                        var tmp_student = $('td[clubid=' + clubid + '][studentid=' + this.StudentID + ']');
                        if (tmp_student) {
                            var tmp_cadres_name = (tmp_student.html() || '');
                            if (tmp_cadres_name) {
                                tmp_cadres_name += ', ' + this.CadreName;
                            } else {
                                tmp_cadres_name = this.CadreName;
                            }
                            tmp_student.html(tmp_cadres_name);
                        }
                    });

                    $('#editModal').modal("hide");
                }
            };

            // TODO: 取得新幹部學生資料
            var GetStudentInfo = function(studentID)  {
                var students = col_clubs[clubid].Students;
                var student = {};
                $(students).each(function(key, value){
                    if (value.StudentID === studentID) {
                        student = value;
                        return false;
                    }
                });
                return student;
            };

            // TODO: 儲存社長、副社長
            var request1 = [];
            var president = ($('#editModal select[name=s0]').val() || '');
            var vicePresident = ($('#editModal select[name=s1]').val() || '');
            request1.push('<ClubRecord><Condition><ClubID>' + (clubid || '0')  + '</ClubID></Condition>');
            request1.push('<President>' + president + '</President>');
            request1.push('<VicePresident>' + vicePresident + '</VicePresident>');
            request1.push('</ClubRecord>');

            connection.send({
                service: "_.UpdateClubCadres",
                body: '<Request>' + request1.join('') + '</Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#errorMessage', 'UpdateClubCadres', error);
                    } else {
                        var student;
                        if (president) {
                            student = GetStudentInfo(president);
                            tmp_cadresListA.push({
                                'CadreName'     :'社長',
                                'ClassName'     :student.ClassName,
                                'ClubID'        :student.ClubID,
                                'ClubName'      :student.ClubName,
                                'SeatNo'        :student.SeatNo,
                                'StudentID'     :student.StudentID,
                                'StudentName'   :student.StudentName,
                                'StudentNumber' :student.StudentNumber
                            });
                        } else {
                            tmp_cadresListA.push({
                                'CadreName'     :'社長',
                                'ClassName'     :'',
                                'ClubID'        :'',
                                'ClubName'      :'',
                                'SeatNo'        :'',
                                'StudentID'     :'',
                                'StudentName'   :'',
                                'StudentNumber' :''
                            });
                        }
                        if (vicePresident) {
                            student = GetStudentInfo(vicePresident);
                            tmp_cadresListA.push({
                                'CadreName'     :'副社長',
                                'ClassName'     :student.ClassName,
                                'ClubID'        :student.ClubID,
                                'ClubName'      :student.ClubName,
                                'SeatNo'        :student.SeatNo,
                                'StudentID'     :student.StudentID,
                                'StudentName'   :student.StudentName,
                                'StudentNumber' :student.StudentNumber
                            });
                        } else {
                            tmp_cadresListA.push({
                                'CadreName'     :'副社長',
                                'ClassName'     :'',
                                'ClubID'        :'',
                                'ClubName'      :'',
                                'SeatNo'        :'',
                                'StudentID'     :'',
                                'StudentName'   :'',
                                'StudentNumber' :''
                            });
                        }
                        run_ClubCadres = true;
                        ResetData();
                    }
                }
            });

            // TODO: 儲存其他幹部
            var request2 = [];
            $('#editModal .controls input:text').each(function() {
                var cadreName = ($(this).val() || '');
                var studentID = ($(this).nextUntil('input:text', 'select').val() || '');
                if (cadreName && studentID) {
                    request2.push('<CadresRecord>');
                    request2.push('<ClubID>' + (clubid || '0')  + '</ClubID>');
                    request2.push('<CadreName>' + cadreName + '</CadreName>');
                    request2.push('<StudentID>' + studentID + '</StudentID>');
                    request2.push('</CadresRecord>');

                    var student = GetStudentInfo(studentID);
                    tmp_cadresListB.push({
                        'CadreName'     :cadreName,
                        'ClassName'     :student.ClassName,
                        'ClubID'        :student.ClubID,
                        'ClubName'      :student.ClubName,
                        'SeatNo'        :student.SeatNo,
                        'StudentID'     :student.StudentID,
                        'StudentName'   :student.StudentName,
                        'StudentNumber' :student.StudentNumber
                    });
                }
            });

            if (request2.join('')) {
                connection.send({
                    service: "_.UpdateCadresRecord",
                    body: '<Request>' + request2.join('') + '</Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            set_error_message('#errorMessage', 'UpdateCadresRecord', error);
                        } else {
                            run_CadresRecord = true;
                            ResetData();
                        }
                    }
                });
            } else {
                connection.send({
                    service: "_.DelCadresRecord",
                    body: '<Request><CadresRecord><Condition><ClubID>' + clubid + '</ClubID></Condition></CadresRecord></Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            set_error_message('#errorMessage', 'DelCadresRecord', error);
                        } else {
                            run_CadresRecord = true;
                            ResetData();
                        }
                    }
                });

            }
        }
    };

    // TODO: 錯誤訊息
    var set_error_message = function(select_str, serviceName, error) {
        if (serviceName) {
            var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
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
                        }
                    } else if (error.dsaError.message) {
                        tmp_msg = error.dsaError.message;
                    }
                } else if (error.loginError.message) {
                    tmp_msg = error.loginError.message;
                } else if (error.message) {
                    tmp_msg = error.message;
                }
                $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
                $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
            }
        } else {
            $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
        }
    };

    return {
        loadData : function() {
            return loadData();
        },
        SaveCadres : function() {
            return SaveCadres();
        },
        SaveSorce : function() {
            return SaveSorce();
        },
        SetScore : function(_clubid) {
            return SetScore(_clubid);
        },
        SetCadres : function(_clubid) {
            return SetCadres(_clubid);
        },
        EditScore : function(_clubid, _edit_target, _index) {
            return EditScore(_clubid, _edit_target, _index);
        },
        EditCadres : function(_clubid) {
            return EditCadres(_clubid);
        },
        set_error_message : function(_select_str, _serviceName, _error) {
            return set_error_message(_select_str, _serviceName, _error);
        },
        GetOpeningState : function() {
            return (opening.state || 'no');
        }
    };
}();

