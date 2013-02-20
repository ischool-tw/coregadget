global = {}

jQuery ->
  gadget.autofit document.getElementById "widget"
  gadget.onSizeChanged (size) ->
    $("#behavior").height size.height - 110

  $("#behavior .btn-group").on "click", ".btn", (e) ->
    if global.student?
      global.behavior =
        schoolYear: $(@).attr("school-year")
        semester: $(@).attr("semester")
      resetData()
      getMorality()
      getAttendance()
      getDiscipline()

  $("#morality a[my-toggle=collapse]").click ->
    $("#morality-container").toggleClass "hide"
    $("#morality span[data-collapse] i").toggleClass "icon-chevron-up", $("#morality-container").is(".hide")
    $("#morality span[data-collapse] i").toggleClass "icon-chevron-down", !$("#morality-container").is(".hide")
    return false

  $("#attendance a[my-toggle=collapse]").click ->
    $("#attendance-container").toggleClass "hide"
    $("#attendance span[data-collapse] i").toggleClass "icon-chevron-up", $("#attendance-container").is(".hide")
    $("#attendance span[data-collapse] i").toggleClass "icon-chevron-down", !$("#attendance-container").is(".hide")
    return false

  $("#discipline a[my-toggle=collapse]").click ->
    $("#discipline-container").toggleClass "hide"
    $("#discipline span[data-collapse] i").toggleClass "icon-chevron-up", $("#discipline-container").is(".hide")
    $("#discipline span[data-collapse] i").toggleClass "icon-chevron-down", !$("#discipline-container").is(".hide")
    return false

  gadget.getContract("ischool.AD.student").send {
    service: "_.GetCurrentSemester",
    body: "",
    result: (response, error, xhr) ->
      if error?
        set_error_message('#mainMsg', 'GetCurrentSemester', error)
      else
        global.schoolYear = response.Current.SchoolYear
        global.semester = response.Current.Semester

        gadget.getContract("ischool.AD.student").send {
          service: "_.GetStudentInfo",
          body: "",
          result: (response, error, xhr) ->
            if error?
              set_error_message('#mainMsg', 'GetStudentInfo', error)
            else
              if response.Result?.Student?
                resetData()

                global.students = $(response.Result.Student)

                global.students.each (index, student) ->
                  if not $.isArray(student.SemsHistory.History)
                    student.SemsHistory.History = [student.SemsHistory.History]

                  if index is 0
                    global.student = student
                    global.behavior =
                        schoolYear: global.schoolYear
                        semester: global.semester
                    resetSchoolYearSeme()
                    resetData()
                    getDiscipline()

                    ### 下載上課時間表 ###
                    gadget.getContract("ischool.AD.student").send {
                      service: "_.GetPeriodMappingTable",
                      body: ""
                      result: (response, error, xhr) ->
                        if error?
                          set_error_message('#mainMsg', 'GetPeriodMappingTable', error)
                        else
                          global.periods = []
                          global.period_type = {}
                          global.absence = {}
                          if response.Response?.Period?
                            $(response.Response.Period).each (index, item) ->
                              global.periods.push item
                              global.period_type[item.Type] = 0  unless global.period_type[item.Type]

                            ### 下載缺曠類別表 ###
                            gadget.getContract("ischool.AD.student").send {
                                service: "_.GetAbsenceMappingTable",
                                body: ""
                                result: (response, error, xhr) ->
                                  if error?
                                    set_error_message('#mainMsg', 'GetAbsenceMappingTable', error)
                                  else
                                    if response.Response?.Absence?
                                      $(response.Response.Absence).each (index, item) ->
                                        global.absence[item.Name] = item.Abbreviation
                                      getAttendance()
                            }
                    }

                    gadget.getContract("ischool.AD.student").send {
                      service: "_.GetList",
                      body: "<Request><Name>DLBehaviorConfig</Name></Request>",
                      result: (response, error, xhr) ->
                        if error?
                          set_error_message('#mainMsg', 'GetList_DLBehaviorConfig', error)
                        else
                          global.morality = response
                          getMorality()
                    }

        }
  }


