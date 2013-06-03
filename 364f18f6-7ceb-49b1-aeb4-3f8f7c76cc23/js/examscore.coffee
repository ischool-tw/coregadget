new

jQuery ->
  $("#ExamScore tbody").html "<tr><td>載入中...</td></tr>"

  $("input:radio[name='show_model'][value='#{gadget.params.system_show_model or "subject"}']").prop('checked', true)

  # 切換子女
  $("#children-list").on "click", "a", (evnet) ->
    $('#children-list li[class=active]').removeClass('active')
    $(this).parent().addClass('active')
    Exam.onChangeStudent($(this).attr("children-index"))
    $('.tooltip').remove()

  # 切換學年度學期
  $("#Semester").on "click", ".btn", (event) ->
    schoolYear = $(@).attr("school-year")
    semester = $(@).attr("semester")
    $(".tooltip").remove()
    $("#ExamScore").find('thead').html('').end().find('tbody').html "<tr><td>載入中...</td></tr>"
    Exam.score(schoolYear, semester)

  # 切換成績模式
  $("body").on "click", "input:radio[name='show_model']", () ->
    Exam.setModel($(@).val())


Exam = do ->
  _system_type = gadget.params.system_type or "kh"
  _system_exam_must_enddate = gadget.params.system_exam_must_enddate or "true"
  _system_fix_must_enddate = gadget.params.system_fix_must_enddate or "true"
  _system_show_model = gadget.params.system_show_model or "subject"
  _system_position = gadget.params.system_position or "student"
  _students = null
  _student = null
  _curr_schoolyear = null
  _curr_semester = null
  _exam_score = {}
  _places = null
  _math_type = null
  _keys = [
   "國語文:國文"
   "國語文"
   "英語:英文"
   "英語"
   "語文:國文"
   "語文:英文"
   "語文"
   "數學"
   "社會:歷史"
   "社會:地理"
   "社會:公民"
   "社會"
   "自然與生活科技:理化"
   "自然與生活科技:生物"
   "自然與生活科技:物理"
   "自然與生活科技:化學"
   "自然與生活科技"
   "健康與體育"
   "藝術與人文"
   "綜合活動"
   "彈性課程"
  ]
  _schoolYear = null
  _semester = null
  _connection = null
  _now = null

  if _system_position is "parent"
    _connection = gadget.getContract("ischool.exam.parent")
  else
    _connection = gadget.getContract("ischool.exam.student")
    _student = {
      StudentID : 0
    }


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

        _connection.send
          service: "_.GetNow"
          body: {}
          result: (response, error, http) ->
            if error isnt null
              set_error_message "#mainMsg", "GetNow", error
            else
              _now = new Date(response.Now)
              getStudentInfo()


  # 取得全部子女資料
  getStudentInfo = ->
    if _system_position is "student"
      _exam_score[0] = [];
      getStudentRuleSeme()
    else if _system_position is "parent"
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
                _exam_score[student.StudentID] = [];

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
          if response.ScoreCalcRule?.Content?.ScoreCalcRule?['成績計算規則']?['各項成績計算位數']?['科目成績計算']?
            obj = response.ScoreCalcRule.Content.ScoreCalcRule["成績計算規則"]["各項成績計算位數"]["科目成績計算"]
            _places = obj["位數"] or 0
            switch obj["進位方式"]
              when "無條件進位"
                _math_type = "ceil"
              when "無條件捨去"
                _math_type = "floor"
              when "四捨五入"
                _math_type = "round"

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

                  $("#Semester .btn-group").html(items.join(""))

                  if $("#Semester .btn-group button[school-year="+_schoolYear+"][semester="+_semester+"]").length > 0
                    $("#Semester .btn-group button[school-year="+_schoolYear+"][semester="+_semester+"]").trigger "click"
                  else
                    $("#Semester .btn-group button:first").trigger "click"
                else
                  $("#ExamScore tbody").html """<tr><td>目前無資料</td></tr>"""

  # 清除畫面
  resetData = ->
    $("#ExamScore thead").html ""
    $("#ExamScore tbody").html ""


  # 取得評量成績
  loadScore = (schoolYear, semester) ->
    _schoolYear = schoolYear
    _semester = semester
    isCurrSemester = (schoolYear is _curr_schoolyear and semester is _curr_semester)

    if (_exam_score[_student.StudentID][schoolYear + semester])
      showScore(_exam_score[_student.StudentID][schoolYear + semester], isCurrSemester)
    else
      request = Content:
        Condition:
          SchoolYear: schoolYear
          Semester: semester

      if _system_position is "parent" then request.Content.Condition.StudentID = _student.StudentID

      _connection.send
        service: "_.GetJHCourseExamScore"
        body: request
        result: (response, error, http) ->
          if error isnt null
            set_error_message "#mainMsg", "GetJHCourseExamScore", error
          else
            if response.ExamScoreList?.Seme?.Course?
              # 解析樣版產出 exam_list
              # 高雄有固定的平時成績，OrdinarilyScore為其成績，FixTime是繳交期限
              # 新竹每次皆有對等的定期、平時成績，AssignmentScore為其成績，EndTime是繳交期限
              # 如為目前學年度學期，如在繳交期限前不顯示
              # Subject：沒有科目，代表社團成績；Domain：沒有領域，代表彈性課程
              # Credit：權數, Period：節數
              oCourse = myHandleArray(response.ExamScoreList.Seme.Course)
              _exam_score[_student.StudentID][schoolYear + semester] = {
                Domain: {}
                Course: []
                ExamList: []
                FixExam: {
                  AvgTFScore: null
                  TotalTFCredit: 0
                  TotalTFScore: 0
                }
              }
              aDomain = _exam_score[_student.StudentID][schoolYear + semester].Domain;
              aCourse = _exam_score[_student.StudentID][schoolYear + semester].Course;
              aExamList = _exam_score[_student.StudentID][schoolYear + semester].ExamList;
              aFixExam = _exam_score[_student.StudentID][schoolYear + semester].FixExam;

              $(oCourse).each (index, course) ->
                credit = null
                fix_score = null
                course.Domain = course.Domain or '彈性課程'
                credit = Number(course.Credit) if course.Credit
                fix_score = Number(course.FixExtension.Extension.OrdinarilyScore) if course.FixExtension?.Extension?.OrdinarilyScore? and course.FixExtension.Extension.OrdinarilyScore

                # 領域的科目統計資料
                if (!aDomain["domain:" + course.Domain])
                  aDomain["domain:" + course.Domain] = {
                    'Domain': course.Domain
                    'CourseCount': 0
                    'TotalFCredit': 0
                    'TotalFScore': 0
                    'AvgFScore': null
                    'Flag': null
                    'Exams': {}
                  }
                aDomain["domain:" + course.Domain].CourseCount += 1

                exams = []

                if course.Exam?
                  $(course.Exam).each (index, exam) ->
                    ext_score = null
                    ext_assignmentScore = null
                    avg_score = null

                    if exam.ExamID
                      # 設定定期評量成績
                      if exam.ScoreDetail?.Extension?.Extension?
                        $(exam.ScoreDetail.Extension.Extension).each (index, extension) ->
                          # 定期分數
                          ext_score = Number(extension.Score) if extension.Score
                          # 新竹平時分數
                          ext_assignmentScore = Number(extension.AssignmentScore) if extension.AssignmentScore
                          if ext_score and ext_assignmentScore
                            avg_score = FloatMath(FloatMath(ext_score, '+', ext_assignmentScore), '/', 2)
                          else if ext_score
                            avg_score = ext_score
                          else
                            avg_score = ext_assignmentScore

                      # 定期評量資料
                      exams[exam.ExamID] = {
                        ExamID: exam.ExamID
                        ExamName: exam.ExamName
                        EndTime: exam.ScoreDetail.EndTime if exam.ScoreDetail?.EndTime?
                        Score1: ext_score
                        Score2: ext_assignmentScore
                        Avg: avg_score
                        CreditScore: FloatMath(avg_score, '*', credit) if avg_score? and credit
                        Flag: null
                      }

                      # 定期評量領域加權
                      if !aDomain["domain:" + course.Domain].Exams[exam.ExamID]
                        aDomain["domain:" + course.Domain].Exams[exam.ExamID] = {
                          'TotalCredit': 0
                          'TotalCScore': 0
                          'AvgCScore': null
                          'Flag': null
                        }

                      if !aExamList['exam:' + exam.ExamID]
                        aExamList['exam:' + exam.ExamID] = {
                          ExamID: exam.ExamID
                          ExamName: exam.ExamName
                          ExamDisplayOrder: exam.ExamDisplayOrder
                          TotalECredit: 0
                          TotalEScore: 0
                          AvgEScore: null
                          Flag: null
                        }
                        aExamList.push aExamList['exam:'+ exam.ExamID]


                # 科目的定期及平時評量資料
                aCourse[course.Domain + ":" + course.Subject] = {
                  Index: course.Domain + ":" + course.Subject
                  Domain: course.Domain
                  Subject: course.Subject
                  Credit: credit
                  FixEndTime: course.FixTime.Extension.OrdinarilyEndTime if course.FixTime?.Extension?.OrdinarilyEndTime?
                  FixScore: fix_score
                  Exams: exams
                }
                aCourse.push aCourse[course.Domain + ":" + course.Subject]


              # 領域科目排序
              aCourse.sort(Comparer)

              aExamList.sort((a, b) ->
                return parseInt(a.ExamDisplayOrder, 10) > parseInt(b.ExamDisplayOrder, 10)
              )


              # 計算平均
              avgScore(_exam_score[_student.StudentID][schoolYear + semester], isCurrSemester)

            else
              _exam_score[_student.StudentID][schoolYear + semester] = null

            if $("#Semester button.active").attr("school-year") is schoolYear and $("#Semester button.active").attr("semester") is semester
              showScore(_exam_score[_student.StudentID][schoolYear + semester], isCurrSemester)

  # 領域定期、平時加權平均
  avgScore = (exam_data, isCurrSemester) ->
    exam_process = () ->
      # 科目：定期評量與上次成績比較進退步
      $(exam_data.Course).each (key, course) ->
        pre_score = -1
        ii = 0
        for key, exam of course.Exams
          ii += 1
          if exam.Avg? and course.Subjec isnt '體育'
            if ii isnt 1 and exam.Avg isnt '未開放'
              if exam.Avg > pre_score
                exam.Flag = 'up'
              else if exam.Avg < pre_score
                exam.Flag = 'down'

            pre_score = exam.Avg


      # 領域：計算定期評量加權總分
      $(exam_data.Course).each (key, course) ->
        credit = course.Credit
        for key, exam of course.Exams
          if exam.Avg? and exam.Avg isnt '未開放' and credit and course.Domain isnt '彈性課程'
            exam_data.Domain["domain:" + course.Domain].Exams[exam.ExamID].TotalCredit = FloatMath(credit, '+', exam_data.Domain["domain:" + course.Domain].Exams[exam.ExamID].TotalCredit)
            exam_data.Domain["domain:" + course.Domain].Exams[exam.ExamID].TotalCScore = FloatMath(FloatMath(exam.Avg, '*', credit), '+', exam_data.Domain["domain:" + course.Domain].Exams[exam.ExamID].TotalCScore)
            exam_data.ExamList['exam:' + exam.ExamID].TotalECredit = FloatMath(credit, '+', exam_data.ExamList['exam:' + exam.ExamID].TotalECredit)
            exam_data.ExamList['exam:' + exam.ExamID].TotalEScore = FloatMath(FloatMath(exam.Avg, '*', credit), '+', exam_data.ExamList['exam:' + exam.ExamID].TotalEScore)


      # 領域：計算定期評量加權平均AvgCScore、進退步
      for key, domain of exam_data.Domain
        ii = 0
        domainName = domain.DomainName
        for key, exam of domain.Exams
          ii += 1
          if exam.TotalCredit > 0
            exam.AvgCScore = FloatFormat(FloatMath(exam.TotalCScore, '/', exam.TotalCredit), _math_type, _places)
            if ii isnt 1
              if exam.AvgCScore > pre_score
                exam.Flag = 'up'
              else if exam.AvgCScore < pre_score
                exam.Flag = 'down'

            pre_score = exam.AvgCScore


      # 定期評量的總加權平均，進退步
      ii = 0
      $(exam_data.ExamList).each (key, exam) ->
        if exam.TotalECredit > 0
          exam.AvgEScore = FloatFormat(FloatMath(exam.TotalEScore, '/', exam.TotalECredit), _math_type, _places)
          ii += 1
          if ii isnt 1
            if exam.AvgEScore > pre_score
              exam.Flag = 'up'
            else if exam.AvgEScore < pre_score
              exam.Flag = 'down'

          pre_score = exam.AvgEScore



      # 平時評量加權總分，總平均
      $(exam_data.Course).each (key, course) ->
        credit = course.Credit
        fix_score = course.FixScore
        if course.FixScore? and course.FixScore isnt '未開放' and credit and course.Domain isnt '彈性課程'
          exam_data.Domain["domain:" + course.Domain].TotalFCredit = FloatMath(credit, '+', exam_data.Domain["domain:" + course.Domain].TotalFCredit)
          exam_data.Domain["domain:" + course.Domain].TotalFScore = FloatMath(FloatMath(fix_score, '*', credit), '+', exam_data.Domain["domain:" + course.Domain].TotalFScore)
          exam_data.FixExam.TotalTFCredit = FloatMath(credit, '+', exam_data.FixExam.TotalTFCredit)
          exam_data.FixExam.TotalTFScore = FloatMath(FloatMath(fix_score, '*', credit), '+', exam_data.FixExam.TotalTFScore)


      # 領域：平時評量的加權平均
      ii = 0
      for key, domain of exam_data.Domain
        if domain.TotalFCredit > 0
          domain.AvgFScore = FloatFormat(FloatMath(domain.TotalFScore, '/', domain.TotalFCredit), _math_type, _places)

          pre_score = domain.AvgFScore


      # 平時評量加權總平均
      if exam_data.FixExam.TotalTFCredit
        exam_data.FixExam.AvgTFScore = FloatFormat(FloatMath(exam_data.FixExam.TotalTFScore, '/', exam_data.FixExam.TotalTFCredit), _math_type, _places)



    # 先取得目前時間，再處理資料顯示
    if isCurrSemester and (_system_exam_must_enddate is "true" or _system_fix_must_enddate is "true")
      # 若為當年度且輸入時間未截止，重設定期評量科目平均Avg為「未開放」
      if _system_exam_must_enddate is "true"
        # 領域科目
        $(exam_data.Course).each (key, course) ->
          domainName = course.Domain
          for key, exam of course.Exams
            # 目前學年度時，依設定是否於輸入截止才顯示
            if exam.EndTime
              if new Date(exam.EndTime) >= _now
                exam.Avg = '未開放'

      # 若為當年度且輸入時間未截止，重設平時評量科目成績為「未開放」
      if _system_fix_must_enddate is "true"
        $(exam_data.Course).each (key, course) ->
          if course.FixEndTime
            if new Date(course.FixEndTime) >= _now
              course.FixScore = '未開放'

        exam_process()
    else
      exam_process()



  # 顯示評量成績
  showScore= (exam_data, isCurrSemester) ->
    # console.log exam_data
    thead1 = []
    thead2 = []
    thead_html = ""
    tbody1 = []
    tbody_html = ""
    pre_domain = null

    if exam_data
      # 表頭
      $(exam_data.ExamList).each (key, exam) ->
        thead1.push """<th colspan="2" class="my-examname-thead">#{exam.ExamName}</th>"""
        if _system_type is "hc" and _system_show_model is "subject"
          thead2.push """<th colspan="2" class="my-subject-thead">總成績(定期/平時)</th>"""
        else
          thead2.push """<th colspan="2">成績</th>"""

      switch _system_type
        when "kh"
          thead_html = """
            <tr class="my-nofill">
              <th rowspan="2">領域名稱</th>
              <th rowspan="2">科目名稱</th>
              <th rowspan="2">權數</th>
              #{thead1.join("")}
              <th class="my-fix-thead">平時評量</th>
            </tr>
            <tr class="my-nofill">#{thead2.join("")}<th>成績</th></tr>
          """
        else
          thead_html = """
            <tr class="my-nofill">
              <th rowspan="2">領域名稱</th>
              <th rowspan="2">科目名稱</th>
              <th rowspan="2">權數</th>
              #{thead1.join("")}
            </tr>
            <tr class="my-nofill">#{thead2.join("")}</tr>
          """


      # 領域科目
      $(exam_data.Course).each (key, course) ->
        domain = exam_data.Domain['domain:' + course.Domain]

        tbody1.push """<tr>"""

        if course.Domain isnt pre_domain
          tbody1.push """<th rowspan="#{domain.CourseCount}">#{course.Domain}</th>"""

        if course.Domain is '彈性課程'
          tbody1.push """
            <th colspan="2">#{course.Subject}</th>
          """
        else
          tbody1.push """
            <th>#{course.Subject}</th>
            <th>#{course.Credit}</th>
          """

        $(exam_data.ExamList).each (key, item) ->
          exam = course.Exams[item.ExamID]
          td_score = null

          if exam

            # 有成績且可顯示時資料處理
            switch _system_type
              when "kh"
                # 高雄的分數評量
                td_score = if exam.Avg? then exam.Avg else ''

              when "hc"
                # 新竹 平均(定期分數, 平時分數)
                if exam.Score1? and exam.Score2?
                  td_score = """
                    <span class="my-avg-score"> #{Number(exam.Avg).toFixed(_places)} </span>( #{exam.Score1} / #{exam.Score2} )
                  """
                else if exam.Score1?
                  td_score = exam.Score1
                else if exam.Score2?
                  td_score = exam.Score2
                else
                  td_score = ''

            # 定期評量
            if _system_show_model is "domain" and course.Domain isnt pre_domain
              # 領域
              if domain.Exams[exam.ExamID]?.AvgCScore?
                td_score = Number(domain.Exams[exam.ExamID].AvgCScore).toFixed(_places)
                if domain.Exams[exam.ExamID].AvgCScore < 60
                  tbody1.push """<td class="my-fail" rowspan="#{domain.CourseCount}">#{td_score}</td>"""
                else
                  tbody1.push """<td rowspan="#{domain.CourseCount}">#{td_score}</td>"""
              else
                tbody1.push """<td rowspan="#{domain.CourseCount}"></td>"""

              if domain.Exams[exam.ExamID].Flag is "up"
                tbody1.push """<td class="my-effect" rowspan="#{domain.CourseCount}"><span class="my-progress">↑</span></td>"""
              else if domain.Exams[exam.ExamID].Flag is "down"
                tbody1.push """<td class="my-effect" rowspan="#{domain.CourseCount}"><span class="my-regress">↓</span></td>"""
              else
                tbody1.push """<td class="my-effect" rowspan="#{domain.CourseCount}">&nbsp;</td>"""

            else if _system_show_model is "subject"
              # 科目
              if exam.Avg isnt '未開放'
                # 顯示成績，未達60分以紅色表示
                if exam.Avg? and exam.Avg < 60
                  tbody1.push """<td class="my-fail" my-data="#{exam.ExamID}">#{td_score}</td>"""
                else
                  tbody1.push """<td my-data="#{exam.ExamID}">#{td_score}</td>"""

                if exam.Flag is "up"
                  tbody1.push """<td class="my-effect"><span class="my-progress">↑</span></td>"""
                else if exam.Flag is "down"
                  tbody1.push """<td class="my-effect"><span class="my-regress">↓</span></td>"""
                else
                  tbody1.push """<td class="my-effect">&nbsp;</td>"""
              else
                tbody1.push """
                  <td rel="tooltip"
                    title="#{if exam.EndTime then exam.EndTime.toString() + "後開放" else "尚未開放"}">
                    未開放</td>
                  <td class="my-effect">&nbsp;</td>
                """
          else
            if _system_show_model is "subject"
              tbody1.push """<td>&nbsp;</td><td>&nbsp;</td>"""
            else if _system_show_model is "domain" and course.Domain isnt pre_domain
              tbody1.push """
                <td rowspan="#{domain.CourseCount}"></td>
                <td class="my-effect" rowspan="#{domain.CourseCount}">&nbsp;</td>"""

        # 高雄平時評量
        if _system_type is "kh"
          if _system_show_model is "subject" and course.FixScore is '未開放'
              tbody1.push """<td my-data="Ordinarily" rel="tooltip"
                title="#{if course.FixEndTime then course.FixEndTime.toString() + "後開放" else "尚未開放"}">
                未開放</td>
              """
          else
            if _system_show_model is "domain"
              # 領域：平時評量加權
              if course.Domain isnt pre_domain
                if domain.AvgFScore?
                  if domain.AvgFScore < 60
                    tbody1.push """<td rowspan="#{domain.CourseCount}" class="my-fail" my-data="Ordinarily">#{Number(domain.AvgFScore).toFixed(_places)}</td>"""
                  else
                    tbody1.push """<td rowspan="#{domain.CourseCount}" my-data="Ordinarily">#{Number(domain.AvgFScore).toFixed(_places)}</td>"""
                else
                  tbody1.push """<td rowspan="#{domain.CourseCount}" my-data="Ordinarily"></td>"""
            else if _system_show_model is "subject"
              # 科目：平時評量成績
              if course.FixScore?
                if course.FixScore < 60
                  tbody1.push """<td class="my-fail" my-data="Ordinarily">#{course.FixScore}</td>"""
                else
                  tbody1.push """<td my-data="Ordinarily">#{course.FixScore}</td>"""
              else
                tbody1.push """<td my-data="Ordinarily"></td>"""

        tbody1.push "</tr>"

        # 上次迴圈的領域名
        pre_domain = course.Domain


      # 定期評量平均、及加權總平均
      tbody1.push """<tr><th colspan="3">加權平均</th>"""

      $(exam_data.ExamList).each (key, exam) ->
        if exam.TotalECredit
          if exam.AvgEScore? and exam.AvgEScore < 60
            tbody1.push """<td class="my-fail" my-data="#{exam.ExamID}" colspan="2">#{Number(exam.AvgEScore).toFixed(_places)}</td>"""
          else
            tbody1.push """<td my-data="#{exam.ExamID}" colspan="2">#{Number(exam.AvgEScore).toFixed(_places)}</td>"""
        else
          tbody1.push """<td my-data="#{exam.ExamID}" colspan="2"></td>"""


      if _system_type is "kh"
        if exam_data.FixExam.TotalTFCredit
          if exam_data.FixExam.AvgTFScore? and exam_data.FixExam.AvgTFScore < 60
            tbody1.push """<td class="my-fail" my-data="#{exam.ExamID}" colspan="2">#{Number(exam_data.FixExam.AvgTFScore).toFixed(_places)}</td>"""
          else
            tbody1.push """<td colspan="2">#{Number(exam_data.FixExam.AvgTFScore).toFixed(_places)}</td>"""
        else
          tbody1.push """<td colspan="2"></td>"""


      tbody1.push """</tr>"""
      tbody_html = tbody1.join("")
      $("#ExamScore").find("thead").html(thead_html).end().find("tbody").html(tbody_html).end().find("td[rel='tooltip']").tooltip()
    else
      $("#ExamScore").find("thead").html("").end().find("tbody").html "<tr><td>目前無資料</td></tr>"



  # 錯誤訊息
  set_error_message = (select_str, serviceName, error) ->
    tmp_msg = """<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(#{serviceName})"""
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


  # 浮點數運算
  FloatMath = (x, operators, y) ->
    arg1 = x + ''
    arg2 = y + ''
    try
      r1 = arg1.split(".")[1].length
    catch e
      r1 = 0

    try
      r2 = arg2.split(".")[1].length
    catch e
      r2 = 0

    m = Math.max(r1, r2)

    switch operators
      when "+"
        ((Number(arg1) * Math.pow(10, m)) + (Number(arg2) * Math.pow(10, m))) / Math.pow(10, m)
      when "-"
        ((Number(arg1) * Math.pow(10, m)) - (Number(arg2) * Math.pow(10, m))) / Math.pow(10, m)
      when "*"
        m = r1 + r2
        (Number(arg1.replace(".", "")) * Number(arg2.replace(".", ""))) / Math.pow(10, m)
      when "/"
        (Number(arg1) * Math.pow(10, m)) / (Number(arg2) * Math.pow(10, m))


  #四捨五入、無條件捨去、無條件進位
  FloatFormat = (arg1, type, places) ->
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
    ComparerWithKeys = (s1, s2) ->
      return 0  if s1 is s2
      return 1  if s1.length is 0
      return -1  if s2.length is 0
      maxLength = (if (s1.length > s2.length) then s2.length else s1.length)
      i = 0

      while i < maxLength

        #先用兩個字串的開頭比關鍵字
        for index of _keys
          b1 = false
          b2 = false
          key = _keys[index]
          b1 = (if (s1.indexOf(key) is 0) then true else false)
          b2 = (if (s2.indexOf(key) is 0) then true else false)
          return -1  if b1 and not b2
          return 1  if b2 and not b1

        #如果兩個字串第一個字相同就砍掉第一個再比一次
        if s1.substring(0, 1) is s2.substring(0, 1)
          s1 = s1.substring(1, s1.length)
          s2 = s2.substring(1, s2.length)
        else
          return (if s1.substring(0, 1) < s2.substring(0, 1) then -1 else 1)
        i++
      return 0  if s1 is s2
      return -1  unless s1
      return 1  unless s2

      ComparerWithKeys s1, s2
    ComparerWithKeys s1.Index, s2.Index

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

  # 初始化
  getCurrSemester()


  # 外部函數
  {
    'score': (schoolYear, semester) ->
      loadScore(schoolYear, semester)
    'setModel': (model) ->
      _system_show_model = model
      loadScore(_schoolYear, _semester)
    'onChangeStudent': (index)->
      resetData()
      _student = _students[index]
      getStudentRuleSeme()
  }
