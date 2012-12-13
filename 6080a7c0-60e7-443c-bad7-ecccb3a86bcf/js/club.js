var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.club.teacher");
_gg.col_class = null;
_gg.col_clubs = null;
_gg.opening = {
    state: "no"
};

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
    $('button[tab-id]').live('click', function(event) {
        var tmp_tab = $(this).attr('tab-id');
        var tmp_year_semes = $(this).attr('year-semes');
        $('#' + tmp_tab + ' .row-fluid').addClass('hide');
        $('#' + tmp_tab + ' [year-semes=' + tmp_year_semes + ']').removeClass('hide');
    });

    // TODO: 成績登錄切換社團
    $('#changeClub_Score').bind('change', function(event) {
        _gg.SetScore(this.value);
    });

    // TODO: 社團登錄切換社團
    $('#changeClub_Cadres').bind('change', function(event) {
        _gg.SetCadres(this.value);
    });

    // TODO: 點選編輯成績鈕
    $('#tabClub').on('click', '.my-baseinfo-item a', function(e) {
        if (_gg.opening.state === "yes") {
            $("#editModal #save-data").button("reset");
            var edit_target, clubid;
            edit_target = $(this).attr("edit-target");
            clubid = $('#changeClub_Score').val();
            if (clubid) {
                _gg.EditScore(clubid, edit_target);
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


// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '';
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

// TODO: 載入資料
_gg.loadData = function () {
    // TODO: 取回全部社團紀錄資料後，呼叫社團紀錄呈現
    var getClassStudent_data, getNoClubResultScore_data, getClubScore, getClubCadres;
    var check_ClassData = function() {
        if (getClassStudent_data && getNoClubResultScore_data && _gg.weight) {
            _gg.SetClass();
        }
    };

    var check_AllModuleData = function() {
        if (getClassStudent_data && getNoClubResultScore_data && _gg.weight && getClubScore && getClubCadres) {
            var navlist = [];
            $.each(_gg.col_class, function(myClassID, myClass) {
                var tabid = 'Tab' + myClassID;
                navlist.push('<li><a href="#' + tabid + '" data-toggle="tab">' + myClass.ClassName + '</a></li>')
            });

            if (!($.isEmptyObject(_gg.col_clubs))) {
                navlist.push('<li id="navClub"><a href="#tabClub" data-toggle="tab">成績登錄</a></li>');
            }
            if (!($.isEmptyObject(_gg.col_cadres))) {
                navlist.push('<li id="navCadres"><a href="#tabCadres" data-toggle="tab">幹部登錄</a></li>');
            }

            $('#mainMsg').html('');
            $('.nav').html(navlist.join('')).removeClass('hide').find('li:first a').trigger('click');
        }
    };

    // TODO: 取得比重
    _gg.connection.send({
        service: "_.GetWeight",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetWeight', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.Weight : void 0) != null) {
                    $(response.Response.Weight).each(function (index, item) {
                        _gg.weight = item;
                    });
                    check_ClassData();
                    check_AllModuleData();
                }
            }
        }
    });


    // TODO: 取得社團紀錄
    _gg.connection.send({
        service: "_.GetClassStudent",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetCurrentSemester', error);
            } else {
                var _ref;
                if (!_gg.col_class) { _gg.col_class = {}; }

                if (((_ref = response.Response) != null ? _ref.Students : void 0) != null) {

                    var tmp_col_class = _gg.col_class;

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
                                PaScore        : item.PaScore,
                                ArScore        : item.ArScore,
                                FarScore       : item.FarScore,
                                AasScore       : item.AasScore,
                                ClubID         : item.ClubID,
                                ClubName       : item.ClubName,
                                CadreName      : tmp_cadreName,
                                ResultScore    : item.ResultScore,
                                SCUID          : item.SCUID
                            };
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
    _gg.connection.send({
        service: "_.GetNoClubResultScore",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetNoClubResultScore', error);
            } else {
                var _ref;
                if (!_gg.col_class) { _gg.col_class = {}; }

                if (((_ref = response.Response) != null ? _ref.ResultScore : void 0) != null) {

                    var tmp_col_class = _gg.col_class;

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
                                PaScore        : item.PaScore,
                                ArScore        : item.ArScore,
                                FarScore       : item.FarScore,
                                AasScore       : item.AasScore,
                                ClubID         : item.ClubID,
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
    _gg.connection.send({
        service: "_.GetClubStudent",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetClubStudent', error);
            } else {
                if (!_gg.col_clubs) { _gg.col_clubs = {}; }

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

                        var tmp_student = item;
                        tmp_col_club[clubid].Students.push(tmp_student);
                    });

                    _gg.col_clubs = tmp_col_club;
                    $('#changeClub_Score').html(options.join(''));
                }

                getClubScore = true;
                check_AllModuleData();

                if ($.isEmptyObject(_gg.col_clubs)) {
                    $('#tabClub').remove();
                } else {
                    _gg.SetScore($('#changeClub_Score').val());

                    // TODO: 取得目前學年度 及 開放期間
                    _gg.connection.send({
                        service: "_.GetDTScore",
                        body: '',
                        result: function (response, error, http) {
                            if (error !== null) {
                                _gg.set_error_message('#mainMsg', 'GetDTScore', error);
                            } else {
                                if (response.DTScore != null) {
                                    var schoolYear = '', semester = '';
                                    $(response.DTScore).each(function (index, item) {
                                        _gg.opening = item;
                                        schoolYear = item.Result.SystemConfig.DefaultSchoolYear;
                                        semester = item.Result.SystemConfig.DefaultSemester;
                                    });

                                     _gg.opening.state = "no";

                                    if (_gg.opening.Start && _gg.opening.End) {
                                        var tmp_Date  = new Date();
                                        var Startdate = $.parseDate(_gg.opening.Start);
                                        var Enddate   = $.parseDate(_gg.opening.End);

                                        if (Startdate <= tmp_Date && Enddate >= tmp_Date) {
                                            _gg.opening.state = "yes";
                                            var tmp_html = '' +
                                                '<div class="alert alert-error">' +
                                                    schoolYear + ' 學年度第 ' + semester +
                                                    ' 學期　成績輸入區間： ' + _gg.opening.Start + ' ~ ' + _gg.opening.End +
                                                '</div>';
                                            $('#opening').html(tmp_html);
                                            $('a[data-toggle=modal]').removeClass("disabled");
                                        } else {
                                            $('#opening').html('<div class="alert alert-error">未開放登錄</div>');
                                        }
                                    }
                                }
                            }
                        }
                    });

                }
            }
        }
    });


    // TODO: 幹部登錄
    _gg.connection.send({
        service: "_.GetCadresRecord",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetCadresRecord', error);
            } else {
                if (!_gg.col_cadres) { _gg.col_cadres = {}; }

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

                    _gg.col_cadres = tmp_col_cadres;
                    $('#changeClub_Cadres').html(options.join(''));
                }

                getClubCadres = true;
                check_AllModuleData();

                if ($.isEmptyObject(_gg.col_cadres)) {
                    $('#tabCadres').remove();
                } else {
                    _gg.SetCadres($('#changeClub_Cadres').val());
                }
            }
        }
    });
};