# TODO: 學年度學期
resetSchoolYearSeme = () ->
  student = global.student
  items = []
  if student.SemsHistory?.History?
    items.push """
      <button class='btn btn-large active' school-year='#{global.schoolYear}' semester='#{global.semester}'>#{global.schoolYear + '' + global.semester}</button>
    """
    $(student.SemsHistory.History.sort $.by("desc", "SchoolYear", $.by("desc", "Semester"))).each (index, item) ->
      unless @.SchoolYear is global.schoolYear and @.Semester is global.semester
        items.push """
          <button class='btn btn-large' school-year='#{@.SchoolYear}' semester='#{@.Semester}'>#{@.SchoolYear + '' + @.Semester}</button>
        """
    $("#behavior .btn-group").html(items.join(""))

# TODO: 清除資料
resetData = () ->
  $("#morality-container").removeClass("hide").html ""
  $("#morality span[data-collapse] i").addClass("icon-chevron-down").removeClass("icon-chevron-up")
  $("#morality-view").addClass "hide"
  $("#attendance h2 span").html ""
  $("#attendance .my-thumbnails").html ""
  $("#attendance-container").addClass("hide").html("")
  $("#attendance span[data-collapse] i").addClass("icon-chevron-up").removeClass("icon-chevron-down")
  $("#attendance-view").addClass "hide"
  $("#discipline .my-thumbnails").addClass "hide"
  $("#discipline-container").addClass("hide").html("")
  $("#discipline span[data-collapse] i").addClass("icon-chevron-up").removeClass("icon-chevron-down")
  $("#discipline-view").addClass "hide"
  $("#merit-a").html "<span class='badge'>0</span>"
  $("#merit-b").html "<span class='badge'>0</span>"
  $("#merit-c").html "<span class='badge'>0</span>"
  $("#demerit-a").html "<span class='badge'>0</span>"
  $("#demerit-b").html "<span class='badge'>0</span>"
  $("#demerit-c").html "<span class='badge'>0</span>"
  $("#demerit-d").html ""

resetMorality = () ->
  $("#morality-container").removeClass("hide").html ""
  $("#morality span[data-collapse] i").addClass("icon-chevron-down").removeClass("icon-chevron-up")
  $("#morality-view").addClass "hide"

resetAttendance = () ->
  $("#attendance h2 span").html ""
  $("#attendance .my-thumbnails").html ""
  $("#attendance-container").addClass("hide").html("")
  $("#attendance span[data-collapse] i").addClass("icon-chevron-up").removeClass("icon-chevron-down")
  $("#attendance-view").addClass "hide"

resetDiscipline = () ->
  $("#discipline .my-thumbnails").addClass "hide"
  $("#discipline-container").addClass("hide").html("")
  $("#discipline span[data-collapse] i").addClass("icon-chevron-up").removeClass("icon-chevron-down")
  $("#discipline-view").addClass "hide"
  $("#merit-a").html "<span class='badge'>0</span>"
  $("#merit-b").html "<span class='badge'>0</span>"
  $("#merit-c").html "<span class='badge'>0</span>"
  $("#demerit-a").html "<span class='badge'>0</span>"
  $("#demerit-b").html "<span class='badge'>0</span>"
  $("#demerit-c").html "<span class='badge'>0</span>"
  $("#demerit-d").html ""

