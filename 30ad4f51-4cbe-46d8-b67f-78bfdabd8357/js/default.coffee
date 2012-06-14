global = {}

$ ->
	gadget.autofit document.getElementById "widget"
	gadget.onSizeChanged (size) ->
		$("#student-list").height size.height - 50
		$("#baseinfo").height size.height - 80
		$("#academic").height size.height - 80
		$("#behavior").height size.height - 80
	
	$("#filter-keyword").keyup () ->
		resetData()
		className = ""
		items = []
		global.students.each (index, student) ->
			if @StudentName.indexOf($("#filter-keyword").val()) isnt -1
				if @ClassName isnt className
					className = @ClassName
					items.push "<li class='nav-header'>#{@ClassName}</li>"
				
				photo = "img/photo_male.png"
				if @FreshmanPhoto? and @FreshmanPhoto isnt ""
					photo = "data:image/png;base64,#{@FreshmanPhoto}"
				else if @Gender is "1"
					photo = "img/photo_male.png"
				else
					photo = "img/photo_female.png"
				
				items.push """
					<li>
						<a student-index='#{index}'>
							<img class='student-photo' src='#{photo}'/>
							<span class='student-name'>#{@StudentName}</span>
							<span class='seat-no'>#{@SeatNo}</span>
							<span class='student-number'>#{@StudentNumber}</span>
						</a>
					</li>
				"""
		
		$("#student-list").html items.join ""
		$("#student-list a").click (e) ->
			e.preventDefault()
			$(@).tab "show"
			global.student = global.students[$(@).attr("student-index")]
			resetData()
			setBaseInfo()
			getAcademic()
			getMorality()
			getAttendance()
			getDiscipline()
			
	$("#filter-student").click () ->
		resetData()
		className = ""
		items = []
		global.students.each (index, student) ->
			if @StudentName.indexOf($("#filter-keyword").val()) isnt -1
				if @ClassName isnt className
					className = @ClassName
					items.push "<li class='nav-header'>#{@ClassName}</li>"
				
				photo = "img/photo_male.png"
				if @FreshmanPhoto? and @FreshmanPhoto isnt ""
					photo = "data:image/png;base64,#{@FreshmanPhoto}"
				else if @Gender is "1"
					photo = "img/photo_male.png"
				else
					photo = "img/photo_female.png"
				
				items.push """
					<li>
						<a student-index='#{index}'>
							<img class='student-photo' src='#{photo}'/>
							<span class='student-name'>#{@StudentName}</span>
							<span class='seat-no'>#{@SeatNo}</span>
							<span class='student-number'>#{@StudentNumber}</span>
						</a>
					</li>
				"""
			
		$("#student-list").html items.join ""
		$("#student-list a").click (e) ->
			e.preventDefault()
			$(@).tab "show"
			global.student = global.students[$(@).attr("student-index")]
			resetData()
			setBaseInfo()
			getAcademic()
			getMorality()
			getAttendance()
			getDiscipline()
	
	$("#editModal").modal { show: false }
	$("#editModal").on "hidden", () ->
		$("#editModal #errorMessage").html ""
	
	$("#editModal #save-data").click () ->
		request = ""
		request_udt = ""
		edit_target = $(@).attr("edit-target")
		if edit_target is "phone"
			request = """
				<Request>
					<StudentInfo>
						<StudentID>#{global.student.StudentID}</StudentID>
						<ContactPhone>#{$('#editModal #contact-phone').val()}</ContactPhone>
						<PermanentPhone>#{$('#editModal #permanent-phone').val()}</PermanentPhone>
						<SMSPhone>#{$('#editModal #sms-phone').val()}</SMSPhone>
					</StudentInfo>
				</Request>
			"""
		if edit_target is "address"
			request = """
				<Request>
					<StudentInfo>
						<StudentID>#{global.student.StudentID}</StudentID>
						<MailingAddress>
							<AddressList>
								<Address>
									<ZipCode>#{$('#editModal #contact-zip-code').val()}</ZipCode>
									<County>#{$('#editModal #contact-county').val()}</County>
									<Town>#{$('#editModal #contact-town').val()}</Town>
									<DetailAddress>#{$('#editModal #contact-detail').val()}</DetailAddress>
								</Address>
							</AddressList>
						</MailingAddress>
						<PermanentAddress>
							<AddressList>
								<Address>
									<ZipCode>#{$('#editModal #permanent-zip-code').val()}</ZipCode>
									<County>#{$('#editModal #permanent-county').val()}</County>
									<Town>#{$('#editModal #permanent-town').val()}</Town>
									<DetailAddress>#{$('#editModal #permanent-detail').val()}</DetailAddress>
								</Address>
							</AddressList>
						</PermanentAddress>
					</StudentInfo>
				</Request>
			"""
		if edit_target is "message"
			request = """
				<Request>
					<StudentInfo>
						<StudentID>#{global.student.StudentID}</StudentID>
						<Email>#{$('#editModal #email').val()}</Email>
					</StudentInfo>
				</Request>
			"""
			request_udt = """
				<Request>
					<StudentInfo>
						<StudentID>#{global.student.StudentID}</StudentID>
						<FacebookID>#{$('#editModal #facebook').val()}</FacebookID>
						<SkypeID>#{$('#editModal #skype').val()}</SkypeID>
					</StudentInfo>
				</Request>
			"""
		if edit_target is "emergency-contact"
			request_udt = """
				<Request>
					<StudentInfo>
						<StudentID>#{global.student.StudentID}</StudentID>
						<EmergencyContactName>#{$('#editModal #name').val()}</EmergencyContactName>
						<EmergencyContactRelationship>#{$('#editModal #relationship').val()}</EmergencyContactRelationship>
						<EmergencyContactTel>#{$('#editModal #phone').val()}</EmergencyContactTel>
					</StudentInfo>
				</Request>
			"""
		if edit_target is "custodian-info"
			request = """
				<Request>
					<StudentInfo>
						<StudentID>#{global.student.StudentID}</StudentID>
						<CustodianName>#{$('#editModal #name').val()}</CustodianName>
						<CustodianRelationship>#{$('#editModal #relationship').val()}</CustodianRelationship>
						<CustodianOtherInfo>
							<CustodianOtherInfo>
								<Relationship>#{$('#editModal #relationship').val()}</Relationship>
								<Phone>#{$('#editModal #phone').val()}</Phone>
								<Email>#{$('#editModal #email').val()}</Email>
								<Job>#{$('#editModal #job').val()}</Job>
								<EducationDegree>#{$('#editModal #education').val()}</EducationDegree>
							</CustodianOtherInfo>
						</CustodianOtherInfo>
					</StudentInfo>
				</Request>
			"""
		if edit_target is "father-info"
			request = """
				<Request>
					<StudentInfo>
						<StudentID>#{global.student.StudentID}</StudentID>
						<FatherName>#{$('#editModal #name').val()}</FatherName>
						<FatherOtherInfo>
							<FatherOtherInfo>
								<Relationship>父</Relationship>
								<Phone>#{$('#editModal #phone').val()}</Phone>
								<Email>#{$('#editModal #email').val()}</Email>
								<Job>#{$('#editModal #job').val()}</Job>
								<EducationDegree>#{$('#editModal #education').val()}</EducationDegree>
							</FatherOtherInfo>
						</FatherOtherInfo>
					</StudentInfo>
				</Request>
			"""
		if edit_target is "mother-info"
			request = """
				<Request>
					<StudentInfo>
						<StudentID>#{global.student.StudentID}</StudentID>
						<MotherName>#{$('#editModal #name').val()}</MotherName>
						<MotherOtherInfo>
							<MotherOtherInfo>
								<Relationship>父</Relationship>
								<Phone>#{$('#editModal #phone').val()}</Phone>
								<Email>#{$('#editModal #email').val()}</Email>
								<Job>#{$('#editModal #job').val()}</Job>
								<EducationDegree>#{$('#editModal #education').val()}</EducationDegree>
							</MotherOtherInfo>
						</MotherOtherInfo>
					</StudentInfo>
				</Request>
			"""
		
		if request isnt ""
			gadget.getContract("ischool.addressbook").send {
				service: "addressbook.UpdateStudentInfo",
				body: request,
				result: (response, error, xhr) ->
					if error?
						$("#editModal #errorMessage").html """
							<div class='alert alert-error'>
								<button class='close' data-dismiss='alert'>×</button>
								<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
							</div>
						"""
					else
						if response.Result.ExecuteCount is "1"
							if edit_target is "phone"
								global.student.ContactPhone = $('#editModal #contact-phone').val()
								global.student.PermanentPhone = $('#editModal #permanent-phone').val()
								global.student.SMSPhone = $('#editModal #sms-hone').val()
							
							if edit_target is "address"
								global.student.MailingAddress = {
									AddressList: {
										Address: {
											ZipCode: $('#editModal #contact-zip-code').val()
											County: $('#editModal #contact-county').val()
											Town: $('#editModal #contact-town').val()
											DetailAddress: $('#editModal #contact-detail').val()
										}
									}
								}
								global.student.PermanentAddress = {
									AddressList: {
										Address: {
											ZipCode: $('#editModal #permanent-zip-code').val()
											County: $('#editModal #permanent-county').val()
											Town: $('#editModal #permanent-town').val()
											DetailAddress: $('#editModal #permanent-detail').val()
										}
									}
								}
							
							if edit_target is "message"
								global.student.EmailAddress = $('#editModal #email').val()
							
							if edit_target is "custodian-info"
								global.student.CustodianName = $('#editModal #name').val()
								global.student.CustodianRelationship = $('#editModal #relationship').val()
								global.student.CustodianOtherInfo = {
									CustodianOtherInfo: {
										Relationship: $('#editModal #relationship').val(),
										Phone: $('#editModal #phone').val(),
										Email: $('#editModal #email').val(),
										Job: $('#editModal #job').val(),
										EducationDegree: $('#editModal #education').val()
									}
								}
							
							if edit_target is "father-info"
								global.student.FatherName = $('#editModal #name').val()
								global.student.FatherOtherInfo = {
									FatherOtherInfo: {
										Relationship: '父',
										Phone: $('#editModal #phone').val(),
										Email: $('#editModal #email').val(),
										Job: $('#editModal #job').val(),
										EducationDegree: $('#editModal #education').val()
									}
								}
							
							if edit_target is "mother-info"
								global.student.MotherName = $('#editModal #name').val()
								global.student.MotherOtherInfo = {
									MotherOtherInfo: {
										Relationship: '母',
										Phone: $('#editModal #phone').val(),
										Email: $('#editModal #email').val(),
										Job: $('#editModal #job').val(),
										EducationDegree: $('#editModal #education').val()
									}
								}
								
							if request_udt isnt ""
								gadget.getContract("ischool.addressbook").send {
									service: if global.student.UID is "" then "addressbook.AddUDTStudentInfo" else "addressbook.UpdateUDTStudentInfo",
									body: request_udt,
									result: (response, error, xhr) ->
										if error?
											$("#editModal #errorMessage").html """
												<div class='alert alert-error'>
													<button class='close' data-dismiss='alert'>×</button>
													<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
												</div>
											"""
										else
											if response.Result.ExecuteCount is "1"
												if edit_target is "message"
													global.student.FacebookID = $('#editModal #facebook').val()
													global.student.SkypeID = $('#editModal #skype').val()
													
												if edit_target is "emergency-contact"
													global.student.EmergencyContactName = $('#editModal #name').val()
													global.student.EmergencyContactRelationship = $('#editModal #relationship').val()
													global.student.EmergencyContactTel = $('#editModal #phone').val()
													
											$("#editModal").modal "hide"
								}
							else
								$("#editModal").modal "hide"
						
						$("#editModal").modal "hide"
			}
		else
			if request_udt isnt ""
				gadget.getContract("ischool.addressbook").send {
					service: if global.student.UID is "" then "addressbook.AddUDTStudentInfo" else "addressbook.UpdateUDTStudentInfo",
					body: request_udt,
					result: (response, error, xhr) ->
						if error?
							$("#editModal #errorMessage").html """
								<div class='alert alert-error'>
									<button class='close' data-dismiss='alert'>×</button>
									<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
								</div>
							"""
						else
							if response.Result.ExecuteCount is "1"
								if edit_target is "message"
									global.student.FacebookID = $('#editModal #facebook').val()
									global.student.SkypeID = $('#editModal #skype').val()
									
								if edit_target is "emergency-contact"
									global.student.EmergencyContactName = $('#editModal #name').val()
									global.student.EmergencyContactRelationship = $('#editModal #relationship').val()
									global.student.EmergencyContactTel = $('#editModal #phone').val()
									
							$("#editModal").modal "hide"
				}
			else
				$("#editModal").modal "hide"
		
	$("#baseinfo .label-title a").click () ->
		if global.student
			if $(@).attr("edit-target") is "phone"
				$("#editModal #save-data").attr "edit-target", "phone"
				$("#editModal .modal-header h3").html "編輯 - 電話資訊"
				$("#editModal .modal-body").html """
					<form class='form-horizontal'>
						<fieldset>
							<div class='control-group'>
								<label class='control-label'>通訊</label>
								<div class='controls'>
									<input type='text' class='input-large' id='contact-phone' value='#{global.student.ContactPhone ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>戶籍</label>
								<div class='controls'>
									<input type='text' class='input-large' id='permanent-phone' value='#{global.student.PermanentPhone ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>行動電話</label>
								<div class='controls'>
									<input type='text' class='input-large' id='sms-phone' value='#{global.student.SMSPhone ? ""}'>
								</div>
							</div>
						</fieldset>
					</form>
				"""
			else if $(@).attr("edit-target") is "address"
				$("#editModal #save-data").attr "edit-target", "address"
				$("#editModal .modal-header h3").html "編輯 - 地址資訊"
				$("#editModal .modal-body").html """
					<form class='form-horizontal'>
						<legend>通訊地址</legend>
						<fieldset>
							<div class='control-group'>
								<label class='control-label'>郵遞區號</label>
								<div class='controls'>
									<input type='text' class='input-large' id='contact-zip-code' value='#{global.student.MailingAddress?.AddressList?.Address?.ZipCode ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>縣市</label>
								<div class='controls'>
									<input type='text' class='input-large' id='contact-county' value='#{global.student.MailingAddress?.AddressList?.Address?.County ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>鄉鎮市區</label>
								<div class='controls'>
									<input type='text' class='input-large' id='contact-town' value='#{global.student.MailingAddress?.AddressList?.Address?.Town ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>地址</label>
								<div class='controls'>
									<input type='text' class='input-large' id='contact-detail' value='#{global.student.MailingAddress?.AddressList?.Address?.DetailAddress ? ""}'>
								</div>
							</div>
						</fieldset>
					</form>
					<form class='form-horizontal'>
						<legend>戶籍地址</legend>
						<fieldset>
							<div class='control-group'>
								<label class='control-label'>郵遞區號</label>
								<div class='controls'>
									<input type='text' class='input-large' id='permanent-zip-code' value='#{global.student.PermanentAddress?.AddressList?.Address?.ZipCode ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>縣市</label>
								<div class='controls'>
									<input type='text' class='input-large' id='permanent-county' value='#{global.student.PermanentAddress?.AddressList?.Address?.County ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>鄉鎮市區</label>
								<div class='controls'>
									<input type='text' class='input-large' id='permanent-town' value='#{global.student.PermanentAddress?.AddressList?.Address?.Town ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>地址</label>
								<div class='controls'>
									<input type='text' class='input-large' id='permanent-detail' value='#{global.student.PermanentAddress?.AddressList?.Address?.DetailAddress ? ""}'>
								</div>
							</div>
						</fieldset>
					</form>
				"""
			else if $(@).attr("edit-target") is "message"
				$("#editModal #save-data").attr "edit-target", "message"
				$("#editModal .modal-header h3").html "編輯 - 即時通訊資訊"
				$("#editModal .modal-body").html """
					<form class='form-horizontal'>
						<fieldset>
							<div class='control-group'>
								<label class='control-label'>Email</label>
								<div class='controls'>
									<input type='text' class='input-large' id='email' value='#{global.student.EmailAddress ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>Facebook</label>
								<div class='controls'>
									<input type='text' class='input-large' id='facebook' value='#{global.student.FacebookID ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>Skype</label>
								<div class='controls'>
									<input type='text' class='input-large' id='skype' value='#{global.student.SkypeID ? ""}'>
								</div>
							</div>
						</fieldset>
					</form>
				"""
			else if $(@).attr("edit-target") is "emergency-contact"
				$("#editModal #save-data").attr "edit-target", "emergency-contact"
				$("#editModal .modal-header h3").html "編輯 - 緊急聯絡人資訊"
				$("#editModal .modal-body").html """
					<form class='form-horizontal'>
						<fieldset>
							<div class='control-group'>
								<label class='control-label'>姓名</label>
								<div class='controls'>
									<input type='text' class='input-large' id='name' value='#{global.student.EmergencyContactName ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>關係</label>
								<div class='controls'>
									<input type='text' class='input-large' id='relationship' value='#{global.student.EmergencyContactRelationship ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>電話</label>
								<div class='controls'>
									<input type='text' class='input-large' id='phone' value='#{global.student.EmergencyContactTel ? ""}'>
								</div>
							</div>
						</fieldset>
					</form>
				"""
			else if $(@).attr("edit-target") is "custodian-info"
				$("#editModal #save-data").attr "edit-target", "custodian-info"
				$("#editModal .modal-header h3").html "編輯 - 監護人資訊"
				$("#editModal .modal-body").html """
					<form class='form-horizontal'>
						<fieldset>
							<div class='control-group'>
								<label class='control-label'>姓名</label>
								<div class='controls'>
									<input type='text' class='input-large' id='name' value='#{global.student.CustodianName ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>關係</label>
								<div class='controls'>
									<input type='text' class='input-large' id='relationship' value='#{global.student.CustodianRelationship ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>電話</label>
								<div class='controls'>
									<input type='text' class='input-large' id='phone' value='#{global.student.CustodianOtherInfo?.CustodianOtherInfo?.Phone ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>Email</label>
								<div class='controls'>
									<input type='text' class='input-large' id='email' value='#{global.student.CustodianOtherInfo?.CustodianOtherInfo?.Email ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>職業</label>
								<div class='controls'>
									<input type='text' class='input-large' id='job' value='#{global.student.CustodianOtherInfo?.CustodianOtherInfo?.Job ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>教育程度</label>
								<div class='controls'>
									<input type='text' class='input-large' id='education' value='#{global.student.CustodianOtherInfo?.CustodianOtherInfo?.EducationDegree ? ""}'>
								</div>
							</div>
						</fieldset>
					</form>
				"""
			else if $(@).attr("edit-target") is "father-info"
				$("#editModal #save-data").attr "edit-target", "father-info"
				$("#editModal .modal-header h3").html "編輯 - 父親資訊"
				$("#editModal .modal-body").html """
					<form class='form-horizontal'>
						<fieldset>
							<div class='control-group'>
								<label class='control-label'>姓名</label>
								<div class='controls'>
									<input type='text' class='input-large' id='name' value='#{global.student.FatherName ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>電話</label>
								<div class='controls'>
									<input type='text' class='input-large' id='phone' value='#{global.student.FatherOtherInfo?.FatherOtherInfo?.Phone ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>Email</label>
								<div class='controls'>
									<input type='text' class='input-large' id='email' value='#{global.student.FatherOtherInfo?.FatherOtherInfo?.Email ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>職業</label>
								<div class='controls'>
									<input type='text' class='input-large' id='job' value='#{global.student.FatherOtherInfo?.FatherOtherInfo?.Job ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>教育程度</label>
								<div class='controls'>
									<input type='text' class='input-large' id='education' value='#{global.student.FatherOtherInfo?.FatherOtherInfo?.EducationDegree ? ""}'>
								</div>
							</div>
						</fieldset>
					</form>
				"""
			else if $(@).attr("edit-target") is "mother-info"
				$("#editModal #save-data").attr "edit-target", "mother-info"
				$("#editModal .modal-header h3").html "編輯 - 母親資訊"
				$("#editModal .modal-body").html """
					<form class='form-horizontal'>
						<fieldset>
							<div class='control-group'>
								<label class='control-label'>姓名</label>
								<div class='controls'>
									<input type='text' class='input-large' id='name' value='#{global.student.MotherName ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>電話</label>
								<div class='controls'>
									<input type='text' class='input-large' id='phone' value='#{global.student.MotherOtherInfo?.MotherOtherInfo?.Phone ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>Email</label>
								<div class='controls'>
									<input type='text' class='input-large' id='email' value='#{global.student.MotherOtherInfo?.MotherOtherInfo?.Email ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>職業</label>
								<div class='controls'>
									<input type='text' class='input-large' id='job' value='#{global.student.MotherOtherInfo?.MotherOtherInfo?.Job ? ""}'>
								</div>
							</div>
							<div class='control-group'>
								<label class='control-label'>教育程度</label>
								<div class='controls'>
									<input type='text' class='input-large' id='education' value='#{global.student.MotherOtherInfo?.MotherOtherInfo?.EducationDegree ? ""}'>
								</div>
							</div>
						</fieldset>
					</form>
				"""
				
			$("#editModal").modal "show"
	
	$("#student-list").hover(
		() -> $(@).css("overflow", "auto")
		,
		() -> $(@).css("overflow", "hidden")
	)
	
	$("#baseinfo").hover(
		() -> $(@).css("overflow", "auto")
		,
		() -> $(@).css("overflow", "hidden")
	)
	
	$("#academic").hover(
		() -> $(@).css("overflow", "auto")
		,
		() -> $(@).css("overflow", "hidden")
	)
	
	$("#behavior").hover(
		() -> $(@).css("overflow", "auto")
		,
		() -> $(@).css("overflow", "hidden")
	)
	
	gadget.getContract("ta").send {
		service: "TeacherAccess.GetCurrentSemester",
		body: "",
		result: (response, error, xhr) ->
			global.schoolYear = response.Current.SchoolYear
			global.semester = response.Current.Semester
			global.academic =
				schoolYear: response.Current.SchoolYear
				semester: response.Current.Semester
			global.behavior =
				schoolYear: response.Current.SchoolYear
				semester: response.Current.Semester
			
			items = """
				<li>#{if global.semester is '2' then "<span class='badge badge-info label-title'>#{global.schoolYear}2</span></li>" else "<span class='badge badge-info'>#{global.schoolYear}1</span>"} <span class='divider'>:</span></li>
				#{if global.semester is '2' then "<li><a href='#' school-year='#{global.schoolYear}' semester='2'>#{global.schoolYear}2</a> <span class='divider'>|</span></li>" else ""}
				<li><a href='#' school-year='#{global.schoolYear}' semester='1'>#{global.schoolYear}1</a> <span class='divider'>|</span></li>
				<li><a href='#' school-year='#{global.schoolYear - 1}' semester='2'>#{global.schoolYear - 1}2</a> <span class='divider'>|</span></li>
				<li><a href='#' school-year='#{global.schoolYear - 1}' semester='1'>#{global.schoolYear - 1}1</a> <span class='divider'>|</span></li>
				<li><a href='#' school-year='#{global.schoolYear - 2}' semester='2'>#{global.schoolYear - 2}2</a> <span class='divider'>|</span></li>
				<li><a href='#' school-year='#{global.schoolYear - 2}' semester='1'>#{global.schoolYear - 2}1</a></li>
			"""
			
			$("#academic .breadcrumb").html items			
			$("#academic .breadcrumb a").click (e) ->
				e.preventDefault()
				$("#academic .breadcrumb .label-title").html "#{$(@).attr('school-year')}#{$(@).attr('semester')}"
				if global.student?
					global.academic =
						schoolYear: $(@).attr("school-year")
						semester: $(@).attr("semester")
					
					$("#academic #subject-score tbody").html ""
					$("#academic #domain-score tbody").html ""
					getAcademic()
				
			$("#behavior .breadcrumb").html items			
			$("#behavior .breadcrumb a").click (e) ->
				e.preventDefault()
				$("#behavior .breadcrumb .label-title").html "#{$(@).attr('school-year')}#{$(@).attr('semester')}"
				if global.student?
					global.behavior =
						schoolYear: $(@).attr("school-year")
						semester: $(@).attr("semester")
					
					$("#behavior #morality tbody").html ""
					$("#behavior #attendance .content").html ""
					$("#behavior #discipline .content").html ""
					$("#behavior #discipline tbody").html ""
					getMorality()
					getAttendance()
					getDiscipline()
	}
	
	gadget.getContract("ischool.addressbook").send {
		service: "addressbook.GetStudentInfo",
		body: "",
		result: (response, error, xhr) ->
			if response.Result?.Student?
				resetData()
				
				global.students = $(response.Result.Student)
				className = ""
				items = []
				global.students.each (index, student) ->
					if @ClassName isnt className
						className = @ClassName
						items.push "<li class='nav-header'>#{@ClassName}</li>"
					
					photo = "img/photo_male.png"
					if @FreshmanPhoto? and @FreshmanPhoto isnt ""
						photo = "data:image/png;base64,#{@FreshmanPhoto}"
					else if @Gender is "1"
						photo = "img/photo_male.png"
					else
						photo = "img/photo_female.png"
					
					items.push """
						<li#{if index is 0 then " class='active'" else ''}>
							<a student-index='#{index}'>
								<img class='student-photo' src='#{photo}'/>
								<span class='student-name'>#{@StudentName}</span>
								<span class='seat-no'>#{@SeatNo}</span>
								<span class='student-number'>#{@StudentNumber}</span>
							</a>
						</li>
					"""
					
					if index is 0
						global.student = student
						setBaseInfo()
						getAcademic()
						getMorality()
						getAttendance()
						getDiscipline()
						
				$("#student-list").html items.join ""
				$("#student-list a").click (e) ->
					e.preventDefault()
					$(@).tab "show"
					global.student = global.students[$(@).attr("student-index")]
					resetData()
					setBaseInfo()
					getAcademic()
					getMorality()
					getAttendance()
					getDiscipline()
	}

