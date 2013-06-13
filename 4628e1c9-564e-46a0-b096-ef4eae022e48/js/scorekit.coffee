params = {
	courses: [],
	currentCourse: null,
	students : []
}

# gadget.onSizeChanged (size) ->
# 	$(".content-div").height size.height - 150
# 	$(".score-div").height size.height - 300

$ ->
	gadget.autofit document.getElementById "widget"

	$(".course-select").change () ->
		$(params.courses).each () ->
			if @CourseID is $(".course-select").val()
				params.currentCourse = @
				bindScores()

	$(".save").click () ->
		if params.currentCourse? and params.currentCourse.Confirmed isnt 'true'
			if params.currentCourse.IsScored isnt "true"
				alert "您並非評分教師，無法更動成績，如有任何疑問，請洽EMBA辦公室，謝謝!"
			else if confirm("是否確定儲存成績？") is true
				saveScores()

	$(".upload").click () -> uploadScore()
	$(".print").click () -> printScore "score"
	$(".print2").click () -> printScore "clear"

	getSemester()

getSemester = () ->
	gadget.getContract("emba.teacher").send {
		service: "default.GetSemester",
		body: "",
		result: (response, error, http) ->
			if response.Result?
				params.CurrentSchoolYear = response.Result.SystemConfig.DefaultSchoolYear
				params.CurrentSemester = response.Result.SystemConfig.DefaultSemester
				params.CurrentSchoolYear = 101
				params.CurrentSemester = 2

				gadget.getContract("emba.teacher").send {
					service: "default.GetSubjectScoreLock",
					body: """
						<Request>
							<SchoolYear>#{params.CurrentSchoolYear}</SchoolYear>
							<Semester>#{params.CurrentSemester}</Semester>
						</Request>""",
					result: (response, error, http) ->
						if response.Result?
							params.SubjectScoreLock = response.Result.IsLocked

						getCourses()
				}
	}

getCourses = () ->
	$(".course-select").html "<option value='0'>- 課程 -</option>"
	params.courses = []
	gadget.getContract("emba.teacher").send {
		service: "default.GetMyCourses",
		body: """
			<Request>
				<SchoolYear>#{params.CurrentSchoolYear}</SchoolYear>
				<Semester>#{params.CurrentSemester}</Semester>
			</Request>""",
		result: (response, error, http) ->
			if response.Result?
				$(response.Result.Course).each () ->
					params.courses.push @
					$(".course-select").append "<option value='#{@CourseID}'>#{@CourseTitle}</option>"

			if params.SubjectScoreLock is 't'
				$(".course-select").attr 'disabled', 'disabled'
	}

getCourseTeacherList = () ->
	$(".teacher-list").html "任課教師："
	gadget.getContract("emba.teacher").send {
		service: "default.GetCourseTeacherList",
		body: { Request: { CourseID: params.currentCourse.CourseID }},
		result: (response, error, http) ->
			if (response.Result?)
				teacher_name = []
				$(response.Result.Teacher).each () ->
					teacher_name.push @TeacherName
				$(".teacher-list").html "任課教師：#{teacher_name.join()}"
	}

