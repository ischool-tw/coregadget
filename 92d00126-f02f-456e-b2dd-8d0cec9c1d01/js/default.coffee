$ ->
	$("td[target='data-sharing']").click (e) ->
		e.preventDefault()
		$(@).find("span").toggleClass("hide").closest('div').toggleClass('square')

	$('.modal').on 'shown', () ->
		$('.modal-body', $(@)).scrollTop(0)
		$('.error').removeClass 'error'

	$(".modal[target='address'] a[target='accept']").click (e) ->
		e.preventDefault()
		if $(@).attr("edit-type") is "MailingAddress"
			myInfo.MailingAddress.AddressList.Address.ZipCode = $(".modal[target='address'] input[target='zipcode']").val()
			myInfo.MailingAddress.AddressList.Address.County = $(".modal[target='address'] input[target='county']").val()
			myInfo.MailingAddress.AddressList.Address.Town = $(".modal[target='address'] input[target='town']").val()
			myInfo.MailingAddress.AddressList.Address.District = $(".modal[target='address'] input[target='district']").val()
			myInfo.MailingAddress.AddressList.Address.Area = $(".modal[target='address'] input[target='area']").val()
			myInfo.MailingAddress.AddressList.Address.DetailAddress = $(".modal[target='address'] input[target='detail']").val()
		if $(@).attr("edit-type") is "OtherAddresses"
			myInfo.OtherAddresses.AddressList.Address.ZipCode = $(".modal[target='address'] input[target='zipcode']").val()
			myInfo.OtherAddresses.AddressList.Address.County = $(".modal[target='address'] input[target='county']").val()
			myInfo.OtherAddresses.AddressList.Address.Town = $(".modal[target='address'] input[target='town']").val()
			myInfo.OtherAddresses.AddressList.Address.District = $(".modal[target='address'] input[target='district']").val()
			myInfo.OtherAddresses.AddressList.Address.Area = $(".modal[target='address'] input[target='area']").val()
			myInfo.OtherAddresses.AddressList.Address.DetailAddress = $(".modal[target='address'] input[target='detail']").val()

		bind_address()
		$(".modal[target='address']").modal "hide"

	$("#baseinfo a[target='edit-education']").click (e) ->
		e.preventDefault()
		$(".modal[target='education'] input[target='sharing']").prop "checked", false
		$(".modal[target='education'] input[target='schoolname']").val ""
		$(".modal[target='education'] input[target='department']").val ""
		$(".modal[target='education'] input[target='degree']").val ""
		$(".modal[target='education'] input[target='top']").prop "checked", false

		$(".modal[target='education'] div[target='confirm-message']").addClass "hide"
		$(".modal[target='education'] a[target='delete']").addClass "hide"
		$(".modal[target='education'] a[target='save']").attr "edit-type", "add"
		$(".modal[target='education']").modal "show"

	$(".modal[target='education'] a[target='save']").click (e) ->
		e.preventDefault()
		edit_type = $(@).attr "edit-type"

		schoolname = $(".modal[target='education'] input[target='schoolname']").val()
		department = $(".modal[target='education'] input[target='department']").val()
		degree = $(".modal[target='education'] input[target='degree']").val()
		top = $(".modal[target='education'] input[target='top']").prop("checked")
		sharing = "false"
		# sharing = $(".modal[target='education'] input[target='sharing']").prop("checked")

		gadget.getContract("emba.student").send {
			service: if edit_type is "add" then "default.AddEducationBackground" else "default.UpdateEducationBackground",
			body: """
				<Request>
					<EducationBackground>
						<SchoolName>#{schoolname}</SchoolName>
						<Department>#{department}</Department>
						<Degree>#{degree}</Degree>
						<IsTop>#{top}</IsTop>
						<IsSharing>#{sharing}</IsSharing>
						#{if edit_type is "update" then "<UID>#{$(@).attr('uid')}</UID>" else ""}
					</EducationBackground>
				</Request>""",
			result: (response, error, http) ->
				if response.Result? and parseInt(response.Result.EffectRows, 10) > 0
					bind_education()
					$(".modal[target='education']").modal "hide"
		}

		log_desc = ""
		if edit_type is "update"
			original_schoolname = $(".modal[target='education'] input[target='schoolname']").attr "original"
			original_department = $(".modal[target='education'] input[target='department']").attr "original"
			original_degree = $(".modal[target='education'] input[target='degree']").attr "original"
			original_top = $(".modal[target='education'] input[target='top']").attr "original"
			# original_sharing = $(".modal[target='education'] input[target='sharing']").attr "original"

			log_desc = """
				學校： #{original_schoolname} -> #{schoolname}
				系所： #{original_department} -> #{department}
				學位： #{original_degree} -> #{degree}
				最高學歷： #{if original_top is "t" then "是" else ""} -> #{if top is "true" then "是" else ""}
			"""
			# 分享： #{if original_sharing is "t" then "分享" else "不分享"} -> #{if sharing is "true" then "分享" else "不分享"}
		else
			log_desc = """
				學校： #{schoolname}
				系所： #{department}
				學位： #{degree}
				最高學歷： #{if top is "true" then "是" else ""}
			"""
			# 分享： #{if sharing is "true" then "分享" else "不分享"}

		gadget.getContract("emba.student").send {
			service: "public.AddLog",
			body: """
				<Request>
					<Log>
						<Actor>#{gadget.getContract("emba.student").getUserInfo().UserName}</Actor>
						<ActionType>#{if edit_type is "update" then "更新" else "新增"}</ActionType>
						<Action>#{if edit_type is "update" then "更新學歷" else "新增學歷"}</Action>
						<TargetCategory>ischool.emba.education_background</TargetCategory>
						<ClientInfo><ClientInfo></ClientInfo></ClientInfo>
						<ActionBy>ischool web 個人資訊小工具</ActionBy>
						<Description>#{log_desc}</Description>
					</Log>
				</Request>
			"""
		}

	$(".modal[target='education'] a[target='delete']").click (e) ->
		e.preventDefault()
		$(".modal[target='education'] div[target='confirm-message']").removeClass "hide"

	$(".modal[target='education'] a[target='confirm-cancel']").click (e) ->
		e.preventDefault()
		$(".modal[target='education'] div[target='confirm-message']").addClass "hide"

	$(".modal[target='education'] a[target='confirm-accept']").click (e) ->
		e.preventDefault()
		gadget.getContract("emba.student").send {
			service: "default.RemoveEducationBackground",
			body: """
				<Request>
					<EducationBackground>
						<UID>#{$(@).attr('uid')}</UID>
					</EducationBackground>
				</Request>""",
			result: (response, error, http) ->
				original_schoolname = $(".modal[target='education'] input[target='schoolname']").attr "original"
				original_department = $(".modal[target='education'] input[target='department']").attr "original"
				original_degree = $(".modal[target='education'] input[target='degree']").attr "original"
				original_top = $(".modal[target='education'] input[target='top']").attr "original"
				# original_sharing = $(".modal[target='education'] input[target='sharing']").attr "original"

				log_desc = """
					學校： #{original_schoolname}
					系所： #{original_department}
					學位： #{original_degree}
					最高學歷： #{if original_top is "t" then "是" else ""}
				"""
				# 分享： #{if original_sharing is "t" then "分享" else "不分享"}
				gadget.getContract("emba.student").send {
					service: "public.AddLog",
					body: """
						<Request>
							<Log>
								<Actor>#{gadget.getContract("emba.student").getUserInfo().UserName}</Actor>
								<ActionType>刪除</ActionType>
								<Action>刪除學歷</Action>
								<TargetCategory>ischool.emba.education_background</TargetCategory>
								<ClientInfo><ClientInfo></ClientInfo></ClientInfo>
								<ActionBy>ischool web 個人資訊小工具</ActionBy>
								<Description>#{log_desc}</Description>
							</Log>
						</Request>
					"""
				}
				if response.Result? and parseInt(response.Result.EffectRows, 10) > 0
					bind_education()
					$(".modal[target='education']").modal "hide"
		}


	$("#baseinfo a[target='edit-experience']").click (e) ->
		e.preventDefault()

		$(".modal[target='experience'] form").validate().resetForm()
		$(".modal[target='experience'] .error").removeClass "error"

		$(".modal[target='experience'] input[target='sharing']").prop "checked", false
		$(".modal[target='experience'] input[target='companyname']").val ""
		$(".modal[target='experience'] span[target='industry']").html "產業別"
		$(".modal[target='experience'] input[target='position']").val ""
		$(".modal[target='experience'] span[target='department']").html "部門"
		$(".modal[target='experience'] span[target='level']").html "層級別"
		$(".modal[target='experience'] span[target='place']").html "工作地點"
		$(".modal[target='experience'] span[target='status']").html "工作狀態"
		$(".modal[target='experience'] input[target='work_begin_date']").val ""
		$(".modal[target='experience'] input[target='work_end_date']").val ""
		$(".modal[target='experience'] input[target='publicist']").val ""
		$(".modal[target='experience'] input[target='public_relations_office_telephone']").val ""
		$(".modal[target='experience'] input[target='public_relations_office_fax']").val ""
		$(".modal[target='experience'] input[target='publicist_email']").val ""
		$(".modal[target='experience'] input[target='company_website']").val ""

		$(".modal[target='experience'] div[target='confirm-message']").addClass "hide"
		$(".modal[target='experience'] a[target='delete']").addClass "hide"
		$(".modal[target='experience'] a[target='save']").attr "edit-type", "add"
		$(".modal[target='experience']").modal "show"

	$(".modal[target='experience'] a[target='save']").click (e) ->
		e.preventDefault()
		if $(".modal[target='experience'] form").valid()
			edit_type = $(@).attr "edit-type"

			companyname = $(".modal[target='experience'] input[target='companyname']").val()
			industry = if $(".modal[target='experience'] span[target='industry']").html() isnt "產業別" then $(".modal[target='experience'] span[target='industry']").html() else ""
			position = $(".modal[target='experience'] input[target='position']").val()
			department = if $(".modal[target='experience'] span[target='department']").html() isnt "部門" then $(".modal[target='experience'] span[target='department']").html() else ""
			level = if $(".modal[target='experience'] span[target='level']").html() isnt "層級別" then $(".modal[target='experience'] span[target='level']").html() else ""
			place = if $(".modal[target='experience'] span[target='place']").html() isnt "工作地點" then $(".modal[target='experience'] span[target='place']").html() else ""
			status = if $(".modal[target='experience'] span[target='status']").html() isnt "工作狀態" then $(".modal[target='experience'] span[target='status']").html() else ""
			sharing = $(".modal[target='experience'] input[target='sharing']").prop("checked")
			work_begin_date = $(".modal[target='experience'] input[target='work_begin_date']").val()
			work_end_date = $(".modal[target='experience'] input[target='work_end_date']").val()
			publicist = $(".modal[target='experience'] input[target='publicist']").val()
			public_relations_office_telephone = $(".modal[target='experience'] input[target='public_relations_office_telephone']").val()
			public_relations_office_fax = $(".modal[target='experience'] input[target='public_relations_office_fax']").val()
			publicist_email = $(".modal[target='experience'] input[target='publicist_email']").val()
			company_website = $(".modal[target='experience'] input[target='company_website']").val()


			gadget.getContract("emba.student").send {
				service: if edit_type is "add" then "default.AddExperience" else "default.UpdateExperience",
				body: """
					<Request>
						<Experience>
							<CompanyName>#{companyname}</CompanyName>
							<Industry>#{industry}</Industry>
							<Position>#{position}</Position>
							<DepartmentCategory>#{department}</DepartmentCategory>
							<PostLevel>#{level}</PostLevel>
							<WorkPlace>#{place}</WorkPlace>
							<WorkStatus>#{status}</WorkStatus>
							<IsSharing>#{sharing}</IsSharing>
							<WorkBeginDate>#{work_begin_date}</WorkBeginDate>
							<WorkEndDate>#{work_end_date}</WorkEndDate>
							<Publicist>#{publicist}</Publicist>
							<PublicRelationsOfficeTelephone>#{public_relations_office_telephone}</PublicRelationsOfficeTelephone>
							<PblicRelationsOfficeFax>#{public_relations_office_fax}</PblicRelationsOfficeFax>
							<PublicistEmail>#{publicist_email}</PublicistEmail>
							<CompanyWebsite>#{company_website}</CompanyWebsite>
							#{if edit_type is "update" then "<UID>#{$(@).attr('uid')}</UID>" else ""}
						</Experience>
					</Request>""",

				result: (response, error, http) ->
					if response.Result? and parseInt(response.Result.EffectRows, 10) > 0
						bind_experience()
						$(".modal[target='experience']").modal "hide"
			}

			log_desc = ""
			if edit_type is "update"
				original_companyname = $(".modal[target='experience'] input[target='companyname']").attr "original"
				original_industry = $(".modal[target='experience'] span[target='industry']").attr "original"
				original_position = $(".modal[target='experience'] input[target='position']").attr "original"
				original_department = $(".modal[target='experience'] span[target='department']").attr "original"
				original_level = $(".modal[target='experience'] span[target='level']").attr "original"
				original_place = $(".modal[target='experience'] span[target='place']").attr "original"
				original_status = $(".modal[target='experience'] span[target='status']").attr "original"
				original_sharing = $(".modal[target='experience'] input[target='sharing']").attr "original"
				original_work_begin_date = $(".modal[target='experience'] input[target='work_begin_date']").attr "original"
				original_work_end_date = $(".modal[target='experience'] input[target='work_end_date']").attr "original"
				original_publicist = $(".modal[target='experience'] input[target='publicist']").attr "original"
				original_public_relations_office_telephone = $(".modal[target='experience'] input[target='public_relations_office_telephone']").attr "original"
				original_public_relations_office_fax = $(".modal[target='experience'] input[target='public_relations_office_fax']").attr "original"
				original_publicist_email = $(".modal[target='experience'] input[target='publicist_email']").attr "original"
				original_company_website = $(".modal[target='experience'] input[target='company_website']").attr "original"

				log_desc = """
					分享： #{if original_sharing is "t" then "分享" else "不分享"} -> #{if sharing is "true" then "分享" else "不分享"}
					公司： #{original_companyname} -> #{companyname}
					職稱： #{original_position} -> #{position}
					層級別： #{original_level} -> #{level}
					產業別： #{original_industry} -> #{industry}
					部門： #{original_department} -> #{department}
					工作地點： #{original_place} -> #{place}
					工作狀態： #{original_sharing} -> #{sharing}
					公關室電話： #{original_public_relations_office_telephone} -> #{public_relations_office_telephone}
					公關室傳真： #{original_public_relations_office_fax} -> #{public_relations_office_fax}
					對外公關姓名： #{original_publicist} -> #{publicist}
					對外公關EMAIL： #{original_publicist_email} -> #{publicist_email}
					公司網址： #{original_company_website} -> #{company_website}
					工作起日： #{original_work_begin_date} -> #{work_begin_date}
					工作迄日： #{original_work_end_date} -> #{work_end_date}
				"""
			else
				log_desc = """
					分享： #{if sharing is "true" then "分享" else "不分享"}
					公司： #{companyname}
					職稱： #{position}
					層級別： #{level}
					產業別： #{industry}
					部門： #{department}
					工作地點： #{place}
					工作狀態： #{sharing}
					公關室電話： #{public_relations_office_telephone}
					公關室傳真： #{public_relations_office_fax}
					對外公關姓名： #{publicist}
					對外公關EMAIL： #{publicist_email}
					公司網址： #{company_website}
					工作起日： #{work_begin_date}
					工作迄日： #{work_end_date}
				"""

			gadget.getContract("emba.student").send {
				service: "public.AddLog",
				body: """
					<Request>
						<Log>
							<Actor>#{gadget.getContract("emba.student").getUserInfo().UserName}</Actor>
							<ActionType>#{if edit_type is "update" then "更新" else "新增"}</ActionType>
							<Action>#{if edit_type is "update" then "更新經歷" else "新增經歷"}</Action>
							<TargetCategory>ischool.emba.experience</TargetCategory>
							<ClientInfo><ClientInfo></ClientInfo></ClientInfo>
							<ActionBy>ischool web 個人資訊小工具</ActionBy>
							<Description>#{log_desc}</Description>
						</Log>
					</Request>
				"""
			}
		else
			$(".modal[target='experience'] .error:first input").focus()

	$(".modal[target='experience'] a[target='delete']").click (e) ->
		e.preventDefault()
		$(".modal[target='experience'] div[target='confirm-message']").removeClass "hide"

	$(".modal[target='experience'] a[target='confirm-cancel']").click (e) ->
		e.preventDefault()
		$(".modal[target='experience'] div[target='confirm-message']").addClass "hide"

	$(".modal[target='experience'] a[target='confirm-accept']").click (e) ->
		e.preventDefault()
		gadget.getContract("emba.student").send {
			service: "default.RemoveExperience",
			body: """
				<Request>
					<Experience>
						<UID>#{$(@).attr('uid')}</UID>
					</Experience>
				</Request>""",
			result: (response, error, http) ->
				original_companyname = $(".modal[target='experience'] input[target='companyname']").attr "original"
				original_industry = $(".modal[target='experience'] span[target='industry']").attr "original"
				original_position = $(".modal[target='experience'] input[target='position']").attr "original"
				original_department = $(".modal[target='experience'] span[target='department']").attr "original"
				original_level = $(".modal[target='experience'] span[target='level']").attr "original"
				original_place = $(".modal[target='experience'] span[target='place']").attr "original"
				original_status = $(".modal[target='experience'] span[target='status']").attr "original"
				original_sharing = $(".modal[target='experience'] input[target='sharing']").attr "original"
				original_work_begin_date = $(".modal[target='experience'] input[target='work_begin_date']").attr "original"
				original_work_end_date = $(".modal[target='experience'] input[target='work_end_date']").attr "original"
				original_publicist = $(".modal[target='experience'] input[target='publicist']").attr "original"
				original_public_relations_office_telephone = $(".modal[target='experience'] input[target='public_relations_office_telephone']").attr "original"
				original_public_relations_office_fax = $(".modal[target='experience'] input[target='public_relations_office_fax']").attr "original"
				original_publicist_email = $(".modal[target='experience'] input[target='publicist_email']").attr "original"
				original_company_website = $(".modal[target='experience'] input[target='company_website']").attr "original"

				log_desc = """
					分享： #{if original_sharing is "t" then "分享" else "不分享"}
					公司： #{original_companyname}
					職稱： #{original_position}
					層級別： #{original_level}
					產業別： #{original_industry}
					部門： #{original_department}
					工作地點： #{original_place}
					工作狀態： #{original_sharing}
					公關室電話： #{original_public_relations_office_telephone}
					公關室傳真： #{original_public_relations_office_fax}
					對外公關姓名： #{original_publicist}
					對外公關EMAIL： #{original_publicist_email}
					公司網址： #{original_company_website}
					工作起日： #{original_work_begin_date}
					工作迄日： #{original_work_end_date}
				"""
				gadget.getContract("emba.student").send {
					service: "public.AddLog",
					body: """
						<Request>
							<Log>
								<Actor>#{gadget.getContract("emba.student").getUserInfo().UserName}</Actor>
								<ActionType>刪除</ActionType>
								<Action>刪除經歷</Action>
								<TargetCategory>ischool.emba.experience</TargetCategory>
								<ClientInfo><ClientInfo></ClientInfo></ClientInfo>
								<ActionBy>ischool web 個人資訊小工具</ActionBy>
								<Description>#{log_desc}</Description>
							</Log>
						</Request>
					"""
				}
				if response.Result? and parseInt(response.Result.EffectRows, 10) > 0
					bind_experience()
					$(".modal[target='experience']").modal "hide"
		}

	$(".modal[target='experience']").on "click", "ul[target='industry-options'] a", (e) ->
		e.preventDefault()
		$(".modal[target='experience'] span[target='industry']").html $(@).html()

	$(".modal[target='experience']").on "click", "ul[target='department-options'] a", (e) ->
		e.preventDefault()
		$(".modal[target='experience'] span[target='department']").html $(@).html()

	$(".modal[target='experience']").on "click", "ul[target='level-options'] a", (e) ->
		e.preventDefault()
		$(".modal[target='experience'] span[target='level']").html $(@).html()

	$(".modal[target='experience']").on "click", "ul[target='place-options'] a", (e) ->
		e.preventDefault()
		$(".modal[target='experience'] span[target='place']").html $(@).html()

	$(".modal[target='experience']").on "click", "ul[target='status-options'] a", (e) ->
		e.preventDefault()
		$(".modal[target='experience'] span[target='status']").html $(@).html()

	$(".modal[target='experience']").on "focus", "input.date:not(.hasDatepicker)", ->
        $( this ).datepicker({
            dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"]
            ,monthNames: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
            ,monthNamesShort: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
            ,dateFormat: "yy/mm/dd"
            ,changeMonth: true
            ,changeYear: true
            ,showButtonPanel: true
            ,onSelect: (dateStr) ->
                $(".modal[target='experience'] form").validate().element(this)

        })

	$("#baseinfo a[target='save-baseinfo']").click (e) ->
		e.preventDefault()
		if $("#baseinfo form").valid()
			request1 = """
				<Request>
					<Content>
						<EmailList>
							<email1>#{$("#baseinfo input[target='email1']").val()}</email1>
							<email2>#{$("#baseinfo input[target='email2']").val()}</email2>
							<email3>#{$("#baseinfo input[target='email3']").val()}</email3>
							<email4>#{$("#baseinfo input[target='email4']").val()}</email4>
							<email5>#{$("#baseinfo input[target='email5']").val()}</email5>
						</EmailList>
						<DataSharing>
							<DataSharing>
								<Name>true</Name>
								<Gender>true</Gender>
								<Birthdate>#{!$("#baseinfo span[target='share-birthdate']").hasClass('hide')}</Birthdate>
								<Custodian>#{!$("#baseinfo span[target='share-custodian-name']").hasClass('hide')}</Custodian>
								<CustodianPhone>#{!$("#baseinfo span[target='share-custodian-phone']").hasClass('hide')}</CustodianPhone>
								<ContactPhone>false</ContactPhone>
								<PermanentPhone>#{!$("#baseinfo span[target='share-permanent-phone']").hasClass('hide')}</PermanentPhone>
								<OtherPhoneList>
									<PhoneNumber title='公司電話'>#{!$("#baseinfo span[target='share-office-phone']").hasClass('hide')}</PhoneNumber>
									<PhoneNumber title='行動電話2'>#{!$("#baseinfo span[target='share-sms-phone2']").hasClass('hide')}</PhoneNumber>
									<PhoneNumber title='秘書電話'>#{!$("#baseinfo span[target='share-other-phone']").hasClass('hide')}</PhoneNumber>
								</OtherPhoneList>
								<SMSPhone>#{!$("#baseinfo span[target='share-sms-phone1']").hasClass('hide')}</SMSPhone>
								<EmailList>
									<Email1>#{!$("#baseinfo span[target='share-email1']").hasClass('hide')}</Email1>
									<Email2>#{!$("#baseinfo span[target='share-email2']").hasClass('hide')}</Email2>
									<Email3>#{!$("#baseinfo span[target='share-email3']").hasClass('hide')}</Email3>
									<Email4>#{!$("#baseinfo span[target='share-email4']").hasClass('hide')}</Email4>
									<Email5>#{!$("#baseinfo span[target='share-email5']").hasClass('hide')}</Email5>
								</EmailList>
								<ContactAddress>#{!$("#baseinfo span[target='share-contact-address']").hasClass('hide')}</ContactAddress>
								<PermanentAddress>#{!$("#baseinfo span[target='share-permanent-address']").hasClass('hide')}</PermanentAddress>
								<OtherAddressList>
									<Address>#{!$("#baseinfo span[target='share-office-address']").hasClass('hide')}</Address>
									<Address>#{!$("#baseinfo span[target='share-office-address']").hasClass('hide')}</Address>
									<Address>#{!$("#baseinfo span[target='share-office-address']").hasClass('hide')}</Address>
								</OtherAddressList>
							</DataSharing>
						</DataSharing>
					</Content>
				</Request>
			"""

			request2 = """
				<Request>
					<Content>
						<CustodianName>#{$("#baseinfo input[target='custodian-name']").val()}</CustodianName>
						<CustodianOtherInfo>
							<CustodianOtherInfo>
								<Phone>#{$("#baseinfo input[target='custodian-phone']").val()}</Phone>
								<Email>#{myInfo.CustodianOtherInfo.CustodianOtherInfo.Email}</Email>
								<Job>#{myInfo.CustodianOtherInfo.CustodianOtherInfo.Job}</Job>
								<EducationDegree>#{myInfo.CustodianOtherInfo.CustodianOtherInfo.EducationDegree}</EducationDegree>
								<Relationship>#{myInfo.CustodianOtherInfo.CustodianOtherInfo.Relationship}</Relationship>
							</CustodianOtherInfo>
						</CustodianOtherInfo>
						<ContactPhone>#{myInfo.ContactPhone}</ContactPhone>
						<OtherPhones>
							<PhoneList>
								<PhoneNumber>#{$("#baseinfo input[target='office-phone']").val()}</PhoneNumber>
								<PhoneNumber>#{$("#baseinfo input[target='sms-phone2']").val()}</PhoneNumber>
								<PhoneNumber>#{$("#baseinfo input[target='other-phone']").val()}</PhoneNumber>
							</PhoneList>
						</OtherPhones>
						<SMSPhone>#{$("#baseinfo input[target='sms-phone1']").val()}</SMSPhone>
						<MailingAddress>
							<AddressList>
								<Address>
									<ZipCode>#{myInfo.MailingAddress.AddressList.Address.ZipCode || ""}</ZipCode>
									<County>#{myInfo.MailingAddress.AddressList.Address.County || ""}</County>
									<Town>#{myInfo.MailingAddress.AddressList.Address.Town || ""}</Town>
									<District>#{myInfo.MailingAddress.AddressList.Address.District || ""}</District>
									<Area>#{myInfo.MailingAddress.AddressList.Address.Area || ""}</Area>
									<DetailAddress>#{myInfo.MailingAddress.AddressList.Address.DetailAddress || ""}</DetailAddress>
								</Address>
							</AddressList>
						</MailingAddress>
						<OtherAddresses>
							<AddressList>
								<Address>
									<ZipCode>#{myInfo.OtherAddresses.AddressList.Address.ZipCode || ""}</ZipCode>
									<County>#{myInfo.OtherAddresses.AddressList.Address.County || ""}</County>
									<Town>#{myInfo.OtherAddresses.AddressList.Address.Town || ""}</Town>
									<District>#{myInfo.OtherAddresses.AddressList.Address.District || ""}</District>
									<Area>#{myInfo.OtherAddresses.AddressList.Address.Area || ""}</Area>
									<DetailAddress>#{myInfo.OtherAddresses.AddressList.Address.DetailAddress || ""}</DetailAddress>
								</Address>
							</AddressList>
						</OtherAddresses>
					</Content>
				</Request>
			"""

			gadget.getContract("emba.student").send {
				service: "default.UpdateStudentBrief",
				body: request1,
				result: (response, error, http) ->
					if response.Result? and response.Result.EffectRows is "1"
						gadget.getContract("emba.student").send {
							service: "default.UpdateStudentInfo",
							body: request2,
							result: (response, error, http) ->
								if response.Result? and response.Result.EffectRows is "1"
									bind_myinfo()
									alert "更新完成!"
						}
			}

			log_desc1 = """
				性別： #{$("#baseinfo span[target='share-gender']").attr("original")} -> #{!$("#baseinfo span[target='share-gender']").hasClass('hide')}
				出生日期： #{$("#baseinfo span[target='share-birthdate']").attr("original")} -> #{!$("#baseinfo span[target='share-birthdate']").hasClass('hide')}
				緊急聯絡人： #{$("#baseinfo span[target='share-custodian-name']").attr("original")} -> #{!$("#baseinfo span[target='share-custodian-name']").hasClass('hide')}
				聯絡人電話： #{$("#baseinfo span[target='share-custodian-phone']").attr("original")} -> #{!$("#baseinfo span[target='share-custodian-phone']").hasClass('hide')}
				公司電話： #{$("#baseinfo span[target='share-office-phone']").attr("original")} -> #{!$("#baseinfo span[target='share-office-phone']").hasClass('hide')}
				秘書電話： #{$("#baseinfo span[target='share-other-phone']").attr("original")} -> #{!$("#baseinfo span[target='share-other-phone']").hasClass('hide')}
				行動電話 1： #{$("#baseinfo span[target='share-sms-phone1']").attr("original")} -> #{!$("#baseinfo span[target='share-sms-phone1']").hasClass('hide')}
				行動電話 2： #{$("#baseinfo span[target='share-sms-phone2']").attr("original")} -> #{!$("#baseinfo span[target='share-sms-phone2']").hasClass('hide')}
				E-MAIL 1： #{$("#baseinfo span[target='share-email1']").attr("original")} -> #{!$("#baseinfo span[target='share-email1']").hasClass('hide')}
				E-MAIL 2： #{$("#baseinfo span[target='share-email2']").attr("original")} -> #{!$("#baseinfo span[target='share-email2']").hasClass('hide')}
				E-MAIL 3： #{$("#baseinfo span[target='share-email3']").attr("original")} -> #{!$("#baseinfo span[target='share-email3']").hasClass('hide')}
				E-MAIL 4： #{$("#baseinfo span[target='share-email4']").attr("original")} -> #{!$("#baseinfo span[target='share-email4']").hasClass('hide')}
				E-MAIL 5： #{$("#baseinfo span[target='share-email5']").attr("original")} -> #{!$("#baseinfo span[target='share-email5']").hasClass('hide')}
				聯絡地址： #{$("#baseinfo span[target='share-contact-address']").attr("original")} -> #{!$("#baseinfo span[target='share-contact-address']").hasClass('hide')}
				公司地址： #{$("#baseinfo span[target='share-office-address']").attr("original")} -> #{!$("#baseinfo span[target='share-office-address']").hasClass('hide')}
			"""
			gadget.getContract("emba.student").send {
				service: "public.AddLog",
				body: """
					<Request>
						<Log>
							<Actor>#{gadget.getContract("emba.student").getUserInfo().UserName}</Actor>
							<ActionType>更新</ActionType>
							<Action>更新分享資料</Action>
							<TargetCategory>ischool.emba.student_brief2</TargetCategory>
							<ClientInfo><ClientInfo></ClientInfo></ClientInfo>
							<ActionBy>ischool web 個人資訊小工具</ActionBy>
							<Description>#{log_desc1}</Description>
						</Log>
					</Request>
				"""
			}

			log_desc2 = """
				緊急聯絡人： #{$("#baseinfo input[target='custodian-name']").attr("original")} -> #{$("#baseinfo input[target='custodian-name']").val()}
				聯絡人電話： #{$("#baseinfo input[target='custodian-phone']").attr("original")} -> #{$("#baseinfo input[target='custodian-phone']").val()}
				公司電話： #{$("#baseinfo input[target='office-phone']").attr("original")} -> #{$("#baseinfo input[target='office-phone']").val()}
				秘書電話： #{$("#baseinfo input[target='other-phone']").attr("original")} -> #{$("#baseinfo input[target='other-phone']").val()}
				行動電話 1： #{$("#baseinfo input[target='sms-phone1']").attr("original")} -> #{$("#baseinfo input[target='sms-phone1']").val()}
				行動電話 2： #{$("#baseinfo input[target='sms-phone2']").attr("original")} -> #{$("#baseinfo input[target='sms-phone2']").val()}
				E-MAIL 1： #{$("#baseinfo input[target='email1']").attr("original")} -> #{$("#baseinfo input[target='email1']").val()}
				E-MAIL 2： #{$("#baseinfo input[target='email2']").attr("original")} -> #{$("#baseinfo input[target='email2']").val()}
				E-MAIL 3： #{$("#baseinfo input[target='email3']").attr("original")} -> #{$("#baseinfo input[target='email3']").val()}
				E-MAIL 4： #{$("#baseinfo input[target='email4']").attr("original")} -> #{$("#baseinfo input[target='email4']").val()}
				E-MAIL 5： #{$("#baseinfo input[target='email5']").attr("original")} -> #{$("#baseinfo input[target='email5']").val()}
				聯絡地址： #{$("#baseinfo span[target='contact-address']").attr("original")} -> #{$("#baseinfo span[target='contact-address']").html()}
				公司地址： #{$("#baseinfo span[target='office-address']").attr("original")} -> #{$("#baseinfo span[target='office-address']").val()}
			"""
			gadget.getContract("emba.student").send {
				service: "public.AddLog",
				body: """
					<Request>
						<Log>
							<Actor>#{gadget.getContract("emba.student").getUserInfo().UserName}</Actor>
							<ActionType>更新</ActionType>
							<Action>更新個人資料</Action>
							<TargetCategory>student</TargetCategory>
							<ClientInfo><ClientInfo></ClientInfo></ClientInfo>
							<ActionBy>ischool web 個人資訊小工具</ActionBy>
							<Description>#{log_desc2}</Description>
						</Log>
					</Request>
				"""
			}
		else
			$("#baseinfo form .error:first input").focus()


	bind_data_source()
	bind_myinfo()
	bind_education()

