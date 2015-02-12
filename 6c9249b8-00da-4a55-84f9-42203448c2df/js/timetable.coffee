$(document).ready ->
  TimeTable.on_init()
  $("#timeTable").find("thead").html("").end().find("tbody").html "<tr><td>載入中...</td></tr>"
  $("#keyword").focus ->
    $("#search").html "搜尋"


  # 搜尋、取消搜尋
  search_btn = ->
    $("#search").html ->
      if $("#search").html() is "搜尋"
        if $("#keyword").val()
          TimeTable.on_search $("#keyword").val()
          return """<i class="icon-remove"></i> 取消搜尋"""
      else
        $("#keyword").val ""
        TimeTable.on_runMydata()
        return "搜尋"

  # 關鍵字
  $("#keyword").keypress (event) ->
    keycode = ((if event.keyCode then event.keyCode else event.which))
    search_btn()  if $("#keyword").val()  if keycode is "13"

  # 搜尋鈕
  $("#search").click ->
    search_btn()

  # 列印鈕
  $("#print").click ->
    TimeTable.printScheduler()

  # 左方選單
  $("#menu1").on "click", "li", ->
    pre_schoolyear = $("#tabName").attr("data-schoolyear")
    pre_semester = $("#tabName").attr("data-semester")
    new_schoolyear = $(this).find("a").attr("schoolyear")
    new_semester = $(this).find("a").attr("semester")
    if pre_schoolyear isnt new_schoolyear or pre_semester isnt new_semester
      $("#tabName").attr("data-schoolyear", new_schoolyear).attr("data-semester", new_semester).html $(this).find("a").html()
      $("#menu1 li.active").removeClass "active"
      $(this).addClass "active"
      new_kind = $("#menu2 li.active a").attr("kind")
      new_kid = $("#menu2 li.active a").attr("kid")
      request =
        SchoolYear: new_schoolyear
        Semester: new_semester
        kind: new_kind
        kid: new_kid

      TimeTable.getScheduler request
      TimeTable.getClassBusy new_kid  if new_kind is "class"

  # 姓名、場地、班級的下拉選單
  $("#menu2").on "click", "li", ->
    pre_kind = $("#tabSearch").attr("data-kind")
    pre_kid = $("#tabSearch").attr("data-kid")
    new_kind = $(this).find("a").attr("kind")
    new_kid = $(this).find("a").attr("kid")
    if pre_kind isnt new_kind or pre_kid isnt new_kid
      $("#timeTable td[rel=tooltip]").tooltip "hide"
      $("#timeTable").find("thead").html("").end().find("tbody").html "<tr><td>載入中...</td></tr>"
      $("#tabSearch").attr("data-kind", new_kind).attr("data-kid", new_kid).html $(this).find("a").html()
      $("#tabName").attr("data-schoolyear", "").attr("data-semester", "").html ""
      $("#menu2 li.active").removeClass "active"
      $(this).addClass "active"

      # 重取學年度學期，觸發第一筆學年度學期
      request =
        kind: new_kind
        kid: new_kid

      TimeTable.getSemester request

  # 課表中的連結
  $("#timeTable, #myTabContent").on "click", "a[kind]", ->
    kind = $(this).attr("kind")
    kid = $(this).attr("kid")
    keyword = $(this).html()
    if kind and kid
      $("#keyword").val keyword
      $("#search").html """<i class="icon-remove"></i> 取消搜尋"""
      TimeTable.setTCCDropDownList
        Kind: kind
        ID: kid
        Name: keyword

  # 左方班級、老師選單的開閤
  $("#class, #teacher").on "click", "li.nav-header", ->

    if $(this).find("i.icon-chevron-down").size()
      $(this).nextUntil("li.nav-header").hide()
    else
      $(this).nextUntil("li.nav-header").show()
    $(this).find("i").toggleClass "icon-chevron-down icon-chevron-up"