bindScores = () ->
	getCourseTeacherList()

	$(".score-table tbody").html ""
	params.students = []
	gadget.getContract("emba.teacher").send {
		service: "default.GetStudents",
		body: { Request: { CourseID: params.currentCourse.CourseID }},
		result: (response, error, http) ->
			if (response.Result?)
				params.students = $(response.Result.Student)
				rowIndex = 0
				$(response.Result.Student).each (index, student) ->
					score_item = """
						<td width='80px' student-index='#{index}' row-index='#{rowIndex}'>
							<div class='score-item' contenteditable='true' student-index='#{index}' row-index='#{rowIndex}'>#{@Score}</div>
						</td>"""
					remark_item = """
						<td width='80px' student-index='#{index}' row-index='#{rowIndex}'>
							<div class='remark-item' contenteditable='true' student-index='#{index}' row-index='#{rowIndex}'>#{@Remark}</div>
						</td>"""

					if @IsCancel is "t"
						score_item = "<td width='100px'>***</td>"
						remark_item = "<td width='100px'>已停修</td>"
						@Score = "***"
						@Remark = "已停修"
					else
						rowIndex += 1

					$(".score-table tbody").append(
						"""<tr>
							<td width='200px'>#{@Department}</td>
							<td width='100px'>#{@StudentNumber}</td>
							<td width='100px'>#{@Name}</td>
							#{score_item}
							#{remark_item}
						</tr>"""
					)

				$(".score-item").blur () ->
					index = parseInt $(this).attr("student-index"), 10
					params.students[index].Score = $.trim($(@).html()).toUpperCase();

					score_type = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "F", "X", "***", ""]
					if $.inArray(params.students[index].Score, score_type) is -1
						params.students[index].Score = ''
						$(@).html('')
					else
						$(@).html $(@).html().toUpperCase()

				$(".score-item").keydown (event) ->
					if event.keyCode is 13
						stuIndex = parseInt $(@).attr("student-index"), 10
						rowIndex = parseInt $(@).attr("row-index"), 10

						if $(".score-item[row-index=#{rowIndex + 1}]")?
							$(".score-item[row-index=#{rowIndex + 1}]").focus()
						return false
					if event.keyCode is 38
						stuIndex = parseInt $(@).attr("student-index"), 10
						rowIndex = parseInt $(@).attr("row-index"), 10

						if $(".score-item[row-index=#{rowIndex - 1}]")?
							$(".score-item[row-index=#{rowIndex - 1}]").focus()
						return false
					if event.keyCode is 40
						stuIndex = parseInt $(@).attr("student-index"), 10
						rowIndex = parseInt $(@).attr("row-index"), 10

						if $(".score-item[row-index=#{rowIndex + 1}]")?
							$(".score-item[row-index=#{rowIndex + 1}]").focus()
						return false

				$(".remark-item").blur () ->
					index = parseInt $(this).attr("student-index"), 10
					params.students[index].Remark = $.trim($(@).html())

				$(".remark-item").keydown (event) ->
					if event.keyCode is 13
						stuIndex = parseInt $(@).attr("student-index"), 10
						rowIndex = parseInt $(@).attr("row-index"), 10

						if $(".remark-item[row-index=#{rowIndex + 1}]")?
							$(".remark-item[row-index=#{rowIndex + 1}]").focus()
						return false
					if event.keyCode is 38
						stuIndex = parseInt $(@).attr("student-index"), 10
						rowIndex = parseInt $(@).attr("row-index"), 10

						if $(".remark-item[row-index=#{rowIndex - 1}]")?
							$(".remark-item[row-index=#{rowIndex - 1}]").focus()
						return false
					if event.keyCode is 40
						stuIndex = parseInt $(@).attr("student-index"), 10
						rowIndex = parseInt $(@).attr("row-index"), 10

						if $(".remark-item[row-index=#{rowIndex + 1}]")?
							$(".remark-item[row-index=#{rowIndex + 1}]").focus()
						return false
	}

saveScores = () ->
	add_content = []
	update_content = []
	score_type = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "F", "X", "***", ""]
	pass_score = ["A+", "A", "A-", "B+", "B", "B-"]
	has_fail_score = false

	$(".score-item").css('border-color', '#CCC');

	$(params.students).each (index, student) ->
		if $.inArray(@Score, score_type) is -1
			has_fail_score = true
			$(".score-item[student-index=#{index}]").css('border-color', '#F00');

		score = {
			Score: if @IsCancel is "t" then "X" else @Score,
			IsPass: if $.inArray @Score, pass_score isnt -1 then true else false,
			Remark: if @IsCancel is "t" then "已停修" else @Remark,
			OffsetCourse: "",
			RefCourseID: params.currentCourse.CourseID,
			RefStudentID: @StudentID,
			RefSubjectID: params.currentCourse.SubjectID,
			SchoolYear: params.currentCourse.SchoolYear,
			Semester: params.currentCourse.Semester,
			Credit: params.currentCourse.Credit,
			IsRequired: if params.currentCourse.IsRequired is "true" then true else false,
			SubjectCode: params.currentCourse.SubjectCode,
			SubjectName: params.currentCourse.SubjectName
		}

		if @ScoreID is ""
			add_content.push score
		else
			score.ScoreID = @ScoreID
			update_content.push score

	if not has_fail_score
		gadget.getContract("emba.teacher").send {
			service: "default.UpdateSubjectSemesterScore",
			body: { Request: { Score: update_content } },
			result: (response, error, http) ->
				if (response.Result?)
					gadget.getContract("emba.teacher").send {
						service: "default.AddSubjectSemesterScore",
						body: { Request: { Score: add_content } },
						result: (response, error, http) ->
							if (response.Result)
								alert "儲存成績完成!"
								bindScores()
							else
								alert "儲存成績失敗! 請稍候重試。"
					}
				else
					alert "儲存成績失敗! 請稍候重試。"
		}
	else
		alert "成績有誤，請修改後再儲存，謝謝!"

