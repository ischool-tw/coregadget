jQuery ->
  gadget.onSizeChanged (size) ->
    $("#container-main").height(size.height - 47)


  $("#ExamScore tbody").html "<tr><td>載入中...</td></tr>"

  # 切換子女
  $("#children-list").on "click", "a", (evnet) ->
    $('#children-list li[class=active]').removeClass('active')
    $(this).parent().addClass('active')
    Exam.onChangeStudent($(this).attr("children-index"))
    $('.tooltip').remove()

  # 切換學年度學期
  $("#Semester").on "click", ".btn", (event) ->
    schoolYear = $(this).attr("school-year")
    semester = $(this).attr("semester")
    $("#ExamScore").find('thead').html('').end().find('tbody').html "<tr><td>載入中...</td></tr>"
    $("#ScoreInterval tbody").html """<tr><td colspan="11">載入中...</td></tr>"""
    $("#ExamDropDown").find("ul").html("").end().find("a[data-toggle='dropdown']").html("")
    Exam.score schoolYear, semester
    $(".tooltip").remove()


Exam = do ->
  _system_exam_must_enddate = gadget.params.system_exam_must_enddate or "true"
  _system_position = gadget.params.system_position or "student"
  _students = null
  _student = null
  _curr_schoolyear = null
  _curr_semester = null
  _exam_score = {}
  _places = null
  _math_type = null
  _keys = ["國文", "國語", "英文", "英語", "數學", "理化", "生物", "社會", "物理", "化學", "歷史", "地理", "公民"]
  _schoolYear = null
  _semester = null
  _connection = null

  if _system_position is "parent"
    _connection = gadget.getContract("ischool.exam.parent")
  else
    _connection = gadget.getContract("ischool.exam.student")


   # 目前學年度
   getCurrSemester = ->
    _connection.send
      service: "_.GetCurrentSemester"
      body: {}
      result: (response, error, http) ->
        if error isnt null
          set_error_message "#mainMsg", "GetCurrentSemester", error
        else
          if response.Current
            _curr_schoolyear = response.Current.SchoolYear or ""
            _curr_semester = response.Current.Semester or ""

  # 取得全部子女資料
  getStudentInfo = ->
    _connection.send
      service: "_.GetStudentInfo"
      body: {}
      result: (response, error, http) ->
        if error isnt null
          set_error_message '#mainMsg', 'GetStudentInfo', error
        else
          items = []
          if response.Result and response.Result.Student
            _students = $(response.Result.Student)
            _students.each (index, student) ->
              items.push """
                <li #{ if index is 0 then 'class="active"'}>
                  <a href="#" children-index="#{index}">#{student.StudentName}</a>
                </li>
              """
              $("#children-list").html(items.join("")).find('a:first').trigger('click')



  # 成績規則，所有成績學年度
  getStudentRuleSeme = ->
    request = {}
    if _system_position is "parent" then request.Request = { Condition: { StudentID: _student.StudentID } }

    _connection.send
      service: "_.GetScoreCalcRule"
      body: request
      result: (response, error, http) ->
        if error isnt null
          set_error_message "#mainMsg", "GetScoreCalcRule", error
        else
          if response.ScoreCalcRule?.Content?.ScoreCalcRule?["各項成績計算位數"]?["科目成績計算位數"]
            obj = response.ScoreCalcRule.Content.ScoreCalcRule["各項成績計算位數"]["科目成績計算位數"]
            _places = obj["位數"] or 0
            _math_type = "round"  if obj["四捨五入"] is "True"
            _math_type = "floor"  if obj["無條件捨去"] is "True"
            _math_type = "ceil"  if obj["無條件進位"] is "True"

          _connection.send
            service: "_.GetAllCourseSemester"
            body: request
            result: (response, error, http) ->
              if error isnt null
                set_error_message "#mainMsg", "GetAllCourseSemester", error
              else
                if response.Course?.Semester?
                  items = []
                  $(response.Course.Semester).each (index, item) ->
                    items.push """
                      <button class="btn btn-large" school-year="#{@SchoolYear}" semester="#{@Semester}">
                        #{@SchoolYear}#{@Semester}
                      </button>
                    """

                  $("#Semester .btn-group").html(items.join("")).find(".btn:first").trigger "click"
                else
                  $("#ExamScore tbody").html "<tr><td>目前無資料</td></tr>"


  # 清除畫面
  resetData = ->
    $("#ExamScore thead").html ""
    $("#ExamScore tbody").html ""
    $("#ScoreInterval tbody").html ""
    $("#ExamDropDown").find("ul").html("").end().find("a[data-toggle='dropdown']").html("")


  # 取得評量成績
  loadScore = (schoolYear, semester) ->
    _schoolYear = schoolYear
    _semester = semester
    isCurrSemester = (schoolYear is _curr_schoolyear and semester is _curr_semester)

    getCourseExamScoreReady = false
    getAllStudentScoreReady = false
    courseInterval = []


    margeScore = () ->
      if (getCourseExamScoreReady and getAllStudentScoreReady)
        $(courseInterval).each (index, item) ->
          $(_exam_score[schoolYear + semester]).each (index, course) ->
            if course.CourseID is item.CourseID
              item.ScoreDetail = [].concat(item.ScoreDetail)
              course.Exam = [].concat(course.Exam)
              $(item.ScoreDetail).each (index, scoreDetail) ->
                $(course.Exam).each (index, exam) ->
                  if exam.ExamID is scoreDetail.ExamID
                    exam.Interval = scoreDetail
                    return false
              return false

        if $("#Semester button.active").attr("school-year") is schoolYear and $("#Semester button.active").attr("semester") is semester
          showScore(_exam_score[schoolYear + semester], isCurrSemester)

    if (_exam_score[schoolYear + semester])
      showScore(_exam_score[schoolYear + semester], isCurrSemester)
    else
      request = Content:
        Condition:
          SchoolYear: schoolYear
          Semester: semester

      request2 =
        SchoolYear: schoolYear
        Semester: semester

      if _system_position is "parent"
        request.Content.Condition.StudentID = _student.StudentID
        request2.StudentID = _student.StudentID

      _connection.send
        service: "_.GetCourseExamScore"
        body: request
        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetCourseExamScore", error
          else
            if response.ExamScoreList?.Seme?.Course
              oCourse = myHandleArray(response.ExamScoreList.Seme.Course).sort(Comparer)
              oScore = _exam_score[schoolYear + semester] = oCourse
            else
              _exam_score[schoolYear + semester] = null
            getCourseExamScoreReady = true
            margeScore()


      _connection.send
        service: "_.GetAllStudentScore"
        body: request2
        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetAllStudentScore", error
          else
            if response.ExamScoreList?.Course
              courseInterval = [].concat(response.ExamScoreList.Course)

            getAllStudentScoreReady = true
            margeScore()

  # 顯示評量成績
  showScore = (exam_data, isCurrSemester) ->
    # 解析樣版產出 exam_list
    # 如為目前學年度學期，如在繳交期限前不顯示
    # 成績可能是「缺」表示缺考
    now = new Date()
    exam_list = []
    thead1 = []
    thead2 = []
    dropdownList = []
    levelList = ["Level90", "Level80", "Level70", "Level60", "Level50", "Level40", "Level30", "Level20", "Level10", "Level0"]

    if exam_data
      $(exam_data).each (index, course) ->
        $(course.Exam).each (index, exam) ->
          if exam.ExamID
            if $.inArray(exam.ExamID, exam_list) is -1
              exam_list.push exam.ExamID
              thead1.push """<th colspan="2">#{exam.ExamName}</th>"""
              thead2.push """<th colspan="2">成績</th>"""
              dropdownList.push """<li><a href="#" my-examid="#{exam.ExamID}">#{exam.ExamName}</a></li>"""

    $("#ExamDropDown").find("ul").html(dropdownList.join("")).end().find("a[data-toggle='dropdown']").html("")
    $("#ExamDropDown .dropdown-menu a").click ->
      $("#ScoreInterval tbody").html """<tr><td colspan="11">載入中...</td></tr>"""
      $("#ExamDropDown a[data-toggle='dropdown']").html($(@).text()).attr('my-examid', $(@).attr('my-examid'))
      interval_process()


    getIndex = (cid, exams) ->
      ret = null
      $(exams).each (index, item) ->
        ret = item  if item.ExamID is cid
      ret

    getNow = (callBack) ->
      _connection.send
        service: "_.GetNow"
        body: {}
        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetNow", error
          else
            if callBack and $.isFunction(callBack)
              callBack(new Date(response.Now))

    exam_process = () ->
      thead_html = ""
      tbody1 = []
      tbody_html = ""

      if exam_data
        $(exam_data).each (index, course) ->
          tbody1.push """<tr><th>#{course.Subject}</th>"""
          pre_score = -999
          $(exam_list).each (key, value) ->
            # now 目前時間
            # endtime 輸入截止時間
            # show_data 是否顯示
            endtime = null
            show_data = true
            exam = getIndex(value, course.Exam)
            extension = null
            ext_score = null
            ext_text = null
            ext_assignmentScore = null
            avg_score = null
            td_score = null

            if exam
              # 目前學年度時，依設定是否於輸入截止才顯示
              if isCurrSemester
                if _system_exam_must_enddate is "true"
                  if exam.ScoreDetail?.EndTime?
                    show_data = false  if new Date(exam.ScoreDetail.EndTime) >= now
                    endtime = exam.ScoreDetail.EndTime

              # 有成績且可顯示時
              if exam.ScoreDetail and show_data
                ext_score = exam.ScoreDetail.Score or ""
                if ext_score is "缺"
                  avg_score = ""
                  td_score = "缺"
                else
                  avg_score = parseInt(ext_score, 10)
                  td_score = if (ext_score) then Number(avg_score).toFixed(_places) else ""

                # 顯示成績，未達60分以紅色表示
                if avg_score and avg_score < 60
                  tbody1.push """<td class="my-fail" my-data="#{exam.ExamID}">#{td_score}</td>"""
                else
                  tbody1.push """<td my-data="#{exam.ExamID}">#{td_score}</td>"""

                # TODO: 除了科目為「體育」和第一次考試，皆與上次比較進退步
                if course.Subject is "體育" or pre_score is -999
                  tbody1.push "<td>&nbsp;</td>"
                else
                  if avg_score
                    if avg_score > pre_score
                      tbody1.push """<td><span class="my-progress">↑</span></td>"""
                    else if avg_score < pre_score
                      tbody1.push """<td><span class="my-regress">↓</span></td>"""
                    else
                      tbody1.push "<td>&nbsp;</td>"
                  else
                    tbody1.push "<td>&nbsp;</td>"
                pre_score = avg_score  if avg_score
              else if show_data is false
                tbody1.push """
                  <td colspan="2" rel="tooltip"
                    title="#{if endtime then endtime + "後開放" else "尚未開放"}">
                    未開放</td>
                """
              else
                tbody1.push "<td></td><td></td>"
            else
              tbody1.push "<td></td><td></td>"

          tbody1.push "</tr>"

        thead_html = """
          <tr class="my-nofill"><th rowspan="2">科目名稱</th>#{thead1.join("")}</tr>
          <tr class="my-nofill">#{thead2.join("")}</tr>
        """
        tbody_html = tbody1.join("")
        $("#ExamScore").find("thead").html(thead_html).end().find("tbody").html(tbody_html).end().find("td[rel='tooltip']").tooltip()

        $("#ExamDropDown .dropdown-menu a:first").trigger("click")

      else
        $("#ExamScore").find("thead").html("").end().find("tbody").html "<tr><td>目前無資料</td></tr>"
        $("#ScoreInterval tbody").html """<tr><td colspan="11">目前無資料</td></tr>"""

    switchLevel = (score) ->
        if score >= 0 and score < 10
          "Level0"
        else if score >= 10 and score < 20
          "Level10"
        else if score >= 20 and score < 30
          "Level20"
        else if score >= 30 and score < 40
          "Level30"
        else if score >= 40 and score < 50
          "Level40"
        else if score >= 50 and score < 60
          "Level50"
        else if score >= 60 and score < 70
          "Level60"
        else if score >= 70 and score < 80
          "Level70"
        else if score >= 80 and score < 90
          "Level80"
        else if score >= 90 and score <= 100
          "Level90"
        else
          ""

    interval_process = () ->
      tbody1 = []
      tbody_html = ""
      curr_examid = $("#ExamDropDown a[data-toggle='dropdown']").attr('my-examid')

      if exam_data and curr_examid
        $(exam_data).each (index, course) ->
          tbody1.push """<tr><th>#{course.Subject}</th>"""
          $(exam_list).each (key, value) ->
            if value is curr_examid
              # now 目前時間
              # endtime 輸入截止時間
              # show_data 是否顯示
              endtime = null
              show_data = true
              exam = getIndex(value, course.Exam)
              ext_score = null
              my_level = null
              td_score = null

              if exam
                # 目前學年度時，依設定是否於輸入截止才顯示
                if isCurrSemester
                  if _system_exam_must_enddate is "true"
                    if exam.ScoreDetail?.EndTime?
                      show_data = false  if new Date(exam.ScoreDetail.EndTime) >= now
                      endtime = exam.ScoreDetail.EndTime

                # 有成績且可顯示時
                if show_data
                  ext_score = exam.ScoreDetail.Score or '' if exam.ScoreDetail?.Score?
                  if ext_score and ext_score isnt "缺"
                    my_level = switchLevel(Number(ext_score))

                  for key of levelList
                    if levelList[key] == my_level
                      tbody1.push """<td class="my-fail">#{exam.Interval[levelList[key]]}</td>"""
                    else
                      tbody1.push """<td>#{exam.Interval[levelList[key]]}</td>"""

                else
                  tbody1.push """
                    <td colspan="10">
                      #{if endtime then endtime + "後開放" else "尚未開放"}
                    </td>
                  """
              else
                tbody1.push "<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>"

          tbody1.push "</tr>"

        tbody_html = tbody1.join("")
        $("#ScoreInterval tbody").html(tbody_html)
      else
        $("#ScoreInterval tbody").html """<tr><td colspan="11">目前無資料</td></tr>"""


    # 先取得目前時間，再處理資料顯示
    if isCurrSemester and _system_exam_must_enddate is "true"
      getNow (d1) ->
        now = d1
        exam_process()
    else
      exam_process()


  # 錯誤訊息
  set_error_message = (select_str, serviceName, error) ->
    tmp_msg = """<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗</strong>(#{serviceName})"""
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
      $(select_str).html """<div class="alert alert-error"><button class="close" data-dismiss="alert">×</button>#{tmp_msg}</div>"""
      $(".my-err-info").click ->
        alert "請拍下此圖，並與客服人員連絡，謝謝您。\n" + JSON.stringify(error, null, 2)

  # 浮點數相加
  FloatAdd = (arg1, arg2) ->
    r1 = null
    r2 = null
    m = null
    try
      r1 = arg1.toString().split(".")[1].length
    catch e
      r1 = 0
    try
      r2 = arg2.toString().split(".")[1].length
    catch e
      r2 = 0
    m = Math.pow(10, Math.max(r1, r2))
    (FloatMul(arg1, m) + FloatMul(arg2, m)) / m


  # 浮點數相除
  FloatDiv = (arg1, arg2) ->
    t1 = 0
    t2 = 0
    r1 = null
    r2 = null
    try
      t1 = arg1.toString().split(".")[1].length
    try
      t2 = arg2.toString().split(".")[1].length
    r1 = Number(arg1.toString().replace(".", ""))
    r2 = Number(arg2.toString().replace(".", ""))
    (r1 / r2) * Math.pow(10, t2 - t1)


  # 浮點數相乘
  FloatMul = (arg1, arg2) ->
    m = 0
    s1 = arg1.toString()
    s2 = arg2.toString()
    try
      m += s1.split(".")[1].length
    try
      m += s2.split(".")[1].length
    Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)


  # 四捨五入、無條件捨去、無條件進位
  FloatMath = (arg1, type, places) ->
    places = places or 0
    switch type
      when "ceil"
        (Math.ceil(arg1 * Math.pow(10, places))) / Math.pow(10, places) #無條件進位
      when "floor"
        (Math.floor(arg1 * Math.pow(10, places))) / Math.pow(10, places) #無條件捨去
      when "round"
        (Math.round(arg1 * Math.pow(10, places))) / Math.pow(10, places) #四捨五入
      else
        arg1

  # 科目排序
  Comparer = (s1, s2) ->
    ComparerWithKeys = null
    ComparerWithKeys = (s1, s2) ->
      b1 = null
      b2 = null
      i = null
      index = null
      key = null
      maxLength = null
      return 0  if s1 is s2
      return 1  if s1.length is 0
      return -1  if s2.length is 0
      maxLength = ((if s1.length > s2.length then s2.length else s1.length))
      i = 0
      while i < maxLength
        for index of _keys
          b1 = false
          b2 = false
          key = _keys[index]
          b1 = ((if s1.indexOf(key) is 0 then true else false))
          b2 = ((if s2.indexOf(key) is 0 then true else false))
          return -1  if b1 and not b2
          return 1  if b2 and not b1
        if s1.substring(0, 1) is s2.substring(0, 1)
          s1 = s1.substring(1, s1.length)
          s2 = s2.substring(1, s2.length)
        else
          return ((if s1.substring(0, 1) < s2.substring(0, 1) then -1 else 1))
        i++
      return 0  if s1 is s2
      return -1  unless s1
      return 1  unless s2
      ComparerWithKeys s1, s2

    ComparerWithKeys s1.Subject, s2.Subject

  # 轉換物件為陣列
  myHandleArray = (obj) ->
    result = null
    result = null
    unless $.isArray(obj)
      result = []
      result.push obj  if obj
    else
      result = obj
    result

  # 初始化
  getCurrSemester()
  if _system_position is "parent"
    getStudentInfo()
  else
    getStudentRuleSeme()

  # 外部函數
  {
    'score': (schoolYear, semester) ->
      loadScore schoolYear, semester
    'onChangeStudent': (index)->
      resetData()
      _student = _students[index]
      getStudentRuleSeme()
  }
