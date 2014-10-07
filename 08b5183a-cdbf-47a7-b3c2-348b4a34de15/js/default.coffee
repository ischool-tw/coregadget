global = {}
global.system_position = gadget.params.system_position || "student"
global.connection = (if (global.system_position is "student") then gadget.getContract("ischool.AD.student") else gadget.getContract("ischool.AD.parent"))

jQuery ->
  init()

  gadget.autofit document.getElementById "widget"

  # 選擇子女
  $("#children-list").on "click", "a", (e) ->
    $('#children-list li[class=active]').removeClass 'active'
    $(@).parent().addClass 'active'
    global.student = global.students[$(@).attr("children-index")]
    global.behavior =
      schoolYear: global.schoolYear
      semester: global.semester
    $("#behavior #discipline tbody").html ""
    resetSchoolYearSeme()
    resetData()

  # 選擇學年度學期
  $("#behavior .btn-group").on "click", ".btn", (e) ->
    if global.student?
      global.behavior =
        schoolYear: $(@).attr("school-year")
        semester: $(@).attr("semester")
      resetData()

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


# 初始化
init = () ->
  bCurrentSemester = false
  bStudentInfo = false
  bPeriodMappingTable = false
  bAbsenceMappingTable = false
  bDLBehaviorConfig = false
  if global.system_position isnt "parent" then $("#children-list").closest('.row-fluid').remove()

  runFirstStudent = () ->
    if bCurrentSemester && bStudentInfo && bPeriodMappingTable && bAbsenceMappingTable && bDLBehaviorConfig
      if global.system_position is "parent"
        $("#children-list").find('a:first').trigger('click')
      else
        global.student = global.students[0]
        global.behavior =
          schoolYear: global.schoolYear
          semester: global.semester
        resetSchoolYearSeme()
        resetData()


  # 目前學年度學期
  global.connection.send {
    service: "_.GetCurrentSemester",
    body: "",
    result: (response, error, xhr) ->
      if error?
        set_error_message('#mainMsg', 'GetCurrentSemester', error)
      else
        global.schoolYear = response.Current.SchoolYear
        global.semester = response.Current.Semester
        bCurrentSemester = true
        runFirstStudent()
  }

  # 學生清單
  global.connection.send {
    service: "_.GetStudentInfo",
    body: "",
    result: (response, error, xhr) ->
      if error?
        set_error_message('#mainMsg', 'GetStudentInfo', error)
      else
        items = []
        if response.Result?.Student?
          global.students = $(response.Result.Student)
          global.students.each (index, student) ->
            student.SemsHistory.History = myHandleArray(student.SemsHistory.History)
            items.push """
              <li #{if index is 0 then " class='active'" else ''}>
                <a href='#' children-index='#{index}'>#{@StudentName}</a>
              </li>
            """
          $("#children-list").html items.join("")
          bStudentInfo = true
          runFirstStudent()
  }

  # 下載上課時間表
  global.connection.send {
    service: "_.GetPeriodMappingTable",
    body: ""
    result: (response, error, xhr) ->
      if error?
        set_error_message('#mainMsg', 'GetPeriodMappingTable', error)
      else
        global.periods = []
        global.period_type = {}
        if response.Response?.Period?
          $(response.Response.Period).each (index, item) ->
            global.periods.push item
            global.period_type[item.Type] = 0  unless global.period_type[item.Type]

          bPeriodMappingTable = true
          runFirstStudent()
  }

  # 下載缺曠類別表
  global.connection.send {
    service: "_.GetAbsenceMappingTable",
    body: ""
    result: (response, error, xhr) ->
      if error?
        set_error_message('#mainMsg', 'GetAbsenceMappingTable', error)
      else
        global.absence = {}
        if response.Response?.Absence?
          $(response.Response.Absence).each (index, item) ->
            global.absence[item.Name] = item.Abbreviation

          bAbsenceMappingTable = true
          runFirstStudent()
  }

  # 日常行為表現表
  global.connection.send {
    service: "_.GetList",
    body: "<Request><Name>DLBehaviorConfig</Name></Request>",
    result: (response, error, xhr) ->
      if error?
        set_error_message('#mainMsg', 'GetList_DLBehaviorConfig', error)
      else
        global.morality = response
        bDLBehaviorConfig = true
        runFirstStudent()
  }

