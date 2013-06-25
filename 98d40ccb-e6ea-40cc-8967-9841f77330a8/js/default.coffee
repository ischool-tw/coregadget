jQuery ->
  $("#tabAnalysis tbody:eq(0)").html "<tr><td>載入中...</td></tr>"




  # 數據分析時才顯示「列印」
  $("#mainButtonGroup").on "click", "a[data-toggle='tab']", (e) ->
    if @.hash is "#tabAnalysis"
      $('#printButton').show()
    else
      $('#printButton').hide()

  # 因第一次執行時，若尚未 display:block 就繪製，圖表會非常小
  # 所以顯示統計圖時也要重繪
  $('#mainButtonGroup a[data-toggle="tab"]').on "shown", (e) ->
    if e.target.hash is "#tabChart" then Exam.resetChartData()

  # 按下列印
  $('#printButton').click ->
    Exam.toPrint($("#myTabContent"))

  # 按下儲存
  $("#save-data").click ->
    return  if $(@).hasClass("disabled")
    $("#errorMessage").html ""
    $(@).addClass "disabled"
    Exam.save()


Exam = do ->
  _curr_schoolyear = null
  _curr_semester = null
  _schoolYear = null
  _semester = null
  _connection = null
  _now = null
  _courses = []
  _courseId = null
  _classIntervals = {}
  _isChartReady = false
  _hasChart = false
  _options =
    title: "定期成績"
    hAxis:
      title: "分數組距"
    vAxis:
      title: "人數"
      minValue: 2
      gridlines:
        count: 6
    chartArea:
      left:50,
      height: "70%"
      width: "80%"
    focusTarget: "category"

  _chart = null
  _connection = gadget.getContract("ischool.teaching_analysis.teacher")

  # 設定組距人數的變數預設值
  setClassInterval = (course) ->
    range = ["0", "1 - 9", "10 - 19", "20 - 29", "30 - 39", "40 - 49", "50 - 59", "60 - 69", "70 - 79", "80 - 89", "90 - 99", "100"]
    levelname = ["Level0", "Level1", "Level10", "Level20", "Level30", "Level40", "Level50", "Level60", "Level70", "Level80", "Level90", "Level100"]

    $(range).each (index, item) ->
      data =
        'name': levelname[index]
        'range': item
      course.push data
      course[levelname[index]] = data

  # 目前學年度，現在系統時間
  getCurrSemester = ->
    _connection.send
      service: "_.GetCurrentSemester"
      body: {}
      result: (response, error, http) ->
        if error isnt null
          set_error_message "#mainMsg", "GetCurrentSemester", error
        else
          if response.Response
            _curr_schoolyear = response.Response.SchoolYear or ""
            _curr_semester = response.Response.Semester or ""

            if _curr_semester is "0"
              $('#currShoolYear').html(_curr_schoolyear + ' 學年度暑期')
            else
              $('#currShoolYear').html(_curr_schoolyear + ' 學年度第 ' + _curr_semester + ' 學期')

        _connection.send
          service: "_.GetCurrentDateTime"
          body: {}
          result: (response, error, http) ->
            if error isnt null
              set_error_message "#mainMsg", "GetCurrentDateTime", error
            else
              _now = new Date(response.DateTime)
              getMyCourses()


  # 取得我是評分老師的本學年度課程，及課程的定期評量填寫開放日期、表現記錄
  getMyCourses = ->
    _connection.send
      service: "_.GetMyCourses"
      body: {
        Request: {
          SchoolYear: _curr_schoolyear,
          Semester: _curr_semester
        }
      }
      result: (response, error, http) ->
        if error isnt null
          set_error_message "#mainMsg", "GetMyCourses", error
        else
          if response.Response
            _courses = myHandleArray(response.Response)
            list = []
            $(response.Response.Course).each (index, item) ->
              list.push """
                <option value="#{item.CourseID}">#{item.Subject or ''}</option>
              """

              # 將定期評量 Exam 新增至物件
              if item.Exams?.Exam?
                $(item.Exams.Exam).each (index, exam) ->
                  item.Exams.Exam['exam_' + exam.ExamID] = exam

              item.HasSource = false
              _courses['course_' + item.CourseID] = item

              classInterval = _classIntervals['course_' + item.CourseID] = []
              setClassInterval(classInterval)


            # 顯示課程選單
            $('#curr_course_list').html(list.join(','))

            # 建立切換課程的事件
            $("#curr_course_list").change (e) ->
              getAvgScore(@.value)

            $("#curr_course_list option:first").trigger('change')


  # 清除畫面
  resetData = ->
    $("#tabAnalysis thead").html ""
    $("#tabAnalysis tbody").html ""
    $("#tabChart form").html ""


  # 取得課程學生的平均成績、組距
  getAvgScore = (courseId) ->
    resetData()
    _courseId = courseId
    if _courses['course_' + courseId].HasSource
      showAnalysis(_courses['course_' + courseId])
      showChart(_courses['course_' + courseId])
    else
      _connection.send
        service: "_.GetAvgScore"
        body: {
          Request: {
            CourseID: courseId
          }
        }
        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetAvgScore", error
          else
            course = _courses['course_' + courseId]
            course.HasSource = true
            classInterval = _classIntervals['course_' + courseId]

            if response.Response?.Exam?
              $(response.Response.Exam).each (index, score) ->
                # 將平均加進 _course
                if course.Exams?.Exam?['exam_' + score.ExamID]?
                  course.Exams.Exam['exam_' + score.ExamID].AvgScore = score.AvgScore

                # 將組距加入 _classIntervals
                $(classInterval).each (index, item) ->
                  item['exam_' + score.ExamID] = if (score[item.name]) then parseInt(score[item.name],10) else null

            if $('#curr_course_list').val() is courseId
              showAnalysis(course)
              showChart(course)


  # 顯示數據分析
  showAnalysis = (course) ->
    if course?.Exams?.Exam?
      thead0 = []
      thead2 = []
      tbody0 = []
      tbody1 = []
      tbody2 = []
      classInterval = _classIntervals['course_' + _courseId]

      $(course.Exams.Exam).each (index, exam) ->
        thead0.push """<th>#{exam.ExamName}</th>"""

        # 開放期間內才可以輸入
        if exam.InputStartTime && exam.InputEndTime
          Startdate = new Date(exam.InputStartTime)
          Enddate = new Date(exam.InputEndTime)

          if Startdate <= _now && Enddate >= _now
            thead2.push """
              <th>
                <a href="#myModal" class="btn" data-toggle="modal" data-courseId="#{course.CourseID}" data-examId="#{exam.ExamID}"
                  rel="tooltip" title="開放期間：<br />#{exam.InputStartTime}<br />~<br />#{exam.InputEndTime}">
                  <i class="icon-edit"></i>#{exam.ExamName}
                </a>
              </th>
            """
          else
            thead2.push """<th>#{exam.ExamName}</th>"""
        else
          thead2.push """<th>#{exam.ExamName}</th>"""



        # 將表格內容填入陣列中
        tbody0.push """<th>#{exam.AvgScore or ''}</th>"""

        tbody2.push """<td><div class="my-performance">#{$.htmlEncode(exam.Performance).replace(/\n/g, '<br />') or ''}</div></td>"""


      $(classInterval).each (index, item) ->
        tbody1.push """<tr><th>#{item.range}</th>"""
        $(course.Exams.Exam).each (index, exam) ->
          tbody1.push """<td>#{item['exam_'+exam.ExamID] or '0'}</td>"""
        tbody1.push """</tr>"""


      $('#tabAnalysis table thead:eq(0)').html """<tr><th>平均分數</th>#{thead0.join('')}</tr>"""
      $('#tabAnalysis table thead:eq(1)').html """<tr><th>人數統計</th>#{thead0.join('')}</tr>"""
      $('#tabAnalysis table thead:eq(2)').html """<tr><th>評量</th>#{thead2.join('')}</tr>"""

      $('#tabAnalysis table tbody:eq(0)').html """<tr><th>平均</th>#{tbody0.join('')}</tr>"""
      $('#tabAnalysis table tbody:eq(1)').html tbody1.join('')
      $('#tabAnalysis table tbody:eq(2)').html """<tr><th>表現記錄</th>#{tbody2.join('')}</tr>"""

      # 表現記錄開放期間tooltip, 按下編輯表現記錄
      buttons = $('#tabAnalysis table thead:eq(2) a[rel="tooltip"]')
      buttons.tooltip()
      buttons.on "click", (e) ->
        courseId = $(this).attr "data-courseId"
        examId = $(this).attr "data-examId"
        performance = _courses['course_' + courseId].Exams.Exam['exam_' + examId].Performance || ''

        $('#myModal')
          .find('h3').html("""評量表現記錄 - #{$(this).text() || ''}""").end()
          .find('textarea').val("#{performance}").end()
          .find('#errorMessage').html('').end()
          .find("#save-data").attr("data-courseId", courseId).attr "data-examId", examId

    else
      $('#tabAnalysis table tbody:eq(0)').html """<tr><td>目前無資料</td></tr>"""

  # 顯示統計圖
  showChart = (course) ->
    # 產生評量核准方塊
    checkbox_list = []
    if course?.Exams?.Exam?
      $(course.Exams.Exam).each (index, exam) ->
        checkbox_list.push """
          <label class="checkbox">
            <input type="checkbox" name="checkExam" value="#{exam.ExamID}" checked>
            #{exam.ExamName}
          </label>
        """
    $('#tabChart form').html(checkbox_list.join(""))
    $('#tabChart form input:checkbox').click ->
      Exam.resetChartData()

    drawChart()

  # 過濾圖表資料
  drawChart =  ->
    if _isChartReady is true
      course = _courses['course_' + _courseId]
      classInterval = _classIntervals['course_' + _courseId]

      # 清除圖表
      if _hasChart is true then _chart.clearChart()

      # 格式 data = ["人數", "第一次月考", "第二次月考"], ["0-10", 38, 28], ["10-20", 5, 46], ["20-30", 14, 11], ["30-40", 28, 54]
      data = []
      fields = $("#tabChart form :input").serializeArray()

      if fields.length > 0
        ii = -1
        while ii < classInterval.length
          items = []
          # 填入評量名稱
          if ii is -1
            items = ["人數"]
            $.each fields, (i, field) ->
              items.push course.Exams.Exam['exam_'+field.value].ExamName or ''
          # 填入組距人數
          else
            items.push classInterval[ii].range
            $.each fields, (i, field) ->
              items.push classInterval[ii]['exam_'+field.value] or 0
          data.push items
          ii++

        dt = google.visualization.arrayToDataTable(data)
        _chart.draw(dt, _options)
        _hasChart = true


  # 儲存表現記錄
  savePerformance = ->
    courseId = $("#save-data").attr "data-courseId"
    examId = $("#save-data").attr "data-examId"
    performance = $('#myModal textarea').val() or ""

    _connection.send
      service: "_.SetExam_Ext"
      body:
        Request:
          Exam:
            Performance: $('#myModal textarea').val()
            CourseID: courseId
            ExamID: examId
      result: (response, error, http) ->
        if error isnt null
          $('#save-data').attr("action-type", "save").removeClass("disabled")
          set_error_message "#errorMessage", "SetExam_Ext", error
        else
          _courses['course_' + courseId].Exams.Exam['exam_' + examId].Performance = performance
          showAnalysis(_courses['course_' + courseId])
          $('#save-data').attr("action-type", "save").removeClass("disabled")
          $('body').scrollTop(0)
          $('#myModal').modal('hide')
          $('#mainMsg').html('<div class="alert alert-success">\n  儲存成功！\n</div>')
          setTimeout("$('#mainMsg').html('')", 1500)


  # 錯誤訊息
  set_error_message = (select_str, serviceName, error) ->
    tmp_msg = """<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(#{serviceName})"""
    if error isnt null
      if error.dsaError
        if error.dsaError.status is "504"
          switch error.dsaError.message
            when "501"
              tmp_msg = "<strong>很抱歉，您無讀取資料權限！</strong>"
            when "502"
              tmp_msg = "<strong>很抱歉，目前非開放期間！</strong>"
        else tmp_msg = error.dsaError.message  if error.dsaError.message
      else if error.loginError.message
        tmp_msg = error.loginError.message
      else tmp_msg = error.message  if error.message
      $(select_str).html """<div class="alert alert-error"><button class="close" data-dismiss="alert">×</button>#{tmp_msg}</div>"""
      $(".my-err-info").click ->
        alert "請拍下此圖，並與客服人員連絡，謝謝您。\n" + JSON.stringify(error, null, 2)


  # 轉換物件為陣列
  myHandleArray = (obj) ->
    result = undefined

    #只回傳一筆時為單一物件，沒有資料時為 undefined, 多筆時為 array
    unless $.isArray(obj)
      result = []
      result.push obj  if obj
    else
      result = obj
    result


  # HTMLEncode 編碼
  $.htmlEncode = (value) ->
    $('<div/>').text(value).html()


  # 列印
  myToPrint = (jEle) ->
    content = $("<div>").append(jEle.html())
    content.find("table").removeClass().addClass("table").end()
      .find("i").remove().end()
      .find("a").each ->
          $(@).after('<span>' + $(@).html() + '</span>')
          $(@).remove()

    content = content.html()
    content = """
      <!DOCTYPE html>
      <html>
        <head>
          <title>教學分析</title>
          <link href="css/bootstrap.css" rel="stylesheet" />
          <link href="css/bootstrap-responsive.css" rel="stylesheet" />
          <link href="css/mybootstrap.css" rel="stylesheet" />
          <link href="css/base.css" rel="stylesheet" />
          <link href="css/default.css" rel="stylesheet" />
        </head>
        <body style="width:880px;height:auto;padding:40px 20px" onload="window.print();">
        <div style="width:880px;" class="my-print-page">
          <h3>#{$('#currShoolYear').html()}  #{$("#curr_course_list option:selected").text()} 教學分析</h3>
          #{content}
        </div>
        </body>
      </html>
    """
    doc = window.open("about:blank", "_blank", "")
    doc.document.open()
    doc.document.write content
    doc.document.close()
    doc.focus()


  # 初始化
  getCurrSemester()

  # 外部函數
  {
    toPrint: (jEle) ->
      myToPrint(jEle)
    resetChartData: ->
      drawChart()
    drawVisualization: ->
      _chart = new google.visualization.ColumnChart(document.getElementById("chart_div"))
      _isChartReady = true
      drawChart()
    save: ->
      savePerformance()
  }

# google 圖表
google.load "visualization", "1",
  packages: ["corechart"]

google.setOnLoadCallback Exam.drawVisualization


