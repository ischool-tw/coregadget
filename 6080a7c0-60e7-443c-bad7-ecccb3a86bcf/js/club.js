var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.club.teacher");
_gg.col_class = null;
_gg.col_clubs = null;
_gg.schoolYear = '';
_gg.semester = '';
_gg.opening = {
    state: "no"
};

jQuery(function () {
    _gg.loadData();
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


    $("#editModal").modal({
        show: false
    });
    $("#editModal").on("hidden", function () {
        $("#editModal #errorMessage").html("");
    });
    $("#editModal").on("show", function (e) {
        if (_gg.opening.state === "yes") {
            $("#editModal #save-data").button("reset");
        } else {
            e.preventDefault();
        }
    });
    $("#editModal #save-data").click(function () {
        if ($("#editModal form").valid()) {
            $(this).removeClass('btn-danger').addClass('btn-success').button('loading'); // TODO: 按鈕為處理中
            _gg.SaveSorce();
        } else {
            $(this).removeClass('btn-success').addClass('btn-danger');
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
    $('#changeClub').bind('change', function(event) {
        _gg.SetScore(this.value);
    });

    // TODO: 輸入成績
    $('#tabClub .my-baseinfo-item a').live('click', function(e) {
        var edit_target, clubid, scoreType;
        edit_target = $(this).attr("edit-target");
        clubid = $('#changeClub').val();

        if (clubid) {
            var edit_title;
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
                        '        <input type="text" name="s' + (value.StudentNumber || '') + '" class="{digits:true, range:[1, 100]} input-large" id="' + (value.SCUID || '') + '"' +
                        ' placeholder="成績..." value="' + (value[scoreType] || '') + '">' +
                        '    </div>' +
                        '</div>');
                });
            }

            $('#editModal').find('h3').html(edit_title).end().find('fieldset').html(arys.join(''));
            $("#save-data").attr('score-type', scoreType);
        }
    });
});

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '';
    if (error !== null) {
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
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
    }
};

// TODO: 載入資料
_gg.loadData = function () {
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

                    var tmp_col_class = {};

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

                                    var tmp_col_class = {};

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
                        }
                    });
                    _gg.col_class = tmp_col_class;
                    _gg.SetClass();
                }
            }
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
                var _ref;
                if (!_gg.col_clubs) { _gg.col_clubs = {}; }

                if (((_ref = response.Response) != null ? _ref.Students : void 0) != null) {

                    var tmp_col_club = {};
                    var btns = [];

                    $(response.Response.Students).each(function (index, item) {
                        var clubid = item.ClubID;
                        if (!tmp_col_club[clubid]) {
                            var tmp_club = {
                                ClubID   : item.ClubID,
                                ClubName : item.ClubName,
                                Students : []
                            };
                            tmp_col_club[clubid] = tmp_club;
                            btns.push('<option value="' + clubid + '">' + item.ClubName + '</option>');
                        }

                        var tmp_student = {
                            SCUID         : item.SCUID,
                            PaScore       : item.PaScore,
                            ArScore       : item.ArScore,
                            FarScore      : item.FarScore,
                            AasScore      : item.AasScore,
                            StudentID     : item.StudentID,
                            StudentName   : item.StudentName,
                            StudentNumber : item.StudentNumber,
                            SeatNo        : item.SeatNo,
                            ClassName     : item.ClassName,
                            ResultScore   : item.ResultScore
                        };

                        tmp_col_club[clubid].Students.push(tmp_student);
                    });

                    _gg.col_clubs = tmp_col_club;
                    $('#changeClub').html(btns.join(''));

                }


                if ($.isEmptyObject(_gg.col_clubs)) {
                    $('#navClub, #tabClub').remove();
                } else {
                    // TODO: 取得目前學年度
                    _gg.connection.send({
                        service: "_.GetCurrentSemester",
                        body: '',
                        result: function (response, error, http) {
                            if (error !== null) {
                                _gg.set_error_message('#mainMsg', 'GetCurrentSemester', error);
                            } else {
                                $(response.Result.SystemConfig).each(function (index, item) {
                                    _gg.schoolYear = item.DefaultSchoolYear;
                                    _gg.semester = item.DefaultSemester;

                                    // TODO: 取得開放期間
                                    _gg.connection.send({
                                        service: "_.GetDTScore",
                                        body: '',
                                        result: function (response, error, http) {
                                            if (error !== null) {
                                                _gg.set_error_message('#mainMsg', 'GetCurrentSemester', error);
                                            } else {
                                                if (response.DTScore != null) {
                                                    $(response.DTScore).each(function (index, item) {
                                                        _gg.opening = item;
                                                    });

                                                     _gg.opening.state = "no";

                                                     if (_gg.opening) {
                                                        if (_gg.opening.Start && _gg.opening.End) {
                                                            var tmp_Date  = new Date();
                                                            var Startdate = new Date(_gg.opening.Start);
                                                            var Enddate   = new Date(_gg.opening.End);

                                                            if (Startdate <= tmp_Date && Enddate >= tmp_Date) {
                                                                _gg.opening.state = "yes";
                                                                var tmp_html = '' +
                                                                    '<div class="alert alert-error">' +
                                                                        _gg.schoolYear + ' 學年度第 ' + _gg.semester +
                                                                        ' 學期　成績輸入區間： ' + _gg.opening.Start + ' ~ ' + _gg.opening.End +
                                                                    '</div>';
                                                                $('#opening').html(tmp_html);
                                                                $('a[data-toggle=modal]').removeClass("disabled");
                                                            }
                                                        }
                                                    }
                                                }

                                                _gg.SetScore($('#changeClub').val());
                                            }
                                        }
                                    });

                                });
                            }
                        }
                    });
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

        $('.nav').prepend('<li><a href="#' + tabid + '" data-toggle="tab">' + myClass.ClassName + '</a></li>');

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
                        '  <td>' + (value.CadreName || '')     + '</td>' +
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

    $('.nav li:first a').trigger('click');
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

// TODO: 計算總成績
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

        return (a + b + c + d) / 100;
    }
    return 0;
};


// TODO: 儲存成績
_gg.SaveSorce = function () {

    var clubid, scoreType;
    scoreType = $("#save-data").attr('score-type');
    clubid = $('#changeClub').val();

    if (clubid) {
        if (scoreType === 'PaScore' || scoreType === 'ArScore' || scoreType === 'AasScore' || scoreType === 'FarScore') {
            var students = _gg.col_clubs[clubid].Students;
            if (students) {
                var arys = [];
                $(students).each(function(key, value) {
                    arys.push('<Students><Condition><UID>' + (value.SCUID || '0')  + '</UID></Condition>');
                    arys.push('<' + scoreType + '>' + $('#'+(value.SCUID)).val() + '</' + scoreType + '>');
                    arys.push('</Students>');
                });

                _gg.connection.send({
                    service: "_.UpdateScore",
                    body: '<Request>' + arys.join('') + '</Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#errorMessage', 'UpdateScore', error);
                        } else {
                            $(students).each(function(key, value) {
                                value[scoreType] = $('#'+(value.SCUID)).val();
                                $('#' + scoreType + value.SCUID).html($('#'+(value.SCUID)).val());
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