// TODO: 處理社團紀錄
_gg.SetClass = function () {
    $.each(_gg.col_class, function(myClassID, myClass) {
        var tabid = 'Tab' + myClassID;
        var arys = [], btns = [];

        if ($.isEmptyObject(myClass.Semes)) {
            arys.push('無社團紀錄');
        } else {
            $.each(myClass.Semes, function(mySemes, myStudents) {
                btns.push('<button class="btn btn-large" tab-id="' + tabid + '" year-semes="' + mySemes + '">' + mySemes.slice(0, -1) + '學年度第' + mySemes.slice(-1) + '學期</button>');
                arys.push('<div class="row-fluid hide" year-semes="' + mySemes + '">' +
                    '  <div class="span12">' +
                    '    <div class="my-baseinfo-item">' +
                    '      <table class="table table-bordered table-striped">' +
                    '        <thead>' +
                    '          <tr>' +
                    '            <th nowrap>座號</th>' +
                    '            <th nowrap>學號</th>' +
                    '            <th nowrap width="9%">姓名</th>' +
                    '            <th nowrap width="15%">社團</th>' +
                    '            <th nowrap width="15%">幹部</th>' +
                    '            <th>平時活動(' +     (_gg.weight.PaWeight || '')  + '%)</th>' +
                    '            <th>出缺席(' +       (_gg.weight.ArWeight || '')  + '%)</th>' +
                    '            <th>活動力及服務(' + (_gg.weight.AasWeight || '')  + '%)</th>' +
                    '            <th>成品成果考驗(' + (_gg.weight.FarWeight || '')  + '%)</th>' +
                    '            <th nowrap>學期成績</th>' +
                    '          </tr>' +
                    '        </thead>' +
                    '        <tbody>');
                $(myStudents.Students).each(function(key, value) {
                    arys.push('<tr>' +
                        '  <td>' + (value.SeatNo || '')        + '</td>' +
                        '  <td>' + (value.StudentNumber || '') + '</td>' +
                        '  <td>' + (value.StudentName || '')   + '</td>' +
                        '  <td>' + (value.ClubName || '')      + '</td>' +
                        '  <td clubid="' + value.ClubID + '" studentID="' + value.StudentID + '">' + (value.CadreName || '')     + '</td>' +
                        '  <td id="PaScore' + (value.SCUID || '') + '">' + (value.PaScore || '')       + '</td>' +
                        '  <td id="ArScore' + (value.SCUID || '') + '">' + (value.ArScore || '')       + '</td>' +
                        '  <td id="AasScore' + (value.SCUID || '') + '">' + (value.AasScore || '')     + '</td>' +
                        '  <td id="FarScore' + (value.SCUID || '') + '">' + (value.FarScore || '')     + '</td>' +
                        '  <td>' + (value.ResultScore || '')   + '</td>' +
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
_gg.funWeightScore = function (paScore, arScore, aasScore, farScore) {
    if (_gg.weight) {
        var a = 0, b = 0, c = 0, d = 0;
        if ($.isNumeric(paScore) && $.isNumeric(_gg.weight.PaWeight)) {
            a = parseInt(paScore, 10) * parseInt(_gg.weight.PaWeight, 10);
        }
        if ($.isNumeric(arScore) && $.isNumeric(_gg.weight.ArWeight)) {
            b = parseInt(arScore, 10) * parseInt(_gg.weight.ArWeight, 10);
        }
        if ($.isNumeric(aasScore) && $.isNumeric(_gg.weight.AasWeight)) {
            c = parseInt(aasScore, 10) * parseInt(_gg.weight.AasWeight, 10);
        }
        if ($.isNumeric(farScore) && $.isNumeric(_gg.weight.FarWeight)) {
            d = parseInt(farScore, 10) * parseInt(_gg.weight.FarWeight, 10);
        }

        return Math.round((a + b + c + d) / 100);
    }
    return 0;
};

// TODO: 成績登錄畫面
_gg.SetScore = function (clubid) {
    if (clubid) {
        var students = _gg.col_clubs[clubid].Students;
        if (students) {
            var arys = [];
            $(students).each(function(key, value) {
                arys.push('<tr>' +
                    '  <td>' + (value.StudentNumber || '') + '</td>' +
                    '  <td>' + (value.ClassName || '') + '</td>' +
                    '  <td>' + (value.SeatNo || '')   + '</td>' +
                    '  <td>' + (value.StudentName || '') + '</td>' +
                    '  <td>' + (value.PaScore || '') + '</td>' +
                    '  <td>' + (value.ArScore || '') + '</td>' +
                    '  <td>' + (value.AasScore || '') + '</td>' +
                    '  <td>' + (value.FarScore || '') + '</td>' +
                    '  <td>' + _gg.funWeightScore(value.PaScore, value.ArScore, value.AasScore, value.FarScore) + '</td>' +
                    '  <td>' + (value.ResultScore || '') + '</td>' +
                    '</tr>');
            });

            $('#tabClub tbody').html(arys.join(''));
        }
    }
};

// TODO: 成績登錄編輯畫面
_gg.EditScore = function (clubid, edit_target) {
    if (clubid) {
        var edit_title, scoreType;
        switch (edit_target) {
            case 'PaWeight':
                edit_title = '1：平時活動比例(' + (_gg.weight.PaWeight || '')  + '%)';
                scoreType = 'PaScore';
                break;
            case 'ArWeight':
                edit_title = '2：出缺席比例(' +  (_gg.weight.ArWeight || '')  + '%)';
                scoreType = 'ArScore';
                break;
            case 'AasWeight':
                edit_title = '3：活動力及服務比例(' + (_gg.weight.AasWeight || '')  + '%)';
                scoreType = 'AasScore';
                break;
            case 'FarWeight':
                edit_title = '4：成品成果考驗比例(' + (_gg.weight.FarWeight || '')  + '%)';
                scoreType = 'FarScore';
                break;
        }
        var students = _gg.col_clubs[clubid].Students;
        if (students) {
            var arys = [];
            $(students).each(function(key, value) {
                arys.push('<div class="control-group">' +
                    '    <label class="control-label">' + (value.StudentNumber || '') + ' ' + (value.StudentName || '') + '</label>' +
                    '    <div class="controls">' +
                    '        <input type="text" name="s' + (value.StudentNumber || '') + '" class="{digits:true, range:[0, 100]} input-large" id="' + (value.SCUID || '') + '"' +
                    ' placeholder="成績..." value="' + (value[scoreType] || '') + '">' +
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
_gg.SaveSorce = function () {
    var clubid, scoreType;
    scoreType = $("#save-data").attr('data-type');
    clubid = $('#changeClub_Score').val();

    if (clubid) {
        if (scoreType === 'PaScore' || scoreType === 'ArScore' || scoreType === 'AasScore' || scoreType === 'FarScore') {
            var students = _gg.col_clubs[clubid].Students;
            if (students) {
                var arys = [];
                $(students).each(function(key, value) {
                    arys.push('<Students><Condition><UID>' + (value.SCUID || '0')  + '</UID></Condition>');
                    var tmp_score = $('#'+(value.SCUID)).val();
                    if (tmp_score !== '') {
                        tmp_score = parseInt(tmp_score, 10) + '';
                    } else {
                        tmp_score = '';
                    }
                    arys.push('<' + scoreType + '>' + tmp_score + '</' + scoreType + '>');
                    arys.push('</Students>');
                });

                _gg.connection.send({
                    service: "_.UpdateScore",
                    body: '<Request>' + arys.join('') + '</Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#errorMessage', 'UpdateScore', error);
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
                                $('#' + scoreType + value.SCUID).html(tmp_score);
                            });

                            _gg.SetScore(clubid);

                            $('#editModal').modal("hide");
                        }
                    }
                });
            }
        }
    }
};


// TODO: 幹部登錄畫面
_gg.SetCadres = function (clubid) {
    if (clubid) {
        var cdres = _gg.col_cadres[clubid].Cadres;
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
_gg.EditCadres = function (clubid) {
    if (clubid) {
        var items = [], maxCadresNum = 2;

        items.push(
            '<div class="my-emptyline"></div>' +
            '<a href="#" class="btn pull-right" id="cadres-add">' +
                '<i class="icon-plus-sign"></i>新增幹部</a>' +
            '<hr />'
        );

        var cadres = _gg.col_cadres[clubid].Cadres;
        var options = ['<option value="">請選擇...</option>'];
        var students = _gg.col_clubs[clubid].Students;
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
_gg.SaveCadres = function () {
    var clubid;
    clubid = $('#changeClub_Cadres').val();

    if (clubid) {
        var run_ClubCadres = false, run_CadresRecord = false;
        var tmp_cadresListA = [], tmp_cadresListB = [];

        // TODO: 重設資料
        var ResetData = function() {
            if (run_ClubCadres && run_CadresRecord) {
                var cadres = tmp_cadresListA.concat(tmp_cadresListB);
                _gg.col_cadres[clubid].Cadres = cadres;
                _gg.SetCadres(clubid);

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
            var students = _gg.col_clubs[clubid].Students;
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

        _gg.connection.send({
            service: "_.UpdateClubCadres",
            body: '<Request>' + request1.join('') + '</Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#errorMessage', 'UpdateClubCadres', error);
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
            _gg.connection.send({
                service: "_.UpdateCadresRecord",
                body: '<Request>' + request2.join('') + '</Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#errorMessage', 'UpdateCadresRecord', error);
                    } else {
                        run_CadresRecord = true;
                        ResetData();
                    }
                }
            });
        } else {
            _gg.connection.send({
                service: "_.DelCadresRecord",
                body: '<Request><CadresRecord><Condition><ClubID>' + clubid + '</ClubID></Condition></CadresRecord></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#errorMessage', 'DelCadresRecord', error);
                    } else {
                        run_CadresRecord = true;
                        ResetData();
                    }
                }
            });

        }
    }
};