# 用來處理 DSA 回傳的資料：因為當 DSA 只回傳一筆時為單一物件，沒有資料時為 undefined, 多筆時為 array
# 所以透過此函數要全部轉換成 array
myHandleArray = (obj) ->
  # 只回傳一筆時為單一物件，沒有資料時為 undefined, 多筆時為 array
  if !$.isArray(obj)
    result = [];
    if (obj)
      result.push(obj)
  else
    result = obj
  return result

# 顯示學年度學期
resetSchoolYearSeme = () ->
  student = global.student
  items = []
  items.push """
    <button class='btn btn-large active' school-year='#{global.schoolYear}' semester='#{global.semester}'>
      #{global.schoolYear + '' + global.semester}
    </button>
  """
  if student.SemsHistory?.History?
    $(student.SemsHistory.History.sort $.by("desc", "SchoolYear", $.by("desc", "Semester"))).each (index, item) ->
      unless @.SchoolYear is global.schoolYear and @.Semester is global.semester
        items.push """
          <button class='btn btn-large' school-year='#{@.SchoolYear}' semester='#{@.Semester}'>#{@.SchoolYear + '' + @.Semester}</button>
        """

  $("#behavior .btn-group").html(items.join(""))

# 清除德性成績
resetMorality = () ->
  $("#morality-container").removeClass("hide").html ""
  $("#morality span[data-collapse] i").addClass("icon-chevron-down").removeClass("icon-chevron-up")
  $("#morality-view").addClass "hide"

# 清除缺曠
resetAttendance = () ->
  $("#attendance h2 span").html ""
  $("#attendance .my-thumbnails").html ""
  $("#attendance-container").addClass("hide").html("")
  $("#attendance span[data-collapse] i").addClass("icon-chevron-up").removeClass("icon-chevron-down")
  $("#attendance-view").addClass "hide"
  $("#attendance-note").addClass "hide"

# 清除獎懲
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
  $("#merit-a-detail").addClass("hide").html("")
  $("#merit-b-detail").addClass("hide").html("")
  $("#merit-c-detail").addClass("hide").html("")
  $("#demerit-a-detail").addClass("hide").html("")
  $("#demerit-b-detail").addClass("hide").html("")
  $("#demerit-c-detail").addClass("hide").html("")
  $("#discipline-note").addClass "hide"

# 清除資料
resetData = () ->
  resetMorality()
  resetAttendance()
  resetDiscipline()
  getMoralScore()


# 取得德性成績/非明細資料
getMoralScore = () ->
  global.moralScore = {}
  global.connection.send {
    service: "_.GetMoralScore",
    body: """
      <Request>
        <StudentID>#{global.student.StudentID}</StudentID>
        <SchoolYear>#{global.behavior.schoolYear}</SchoolYear>
        <Semester>#{global.behavior.semester}</Semester>
      </Request>
    """,
    result: (response, error, xhr) ->
      if error?
        set_error_message('#mainMsg', 'GetMoralScore', error)
      else
        if response.Result?
          global.moralScore = response.Result

        getMorality()
        getAttendance()
        getDiscipline()
  }


# 德性成績
getMorality = () ->
  if global.morality?.Response?
        my_schoolYear = global.behavior.schoolYear
        my_semester = global.behavior.semester

        btn_active = $('.my-schoolyear-semester-widget button.active')
        if btn_active.attr("school-year") is global.behavior.schoolYear and btn_active.attr("semester") is global.behavior.semester
            # 重設資料
            resetMorality()

            items = []
            # 整理資料
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

            # 呈現資料
            $("#behavior #morality #morality-container").html items.join ""
            $('#behavior #morality table').find('tr:first td, tr:first th').css("border-top-color", "transparent")

            if global.moralScore?.DailyLifeScore?.TextScore?
              $(global.moralScore.DailyLifeScore.TextScore).each () ->
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


          $("#morality-view").removeClass "hide"
  else
    $("#morality-container").html "目前無資料"