uploadScore = () ->

	if params.currentCourse?
		if params.currentCourse.IsScored isnt "true"
			alert "您並非評分教師，無法繳交成績!\n如有任何疑問，請洽EMBA辦公室，謝謝!"
		else if confirm("成績上傳後無法再做修改，是否確定上傳成績？\n如需更動成績，請洽EMBA辦公室，謝謝!") is true
			add_content = []
			update_content = []
			score_type = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "F", "X", "***"]
			pass_score = ["A+", "A", "A-", "B+", "B", "B-"]
			has_fail_score = false

			log = "#{$(".course-select").find("option:selected").text()}\n"
			$(params.students).each () ->
				if $.inArray(@Score, score_type) is -1
					has_fail_score = true
				score = {
					Score: if @IsCancel is "t" then "X" else @Score,
					IsPass: if $.inArray @Score, pass_score isnt -1 then true else false,
					Remark: if @IsCancel is "t" then "已停修" else @Remark,
					OffsetCourse: "",
					RefCourseID: params.currentCourse.CourseID,
					RefStudentID: @StudentID,
					RefSubjectID: params.currentCourse.SubjectID,
					SchoolYear: params.currentCourse.SchoolYear,
					Semester: params.currentCourse.Semester,
					Credit: params.currentCourse.Credit,
					IsRequired: if params.currentCourse.IsRequired is "true" then true else false,
					SubjectCode: params.currentCourse.SubjectCode,
					SubjectName: params.currentCourse.SubjectName
				}

				log += "\n#{@Department}_#{@StudentNumber}_#{@Name}： #{score.Score}#{if $.trim(score.Remark) isnt '' then ", #{score.Remark}" else ""}"

				if @ScoreID is ""
					add_content.push score
				else
					score.ScoreID = @ScoreID
					update_content.push score

			if not has_fail_score
				gadget.getContract("emba.teacher").send {
					service: "default.UpdateSubjectSemesterScore",
					body: { Request: { Score: update_content } },
					result: (response, error, http) ->
						if (response.Result?)
							gadget.getContract("emba.teacher").send {
								service: "default.AddSubjectSemesterScore",
								body: { Request: { Score: add_content } },
								result: (response, error, http) ->
									if (response.Result?)
										gadget.getContract("emba.teacher").send {
											service: "default.UpdateCourseExt",
											body: { Request: { Course: { CourseID: params.currentCourse.CourseID, Confirmed: true }}},
											result: (response, error, http) ->
												if response.Result?
													printScore "score" if confirm("上傳成績完成!\n是否「列印成績確認單」？") is true
													params.currentCourse.Confirmed = "true"
													$(params.courses).each () ->
													if @CourseID is params.currentCourse.CourseID
														@Confirmed = "true"
													$(".save").attr "disabled", "disabled"
													$(".upload").attr "disabled", "disabled"
												else
													alert "上傳成績失敗! 請稍候重試。"

												gadget.getContract("emba.student").send {
													service: "public.AddLog",
													body: """
														<Request>
															<Log>
																<Actor>#{gadget.getContract("emba.teacher").getUserInfo().UserName}</Actor>
																<ActionType>更新</ActionType>
																<Action>更新成績</Action>
																<TargetCategory>ischool.emba.subject_semester_score</TargetCategory>
																<ClientInfo><ClientInfo></ClientInfo></ClientInfo>
																<ActionBy>ischool web 成績輸入小工具</ActionBy>
																<Description>#{log}</Description>
															</Log>
														</Request>
													"""
												}
										}
									else
										alert "上傳成績失敗! 請稍候重試。"
							}
						else
							alert "上傳成績失敗! 請稍候重試。"
				}
			else
				alert "尚有未輸入成績或成績有誤，請修改後再繳交，謝謝!"