# 更新基本資料畫面
myInfo = null
bind_myinfo = () ->
	gadget.getContract("emba.student").send {
		service: "default.GetMyInfo",
		body: "",
		result: (response, error, http) ->
			if response.Result?
				myInfo = response.Result

				gadget.getContract("emba.student").send {
					service: "default.GetStudentBrief",
					body: "",
					result: (response, error, http) ->
						if response.Result?
							myInfo.EmailList = response.Result.EmailList
							myInfo.EmailList = {
								email1: "",
								email2: "",
								email3: "",
								email4: "",
								email5: ""
							} if response.Result.EmailList is ""

							if not response.Result.DataSharing?.DataSharing?
								myInfo.DataSharing = {
									Name: 'true',
									Gender: 'true',
									Birthdate: 'false',
									Custodian: 'false',
									CustodianPhone: 'false',
									PermanentPhone: 'false',
									ContactPhone: 'false',
									SMSPhone: 'false',
									OtherPhoneList: {
										PhoneNumber: [
											{ "@title": "公司電話", "@text": 'false' },
											{ "@title": "行動電話2", "@text": 'false' },
											{ "@title": "秘書電話", "@text": 'false' }
										]
									},
									PermanentAddress: 'false',
									ContactAddress: 'false',
									OtherAddressList: {
										Address: [ 'false', 'false', 'false' ]
									},
									EmailList: {
										Email1: 'false',
										Email2: 'false',
										Email3: 'false',
										Email4: 'false',
										Email5: 'false'
									}
								}
							else
								myInfo.DataSharing = response.Result.DataSharing.DataSharing

							bind_baseinfo()
							bind_address()
				}
	}

