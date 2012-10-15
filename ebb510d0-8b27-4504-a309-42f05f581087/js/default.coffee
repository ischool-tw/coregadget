global = {}

jQuery ->
  gadget.autofit document.getElementById "widget"
  gadget.onSizeChanged (size) ->
    $("#behavior").height size.height - 110

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
    getMorality()
    getAttendance()
    getDiscipline()

  $("#behavior .btn-group").on "click", ".btn", (e) ->
    if global.student?
      global.behavior =
        schoolYear: $(@).attr("school-year")
        semester: $(@).attr("semester")
      resetData()
      getMorality()
      getAttendance()

  $("#behavior").hover(
    () -> $(@).css("overflow", "auto")
    ,
    () -> $(@).css("overflow", "hidden")
  )

  $("#discipline a[my-toggle=collapse]").click ->
    $("#collapseD").slideToggle 1000

  gadget.getContract("ischool.AD.parent").send {
    service: "_.GetCurrentSemester",
    body: "",
    result: (response, error, xhr) ->
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetCurrentSemester)
          </div>
        """
      else
        global.schoolYear = response.Current.SchoolYear
        global.semester = response.Current.Semester

        gadget.getContract("ischool.AD.parent").send {
          service: "_.GetStudentInfo",
          body: "",
          result: (response, error, xhr) ->
            if error?
              $("#mainMsg").html """
                <div class='alert alert-error'>
                  <button class='close' data-dismiss='alert'>×</button>
                  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetStudentInfo)
                </div>
              """
            else
              if response.Result?.Student?
                resetData()

                global.students = $(response.Result.Student)
                items = []
                global.students.each (index, student) ->
                  items.push """
                    <li #{if index is 0 then " class='active'" else ''}>
                      <a href='#' children-index='#{index}'>#{@StudentName}</a>
                    </li>
                  """

                $("#children-list").html(items.join("")).find('a:first').trigger('click')
        }
  }

# TODO: 學年度學期
resetSchoolYearSeme = () ->
  student = global.student
  items = []
  if student.SemsHistory?
    $(student.SemsHistory).each (index, item) ->
      if item.History?
        $(item.History).each (e) ->
          unless @.SchoolYear is global.schoolYear and @.Semester is global.semester
            items.push """
              <button class='btn btn-large' school-year='#{@.SchoolYear}' semester='#{@.Semester}'>#{@.SchoolYear + '' + @.Semester}</button>
            """

    items.push """
      <button class='btn btn-large active' school-year='#{global.schoolYear}' semester='#{global.semester}'>#{global.schoolYear + '' + global.semester}</button>
    """
    $("#behavior .btn-group").html(items.reverse().join(""))

# TODO: 清除資料
resetData = () ->
  $("#behavior #morality tbody").html ""
  $("#behavior #attendance .my-content").html ""

# TODO: 德性成績
getMorality = () ->
  gadget.getContract("ischool.AD.parent").send {
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
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetMoralScore)
          </div>
        """
      else
        items = []
        if response.Result?.SbComment?
          items.push """
            <tr>
              <th><span>導師評語</span></th>
              <td><span>#{@response.Result.SbComment}</span></td>
            </tr>
          """

        if response.Result?.DailyLifeScore?.Content?.Morality?
          $(response.Result.DailyLifeScore.Content.Morality).each () ->
            items.push """
              <tr>
                <th><span>#{@Face}</span></th>
                <td><span>#{@['@text']}</span></td>
              </tr>
            """

            $("#behavior #morality tbody").html items.join ""
            $("#behavior #morality h2").html "德行"
        else
          $("#behavior #morality tbody").html "<tr><td>目前無資料</td></tr>"

  }

# TODO: 缺曠
getAttendance = () ->
  gadget.getContract("ischool.AD.parent").send {
    service: "_.GetAttendanceRecord",
    body: """
      <Request>
        <StudentID>#{global.student.StudentID}</StudentID>
        <SchoolYear>#{global.behavior.schoolYear}</SchoolYear>
        <Semester>#{global.behavior.semester}</Semester>
      </Request>
    """
    result: (response, error, xhr) ->
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetAttendanceRecord)
          </div>
        """
      else
        absences = {}
        if response.Result?.Attendance?
          $(response.Result.Attendance).each () ->
            $(@Detail.Attendance.Period).each () ->
              if not absences[@['AbsenceType']]?
                absences[@['AbsenceType']] = 0
              absences[@['AbsenceType']] += 1

        items = []
        for name of absences
          items.push """
            <li class='span2'>
              <div class='thumbnail my-thumbnail-white'>
                <div class='my-subthumbnail-top'>
                  <span class='badge badge-warning'>#{absences[name]}</span>
                </div>
                <div class='caption my-subthumbnail-bottom'>
                  <h5>#{name}</h5>
                </div>
              </div>
            </li>
          """

        if items.join("") is ""
          $("#behavior #attendance .my-content").html "目前無資料"
        else
          $("#behavior #attendance .my-content").html """
            <ul class='thumbnails'>
              #{items.join ""}
            </ul>
          """

  }

# TODO: 獎懲
getDiscipline = () ->
  gadget.getContract("ischool.AD.parent").send {
    service: "_.GetDisciplineRecord",
    body: """
      <Request>
        <StudentID>#{global.student.StudentID}</StudentID>
      </Request>
    """
    result: (response, error, xhr) ->
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetDisciplineRecord)
          </div>
        """
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
                    <span>#{@Reason}</span>
                  </td>
                </tr>
              """
            else if @MeritFlag is "2"
              sum_merit.dd += 1

              items.push """
                <tr>
                  <td colspan="3" class="my-detention">留校察看</td>
                  <td class="my-detention-text">
                    <span>#{@OccurDate.substr(0, 10)}</span>
                    <br/>
                    <span>#{@Reason}</span>
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
                    #{if @Detail.Discipline.Demerit.Cleared is '是' then "<span class='my-offset'>#{@Detail.Discipline.Demerit.ClearDate.substr(0, 10).replace(/\//ig, "-")} 已銷過<br/>#{@Detail.Discipline.Demerit.ClearReason}</span><br/>" else ""}
                    <span>#{@OccurDate.substr(0, 10)}</span>
                    <br/>
                    <span>#{@Reason}</span>
                  </td>
                </tr>
              """

          $("#merit-a").html """<span class='badge #{if sum_merit.ma isnt 0 then "badge-success" else ""}'>#{sum_merit.ma}</span>"""
          $("#merit-b").html """<span class='badge #{if sum_merit.mb isnt 0 then "badge-success" else ""}'>#{sum_merit.mb}</span>"""
          $("#merit-c").html """<span class='badge #{if sum_merit.mc isnt 0 then "badge-success" else ""}'>#{sum_merit.mc}</span>"""
          $("#demerit-a").html """<span class='badge #{if sum_merit.da isnt 0 then "badge-important" else ""}'>#{sum_merit.da}</span>"""
          $("#demerit-b").html """<span class='badge #{if sum_merit.db isnt 0 then "badge-important" else ""}'>#{sum_merit.db}</span>"""
          $("#demerit-c").html """<span class='badge #{if sum_merit.dc isnt 0 then "badge-important" else ""}'>#{sum_merit.dc}</span>"""

          if sum_merit.dd > 0
            $("#demerit-d").html """
              <li class="span12">
                <div class="thumbnail my-thumbnail-white">
                  <div class="caption my-surveillance">
                    <h5>留校察看</h5>
                  </div>
                </div>
              </li>
            """

          $("#view-discipline").removeClass "hide"
          $("#discipline tbody").html items.join("")
  }
