global = { }

$(document).ready () ->
	gadget.getContract("ischool.course_selection.public").send {
		service: "default.GetSelectionSemester",
		result: (response, error, xhr) ->
			global.schoolYear = response.Response.SchoolYear
			global.semester = response.Response.Semester

			gadget.getContract("ischool.course_selection.teacher").send {
				service: "default.GetMyInfo",
				result: (response, error, xhr) ->
				if response.Response.ClassName isnt ""
						getClassSelectionResult()
					else
						alert "您並非為'班導師'無法查詢學生選課結果!"
			}
	}

getClassSelectionResult = () ->
	gadget.getContract("ischool.course_selection.teacher").send {
		service: "default.GetClassSelectionResult",
		body: """
			<Request>
				<SchoolYear>#{global.schoolYear}</SchoolYear>
				<Semester>#{global.semester}</Semester>
			</Request>
		"""
		result: (response, error, xhr) ->
			global.students = []
			$(response.Response.Student).each () ->
				@FullName = "#{@SubjectName} #{@Level}"
				@SeatNo = parseInt @SeatNo, 10
				global.students.push @

			$("#content").html ""
			$("<div id='students' style='margin:10px;display:inline-block'></div>").appendTo $("#content")

			$("#students").kendoGrid({
				dataSource: {
					data: global.students
				},
				groupable: true,
				scrollable: true,
				selectable: 'row',
				sortable: true,
				columns: [
					{
						field: "Status",
						title: "學生狀態",
						width: 100
					},
					{
						field: "StudentNumber",
						title: "學號",
						width: 100
					}, {
						field: "SeatNo",
						title: "座號",
						width: 60
					}, {
						field: "StudentName",
						title: "學生",
						width: 120
					}, {
						field: "FullName",
						title: "完整課程名稱",
						width: 240
					}, {
						field: "Group",
						title: "課程群組"
						width: 120
					}
				]
			});
	}