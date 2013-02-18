jQuery(function () {
    _gg.onInit();

    $("#editModal").modal({
        show: false
    });
    $("#editModal").on("hidden", function () {
        $("#editModal a[data-dismiss=modal]").html("取消");
        $("#editModal #errorMessage").html("");
    });
    $("#editModal").on("show", function () {
        $("#editModal #save-data").show();
    });
    $("#editModal #save-data").click(function () {
        var edit_target;
        $("#editModal #save-data").hide();
        edit_target = $(this).attr("edit-target");
        switch (edit_target) {
            case "remove":
                _gg.RemoveToClub();
                break;
            default:
                _gg.AddToClub();
                break;
        }
    });

    $("#filter-keyword").keyup(function () {
        _gg.resetClubList();
    });

    $(".icon-search").click(function () {
        _gg.resetClubList();
    });
});

var _gg = function () {
    var connection = gadget.getContract("ischool.universal_club.student");
    var Clubs = [];
    var Club = '';
    var Student = {};
    var SchoolYear = '';
    var Semester = '';

    // TODO: 錯誤訊息
    set_error_message = function(select_str, serviceName, error) {
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

    // TODO: 取得目前學年度學期
    init = function() {
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
                                Opening = "no";

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
                                                    } else {
                                                        Opening = "no";
                                                    }

                                                    $("span[data-type=Opening]").html("開放選社時間：" + $.formatDate(Startdate, "yyyyMMdd") + " " + $.formatDate(Startdate, "HHmm") + " ~ " + $.formatDate(Enddate, "yyyyMMdd") + " " + $.formatDate(Enddate, "HHmm"));
                                                } else {
                                                    $("sapn[data-type=Opening]").html("開放選社時間：未指定");
                                                }
                                            });
                                        }
                                    }
                                });

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
                                                            });
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
    };

    // #region MyClass definition
    resetClubList = function () {
        resetData();

        var tmp_HTML, items = [];
        tmp_HTML = "<ul class='nav nav-tabs nav-stacked'>";

        $(Clubs).each(function (index, item) {
            if (item) {
                if (item.ClubName.indexOf($("#filter-keyword").val()) !== -1) {
                    var limit_str = '不限';
                    var tmp_attendCount = (item.TotalCount || '0');
                    if (item.Limit) {
                        limit_str = item.Limit;

                        tmp_attendCount = (parseInt(item.Limit, 10) - parseInt(item.TotalCount, 10) > 0) ? item.TotalCount : "額滿";
                        if (tmp_attendCount !== '額滿') {
                            if (item['Grade' + Student.GradeYear + 'Limit']) {
                                tmp_attendCount = (parseInt(item['Grade' + Student.GradeYear + 'Limit'], 10) - parseInt(item['GradeYear' + Student.GradeYear + 'Count'], 10) > 0) ? item.TotalCount : "額滿";
                            }
                        }
                    }

                    items.push("<li club-id='" + item.ClubID + "'>" +
                        "<a href='#' club-index='" + index + "' data-toggle='tab'>" +
                        "<span>" + item.ClubName + "</span>" +
                        " <span class='pull-right'>(<span data-type='club-man-count'>" + tmp_attendCount + "</span>/<span>" + limit_str + "</span>)" +
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
    setClubInfo = function () {
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
                items_info.push('<tr><th nowrap="nowrap">學年 </th><td>' + club.SchoolYear + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap">學期 </th><td>' + club.Semester + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap">類別 </th><td>' + club.ClubCategory + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap">代碼 </th><td>' + club.ClubNumber + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap">老師1 </th><td>' + club.TeacherName1 + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap">老師2 </th><td>' + club.TeacherName2 + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap">老師3 </th><td>' + club.TeacherName3 + '</td></tr>');
                items_info.push('<tr><th nowrap="nowrap">場地 </th><td>' + club.Location + '</td></tr>');

                // TODO: 社團條件
                // var tmp_attendCount = 0;
                // if (club.Grade1Limit) {
                //     tmp_attendCount = (parseInt(club.GradeYear1Count, 10) > parseInt(club.Grade1Limit)) ? club.Grade1Limit : club.GradeYear1Count;
                //     tmp_grade1Limit = club.Grade1Limit + ' 人，現已 <span grade_year="1">' + tmp_attendCount + '</span> 人';
                // }
                // if (club.Grade2Limit) {
                //     tmp_attendCount = (parseInt(club.GradeYear2Count, 10) > parseInt(club.Grade2Limit)) ? club.Grade2Limit : club.GradeYear2Count;
                //     tmp_grade2Limit = club.Grade2Limit + ' 人，現已 <span grade_year="2">' + tmp_attendCount + '</span> 人';
                // }
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
                items_condition.push('<tr><th nowrap="nowrap">名額 </th><td>' + tmp_limit + ' </td></tr>');
                items_condition.push('<tr><th nowrap="nowrap">性別 </th><td>' + tmp_genderRestrict + '</td></tr>');
                items_condition.push('<tr><th nowrap="nowrap">科別 </th><td>' + tmp_deptRestrict + '</td></tr>');

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
                    if ($.browser.msie ) {
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


    Check_State = function () {
        /*
        1. 未開放時 => 未開放選社(不能點選) (預設)
        2. 開放期間，尚未加入，未額滿 => 加入社團
        3. 開放期間，尚未加入，已額滿 => 額滿(不能點選)
        4. 開放期間，已加入 => 退出
        5. 開放期間，鎖定不可變更 => 選社已鎖定(不能點選)
        */

        var club = Club;
        var state = "0";

        if (Opening === "yes") {
            if (Student.ClubID === club.ClubID) {
                state = (Student.Lock === "是") ? "5" : "4";
            } else {
                if (club.Limit) {
                    state = (parseInt(club.Limit, 10) - parseInt(club.TotalCount, 10) > 0) ? "2" : "3";

                     if (state === '2') {
                        if (club['Grade' + Student.GradeYear + 'Limit']) {
                            state = (parseInt(club['Grade' + Student.GradeYear + 'Limit'], 10) - parseInt(club['GradeYear' + Student.GradeYear + 'Count'], 10) > 0) ? "2" : "3";
                        }
                    }
                } else {
                    state = "2";
                }
            }
        } else {
            state = "1";
        }

        switch (state) {
            case "1":
                $("div[data-type=add-club]").html('<a class="btn btn-success pull-right disabled"><i class="icon-plus icon-white"></i>未開放選社</a>');
                break;
            case "2":
                $("div[data-type=add-club]").html('<a class="btn btn-success pull-right" action-type="add"><i class="icon-plus icon-white"></i>加入社團</a>');
                break;
            case "3":
                $("div[data-type=add-club]").html('<a class="btn btn-success pull-right disabled">已額滿</a>');
                break;
            case "4":
                $("div[data-type=add-club]").html('<a class="btn btn-success pull-right" action-type="remove"><i class="icon-minus icon-white"></i>退出社團</a>');
                break;
            case "5":
                $("div[data-type=add-club]").html('<a class="btn btn-success pull-right" disabled>選社已鎖定</a>');
                break;
            default:
        }

        $("a[action-type=add]").bind('click', function () {
            $("#editModal h3").html("加入社團");
            if (Student.ClubID) {
                $("#editModal .modal-body").html("退出原社團，再加入" + club.ClubName + "嗎？");
            } else {
                $("#editModal .modal-body").html("想要加入" + club.ClubName + "嗎？");
            }

            $("#editModal #save-data").html("我要加入").attr("edit-target", "add");
            $("#editModal").modal("show");
        });

        $("a[action-type=remove]").bind('click', function () {
            $("#editModal h3").html("退出社團");
            $("#editModal .modal-body").html("想要退出" + club.ClubName + "嗎？");
            $("#editModal #save-data").html("我要退出").attr("edit-target", "remove"); ;
            $("#editModal").modal("show");

        });

        // TODO: 我加入的社團
        $("#club-list .my-add-in-club").removeClass("my-add-in-club");
        $("#club-list li[club-id=" + Student.ClubID + "]").addClass("my-add-in-club");
    };

    // TODO: 加入社團
    AddToClub = function () {
        var club = Club;
        if (club.ClubID) {
            connection.send({
                service: "_.SetMyClub",
                body: '<Request><SCJoin><ClubID>' + club.ClubID + '</ClubID></SCJoin></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#errorMessage', 'SetMyClub', error);
                    } else {
                        $("#editModal .modal-body").html("加入" + club.ClubName + "成功");
                        $("#editModal a[data-dismiss=modal]").html("關閉");
                        Student.PreClubID = Student.ClubID;
                        Student.ClubID = club.ClubID;
                        RefreshCount();
                    }
                }
            });
        } else {
            set_error_message('#errorMessage', '', '加入社團的資料不正確，請重新操作!');
        }
    };

    // TODO: 退出社團
    RemoveToClub = function () {
        var club = Club;
        if (club.ClubID) {
            connection.send({
                service: "_.RemoveClub",
                body: '<Request><SCJoin><ClubID>' + club.ClubID + '</ClubID></SCJoin></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#errorMessage', 'RemoveClub', error);
                    } else {
                        $("#editModal .modal-body").html("退出成功");
                        $("#editModal a[data-dismiss=modal]").html("關閉");
                        Student.ClubID = "";
                        RefreshCount();
                    }
                }
            });
        } else {
            set_error_message('#errorMessage', '', '退出社團的資料不正確，請重新操作!');
        }
    };

    // TODO: 更新人數資料
    RefreshCount = function () {
        var club = Club;
        if (club.ClubID) {
            connection.send({
                service: "_.GetClubAttendNumber",
                body: '<Request><ClubID>' + club.ClubID + '</ClubID></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message("#mainMsg", "GetClubAttendNumber", error);
                    } else {
                        $(response.Response.ClubRecord).each(function (index, item) {
                            club.TotalCount = item.TotalCount;
                            club.GradeYear1Count = item.GradeYear1Count;
                            club.GradeYear2Count = item.GradeYear2Count;
                            club.GradeYear3Count = item.GradeYear3Count;
                            var tmp_attendCount = (item.TotalCount || '');
                            if (club.Limit) {
                                tmp_attendCount = (parseInt(club.Limit, 10) - parseInt(club.TotalCount, 10) > 0) ? club.TotalCount : "額滿";
                                if (tmp_attendCount !== '額滿') {
                                    if (club['Grade' + Student.GradeYear + 'Limit']) {
                                        tmp_attendCount = (parseInt(club['Grade' + Student.GradeYear + 'Limit'], 10) - parseInt(club['GradeYear' + Student.GradeYear + 'Count'], 10) > 0) ? club.TotalCount : "額滿";
                                    }
                                }
                            }
                            $("#club-list li[club-id=" + club.ClubID + "] span[data-type=club-man-count]").html(tmp_attendCount);
                            // $("span[grade_year=1]").html(item.GradeYear1Count);
                            // $("span[grade_year=2]").html(item.GradeYear2Count);
                            // $("span[grade_year=3]").html(item.GradeYear3Count);
                        });
                        Check_State();
                    }
                }
            });
        }
        if (Student.PreClubID) {
            var index = $('#club-list li[club-id=' + Student.PreClubID + '] a').attr('club-index');
            if (index) {
                var preclub = Clubs[index];
                if (preclub) {
                    connection.send({
                        service: "_.GetClubAttendNumber",
                        body: '<Request><ClubID>' + Student.PreClubID + '</ClubID></Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                set_error_message("#mainMsg", "GetClubAttendNumber", error);
                            } else {
                                $(response.Response.ClubRecord).each(function (index, item) {
                                    preclub.TotalCount = item.TotalCount;
                                    preclub.GradeYear1Count = item.GradeYear1Count;
                                    preclub.GradeYear2Count = item.GradeYear2Count;
                                    preclub.GradeYear3Count = item.GradeYear3Count;
                                    var tmp_attendCount = (item.TotalCount || '');
                                    if (preclub.Limit) {
                                        tmp_attendCount = (parseInt(preclub.Limit, 10) - parseInt(preclub.TotalCount, 10) > 0) ? preclub.TotalCount : "額滿";
                                        if (tmp_attendCount !== '額滿') {
                                            if (preclub['Grade' + Student.GradeYear + 'Limit']) {
                                                tmp_attendCount = (parseInt(preclub['Grade' + Student.GradeYear + 'Limit'], 10) - parseInt(preclub['GradeYear' + Student.GradeYear + 'Count'], 10) > 0) ? preclub.TotalCount : "額滿";
                                            }
                                        }
                                    }
                                    $("#club-list li[club-id=" + preclub.ClubID + "] span[data-type=club-man-count]").html(tmp_attendCount);
                                    // $("span[grade_year=1]").html(item.GradeYear1Count);
                                    // $("span[grade_year=2]").html(item.GradeYear2Count);
                                    // $("span[grade_year=3]").html(item.GradeYear3Count);
                                });
                                Check_State();
                            }
                        }
                    });
                }
            }
        }
    };

    // TODO: 社團成績
    SetClubRecord = function () {
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
    resetData = function () {
        $("span[data-type=club-name]").html("");
        $("div[data-type] tbody").html("");
        $("div[data-type=summary] .my-widget-content").html("");
        $("div[data-type=add-club]").html("");
    };

    var result = {
        onInit : function() { return init(); },
        RemoveToClub : function() { return RemoveToClub(); },
        AddToClub : function() { return AddToClub(); },
        resetClubList : function() { return resetClubList(); }
    };
    return result;
}();