# 基本資料
bind_baseinfo = () ->
	myInfo.CustodianOtherInfo = {
		CustodianOtherInfo: {
			Phone: "",
			Email: "",
			Job: "",
			EducationDegree: "",
			Relationship: ""
		}
	} if myInfo.CustodianOtherInfo is ""

	myInfo.CustodianOtherInfo = {
		CustodianOtherInfo: {
			Phone: myInfo.CustodianOtherInfo.CustodianOtherInfo.Phone || "",
			Email: myInfo.CustodianOtherInfo.CustodianOtherInfo.Email || "",
			Job: myInfo.CustodianOtherInfo.CustodianOtherInfo.Job || "",
			EducationDegree: myInfo.CustodianOtherInfo.CustodianOtherInfo.EducationDegree || "",
			Relationship: myInfo.CustodianOtherInfo.CustodianOtherInfo.Relationship || ""
		}
	}

	$("#baseinfo span[target='share-name']").removeClass "hide"
	$("#baseinfo span[target='share-name']").attr "original", myInfo.DataSharing.Name
	$("#baseinfo span[target='name']").html myInfo.Name
	$("#baseinfo span[target='name']").attr "original", myInfo.Name

	$("#baseinfo span[target='share-gender']").removeClass "hide"
	$("#baseinfo span[target='share-gender']").attr "original", myInfo.DataSharing.Gender
	$("#baseinfo span[target='gender']").html myInfo.Gender
	$("#baseinfo span[target='gender']").attr "original", myInfo.Gender

	$("#baseinfo span[target='share-birthdate']").closest('div').removeClass "square" if myInfo.DataSharing.Birthdate is "true"
	$("#baseinfo span[target='share-birthdate']").removeClass "hide" if myInfo.DataSharing.Birthdate is "true"
	$("#baseinfo span[target='share-birthdate']").attr "original", myInfo.DataSharing.Birthdate
	$("#baseinfo span[target='birthdate']").html myInfo.Birthdate.substr(0, 10) if myInfo.Birthdate isnt ""
	$("#baseinfo span[target='birthdate']").attr "original", myInfo.Birthdate.substr(0, 10) if myInfo.Birthdate isnt ""

	$("#baseinfo span[target='share-custodian-name']").closest('div').removeClass "square" if myInfo.DataSharing.Custodian is "true"
	$("#baseinfo span[target='share-custodian-name']").removeClass "hide" if myInfo.DataSharing.Custodian is "true"
	$("#baseinfo span[target='share-custodian-name']").attr "original", myInfo.DataSharing.Custodian
	$("#baseinfo input[target='custodian-name']").val myInfo.CustodianName
	$("#baseinfo input[target='custodian-name']").attr "original", myInfo.CustodianName

	$("#baseinfo span[target='share-custodian-phone']").closest('div').removeClass "square" if myInfo.DataSharing.CustodianPhone is "true"
	$("#baseinfo span[target='share-custodian-phone']").removeClass "hide" if myInfo.DataSharing.CustodianPhone is "true"
	$("#baseinfo span[target='share-custodian-phone']").attr "original", myInfo.DataSharing.CustodianPhone
	$("#baseinfo input[target='custodian-phone']").val myInfo.CustodianOtherInfo.CustodianOtherInfo.Phone
	$("#baseinfo input[target='custodian-phone']").attr "original", myInfo.CustodianOtherInfo.CustodianOtherInfo.Phone

	# $("#baseinfo span[target='share-contact-phone']").closest('div').removeClass "square" if myInfo.DataSharing.ContactPhone is "true"
	# $("#baseinfo span[target='share-contact-phone']").removeClass "hide" if myInfo.DataSharing.ContactPhone is "true"
	# $("#baseinfo span[target='share-contact-phone']").attr "original", myInfo.DataSharing.ContactPhone
	# $("#baseinfo input[target='contact-phone']").val myInfo.ContactPhone
	# $("#baseinfo input[target='contact-phone']").attr "original", myInfo.ContactPhone

	$("#baseinfo span[target='share-permanent-phone']").closest('div').removeClass "square" if myInfo.DataSharing.PermanentPhone is "true"
	$("#baseinfo span[target='share-permanent-phone']").removeClass "hide" if myInfo.DataSharing.PermanentPhone is "true"
	$("#baseinfo span[target='share-permanent-phone']").attr "original", myInfo.DataSharing.PermanentPhone
	$("#baseinfo span[target='permanent-phone']").html myInfo.PermanentPhone
	$("#baseinfo span[target='permanent-phone']").attr "original", myInfo.PermanentPhone

	$("#baseinfo span[target='share-office-phone']").closest('div').removeClass "square" if myInfo.DataSharing.OtherPhoneList.PhoneNumber[0]["@text"] is "true"
	$("#baseinfo span[target='share-office-phone']").removeClass "hide" if myInfo.DataSharing.OtherPhoneList.PhoneNumber[0]["@text"] is "true"
	$("#baseinfo span[target='share-office-phone']").attr "original", myInfo.DataSharing.OtherPhoneList.PhoneNumber[0]["@text"]
	$("#baseinfo input[target='office-phone']").val myInfo.OtherPhones.PhoneList.PhoneNumber[0]
	$("#baseinfo input[target='office-phone']").attr "original", myInfo.OtherPhones.PhoneList.PhoneNumber[0]

	$("#baseinfo span[target='share-other-phone']").closest('div').removeClass "square" if myInfo.DataSharing.OtherPhoneList.PhoneNumber[2]["@text"] is "true"
	$("#baseinfo span[target='share-other-phone']").removeClass "hide" if myInfo.DataSharing.OtherPhoneList.PhoneNumber[2]["@text"] is "true"
	$("#baseinfo span[target='share-other-phone']").attr "original", myInfo.DataSharing.OtherPhoneList.PhoneNumber[2]["@text"]
	$("#baseinfo input[target='other-phone']").val myInfo.OtherPhones.PhoneList.PhoneNumber[2]
	$("#baseinfo input[target='other-phone']").attr "original", myInfo.OtherPhones.PhoneList.PhoneNumber[2]

	$("#baseinfo span[target='share-sms-phone1']").closest('div').removeClass "square" if myInfo.DataSharing.SMSPhone is "true"
	$("#baseinfo span[target='share-sms-phone1']").removeClass "hide" if myInfo.DataSharing.SMSPhone is "true"
	$("#baseinfo span[target='share-sms-phone1']").attr "original", myInfo.DataSharing.SMSPhone
	$("#baseinfo input[target='sms-phone1']").val myInfo.SMSPhone
	$("#baseinfo input[target='sms-phone1']").attr "original", myInfo.SMSPhone

	$("#baseinfo span[target='share-sms-phone2']").closest('div').removeClass "square" if myInfo.DataSharing.OtherPhoneList.PhoneNumber[1]["@text"] is "true"
	$("#baseinfo span[target='share-sms-phone2']").removeClass "hide" if myInfo.DataSharing.OtherPhoneList.PhoneNumber[1]["@text"] is "true"
	$("#baseinfo span[target='share-sms-phone2']").attr "original", myInfo.DataSharing.OtherPhoneList.PhoneNumber[1]["@text"]
	$("#baseinfo input[target='sms-phone2']").val myInfo.OtherPhones.PhoneList.PhoneNumber[1]
	$("#baseinfo input[target='sms-phone2']").attr "original", myInfo.OtherPhones.PhoneList.PhoneNumber[1]

	$("#baseinfo span[target='share-email1']").closest('div').removeClass "square" if myInfo.DataSharing.EmailList["Email1"] is "true"
	$("#baseinfo span[target='share-email1']").removeClass "hide" if myInfo.DataSharing.EmailList["Email1"] is "true"
	$("#baseinfo span[target='share-email1']").attr "original", myInfo.DataSharing.EmailList["Email1"]
	$("#baseinfo input[target='email1']").val myInfo.EmailList["email1"]
	$("#baseinfo input[target='email1']").attr "original", myInfo.EmailList["email1"]

	$("#baseinfo span[target='share-email2']").closest('div').removeClass "square" if myInfo.DataSharing.EmailList["Email2"] is "true"
	$("#baseinfo span[target='share-email2']").removeClass "hide" if myInfo.DataSharing.EmailList["Email2"] is "true"
	$("#baseinfo span[target='share-email2']").attr "original", myInfo.DataSharing.EmailList["Email2"]
	$("#baseinfo input[target='email2']").val myInfo.EmailList["email2"]
	$("#baseinfo input[target='email2']").attr "original", myInfo.EmailList["email2"]

	$("#baseinfo span[target='share-email3']").closest('div').removeClass "square" if myInfo.DataSharing.EmailList["Email3"] is "true"
	$("#baseinfo span[target='share-email3']").removeClass "hide" if myInfo.DataSharing.EmailList["Email3"] is "true"
	$("#baseinfo span[target='share-email3']").attr "original", myInfo.DataSharing.EmailList["Email3"]
	$("#baseinfo input[target='email3']").val myInfo.EmailList["email3"]
	$("#baseinfo input[target='email3']").attr "original", myInfo.EmailList["email3"]

	$("#baseinfo span[target='share-email4']").closest('div').removeClass "square" if myInfo.DataSharing.EmailList["Email4"] is "true"
	$("#baseinfo span[target='share-email4']").removeClass "hide" if myInfo.DataSharing.EmailList["Email4"] is "true"
	$("#baseinfo span[target='share-email4']").attr "original", myInfo.DataSharing.EmailList["Email4"]
	$("#baseinfo input[target='email4']").val myInfo.EmailList["email4"]
	$("#baseinfo input[target='email4']").attr "original", myInfo.EmailList["email4"]

	$("#baseinfo span[target='share-email5']").closest('div').removeClass "square" if myInfo.DataSharing.EmailList["Email5"] is "true"
	$("#baseinfo span[target='share-email5']").removeClass "hide" if myInfo.DataSharing.EmailList["Email5"] is "true"
	$("#baseinfo span[target='share-email5']").attr "original", myInfo.DataSharing.EmailList["Email5"]
	$("#baseinfo input[target='email5']").val myInfo.EmailList["email5"]
	$("#baseinfo input[target='email5']").attr "original", myInfo.EmailList["email5"]

	$("#baseinfo span[target='share-contact-address']").closest('div').removeClass "square" if myInfo.DataSharing.ContactAddress is "true"
	$("#baseinfo span[target='share-contact-address']").removeClass "hide" if myInfo.DataSharing.ContactAddress is "true"
	$("#baseinfo span[target='share-contact-address']").attr "original", myInfo.DataSharing.ContactAddress
	$("#baseinfo span[target='contact-address']").html myInfo.DataSharing.ContactAddress
	$("#baseinfo span[target='contact-address']").attr "original", myInfo.DataSharing.ContactAddress

	$("#baseinfo span[target='share-permanent-address']").closest('div').removeClass "square" if myInfo.DataSharing.PermanentAddress is "true"
	$("#baseinfo span[target='share-permanent-address']").removeClass "hide" if myInfo.DataSharing.PermanentAddress is "true"
	$("#baseinfo span[target='share-permanent-address']").attr "original", myInfo.DataSharing.PermanentAddress
	$("#baseinfo span[target='permanent-address']").html myInfo.DataSharing.PermanentAddress
	$("#baseinfo span[target='permanent-address']").attr "original", myInfo.DataSharing.PermanentAddress

	$("#baseinfo span[target='share-office-address']").closest('div').removeClass "square" if myInfo.DataSharing.OtherAddressList.Address[0] is "true"
	$("#baseinfo span[target='share-office-address']").removeClass "hide" if myInfo.DataSharing.OtherAddressList.Address[0] is "true"
	$("#baseinfo span[target='share-office-address']").attr "original", myInfo.DataSharing.OtherAddressList.Address[0]
	$("#baseinfo span[target='office-address']").html myInfo.DataSharing.OtherAddressList.Address[0]
	$("#baseinfo span[target='office-address']").attr "original", myInfo.DataSharing.OtherAddressList.Address[0]

	$("#baseinfo span[target='photo']").html "<img src='data:image/png;base64,#{myInfo.FreshmanPhoto}' style='width:80px'/>"

