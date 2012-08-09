var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.sunset.teacher");
_gg.timeTableByTTId = {};

$(document).ready(function () {
    gadget.onSizeChanged(function (size) {
        $("#container-nav, #container-main").height(size.height - 50);
    });

    // TODO: 點選其他課表 
    $('#container-nav a[data-toggle="tab"]').on('shown', function (e) {
        if ($(e.target).attr("href") === "#function_SearchSchedule") {
            $('#filter-keyword').focus();
        }
    })

    // TODO: 查詢其他課表的autocomplete分類
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function (ul, items) {
            var self = this;
            var currentCategory = "";
            $.each(items, function (index, item) {
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                self._renderItem(ul, item);
            });
        }
    });

    // TODO: 查詢其他課表的autocomplete  
    $("#filter-keyword").catcomplete({
        source: function (request, response) {
            _gg.doSearch(request, response);
        },
        select: function (event, uCategory) {
            $(".help-inline").html("");
            $("#function_SearchSchedule .control-group").removeClass("warning");
            $('#function_MySchedule').addClass("hide");
            $('#function_SearchSchedule').removeClass("hide");
            _gg.GetOtherSchedule(_gg.SearchScheduledSchoolYear, _gg.SearchScheduledSemester, uCategory);
        },
        open: function () {
            $(".ui-autocomplete").css("z-index", 100);
            return false;
        }
    })
    .focus(function () {
        $('#show-myschedule').removeClass("active");
        $('#filter-schedule').addClass("active");
        $("#filter-keyword").removeClass("inputerror");
        $(".help-inline").html("");
        $("#function_SearchSchedule .control-group").removeClass("warning");
    })
    .bind("input.autocomplete", function () {
        $(this).trigger('keydown.autocomplete');
    });

    // TODO: 切換學年度學期
    $("#function_MySchedule .my-schoolyear-semester-widget button").click(function () {
        _gg.MyScheduledSchoolYear = this.attr("school-year");
        _gg.MyScheduledSemester = this.attr("semester");
    });
    $("#function_SearchSchedule .my-schoolyear-semester-widget button").click(function () {
        _gg.SearchScheduledSchoolYear = this.attr("school-year");
        _gg.SearchScheduledSemester = this.attr("semester");
    });

    // TODO: 學年度學期選單(課表的起點)
    _gg.DrwaingMyTimeTable();
});


// TODO: autocomplete選單
_gg.doSearch = function (req, add) {
    var resp1, resp2, resp3;
    var search_text = req.term;
    var retSearchList = [];
    var autocomplete_data = [];

    var doIt = function (add) {
        if (resp1 && resp2 && resp3) {
            autocomplete_data = resp1.concat(resp2, resp3);
            add(autocomplete_data);
        }
    }

    // TODO: 符合的老師
    _gg.connection.send({
        service: "_.GetTeachers",
        body: '<Request><TeacherName>%' + search_text + '%</TeacherName></Request>',
        result: function (response, error, http) {
            var data1 = [];
            if (error !== null) {
            } else {
                $(response.Teachers.Teacher).each(function (index, item) {
                    var nickname = (item.Nickname != '') ? '(' + item.Nickname + ')' : '';
                    data1.push({
                        label: item.TeacherName + nickname,
                        value: item.TeacherName + nickname,
                        category: '教師',
                        categoryid: 'T',
                        myid: item.ID
                    });
                });
                resp1 = data1;
                doIt(add);
            }
        }
    });

    // TODO: 符合的班級
    _gg.connection.send({
        service: "_.GetClasses",
        body: '<Request><ClassName>%' + search_text + '%</ClassName></Request>',
        result: function (response, error, http) {
            if (error !== null) {
            } else {
                var data2 = [];
                $(response.Classes.Class).each(function (index, item) {
                    data2.push({
                        label: item.ClassName,
                        value: item.ClassName,
                        category: '班級',
                        categoryid: 'C',
                        myid: item.ID
                    });
                });
                resp2 = data2;
                doIt(add);
            }
        }
    });

    // TODO: 符合的場地
    _gg.connection.send({
        service: "_.GetClassrooms",
        body: '<Request><ClassroomName>%' + search_text + '%</ClassroomName></Request>',
        result: function (response, error, http) {
            if (error !== null) {
            } else {
                var data3 = [];
                $(response.Classrooms.Classroom).each(function (index, item) {
                    data3.push({
                        label: item.Name,
                        value: item.Name,
                        category: '場地',
                        categoryid: 'CR',
                        myid: item.Uid
                    });
                });
                resp3 = data3;
                doIt(add);
            }
        }
    });
};