resetData = () ->
	$("#baseinfo #base-content").html ""
	$("#baseinfo #phone tbody").html ""
	$("#baseinfo #address tbody").html ""
	$("#baseinfo #message tbody").html ""
	$("#baseinfo #emergency-contact tbody").html ""
	$("#baseinfo #custodian-info tbody").html ""
	$("#baseinfo #father-info tbody").html ""
	$("#baseinfo #mother-info tbody").html ""
	
	$("#academic #subject-score tbody").html ""
	$("#academic #domain-score tbody").html ""
	
	$("#behavior #morality tbody").html ""
	$("#behavior #attendance .content").html ""
	$("#behavior #discipline .content").html ""
	$("#behavior #discipline tbody").html ""
	
setBaseInfo = () ->
	student = global.student
	freshmanPhoto = if student.FreshmanPhoto? and student.FreshmanPhoto isnt "" then "<img src='data:image/png;base64,#{student.FreshmanPhoto}' class='photo'/>" else ""
	graduatePhoto = if student.GraduatePhoto? and student.GraduatePhoto isnt "" then "<img src='data:image/png;base64,#{student.GraduatePhoto}' class='photo'/>" else ""
	console.log student
	if freshmanPhoto is ""
		if student.Gender is "1"
			freshmanPhoto = "<img src='img/photo_male.png' class='photo'/>"
		else
			freshmanPhoto = "<img src='img/photo_female.png' class='photo'/>"
	
	if graduatePhoto is ""
		if student.Gender is "1"
			graduatePhoto = "<img src='img/photo_male.png' class='photo'/>"
		else
			graduatePhoto = "<img src='img/photo_female.png' class='photo'/>"
				
	mailingAddress =
		student.MailingAddress?.AddressList?.Address?.ZipCode +
		student.MailingAddress?.AddressList?.Address?.County +
		student.MailingAddress?.AddressList?.Address?.Town +
		student.MailingAddress?.AddressList?.Address?.DetailAddress
	permanentAddress =
		student.PermanentAddress?.AddressList?.Address?.ZipCode +
		student.PermanentAddress?.AddressList?.Address?.County +
		student.PermanentAddress?.AddressList?.Address?.Town +
		student.PermanentAddress?.AddressList?.Address?.DetailAddress
	
	$("#baseinfo #base-content").html """
		<div style='display:inline-block;vertical-align:bottom'>#{freshmanPhoto}#{graduatePhoto}</div>
		<div style='display:inline-block;vertical-align:bottom'>
			<div style='margin-bottom:8px'><span class='label label-info'>#{student.StudentName ? ""}</span></div>
			<div style='margin-bottom:8px'><span class='label label-info'>#{student.EnglishName ? ""}</span></div>
			<div style='margin-bottom:8px'><span class='label label-info'>#{if student.Birthdate then student.Birthdate.substr(0, 10) else ""}</span></div>
			<div style='margin-bottom:8px'><span class='label label-info'>#{student.IDNumber ? ""}</span></div>
		</div>
	"""
	$("#baseinfo #phone tbody").html """
		<tr><td><span class='badge badge-success'>通訊</span></td><td><span>#{student.ContactPhone ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>戶籍</span></td><td><span>#{student.PermanentPhone ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>行動</span></td><td><span>#{student.SMSPhone ? ""}</span></td></tr>
	"""
	$("#baseinfo #address tbody").html """
		<tr><td><span class='badge badge-success'>通訊</span></td><td><span>#{mailingAddress}</span></div>
		<tr><td><span class='badge badge-success'>戶籍</span></td><td><span>#{permanentAddress}</span></div>
	"""
	$("#baseinfo #message tbody").html """
		<tr><td><span class='badge badge-success'>Email</span></td><td><span>#{student.EmailAddress}</span></td></tr>
		<tr><td><span class='badge badge-success'>Facebook</span></td><td><span>#{student.FacebookID}</span></td></tr>
		<tr><td><span class='badge badge-success'>Skype</span></td><td><span>#{student.SkypeID}</span></td></tr>
	"""
	$("#baseinfo #emergency-contact tbody").html """
		<tr><td colspan='2'><span>#{student.EmergencyContactName ? ""}</td></tr>
		<tr><td><span class='badge badge-success'>關係</span></td><td><span>#{student.EmergencyContactRelationship ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>電話</span></td><td><span>#{student.EmergencyContactTel ? ""}</span></td></tr>
	"""
	$("#baseinfo #custodian-info tbody").html """
		<tr><td colspan='2'><span>#{student.CustodianName ? ""}</td></tr>
		<tr><td><span class='badge badge-success'>關係</span></td><td><span>#{student.CustodianRelationship ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>電話</span></td><td><span>#{student.CustodianOtherInfo?.CustodianOtherInfo?.Phone ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>Email</span></td><td><span>#{student.CustodianOtherInfo?.CustodianOtherInfo?.Email ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>職業</span></td><td><span>#{student.CustodianOtherInfo?.CustodianOtherInfo?.Job ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>教育程度</span></td><td><span>#{student.CustodianOtherInfo?.CustodianOtherInfo?.EducationDegree ? ""}</span></td></tr>
	"""
	$("#baseinfo #father-info tbody").html """
		<tr><td colspan='2'><span>#{student.FatherName ? ""}</td></tr>
		<tr><td><span class='badge badge-success'>電話</span></td><td><span>#{student.FatherOtherInfo?.FatherOtherInfo?.Phone ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>Email</span></td><td><span>#{student.FatherOtherInfo?.FatherOtherInfo?.Email ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>職業</span></td><td><span>#{student.FatherOtherInfo?.FatherOtherInfo?.Job ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>教育程度</span></td><td><span>#{student.FatherOtherInfo?.FatherOtherInfo?.EducationDegree ? ""}</span></td></tr>
	"""
	$("#baseinfo #mother-info tbody").html """
		<tr><td colspan='2'><span>#{student.MotherName ? ""}</td></tr>
		<tr><td><span class='badge badge-success'>電話</span></td><td><span>#{student.MotherOtherInfo?.MotherOtherInfo?.Phone ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>Email</span></td><td><span>#{student.MotherOtherInfo?.MotherOtherInfo?.Email ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>職業</span></td><td><span>#{student.MotherOtherInfo?.MotherOtherInfo?.Job ? ""}</span></td></tr>
		<tr><td><span class='badge badge-success'>教育程度</span></td><td><span>#{student.MotherOtherInfo?.MotherOtherInfo?.EducationDegree ? ""}</span></td></tr>
	"""
	