bind_address = () ->
	$("#baseinfo span[target='contact-address']").html "#{myInfo.MailingAddress.AddressList.Address.ZipCode || ''}#{myInfo.MailingAddress.AddressList.Address.County || ''}#{myInfo.MailingAddress.AddressList.Address.Town || ''}#{myInfo.MailingAddress.AddressList.Address.District || ''}#{myInfo.MailingAddress.AddressList.Address.Area || ''}#{myInfo.MailingAddress.AddressList.Address.DetailAddress || ''}"
	$("#baseinfo span[target='contact-address']").attr "original", "#{myInfo.MailingAddress.AddressList.Address.ZipCode || ''}#{myInfo.MailingAddress.AddressList.Address.County || ''}#{myInfo.MailingAddress.AddressList.Address.Town || ''}#{myInfo.MailingAddress.AddressList.Address.District || ''}#{myInfo.MailingAddress.AddressList.Address.Area || ''}#{myInfo.MailingAddress.AddressList.Address.DetailAddress || ''}"

	$("#baseinfo td[target='edit-contact-address']").click (e) ->
		e.preventDefault()
		$(".modal[target='address'] .modal-header h3").html "編輯聯絡地址"
		$(".modal[target='address'] input[target='zipcode']").val myInfo.MailingAddress.AddressList.Address.ZipCode || ""
		$(".modal[target='address'] input[target='county']").val myInfo.MailingAddress.AddressList.Address.County || ""
		$(".modal[target='address'] input[target='town']").val myInfo.MailingAddress.AddressList.Address.Town || ""
		$(".modal[target='address'] input[target='district']").val myInfo.MailingAddress.AddressList.Address.District || ""
		$(".modal[target='address'] input[target='area']").val myInfo.MailingAddress.AddressList.Address.Area || ""
		$(".modal[target='address'] input[target='detail']").val myInfo.MailingAddress.AddressList.Address.DetailAddress || ""

		$(".modal[target='address'] a[target='accept']").attr "edit-type", "MailingAddress"
		$(".modal[target='address']").modal "show"

	$("#baseinfo span[target='permanent-address']").html "#{myInfo.PermanentAddress.AddressList.Address.ZipCode || ''}#{myInfo.PermanentAddress.AddressList.Address.County || ''}#{myInfo.PermanentAddress.AddressList.Address.Town || ''}#{myInfo.PermanentAddress.AddressList.Address.District || ''}#{myInfo.PermanentAddress.AddressList.Address.Area || ''}#{myInfo.PermanentAddress.AddressList.Address.DetailAddress || ''}"
	$("#baseinfo span[target='permanent-address']").attr "original", "#{myInfo.PermanentAddress.AddressList.Address.ZipCode || ''}#{myInfo.PermanentAddress.AddressList.Address.County || ''}#{myInfo.PermanentAddress.AddressList.Address.Town || ''}#{myInfo.PermanentAddress.AddressList.Address.District || ''}#{myInfo.PermanentAddress.AddressList.Address.Area || ''}#{myInfo.PermanentAddress.AddressList.Address.DetailAddress || ''}"

	$("#baseinfo span[target='office-address']").html "#{myInfo.OtherAddresses.AddressList.Address.ZipCode || ''}#{myInfo.OtherAddresses.AddressList.Address.County || ''}#{myInfo.OtherAddresses.AddressList.Address.Town || ''}#{myInfo.OtherAddresses.AddressList.Address.District || ''}#{myInfo.OtherAddresses.AddressList.Address.Area || ''}#{myInfo.OtherAddresses.AddressList.Address.DetailAddress || ''}"
	$("#baseinfo span[target='office-address']").attr "original", "#{myInfo.OtherAddresses.AddressList.Address.ZipCode || ''}#{myInfo.OtherAddresses.AddressList.Address.County || ''}#{myInfo.OtherAddresses.AddressList.Address.Town || ''}#{myInfo.OtherAddresses.AddressList.Address.District || ''}#{myInfo.OtherAddresses.AddressList.Address.Area || ''}#{myInfo.OtherAddresses.AddressList.Address.DetailAddress || ''}"

	$("#baseinfo td[target='edit-office-address']").click (e) ->
		e.preventDefault()
		$(".modal[target='address'] .modal-header h3").html "編輯公司地址"
		$(".modal[target='address'] input[target='zipcode']").val myInfo.OtherAddresses.AddressList.Address.ZipCode || ""
		$(".modal[target='address'] input[target='county']").val myInfo.OtherAddresses.AddressList.Address.County || ""
		$(".modal[target='address'] input[target='town']").val myInfo.OtherAddresses.AddressList.Address.Town || ""
		$(".modal[target='address'] input[target='district']").val myInfo.OtherAddresses.AddressList.Address.District || ""
		$(".modal[target='address'] input[target='area']").val myInfo.OtherAddresses.AddressList.Address.Area || ""
		$(".modal[target='address'] input[target='detail']").val myInfo.OtherAddresses.AddressList.Address.DetailAddress || ""

		$(".modal[target='address'] a[target='accept']").attr "edit-type", "OtherAddresses"
		$(".modal[target='address']").modal "show"

