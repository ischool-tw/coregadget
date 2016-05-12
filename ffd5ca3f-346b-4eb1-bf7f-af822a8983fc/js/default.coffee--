$ ->
	all_dept = []
	gadget.getContract("emba.student").send {
		service: "default.GetDepartmentGroup",
		body: "",
		result: (response, error, http) ->
			if response.Result?
				items = ["<li><a herf='#'>系所組別</a></li>"]
				$(response.Result.Department).each () ->
					items.push "<li><a herf='#'>#{@Name}</a></li>"

				all_dept = items

				$("ul[target='department-options']").html items.join ""

				$("ul[target='department-options'] a").unbind "click"
				$("ul[target='department-options'] a").on {
					click: (e) ->
						e.preventDefault()
						$("span[target='department']").html $(@).html()
				}
	}

	$("a[target='query']").click (e) ->
		e.preventDefault()
		query_student()

	$("input[target='enroll-year']").change () ->
		$("span[target='department']").html "系所組別"
		$("ul[target='department-options']").html ""
		if $(@).val() isnt ""
			gadget.getContract("emba.student").send {
				service: "default.GetEnrollYearDepartmentGroup",
				body: "<Request><Condition><EnrollYear>#{$(@).val()}</EnrollYear></Condition></Request>",
				result: (response, error, http) ->
					if response.Result?
						items = ["<li><a herf='#'>系所組別</a></li>"]
						$(response.Result.Department).each () ->
							items.push "<li><a herf='#'>#{@Name}</a></li>"

						$("ul[target='department-options']").html items.join ""

						$("ul[target='department-options'] a").unbind "click"
						$("ul[target='department-options'] a").on {
							click: (e) ->
								e.preventDefault()
								$("span[target='department']").html $(@).html()
						}
			}
		else
			$("ul[target='department-options']").html all_dept.join ""
			$("ul[target='department-options'] a").unbind "click"
			$("ul[target='department-options'] a").on {
				click: (e) ->
					e.preventDefault()
					$("span[target='department']").html $(@).html()
			}


students = []
current_index = 0
experience = []
# education = []
sharing = {}
query_student = () ->
	$("table[target='student-detail'] tbody").html ""
	if $("input[target='student-name']").val() isnt "" or $("input[target='company-name']").val() isnt "" or $("input[target='enroll-year']").val() isnt "" or $("span[target='department']").html() isnt "系所組別"
		gadget.getContract("emba.student").send {
			service: "public.QueryStudents",
			body: """
				<Request>
					<All/>
					#{if $("input[target='student-name']").val() isnt "" then "<Name>%#{$("input[target='student-name']").val()}%</Name>" else ""}
					#{if $("input[target='company-name']").val() isnt "" then "<CompanyName>%#{$("input[target='company-name']").val()}%</CompanyName><CompanySharing>true</CompanySharing>" else ""}
					#{if $("input[target='enroll-year']").val() isnt "" then "<EnrollYear>%#{$("input[target='enroll-year']").val()}%</EnrollYear>" else ""}
					#{if $("span[target='department']").html() isnt "系所組別" then "<DepartmentName>%#{$("span[target='department']").html()}%</DepartmentName>" else ""}
				</Request>
			""",
			result: (response, error, http) ->
				if response.Result?
					items = []
					students = $(response.Result.Student)
					students.each (index, item) ->
						items.push """
							<tr>
								<td>#{item.EnrollYear}</td>
								<td>#{item.ClassName}</td>
								<td><a href='#' target='detail' index='#{index}'>#{item.Name}</a></td>
								<td>#{item.Gender}</td>
								<td>#{item.DepartmentName}</td>
							</tr>"""

					$("table[target='student-list'] tbody").html items.join ""
					$("table[target='student-list'] a[target='detail']").click (e) ->
						e.preventDefault()
						experience = []
						sharing =
							"Name": "true"
							"Gender": "true"
							"Birthdate": "false"
							"Custodian": "false"
							"CustodianPhone": "false"
							"ContactPhone": "false"
							"PermanentPhone": "false"
							"公司電話": "false"
							"行動電話2": "false"
							"秘書電話": "false"
							"SMSPhone": "false"
							"EmailList":
								"Email1": "false"
								"Email2": "false"
								"Email3": "false"
								"Email4": "false"
								"Email5": "false"
							"ContactAddress": "false"
							"PermanentAddress": "false"
						current_index = $(@).attr "index"
						gadget.getContract("emba.student").send {
							service: "public.QueryStudentExperience",
							body: """
								<Request>
									<StudentID>#{students[current_index].StudentID}</StudentID>
								</Request>
							""",
							result: (response, error, http) ->
								experience = response.Result.Experience if response.Result?
								# gadget.getContract("emba.student").send {
								# 	service: "public.QueryStudentEducationBackground",
								# 	body: """
								# 		<Request>
								# 			<StudentID>#{students[current_index].StudentID}</StudentID>
								# 		</Request>
								# 	""",
								# 	result: (response, error, http) ->
								# 		education = response.Result.EducationBackground if response.Result?
								# }
								gadget.getContract("emba.student").send {
									service: "public.QueryStudentBrief",
									body: """
										<Request>
											<StudentID>#{students[current_index].StudentID}</StudentID>
										</Request>
									""",
									result: (response, error, http) ->
										if (response.Result?.DataSharing?.DataSharing?)
											sharing = response.Result.DataSharing.DataSharing

											$(response.Result.DataSharing.DataSharing.OtherPhoneList.PhoneNumber).each (index, item) ->
												sharing[item.title] = item['@text']

										preview_detail()
								}
						}
		}