getAcademic = () ->
	gadget.getContract("ischool.addressbook").send {
		service: "addressbook.GetSubjectSemesterScore",
		body: """
			<Request>
				<StudentID>#{global.student.StudentID}</StudentID>
				<SchoolYear>#{global.academic.schoolYear}</SchoolYear>
				<Semester>#{global.academic.semester}</Semester>
			</Request>
		""",
		result: (response, error, xhr) ->
			if response.Result.SemsSubjScore?.ScoreInfo?.Domains?
				items = []
				if response.Result.SemsSubjScore?.ScoreInfo?.SemesterSubjectScoreInfo?.Subject?
					$(response.Result.SemsSubjScore.ScoreInfo.SemesterSubjectScoreInfo.Subject).each () ->
						items.push """
							<tr>
								<td>
									<span>#{@科目}</span>
								</td>>
								<td>
									<span>#{@成績} / #{@努力程度 ? @文字描述 ? ''}</span>
								</td>
							</tr>
						"""
					$("#academic #subject-score tbody").html items.join ""
					$("#academic #subject-score .label-title").html "<span class='badge badge-info'>科目成績</span>"
				items = []
				if response.Result.SemsSubjScore?.ScoreInfo?.Domains?.Domain?
					$(response.Result.SemsSubjScore.ScoreInfo.Domains.Domain).each () ->
						items.push """
							<tr>
								<td>
									<span>#{@領域}</span>
								</td>
								<td>
									<span>#{@成績} / #{@努力程度 ? @文字描述 ? ''}</span>
								</td>
							</tr>
						"""
					$("#academic #domain-score tbody").html item.join ""
					$("#academic #domain-score .label-title").html "<span class='badge badge-info'>領域成績</span>"
			else
				items = []
				if response.Result.SemsSubjScore?.ScoreInfo?.SemesterSubjectScoreInfo?.Subject?
					$(response.Result.SemsSubjScore.ScoreInfo.SemesterSubjectScoreInfo.Subject).each () ->
						score = Math.max @原始成績, @補考成績, @重修成績, @擇優採計成績, @學年調整成績
						score = score + "(補)" if score is parseInt(@補考成績, 10)
						score = score + "(重)" if score is parseInt(@重修成績, 10)
						score = score + "(手)" if score is parseInt(@擇優採計成績, 10)
						score = score + "(調)" if score is parseInt(@學年調整成績, 10)
						
						items.push """
							<tr>
								<td>
									<span>#{@科目}</span>
								</td>
								<td>
									<span>#{score}</span>
								</td>
							</tr>
						"""
					$("#academic #subject-score tbody").html items.join ""
					$("#academic #subject-score .label-title").html "<span class='badge badge-info'>科目成績</span>"
					
				gadget.getContract("ischool.addressbook").send {
					service: "addressbook.GetEntryScore",
					body: """
						<Request>
							<StudentID>#{global.student.StudentID}</StudentID>
							<SchoolYear>#{global.academic.schoolYear}</SchoolYear>
							<Semester>#{global.academic.semester}</Semester>
						</Request>
					"""
					result: (response, status, xhr) ->
						$("#domain-score .label-title").html "<span class='badge badge-info'>分項成績</span>"
						items = []
						if response.Result.SemsEntryScore?
							$(response.Result.SemsEntryScore).each () ->
								if @ScoreInfo?.SemesterEntryScore?.Entry?
									$(@ScoreInfo.SemesterEntryScore.Entry).each () ->
										items.push """
											<tr>
												<td>
													<span>#{@分項}</span>
												</td>
												<td>
													<span>#{@成績}</span>
												</td>
											</tr>
										"""
									$("#academic #domain-score tbody").html items.join ""
				}
	}