// TODO: 學年度學期選單
_gg.DrwaingMyTimeTable = function () {

    _gg.SchoolYear = null;
    _gg.Semester = null;
    _gg.MyScheduledSchoolYear = null;
    _gg.MyScheduledSemester = null;
    _gg.SearchScheduledSchoolYear = null;
    _gg.SearchScheduledSemester = null;
    var scope = null;

    // TODO: 取回目前學年度學期
    var DoGetCurrentSemester = function () {
        gadget.getContract("ischool.sunset.teacher").send({
            service: "_.GetCurrentSemester",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetCurrentSemester)\n</div>");
                } else {
                    $(response.Result.SystemConfig).each(function (index, item) {
                        _gg.SchoolYear = item.DefaultSchoolYear;
                        _gg.Semester = item.DefaultSemester;
                    });
                    SetScheduledSchoolYearSemester();
                }
            }
        });
    };

    // TODO: 取回可瀏覽的學年度學期
    var DoGetScheduledSchoolYearSemester = function () {
        gadget.getContract("ischool.sunset.teacher").send({
            service: "_.GetScheduledSchoolYearSemester",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetScheduledSchoolYearSemester)\n</div>");
                } else {
                    _gg.scope = response.Response;
                    SetScheduledSchoolYearSemester();
                }
            }
        });
    };

    // TODO: 學年度學期選單、預設值處理
    var SetScheduledSchoolYearSemester = function (a, b) {
        if (_gg.SchoolYear && _gg.Semester && _gg.scope) {
            // TODO: 可瀏覽的學年度學期清單，目前學年度學期，做為預設值
            var itemlist = [], tmp = [], addclass = "";
            $(_gg.scope).each(function (index, item) {
                addclass = "";
                tmp = item.SchoolYearSemester.split(',');
                if (tmp[0] === _gg.SchoolYear && tmp[1] === _gg.Semester) {
                    _gg.MyScheduledSchoolYear = tmp[0];
                    _gg.MyScheduledSemester = tmp[1];
                    _gg.SearchScheduledSchoolYear = tmp[0];
                    _gg.SearchScheduledSemester = tmp[1];
                    addclass = 'active';
                }
                itemlist.push('<button class="btn btn-large ' + addclass + '" my-school-year="' + tmp[0] + '" my-semester="' + tmp[1] + '">' + tmp[0] + tmp[1] + '</button>');
            });
            $('#function_MySchedule .my-schoolyear-semester-widget .btn-group').html(itemlist.join(""));
            $('#function_SearchSchedule .my-schoolyear-semester-widget .btn-group').html(itemlist.join(""));

            // TODO: 預設值不在可瀏覽範圍內
            if (!(_gg.MyScheduledSchoolYear && _gg.MyScheduledSemester)) {
                $('#function_MySchedule .my-schoolyear-semester-widget button:eq(0)').addClass("active");
                $('#function_SearchSchedule .my-schoolyear-semester-widget button:eq(0)').addClass("active");
                _gg.MyScheduledSchoolYear = $('#function_MySchedule .my-schoolyear-semester-widget button:eq(0)').attr("my-school-year");
                _gg.MyScheduledSemester = $('#function_MySchedule .my-schoolyear-semester-widget button:eq(0)').attr("my-semester");
                _gg.SearchScheduledSchoolYear = _gg.MyScheduledSchoolYear;
                _gg.SearchScheduledSemester = _gg.MyScheduledSemester;
            }

            _gg.GetMyTimeTable(_gg.MyScheduledSchoolYear, _gg.MyScheduledSemester); // TODO: 取回我的課程分段表
        }
    };

    DoGetCurrentSemester();
    DoGetScheduledSchoolYearSemester();
};

