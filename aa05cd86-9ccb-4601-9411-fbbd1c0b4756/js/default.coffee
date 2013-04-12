$ ->
	$("#absence a[target='query']").click (e) ->
		e.preventDefault()
		query_absence()

	$("#absence ul[target='semester-options'] a").click (e) ->
		e.preventDefault()
		$("#absence span[target='semester']").html($(@).html())
		$("#absence span[target='semester']").attr "value", $(@).attr "value"

	gadget.getContract("emba.student").send {
		service: "default.GetSemester",
		body: "",
		result: (response, error, http) ->
			$("#absence input[target='schoolYear']").val(response.Result.SystemConfig.DefaultSchoolYear)
			semester = response.Result.SystemConfig.DefaultSemester
			$("#absence span[target='semester']").attr "value", semester
			semester = "暑期" if semester is "0"
			semester = "第 1 學期" if semester is "1"
			semester = "第 2 學期" if semester is "2"
			$("#absence span[target='semester']").html(semester)
	}


# 查詢缺曠記錄
query_absence = () ->
	gadget.getContract("emba.student").send {
		service: "default.GetAbsence",
		body: {
			Request: {
				SchoolYear: $("#absence input[target='schoolYear']").val(),
				Semester: $("#absence span[target='semester']").attr "value"
			}
		},
		result: (response, error, http) ->
			items = []
			if response.Result?
				$(response.Result.Absence).each (index, item) ->
					items.push """
						<tr>
							<td>#{item.SchoolYear}</td>
							<td>#{item.Semester}</td>
							<td>#{item.CourseName}</td>
							<td>#{item.SubjectCode}</td>
							<td>#{item.StartTime.substr(0, 10)}</td>
							<td>#{item.StartTime.substr(11, 5)}</td>
							<td>#{item.MakeUpDescription}</td>
						</tr>"""

			$("#absence #absence-detail tbody").html items.join ""
	}

