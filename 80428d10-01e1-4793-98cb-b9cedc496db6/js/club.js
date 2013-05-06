jQuery(function () {
    _gg.onInit();
    $("#sortable").sortable({
        containment: "#container-main"
    });
    $("#sortable").disableSelection();

    $('#container-main a[data-action="show-hide"]').click(function() {
        $("#chooseList").removeAttr("style").toggleClass('hide');
    });

    $("#filter-keyword").keyup(function () {
        _gg.onResetClubList();
    });

    $(".icon-search").click(function () {
        _gg.onResetClubList();
    });

    $('#remove-all').click(function() {
        _gg.removeAll();
    });

    $('#container-main').on('click', 'a[action-type]', function() {
        if ($(this).attr('action-type') === 'add') {
            _gg.addClub();
        } else if ($(this).attr('action-type') === 'remove') {
            _gg.removeClub();
        }
    });

    $('#container-main .my-sure a[data-action="save"]').click(function() {
        _gg.onSaveClub();
    });
});

var _gg = function () {
    var connection = gadget.getContract("ischool.universal_club.student");
    var Clubs = [];
    var Club = '';
    var Student = {};
    var SchoolYear = '';
    var Semester = '';
    var Opening = "no";
    var _maxCount = 0;
    var _chooseClub = [];

    // TODO: 錯誤訊息
    var set_error_message = function(select_str, serviceName, error) {
        if (serviceName) {
            var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            if (error !== null) {
                if (error.dsaError) {
                    if (error.dsaError.status === "504") {
                        switch (error.dsaError.message) {
                            case '501':
                                tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                                break;
                            default:
                                tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
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

    // TODO: 取得目前學年度學期，可選志願數
    var init = function() {
        connection.send({
            service: "_.GetConfig",
            body: '<Request><Condition><ConfigName>學生選填志願數</ConfigName></Condition></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message("#mainMsg", "GetConfig", error);
                } else {
                    if (response.Response.Config && response.Response.Config.Content) {
                        _maxCount = parseInt(response.Response.Config.Content, 10) || 0;
                        $('#max-count').html(_maxCount);
                    }
                }
            }
        });

        connection.send({
            service: "_.GetCurrentSemester",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message("#mainMsg", "GetCurrentSemester", error);
                } else {
                    $(response.Result.SystemConfig).each(function (index, item) {
                        SchoolYear = item.DefaultSchoolYear;
                        Semester = item.DefaultSemester;
                    });

                    // TODO: 取得個人資料
                    connection.send({
                        service: "_.GetMyBaseInfo",
                        body: '',
                        result: function (response, error, http) {
                            if (error !== null) {
                                set_error_message("#mainMsg", "GetMyBaseInfo", error);
                            } else {
                                $(response.Response.Student).each(function (index, item) {
                                    Student = {
                                        StudentID   : item.StudentID,
                                        Name        : item.Name,
                                        Gender      : item.Gender,
                                        GradeYear   : item.GradeYear,
                                        DeptName    : item.DeptName,
                                        SemsHistory : {},
                                        Clubs       : []
                                    };

                                    // TODO: 設定年級對應學年度的預設值
                                    var tmp_y = 0;
                                    for (var i=Student.GradeYear; i<=3; i++) {
                                        Student.SemsHistory['GS'+ i +'1'] = parseInt(SchoolYear, 10) + tmp_y + ''; //上學期
                                        Student.SemsHistory['GS'+ i +'2'] = parseInt(SchoolYear, 10) + tmp_y + ''; //下學期
                                        tmp_y += 1;
                                    }

                                    // TODO: 覆寫年級對應學年度，處理學生重讀
                                    var tmp_alias;
                                    $(item.SemsHistory.History).each(function (index, item) {
                                        tmp_alias = 'GS' + item.GradeYear + item.Semester;
                                        Student.SemsHistory[tmp_alias] = Student.SemsHistory[tmp_alias] || 0;
                                        if (parseInt(item.SchoolYear, 10) > parseInt(Student.SemsHistory[tmp_alias], 10)) {
                                            Student.SemsHistory[tmp_alias] = item.SchoolYear;
                                        }
                                    });
                                });

                                var student = Student;

                                // TODO: 取得開放時間
                                connection.send({
                                    service: "_.GetOpeningHours",
                                    body: '<Request><GradeYear>' + student.GradeYear + '</GradeYear></Request>',
                                    result: function (response, error, http) {
                                        if (error !== null) {
                                            set_error_message("#mainMsg", "GetOpeningHours", error);
                                        } else {
                                            $(response.Response.OpeningHours).each(function (index, item) {
                                                if (item.Startdate && item.Enddate) {
                                                    var tmp_Date  = new Date();
                                                    var Startdate = new Date(item.Startdate);
                                                    var Enddate   = new Date(item.Enddate);

                                                    if (Startdate <= tmp_Date && Enddate >= tmp_Date) {
                                                        Opening = "yes";
                                                    }

                                                    $("span[data-type=Opening]").html("開放選社時間：" + $.formatDate(Startdate, "yyyyMMdd") + " " + $.formatDate(Startdate, "HHmm") + " ~ " + $.formatDate(Enddate, "yyyyMMdd") + " " + $.formatDate(Enddate, "HHmm"));
                                                } else {
                                                    $("sapn[data-type=Opening]").html("開放選社時間：未指定");
                                                }
                                            });

                                            if (Opening === "no") {
                                                $('#container-main').find('.my-sure, hr:last').remove();
                                                $("#sortable").sortable('destroy').removeClass('my-move-cursor');
                                            }
                                        }
                                    }
                                });

                                // TODO: 取得選社志願
                                connection.send({
                                    service: "_.GetVolunteer",
                                    body: { Request: { Condition: { SchoolYear: SchoolYear, Semester: Semester } } },
                                    result: function (response, error, http) {
                                        if (error !== null) {
                                            set_error_message("#mainMsg", "GetVolunteer", error);
                                        } else {
                                            if (response.Response.Volunteer && response.Response.Volunteer.Content
                                                && response.Response.Volunteer.Content.xml
                                                && response.Response.Volunteer.Content.xml.Club) {

                                                $(response.Response.Volunteer.Content.xml.Club).each(function(index, item) {
                                                    var cid = item.Ref_Club_ID
                                                    _chooseClub.push(cid);
                                                });
                                            }
                                            $('#list-count').html(_chooseClub.length);

                                            // TODO: 取得所有學年度學期個人選社資料
                                            connection.send({
                                                service: "_.GetMyClub",
                                                body: '',
                                                result: function (response, error, http) {
                                                    if (error !== null) {
                                                        set_error_message("#mainMsg", "GetMyClub", error);
                                                    } else {
                                                        $(response.Response.Clubs).each(function (index, item) {
                                                            var tmp_cadreName = '';
                                                            if (item.ClubID) {
                                                                var tmp_cn = item.CadreName.split(',');
                                                                $(tmp_cn).each(function(key, value) {
                                                                    if (value) {
                                                                        if (tmp_cadreName) tmp_cadreName += ', ';
                                                                        tmp_cadreName += value;
                                                                    }
                                                                });
                                                                student.Clubs[index] = {
                                                                    'SchoolYear'   : item.SchoolYear,
                                                                    'Semester'     : item.Semester,
                                                                    'ClubName'     : item.ClubName,
                                                                    'TeacherName1' : item.TeacherName1,
                                                                    'Lock'         : item.Lock,
                                                                    'Score'        : item.Score,
                                                                    'CadreName'    : tmp_cadreName,
                                                                    'ResultScore'  : item.ResultScore
                                                                };
                                                            } else {
                                                                var tmp_cn = item.RSCadreName.split(',');
                                                                $(tmp_cn).each(function(key, value) {
                                                                    if (value) {
                                                                        if (tmp_cadreName) tmp_cadreName += ', ';
                                                                        tmp_cadreName += value;
                                                                    }
                                                                });
                                                                // TODO: 轉學生未連結選社紀錄
                                                                student.Clubs[index] = {
                                                                    'SchoolYear'   : item.RSSchoolYear,
                                                                    'Semester'     : item.RSSemester,
                                                                    'ClubName'     : item.RSClubName,
                                                                    'TeacherName1' : '',
                                                                    'Lock'         : '否',
                                                                    'Score'        : '',
                                                                    'CadreName'    : tmp_cadreName,
                                                                    'ResultScore'  : item.ResultScore
                                                                };
                                                            }

                                                            // 現在學年度、學期社團
                                                            if (item.SchoolYear === SchoolYear && item.Semester === Semester) {
                                                                student.ClubID = item.ClubID;
                                                                student.Lock   = item.Lock;
                                                            }
                                                        });

                                                        // TODO: 目前學年度學期社團資料(已過濾性別、總人數=0、科別條件)
                                                        connection.send({
                                                            service: "_.GetAllClubs",
                                                            body: '<Request><SchoolYear>' + SchoolYear + '</SchoolYear><Semester>' + Semester + '</Semester></Request>',
                                                            result: function (response, error, http) {
                                                                if (error !== null) {
                                                                    set_error_message("#mainMsg", "GetAllClubs", error);
                                                                } else {
                                                                    var tmp_show;
                                                                    var sortlist = [];
                                                                    resetData();

                                                                    if ($(response.Response.ClubRecord).size() === 0) {
                                                                        $("#filter-keyword").addClass("disabled").attr("disabled", "disabled");
                                                                        $("#club-list .tabbable").html("目前無社團");
                                                                        $("div[data-type] tbody").html("目前無社團");
                                                                        $("div[data-type=summary] .my-widget-content").html("目前無社團");
                                                                    } else {
                                                                        $(response.Response.ClubRecord).each(function (index, item) {
                                                                            tmp_show = "false";
                                                                            if (student.Lock === '是') {
                                                                                if (student.ClubID === item.ClubID) {
                                                                                    tmp_show = "true";
                                                                                }
                                                                            } else {
                                                                                tmp_show = "true";
                                                                            }

                                                                            if (tmp_show === "true") {
                                                                                if (!Clubs[index]) {
                                                                                    Clubs[index] = item;
                                                                                    item.getInfo = "false";
                                                                                }
                                                                            }

                                                                            if ($.inArray(item.ClubID, _chooseClub) !== -1) {
                                                                                sortlist[$.inArray(item.ClubID, _chooseClub)] = '' +
                                                                                    '<li id="' + item.ClubID + '">' +
                                                                                    '<a href="javascript:$(\'#club-list li[club-id=' + item.ClubID + '] a\').click();">' +
                                                                                    (item.ClubName || '') +
                                                                                    '</a>';

                                                                                sortlist[$.inArray(item.ClubID, _chooseClub)] += (Opening === 'yes') ? '<i class="icon-resize-vertical pull-right"></i></li>' : '';
                                                                            }

                                                                        });
                                                                        $('#sortable').append(sortlist.join(''));
                                                                        resetClubList();
                                                                        SetClubRecord();
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            });

                                        }
                                    }
                                });


                            }
                        }
                    });
                }
            }
        });
    };

    // #region MyClass definition
    var resetClubList = function () {
        resetData();

        var tmp_HTML, items = [];
        tmp_HTML = "<ul class='nav nav-tabs nav-stacked'>";

        $(Clubs).each(function (index, item) {
            if (item) {
                if (item.ClubName.indexOf($("#filter-keyword").val()) !== -1) {
                    var limit_str = '不限';

                    if (item.Limit) {
                        limit_str = item.Limit + '人';
                    }

                    if (Opening === 'yes') {
                        var item_css = ($.inArray(item.ClubID, _chooseClub) !== -1) ? 'my-add-in-club' : '';
                    } else {
                        var item_css = (item.ClubID === Student.ClubID) ? 'my-curr-club' : '';
                    }

                    items.push("<li club-id='" + item.ClubID + "' class='" + item_css + "'>" +
                        "<a href='#' club-index='" + index + "' data-toggle='tab'>" +
                        "<span>" + item.ClubName + "</span>" +
                        " <span class='pull-right'>(<span>" + limit_str + "</span>)" +
                        "</span></a></li>");
                }
            }
        });
        tmp_HTML += items.join("");
        tmp_HTML += "</ul>";
        $("#club-list .tabbable").html(tmp_HTML);
        $("#club-list a").click(function (e) {
            e.preventDefault();

            Club = Clubs[$(this).attr("club-index")];
            resetData();
            setClubInfo();
        });

        $('#club-list a:first').click();
    };

    // TODO: 社團資料
    var setClubInfo = function () {
        var club = Club;
        if (club.ClubID) {

            var showInfo = function () {
                var items_info, items_condition, items_summary, tmp_photo1, tmp_photo2;
                var tmp_grade1Limit, tmp_grade2Limit, tmp_limit, tmp_genderRestrict, tmp_deptRestrict;

                items_info = [];
                items_condition = [];
                items_summary = [];
                tmp_photo1, tmp_photo2;
                tmp_grade1Limit = '不限', tmp_grade2Limit = '不限', tmp_limit = '不限', tmp_genderRestrict = '不限', tmp_deptRestrict = '不限';

                // TODO: 社團基本資料
                items_info.push('<tr><th nowrap="nowrap" width="29%">學年 </th><td>' + club.SchoolYear + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap" width="29%">學期 </th><td>' + club.Semester + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap" width="29%">類別 </th><td>' + club.ClubCategory + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap" width="29%">代碼 </th><td>' + club.ClubNumber + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap" width="29%">老師1 </th><td>' + club.TeacherName1 + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap" width="29%">老師2 </th><td>' + club.TeacherName2 + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap" width="29%">老師3 </th><td>' + club.TeacherName3 + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap" width="29%">場地 </th><td>' + club.Location + '</td></tr>');

                if (club.Limit) {
                    tmp_limit = club.Limit + '人';
                }

                if (club.GenderRestrict) { tmp_genderRestrict = club.GenderRestrict + '生' };

                if (club.DeptRestrict.Department) {
                    tmp_deptRestrict = "";
                    $(club.DeptRestrict.Department.Dept).each(function (key, value) {
                        tmp_deptRestrict += value + '<br />';
                    });
                }

                // items_condition.push('<tr><th width="29%" nowrap="nowrap">年級 </th><td width="71%"></td></tr>');
                // items_condition.push('<tr><th width="29%" nowrap="nowrap">年級 </th><td width="71%">一年級 ' + tmp_grade1Limit + '</td></tr>');
                // items_condition.push('<tr><th nowrap="nowrap">&nbsp;</th><td>二年級 ' + tmp_grade2Limit + '</td></tr>');
                items_condition.push('<tr><th width="29%" nowrap="nowrap">名額 </th><td>' + tmp_limit + ' </td></tr>');
                items_condition.push('<tr><th width="29%" nowrap="nowrap">性別 </th><td>' + tmp_genderRestrict + '</td></tr>');
                items_condition.push('<tr><th width="29%" nowrap="nowrap">科別 </th><td>' + tmp_deptRestrict + '</td></tr>');

                // TODO: 社團簡介
                items_summary.push('<p>' + club.About + '</p>');
                if (club.Photo1 != null && club.Photo1 !== "") {
                    tmp_photo1 = "<a href='data:image/png;base64," + club.Photo1 + "' target='_black'>" +
                                 "<img class='thumbnail' src='data:image/png;base64," + club.Photo1 + "' alt='社團照片1' title='社團照片1' /></a>";
                } else {
                    tmp_photo1 = "";
                }

                if (club.Photo2 != null && club.Photo2 !== "") {
                    tmp_photo2 = "<br /><a href='data:image/png;base64," + club.Photo2 + "' target='_black'>" +
                                 "<img class='thumbnail' src='data:image/png;base64," + club.Photo2 + "' alt='社團照片2' title='社團照片2' /></a>";
                }

                if ( tmp_photo1 || tmp_photo2) {
                    if ($.browser.msie) {
                        items_summary.push(
                            '<div class="alert alert-error">' +
                            '  <a class="close" data-dismiss="alert" href="#">×</a>' +
                            '  若社團照片無法完整呈現，請改用其他瀏覽器' +
                            '</div>'
                        );
                    }
                }
                items_summary.push(tmp_photo1);
                items_summary.push(tmp_photo2);

                $("span[data-type=club-name]").html(club.ClubName);
                $("div[data-type=info] tbody").html(items_info.join(""));
                $("div[data-type=condition] tbody").html(items_condition.join(""));
                $("div[data-type=summary] .my-widget-content").html(items_summary.join(""));
                Check_State();
            };

            if (club.getInfo === "false") {
                connection.send({
                    service: "_.GetClubInfo",
                    body: '<Request><ClubID>' + club.ClubID + '</ClubID></Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            set_error_message("#mainMsg", "GetClubInfo", error);
                        } else {
                            $(response.Response.ClubRecord).each(function (index, item) {
                                $.each(item, function (key, value) {
                                    club[key] = value;
                                });
                                club.getInfo = "true";
                                showInfo();
                            });
                        }
                    }
                });
            } else {
                showInfo();
            }
        }
    };


    var Check_State = function () {
        /*
        1. 未開放時 => 未開放選社(不能點選) (預設)
        2. 開放期間，尚未加入 => 我想參加
        4. 開放期間，已加入 => 取消參加
        5. 開放期間，鎖定不可變更 => 選社已鎖定(不能點選)
        */

        var club = Club;
        var state = "0";
        var s_btn = '';

        if (Opening === "yes") {
            if ($.inArray(club.ClubID, _chooseClub) !== -1) {
                state = (Student.Lock === "是") ? "5" : "4";
            } else {
                state = "2";
            }
        } else {
            state = "1";
        }

        switch (state) {
            case "1":
                s_btn = '<a href="javascript:void(0);" class="btn btn-success disabled"><i class="icon-plus icon-white"></i>未開放選社</a>';
                break;
            case "2":
                s_btn = '<a href="javascript:void(0);" class="btn btn-success" action-type="add"><i class="icon-plus icon-white"></i>我想參加</a>';
                break;
            case "4":
                s_btn = '<a href="javascript:void(0);" class="btn btn-danger" action-type="remove"><i class="icon-minus icon-white"></i>取消參加</a>';
                break;
            case "5":
                s_btn = '<a href="javascript:void(0);" class="btn btn-success" disabled>選社已鎖定</a>';
                break;
            default:
                s_btn = '';
        }
        $("div[data-type=add-club]").html(s_btn);
    };

    // TODO: 社團成績
    var SetClubRecord = function () {
        connection.send({
            service: "_.GetWeight",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message("#mainMsg", "GetWeight", error);
                } else {
                    var tmp_weight_html = [];

                    $(response.Response.Weight.Xml.Item).each(function (index, item) {
                        // Weight = item;
                        tmp_weight_html.push(
                            '<tr>' +
                            '    <th nowrap="nowrap">' + (item.Name || '') + '(' + item.Proportion + '%)</th>' +
                            '    <td></td>' +
                            '</tr>'
                        );
                    });

                    var student  = Student;
                    var items    = [];
                    var tmp_html = '';

                    $(student.Clubs.sort($.by('SchoolYear', $.by('Semester', '', 'desc'), 'desc'))).each(function (index, item) {
                        tmp_html = '' +
                            '<div class="span6">' +
                            '    <div class="my-widget">' +
                            '       <div class="my-widget-header">' +
                            '           <i class="icon-th-list"></i>' +
                            '           <h3>' + (item.SchoolYear || '') + ' 學年度第 ' + (item.Semester || '') + ' 學期</h3>' +
                            '       </div>' +
                            '       <div class="my-widget-content">' +
                            '           <div class="row-fluid">' +
                            '               <div class="span6">' +
                            '                   <table class="table table-condensed">' +
                            '                       <tbody>' +
                            '                           <tr>' +
                            '                               <th width="29%" nowrap="nowrap">社團名稱</th>' +
                            '                               <td width="71%">' + (item.ClubName || '') + '</td>' +
                            '                           </tr>' +
                            '                           <tr>' +
                            '                               <th nowrap="nowrap">指導教師</th>' +
                            '                               <td>' + (item.TeacherName1 || '') + '</td>' +
                            '                           </tr>' +
                            '                           <tr>' +
                            '                               <th nowrap="nowrap">擔任幹部</th>' +
                            '                               <td>' + (item.CadreName || '') + '</td>' +
                            '                           </tr>' +
                            '                           <tr>' +
                            '                               <th nowrap="nowrap">學期成績</th>' +
                            '                               <td>' + (item.ResultScore || '') + '</td>' +
                            '                           </tr>' +
                            '                       </tbody>' +
                            '                   </table>' +
                            '                </div>' +
                            '               <div class="span6">' +
                            '                   <table class="table table-condensed">' +
                            '                       <tbody>' +
                            tmp_weight_html.join('') +
                            '                       </tbody>' +
                            '                   </table>' +
                            '                </div>' +
                            '            </div>' +
                            '       </div>' +
                            '    </div>' +
                            '</div>';

                        if (index % 2 === 0) {
                            items.push('<div class="row-fluid">');
                        }
                        items.push(tmp_html);
                        if (index % 2 === 1) {
                            items.push('</div>');
                        }
                    });

                    if (student.Clubs.length %2 === 1) {
                        items.push('</div>');
                    }

                    if (items.length > 0) {
                        $('#ClubRecord').html('<div class="row-fluid">' + items.join('') + '</div>');
                    } else {
                        $('#ClubRecord').html('<div>無社團成績</div>');
                    }
                }
            }
        });
    };

    // TODO: 清除資料
    var resetData = function () {
        $("span[data-type=club-name]").html("");
        $("div[data-type] tbody").html("");
        $("div[data-type=summary] .my-widget-content").html("");
        $("div[data-type=add-club]").html("");
    };

    //#region 儲存志願序
    var saveClub = function() {
        var volunteer = [];
        _chooseClub = $('#sortable').sortable('toArray');
        $(_chooseClub).each(function(index, item) {
            volunteer.push({
                '@'           :['Index', 'Ref_Club_ID'],
                'Index'       :index+1,
                'Ref_Club_ID' :item
            });
        });
        connection.send({
            service: "_.SetVolunteer",
            body: { Request: { Volunteer: { Content: { xml: { Club: volunteer } } } } },
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message("#mainMsg", "SetVolunteer", error);
                } else {
                    $('#mainMsg').html('<div class="alert alert-success">\n  儲存成功！\n</div>');
                    setTimeout("$('#mainMsg').html('')", 1500);
                }
            }
        });
    };
    //#endregion

    var result = {
        onInit : function() { return init(); },
        onResetClubList : function() { return resetClubList(); },
        addClub : function() {
            var cid = Club.ClubID;
            if (cid) {
                if (_maxCount > _chooseClub.length) {
                    _chooseClub.push(cid);
                    $('div[data-type="add-club"]').html('<a href="javascript:void(0);" class="btn btn-danger" action-type="remove"><i class="icon-minus icon-white"></i>取消參加</a>');
                    $('#club-list li[club-id="' + cid + '"]').addClass('my-add-in-club');
                    $('#sortable').append('<li id="' + cid + '">' +
                        '<a href="javascript:$(\'#club-list li[club-id=' + cid + '] a\').click();">' +
                        (Club.ClubName || '') +
                        '</a><i class="icon-resize-vertical pull-right"></i></li>');

                    $('#list-count').html(_chooseClub.length);
                    $('#chooseList').show('blind', '', 400, function() {
                        setTimeout(function() {
                            $("#chooseList").removeAttr("style").fadeOut();
                        }, 1500);
                    });
                } else {
                    set_error_message("#mainMsg", "", "選社已達上限！");
                }
            }
        },
        removeClub : function() {
            var cid = Club.ClubID;
            if (cid) {
                _chooseClub = $.grep(_chooseClub, function(value) {
                    return value !== cid;
                });

                $('div[data-type="add-club"]').html('<a href="javascript:void(0);" class="btn btn-success" action-type="add"><i class="icon-plus icon-white"></i>我想參加</a>');
                $('#club-list li[club-id="' + cid + '"]').removeClass('my-add-in-club');
                $('#sortable li[id="' + cid + '"]').remove();
                $('#list-count').html(_chooseClub.length);
            }
        },
        removeAll : function() {
            _chooseClub = [];
            $('div[data-type="add-club"]').html('<a href="javascript:void(0);" class="btn btn-success" action-type="add"><i class="icon-plus icon-white"></i>我想參加</a>');
            $('#club-list li').removeClass('my-add-in-club');
            $('#sortable').html('');
            $('#list-count').html(_chooseClub.length);
        },
        onSaveClub : function() {
            if (Opening === 'yes') {
                saveClub();
            }
        }
    };
    return result;
}();