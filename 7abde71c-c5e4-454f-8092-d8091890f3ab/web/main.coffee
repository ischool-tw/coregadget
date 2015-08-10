global = { }

$(document).ready () ->
	gadget.getContract("ischool.course_selection.public").send {
		service: "default.GetSelectionSemester",
		result: (response, error, xhr) ->
			$("#message").html """
				<p>開放選課時間：#{response.Response.StartTime} ~ #{response.Response.EndTime}</p>
			"""
	}

	gadget.getContract("ischool.course_selection.student").send {
		service: "default.GetMyGradeYear",
		result: (response, error, xhr) ->
			global.schoolYear = parseInt response.Response.SelectionSchoolYear, 10
			global.semester = parseInt response.Response.SelectionSemester, 10
			global.gradeYear = parseInt(response.Response.SelectionSchoolYear, 10) - parseInt(response.Response.CurrentSchoolYear, 10) + parseInt(response.Response.GradeYear, 10)

			getSelectionSubject()
	}

getSelectionSubject = () ->
	$("#content").html ""

	gadget.getContract("ischool.course_selection.student").send {
		service: "default.GetSelectionSubject",
		body: """
			<Request>
				<SchoolYear>#{global.schoolYear}</SchoolYear>
				<Semester>#{global.semester}</Semester>
				<GradeYear>#{global.gradeYear}</GradeYear>
			</Request>
		""",
		result: (response, error, xhr) ->
			groups = []
			$(response.Response.Subject).each () ->
				groups.push @Group if $.inArray(@Group, groups) is -1

			global.groups = groups
			global.subjects = {}
			$(groups).each (i, group) ->
				$("<div id='group_#{group}' style='margin:10px;display:inline-block'></div>").appendTo $("#content")

				global.subjects[group] = []
				selection_subject = []
				$(response.Response.Subject).each () ->
					@Selection = if @SelectionID isnt "" then "checked='checked'" else ""
					@FullName = "#{@SubjectName} #{@Level}"
					selection_subject.push @FullName if @SelectionID isnt ""
					global.subjects[group].push @ if @Group is group

				$("#group_#{group}").kendoGrid({
					dataSource: {
						data: global.subjects[group]
					},
					height: 560,
					scrollable: true,
					columns: [
						{
							field: "GradeYear",
							title: "年級",
							width: 60
						}, {
							field: "Semester",
							title: "學期",
							width: 60
						}, {
							field: "FullName",
							title: "完整課程名稱"
							width: 240
						}, {
							field: "Credit",
							title: "學分",
							width: 60
						}, {
							field: "Type",
							title: "課程類別"
							width: 120
						}, {
							field: "Limit",
							title: "修課上限"
							width: 90
						}, {
							field: "SelectionCount",
							title: "已選人數"
							width: 90
						}, {
							field: "Selection",
							title: "選取",
							width: 60,
							template: '<input type="checkbox" subject-id="#= SubjectID #" group="#= Group #" #= Selection #/>'
						}
					],
					detailTemplate: kendo.template("""
						<div class='tabstrip'>
							<ul>
								<li class='k-state-active'>教學目標</li>
		                        <li>教學內容</li>
		                        <li>備註</li>
		                    </ul>
		                    <div><div style='margin:10px'>#= Goal #</div></div>
		                    <div><div style='margin:10px'>#= Content #</div></div>
		                    <div><div style='margin:10px'>#= Memo #</div></div>
		                </div>
					"""),
					dataBound: () ->
						@expandRow(@tbody.find("tr.k-master-row"))
					detailInit: (e) ->
	                    e.detailRow.find(".tabstrip").kendoTabStrip({
	                        animation: {
	                            open: { effects: "fadeIn" }
	                        }
	                    })
					toolbar: kendo.template("""
						<div class='toolbar'>
		                    <span style='float:right'>#{group} 群組課程 #{global.subjects[group].length} 選 #{global.subjects[group][0].CountLimit}</span>
		                    <span group='#{group}' style='float:right;margin-right:20px;color:red'></span>
		                    <button class='k-button' group='#{group}' count-limit='#{global.subjects[group][0].CountLimit}'>送出選課</button>
		                    <span style='color:blue'>已選課程：#{selection_subject.join(", ")}</span>
		                </div>
					""")
				});

			$("button").unbind "click"
			$("button").click () ->
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
					$("span[group=#{group}]").html "此群組課程必須或僅能選取 #{parseInt($(@).attr('count-limit'), 10)} 門課"
					alert "此群組課程必須或僅能選取 #{parseInt($(@).attr('count-limit'), 10)} 門課"
				else
					subject = ""
					$(subject_id).each () ->
						subject += """
							<Subject>
								<SubjectID>#{@}</SubjectID>
								<SubjectIDList>#{subject_id_list.join()}</SubjectIDList>
							</Subject>
						"""
					gadget.getContract("ischool.course_selection.student").send {
						service: "default.AddSelectionSubject",
						body: """
							<Request>
								#{subject}
							</Request>
						"""
						result: (response, error, xhr) ->
							if error?.dsaError?.status is '504'
								$("span[group=#{group}]").html error.dsaError.message
							else
								if parseInt(response.Result.EffectRows, 10) is subject_id.length
									getSelectionSubject()
									alert "#{message}\n此群組選課完成"
					}
	}