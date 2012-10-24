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

  $("#discipline a[my-toggle=collapse]").click ->
    $("#collapseD").slideToggle 500
    return false

  gadget.getContract("ischool.AD.student").send {
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

        gadget.getContract("ischool.AD.student").send {
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

                global.students.each (index, student) ->
                  if index is 0
                    global.student = student
                    global.behavior =
                        schoolYear: global.schoolYear
                        semester: global.semester
                    resetSchoolYearSeme()
                    resetData()
                    getMorality()
                    getAttendance()
                    getDiscipline()
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
  $("#behavior #discipline tbody").html ""
  $("#merit-a").html "<span class='badge'>0</span>"
  $("#merit-b").html "<span class='badge'>0</span>"
  $("#merit-c").html "<span class='badge'>0</span>"
  $("#demerit-a").html "<span class='badge'>0</span>"
  $("#demerit-b").html "<span class='badge'>0</span>"
  $("#demerit-c").html "<span class='badge'>0</span>"
  $("#discipline-view").addClass "hide"

# TODO: 德性成績
getMorality = () ->
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
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetMoralScore)
          </div>
        """
      else
        items = []
        if response.Result.DailyLifeScore?.TextScore?
          $(response.Result.DailyLifeScore.TextScore).each () ->
            if @DailyBehavior?
              items.push """
                  <div class="accordion-group">
                    <div class="accordion-heading">
                      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#DailyBehavior">
                        #{@DailyBehavior.Name ? '日常行為表現'}
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
                    <th><span>#{@Name ? ''}</span></th>
                    <td><span>#{@Index ? ''}</span></td>
                    <td><span>#{@Degree ? ''}</span></td>
                  </tr>
                """
              items.push """
                          </tbody>
                        </table>
                      </div>
                    </div>
                </div>
              """

            if @GroupActivity?
              items.push """
                  <div class="accordion-group">
                    <div class="accordion-heading">
                      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#GroupActivity">
                        #{@GroupActivity.Name ? '團體活動表現'}
                      </a>
                    </div>
                    <div id="GroupActivity" class="accordion-body collapse">
                      <div class="accordion-inner">
                        <table class="table table-striped">
                          <tbody>
              """
              $(@GroupActivity.Item).each () ->
                items.push """
                  <tr>
                    <th><span>#{@Name ? ''}</span></th>
                    <td><span>#{@Degree ? ''}</span></td>
                    <td><span>#{@Description ? ''}</span></td>
                  </tr>
                """
              items.push """
                          </tbody>
                        </table>
                      </div>
                    </div>
                </div>
              """

            if @PublicService?
              items.push """
                  <div class="accordion-group">
                    <div class="accordion-heading">
                      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#PublicService">
                        #{@PublicService.Name ? '公共服務表現'}
                      </a>
                    </div>
                    <div id="PublicService" class="accordion-body collapse">
                      <div class="accordion-inner">
                        <table class="table table-striped">
                          <tbody>
              """
              $(@PublicService.Item).each () ->
                items.push """
                  <tr>
                    <th><span>#{@Name ? ''}</span></th>
                    <td><span>#{@Description ? ''}</span></td>
                  </tr>
                """
              items.push """
                          </tbody>
                        </table>
                      </div>
                    </div>
                </div>
              """

            if @SchoolSpecial?
              items.push """
                  <div class="accordion-group">
                    <div class="accordion-heading">
                      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#SchoolSpecial">
                        #{@SchoolSpecial.Name ? '校內外特殊表現'}
                      </a>
                    </div>
                    <div id="SchoolSpecial" class="accordion-body collapse">
                      <div class="accordion-inner">
                        <table class="table table-striped">
                          <tbody>
              """
              $(@SchoolSpecial.Item).each () ->
                items.push """
                  <tr>
                    <th><span>#{@Name ? ''}</span></th>
                    <td><span>#{@Description ? ''}</span></td>
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
                      #{@DailyLifeRecommend.Name ? '日常生活表現具體建議'}
                    </a>
                  </div>
                  <div id="DailyLifeRecommend" class="accordion-body collapse">
                    <div class="accordion-inner">
                      #{@DailyLifeRecommend.Description ? @DailyLifeRecommend['#text']}
                    </div>
                  </div>
                </div>
              """

            if @OtherRecommend?
              items.push """
                <div class="accordion-group">
                  <div class="accordion-heading">
                    <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#OtherRecommend">
                      #{@OtherRecommend.Name ? '其他具體建議'}
                    </a>
                  </div>
                  <div id="OtherRecommend" class="accordion-body collapse">
                    <div class="accordion-inner">
                      #{@OtherRecommend['#text'] ? ''}
                    </div>
                  </div>
                </div>
              """


          if items.join("") is ""
            $("#behavior #morality #accordion-m").html "目前無資料"
          else
            $("#behavior #morality #accordion-m").html items.join ""
            $("#behavior #morality h2").html "日常生活表現"
            $('#behavior #morality table').find('tr:first td, tr:first th').css("border-top-color", "transparent")
        else
          $("#behavior #morality #accordion-m").html "目前無資料"
  }

# TODO: 缺曠
getAttendance = () ->
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
                  <span class='badge badge-warning'>#{absences[name] ? ''}</span>
                </div>
                <div class='caption my-subthumbnail-bottom'>
                  <h5>#{name ? ''}</h5>
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

          $("#merit-a").html """<span class='badge #{if sum_merit.ma isnt 0 then "badge-success" else ""}'>#{sum_merit.ma}</span>"""
          $("#merit-b").html """<span class='badge #{if sum_merit.mb isnt 0 then "badge-success" else ""}'>#{sum_merit.mb}</span>"""
          $("#merit-c").html """<span class='badge #{if sum_merit.mc isnt 0 then "badge-success" else ""}'>#{sum_merit.mc}</span>"""
          $("#demerit-a").html """<span class='badge #{if sum_merit.da isnt 0 then "badge-important" else ""}'>#{sum_merit.da}</span>"""
          $("#demerit-b").html """<span class='badge #{if sum_merit.db isnt 0 then "badge-important" else ""}'>#{sum_merit.db}</span>"""
          $("#demerit-c").html """<span class='badge #{if sum_merit.dc isnt 0 then "badge-important" else ""}'>#{sum_merit.dc}</span>"""

          $("#discipline-view").removeClass "hide"
          $("#behavior #discipline tbody").html items.join("")
  }