# 學歷
educations = []
bind_education = () ->
	gadget.getContract("emba.student").send {
		service: "default.GetEducationBackground",
		body: "",
		result: (response, error, http) ->
			items = []
			if response.Result?
				educations = $(response.Result.EducationBackground)
				educations.each (index, item) ->
					items.push """
						<tr>
							<td><span class="label label-important" target="share-contact-address"><i class="icon-"></i></span></td>
							<td>#{item.SchoolName}</td>
							<td>#{item.Department}</td>
							<td>#{item.Degree}</td>
							<td>#{if item.IsTop is "t" then "是" else ""}</td>
							<td style='width:40px'><a href='#' class='btn btn-mini btn-inverse' index='#{index}' target='edit'>編輯</a></td>
						</tr>"""

			$("#baseinfo #education tbody").html items.join ""
			$("#baseinfo #education a[target='edit']").click (e) ->
				e.preventDefault()
				index = parseInt $(@).attr("index"), 10

				# $(".modal[target='education'] input[target='sharing']").prop "checked", educations[index].IsSharing is "t"
				# $(".modal[target='education'] input[target='sharing']").attr "original", educations[index].IsSharing
				$(".modal[target='education'] input[target='schoolname']").val educations[index].SchoolName
				$(".modal[target='education'] input[target='schoolname']").attr "original", educations[index].SchoolName
				$(".modal[target='education'] input[target='department']").val educations[index].Department
				$(".modal[target='education'] input[target='department']").attr "original", educations[index].Department
				$(".modal[target='education'] input[target='degree']").val educations[index].Degree
				$(".modal[target='education'] input[target='degree']").attr "original", educations[index].Degree
				$(".modal[target='education'] input[target='top']").prop "checked", educations[index].IsTop is "t"
				$(".modal[target='education'] input[target='top']").attr "original", educations[index].IsTop

				$(".modal[target='education'] .modal-header h3").html "編輯學歷"
				$(".modal[target='education'] div[target='confirm-message']").addClass "hide"
				$(".modal[target='education'] a[target='delete']").removeClass "hide"
				$(".modal[target='education'] a[target='save']").attr "edit-type", "update"
				$(".modal[target='education'] a[target='save']").attr "uid", educations[index].UID
				$(".modal[target='education'] a[target='confirm-accept']").attr "uid", educations[index].UID
				$(".modal[target='education']").modal "show"
	}