// TODO: 取回我的課程分段表
_gg.GetMyTimeTable = function (setYear, setSemester) {
    _gg.connection.send({
        service: "_.GetMySchedule",
        body: '<Request><SchoolYear>' + setYear + '</SchoolYear><Semester>' + setSemester + '</Semester></Request>',
        result: function (response, error, http) {
            if (error !== null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetMySchedule)\n</div>");
            } else {
                var ttid;
                var courseSectionByTTId = {};
                $(response.Schedule.CourseSection).each(function (index, item) {
                    // TODO: 以 TimetableID 分類                            
                    ttid = item.TimetableID;
                    if (!courseSectionByTTId[ttid]) {
                        var tmp_ColTimeTable = {
                            Schedule: []
                        };
                        courseSectionByTTId[ttid] = tmp_ColTimeTable;
                    }
                    courseSectionByTTId[ttid].Schedule.push(item);
                });

                // TODO: 設定標題
                $("#function_MySchedule h2").html(setYear + "學年度第" + setSemester + "學期 <span class='label label-success'>我的課表</span>");
                _gg.DoGetAllTimeTables("myself", courseSectionByTTId); // TODO: 取回課程時間表
            }
        }
    });
};

// TODO: 取回某個課程分段表
_gg.GetOtherSchedule = function (setYear, setSemester, uCategory) {
    switch (uCategory.item.categoryid) {
        case 'T':
            request_body = '<TeacherID>' + uCategory.item.myid + '</TeacherID>';
            break;
        case 'C':
            request_body = '<ClassID>' + uCategory.item.myid + '</ClassID>';
            break;
        case 'CR':
            request_body = '<ClassroomID>' + uCategory.item.myid + '</ClassroomID>';
            break;
    }

    _gg.connection.send({
        service: "_.GetOtherSchedule",
        body: '<Request><SchoolYear>' + setYear + '</SchoolYear><Semester>' + setSemester + '</Semester>' + request_body + '</Request>',
        result: function (response, error, http) {
            if (error !== null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetOtherSchedule)\n</div>");
            } else {
                if ($(response.Schedule).size() === 0) {
                    $(".help-inline").html("尚無課表資料！");
                    $("#function_SearchSchedule .control-group").addClass("warning");
                } else {
                    var ttid;
                    var courseSectionByTTId = {};
                    $(response.Schedule.CourseSection).each(function (index, item) {
                        // TODO: 以 TimetableID 分類                            
                        ttid = item.TimetableID;
                        if (!courseSectionByTTId[ttid]) {
                            var tmp_ColTimeTable = {
                                TimetableID: ttid,
                                Schedule: []
                            };
                            courseSectionByTTId[ttid] = tmp_ColTimeTable;
                        }
                        courseSectionByTTId[ttid].Schedule.push(item);
                    });

                    // TODO: 設定標題
                    $("#function_SearchSchedule h2").html(setYear + "學年度第" + setSemester + "學期 <span class='label label-success'>" + uCategory.item.value + "的課表</span>");
                    _gg.DoGetAllTimeTables(uCategory.item.categoryid, courseSectionByTTId); // TODO: 取回課程時間表
                }
            }
        }
    });
};

