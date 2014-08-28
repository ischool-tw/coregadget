global = {}

$ ->
	gadget.getContract("ischool.course_selection.teacher").send {
		service: "default.GetDeptClasses",
		result: (response, error, xhr) ->
			items = ""
			$(response.Response.Class).each () ->
				if @Current is "true"
					items += "<li><a href='#' class-id='#{@ClassID}'>#{@ClassName}</a></li>"
			
			$("#class-list").html items
			$("#class-list a").click (e) ->
				e.preventDefault()
				$("#class-title").html "#{$(@).html()} <span class='caret'></span>"
				global.class_id = $(@).attr("class-id")
				getClassStudents()
	}

getClassStudents = () ->
	$("#student-info").html ""
	$("#subject-list").html ""
	
	gadget.getContract("ischool.course_selection.teacher").send {
		service: "default.GetClassStudents",
		body: "<Request><ClassID>#{global.class_id}</ClassID></Request>",
		result: (response, error, xhr) ->
			global.students = $(response.Response.Student)
			items = ""
			$(response.Response.Student).each (index, student) ->
				items += """
					<tr index='#{index}'>
						<td>#{student.Status}</td>
						<td>#{student.StudentNumber}</td>
						<td>#{student.SeatNo}</td>
						<td>#{student.Name}</td>
						<td>#{student.Gender}</td>
						<td>#{student.SubjectName.replace(/\"/gm, '').replace(/{/gm, '').replace(/}/gm, '').replace(/NULL/gm, '').replace(/,/gm, '<br/>')}</td>
						<td><a href='#' index='#{index}'>詳細</a></td>
					</tr>
				"""
			
			$("#student-list tbody").html items
			$("#student-list tbody tr a").click (e) ->
				e.preventDefault()
				global.student = global.students[$(@).attr("index")]
				getStudentSelectionSubject()
	}

getStudentSelectionSubject = () ->
	$("#student-info").html "<div class='alert'>#{global.student.SeatNo} #{global.student.Name}</div>"
	$("#subject-list").html ""
	
	gadget.getContract("ischool.course_selection.teacher").send {
		service: "default.GetStudentGradeYear",
		body: """
			<Request>
				<StudentID>#{global.student.ID}</StudentID>
			</Request>
		""",
		result: (response, error, xhr) ->
			if response?.Response?
				gradeYear = parseInt(response.Response.SelectionSchoolYear, 10) - parseInt(response.Response.CurrentSchoolYear, 10) + parseInt(response.Response.GradeYear, 10)
				gradeYear -= 1 if $("#upgrade").attr("checked") is "checked"
				gadget.getContract("ischool.course_selection.teacher").send {
					service: "default.GetStudentSelectionSubject",
					body: """
						<Request>
							<SchoolYear>#{response.Response.SelectionSchoolYear}</SchoolYear>
							<Semester>#{response.Response.SelectionSemester}</Semester>
							<GradeYear>#{gradeYear}</GradeYear>
							<StudentID>#{global.student.ID}</StudentID>
						</Request>
					""",
					result: (response, error, xhr) ->
						global.groups = []
						global.subjects = []
						$(response.Response.Subject).each () ->
							global.groups.push @Group if $.inArray(@Group, global.groups) is -1
							global.subjects[@Group] = []
						
						$(global.groups).each (i, group) ->
							$(response.Response.Subject).each () ->
								@FullName = "#{@SubjectName} #{@Level}"
								@Selection = if @SelectionID isnt "" then "checked='checked'" else ""
								global.subjects[group].push @ if @Group is group
							
							items = ""
							$(global.subjects[group]).each () ->
								items += """
									<tr>
										<td>#{@FullName}</td>
										<td>#{@Limit}</td>
										<td>#{@SelectionCount}</td>
										<td><input type='checkbox' subject-id='#{@SubjectID}' group='#{@Group}' #{@Selection}/></td>
									</tr>
								"""
							$("#subject-list").append """
								<div>
									<div class='btn-toolbar'>
										<a href='#' class='btn btn-inverse set-subject' group='#{group}' count-limit='#{global.subjects[group][0].CountLimit}'>調整</a>
										<span class='btn btn-info disabled pull-right'>#{group}  (#{global.subjects[group].length} 選 #{global.subjects[group][0].CountLimit})</span>
									</div>
									<table class='table table-bordered'>
										<thead>
											<tr>
												<th>課程名稱</th>
												<th>修課上限</th>
												<th>已選人數</th>
												<th>選課</th>
											</tr>
										</thead>
										<tbody>#{items}</tbody>
									</table>
								</div>
							"""
							
							$("#subject-list .set-subject").unbind "click"
							$("#subject-list .set-subject").click () ->
								subject_id = []
								subject_id_list = []
								$("input[type=checkbox][group=#{$(@).attr('group')}]").each () ->
									subject_id.push $(@).attr("subject-id") if $(@).attr("checked")?
									subject_id_list.push $(@).attr("subject-id")
								
								group = $(@).attr "group"
								message = "#{group} 所選課程如下：\n\n"
								
								$(global.subjects[group]).each (i, subject) ->
									$(subject_id).each (j, id) ->
										if subject.SubjectID is id
											message += "#{subject.FullName}\n"
								
								if subject_id.length isnt parseInt($(@).attr("count-limit"), 10)
									alert "此群組課程必須或僅能選取 #{parseInt($(@).attr('count-limit'), 10)} 門課"
								else
									subject = ""
									$(subject_id).each () ->
										subject += """
											<Subject>
												<StudentID>#{global.student.ID}</StudentID>
												<SubjectID>#{@}</SubjectID>
												<SubjectIDList>#{subject_id_list.join()}</SubjectIDList>
											</Subject>
										"""
									gadget.getContract("ischool.course_selection.teacher").send {
										service: "default.SetStudentSelectionSubject",
										body: """
											<Request>
												#{subject}
											</Request>
										"""
										result: (response, error, xhr) ->
											if error?.dsaError?.status is '504'
												alert error.dsaError.message
											else
												if parseInt(response.Result.EffectRows, 10) is subject_id.length
													getClassStudents()
													getStudentSelectionSubject()
													alert "#{message}\n此群組選課完成"
									}
				}
	}