getMorality = () ->
	gadget.getContract("ischool.addressbook").send {
		service: "addressbook.GetMoralScore",
		body: """
			<Request>
				<StudentID>#{global.student.StudentID}</StudentID>
				<SchoolYear>#{global.behavior.schoolYear}</SchoolYear>
				<Semester>#{global.behavior.semester}</Semester>
			</Request>
		""",
		result: (response, error, xhr) ->
			items = []
			if response.Result?.DailyLifeScore?.Content?.Morality?
				$(response.Result.DailyLifeScore.Content.Morality).each () ->
					items.push """
						<tr>
							<td><span>#{@['@text']}</span></td>
							<td><span>#{@Face}</span></td>
						</tr>
					"""
				$("#behavior #morality tbody").html items.join ""
				$("#behavior #morality .label-title").html "<span class='badge badge-info'>德行成績</span>"
			else if response.Result.DailyLifeScore?.TextScore?
				if @DailyBehavior?
					items.push "<tr><td colspan='2'><span>#{@DailyBehavior.Name ? '日常行為表現'}</span></td></tr>"
					$(@DailyBehavior.Item).each () ->
						items.push """
							<tr>
								<td><span>#{@Degree ? ''}</span></td>
								<td><span>#{@Name} #{@Index}</span></td>
							</tr>
						"""
				
				if @GroupActivity?
					items.push "<tr><td colspan='2'><span>#{@GroupActivity.Name ? '團體活動表'}</span></td></tr>"
					$(@GroupActivity.Item).each () ->
						items.push """
							<tr>
								<td><span>#{@Degree ? ''}</span></td>
								<td><span>#{@Name}</span></td>
							</tr>
						"""
				
				if @PublicService?
					items.push "<tr><td colspan='2'><span>#{@PublicService.Name ? '公共服務表現'}</span></td></tr>"
					$(@PublicService.Item).each () ->
						items.push """
							<tr>
								<td><span>#{@Description ? ''}</span></td>
								<td><span>#{@Name}</span></td>
							</tr>
						"""
				
				if @SchoolSpecial?
					items.push "<tr><td colspan='2'><span>#{@SchoolSpecial.Name ? '校內外特殊表現'}</span></td></tr>"
					$(@SchoolSpecial.Item).each () ->
						items.push """
							<tr>
								<td><span>#{@Description ? ''}</span></td>
								<td><span>#{@Name}</span></td>
							</tr>
						"""
				
				if @DailyLifeRecommend?
					items.push "<tr><td colspan='2'><span>#{@DailyLifeRecommend.Name ? '日常生活表現具體建議'}</span></td></tr>"
					items.push "<tr><td colspan='2'><span>#{@DailyLifeRecommend.Description ? @DailyLifeRecommend['#text']}</span></td></tr>"
				
				if @OtherRecommend?
					items.push "<tr><td colspan='2'><span>#{@OtherRecommend.Name ? '其他具體建議'}</span></td></tr>"
					items.push "<tr><td colspan='2'><span>#{@OtherRecommend['#text'] ? ''}</span></td></tr>"
			
				$("#behavior #morality tbody").html items.join ""
				$("#behavior #morality .label-title").html "<span class='badge badge-info'>日常行為表現</span>"
	}