// TODO: 取回課程時間表
_gg.DoGetAllTimeTables = function (usemodel, courseSectionByTTId) {
    var run_times = -1; // TODO: 總數

    // TDDO: 計數
    var tmpObj = {
        value: 0,
        add: function () {
            this.value += 1;
        }
    };

    // TODO: 驗證所有的時間表是否已下載
    var doCheck = function () {
        tmpObj.add();
        if (tmpObj.value === run_times) {
            _gg.DrawingTimeTable(usemodel, courseSectionByTTId) // TODO: 製作課表
        }
    };

    $.each(courseSectionByTTId, function (ttid, value) {
        if (_gg.timeTableByTTId[ttid] === undefined) {
            if (run_times === -1) run_times = 0;
            run_times += 1;
            _gg.connection.send({                
                service: "_.GetAllTimeTables",
                body: '<Request><Condition><TimetableID>' + ttid + '</TimetableID></Condition></Request>',
                result: function (response, error, http) {                    
                    if (error !== null) {
                        return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetAllTimeTables)\n</div>");
                    } else {
                        $(response.TimeTableSections.TimeTableSection).each(function (index, item) {
                            var that_ttid = item.TimetableID;
                            if (!_gg.timeTableByTTId[that_ttid]) {
                                var objTT = {
                                    TimetableID: item.TimetableID,
                                    TimetableName: item.TimetableName,
                                    MaxWeekday: parseInt(item.Weekday, 10),
                                    MaxPeriod: parseInt(item.Period, 10),
                                    Sections: []
                                };
                                _gg.timeTableByTTId[that_ttid] = objTT;
                            }

                            var targetTT = _gg.timeTableByTTId[that_ttid];
                            targetTT.Sections.push(item);

                            if (parseInt(item.Weekday, 10) > targetTT.MaxWeekday) {
                                targetTT.MaxWeekday = parseInt(item.Weekday, 10);
                            }
                            if (parseInt(item.Period, 10) > targetTT.MaxPeriod) {
                                targetTT.MaxPeriod = parseInt(item.Period, 10);
                            }
                        });
                        doCheck();
                    }
                }
            });
        }
    });
    if (run_times === -1) run_times = 0;

    if (run_times === 0) {
        _gg.DrawingTimeTable(usemodel, courseSectionByTTId) // TODO: 製作課表
    }
};