# TODO: 德性成績
getMorality = () ->
  if global.morality?.Response?
    my_schoolYear = global.behavior.schoolYear
    my_semester = global.behavior.semester
    gadget.getContract("ischool.AD.student").send {
      service: "_.GetMoralScore",
      body: """
        <Request>
          <StudentID>#{global.student.StudentID}</StudentID>
          <SchoolYear>#{global.behavior.schoolYear}</SchoolYear>
          <Semester>#{global.behavior.semester}</Semester>
        </Request>
      """,
      result: (response, error, xhr) ->
        btn_active = $('.my-schoolyear-semester-widget button.active')
        if btn_active.attr("school-year") is global.behavior.schoolYear and btn_active.attr("semester") is global.behavior.semester
          resetMorality()
          if error?
            set_error_message('#mainMsg', 'GetMoralScore', error)
          else
            items = []
            $(global.morality.Response).each () ->
              if @DailyBehavior?
                items.push """
                    <div class="accordion-group">
                      <div class="accordion-heading">
                        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#DailyBehavior">
                          #{@DailyBehavior.Name || '日常行為表現'}
                        </a>
                      </div>
                      <div id="DailyBehavior" class="accordion-body collapse">
                        <div class="accordion-inner">
                          <table class="table table-striped">
                            <tbody>
                """
                $(@DailyBehavior.Item).each () ->
                  items.push """
                    <tr>
                      <th><span>#{@Name || ''}</span></th>
                      <td><span>#{@Index || ''}</span></td>
                      <td><span data-type="DB_Degree_#{@Name || ''}"></span></td>
                    </tr>
                  """
                items.push """
                            </tbody>
                          </table>
                        </div>
                      </div>
                  </div>
                """

              if @DailyLifeRecommend?
                items.push """
                  <div class="accordion-group">
                    <div class="accordion-heading">
                      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#DailyLifeRecommend">
                        #{@DailyLifeRecommend.Name || '日常生活表現具體建議'}
                      </a>
                    </div>
                    <div id="DailyLifeRecommend" class="accordion-body collapse">
                      <div class="accordion-inner">
                      </div>
                    </div>
                  </div>
                """

              if @OtherRecommend?
                items.push """
                  <div class="accordion-group">
                    <div class="accordion-heading">
                      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#OtherRecommend">
                        #{@OtherRecommend.Name || ''}
                      </a>
                    </div>
                    <div id="OtherRecommend" class="accordion-body collapse">
                      <div class="accordion-inner">
                      </div>
                    </div>
                  </div>
                """

            $("#behavior #morality #morality-container").html items.join ""
            $('#behavior #morality table').find('tr:first td, tr:first th').css("border-top-color", "transparent")

            if response.Result.DailyLifeScore?.TextScore?
              $(response.Result.DailyLifeScore.TextScore).each () ->
                if @DailyBehavior?
                  $(@DailyBehavior.Item).each () ->
                    $("#DailyBehavior td span[data-type=DB_Degree_#{@Name || ''}]").html @Degree || ''

                if @DailyLifeRecommend?
                  $("#DailyLifeRecommend .accordion-inner").html """
                    #{@DailyLifeRecommend.Description ? @DailyLifeRecommend['#text'] || ''}
                  """

                if @OtherRecommend?
                  $("#OtherRecommend .accordion-inner").html """
                    #{@OtherRecommend.Description || ''}
                  """

    }
    $("#morality-view").removeClass "hide"
  else
    $("#morality-container").html "目前無資料"

# TODO: 缺曠
getAttendance = () ->
  my_schoolYear = global.behavior.schoolYear
  my_semester = global.behavior.semester
  gadget.getContract("ischool.AD.student").send {
    service: "_.GetAttendanceRecord",
    body: """
      <Request>
        <StudentID>#{global.student.StudentID}</StudentID>
        <SchoolYear>#{global.behavior.schoolYear}</SchoolYear>
        <Semester>#{global.behavior.semester}</Semester>
      </Request>
    """
    result: (response, error, xhr) ->
      btn_active = $('.my-schoolyear-semester-widget button.active')
      if btn_active.attr("school-year") is global.behavior.schoolYear and btn_active.attr("semester") is global.behavior.semester
        resetAttendance()
        if error?
          set_error_message('#mainMsg', 'GetAttendanceRecord', error)
        else
          absences_t = {}
          absences_d = []
          if response.Result?.Attendance?
            $(response.Result.Attendance).each () ->
              item = {}
              item['OccurDate'] = @OccurDate
              $(@Detail.Attendance.Period).each () ->
                if not absences_t[@['AbsenceType']]?
                  absences_t[@['AbsenceType']] = {total : 0}
                absences_t[@['AbsenceType']].total += 1

                item[@["@text"]] = @.AbsenceType

              absences_d.push item

          items = []
          _periods = global.periods
          _absence = global.absence
          _period_type = global.period_type

          thead = "<th>日期</th>"
          $(_periods).each ->
            thead += "<th>" + @Name + "</th>"

          thead = "<tr>" + thead + "</tr>"
          tbody = ""
          $(absences_d).each (i, item) ->
            tr = "<td>" + item.OccurDate + "</td>"
            $(_periods).each (j, period) ->
              if _absence[item[period.Name]]
                tr += "<td>" + (_absence[item[period.Name]] || '') + "</td>"
                absences_t[item[period.Name]][period.Type] = 0  unless absences_t[item[period.Name]][period.Type]
                absences_t[item[period.Name]][period.Type] += 1
              else
                tr += "<td></td>"

            tbody += "<tr>" + tr + "</tr>"

          $.each absences_t, (name, item) ->
            items.push """
                <div class='thumbnail my-thumbnail-white'>
                  <div class='caption my-subthumbnail-bottom'>
                    <h5><span class='badge badge-warning'>#{name || ''} #{item.total || ''}</span></h5>
                  </div>
                </div>
            """
            items.push """<table class="table table-bordered my-table"><tr>"""
            $.each item, (typename, value) ->
              if typename isnt "total"
                items.push "<td>#{typename}：#{value}</td>"

            items.push "</tr></table>"

          if items.length is 0
            $("#attendance-container").removeClass("hide").html("目前無資料")
          else
            $("#attendance-view").removeClass "hide"
            $("#attendance .my-thumbnails").html """
              <ul class='thumbnails'>
                #{items.join ""}
              </ul>
            """
            $("#attendance-container").addClass("hide").html """
              <div>
                <table class="table table-striped table-bordered my-table">
                  <thead>#{thead}</thead>
                  <tbody>#{tbody}</tbody>
                </table>
              </div>
            """
  }

