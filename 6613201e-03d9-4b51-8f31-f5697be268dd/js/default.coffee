$ ->
	bind_academic()

# 更新成績資訊畫面
bind_academic = () ->
	getCurrentCourse()				# 取得當學期修課課程
	getGraduationRequirement()		# 取得畢業學分表
	getGraduationSubjectList()		# 取得畢業應修科目

# 取得當學期修課課程
getCurrentCourse = () ->
	gadget.getContract("emba.student").send {
		service: "default.GetSemester",
		body: "",
		result: (response, error, http) ->
			if response.Result?
				currentSemester = {
					SchoolYear: response.Result.SystemConfig.DefaultSchoolYear,
					Semester: response.Result.SystemConfig.DefaultSemester
				}

				gadget.getContract("emba.student").send {
					service: "default.GetCurrentCourse",
					body: {
						Request: {
							SchoolYear: currentSemester.SchoolYear,
							Semester: currentSemester.Semester
						}
					},
					result: (response, error, http) ->
						if response.Result?
							$(response.Result.Course).each (index, item) ->
								$("#academic #current-course tbody").append """
									<tr>
										<td>#{item.SerialNo}</td>
										<td>#{item.SchoolYear}</td>
										<td>#{if item.Semester is "0" then "暑期" else item.Semester}</td>
										<td>#{item.SubjectName}</td>
										<td>#{item.ClassName}</td>
										<td>#{item.CourseType}</td>
										<td>#{if item.IsRequired is "t" then "必修" else "選修"}</td>
										<td>#{item.Credit}</td>
										<td course-id="#{item.CourseID}"></td>
										<td>#{item.ReportGroup}</td>
									</tr>"""

								getCourseTeacherList item.CourseID
				}
	}

# 取得課程教師名單
getCourseTeacherList = (course_id) ->
	gadget.getContract("emba.student").send {
		service: "default.GetCourseTeacherList",
		body: { Request: { CourseID: course_id }},
		result: (response, error, http) ->
			if response.Result?
				teacher_name = []
				$(response.Result.Teacher).each () ->
					teacher_name.push @TeacherName

				$("#academic #current-course td[course-id=#{course_id}]").html teacher_name.join ","
	}

# 取得畢業學分表
getGraduationRequirement = () ->
	gadget.getContract("emba.student").send {
		service: "default.GetGraduationRequirement",
		body: "",
		result: (response, error, http) ->
			if response.Result?
				$("#academic #credit-info-title").html """畢業應修科目及學分表：系訂必修： #{response.Result.DepartmentCredit ? ""} 學分、選修： #{response.Result.ElectiveCredit ? ""} 學分、應修最低畢業學分： #{response.Result.RequiredCredit ? ""}"""
	}

# 取得畢業應修科目
getGraduationSubjectList = () ->
	gadget.getContract("emba.student").send {
		service: "default.GetGraduationSubjectList",
		body: "",
		result: (response, error, http) ->
			items = []
			if response.Result?
				$(response.Result.Subject).each (index, item) ->
					items.push """
						<tr class='info'>
							<td>#{item.NewSubjectCode}</td>
							<td>#{item.SubjectCode}</td>
							<td>#{item.ChineseName}<br/>#{item.EnglishName}</td>
							<td>#{item.Credit}</td>
							<td>#{item.GroupName}</td>
							<td graduation-subject-code='#{item.SubjectCode}'></td>
						</tr>"""

			$("#academic #graduation-info tbody").html items.join ""

			getSubjectSemesterScore()		# 取得所修課程成績
	}

# 取得所修課程成績
getSubjectSemesterScore = () ->
	gadget.getContract("emba.student").send {
		service: "default.GetSubjectSemesterScore",
		body: "",
		result: (response, error, http) ->
			items = []
			if response.Result?
				$(response.Result.Score).each (index, item) ->
					items.push """
						<tr>
							<td>#{item.SerialNo}</td>
							<td>#{item.SchoolYear}</td>
							<td>#{if item.Semester is "0" then "暑期" else item.Semester}</td>
							<td>#{item.SubjectCode}</td>
							<td>#{item.NewSubjectCode}</td>
							<td>#{if item.Score is '' and item.SchoolYear is '' and item.Semester is '' then "#{item.SubjectName} / #{item.OffsetCourse}" else item.SubjectName}</td>
							<td>#{if item.IsPass is "t" then item.Credit else "(#{item.Credit})"}</td>
							<td>#{if item.Score is '' and item.SchoolYear is '' and item.Semester is '' then '抵免' else item.Score}</td>
						</tr>"""

					$("td[graduation-subject-code='#{@SubjectCode}']").html '已取得學分' if @IsPass is 't'

				$("#academic #subject-semester-score tbody").html items.join ""
	}
