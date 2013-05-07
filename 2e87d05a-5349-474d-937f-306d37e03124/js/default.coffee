$ ->
	$("a[target='query']").click (e) ->
		e.preventDefault()
		query_paper()

query_paper = () ->
	if $("input[target='student-name']").val() isnt "" or $("input[target='teacher-name']").val() isnt "" or $("input[target='paper-name']").val() isnt ""
		gadget.getContract("emba.student").send {
			service: "public.QueryPapers",
			body: """
				<Request>
					#{if $("input[target='student-name']").val() isnt "" then "<StudentName>%#{$("input[target='student-name']").val()}%</StudentName>" else ""}
					#{if $("input[target='teacher-name']").val() isnt "" then "<TeacherName>%#{$("input[target='teacher-name']").val()}%</TeacherName>" else ""}
					#{if $("input[target='paper-name']").val() isnt "" then "<PaperName>%#{$("input[target='paper-name']").val()}%</PaperName>" else ""}
				</Request>
			""",
			result: (response, error, http) ->
				if response.Result?
					items = []
					$(response.Result.Paper).each (index, item) ->
						teacherName = []
						$(item.AdvisorList.Advisor).each () ->
							teacherName.push @Name if @Name isnt ''
						
						item.TeacherName = teacherName.join ", "
						
						items.push """
							<tr>
								<td>#{item.StudentName}#{if item.DepartmentName isnt '' then " (#{item.DepartmentName})" else ''}</td>
								<td>#{item.TeacherName}</td>
								<td>#{item.PaperName}</td>
								<td>#{item.SchoolYear} - #{if item.Semester is '0' then '暑假' else item.Semester}</td>
							</tr>"""

					$("table[target='paper-result'] tbody").html items.join ""
		}