# 缺曠
getAttendance = () ->
  my_schoolYear = global.behavior.schoolYear
  my_semester = global.behavior.semester
  global.connection.send {
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
      if btn_active.attr("school-year") is my_schoolYear and btn_active.attr("semester") is my_semester
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
            isLeave = false
            td = ''
            $(_periods).each (j, period) ->
              if _absence[item[period.Name]]
                isLeave = true
                td += "<td>" + (_absence[item[period.Name]] || '') + "</td>"
                absences_t[item[period.Name]] = {total : 0} unless absences_t[item[period.Name]]
                absences_t[item[period.Name]].total += 1
                absences_t[item[period.Name]][period.Type] = 0  unless absences_t[item[period.Name]][period.Type]
                absences_t[item[period.Name]][period.Type] += 1
              else
                td += "<td></td>"

            if isLeave then tbody += "<tr><td>" + item.OccurDate + "</td>" + td + "</tr>"

          # 非明細
          have_none = false
          if global.moralScore?.InitialSummary?.AttendanceStatistics?.Absence?
            $(global.moralScore.InitialSummary.AttendanceStatistics.Absence).each (index, item) ->
              if item.Count then have_none = true
              absences_t[item.Name] = {total : 0}  unless absences_t[item.Name]
              absences_t[item.Name].total += parseInt(item.Count, 10)
              absences_t[item.Name]['非明細' + item.PeriodType] = 0  unless absences_t[item.Name]['非明細' + item.PeriodType]
              absences_t[item.Name]['非明細' + item.PeriodType] += parseInt(item.Count, 10)

          # 合計
          ii = 0
          $.each absences_t, (name, item) ->
            if ii % 6 is 0 then items.push """<div class="row-fluid my-thumbnail-style">"""
            items.push """
              <div class="span2">
                <div class="thumbnail my-thumbnail-white">
                  <div class="my-subthumbnail-top"><span class="badge badge-warning">#{item.total || ''}</span></div>
                  <div class="caption my-subthumbnail-bottom">
                    <h5>#{name || ''}</h5>
                  </div>
                  <div class="my-subthumbnail-detail">
            """

            $.each item, (typename, value) ->
              if typename isnt "total" then items.push """<div>#{typename}：#{value}</div>"""

            items.push """
                  </div>
                </div>
              </div>
            """
            if ii % 6 is 5 then items.push """</div>"""
            ii += 1
          if ii % 6 isnt 0 then items.push """</div>"""

          if items.length is 0
            $("#attendance-container").removeClass("hide").html("目前無資料")
          else
            if have_none is true then $("#attendance-note").removeClass "hide"
            $("#attendance-view").removeClass "hide"
            $("#attendance .my-thumbnails").html """
              #{items.join ""}
            """
            # console.log items.join ""
            $("#attendance-container").addClass("hide").html """
              <div>
                <table class="table table-striped table-bordered my-table">
                  <thead>#{thead}</thead>
                  <tbody>#{tbody}</tbody>
                </table>
              </div>
            """
  }

