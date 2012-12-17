global = {}

jQuery ->
  gadget.autofit document.getElementById "widget"


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
    # $("#morality-container").slideToggle 500
    $("#morality-container").toggleClass "hide"
    return false

  $("#attendance a[my-toggle=collapse]").click ->
    # $("#attendance-container").slideToggle 500
    $("#attendance-container").toggleClass "hide"
    return false

  $("#discipline a[my-toggle=collapse]").click ->
    # $("#discipline-container").slideToggle 500
    $("#discipline-container").toggleClass "hide"
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
                    getDiscipline()

                    ### 下載上課時間表 ###
                    gadget.getContract("ischool.AD.student").send {
                      service: "_.GetPeriodMappingTable",
                      body: ""
                      result: (response, error, xhr) ->
                        if error?
                          $("#mainMsg").html """
                            <div class='alert alert-error'>
                              <button class='close' data-dismiss='alert'>×</button>
                              <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetPeriodMappingTable)
                            </div>
                          """
                        else
                          global.periods = []
                          global.absence = {}
                          if response.Response?.Period?
                            $(response.Response.Period).each (index, item) ->
                              global.periods.push item

                            ### 下載缺曠類別表 ###
                            gadget.getContract("ischool.AD.student").send {
                                service: "_.GetAbsenceMappingTable",
                                body: ""
                                result: (response, error, xhr) ->
                                  if error?
                                    $("#mainMsg").html """
                                      <div class='alert alert-error'>
                                        <button class='close' data-dismiss='alert'>×</button>
                                        <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetAbsenceMappingTable)
                                      </div>
                                    """
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
                          $("#mainMsg").html """
                            <div class='alert alert-error'>
                              <button class='close' data-dismiss='alert'>×</button>
                              <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetList_DLBehaviorConfig)
                            </div>
                          """
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
  $("#morality-view").addClass "hide"
  $("#attendance .my-thumbnails").html ""
  $("#attendance-container").addClass("hide").html("")
  $("#attendance-view").addClass "hide"
  $("#discipline .my-thumbnails").addClass "hide"
  $("#discipline-container").addClass("hide").html("")
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

    gadget.getContract("ischool.AD.student").send {
      service: "_.GetAssociation",
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
              <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetAssociation)
            </div>
          """
        else
          _association = {}
          if response.Response?.Score
            $(response.Response.Score).each (index, item) ->
              _association = item

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

                  items.push """
                      <div class="accordion-group">
                        <div class="accordion-heading">
                          <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#GroupActivity">
                            #{@GroupActivity?.Name || '團體活動表現'}
                          </a>
                        </div>
                        <div id="GroupActivity" class="accordion-body collapse">
                          <div class="accordion-inner">
                            <table class="table table-striped">
                              <tbody>
                  """
                  if @GroupActivity?
                    $(@GroupActivity.Item).each () ->
                      items.push """
                        <tr>
                          <th><span>#{@Name || ''}</span></th>
                          <td><span data-type="GA_Degree_#{@Name || ''}"></span></td>
                          <td><span data-type="GA_Description_#{@Name || ''}"></span></td>
                        </tr>
                      """
                  items.push """
                                <tr>
                                  <th><span>社團活動</span></th>
                                  <td><span>#{_association.Effort || ''}</span></td>
                                  <td><span>#{_association.Text || ''}</span></td>
                                </tr>
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
                              #{@PublicService.Name || '公共服務表現'}
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
                          <th><span>#{@Name || ''}</span></th>
                          <td><span data-type="PS_Description_#{@Name || ''}"></span></td>
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
                              #{@SchoolSpecial.Name || '校內外特殊表現'}
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
                          <th><span>#{@Name || ''}</span></th>
                          <td><span data-type="SS_Description_#{@Name || ''}"></span></td>
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

                $("#behavior #morality #morality-container").html items.join ""
                $('#behavior #morality table').find('tr:first td, tr:first th').css("border-top-color", "transparent")

                if response.Result.DailyLifeScore?.TextScore?
                  $(response.Result.DailyLifeScore.TextScore).each () ->
                    if @DailyBehavior?
                      $(@DailyBehavior.Item).each () ->
                        $("#DailyBehavior td span[data-type=DB_Degree_#{@Name || ''}]").html @Degree || ''

                    if @GroupActivity?
                      $(@GroupActivity.Item).each () ->
                        $("#GroupActivity td span[data-type=GA_Degree_#{@Name || ''}]").html @Degree || ''
                        $("#GroupActivity td span[data-type=GA_Description_#{@Name || ''}]").html @Description || ''

                    if @PublicService?
                      $(@PublicService.Item).each () ->
                        $("#PublicService td span[data-type=PS_Description_#{@Name || ''}]").html @Description || ''

                    if @SchoolSpecial?
                      $(@SchoolSpecial.Item).each () ->
                        $("#SchoolSpecial td span[data-type=SS_Description_#{@Name || ''}]").html @Description || ''

                    if @DailyLifeRecommend?
                      $("#DailyLifeRecommend .accordion-inner").html """
                        #{@DailyLifeRecommend.Description || ''}
                      """
          }
    }
    $("#morality-view").removeClass "hide"
  else
    $("#morality-container").html "目前無資料"

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
        absences_t = {}
        absences_d = []
        if response.Result?.Attendance?
          $(response.Result.Attendance).each () ->
            item = {}
            item['OccurDate'] = @OccurDate
            $(@Detail.Attendance.Period).each () ->
              if not absences_t[@['AbsenceType']]?
                absences_t[@['AbsenceType']] = 0
              absences_t[@['AbsenceType']] += 1

              item[@["@text"]] = @.AbsenceType

            absences_d.push item

        items = []
        for name of absences_t
            items.push """
              <li class='span2'>
                <div class='thumbnail my-thumbnail-white'>
                  <div class='my-subthumbnail-top'>
                    <span class='badge badge-warning'>#{absences_t[name] || ''}</span>
                  </div>
                  <div class='caption my-subthumbnail-bottom'>
                    <h5>#{name || ''}</h5>
                  </div>
                </div>
              </li>
            """

        _periods = global.periods
        _absence = global.absence

        thead = "<th>日期</th>"
        $(_periods).each ->
          thead += "<th>" + @Name + "</th>"

        thead = "<tr>" + thead + "</tr>"
        tbody = ""
        $(absences_d).each (i, item) ->
          tr = "<td>" + item.OccurDate + "</td>"
          $(_periods).each (j, period) ->
            tr += "<td>" + (_absence[item[period.Name]] || '') + "</td>"

          tbody += "<tr>" + tr + "</tr>"


        if items.join("") is ""
          $("#attendance-container").removeClass("hide").html("目前無資料")
        else
          $("#attendance-view").removeClass "hide"
          $("#attendance .my-thumbnails").html """
            <ul class='thumbnails'>
              #{items.join ""}
            </ul>
          """
          $("#attendance-container").html """
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
          $("#discipline-container").html """
                      <table class="table table-striped">
                        <tbody>
                          #{items.join("")}
                        </tbody>
                      </table>
          """
  }

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