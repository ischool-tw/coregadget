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
          if response.ScoreCalcRule?.Content?.ScoreCalcRule?['成績計算規則']?['各項成績計算位數']?['科目成績計算']
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

                  $("#Semester .btn-group").html(items.join("")).find(".btn:first").trigger "click"
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

    if (_exam_score[schoolYear + semester])
      showScore(_exam_score[schoolYear + semester], isCurrSemester)
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
            if response.ExamScoreList?.Seme?.Course
              oCourse = myHandleArray(response.ExamScoreList.Seme.Course).sort(Comparer)
              oScore = _exam_score[schoolYear + semester] = []
              oElasticity = {
                'Domain': '彈性課程'
                'Courses': []
              }

              getIndex = (obj, uid, key) ->
                ret = -1
                $(obj).each (index, item) ->
                  ret = index  if item[key] is uid
                ret

              $(oCourse).each (index, course) ->
                course.Domain = course.Domain ? '彈性課程'
                course.Subject = course.Subject ? '社團'

                if course.Domain is '彈性課程'
                  oElasticity.Courses.push course
                else
                  idx = getIndex(oScore, course.Domain, 'Domain')

                  if idx is -1
                    obj = {
                      'Domain': course.Domain
                      'Courses': [course]
                    }
                    oScore.push obj
                  else
                    oScore[idx].Courses.push course

              if oElasticity.Courses.length > 0 then oScore.push oElasticity
            else
              _exam_score[schoolYear + semester] = null

            if $("#Semester button.active").attr("school-year") is schoolYear and $("#Semester button.active").attr("semester") is semester
              showScore(_exam_score[schoolYear + semester], isCurrSemester)

  # 顯示評量成績
  showScore = (exam_data, isCurrSemester) ->
    # 解析樣版產出 exam_list
    # 高雄有固定的平時成績，OrdinarilyScore為其成績，FixTime是繳交期限
    # 新竹每次皆有對等的定期、平時成績，AssignmentScore為其成績，EndTime是繳交期限
    # 如為目前學年度學期，如在繳交期限前不顯示
    # Subject：沒有科目，代表社團成績；Domain：沒有領域，代表彈性課程
    # Credit：權數, Period：節數
    # total_score：計算定時評量平時評量總平均
    # total_domain_score：計算定時評量領域加權
    # total_fixdomain_score：計算高雄平時評量領域加權
    exam_list = []
    thead1 = []
    thead2 = []
    thead_html = ""
    tbody1 = []
    tbody_html = ""
    total_score = {
      'fixdomain': {
        'examTotal': 0
        'examCount': 0
        'weightTotal': 0
        'weightCount': 0
      }
    }
    total_domain_score = {}
    total_fixdomain_score = {}
    now = new Date()

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
      if exam_data
        # 整理定期評量，定時評量平均預設值
        $(exam_data).each (index, domain) ->
          $(domain.Courses).each (index, course) ->
            $(course.Exam).each (index, exam) ->
              if exam.ExamID
                if $.inArray(exam.ExamID, exam_list) is -1
                  exam_list.push exam.ExamID
                  thead1.push """<th colspan="2">#{exam.ExamName}</th>"""
                  thead2.push """<th colspan="2">成績</th>"""
                  total_score[exam.ExamID] = {
                    'examTotal': 0
                    'examCount': 0
                    'weightTotal': 0
                    'weightCount': 0
                  }

        # 領域
        $(exam_data).each (index, domain) ->

          if _system_show_model is "domain" then pre_score = -999

          # 重設領域定期評量加權預設值
          $(exam_list).each (index, examid) ->
            total_domain_score[examid] = {
              'weightTotal': 0
              'weightCount': 0
              'tbody1Index': 0
            }

          # 重設平時評量領域加權預設值
          total_fixdomain_score = {
            'weightTotal': 0
            'weightCount': 0
            'tbody1Index': 0
          }

          # 科目
          $(domain.Courses).each (idx, course) ->

            tbody1.push """<tr>"""

            if idx is 0 then tbody1.push """<th rowspan="#{domain.Courses.length}">#{domain.Domain}</th>"""

            tbody1.push """
              <th>#{course.Subject}</th>
              <th>#{course.Credit}</th>
            """

            if _system_show_model is "subject" then pre_score = -999

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
                      endtime = new Date(exam.ScoreDetail.EndTime)
                      show_data = false  if endtime >= now

                # 有成績且可顯示時資料處理
                if exam.ScoreDetail and exam.ScoreDetail.Extension and show_data
                  extension = exam.ScoreDetail.Extension.Extension
                  switch _system_type
                    when "kh"
                      # 高雄的分數評量
                      ext_score = extension.Score or ""
                      avg_score = parseInt(ext_score, 10)
                      td_score = if (ext_score) then Number(avg_score).toFixed(_places) else ""

                    when "hs"
                      # 新竹定期分數
                      ext_score = extension.Score or ""

                      # 新竹平時分數
                      ext_assignmentScore = extension.AssignmentScore or ""
                      if ext_score and ext_assignmentScore
                        avg_score = FloatMath(FloatDiv(FloatAdd(ext_score, ext_assignmentScore), 2), _math_type, _places)
                        td_score = """
                          <span class="my-avg-score"> #{Number(avg_score).toFixed(_places)} </span>
                          ( #{ext_score} / #{ext_assignmentScore} )
                        """
                      else if ext_score
                        avg_score = parseInt(ext_score, 10)
                        td_score = (if (ext_score) then Number(avg_score).toFixed(_places) else "")
                      else
                        avg_score = parseInt(ext_assignmentScore, 10)
                        td_score = (if (ext_assignmentScore) then Number(avg_score).toFixed(_places) else "")

                  if avg_score?
                    total_score[exam.ExamID]['examTotal'] = FloatAdd(total_score[exam.ExamID]['examTotal'], avg_score)
                    total_score[exam.ExamID]['examCount'] += 1
                    total_score[exam.ExamID]['weightTotal'] = FloatAdd(total_score[exam.ExamID]['weightTotal'], FloatMul(avg_score, course.Credit))
                    total_score[exam.ExamID]['weightCount'] += parseInt(course.Credit || 0, 10)

                    total_domain_score[exam.ExamID]['weightTotal'] = FloatAdd(total_domain_score[exam.ExamID]['weightTotal'], FloatMul(avg_score, course.Credit))
                    total_domain_score[exam.ExamID]['weightCount'] += parseInt(course.Credit || 0, 10)

                # 領域加權時的處理，記錄index及預設的加權欄位
                if _system_show_model is "domain" && idx is 0
                  total_domain_score[exam.ExamID]['tbody1Index'] = tbody1.length
                  tbody1.push """<td rowspan="#{domain.Courses.length}"></td><td rowspan="#{domain.Courses.length}"></td>"""

                # 科目成績
                if _system_show_model is "subject"
                  if show_data is true
                    if td_score
                      # 顯示成績，未達60分以紅色表示
                      if avg_score and avg_score < 60
                        tbody1.push """<td class="my-fail" my-data="#{exam.ExamID}">#{td_score}</td>"""
                      else
                        tbody1.push """<td my-data="#{exam.ExamID}">#{td_score}</td>"""

                      # 除了科目為「體育」和第一次考試，皆與上次比較進退步
                      if course.Subject is "體育" or pre_score is -999
                        tbody1.push "<td>&nbsp;</td>"
                      else
                        if avg_score > pre_score
                          tbody1.push """<td><span class="my-progress">↑</span></td>"""
                        else if avg_score < pre_score
                          tbody1.push """<td><span class="my-regress">↓</span></td>"""
                        else
                          tbody1.push "<td>&nbsp;</td>"
                      pre_score = avg_score
                    else
                      tbody1.push "<td></td><td></td>"
                  else if show_data is false
                    tbody1.push """
                      <td colspan="2" rel="tooltip"
                        title="#{if exam.ScoreDetail.EndTime then exam.ScoreDetail.EndTime + "後開放" else "尚未開放"}">
                        未開放</td>
                    """
                  else
                    tbody1.push "<td></td><td></td>"

              else
                if _system_show_model is "domain" && idx is 0
                  tbody1.push """<td rowspan="#{domain.Courses.length}"></td><td rowspan="#{domain.Courses.length}"></td>"""
                else if _system_show_model is "subject"
                  tbody1.push "<td></td><td></td>"

            # 高雄平時評量
            if _system_type is "kh"
              fixenddate = null
              show_fix = true
              fix_score = null

              # 目前學年度時，依設定是否於輸入截止才顯示
              if isCurrSemester
                if _system_fix_must_enddate is "true"
                  if course.FixTime and course.FixTime.Extension and course.FixTime.Extension.OrdinarilyEndTime
                    fixenddate = new Date(course.FixTime.Extension.OrdinarilyEndTime)
                    show_fix = false  if fixenddate >= now

              if show_fix is true
                if course.FixExtension?.Extension?.OrdinarilyScore
                  fix_score = course.FixExtension.Extension.OrdinarilyScore


                if _system_show_model is "domain"
                  # 記錄平時評量加權，總加權
                  if fix_score
                    total_fixdomain_score['weightTotal'] = FloatAdd(total_fixdomain_score['weightTotal'], FloatMul(fix_score, course.Credit))
                    total_fixdomain_score['weightCount'] += parseInt(course.Credit || 0, 10)
                    total_score['fixdomain']['weightTotal'] += total_fixdomain_score['weightTotal']
                    total_score['fixdomain']['weightCount'] += total_fixdomain_score['weightCount']

                  # 記錄index及預設的加權欄位
                  if idx is 0
                    total_fixdomain_score['tbody1Index'] = tbody1.length
                    tbody1.push """<td rowspan="#{domain.Courses.length}" my-data="Ordinarily"></td>"""
                else if _system_show_model is "subject"
                  if fix_score
                    total_score['fixdomain']['examTotal'] = FloatAdd(total_score['fixdomain']['examTotal'], fix_score)
                    total_score['fixdomain']['examCount'] += 1
                    if parseInt(fix_score, 10) < 60
                      tbody1.push """<td class="my-fail" my-data="Ordinarily">#{Number(fix_score).toFixed(_places)}</td>"""
                    else
                      tbody1.push """<td my-data="Ordinarily">#{Number(fix_score).toFixed(_places)}</td>"""
                  else
                    tbody1.push "<td></td>"
              else if show_fix is false
                if _system_show_model is "domain" and idx is 0
                  tbody1.push """
                    <td rowspan="#{domain.Courses.length}" my-data="Ordinarily" rel="tooltip"
                      title="#{if fixenddate then fixenddate + "後開放" else "尚未開放"}">
                      未開放</td>
                  """
                else if _system_show_model is "subject"
                  tbody1.push """<td my-data="Ordinarily" rel="tooltip"
                    title="#{if fixenddate then fixenddate + "後開放" else "尚未開放"}">
                    未開放</td>
                  """
            tbody1.push "</tr>"

          # 填入加權平均欄位
          if _system_show_model is "domain"
            # 填入領域定期成績的加權平均
            $(exam_list).each (index, examid) ->
              domain_html = ""
              avg_domain_score = if total_domain_score[examid]['weightCount']? then FloatMath(FloatDiv(total_domain_score[examid]['weightTotal'], total_domain_score[examid]['weightCount']), _math_type, _places) else null

              if total_domain_score[examid]['weightCount']
                if avg_domain_score and avg_domain_score < 60
                  domain_html += """<td class="my-fail" my-data="#{examid}" rowspan="#{domain.Courses.length}">#{Number(avg_domain_score).toFixed(_places)}</td>"""
                else
                  domain_html += """<td my-data="#{examid}" rowspan="#{domain.Courses.length}">#{Number(avg_domain_score).toFixed(_places)}</td>"""

                if pre_score is -999
                  domain_html += """<td rowspan="#{domain.Courses.length}">&nbsp;</td>"""
                else
                  if avg_domain_score > pre_score
                    domain_html += """<td rowspan="#{domain.Courses.length}"><span class="my-progress">↑</span></td>"""
                  else if avg_domain_score < pre_score
                    domain_html += """<td rowspan="#{domain.Courses.length}"><span class="my-regress">↓</span></td>"""
                  else
                    domain_html += """<td rowspan="#{domain.Courses.length}">&nbsp;</td>"""
              else
                domain_html += """<td my-data="#{examid}" rowspan="#{domain.Courses.length}">&nbsp;</td>"""
                domain_html += """<td rowspan="#{domain.Courses.length}">&nbsp;</td>"""

              if total_domain_score[examid]['tbody1Index'] isnt 0
                tbody1[total_domain_score[examid]['tbody1Index']] = domain_html

              pre_score = avg_domain_score


            # 填入領域平時評量的加權平均
            if _system_type is "kh"
              domain_html = ""
              avg_domain_score = if total_fixdomain_score['weightCount']? then FloatMath(FloatDiv(total_fixdomain_score['weightTotal'], total_fixdomain_score['weightCount']), _math_type, _places) else null

              if total_fixdomain_score['weightCount']
                if avg_domain_score and avg_domain_score < 60
                  domain_html += """<td class="my-fail" my-data="Ordinarily" rowspan="#{domain.Courses.length}">#{Number(avg_domain_score).toFixed(_places)}</td>"""
                else
                  domain_html += """<td my-data="Ordinarily" rowspan="#{domain.Courses.length}">#{Number(avg_domain_score).toFixed(_places)}</td>"""
              else
                domain_html += """<td my-data="Ordinarily" rowspan="#{domain.Courses.length}"></td>"""


              if total_fixdomain_score['tbody1Index'] isnt 0
                tbody1[total_fixdomain_score['tbody1Index']] = domain_html



        # 定期評量平均、及加權總平均
        if _system_show_model is "subject"
          tbody1.push """<tr><th colspan="3">平均</th>"""
        else if _system_show_model is "domain"
          tbody1.push """<tr><th colspan="3">加權平均</th>"""

        $(exam_list).each (index, examid) ->
          exam_html = ""
          avg_exam_score = ""
          avg_count = 0
          if _system_show_model is "subject"
            avg_count = total_score[examid]['examCount'] or 0
            avg_exam_score = if total_score[examid]['examCount'] then FloatMath(FloatDiv(total_score[examid]['examTotal'], total_score[examid]['examCount']), _math_type, _places) else 0
          else if _system_show_model is "domain"
            avg_count = total_score[examid]['weightCount'] or 0
            avg_exam_score = if total_score[examid]['weightCount'] then FloatMath(FloatDiv(total_score[examid]['weightTotal'], total_score[examid]['weightCount']), _math_type, _places) else 0

          if avg_count
            if avg_exam_score and avg_exam_score < 60
              exam_html += """<td class="my-fail" my-data="#{examid}" colspan="2">#{Number(avg_exam_score).toFixed(_places)}</td>"""
            else
              exam_html += """<td my-data="#{examid}" colspan="2">#{Number(avg_exam_score).toFixed(_places)}</td>"""
          else
            exam_html += """<td my-data="#{examid}" colspan="2"></td>"""

          tbody1.push """#{exam_html}"""

        if _system_type is "kh"
          exam_html = ""
          avg_exam_score = ""
          avg_count = 0
          if _system_show_model is "subject"
            avg_count = total_score['fixdomain']['examCount'] or 0
            avg_exam_score = if total_score['fixdomain']['examCount'] then FloatMath(FloatDiv(total_score['fixdomain']['examTotal'], total_score['fixdomain']['examCount']), _math_type, _places) else 0
          else if _system_show_model is "domain"
            avg_count = total_score['fixdomain']['weightCount'] or 0
            avg_exam_score = if total_score['fixdomain']['weightCount'] then FloatMath(FloatDiv(total_score['fixdomain']['weightTotal'], total_score['fixdomain']['weightCount']), _math_type, _places) else 0

          if avg_count
            if avg_exam_score and avg_exam_score < 60
              exam_html += """<td class="my-fail" my-data="#{examid}" colspan="2"#{Number(avg_exam_score).toFixed(_places)}</td>"""
            else
              exam_html += """<td colspan="2">#{Number(avg_exam_score).toFixed(_places)}</td>"""
          else
            exam_html += """<td colspan="2"></td>"""

          tbody1.push """#{exam_html}"""

        tbody1.push """</tr>"""


        switch _system_type
          when "kh"
            thead_html = """
              <tr class="my-nofill">
                <th rowspan="2">領域名稱</th>
                <th rowspan="2">科目名稱</th>
                <th rowspan="2">權數</th>
                #{thead1.join("")}
                <th>平時評量</th>
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
        tbody_html = tbody1.join("")
        $("#ExamScore").find("thead").html(thead_html).end().find("tbody").html(tbody_html).end().find("td[rel='tooltip']").tooltip()
      else
        $("#ExamScore").find("thead").html("").end().find("tbody").html "<tr><td>目前無資料</td></tr>"

    # 先取得目前時間，再處理資料顯示
    if isCurrSemester and (_system_exam_must_enddate is "true" or _system_fix_must_enddate is "true")
      getNow (d1) ->
        now = d1
        exam_process()
    else
      exam_process()


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


  #四捨五入、無條件捨去、無條件進位
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
    ComparerWithKeys = (s1, s2) ->
      return 0  if s1 is s2
      return -1  if s1.length is 0
      return 1  if s2.length is 0
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
    ComparerWithKeys s1.Subject, s2.Subject

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
  if _system_position is "parent"
    getStudentInfo()
  else
    getStudentRuleSeme()

  # 外部函數
  {
    'score': (schoolYear, semester) ->
      loadScore schoolYear, semester
    'setModel': (model) ->
      _system_show_model = model
      loadScore(_schoolYear, _semester)
    'onChangeStudent': (index)->
      resetData()
      _student = _students[index]
      getStudentRuleSeme()
  }