// TODO: 製作課表
_gg.DrawingTimeTable = function (useModel, courseSectionByTTId) {
    var content;

    if (useModel === "myself") {
        var set_selector = "#function_MySchedule";
    } else {
        var set_selector = "#function_SearchSchedule";
    }

    $(set_selector + ' ul').html("");
    $(set_selector + ' .tab-content').html("");

    $.each(courseSectionByTTId, function (ttid, item) {
        content = '';
        if ($(item.Schedule).size() === 0) {
            content += '<div class="tab-pane active my-TabContent" id="' + useModel + ttid + '">';
            content += '<p>無學期課表</p>';
            content += '</div>';
            $(set_selector + ' .tab-content').html(content);
        } else {
            var theTimeTable = _gg.timeTableByTTId[ttid];
            var items = [];
            var max_Weekday = parseInt(theTimeTable.MaxWeekday, 10);
            var max_Period = parseInt(theTimeTable.MaxPeriod, 10);
            var theads = [];
            var tbodys = [];

            // TODO: 畫出Tabs
            items.push('<li><a href="#' + useModel + ttid + '" data-toggle="tab">' + theTimeTable.TimetableName + '</a></li>');
            $(set_selector + ' ul').append(items.join(""));
            $(set_selector + ' li:eq(0)').addClass("active");

            // TODO: 畫出表格
            var tmp_width = "15%";
            var tmp_total_width = $('#container-main').width() - 50;
            tmp_width = (parseInt((parseInt((tmp_total_width / max_Weekday), 10) / tmp_total_width) * 100, 10)) + "%";

            for (var i = 0; i <= max_Period; i++) {
                if (i !== 0) tbodys.push('<tr>');
                for (var j = 0; j <= max_Weekday; j++) {
                    if (i === 0) {
                        if (j === 0) {
                            theads.push('<th>節次\\<br />星期</th>');
                        } else {
                            theads.push('<th>' + funGetDayName(j) + '</th>');
                        }
                    } else {
                        if (j === 0) {
                            tbodys.push('<th>' + i + '</th>');
                        } else {
                            tbodys.push('<td class="my-empty-column" width="' + tmp_width + '" my-period="' + i + '" my-weekday="' + j + '"></td>'); // TODO: 預設css在課程時間表未設定
                        }
                    }
                }
                if (i !== 0 ) tbodys.push('</tr>');
            }

            content += '<div class="tab-pane my-TabContent" id="' + useModel + ttid + '">';
            content += '<table class="my-table my-table-bordered">';
            content += '<thead><tr>' + theads.join("") + '</tr></thead>';
            content += '<tbody>' + tbodys.join("") + '</tbody>';
            content += '</table>';
            content += '</div>';

            $(set_selector + ' .tab-content').append(content);
            $(set_selector + ' .tab-content .tab-pane:eq(0)').addClass("active");


            // TODO: 不排課、移除在課程時間表中有排課之css
            $(theTimeTable.Sections).each(function (index, item) {
                if (item.Disable === 't') {
                    $(set_selector + ' #' + useModel + ttid + ' td[my-period=' + item.Period + '][my-weekday=' + item.Weekday + ']').html("item.DisableMessage");
                }
                $(set_selector + ' #' + useModel + ttid + ' td[my-period=' + item.Period + '][my-weekday=' + item.Weekday + ']').removeClass("my-empty-column");
            });


            // TODO: 課程表內容
            var groupid;
            $(item.Schedule).each(function (index, item2) {
                content = '<div>';
                switch (useModel) {
                    case "C":
                        groupid = '@' + item2.Subject.replace(' ', '') + '@';
                        content += '<div>' + item2.Subject + '</div>';
                        content += '<div>' + item2.TeacherName + '</div>';
                        content += '<div class="my-classroom">';
                        content += (item2.ClassroomName !== "") ? ('<span class="label">' + item2.ClassroomName + '</span>') : '&nbsp;';
                        content += '</div>';
                        break;
                    case "CR":
                        groupid = '@' + item2.ClassName.replace(' ', '') + '@';
                        content += '<div>' + item2.ClassName + '</div>';
                        content += '<div>' + item2.Subject + '</div>';
                        content += '<div>' + item2.TeacherName + '</div>';
                        break;
                    default:
                        groupid = '@' + item2.ClassName.replace(' ', '') + '@';
                        content += '<div>' + item2.ClassName + '</div>';
                        content += '<div>' + item2.Subject + '</div>';
                        content += '<div class="my-classroom">';
                        content += (item2.ClassroomName !== "") ? ('<span class="label">' + item2.ClassroomName + '</span>') : '&nbsp;';
                        content += '</div>';
                }
                content += '</div>';


                // TODO: 課程分段處理
                for (var i = 0; i < item2.Length; i++) {
                    $(set_selector + ' #' + useModel + ttid + ' td[my-period=' + (parseInt(item2.Period, 10) + i) + '][my-weekday=' + item2.Weekday + ']')
                        .append(content)
                        .attr("my-group", function (index, attrv) {
                            var x = "";
                            x = $(this).attr("my-group") || "";
                            return (x + groupid);
                        });
                }
            });
        }
    });
    _gg.change_color();
};

// TODO: 課表移入變色
_gg.change_color = function () {
    $("td").hover(
        function () {
            $("td[my-group*='" + $(this).attr("my-group") + "']").addClass("my-td-group");
        },
        function () {
            $("td[my-group*='" + $(this).attr("my-group") + "']").removeClass("my-td-group");
        }
     );
};