preview_detail = () ->
	student = students[current_index]
	experience_content = []
	$(experience).each () ->
		experience_content.push """
			<tr>
				<th class="myth"><span>公司</span></th>
				<td><span>#{@CompanyName || '本人未公開資訊'}</span></td>
			</tr>
			<tr>
				<th class="myth"><span>職稱</span></th>
				<td><span>#{@Position || '本人未公開資訊'}</span></td>
			</tr>
		"""  if @IsSharing is "t"

	experience_content.push """
		<tr>
			<th class="myth"><span>公司</span></th>
			<td><span>本人未公開資訊</span></td>
		</tr>
		<tr>
			<th class="myth"><span>職稱</span></th>
			<td><span>本人未公開資訊</span></td>
		</tr>
	"""  if experience_content.length is 0



	# education_content = []
	# $(education).each () ->
	# 	education_content.push "<span>#{@SchoolName} (#{@Department})</span>" if @IsSharing is "t"

	$("table[target='student-detail'] tbody").html """
		<tr>
			<th class="myth"><span>姓名</span></th>
			<td><span>#{student.Name}</span></td>
		</tr>
		<tr>
			<th class="myth"><span>性別</span></th>
			<td><span>#{student.Gender}</span></td>
		</tr>
		#{experience_content.join ""}
		<tr>
			<th class="myth"><span>公司電話</span></th>
			<td><span>#{if sharing['公司電話'] is "true" then student.OfficePhone else '本人未公開資訊'}</span></td>
		</tr>
		<tr>
			<th class="myth"><span>行動電話1</span></th>
			<td><span>#{if sharing['SMSPhone'] is "true" then student.SMSPhone1 else '本人未公開資訊'}</span></td>
		</tr>
		<tr>
			<th class="myth"><span>行動電話2</span></th>
			<td><span>#{if sharing['行動電話2'] is "true" then student.SMSPhone2 else '本人未公開資訊'}</span></td>
		</tr>
		<tr>
			<th class="myth"><span>Email1</span></th>
			<td><span>#{if sharing.EmailList['Email1'] is "true" then student.Email1 else '本人未公開資訊'}</span></td>
		</tr>
		<tr>
			<th class="myth"><span>Email2</span></th>
			<td><span>#{if sharing.EmailList['Email2'] is "true" then student.Email2 else '本人未公開資訊'}</span></td>
		</tr>
		<tr>
			<th class="myth"><span>Email3</span></th>
			<td><span>#{if sharing.EmailList['Email3'] is "true" then student.Email3 else '本人未公開資訊'}</span></td>
		</tr>
		<tr>
			<th class="myth"><span>Email4</span></th>
			<td><span>#{if sharing.EmailList['Email4'] is "true" then student.Email4 else '本人未公開資訊'}</span></td>
		</tr>
		<tr>
			<th class="myth"><span>Email5</span></th>
			<td><span>#{if sharing.EmailList['Email5'] is "true" then student.Email5 else '本人未公開資訊'}</span></td>
		</tr>
	"""