TimeTable = do ->
  _system_position = gadget.params.system_position or "teacher"
  _myself =
    tcc_list: null
    semester_list: null
    scheduler_list: null

  _teachers = null
  _classes = null
  _classrooms = null
  _alloptions = []
  _all_timetable = {} #所有的 timetable，用來計算最大節數、星期、上課時段、節次名稱
  _curr_scheduler = []
  _curr_timetable = []
  _curr_classbusy = []
  _runing =
    scheduler: false
    classbusy: false
  _connection = null

  if _system_position is "student"
    _connection = gadget.getContract("ischool.scheduler.student")
  else
    _connection = gadget.getContract("ischool.scheduler.teacher")

  # 取得我的姓名，完成後呼叫 setTCCDropDownList()
  initialize = ->
    _connection.send
      service: "_.GetMyInfo"
      body: {}
      result: (response, error, http) ->
        if error isnt null
          set_error_message "#mainMsg", "GetMyInfo", error
        else
          if _system_position is "student"
            if response.Response?.Student?
              $(response.Response.Student).each (index, item) ->
                setTCCDropDownList
                  Kind: "class"
                  ID: item.ClassID
                  Name: item.ClassName
          else if _system_position is "teacher"
            if response.Response?.Teacher?
              $(response.Response.Teacher).each (index, item) ->
                setTCCDropDownList
                  Kind: "teacher"
                  ID: item.TeacherID
                  Name: item.TeacherName

  # 取得所有老師類別、所有班級、所有場地
  getAllSearchItem = ->
    checkResult = ->
      _alloptions = _teachers.concat(_classes, _classrooms)  if _teachers and _classes and _classrooms

    getTeachers = ->
      _connection.send
        service: "_.GetTeachers"
        body: ""
        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetTeachers", error
          else
            items = []
            teacher_list = []
            dept_name = null
            if response.Response?.Teacher?
              $(response.Response.Teacher).each (index, item) ->
                items.push
                  Kind: "teacher"
                  ID: item.ID
                  Name: item.TeacherName

                if item.Dept isnt dept_name
                  dept_name = item.Dept
                  teacher_list.push """<li class="nav-header"><a href="#"><i class="icon-chevron-up"></i> #{dept_name || '未分類教師'}</a></li>"""

                teacher_list.push """<li style="display: none;"><a href="#" kind="teacher" kid="#{item.ID or ""}">#{item.TeacherName}</a></li>"""

            _teachers = items
            checkResult()
            $("#teacher ul").html teacher_list.join("")

    getClasses = ->
      _connection.send
        service: "_.GetClasses"
        body: ""
        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetClasses", error
          else
            items = []
            class_list = []
            grader_year = null
            grader_name = null
            if response.Response?.Class?
              $(response.Response.Class).each (index, item) ->
                items.push
                  Kind: "class"
                  ID: item.ID
                  Name: item.ClassName

                if item.GraderYear isnt grader_year
                  if item.GraderYear is ""
                    grader_name = "未分年級"
                  else
                    grader_name = item.GraderYear + "年級"
                  class_list.push """<li class="nav-header"><a href="#"><i class="icon-chevron-up"></i> #{grader_name}</a></li>"""
                  grader_year = item.GraderYear
                class_list.push """<li style="display: none;"><a href="#" kind="class" kid="#{item.ID or ""}">#{item.ClassName or ""}</a></li>"""

            _classes = items
            checkResult()
            $("#class ul").html class_list.join("")


    getClassrooms = ->
      _connection.send
        service: "_.GetClassrooms"
        body: ""
        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetClassrooms", error
          else
            items = []
            classroom_list = []
            if response.Response?.Classroom?
              $(response.Response.Classroom).each (index, item) ->
                items.push
                  Kind: "classroom"
                  ID: item.Uid
                  Name: item.Name

                classroom_list.push """<li><a href="#" kind="classroom" kid="#{item.Uid or ""}">#{item.Name or ""}</a></li>"""

            _classrooms = items
            checkResult()
            $("#place ul").html classroom_list.join("")


    _connection.ready ->
      getTeachers()
      getClasses()
      getClassrooms()


  # 顯示課表
  process = ->

    # 依據儲存格內容取得表格 CSS
    getTDCSS = (_len) ->
      if _len <= 1
        "my-list1"
      else if _len >= 4
        "my-list4"
      else
        "my-list" + _len

    getTableCSS = (_len) ->
      if _len <= 6
        "my-row6"
      else if _len >= 12
        "my-row12"
      else
        "my-row" + _len


    kind = ($("#menu2 li.active a").attr("kind") or "teacher")
    if _runing.scheduler and ((if kind is "class" then _runing.classbusy else true))
      check_timetable = true
      max_Weekday = 0
      max_Period = 0
      _thead = []
      _tbody = []
      extendTimetable = {}
      ii = null
      jj = null
      weekday_name = null
      tt = null
      def_time = []
      flag_x = null
      flag_h = null
      course_time = null
      tool_tip = null
      tooltip_html = null
      beginTime = null
      minutesLater = null
      that = null
      info = null
      course_group_name = null
      $(_curr_timetable).each (key, value) ->
        check_timetable = false  unless _all_timetable[value]

      if check_timetable
        if _curr_scheduler.length is 0
          $("#timeTable").find("thead").html("").end().find("tbody").html "<tr><td>目前無資料</td></tr>"
        else
          extendTimetable = {}

          # 最大星期、節次
          $(_curr_timetable).each (key, value) ->
            max_Weekday = (if (_all_timetable[value].max_Weekday > max_Weekday) then _all_timetable[value].max_Weekday else max_Weekday)
            max_Period = (if (_all_timetable[value].max_Period > max_Period) then _all_timetable[value].max_Period else max_Period)
            $.extend extendTimetable, _all_timetable[value]

          ii = 0
          while ii <= max_Period
            (if (ii is 0) then _thead.push("<tr>") else _tbody.push("<tr>"))

            # 星期
            jj = 0
            while jj <= max_Weekday
              if ii is 0

                # 星期欄位
                weekday_name = ((if jj is 0 then "&nbsp;" else $.funGetDayName(jj or "")))
                _thead.push "<th>" + weekday_name + "</th>"
              else
                if jj is 0

                  # 節次
                  course_time = ""
                  kk = 1
                  while kk <= max_Weekday
                    tt = extendTimetable["" + ii + kk]
                    if tt

                      # 節次的開始時間、結束時間
                      beginTime = new Date(tt.BeginTime)
                      minutesLater = new Date(tt.BeginTime)
                      minutesLater.setMinutes minutesLater.getMinutes() + parseInt(tt.Duration, 10)
                      course_time = $.formatDate(beginTime, "HHmm") + "<br />|<br />" + $.formatDate(minutesLater, "HHmm")
                      def_time[ii] =
                        orgBeginTime: tt.BeginTime
                        duration: tt.Duration

                      break
                    kk += 1
                  unless def_time[ii]
                    def_time[ii] =
                      orgBeginTime: ""
                      duration: ""
                  _tbody.push """<th>#{ii}<div class="my-time">#{course_time}</div></th>"""
                else
                  flag = ""
                  course_time = ""
                  tool_tip = []
                  tooltip_html = ""
                  info = []
                  course_group_name = ""
                  tt = extendTimetable["" + ii + jj]

                  if tt

                    # 節次的開始時間、結束時間
                    if def_time[ii].orgBeginTime isnt tt.BeginTime or def_time[ii].duration isnt tt.Duration
                      beginTime = new Date(tt.BeginTime)
                      minutesLater = new Date(tt.BeginTime)
                      minutesLater.setMinutes minutesLater.getMinutes() + parseInt(tt.Duration, 10)
                      course_time = """<li class="my-time">( #{$.formatDate(beginTime, "HHmm") + "-" + $.formatDate(minutesLater, "HHmm")} )</li>"""

                    if tt.Disable is "t"
                      # timetable不排課
                      _tbody.push """
                        <td class="#{getTDCSS(1)}">
                          <table class="my-subtable">
                            <tr>
                              <td>
                                <ul>
                                  <li class="my-subject">#{tt.DisableMessage}</li>
                                  #{course_time}
                                </ul>
                              </td>
                            </tr>
                          </table>
                        </td>
                      """
                    else
                      if _curr_classbusy["" + ii + jj]
                        _tbody.push """
                          <td class="#{getTDCSS(1)}">
                            <table class="my-subtable">
                              <tr>
                                <td>
                                  <ul>
                                    <li class="my-subject">#{_curr_classbusy["" + ii + jj]}</li>
                                    #{course_time}
                                  </ul>
                                </td>
                              </tr>
                            </table>
                          </td>
                        """
                      else
                        if _curr_scheduler[ii] and _curr_scheduler[ii][jj]
                          that = _curr_scheduler[ii][jj]
                          $(that).each (index, item) ->
                            switch item.WeekFlag
                              when "1"
                                flag_h = """<li class="my-week">(單)</li>"""
                                flag_x = "(單)"
                              when "2"
                                flag_h = """<li class="my-week">(雙)</li>"""
                                flag_x = "(雙)"
                              else
                                flag_h = ""
                                flag_x = ""
                            subject = (item.Subject or "") + ((if item.level then $.arabic2roman(item.level) else ""))
                            teachername = item.TeacherName or ""
                            classroomname = item.ClassroomName or ""
                            classname = item.ClassName or ""
                            teacherlink = if teachername then """<a href="#" kind="teacher" kid="#{item.TeacherID or ""}">#{teachername}</a>""" else ""
                            classroomlink = if classroomname then """<a href="#" kind="classroom" kid="#{item.ClassroomID or ""}">#{classroomname}</a>""" else ""
                            classlink = if classname then """<a href="#" kind="class" kid="#{item.ClassID or ""}">#{classname}</a>""" else ""
                            if index > 3
                              switch kind
                                when "teacher"
                                  tool_tip.push """<li>#{flag_x}#{classname} - #{subject} - #{classroomname}</li>"""
                                when "classroom"
                                  tool_tip.push """<li>#{flag_x}#{classname} - #{subject} - #{teachername}</li>"""
                                when "class"
                                  tool_tip.push """<li>#{flag_x}#{subject} - #{teachername} - #{classroomname}</li>"""
                            else
                              switch kind
                                when "teacher"
                                  info.push """
                                    <tr>
                                      <td>
                                        <ul>
                                          #{flag_h}
                                          <li class="my-class">#{classlink}</li>
                                          <li class="my-subject">#{subject}</li>
                                          <li class="my-classroom">#{classroomlink}</li>
                                        </ul>
                                      </td>
                                    </tr>
                                  """
                                when "classroom"
                                  info.push """
                                    <tr>
                                      <td>
                                        <ul>
                                          #{flag_h}
                                          <li class="my-class">#{classlink}</li>
                                          <li class="my-subject">#{subject}</li>
                                          <li class="my-teacher">#{teacherlink}</li>
                                        </ul>
                                      </td>
                                    </tr>
                                  """
                                when "class"
                                  info.push """
                                    <tr>
                                      <td>
                                        <ul>
                                          #{flag_h}
                                          <li class="my-subject">#{subject}</li>
                                          <li class="my-teacher">#{teacherlink}</li>
                                          <li class="my-classroom">#{classroomlink}</li>
                                        </ul>
                                      </td>
                                    </tr>
                                  """
                            course_group_name = ("【" + item.CourseGroup + "】" or "")  if kind is "class" and item.CourseGroup
                            info.push """<div class="my-more">#{that.length - 4}</div>"""  if index > 3

                          tooltip_html = """rel="tooltip" data-placement="top" data-original-title="#{course_group_name}<ol>#{tool_tip.join("")}</ol>" """  if course_group_name or tool_tip.length > 0
                          _tbody.push """
                            <td class="#{getTDCSS(that.length)}" #{tooltip_html}>
                              <div class="my-container-more" style="position:relative;">
                                <table class="my-subtable">#{info.join("")}</table>
                                #{course_time}
                              </div>
                            </td>
                          """
                        else
                          _tbody.push """<td class="#{getTDCSS(1)}"></td>"""
                  else
                    _tbody.push """<td class="#{getTDCSS(1)}"></td>"""
              jj += 1


            if ii is 0 then _thead.push("</tr>") else _tbody.push("</tr>")
            ii += 1


          $("#timeTable").find("table").removeClass().addClass("table table-bordered " + getTableCSS(max_Period)).end().find("thead").html(_thead.join("")).end().find("tbody").html(_tbody.join("")).find("td[rel=tooltip]").tooltip()
          _myself.scheduler_list = $("#timeTable").html()  unless _myself.scheduler_list
      else
        $("#timeTable").find("thead").html("").end().find("tbody").html "<tr><td>目前無資料</td></tr>"

  # 我的課表
  runMydata = ->
    tmp = null
    unless _myself.tcc_list and _myself.semester_list and _myself.scheduler_list
      initialize()
    else
      tmp = $("<div />").append(_myself.semester_list).find("li.active a")
      $("#tabName").attr("data-schoolyear", tmp.attr("schoolyear")).attr("data-semester", tmp.attr("semester")).html tmp.html()
      tmp = $($("<div>").append(_myself.tcc_list).find("li.active a"))
      $("#tabSearch").attr("data-kind", tmp.attr("kind")).attr("data-kid", tmp.attr("kid")).html tmp.html()
      $("#menu2").html _myself.tcc_list
      $("#menu1").html _myself.semester_list
      $("#timeTable").html _myself.scheduler_list


  # 設定學年度學期的下拉，完成後觸發第一筆
  getSemester = (request) ->
    kind = (request.kind or "")
    kid = (request.kid or "")
    m2 = $("#menu2 li.active a")
    items = []
    if kind and kid
      switch kind
        when "teacher"
          request.TeacherID = kid
        when "classroom"
          request.ClassroomID = kid
        when "class"
          request.ClassID = kid
        else
          return false
      _connection.send
        service: "_.GetSemester"
        body:
          Request: request
        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetSemester", error
          else
            if m2.attr("kind") is kind and m2.attr("kid") is kid
              if response.Schedule?.CourseSection?
                $(response.Schedule.CourseSection).each (index, item) ->
                  items.push
                    SchoolYear: item.SchoolYear
                    Semester: item.Semester

          setSemeDownList items


  # 取得課程分段，完成後呼叫 process();
  getScheduler = (request) ->
    _runing.scheduler = false
    schoolyear = request.SchoolYear or ""
    semester = request.Semester or ""
    kind = request.kind or ""
    kid = request.kid or ""
    m2 = $("#menu2 li.active a")
    m1 = $("#menu1 li.active a")
    _curr_scheduler = []
    _curr_timetable = []
    if schoolyear and semester and kind and kid
      switch kind
        when "teacher"
          request.TeacherID = kid
        when "classroom"
          request.ClassroomID = kid
        when "class"
          request.ClassID = kid
        else
          return false
      _connection.send
        service: "_.GetScheduler"
        body:
          Request: request
        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetScheduler", error
          else
            if m2.attr("kind") is kind and m2.attr("kid") is kid and m1.attr("schoolyear") is schoolyear and m1.attr("semester") is semester
              if response.Schedule?.CourseSection?
                $(response.Schedule.CourseSection).each (index, item) ->
                  if item.TimetableID
                    if $.inArray(item.TimetableID, _curr_timetable) < 0
                      getTimetable item.TimetableID
                      _curr_timetable.push item.TimetableID
                    len = parseInt((item.Length or 0), 10)
                    if len > 0
                      period = parseInt((item.Period or 0), 10)
                      ii = period

                      while ii < len + period
                        _curr_scheduler[ii] = []  unless _curr_scheduler[ii]
                        _curr_scheduler[ii][item.Weekday] = []  unless _curr_scheduler[ii][item.Weekday]
                        _curr_scheduler[ii][item.Weekday].push item
                        ii++

              if _curr_scheduler.length > 0
                _runing.scheduler = true
                process()
              else
                $("#timeTable").find("thead").html("").end().find("tbody").html "<tr><td>目前無資料</td></tr>"


  # 取得timetable，完成後呼叫 process();
  getTimetable = (ttid) ->
    if ttid
      if _all_timetable[ttid]
        process()
      else
        _connection.send
          service: "_.GetTimetable"
          body: "<Request><Condition><TimetableID>" + ttid + "</TimetableID></Condition></Request>"
          result: (response, error, http) ->
            if error isnt null
              set_error_message "#mainMsg", "GetTimetable", error
            else
              if response.TimeTableSections?.TimeTableSection?
                $(response.TimeTableSections.TimeTableSection).each (index, item) ->
                  unless _all_timetable[item.TimetableID]
                    _all_timetable[item.TimetableID] =
                      max_Weekday: item.Weekday
                      max_Period: item.Period
                  else
                    _all_timetable[item.TimetableID].max_Weekday = item.Weekday  if parseInt(_all_timetable[item.TimetableID].max_Weekday, 10) < parseInt(item.Weekday, 10)
                    _all_timetable[item.TimetableID].max_Period = item.Period  if parseInt(_all_timetable[item.TimetableID].max_Period, 10) < parseInt(item.Period, 10)
                  _all_timetable[item.TimetableID][item.Period + item.Weekday] = item

              process()

  # 取得班級不排課，只有班級課表才使用
  getClassBusy = (cid) ->
    _runing.classbusy = false
    _curr_classbusy = []
    if cid
      _connection.send
        service: "_.GetClassBusy"
        body:
          Request:
            Condition:
              ClassID: cid

        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetClassBusy", error
          else
            if response.Response?.ClassBusy?
              $(response.Response.ClassBusy).each (index, item) ->
                _curr_classbusy[item.Period + item.Weekday] = item.BusyDescription

            _runing.classbusy = true
            process()


  # 過濾搜尋條件
  search = (keyword) ->
    correspond_list = []
    $(_alloptions).each ->
      correspond_list.push this  if @Name.indexOf(keyword) isnt -1

    setTCCDropDownList correspond_list


  # 列印
  printScheduler = ->
    content = null
    doc = null
    page = null
    $("#timeTable caption").html $("#tabName").html() + " " + $("#tabSearch").html() + "課表"
    page = $($("#timeTable").html())
    page.find("a").wrapInner("<span>").find("span").unwrap "a"
    content = """
      <!DOCTYPE html>
      <html>
        <head>
          <link type="text/css" href="css/bootstrap.css" rel="stylesheet" />
          <link type="text/css" href="css/bootstrap-responsive.css" rel="stylesheet" />
          <link type="text/css" href="css/mybootstrap.css" rel="stylesheet" />
          <link type="text/css" href="css/base.css" rel="stylesheet" />
          <link type="text/css" href="css/default.css" rel="stylesheet"/>
        </head>
        <body>
          <div class="my-print">#{$("<div/>").append(page).html()}</div>
        </body>
      </html>
    """
    doc = window.open("about:blank", "_blank", "")
    doc.document.open()
    doc.document.write content
    doc.document.close()
    doc.focus()


  # 設定學年度學期下拉清單，並運行第一筆，以取得課程分段
  setSemeDownList = (_list) ->
    items = []
    $("#menu1").html ""
    $(_list).each ->
      FullName = (@SchoolYear or "") + "學年度 " + (@Semester or "") + "學期"
      items.push """<li><a href="#" schoolyear="#{@SchoolYear or ""}" semester="#{@Semester or ""}">#{FullName}</a></li>"""

    if items.length > 0
      $("#menu1").html(items.join("")).find("li:first").click()
    else
      $("#tabName").html "無資料"
      $("#timeTable").find("thead").html("").end().find("tbody").html "<tr><td>目前無資料</td></tr>"
    _myself.semester_list = $("#menu1").html()  unless _myself.semester_list


  # 設定符合姓名、場地、班級的下拉名單，並運行第一筆，以取得學年度學期
  setTCCDropDownList = (_list) ->
    items = []
    $("#menu1, #menu2").html ""
    $(_list).each ->
      items.push """<li><a href="#" kid="#{@ID or ""}" kind="#{@Kind or ""}">#{@Name or ""}</a></li>"""

    if items.length > 0
      $("#menu2").html(items.join("")).find("li:first").click()
    else
      $("#tabSearch, #tabName").html "無資料"
      if _list.length
        $("#timeTable").find("thead").html("").end().find("tbody").html "<tr><td>目前無資料</td></tr>"
      else
        $("#timeTable").find("thead").html("").end().find("tbody").html "<tr><td>查無此資料</td></tr>"
    _myself.tcc_list = $("#menu2").html()  unless _myself.tcc_list


  # 錯誤訊息
  set_error_message = (select_str, serviceName, error) ->
    if serviceName
      tmp_msg = """<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(#{serviceName})"""
      if error isnt null
        if error.dsaError
          if error.dsaError.status is "504"
            switch error.dsaError.message
              when "501"
                tmp_msg = "<strong>很抱歉，您無讀取資料權限！</strong>"
              else
                tmp_msg = "<strong>" + error.dsaError.message + "</strong>"
          else tmp_msg = error.dsaError.message  if error.dsaError.message
        else if error.loginError.message
          tmp_msg = error.loginError.message
        else tmp_msg = error.message  if error.message
        $(select_str).html """<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>#{tmp_msg}</div>"""
        $(".my-err-info").click ->
          alert "請拍下此圖，並與客服人員連絡，謝謝您。\n" + JSON.stringify(error, null, 2)

    else
      $(select_str).html """<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  #{error}</div>"""

  # 外部函式
  {
    on_init: ->
      initialize()
      getAllSearchItem()

    on_search: (_keyword) ->
      search _keyword

    on_runMydata: ->
      runMydata()

    on_printScheduler: ->
      printScheduler()

    getScheduler: (_request) ->
      getScheduler _request

    getSemester: (_request) ->
      getSemester _request

    getClassBusy: (_cid) ->
      getClassBusy _cid

    setTCCDropDownList: (_list) ->
      setTCCDropDownList _list

    printScheduler: ->
      printScheduler()
  }