# 獎懲
getDiscipline = () ->
  my_schoolYear = global.behavior.schoolYear
  my_semester = global.behavior.semester
  global.connection.send {
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
          sum_merit = { ma: 0, mb: 0, mc: 0, da: 0, db: 0, dc: 0, dd: 0 }
          sum_none_merit = { ma: 0, mb: 0, mc: 0, da: 0, db: 0, dc: 0, dd: 0 }
          have_none = false

          if response.Result?.Discipline?
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
                      <span>#{@Reason ? ''}</span>
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
                      #{if @Detail.Discipline.Demerit.Cleared is '是' then "<span class='my-offset'>#{@Detail.Discipline.Demerit.ClearDate.substr(0, 10).replace(/\//ig, "-")} 已銷過<br/>#{@Detail.Discipline.Demerit.ClearReason ? ''}</span><br/>" else ""}
                      <span>#{@OccurDate.substr(0, 10)}</span>
                      <br/>
                      <span>#{@Reason ? ''}</span>
                    </td>
                  </tr>
                """



          # 非明細
          if global.moralScore?.InitialSummary?.DisciplineStatistics?
            disciplineStatistics = global.moralScore.InitialSummary.DisciplineStatistics
            if disciplineStatistics.Merit?.A?
              sum_none_merit.ma += parseInt(disciplineStatistics.Merit.A, 10)
              have_none = true
            if disciplineStatistics.Merit?.B?
              sum_none_merit.mb += parseInt(disciplineStatistics.Merit.B, 10)
              have_none = true
            if disciplineStatistics.Merit?.C?
              sum_none_merit.mc += parseInt(disciplineStatistics.Merit.C, 10)
              have_none = true
            if disciplineStatistics.Demerit?.A?
              sum_none_merit.da += parseInt(disciplineStatistics.Demerit.A, 10)
              have_none = true
            if disciplineStatistics.Demerit?.B?
              sum_none_merit.db += parseInt(disciplineStatistics.Demerit.B, 10)
              have_none = true
            if disciplineStatistics.Demerit?.C?
              sum_none_merit.dc += parseInt(disciplineStatistics.Demerit.C, 10)
              have_none = true


          # 加總
          sum_total =
            ma: sum_merit.ma + sum_none_merit.ma
            mb: sum_merit.mb + sum_none_merit.mb
            mc: sum_merit.mc + sum_none_merit.mc
            da: sum_merit.da + sum_none_merit.da
            db: sum_merit.db + sum_none_merit.db
            dc: sum_merit.dc + sum_none_merit.dc
            dd: sum_merit.dd + sum_none_merit.dd


          $("#merit-a").html """<span class='badge #{if sum_total.ma isnt 0 then "badge-success" else ""}'>#{sum_total.ma}</span>"""
          $("#merit-b").html """<span class='badge #{if sum_total.mb isnt 0 then "badge-success" else ""}'>#{sum_total.mb}</span>"""
          $("#merit-c").html """<span class='badge #{if sum_total.mc isnt 0 then "badge-success" else ""}'>#{sum_total.mc}</span>"""
          $("#demerit-a").html """<span class='badge #{if sum_total.da isnt 0 then "badge-important" else ""}'>#{sum_total.da}</span>"""
          $("#demerit-b").html """<span class='badge #{if sum_total.db isnt 0 then "badge-important" else ""}'>#{sum_total.db}</span>"""
          $("#demerit-c").html """<span class='badge #{if sum_total.dc isnt 0 then "badge-important" else ""}'>#{sum_total.dc}</span>"""

          if have_none is true
            $("#merit-a-detail").removeClass("hide").html "<div>一般：#{sum_merit.ma}</div><div>非明細：#{sum_none_merit.ma}</div>"
            $("#merit-b-detail").removeClass("hide").html "<div>一般：#{sum_merit.mb}</div><div>非明細：#{sum_none_merit.mb}</div>"
            $("#merit-c-detail").removeClass("hide").html "<div>一般：#{sum_merit.mc}</div><div>非明細：#{sum_none_merit.mc}</div>"
            $("#demerit-a-detail").removeClass("hide").html "<div>一般：#{sum_merit.da}</div><div>非明細：#{sum_none_merit.da}</div>"
            $("#demerit-b-detail").removeClass("hide").html "<div>一般：#{sum_merit.db}</div><div>非明細：#{sum_none_merit.db}</div>"
            $("#demerit-c-detail").removeClass("hide").html "<div>一般：#{sum_merit.dc}</div><div>非明細：#{sum_none_merit.dc}</div>"
            $("#discipline-note").removeClass "hide"

          if items.join("") is "" and have_none is false
            $("#discipline-container").removeClass("hide").html("目前無資料")
          else
            if have_none is true
              $("#discipline .my-thumbnails").removeClass "hide"
            else
              $("#discipline-view").removeClass "hide"
              $("#discipline .my-thumbnails").removeClass "hide"
              $("#discipline-container").html """
                <table class="table table-striped">
                  <tbody>
                    #{items.join("")}
                  </tbody>
                </table>
            """
  }

# 錯誤訊息
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

# 排序
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