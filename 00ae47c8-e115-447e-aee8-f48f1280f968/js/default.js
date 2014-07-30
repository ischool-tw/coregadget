// Generated by CoffeeScript 1.6.3
(function() {
  var getAttendance, getDiscipline, getMoralScore, getMorality, global, init, myHandleArray, resetAttendance, resetData, resetDiscipline, resetMorality, resetSchoolYearSeme, set_error_message;

  global = {};

  global.system_position = gadget.params.system_position || "parent";

  global.connection = (global.system_position === "student" ? gadget.getContract("ischool.AD.student") : gadget.getContract("ischool.AD.parent"));

  jQuery(function() {
    init();
    gadget.autofit(document.getElementById("widget"));
    $("#children-list").on("click", "a", function(e) {
      $('#children-list li[class=active]').removeClass('active');
      $(this).parent().addClass('active');
      global.student = global.students[$(this).attr("children-index")];
      global.behavior = {
        schoolYear: global.schoolYear,
        semester: global.semester
      };
      $("#behavior #discipline tbody").html("");
      resetSchoolYearSeme();
      return resetData();
    });
    $("#behavior .btn-group").on("click", ".btn", function(e) {
      if (global.student != null) {
        global.behavior = {
          schoolYear: $(this).attr("school-year"),
          semester: $(this).attr("semester")
        };
        return resetData();
      }
    });
    $("#morality a[my-toggle=collapse]").click(function() {
      $("#morality-container").toggleClass("hide");
      $("#morality span[data-collapse] i").toggleClass("icon-chevron-up", $("#morality-container").is(".hide"));
      $("#morality span[data-collapse] i").toggleClass("icon-chevron-down", !$("#morality-container").is(".hide"));
      return false;
    });
    $("#attendance a[my-toggle=collapse]").click(function() {
      $("#attendance-container").toggleClass("hide");
      $("#attendance span[data-collapse] i").toggleClass("icon-chevron-up", $("#attendance-container").is(".hide"));
      $("#attendance span[data-collapse] i").toggleClass("icon-chevron-down", !$("#attendance-container").is(".hide"));
      return false;
    });
    return $("#discipline a[my-toggle=collapse]").click(function() {
      $("#discipline-container").toggleClass("hide");
      $("#discipline span[data-collapse] i").toggleClass("icon-chevron-up", $("#discipline-container").is(".hide"));
      $("#discipline span[data-collapse] i").toggleClass("icon-chevron-down", !$("#discipline-container").is(".hide"));
      return false;
    });
  });

  init = function() {
    var bAbsenceMappingTable, bCurrentSemester, bDLBehaviorConfig, bPeriodMappingTable, bStudentInfo, runFirstStudent;
    bCurrentSemester = false;
    bStudentInfo = false;
    bPeriodMappingTable = false;
    bAbsenceMappingTable = false;
    bDLBehaviorConfig = false;
    if (global.system_position !== "parent") {
      $("#children-list").closest('.row-fluid').remove();
    }
    runFirstStudent = function() {
      if (bCurrentSemester && bStudentInfo && bPeriodMappingTable && bAbsenceMappingTable && bDLBehaviorConfig) {
        if (global.system_position === "parent") {
          return $("#children-list").find('a:first').trigger('click');
        } else {
          global.student = global.students[0];
          global.behavior = {
            schoolYear: global.schoolYear,
            semester: global.semester
          };
          resetSchoolYearSeme();
          return resetData();
        }
      }
    };
    global.connection.send({
      service: "_.GetCurrentSemester",
      body: "",
      result: function(response, error, xhr) {
        if (error != null) {
          return set_error_message('#mainMsg', 'GetCurrentSemester', error);
        } else {
          global.schoolYear = response.Current.SchoolYear;
          global.semester = response.Current.Semester;
          bCurrentSemester = true;
          return runFirstStudent();
        }
      }
    });
    global.connection.send({
      service: "_.GetStudentInfo",
      body: "",
      result: function(response, error, xhr) {
        var items, _ref;
        if (error != null) {
          return set_error_message('#mainMsg', 'GetStudentInfo', error);
        } else {
          items = [];
          if (((_ref = response.Result) != null ? _ref.Student : void 0) != null) {
            global.students = $(response.Result.Student);
            global.students.each(function(index, student) {
              student.SemsHistory.History = myHandleArray(student.SemsHistory.History);
              return items.push("<li " + (index === 0 ? " class='active'" : '') + ">\n  <a href='#' children-index='" + index + "'>" + this.StudentName + "</a>\n</li>");
            });
            $("#children-list").html(items.join(""));
            bStudentInfo = true;
            return runFirstStudent();
          }
        }
      }
    });
    global.connection.send({
      service: "_.GetPeriodMappingTable",
      body: "",
      result: function(response, error, xhr) {
        var _ref;
        if (error != null) {
          return set_error_message('#mainMsg', 'GetPeriodMappingTable', error);
        } else {
          global.periods = [];
          global.period_type = {};
          if (((_ref = response.Response) != null ? _ref.Period : void 0) != null) {
            $(response.Response.Period).each(function(index, item) {
              global.periods.push(item);
              if (!global.period_type[item.Type]) {
                return global.period_type[item.Type] = 0;
              }
            });
            bPeriodMappingTable = true;
            return runFirstStudent();
          }
        }
      }
    });
    global.connection.send({
      service: "_.GetAbsenceMappingTable",
      body: "",
      result: function(response, error, xhr) {
        var _ref;
        if (error != null) {
          return set_error_message('#mainMsg', 'GetAbsenceMappingTable', error);
        } else {
          global.absence = {};
          if (((_ref = response.Response) != null ? _ref.Absence : void 0) != null) {
            $(response.Response.Absence).each(function(index, item) {
              return global.absence[item.Name] = item.Abbreviation;
            });
            bAbsenceMappingTable = true;
            return runFirstStudent();
          }
        }
      }
    });
    return global.connection.send({
      service: "_.GetList",
      body: "<Request><Name>DLBehaviorConfig</Name></Request>",
      result: function(response, error, xhr) {
        if (error != null) {
          return set_error_message('#mainMsg', 'GetList_DLBehaviorConfig', error);
        } else {
          global.morality = response;
          bDLBehaviorConfig = true;
          return runFirstStudent();
        }
      }
    });
  };

  myHandleArray = function(obj) {
    var result;
    if (!$.isArray(obj)) {
      result = [];
      if (obj) {
        result.push(obj);
      }
    } else {
      result = obj;
    }
    return result;
  };

  resetSchoolYearSeme = function() {
    var items, student, _ref;
    student = global.student;
    items = [];
    items.push("<button class='btn btn-large active' school-year='" + global.schoolYear + "' semester='" + global.semester + "'>\n  " + (global.schoolYear + '' + global.semester) + "\n</button>");
    if (((_ref = student.SemsHistory) != null ? _ref.History : void 0) != null) {
      $(student.SemsHistory.History.sort($.by("desc", "SchoolYear", $.by("desc", "Semester")))).each(function(index, item) {
        if (!(this.SchoolYear === global.schoolYear && this.Semester === global.semester)) {
          return items.push("<button class='btn btn-large' school-year='" + this.SchoolYear + "' semester='" + this.Semester + "'>" + (this.SchoolYear + '' + this.Semester) + "</button>");
        }
      });
    }
    return $("#behavior .btn-group").html(items.join(""));
  };

  resetMorality = function() {
    $("#morality-container").removeClass("hide").html("");
    $("#morality span[data-collapse] i").addClass("icon-chevron-down").removeClass("icon-chevron-up");
    return $("#morality-view").addClass("hide");
  };

  resetAttendance = function() {
    $("#attendance h2 span").html("");
    $("#attendance .my-thumbnails").html("");
    $("#attendance-container").addClass("hide").html("");
    $("#attendance span[data-collapse] i").addClass("icon-chevron-up").removeClass("icon-chevron-down");
    $("#attendance-view").addClass("hide");
    return $("#attendance-note").addClass("hide");
  };

  resetDiscipline = function() {
    $("#discipline .my-thumbnails").addClass("hide");
    $("#discipline-container").addClass("hide").html("");
    $("#discipline span[data-collapse] i").addClass("icon-chevron-up").removeClass("icon-chevron-down");
    $("#discipline-view").addClass("hide");
    $("#merit-a").html("<span class='badge'>0</span>");
    $("#merit-b").html("<span class='badge'>0</span>");
    $("#merit-c").html("<span class='badge'>0</span>");
    $("#demerit-a").html("<span class='badge'>0</span>");
    $("#demerit-b").html("<span class='badge'>0</span>");
    $("#demerit-c").html("<span class='badge'>0</span>");
    $("#demerit-d").html("");
    $("#merit-a-detail").addClass("hide").html("");
    $("#merit-b-detail").addClass("hide").html("");
    $("#merit-c-detail").addClass("hide").html("");
    $("#demerit-a-detail").addClass("hide").html("");
    $("#demerit-b-detail").addClass("hide").html("");
    $("#demerit-c-detail").addClass("hide").html("");
    return $("#discipline-note").addClass("hide");
  };

  resetData = function() {
    resetMorality();
    resetAttendance();
    resetDiscipline();
    return getMoralScore();
  };

  getMoralScore = function() {
    global.moralScore = {};
    return global.connection.send({
      service: "_.GetMoralScore",
      body: "<Request>\n  <StudentID>" + global.student.StudentID + "</StudentID>\n  <SchoolYear>" + global.behavior.schoolYear + "</SchoolYear>\n  <Semester>" + global.behavior.semester + "</Semester>\n</Request>",
      result: function(response, error, xhr) {
        if (error != null) {
          return set_error_message('#mainMsg', 'GetMoralScore', error);
        } else {
          if (response.Result != null) {
            global.moralScore = response.Result;
          }
          getMorality();
          getAttendance();
          return getDiscipline();
        }
      }
    });
  };

  getMorality = function() {
    var my_schoolYear, my_semester, _ref;
    if (((_ref = global.morality) != null ? _ref.Response : void 0) != null) {
      my_schoolYear = global.behavior.schoolYear;
      my_semester = global.behavior.semester;
      return global.connection.send({
        service: "_.GetAssociation",
        body: "<Request>\n  <StudentID>" + global.student.StudentID + "</StudentID>\n  <SchoolYear>" + global.behavior.schoolYear + "</SchoolYear>\n  <Semester>" + global.behavior.semester + "</Semester>\n</Request>",
        result: function(response, error, xhr) {
          var btn_active, items, _association, _ref1, _ref2, _ref3;
          btn_active = $('.my-schoolyear-semester-widget button.active');
          if (btn_active.attr("school-year") === global.behavior.schoolYear && btn_active.attr("semester") === global.behavior.semester) {
            resetMorality();
            if (error != null) {
              set_error_message('#mainMsg', 'GetAssociation', error);
            } else {
              _association = {};
              if ((_ref1 = response.Response) != null ? _ref1.Score : void 0) {
                $(response.Response.Score).each(function(index, item) {
                  return _association = item;
                });
              }
              items = [];
              $(global.morality.Response).each(function() {
                var _ref2;
                if (this.DailyBehavior != null) {
                  items.push("<div class=\"accordion-group\">\n  <div class=\"accordion-heading\">\n    <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#DailyBehavior\">\n      " + (this.DailyBehavior.Name || '日常行為表現') + "\n    </a>\n  </div>\n  <div id=\"DailyBehavior\" class=\"accordion-body collapse\">\n    <div class=\"accordion-inner\">\n      <table class=\"table table-striped\">\n        <tbody>");
                  $(this.DailyBehavior.Item).each(function() {
                    return items.push("<tr>\n  <th><span>" + (this.Name || '') + "</span></th>\n  <td><span>" + (this.Index || '') + "</span></td>\n  <td><span data-type=\"DB_Degree_" + (this.Name || '') + "\"></span></td>\n</tr>");
                  });
                  items.push("          </tbody>\n        </table>\n      </div>\n    </div>\n</div>");
                }
                items.push("<div class=\"accordion-group\">\n  <div class=\"accordion-heading\">\n    <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#GroupActivity\">\n      " + (((_ref2 = this.GroupActivity) != null ? _ref2.Name : void 0) || '團體活動表現') + "\n    </a>\n  </div>\n  <div id=\"GroupActivity\" class=\"accordion-body collapse\">\n    <div class=\"accordion-inner\">\n      <table class=\"table table-striped\">\n        <tbody>");
                if (this.GroupActivity != null) {
                  $(this.GroupActivity.Item).each(function() {
                    return items.push("<tr>\n  <th><span>" + (this.Name || '') + "</span></th>\n  <td><span data-type=\"GA_Degree_" + (this.Name || '') + "\"></span></td>\n  <td><span data-type=\"GA_Description_" + (this.Name || '') + "\"></span></td>\n</tr>");
                  });
                }
                items.push("            <tr>\n              <th><span>社團活動</span></th>\n              <td><span>" + (_association.Effort || '') + "</span></td>\n              <td><span>" + (_association.Text || '') + "</span></td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n    </div>\n</div>");
                if (this.PublicService != null) {
                  items.push("<div class=\"accordion-group\">\n  <div class=\"accordion-heading\">\n    <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#PublicService\">\n      " + (this.PublicService.Name || '公共服務表現') + "\n    </a>\n  </div>\n  <div id=\"PublicService\" class=\"accordion-body collapse\">\n    <div class=\"accordion-inner\">\n      <table class=\"table table-striped\">\n        <tbody>");
                  $(this.PublicService.Item).each(function() {
                    return items.push("<tr>\n  <th><span>" + (this.Name || '') + "</span></th>\n  <td><span data-type=\"PS_Description_" + (this.Name || '') + "\"></span></td>\n</tr>");
                  });
                  items.push("          </tbody>\n        </table>\n      </div>\n    </div>\n</div>");
                }
                if (this.SchoolSpecial != null) {
                  items.push("<div class=\"accordion-group\">\n  <div class=\"accordion-heading\">\n    <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#SchoolSpecial\">\n      " + (this.SchoolSpecial.Name || '校內外特殊表現') + "\n    </a>\n  </div>\n  <div id=\"SchoolSpecial\" class=\"accordion-body collapse\">\n    <div class=\"accordion-inner\">\n      <table class=\"table table-striped\">\n        <tbody>");
                  $(this.SchoolSpecial.Item).each(function() {
                    return items.push("<tr>\n  <th><span>" + (this.Name || '') + "</span></th>\n  <td><span data-type=\"SS_Description_" + (this.Name || '') + "\"></span></td>\n</tr>");
                  });
                  items.push("          </tbody>\n        </table>\n      </div>\n    </div>\n</div>");
                }
                if (this.DailyLifeRecommend != null) {
                  return items.push("<div class=\"accordion-group\">\n  <div class=\"accordion-heading\">\n    <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#DailyLifeRecommend\">\n      " + (this.DailyLifeRecommend.Name || '日常生活表現具體建議') + "\n    </a>\n  </div>\n  <div id=\"DailyLifeRecommend\" class=\"accordion-body collapse\">\n    <div class=\"accordion-inner\">\n    </div>\n  </div>\n</div>");
                }
              });
              $("#behavior #morality #morality-container").html(items.join(""));
              $('#behavior #morality table').find('tr:first td, tr:first th').css("border-top-color", "transparent");
              if (((_ref2 = global.moralScore) != null ? (_ref3 = _ref2.DailyLifeScore) != null ? _ref3.TextScore : void 0 : void 0) != null) {
                $(global.moralScore.DailyLifeScore.TextScore).each(function() {
                  if (this.DailyBehavior != null) {
                    $(this.DailyBehavior.Item).each(function() {
                      return $("#DailyBehavior td span[data-type=DB_Degree_" + (this.Name || '') + "]").html(this.Degree || '');
                    });
                  }
                  if (this.GroupActivity != null) {
                    $(this.GroupActivity.Item).each(function() {
                      $("#GroupActivity td span[data-type=GA_Degree_" + (this.Name || '') + "]").html(this.Degree || '');
                      return $("#GroupActivity td span[data-type=GA_Description_" + (this.Name || '') + "]").html(this.Description || '');
                    });
                  }
                  if (this.PublicService != null) {
                    $(this.PublicService.Item).each(function() {
                      return $("#PublicService td span[data-type=PS_Description_" + (this.Name || '') + "]").html(this.Description || '');
                    });
                  }
                  if (this.SchoolSpecial != null) {
                    $(this.SchoolSpecial.Item).each(function() {
                      return $("#SchoolSpecial td span[data-type=SS_Description_" + (this.Name || '') + "]").html(this.Description || '');
                    });
                  }
                  if (this.DailyLifeRecommend != null) {
                    return $("#DailyLifeRecommend .accordion-inner").html("" + (this.DailyLifeRecommend.Description || ''));
                  }
                });
              }
            }
            return $("#morality-view").removeClass("hide");
          }
        }
      });
    } else {
      return $("#morality-container").html("目前無資料");
    }
  };

  getAttendance = function() {
    var my_schoolYear, my_semester;
    my_schoolYear = global.behavior.schoolYear;
    my_semester = global.behavior.semester;
    return global.connection.send({
      service: "_.GetAttendanceRecord",
      body: "<Request>\n  <StudentID>" + global.student.StudentID + "</StudentID>\n  <SchoolYear>" + global.behavior.schoolYear + "</SchoolYear>\n  <Semester>" + global.behavior.semester + "</Semester>\n</Request>",
      result: function(response, error, xhr) {
        var absences_d, absences_t, btn_active, have_none, ii, items, tbody, thead, _absence, _period_type, _periods, _ref, _ref1, _ref2, _ref3;
        btn_active = $('.my-schoolyear-semester-widget button.active');
        if (btn_active.attr("school-year") === my_schoolYear && btn_active.attr("semester") === my_semester) {
          resetAttendance();
          if (error != null) {
            return set_error_message('#mainMsg', 'GetAttendanceRecord', error);
          } else {
            absences_t = {};
            absences_d = [];
            if (((_ref = response.Result) != null ? _ref.Attendance : void 0) != null) {
              $(response.Result.Attendance).each(function() {
                var item;
                item = {};
                item['OccurDate'] = this.OccurDate;
                $(this.Detail.Attendance.Period).each(function() {
                  if (absences_t[this['AbsenceType']] == null) {
                    absences_t[this['AbsenceType']] = {
                      total: 0
                    };
                  }
                  absences_t[this['AbsenceType']].total += 1;
                  return item[this["@text"]] = this.AbsenceType;
                });
                return absences_d.push(item);
              });
            }
            items = [];
            _periods = global.periods;
            _absence = global.absence;
            _period_type = global.period_type;
            thead = "<th>日期</th>";
            $(_periods).each(function() {
              return thead += "<th>" + this.Name + "</th>";
            });
            thead = "<tr>" + thead + "</tr>";
            tbody = "";
            $(absences_d).each(function(i, item) {
              var tr;
              tr = "<td>" + item.OccurDate + "</td>";
              $(_periods).each(function(j, period) {
                if (_absence[item[period.Name]]) {
                  tr += "<td>" + (_absence[item[period.Name]] || '') + "</td>";
                  if (!absences_t[item[period.Name]][period.Type]) {
                    absences_t[item[period.Name]][period.Type] = 0;
                  }
                  return absences_t[item[period.Name]][period.Type] += 1;
                } else {
                  return tr += "<td></td>";
                }
              });
              return tbody += "<tr>" + tr + "</tr>";
            });
            have_none = false;
            if (((_ref1 = global.moralScore) != null ? (_ref2 = _ref1.InitialSummary) != null ? (_ref3 = _ref2.AttendanceStatistics) != null ? _ref3.Absence : void 0 : void 0 : void 0) != null) {
              $(global.moralScore.InitialSummary.AttendanceStatistics.Absence).each(function(index, item) {
                if (item.Count) {
                  have_none = true;
                }
                if (!absences_t[item.Name]) {
                  absences_t[item.Name] = {
                    total: 0
                  };
                }
                absences_t[item.Name].total += parseInt(item.Count, 10);
                if (!absences_t[item.Name]['非明細' + item.PeriodType]) {
                  absences_t[item.Name]['非明細' + item.PeriodType] = 0;
                }
                return absences_t[item.Name]['非明細' + item.PeriodType] += parseInt(item.Count, 10);
              });
            }
            ii = 0;
            $.each(absences_t, function(name, item) {
              if (ii % 6 === 0) {
                items.push("<div class=\"row-fluid my-thumbnail-style\">");
              }
              items.push("<div class=\"span2\">\n  <div class=\"thumbnail my-thumbnail-white\">\n    <div class=\"my-subthumbnail-top\"><span class=\"badge badge-warning\">" + (item.total || '') + "</span></div>\n    <div class=\"caption my-subthumbnail-bottom\">\n      <h5>" + (name || '') + "</h5>\n    </div>\n    <div class=\"my-subthumbnail-detail\">");
              $.each(item, function(typename, value) {
                if (typename !== "total") {
                  return items.push("<div>" + typename + "：" + value + "</div>");
                }
              });
              items.push("    </div>\n  </div>\n</div>");
              if (ii % 6 === 5) {
                items.push("</div>");
              }
              return ii += 1;
            });
            if (ii % 6 !== 0) {
              items.push("</div>");
            }
            if (items.length === 0) {
              return $("#attendance-container").removeClass("hide").html("目前無資料");
            } else {
              if (have_none === true) {
                $("#attendance-note").removeClass("hide");
              }
              $("#attendance-view").removeClass("hide");
              $("#attendance .my-thumbnails").html("" + (items.join("")));
              return $("#attendance-container").addClass("hide").html("<div>\n  <table class=\"table table-striped table-bordered my-table\">\n    <thead>" + thead + "</thead>\n    <tbody>" + tbody + "</tbody>\n  </table>\n</div>");
            }
          }
        }
      }
    });
  };

  getDiscipline = function() {
    var my_schoolYear, my_semester;
    my_schoolYear = global.behavior.schoolYear;
    my_semester = global.behavior.semester;
    return global.connection.send({
      service: "_.GetDisciplineRecord",
      body: "<Request>\n  <StudentID>" + global.student.StudentID + "</StudentID>\n  <SchoolYear>" + global.behavior.schoolYear + "</SchoolYear>\n  <Semester>" + global.behavior.semester + "</Semester>\n</Request>",
      result: function(response, error, xhr) {
        var btn_active, disciplineStatistics, have_none, items, sum_merit, sum_none_merit, sum_total, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
        btn_active = $('.my-schoolyear-semester-widget button.active');
        if (btn_active.attr("school-year") === global.behavior.schoolYear && btn_active.attr("semester") === global.behavior.semester) {
          resetDiscipline();
          if (error != null) {
            return set_error_message('#mainMsg', 'GetDisciplineRecord', error);
          } else {
            items = [];
            sum_merit = {
              ma: 0,
              mb: 0,
              mc: 0,
              da: 0,
              db: 0,
              dc: 0,
              dd: 0
            };
            sum_none_merit = {
              ma: 0,
              mb: 0,
              mc: 0,
              da: 0,
              db: 0,
              dc: 0,
              dd: 0
            };
            have_none = false;
            if (((_ref = response.Result) != null ? _ref.Discipline : void 0) != null) {
              $(response.Result.Discipline).each(function() {
                var merit, merit_clear, _ref1, _ref2, _ref3;
                merit = {
                  a: 0,
                  b: 0,
                  c: 0
                };
                if (this.MeritFlag === "1") {
                  if (!isNaN(parseInt(this.Detail.Discipline.Merit.A, 10))) {
                    sum_merit.ma += merit.a = parseInt(this.Detail.Discipline.Merit.A, 10);
                  }
                  if (!isNaN(parseInt(this.Detail.Discipline.Merit.B, 10))) {
                    sum_merit.mb += merit.b = parseInt(this.Detail.Discipline.Merit.B, 10);
                  }
                  if (!isNaN(parseInt(this.Detail.Discipline.Merit.C, 10))) {
                    sum_merit.mc += merit.c = parseInt(this.Detail.Discipline.Merit.C, 10);
                  }
                  return items.push("<tr>\n  <td class=\"my-flags\">\n    <span class=\"badge " + (merit.a !== 0 ? "badge-success" : "") + "\">" + merit.a + "</span>\n    <br />大功\n  </td>\n  <td class=\"my-flags\">\n    <span class=\"badge " + (merit.b !== 0 ? "badge-success" : "") + "\">" + merit.b + "</span>\n    <br />小功\n  </td>\n  <td class=\"my-flags\">\n    <span class=\"badge " + (merit.c !== 0 ? "badge-success" : "") + "\">" + merit.c + "</span>\n    <br />嘉獎\n  </td>\n  <td>\n    <span>" + (this.OccurDate.substr(0, 10)) + "</span>\n    <br/>\n    <span>" + ((_ref1 = this.Reason) != null ? _ref1 : '') + "</span>\n  </td>\n</tr>");
                } else {
                  if (!isNaN(parseInt(this.Detail.Discipline.Demerit.A, 10))) {
                    merit.a = parseInt(this.Detail.Discipline.Demerit.A, 10);
                  }
                  if (!isNaN(parseInt(this.Detail.Discipline.Demerit.B, 10))) {
                    merit.b = parseInt(this.Detail.Discipline.Demerit.B, 10);
                  }
                  if (!isNaN(parseInt(this.Detail.Discipline.Demerit.C, 10))) {
                    merit.c = parseInt(this.Detail.Discipline.Demerit.C, 10);
                  }
                  merit_clear = this.Detail.Discipline.Demerit.Cleared;
                  if (merit_clear !== '是') {
                    sum_merit.da += merit.a;
                    sum_merit.db += merit.b;
                    sum_merit.dc += merit.c;
                  }
                  return items.push("<tr>\n  <td class=\"my-flags\">\n    <span class=\"badge " + (merit.a !== 0 && merit_clear === "是" ? "badge-warning" : (merit.a !== 0 ? "badge-important" : "")) + "\">" + merit.a + "</span>\n    <br />大過\n  </td>\n  <td class=\"my-flags\">\n    <span class=\"badge " + (merit.b !== 0 && merit_clear === '是' ? "badge-warning" : (merit.b !== 0 ? "badge-important" : "")) + "\">" + merit.b + "</span>\n    <br />小過\n  </td>\n  <td class=\"my-flags\">\n    <span class=\"badge " + (merit.c !== 0 && merit_clear === '是' ? "badge-warning" : (merit.c !== 0 ? "badge-important" : "")) + "\">" + merit.c + "</span>\n    <br />警告\n  </td>\n  <td>\n    " + (this.Detail.Discipline.Demerit.Cleared === '是' ? "<span class='my-offset'>" + (this.Detail.Discipline.Demerit.ClearDate.substr(0, 10).replace(/\//ig, "-")) + " 已銷過<br/>" + ((_ref2 = this.Detail.Discipline.Demerit.ClearReason) != null ? _ref2 : '') + "</span><br/>" : "") + "\n    <span>" + (this.OccurDate.substr(0, 10)) + "</span>\n    <br/>\n    <span>" + ((_ref3 = this.Reason) != null ? _ref3 : '') + "</span>\n  </td>\n</tr>");
                }
              });
            }
            if (((_ref1 = global.moralScore) != null ? (_ref2 = _ref1.InitialSummary) != null ? _ref2.DisciplineStatistics : void 0 : void 0) != null) {
              disciplineStatistics = global.moralScore.InitialSummary.DisciplineStatistics;
              if (((_ref3 = disciplineStatistics.Merit) != null ? _ref3.A : void 0) != null) {
                sum_none_merit.ma += parseInt(disciplineStatistics.Merit.A, 10);
                have_none = true;
              }
              if (((_ref4 = disciplineStatistics.Merit) != null ? _ref4.B : void 0) != null) {
                sum_none_merit.mb += parseInt(disciplineStatistics.Merit.B, 10);
                have_none = true;
              }
              if (((_ref5 = disciplineStatistics.Merit) != null ? _ref5.C : void 0) != null) {
                sum_none_merit.mc += parseInt(disciplineStatistics.Merit.C, 10);
                have_none = true;
              }
              if (((_ref6 = disciplineStatistics.Demerit) != null ? _ref6.A : void 0) != null) {
                sum_none_merit.da += parseInt(disciplineStatistics.Demerit.A, 10);
                have_none = true;
              }
              if (((_ref7 = disciplineStatistics.Demerit) != null ? _ref7.B : void 0) != null) {
                sum_none_merit.db += parseInt(disciplineStatistics.Demerit.B, 10);
                have_none = true;
              }
              if (((_ref8 = disciplineStatistics.Demerit) != null ? _ref8.C : void 0) != null) {
                sum_none_merit.dc += parseInt(disciplineStatistics.Demerit.C, 10);
                have_none = true;
              }
            }
            sum_total = {
              ma: sum_merit.ma + sum_none_merit.ma,
              mb: sum_merit.mb + sum_none_merit.mb,
              mc: sum_merit.mc + sum_none_merit.mc,
              da: sum_merit.da + sum_none_merit.da,
              db: sum_merit.db + sum_none_merit.db,
              dc: sum_merit.dc + sum_none_merit.dc,
              dd: sum_merit.dd + sum_none_merit.dd
            };
            $("#merit-a").html("<span class='badge " + (sum_total.ma !== 0 ? "badge-success" : "") + "'>" + sum_total.ma + "</span>");
            $("#merit-b").html("<span class='badge " + (sum_total.mb !== 0 ? "badge-success" : "") + "'>" + sum_total.mb + "</span>");
            $("#merit-c").html("<span class='badge " + (sum_total.mc !== 0 ? "badge-success" : "") + "'>" + sum_total.mc + "</span>");
            $("#demerit-a").html("<span class='badge " + (sum_total.da !== 0 ? "badge-important" : "") + "'>" + sum_total.da + "</span>");
            $("#demerit-b").html("<span class='badge " + (sum_total.db !== 0 ? "badge-important" : "") + "'>" + sum_total.db + "</span>");
            $("#demerit-c").html("<span class='badge " + (sum_total.dc !== 0 ? "badge-important" : "") + "'>" + sum_total.dc + "</span>");
            if (have_none === true) {
              $("#merit-a-detail").removeClass("hide").html("<div>一般：" + sum_merit.ma + "</div><div>非明細：" + sum_none_merit.ma + "</div>");
              $("#merit-b-detail").removeClass("hide").html("<div>一般：" + sum_merit.mb + "</div><div>非明細：" + sum_none_merit.mb + "</div>");
              $("#merit-c-detail").removeClass("hide").html("<div>一般：" + sum_merit.mc + "</div><div>非明細：" + sum_none_merit.mc + "</div>");
              $("#demerit-a-detail").removeClass("hide").html("<div>一般：" + sum_merit.da + "</div><div>非明細：" + sum_none_merit.da + "</div>");
              $("#demerit-b-detail").removeClass("hide").html("<div>一般：" + sum_merit.db + "</div><div>非明細：" + sum_none_merit.db + "</div>");
              $("#demerit-c-detail").removeClass("hide").html("<div>一般：" + sum_merit.dc + "</div><div>非明細：" + sum_none_merit.dc + "</div>");
              $("#discipline-note").removeClass("hide");
            }
            if (items.join("") === "" && have_none === false) {
              return $("#discipline-container").removeClass("hide").html("目前無資料");
            } else {
              if (have_none === true) {
                return $("#discipline .my-thumbnails").removeClass("hide");
              } else {
                $("#discipline-view").removeClass("hide");
                $("#discipline .my-thumbnails").removeClass("hide");
                return $("#discipline-container").html("<table class=\"table table-striped\">\n  <tbody>\n    " + (items.join("")) + "\n  </tbody>\n</table>");
              }
            }
          }
        }
      }
    });
  };

  set_error_message = function(select_str, serviceName, error) {
    var tmp_msg;
    tmp_msg = "<i class=\"icon-white icon-info-sign my-err-info\"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(" + serviceName + ")";
    if (error !== null) {
      if (error.dsaError) {
        if (error.dsaError.status === "504") {
          switch (error.dsaError.message) {
            case "501":
              tmp_msg = "<strong>很抱歉，您無讀取資料權限！</strong>";
          }
        } else {
          if (error.dsaError.message) {
            tmp_msg = error.dsaError.message;
          }
        }
      } else if (error.loginError.message) {
        tmp_msg = error.loginError.message;
      } else {
        if (error.message) {
          tmp_msg = error.message;
        }
      }
      $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
      return $(".my-err-info").click(function() {
        return alert("請拍下此圖，並與客服人員連絡，謝謝您。\n" + JSON.stringify(error, null, 2));
      });
    }
  };

  (function($) {
    return $.by = function(model, name, minor) {
      return function(o, p) {
        var a, b;
        if (o && p && typeof o === "object" && typeof p === "object") {
          a = o[name];
          b = p[name];
          if (a === b) {
            return (typeof minor === "function" ? minor(o, p) : 0);
          }
          if (typeof a === typeof b) {
            if (parseInt(a, 10) && parseInt(b, 10)) {
              a = parseInt(a, 10);
              b = parseInt(b, 10);
            }
            if (model === "desc") {
              return (a > b ? -1 : 1);
            } else {
              return (a < b ? -1 : 1);
            }
          }
          if (typeof a < typeof b) {
            return -1;
          } else {
            return 1;
          }
        } else {
          throw {
            name: "Error",
            message: "Expected an object when sorting by " + name
          };
        }
      };
    };
  })(jQuery);

}).call(this);