# TODO: 獎懲
getDiscipline = () ->
  my_schoolYear = global.behavior.schoolYear
  my_semester = global.behavior.semester
  gadget.getContract("ischool.AD.student").send {
    service: "_.GetDisciplineRecord",
    body: """
      <Request>
        <StudentID>#{global.student.StudentID}</StudentID>
        <SchoolYear>#{global.behavior.schoolYear}</SchoolYear>
        <Semester>#{global.behavior.semester}</Semester>
      </Request>
    """
    result: (response, error, xhr) ->
      btn_active = $('.my-schoolyear-semester-widget button.active')
      if btn_active.attr("school-year") is global.behavior.schoolYear and btn_active.attr("semester") is global.behavior.semester
        resetDiscipline()
        if error?
          set_error_message('#mainMsg', 'GetDisciplineRecord', error)
        else
          items = []
          if response.Result?.Discipline?
            sum_merit = { ma: 0, mb: 0, mc: 0, da: 0, db: 0, dc: 0, dd: 0 }
            $(response.Result.Discipline).each () ->
              merit = { a: 0, b: 0, c: 0 }
              if @MeritFlag is "1"
                sum_merit.ma += merit.a = parseInt(@Detail.Discipline.Merit.A, 10) if not isNaN(parseInt(@Detail.Discipline.Merit.A, 10))
                sum_merit.mb += merit.b = parseInt(@Detail.Discipline.Merit.B, 10) if not isNaN(parseInt(@Detail.Discipline.Merit.B, 10))
                sum_merit.mc += merit.c = parseInt(@Detail.Discipline.Merit.C, 10) if not isNaN(parseInt(@Detail.Discipline.Merit.C, 10))

                items.push """
                  <tr>
                    <td class="my-flags">
                      <span class="badge #{if merit.a isnt 0 then "badge-success" else ""}">#{merit.a}</span>
                      <br />大功
                    </td>
                    <td class="my-flags">
                      <span class="badge #{if merit.b isnt 0 then "badge-success" else ""}">#{merit.b}</span>
                      <br />小功
                    </td>
                    <td class="my-flags">
                      <span class="badge #{if merit.c isnt 0 then "badge-success" else ""}">#{merit.c}</span>
                      <br />嘉獎
                    </td>
                    <td>
                      <span>#{@OccurDate.substr(0, 10)}</span>
                      <br/>
                      <span>#{@Reason || ''}</span>
                    </td>
                  </tr>
                """
              else
                merit.a = parseInt(@Detail.Discipline.Demerit.A, 10) if not isNaN(parseInt(@Detail.Discipline.Demerit.A, 10))
                merit.b = parseInt(@Detail.Discipline.Demerit.B, 10) if not isNaN(parseInt(@Detail.Discipline.Demerit.B, 10))
                merit.c = parseInt(@Detail.Discipline.Demerit.C, 10) if not isNaN(parseInt(@Detail.Discipline.Demerit.C, 10))

                merit_clear = @Detail.Discipline.Demerit.Cleared
                if merit_clear isnt '是'
                  sum_merit.da += merit.a
                  sum_merit.db += merit.b
                  sum_merit.dc += merit.c

                items.push """
                  <tr>
                    <td class="my-flags">
                      <span class="badge #{(if merit.a isnt 0 and merit_clear is "是" then "badge-warning" else (if merit.a isnt 0 then "badge-important" else ""))}">#{merit.a}</span>
                      <br />大過
                    </td>
                    <td class="my-flags">
                      <span class="badge #{(if merit.b isnt 0 and merit_clear is '是' then "badge-warning" else (if merit.b isnt 0 then "badge-important" else ""))}">#{merit.b}</span>
                      <br />小過
                    </td>
                    <td class="my-flags">
                      <span class="badge #{(if merit.c isnt 0 and merit_clear is '是' then "badge-warning" else (if merit.c isnt 0 then "badge-important" else ""))}">#{merit.c}</span>
                      <br />警告
                    </td>
                    <td>
                      #{if @Detail.Discipline.Demerit.Cleared is '是' then "<span class='my-offset'>#{@Detail.Discipline.Demerit.ClearDate.substr(0, 10).replace(/\//ig, "-")} 已銷過<br/>#{@Detail.Discipline.Demerit.ClearReason || ''}</span><br/>" else ""}
                      <span>#{@OccurDate.substr(0, 10)}</span>
                      <br/>
                      <span>#{@Reason || ''}</span>
                    </td>
                  </tr>
                """

            $("#merit-a").html """<span class='badge #{if sum_merit.ma isnt 0 then "badge-success" else ""}'>#{sum_merit.ma}</span>"""
            $("#merit-b").html """<span class='badge #{if sum_merit.mb isnt 0 then "badge-success" else ""}'>#{sum_merit.mb}</span>"""
            $("#merit-c").html """<span class='badge #{if sum_merit.mc isnt 0 then "badge-success" else ""}'>#{sum_merit.mc}</span>"""
            $("#demerit-a").html """<span class='badge #{if sum_merit.da isnt 0 then "badge-important" else ""}'>#{sum_merit.da}</span>"""
            $("#demerit-b").html """<span class='badge #{if sum_merit.db isnt 0 then "badge-important" else ""}'>#{sum_merit.db}</span>"""
            $("#demerit-c").html """<span class='badge #{if sum_merit.dc isnt 0 then "badge-important" else ""}'>#{sum_merit.dc}</span>"""

          if items.join("") is ""
            $("#discipline-container").removeClass("hide").html("目前無資料")
          else
            $("#discipline-view").removeClass "hide"
            $("#discipline .my-thumbnails").removeClass "hide"
            $("#discipline-container").addClass("hide").html """
                        <table class="table table-striped">
                          <tbody>
                            #{items.join("")}
                          </tbody>
                        </table>
            """
  }