# 經歷
experiences = []
bind_experience = () ->
	gadget.getContract("emba.student").send {
		service: "default.GetExperience",
		body: "",
		result: (response, error, http) ->
			items = []
			if response.Result?
				experiences = $(response.Result.Experience)
				experiences.each (index, item) ->
					items.push """
						<tr>
                            <th class="myth" style="width:30px">分享</th>
                            <th class="myth">公司</th>
                            <th class="myth">職稱</th>
                            <th class="myth">層級別</th>
                            <th class="myth">產業別</th>
                            <th class="myth">部門</th>
                            <th class="myth">工作地點</th>
                            <th class="myth">工作狀態</th>
                            <th class="myth"></th>
                        </tr>
						<tr>
							<td rowspan="3">
							#{
								if item.WorkStatus is "現職"
								    if item.IsSharing is "t"
								        "<span class='label label-info'><i class='icon-ok icon-white'></i></span>"
								    else
								        '<div class="square"></div>'
								else
								    '<span class="label label-important" target="share-permanent-address"><i class="icon-"></i></span>'

							}
							</td>
							<td>#{item.CompanyName || '&nbsp;'}</td>
							<td>#{item.Position}</td>
							<td>#{item.PostLevel}</td>
							<td>#{item.Industry}</td>
							<td>#{item.DepartmentCategory}</td>
							<td>#{item.WorkPlace}</td>
							<td>#{item.WorkStatus}</td>
							<td rowspan="3" style='width:40px'><a href='#' class='btn btn-mini btn-inverse' index='#{index}' target='edit'>編輯</a></td>
						</tr>
	                    <tr>
	                        <th class="myth">公關姓名</th>
	                        <th class="myth">公關室電話</th>
	                        <th class="myth">公關室傳真</th>
	                        <th class="myth">公關室email</th>
	                        <th class="myth">公司網址</th>
	                        <th class="myth">工作起日</th>
	                        <th class="myth">工作迄日</th>
	                    </tr>
	                    <tr>
							<td>#{item.Publicist || '&nbsp;'}</td>
							<td>#{item.PublicRelationsOfficeTelephone}</td>
							<td>#{item.PblicRelationsOfficeFax}</td>
							<td>#{item.PublicistEmail}</td>
							<td>#{item.CompanyWebsite}</td>
							<td>#{item.WorkBeginDate}</td>
							<td>#{item.WorkEndDate}</td>
						</tr>"""

			$("#baseinfo #experience tbody").html items.join ""
			$("#baseinfo #experience a[target='edit']").click (e) ->
				e.preventDefault()

				$(".modal[target='experience'] form").validate().resetForm()
				$(".modal[target='experience'] .error").removeClass "error"

				index = parseInt $(@).attr("index"), 10

				$(".modal[target='experience'] input[target='sharing']").prop "checked", experiences[index].IsSharing is "t"
				$(".modal[target='experience'] input[target='sharing']").attr "original", experiences[index].IsSharing
				$(".modal[target='experience'] input[target='companyname']").val experiences[index].CompanyName
				$(".modal[target='experience'] input[target='companyname']").attr "original", experiences[index].CompanyName
				$(".modal[target='experience'] span[target='industry']").html experiences[index].Industry || "產業別"
				$(".modal[target='experience'] span[target='industry']").attr "original", experiences[index].Industry
				$(".modal[target='experience'] input[target='position']").val experiences[index].Position
				$(".modal[target='experience'] input[target='position']").attr "original", experiences[index].Position
				$(".modal[target='experience'] span[target='department']").html experiences[index].DepartmentCategory || "部門"
				$(".modal[target='experience'] span[target='department']").attr "original", experiences[index].DepartmentCategory
				$(".modal[target='experience'] span[target='level']").html experiences[index].PostLevel || "層級別"
				$(".modal[target='experience'] span[target='level']").attr "original", experiences[index].PostLevel
				$(".modal[target='experience'] span[target='place']").html experiences[index].WorkPlace || "工作地點"
				$(".modal[target='experience'] span[target='place']").attr "original", experiences[index].WorkPlace
				$(".modal[target='experience'] span[target='status']").html experiences[index].WorkStatus || "工作狀態"
				$(".modal[target='experience'] span[target='status']").attr "original", experiences[index].WorkStatus
				$(".modal[target='experience'] input[target='work_begin_date']").val experiences[index].WorkBeginDate
				$(".modal[target='experience'] input[target='work_begin_date']").attr "original", experiences[index].WorkBeginDate
				$(".modal[target='experience'] input[target='work_end_date']").val experiences[index].WorkEndDate
				$(".modal[target='experience'] input[target='work_end_date']").attr "original", experiences[index].WorkEndDate
				$(".modal[target='experience'] input[target='publicist']").val experiences[index].Publicist
				$(".modal[target='experience'] input[target='publicist']").attr "original", experiences[index].Publicist
				$(".modal[target='experience'] input[target='public_relations_office_telephone']").val experiences[index].PublicRelationsOfficeTelephone
				$(".modal[target='experience'] input[target='public_relations_office_telephone']").attr "original", experiences[index].PublicRelationsOfficeTelephone
				$(".modal[target='experience'] input[target='public_relations_office_fax']").val experiences[index].PblicRelationsOfficeFax
				$(".modal[target='experience'] input[target='public_relations_office_fax']").attr "original", experiences[index].PblicRelationsOfficeFax
				$(".modal[target='experience'] input[target='publicist_email']").val experiences[index].PublicistEmail
				$(".modal[target='experience'] input[target='publicist_email']").attr "original", experiences[index].PublicistEmail
				$(".modal[target='experience'] input[target='company_website']").val experiences[index].CompanyWebsite
				$(".modal[target='experience'] input[target='company_website']").attr "original", experiences[index].CompanyWebsite

				$(".modal[target='experience'] .modal-header h3").html "編輯經歷"
				$(".modal[target='experience'] div[target='confirm-message']").addClass "hide"
				$(".modal[target='experience'] a[target='delete']").removeClass "hide"
				$(".modal[target='experience'] a[target='save']").attr "edit-type", "update"
				$(".modal[target='experience'] a[target='save']").attr "uid", experiences[index].UID
				$(".modal[target='experience'] a[target='confirm-accept']").attr "uid", experiences[index].UID
				$(".modal[target='experience']").modal "show"
	}