getAttendance = () ->
	gadget.getContract("ischool.addressbook").send {
		service: "addressbook.GetAttendanceRecord",
		body: """
			<Request>
				<StudentID>#{global.student.StudentID}</StudentID>
				<SchoolYear>#{global.behavior.schoolYear}</SchoolYear>
				<Semester>#{global.behavior.semester}</Semester>
			</Request>
		"""
		result: (response, error, xhr) ->
			absences = {}
			if response.Result?.Attendance?
				$(response.Result.Attendance).each () ->
					$(@Detail.Attendance.Period).each () ->
						if not absences[@['AbsenceType']]?
							absences[@['AbsenceType']] = 0
						absences[@['AbsenceType']] += 1
			
			items = []
			for name of absences
				items.push """
					<span class='badge badge-inverse'>#{absences[name]} #{name}</span>
				"""
				
			$("#behavior #attendance .content").html items.join " "
	}

getDiscipline = () ->
	gadget.getContract("ischool.addressbook").send {
		service: "addressbook.GetDisciplineRecord",
		body: """
			<Request>
				<StudentID>#{global.student.StudentID}</StudentID>
			</Request>
		"""
		result: (response, error, xhr) ->
			items = []
			if response.Result?.Discipline?
				sum_merit = { ma: 0, mb: 0, mc: 0, da: 0, db: 0, dc: 0 }
				$(response.Result.Discipline).each () ->
					merit = { a: 0, b: 0, c: 0 }
					if @MeritFlag is "1"
						sum_merit.ma += merit.a = parseInt(@Detail.Discipline.Merit.A, 10) if not isNaN(parseInt(@Detail.Discipline.Merit.A, 10))
						sum_merit.mb += merit.b = parseInt(@Detail.Discipline.Merit.B, 10) if not isNaN(parseInt(@Detail.Discipline.Merit.B, 10))
						sum_merit.mc += merit.c = parseInt(@Detail.Discipline.Merit.C, 10) if not isNaN(parseInt(@Detail.Discipline.Merit.C, 10))
						merit.a = if merit.a isnt 0 then merit.a + " 大功" else ""
						merit.b = if merit.b isnt 0 then merit.b + " 小功" else ""
						merit.c = if merit.c isnt 0 then merit.c + " 嘉獎" else ""
						
						items.push """
							<tr>
								<td>
									<span>#{@OccurDate.substr(0, 10)} <span class='badge badge-success'>#{merit.a} #{merit.b} #{merit.c}</span></span>
									<br/>
									<span>#{@Reason}</span>
								</td>
							</tr>
						"""
					else
						sum_merit.da += merit.a = parseInt(@Detail.Discipline.Demerit.A, 10) if not isNaN(parseInt(@Detail.Discipline.Demerit.A, 10))
						sum_merit.db += merit.b = parseInt(@Detail.Discipline.Demerit.B, 10) if not isNaN(parseInt(@Detail.Discipline.Demerit.B, 10))
						sum_merit.dc += merit.c = parseInt(@Detail.Discipline.Demerit.C, 10) if not isNaN(parseInt(@Detail.Discipline.Demerit.C, 10))
						merit.a = if merit.a isnt 0 then merit.a + " 大過" else ""
						merit.b = if merit.b isnt 0 then merit.b + " 小過" else ""
						merit.c = if merit.c isnt 0 then merit.c + " 警告" else ""
						
						items.push """
							<tr>
								<td>
									<span>#{@OccurDate.substr(0, 10)} <span class='badge badge-important'>#{merit.a} #{merit.b} #{merit.c}</span></span>
									<br/>
									<span>#{@Reason}</span>
									<br/>
									#{if @Detail.Discipline.Demerit.Cleared is '是' then "<span>#{@Detail.Discipline.Demerit.ClearDate.substr(0, 10).replace(/\//ig, "-")} 已銷過<br/>#{@Detail.Discipline.Demerit.ClearReason}</span>" else ""}
								</td>
							</tr>
						"""
				
				$("#discipline .content").html """
					#{if sum_merit.ma + sum_merit.mb + sum_merit.mc isnt 0 then "<span class='badge badge-success'>#{sum_merit.ma} 大功 #{sum_merit.mb} 小功 #{sum_merit.mc} 嘉獎</span>" else ""}
					#{if sum_merit.da + sum_merit.db + sum_merit.dc isnt 0 then "<span class='badge badge-important'>#{sum_merit.da} 大過 #{sum_merit.db} 小過 #{sum_merit.dc} 警告</span>" else ""}
				"""
				$("#behavior #discipline tbody").html items.join("")
	}