printScore = (type) ->
	if params.currentCourse?
		if type is "score" and params.currentCourse.Confirmed isnt "true"
			alert "成績尚未上傳，無法列印成績報告單，謝謝!"
		else
			print_pages = []
			print_content = []
			page_count = (parseInt params.students.length / 50, 10) + (if params.students.length % 50 > 0 then 1 else 0)

			print_pages.push $("<div>#{$(".print-page").html()}</div>") for i in [0...page_count]

			$(print_pages).each (index, page) ->
				$(page).find(".title").html "<div>臺灣大學 #{params.currentCourse.SchoolYear} 學年度第 #{if params.currentCourse.Semester is '0' then '暑期' else params.currentCourse.Semester} 學期成績報告單</div>"
				$(page).find(".course-info .subject-code").html "課程編號：#{params.currentCourse.NewSubjectCode} (#{params.currentCourse.SubjectCode})"
				$(page).find(".course-info .subject-name").html "科目名稱：#{params.currentCourse.SubjectName}"
				$(page).find(".course-info .class-name").html "班次：#{params.currentCourse.ClassName}"
				$(page).find(".course-info .credit").html "學分：#{params.currentCourse.Credit}"
				$(page).find(".course-info .course-teacher").html $(".teacher-list").html()
				$(page).find(".course-info .page-index").html "頁次：#{index + 1} / #{print_pages.length}"
				$(page).find(".teacher-sign .subject-code").html "課程編號：#{params.currentCourse.NewSubjectCode} (#{params.currentCourse.SubjectCode}"
				$(page).find(".teacher-sign .subject-name").html "科目名稱：#{params.currentCourse.SubjectName}"
				$(page).find(".teacher-sign .class-name").html "班次：#{params.currentCourse.ClassName}"
				$(page).find(".score-detail table tbody").html ""

				for i in [0...25]
					tr = ""
					if params.students[index * 50 + i] isnt undefined
						tr = """
							<td><div style='width:80px'>#{params.students[index * 50 + i]["Department"]}</div></td>
							<td><div style='width:20px'>&nbsp;</div></td>
							<td><div style='width:80px'>#{params.students[index * 50 + i]["StudentNumber"]}</div></td>
							<td><div style='width:100px'>#{params.students[index * 50 + i]["Name"]}</div></td>"""

						if type is "score"
							tr += """
								<td>
									<div style='width:40px'>#{if params.students[index * 50 + i]["IsCancel"] isnt "t" then params.students[index * 50 + i]["Score"] else "***"}</div>
								</td>
								<td>
									<div style='width:60px'>#{if params.students[index * 50 + i]["IsCancel"] isnt "t" then params.students[index * 50 + i]["Remark"] else "已停修"}</div>
								</td>"""

						if type is "clear"
							tr += """
								<td>
									<div style='width:40px'>#{if params.students[index * 50 + i]["IsCancel"] isnt "t" then "" else "***"}</div>
								</td>
								<td>
									<div style='width:60px'>#{if params.students[index * 50 + i]["IsCancel"] isnt "t" then "" else "已停修"}</div>
								</td>"""
					else
						tr += """
							<td><div style='width:80px'>&nbsp;</div></td>
							<td><div style='width:20px'>&nbsp;</div></td>
							<td><div style='width:80px'>&nbsp;</div></td>
							<td><div style='width:100px'>&nbsp;</div></td>
							<td><div style='width:40px'>&nbsp;</div></td>
							<td><div style='width:60px'>&nbsp;</div></td>"""

					if params.students[index * 50 + i + 25] isnt undefined
						tr += """
							<td><div style='width:80px'>#{params.students[index * 50 + i + 25]["Department"]}</div></td>
							<td><div style='width:20px'>&nbsp;</div></td>
							<td><div style='width:80px'>#{params.students[index * 50 + i + 25]["StudentNumber"]}</div></td>
							<td><div style='width:100px'>#{params.students[index * 50 + i + 25]["Name"]}</div></td>"""

						if type is "score"
							tr += """
								<td>
									<div style='width:40px'>#{if params.students[index * 50 + i + 25]["IsCancel"] isnt "t" then params.students[index * 50 + i + 25]["Score"] else "***"}</div>
								</td>
								<td>
									<div style='width:60px'>#{if params.students[index * 50 + i + 25]["IsCancel"] isnt "t" then params.students[index * 50 + i + 25]["Remark"] else "已停修"}</div>
								</td>"""

						if type is "clear"
							tr += """
								<td>
									<div style='width:40px'>#{if params.students[index * 50 + i + 25]["IsCancel"] isnt "t" then "" else "***"}</div>
								</td>
								<td>
									<div style='width:60px'>#{if params.students[index * 50 + i + 25]["IsCancel"] isnt "t" then "" else "已停修"}</div>
								</td>"""
					else
						tr += """
							<td><div style='width:80px'>&nbsp;</div></td>
							<td><div style='width:20px'>&nbsp;</div></td>
							<td><div style='width:80px'>&nbsp;</div></td>
							<td><div style='width:100px'>&nbsp;</div></td>
							<td><div style='width:40px'>&nbsp;</div></td>
							<td><div style='width:60px'>&nbsp;</div></td>"""

					$("<tr>#{tr}</tr>").appendTo $(page).find ".score-detail table tbody"

				print_content.push $(page).html()

			content = print_content.join "<P style='page-break-after:always'>&nbsp;</P>"
			content = """
				<html>
					<head>
						<link type="text/css" rel="stylesheet" href="css/scorekit.css"/>
					</head>
					<body>
						<div style='width:880px;padding:40px 20px'>#{content}</div>
					</body>
				</html>"""

			doc = window.open 'about:blank', '_blank', ''
			doc.document.open()
			doc.document.write content
			doc.document.close()
			doc.focus()