# 經歷部份欄位資料來源
bind_data_source = () ->
	gadget.getContract("emba.student").send {
		service: "default.GetExperienceDataSource",
		body: {
			Request: {
				Condition: {
					NotDisplay: 'f'
				}
			}
		},
		result: (response, error, http) ->
			options = {}
			if response.Result?
				data_source = $(response.Result.ExperienceDataSource)
				data_source.each (index, item) ->
					if (!options[item.ItemCategory])
						options[item.ItemCategory] = []

					options[item.ItemCategory].push """<li><a href="#">#{item.Item || ''}</a></li>"""

				$(".modal[target='experience'] ul[target='level-options']").html options['層級別'].join ""
				$(".modal[target='experience'] ul[target='industry-options']").html options['產業別'].join ""
				$(".modal[target='experience'] ul[target='department-options']").html options['部門類別'].join ""
				$(".modal[target='experience'] ul[target='place-options']").html options['工作地點'].join ""
				$(".modal[target='experience'] ul[target='status-options']").html options['工作狀態'].join ""
				bind_experience()
	}

# 驗證錯誤提示
$.validator.setDefaults
	debug: false # 為 true 時不會 submit
	errorElement: "span" #錯誤時使用元素
	errorClass: "help-inline" #錯誤時使用樣式
	highlight: (element) ->

	    # 將未通過驗證的表單元素設置高亮度
	    $(element).closest('.control-group').addClass "error"

	unhighlight: (element) ->

	    # 與 highlight 相反
	    $(element).closest('.control-group').removeClass "error"

# 驗證經歷中的分享必須為現職狀態
jQuery.validator.addMethod "ShareIncumbent", ((value, element) ->
	if $(element).prop('checked')
  		$(".modal[target='experience'] span[target='status']").html() is '現職'
  	else
    	true
), "現職才能勾選分享"