# TODO: 錯誤訊息
set_error_message = (select_str, serviceName, error) ->
  tmp_msg = "<i class=\"icon-white icon-info-sign my-err-info\"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(" + serviceName + ")"
  if error isnt null
    if error.dsaError
      if error.dsaError.status is "504"
        switch error.dsaError.message
          when "501"
            tmp_msg = "<strong>很抱歉，您無讀取資料權限！</strong>"
      else tmp_msg = error.dsaError.message  if error.dsaError.message
    else if error.loginError.message
      tmp_msg = error.loginError.message
    else tmp_msg = error.message  if error.message
    $(select_str).html "<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>"
    $(".my-err-info").click ->
      alert "請拍下此圖，並與客服人員連絡，謝謝您。\n" + JSON.stringify(error, null, 2)

(($) ->
  $.by = (model, name, minor) ->
    (o, p) ->
      if o and p and typeof o is "object" and typeof p is "object"
        a = o[name]
        b = p[name]
        return (if typeof minor is "function" then minor(o, p) else 0)  if a is b
        if typeof a is typeof b
          if parseInt(a, 10) and parseInt(b, 10)
            a = parseInt(a, 10)
            b = parseInt(b, 10)
          if model is "desc"
            return (if a > b then -1 else 1)
          else
            return (if a < b then -1 else 1)
        (if typeof a < typeof b then -1 else 1)
      else
        throw
          name: "Error"
          message: "Expected an object when sorting by " + name
) jQuery