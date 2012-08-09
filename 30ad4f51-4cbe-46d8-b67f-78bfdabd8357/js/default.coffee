global = {}

jQuery ->
  gadget.autofit document.getElementById "widget"
  gadget.onSizeChanged (size) ->
    $("#student-list").height size.height - 110
    $("#baseinfo").height size.height - 110
    $("#notebook").height size.height - 110
    $("#message").height size.height - 110
    $("#academic").height size.height - 110
    $("#behavior").height size.height - 110      

  
  $("#filter-keyword").keyup () ->
    resetStudentList()

  $("#filter-student").click () ->
    resetStudentList()

  resetStudentList = () ->
    resetData()
    className = ""
    items = []
    accordionHTML = ""
    firstClassName = ""
    global.students.each (index, student) ->
      if @StudentName.indexOf($("#filter-keyword").val()) isnt -1
        if @ClassName isnt className
          className = @ClassName
          (accordionHTML += items.join "" 
          accordionHTML += """
                  </ul>
                </div>
              </div>
            </div>
          """
          items.splice(0)) if accordionHTML?

          accordionHTML += """
            <div class='accordion-group'>
              <div class='accordion-heading'>
                <a class='accordion-toggle' data-toggle='collapse' data-parent='#student-list' href='#collapse#{index}'><i class='icon-user'></i>#{@ClassName}</a>
              </div>
              <div id='collapse#{index}' class='accordion-body collapse #{if firstClassName is '' then 'in' else ''}'>
                <div class='accordion-inner'>
                  <ul class='nav nav-pills nav-stacked'>
          """

          firstClassName = @ClassName if firstClassName is ''
              
        items.push """
          <li>
            <a href='#' student-index='#{index}'>
              <span class='my-seat-no label label-inverse my-label'>#{@SeatNo}</span>
              <span class='my-student-name'>#{@StudentName}</span>								
              <span class='my-student-number'>#{@StudentNumber}</span>
              <i class='icon-chevron-right pull-right'></i>
            </a>
          </li>
        """
    
    accordionHTML += items.join "" 
    accordionHTML += """
            </ul>
          </div>
        </div>
      </div>
    """

    $("#student-list").html accordionHTML
    $("#student-list .accordion-body a").click (e) ->
      e.preventDefault()
      $(@).tab "show"
      ###
      $("#student-list .accordion-body a i").addClass "icon-white"
      $(@).find("i").removeClass "icon-white"
      ###
      global.student = global.students[$(@).attr("student-index")]
      resetData()
      setBaseInfo()
      getAcademic()
      getMorality()
      getAttendance()
      getDiscipline()
      get_notes()
      get_message_about_one_student()
      
  $("#notebook textarea").bind "keyup", (event) ->
    if parseInt($("#notebook textarea").val().length, 10) is 0
      $("#notebook .btn").addClass("disabled").attr "disabled", "disabled"
    else
      $("#notebook .btn").removeClass("disabled").removeAttr "disabled"

  $("#notebook #save-add-notebook").bind "click", ->
    if $("#notebook textarea").val() isnt ""
      gadget.getContract("ischool.notebook").send
        service: "notebook.AddNote"
        body: "<Request><Note><StudentID>" + global.student.StudentID + "</StudentID><Content>" + $("#notebook textarea").val() + "</Content></Note></Request>"
        result: (response, error, http) ->
          if error?
            $("#mainMsg").html """
              <div class='alert alert-error'>
                <button class='close' data-dismiss='alert'>×</button>
                <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
              </div>
            """
          else          
            get_notes response.Result.NewID  unless response.Result.NewID is 'undefined'
            $("#notebook textarea").val ""
            $("#notebook #save-add-notebook").addClass("disabled").attr "disabled", "disabled"
    

  gadget.getContract("ischool.message").send
    service: "message.GetMyInfo"
    body: ""
    result: (response, error, http) ->
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
      else
        global._myInfo = $(response.Result.Info)


  $("#message #save-add-message").bind "click", ->
    if $("#message textarea").val() isnt ""
      gadget.getContract("ischool.message").send
        service: "message.AddMessage"
        body: "<Request><Message><Content>#{$("#message textarea").val()}</Content></Message></Request>"
        result: (response, error, http) ->
          if error?
            $("#mainMsg").html """
              <div class='alert alert-error'>
                <button class='close' data-dismiss='alert'>×</button>
                <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
              </div>
            """
          else
            if response.Result.NewID?
              tmp_NewID = response.Result.NewID
              gadget.getContract("ischool.message").send
                service: "message.SetStudentLink"
                body: "<Request><Student ID='#{global.student.StudentID}' MsgID='#{tmp_NewID}'></Student></Request>"
                result: (response, error, http) ->
                  if error?
                    $("#mainMsg").html """
                      <div class='alert alert-error'>
                        <button class='close' data-dismiss='alert'>×</button>
                        <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
                      </div>
                    """
                  else
                    get_message_about_one_student tmp_NewID

              $("#message textarea").val ""
              $("#message .my-message-word-counter").html "140"
              $("#message #save-add-message").addClass("disabled").attr "disabled", "disabled"



  $("#message textarea").bind "keyup", (event) ->
    $("#message .my-message-word-counter").html 140 - $("#message textarea").val().length
    if parseInt($("#message .my-message-word-counter").html(), 10) < 0
      $("#message .my-message-word-counter").css "color", "#f00"
      $("#message .btn").addClass("disabled").attr "disabled", "disabled"
    else if parseInt($("#message .my-message-word-counter").html(), 10) is 140
      $("#message .my-message-word-counter").css "color", "#999"
      $("#message .btn").addClass("disabled").attr "disabled", "disabled"
    else
      $("#message .my-message-word-counter").css "color", "#999"
      $("#message .btn").removeClass("disabled").removeAttr "disabled"

  $("#editModal").modal { show: false }
  $("#editModal").on "hidden", () ->
    $("#editModal #errorMessage").html ""
  $("#editModal").on "show", () ->
    $("#editModal #save-data").show()
  
  $("#editModal #save-data").click () ->
    $("#editModal #save-data").hide()
    edit_target = $(@).attr("edit-target")
    switch edit_target
      when "update-note"
        update_note()
      when "delete-note"
        delete_note()
      when "add-note"
        add_note()
      when "delete-message"
        delete_message()
      else
        saveBaseInfo edit_target
    
  $("#baseinfo .my-label-title a").live 'click', ->
    if global.student
      if $(@).attr("edit-target") is "detail"
        $("#editModal #save-data").attr "edit-target", "detail"
        $("#editModal .modal-header h3").html "編輯 - 基本資訊"
        $("#editModal .modal-body").html """
          <form class='form-horizontal'>
            <fieldset>
              <div class='control-group'>
                <label class='control-label' for='english-name'>英文姓名</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='english-name' value='#{global.student.EnglishName ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label'>入學照</label>
                <div class='controls'>
                  <img id='update-photo-image' src='data:image/png;base64,#{global.student.FreshmanPhoto}' photo-base64='#{global.student.FreshmanPhoto}'>
						      <div>
							      <input type='file' id='files' name='files[]'/>
							      <br/>
							      <span class='update-item-label'>僅支援 PNG (*.png) 與 JPEG (*.jpg) 格式</span>
						      </div>
                </div>
              </div>              
            </fieldset>
          </form>
        """
        node = document.getElementById("files")
        if node
          if node.addEventListener
            node.addEventListener "change", ((evt) ->
              if evt.target is 'undefined' or evt.target.files is 'undefined' or evt.target.files.length is 0
                alert "您的瀏覽器並未支援讀取檔案功能，請更新您的瀏覽器，謝謝!\n\n建議瀏覽器：Chrome 10+, IE 10+, Firefox 10+"
                return
              file = evt.target.files[0]
              return  unless file.type is "image/png" or file.type is "image/jpeg"
              reader = new FileReader()
              reader.onload = ((theFile) ->
                (e) ->
                  $("#editModal #update-photo-image").attr "src", e.target.result
                  photo_base64 = e.target.result.replace("data:image/png;base64,", "").replace("data:image/jpeg;base64,", "")
                  $("#editModal #update-photo-image").attr "photo-base64", photo_base64
              )(file)
              reader.readAsDataURL file
            ), false
          else
            node.attachEvent "onchange", (evt) ->
              if evt.target is 'undefined' or evt.target.files is 'undefined' or evt.target.files.length is 0
                alert "您的瀏覽器並未支援讀取檔案功能，請更新您的瀏覽器，謝謝!\n\n建議瀏覽器：Chrome 10+, IE 10+, Firefox 10+"
                return
              file = evt.target.files[0]
              return  unless file.type is "image/png" or file.type is "image/jpeg"
              reader = new FileReader()
              reader.onload = ((theFile) ->
                (e) ->
                  $("#editModal #update-photo-image").attr "src", e.target.result
                  photo_base64 = e.target.result.replace("data:image/png;base64,", "").replace("data:image/jpeg;base64,", "")
                  $("#editModal #update-photo-image").attr "photo-base64", photo_base64
              )(file)
              reader.readAsDataURL file
      else if $(@).attr("edit-target") is "phone"
        $("#editModal #save-data").attr "edit-target", "phone"
        $("#editModal .modal-header h3").html "編輯 - 電話資訊"
        $("#editModal .modal-body").html """
          <form class='form-horizontal'>
            <fieldset>
              <div class='control-group'>
                <label class='control-label' for='contact-phone'>通訊</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='contact-phone' value='#{global.student.ContactPhone ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='permanent-phone'>戶籍</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='permanent-phone' value='#{global.student.PermanentPhone ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='sms-phone'>行動電話</label>
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
                <label class='control-label' for='contact-zip-code'>郵遞區號</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='contact-zip-code' value='#{global.student.MailingAddress?.AddressList?.Address?.ZipCode ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='contact-county'>縣市</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='contact-county' value='#{global.student.MailingAddress?.AddressList?.Address?.County ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='contact-town'>鄉鎮市區</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='contact-town' value='#{global.student.MailingAddress?.AddressList?.Address?.Town ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='contact-detail'>地址</label>
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
                <label class='control-label' for='permanent-zip-code'>郵遞區號</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='permanent-zip-code' value='#{global.student.PermanentAddress?.AddressList?.Address?.ZipCode ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='permanent-county'>縣市</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='permanent-county' value='#{global.student.PermanentAddress?.AddressList?.Address?.County ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='permanent-town'>鄉鎮市區</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='permanent-town' value='#{global.student.PermanentAddress?.AddressList?.Address?.Town ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='permanent-detail'>地址</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='permanent-detail' value='#{global.student.PermanentAddress?.AddressList?.Address?.DetailAddress ? ""}'>
                </div>
              </div>
            </fieldset>
          </form>
        """
      else if $(@).attr("edit-target") is "instant-messaging"
        $("#editModal #save-data").attr "edit-target", "instant-messaging"
        $("#editModal .modal-header h3").html "編輯 - 即時通訊資訊"
        $("#editModal .modal-body").html """
          <form class='form-horizontal'>
            <fieldset>
              <div class='control-group'>
                <label class='control-label' for='email'>Email</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='email' value='#{global.student.EmailAddress ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='facebook'>Facebook</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='facebook' value='#{global.student.FacebookID ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='skype'>Skype</label>
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
                <label class='control-label' for='name'>姓名</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='name' value='#{global.student.EmergencyContactName ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='relationship'>關係</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='relationship' value='#{global.student.EmergencyContactRelationship ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='phone'>電話</label>
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
                <label class='control-label' for='name'>姓名</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='name' value='#{global.student.CustodianName ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='relationship'>關係</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='relationship' value='#{global.student.CustodianRelationship ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='phone'>電話</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='phone' value='#{global.student.CustodianOtherInfo?.CustodianOtherInfo?.Phone ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='email'>Email</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='email' value='#{global.student.CustodianOtherInfo?.CustodianOtherInfo?.Email ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='job'>職業</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='job' value='#{global.student.CustodianOtherInfo?.CustodianOtherInfo?.Job ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='education'>教育程度</label>
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
                <label class='control-label' for='name'>姓名</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='name' value='#{global.student.FatherName ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='phone'>電話</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='phone' value='#{global.student.FatherOtherInfo?.FatherOtherInfo?.Phone ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='email'>Email</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='email' value='#{global.student.FatherOtherInfo?.FatherOtherInfo?.Email ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='job'>職業</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='job' value='#{global.student.FatherOtherInfo?.FatherOtherInfo?.Job ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='education'>教育程度</label>
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
                <label class='control-label' for='name'>姓名</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='name' value='#{global.student.MotherName ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='phone'>電話</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='phone' value='#{global.student.MotherOtherInfo?.MotherOtherInfo?.Phone ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='email'>Email</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='email' value='#{global.student.MotherOtherInfo?.MotherOtherInfo?.Email ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='job'>職業</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='job' value='#{global.student.MotherOtherInfo?.MotherOtherInfo?.Job ? ""}'>
                </div>
              </div>
              <div class='control-group'>
                <label class='control-label' for='education'>教育程度</label>
                <div class='controls'>
                  <input type='text' class='input-large' id='education' value='#{global.student.MotherOtherInfo?.MotherOtherInfo?.EducationDegree ? ""}'>
                </div>
              </div>
            </fieldset>
          </form>
        """
        
      $("#editModal #save-data").html "儲存變更"
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

  $("#notebook").hover(
    () -> $(@).css("overflow", "auto")
    ,
    () -> $(@).css("overflow", "hidden")
  )

  $("#message").hover(
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
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
      else
        global.schoolYear = response.Current.SchoolYear
        global.semester = response.Current.Semester
        global.academic =
          schoolYear: response.Current.SchoolYear
          semester: response.Current.Semester
        global.behavior =
          schoolYear: response.Current.SchoolYear
          semester: response.Current.Semester
      
        items = """				
          #{if global.semester is '2' then "<button class='btn btn-large active' school-year='#{global.schoolYear}' semester='2'>#{global.schoolYear}2</button>" else ""}
          <button class='btn btn-large' #{if global.semester is '2' then '' else 'active'} school-year='#{global.schoolYear}' semester='1'>#{global.schoolYear}1</button>
          <button class='btn btn-large' school-year='#{global.schoolYear - 1}' semester='2'>#{global.schoolYear - 1}2</button>
          <button class='btn btn-large' school-year='#{global.schoolYear - 1}' semester='1'>#{global.schoolYear - 1}1</button>
          <button class='btn btn-large' school-year='#{global.schoolYear - 2}' semester='2'>#{global.schoolYear - 2}2</button>
          <button class='btn btn-large' school-year='#{global.schoolYear - 2}' semester='1'>#{global.schoolYear - 2}1</button>
        """
      
        $("#academic .btn-group").html items			
        $("#academic .btn-group button").click (e) ->
          e.preventDefault()				
          if global.student?
            global.academic =
              schoolYear: $(@).attr("school-year")
              semester: $(@).attr("semester")
          
            $("#academic #subject-score tbody").html ""
            $("#academic #domain-score tbody").html ""
            getAcademic()
        
        $("#behavior .btn-group").html items			
        $("#behavior .btn-group button").click (e) ->
          e.preventDefault()
          if global.student?
            global.behavior =
              schoolYear: $(@).attr("school-year")
              semester: $(@).attr("semester")
          
            $("#behavior #morality tbody").html ""
            $("#behavior #attendance .my-content").html ""
            $("#behavior #discipline tbody").html ""
            getMorality()
            getAttendance()
            getDiscipline()
  }
  
  gadget.getContract("ischool.addressbook").send {
    service: "addressbook.GetStudentInfo",
    body: "",
    result: (response, error, xhr) ->
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
      else
        if response.Result?.Student?
          resetData()
        
          global.students = $(response.Result.Student)
          className = ""
          items = []
          accordionHTML = ""
          global.students.each (index, student) ->
            if @ClassName isnt className
              className = @ClassName

              (accordionHTML += items.join "" 
              accordionHTML += """
                      </ul>
                    </div>
                  </div>
                </div>
              """
              items.splice(0)) if accordionHTML?

              accordionHTML += """
                <div class='accordion-group'>
                  <div class='accordion-heading'>
                    <a class='accordion-toggle' data-toggle='collapse' data-parent='#student-list' href='#collapse#{index}'><i class='icon-user'></i>#{@ClassName}</a>
                  </div>
                  <div id='collapse#{index}' class='accordion-body collapse #{if index is 0 then 'in' else ''}'>
                    <div class='accordion-inner'>
                      <ul class='nav nav-pills nav-stacked'>
              """

            items.push """
              <li #{if index is 0 then " class='active'" else ''}>
                <a href='#' student-index='#{index}'>
                  <span class='my-seat-no label label-inverse my-label'>#{@SeatNo}</span>
                  <span class='my-student-name'>#{@StudentName}</span>								
                  <span class='my-student-number'>#{@StudentNumber}</span>                  
                  <i class='icon-chevron-right pull-right'></i>
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
              get_notes()
              get_message_about_one_student()

            
          accordionHTML += items.join "" 
          accordionHTML += """
                  </ul>
                </div>
              </div>
            </div>
          """
        
          $("#student-list").html accordionHTML

          $("#student-list .accordion-body a").click (e) ->
            e.preventDefault()
            $(@).tab "show"
            ###
            $("#student-list .accordion-body a i").addClass "icon-white"
            $(@).find("i").removeClass "icon-white"
            ###
            global.student = global.students[$(@).attr("student-index")]
            resetData()
            setBaseInfo()
            getAcademic()
            getMorality()
            getAttendance()
            getDiscipline()
            get_notes()
            get_message_about_one_student()
  }

resetData = () ->
  $("#baseinfo #base-content").html ""
  $("#baseinfo #phone tbody").html ""
  $("#baseinfo #address tbody").html ""
  $("#baseinfo #instant-messaging tbody").html ""
  $("#baseinfo #emergency-contact tbody").html ""
  $("#baseinfo #custodian-info tbody").html ""
  $("#baseinfo #father-info tbody").html ""
  $("#baseinfo #mother-info tbody").html ""

  $(".my-notebook-manager .my-stream-items").html ""
  
  $(".my-message-manager .my-stream-items").html ""
  
  $("#academic #subject-score tbody").html ""
  $("#academic #domain-score tbody").html ""
  
  $("#behavior #morality tbody").html ""
  $("#behavior #attendance .my-content").html ""
  $("#behavior #discipline tbody").html ""
  
setBaseInfo = () ->
  student = global.student
  freshmanPhoto = if student.FreshmanPhoto? and student.FreshmanPhoto isnt "" then "<img src='data:image/png;base64,#{student.FreshmanPhoto}' class='my-photo' alt='入學照' title='入學照'/>" else ""
  graduatePhoto = if student.GraduatePhoto? and student.GraduatePhoto isnt "" then "<img src='data:image/png;base64,#{student.GraduatePhoto}' class='my-photo' alt='畢業照' title='畢業照'/>" else ""
  console.log student
  if freshmanPhoto is ""
    if student.Gender is "1"
      freshmanPhoto = "<img src='img/photo_male.png' class='my-photo' alt='入學照' title='入學照' />"
    else
      freshmanPhoto = "<img src='img/photo_female.png' class='my-photo' alt='入學照' title='入學照'/>"
  
  if graduatePhoto is ""
    if student.Gender is "1"
      graduatePhoto = "<img src='img/photo_male.png' class='my-photo' alt='畢業照' title='畢業照'/>"
    else
      graduatePhoto = "<img src='img/photo_female.png' class='my-photo' alt='畢業照' title='畢業照'/>"
        
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
    <div class='span6'>
      <div class="my-label-title">
			  <a class="btn btn-success" edit-target="detail"><i class="icon-edit icon-white"></i> 基本資訊</a>
		  </div>
      <div class='page-header'>
        <h1>#{student.StudentName ? ""} <small>#{student.EnglishName ? ""}</small></h1>
      </div>
      <p>#{if student.Birthdate then student.Birthdate.substr(0, 10) else ""}</p>
      <p>#{student.IDNumber ? ""}</p>
    </div>
    <div class='span6'>
      #{freshmanPhoto}#{graduatePhoto}
    </div>
  """
  $("#baseinfo #phone tbody").html """
    <tr><th><span>通訊</span></th><td><span>#{student.ContactPhone ? ""}</span></td></tr>
    <tr><th><span>戶籍</span></th><td><span>#{student.PermanentPhone ? ""}</span></td></tr>
    <tr><th><span>行動</span></th><td><span>#{student.SMSPhone ? ""}</span></td></tr>
  """
  $("#baseinfo #address tbody").html """
    <tr><th><span>通訊</span></th><td><span>#{mailingAddress}
      #{if mailingAddress isnt '' then '<a href="http://www.google.com/maps?f=q&source=s_q&hl=zh-TW&geocode=&ie=UTF8z=16&q=' + mailingAddress + ' target="_blank" class="btn btn-info"><i class="icon-white icon-map-marker"></i> 地圖</a>' else ''}</span></div>
    <tr><th><span>戶籍</span></th><td><span>#{permanentAddress}
      #{if permanentAddress isnt '' then '<a href="http://www.google.com/maps?f=q&source=s_q&hl=zh-TW&geocode=&ie=UTF8z=16&q=' + permanentAddress + ' target="_blank" class="btn btn-info"><i class="icon-white icon-map-marker"></i> 地圖</a>' else ''}</span></div>
  """
  $("#baseinfo #instant-messaging tbody").html """
    <tr><th><span>Email</span></th><td><span>#{student.EmailAddress}</span></td></tr>
    <tr><th><span>Facebook</span></th><td><span>#{student.FacebookID}</span></td></tr>
    <tr><th><span>Skype</span></th><td><span>#{student.SkypeID}</span></td></tr>
  """
  $("#baseinfo #emergency-contact tbody").html """
    <tr><th><span>姓名</span></th><td><span>#{student.EmergencyContactName ? ""}</span></td></tr>
    <tr><th><span>關係</span></th><td><span>#{student.EmergencyContactRelationship ? ""}</span></td></tr>
    <tr><th><span>電話</span></th><td><span>#{student.EmergencyContactTel ? ""}</span></td></tr>
  """
  $("#baseinfo #custodian-info tbody").html """
    <tr><th><span>姓名</span></th><td><span>#{student.CustodianName ? ""}</span></td></tr>
    <tr><th><span>關係</span></th><td><span>#{student.CustodianRelationship ? ""}</span></td></tr>
    <tr><th><span>電話</span></th><td><span>#{student.CustodianOtherInfo?.CustodianOtherInfo?.Phone ? ""}</span></td></tr>
    <tr><th><span>Email</span></th><td><span>#{student.CustodianOtherInfo?.CustodianOtherInfo?.Email ? ""}</span></td></tr>
    <tr><th><span>職業</span></th><td><span>#{student.CustodianOtherInfo?.CustodianOtherInfo?.Job ? ""}</span></td></tr>
    <tr><th><span>教育程度</span></th><td><span>#{student.CustodianOtherInfo?.CustodianOtherInfo?.EducationDegree ? ""}</span></td></tr>
  """
  $("#baseinfo #father-info tbody").html """
    <tr><th><span>姓名</span></th><td><span>#{student.FatherName ? ""}</span></td></tr>
    <tr><th><span>電話</span></th><td><span>#{student.FatherOtherInfo?.FatherOtherInfo?.Phone ? ""}</span></td></tr>
    <tr><th><span>Email</span></th><td><span>#{student.FatherOtherInfo?.FatherOtherInfo?.Email ? ""}</span></td></tr>
    <tr><th><span>職業</span></th><td><span>#{student.FatherOtherInfo?.FatherOtherInfo?.Job ? ""}</span></td></tr>
    <tr><th><span>教育程度</span></th><td><span>#{student.FatherOtherInfo?.FatherOtherInfo?.EducationDegree ? ""}</span></td></tr>
  """
  $("#baseinfo #mother-info tbody").html """
    <tr><th><span>姓名</span></th><td><span>#{student.MotherName ? ""}</span></td></tr>
    <tr><th><span>電話</span></th><td><span>#{student.MotherOtherInfo?.MotherOtherInfo?.Phone ? ""}</span></td></tr>
    <tr><th><span>Email</span></th><td><span>#{student.MotherOtherInfo?.MotherOtherInfo?.Email ? ""}</span></td></tr>
    <tr><th><span>職業</span></th><td><span>#{student.MotherOtherInfo?.MotherOtherInfo?.Job ? ""}</span></td></tr>
    <tr><th><span>教育程度</span></th><td><span>#{student.MotherOtherInfo?.MotherOtherInfo?.EducationDegree ? ""}</span></td></tr>
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
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
      else
        if response.Result.SemsSubjScore?.ScoreInfo?.Domains?
          items = []
          if response.Result.SemsSubjScore?.ScoreInfo?.SemesterSubjectScoreInfo?.Subject?
            $(response.Result.SemsSubjScore.ScoreInfo.SemesterSubjectScoreInfo.Subject).each () ->
              items.push """
                <tr>
                  <th>
                    <span>#{@科目}</span>
                  </th>
                  <td>
                    <span>#{@成績} / #{@努力程度 ? @文字描述 ? ''}</span>
                  </td>
                </tr>
              """
            $("#academic #subject-score tbody").html items.join ""
            $("#academic #subject-score h2").html "科目成績"
          items = []
          if response.Result.SemsSubjScore?.ScoreInfo?.Domains?.Domain?
            $(response.Result.SemsSubjScore.ScoreInfo.Domains.Domain).each () ->
              items.push """
                <tr>
                  <th>
                    <span>#{@領域}</span>
                  </th>
                  <td>
                    <span>#{@成績} / #{@努力程度 ? @文字描述 ? ''}</span>
                  </td>
                </tr>
              """
            $("#academic #domain-score tbody").html item.join ""
            $("#academic #domain-score h2").html "領域成績"
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
                  <th>
                    <span>#{@科目}</span>
                  </th>
                  <td>
                    <span>#{score}</span>
                  </td>
                </tr>
              """
            $("#academic #subject-score tbody").html items.join ""
            $("#academic #subject-score h2").html "科目成績"
          
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
              if error?
                $("#mainMsg").html """
                  <div class='alert alert-error'>
                    <button class='close' data-dismiss='alert'>×</button>
                    <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
                  </div>
                """
              else
                $("#domain-score h2").html "分項成績"
                items = []
                if response.Result?.SemsEntryScore?
                  $(response.Result.SemsEntryScore).each () ->
                    if @ScoreInfo?.SemesterEntryScore?.Entry?
                      $(@ScoreInfo.SemesterEntryScore.Entry).each () ->
                        items.push """
                          <tr>
                            <th>
                              <span>#{@分項}</span>
                            </th>
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
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
      else
        items = []
        if response.Result?.DailyLifeScore?.Content?.Morality?
          $(response.Result.DailyLifeScore.Content.Morality).each () ->
            items.push """
              <tr>
                <th><span>#{@['@text']}</span></th>
                <td><span>#{@Face}</span></td>
              </tr>
            """
          $("#behavior #morality tbody").html items.join ""
          $("#behavior #morality h2").html "德行成績"
        else if response.Result.DailyLifeScore?.TextScore?
          $(response.Result.DailyLifeScore.TextScore).each () ->
            if @DailyBehavior?
              items.push "<tr><th colspan='2'><span>#{@DailyBehavior.Name ? '日常行為表現'}</span></th></tr>"
              $(@DailyBehavior.Item).each () ->
                items.push """
                  <tr>
                    <th><span>#{@Degree ? ''}</span></th>
                    <td><span>#{@Name} #{@Index}</span></td>
                  </tr>
                """
        
            if @GroupActivity?
              items.push "<tr><th colspan='2'><span>#{@GroupActivity.Name ? '團體活動表現'}</span></th></tr>"
              $(@GroupActivity.Item).each () ->
                items.push """
                  <tr>
                    <th><span>#{@Degree ? ''}</span></th>
                    <td><span>#{@Name}</span></td>
                  </tr>
                """
        
            if @PublicService?
              items.push "<tr><th colspan='2'><span>#{@PublicService.Name ? '公共服務表現'}</span></th></tr>"
              $(@PublicService.Item).each () ->
                items.push """
                  <tr>
                    <th><span>#{@Description ? ''}</span></th>
                    <td><span>#{@Name}</span></td>
                  </tr>
                """
        
            if @SchoolSpecial?
              items.push "<tr><th colspan='2'><span>#{@SchoolSpecial.Name ? '校內外特殊表現'}</span></th></tr>"
              $(@SchoolSpecial.Item).each () ->
                items.push """
                  <tr>
                    <th><span>#{@Description ? ''}</span></th>
                    <td><span>#{@Name}</span></td>
                  </tr>
                """
        
            if @DailyLifeRecommend?
              items.push "<tr><th colspan='2'><span>#{@DailyLifeRecommend.Name ? '日常生活表現具體建議'}</span></th></tr>"
              items.push "<tr><td colspan='2'><span>#{@DailyLifeRecommend.Description ? @DailyLifeRecommend['#text']}</span></td></tr>"
        
            if @OtherRecommend?
              items.push "<tr><th colspan='2'><span>#{@OtherRecommend.Name ? '其他具體建議'}</span></th></tr>"
              items.push "<tr><td colspan='2'><span>#{@OtherRecommend['#text'] ? ''}</span></td></tr>"
      
          $("#behavior #morality tbody").html items.join ""
          $("#behavior #morality h2").html "日常生活表現"
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
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
      else
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
            <li class='span2'>
              <div class='thumbnail my-thumbnail-white'>
                <div class='my-subthumbnail-top'>
                  <span class='badge badge-warning'>#{absences[name]}</span>
                </div>
                <div class='caption my-subthumbnail-bottom'>
                  <h5>#{name}</h5>
                </div>
              </div>
            </li>
          """
        
        $("#behavior #attendance .my-content").html """
          <ul class='thumbnails'>
            #{items.join ""}
          </ul>
        """
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
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
      else
        items = []
        if response.Result?.Discipline?
          sum_merit = { ma: 0, mb: 0, mc: 0, da: 0, db: 0, dc: 0 }
          $(response.Result.Discipline).each () ->
            merit = { a: 0, b: 0, c: 0 }
            if @MeritFlag is "1"
              sum_merit.ma += merit.a = parseInt(@Detail.Discipline.Merit.A, 10) if not isNaN(parseInt(@Detail.Discipline.Merit.A, 10))
              sum_merit.mb += merit.b = parseInt(@Detail.Discipline.Merit.B, 10) if not isNaN(parseInt(@Detail.Discipline.Merit.B, 10))
              sum_merit.mc += merit.c = parseInt(@Detail.Discipline.Merit.C, 10) if not isNaN(parseInt(@Detail.Discipline.Merit.C, 10))
            
              items.push """
                <tr>
                  <td>
                    <span class="badge #{if merit.a isnt 0 then "badge-success" else ""}">#{merit.a}</span>
                    <br />大功
                  </td>
                  <td>
                    <span class="badge #{if merit.b isnt 0 then "badge-success" else ""}">#{merit.b}</span>
                    <br />小功
                  </td>
                  <td>
                    <span class="badge #{if merit.c isnt 0 then "badge-success" else ""}">#{merit.c}</span>
                    <br />嘉獎
                  </td>
                  <td>
                    <span>#{@OccurDate.substr(0, 10)}</span>
                    <br/>
                    <span>#{@Reason}</span>
                  </td>
                </tr>
              """
            else
              sum_merit.da += merit.a = parseInt(@Detail.Discipline.Demerit.A, 10) if not isNaN(parseInt(@Detail.Discipline.Demerit.A, 10))
              sum_merit.db += merit.b = parseInt(@Detail.Discipline.Demerit.B, 10) if not isNaN(parseInt(@Detail.Discipline.Demerit.B, 10))
              sum_merit.dc += merit.c = parseInt(@Detail.Discipline.Demerit.C, 10) if not isNaN(parseInt(@Detail.Discipline.Demerit.C, 10))
            
              items.push """
                <tr>
                  <td>
                    <span class="badge #{if merit.a isnt 0 then "badge-important" else ""}">#{merit.a}</span>
                    <br />大過
                  </td>
                  <td>
                    <span class="badge #{if merit.b isnt 0 then "badge-important" else ""}">#{merit.b}</span>
                    <br />小過
                  </td>
                  <td>
                    <span class="badge #{if merit.c isnt 0 then "badge-important" else ""}">#{merit.c}</span>
                    <br />警告
                  </td>
                  <td>
                    <span>#{@OccurDate.substr(0, 10)}</span>
                    <br/>
                    <span>#{@Reason}</span>
                    <br/>
                    #{if @Detail.Discipline.Demerit.Cleared is '是' then "<span>#{@Detail.Discipline.Demerit.ClearDate.substr(0, 10).replace(/\//ig, "-")} 已銷過<br/>#{@Detail.Discipline.Demerit.ClearReason}</span>" else ""}
                  </td>
                </tr>
              """
        
          $("#merit-a").html """<span class='badge #{if sum_merit.ma isnt 0 then "badge-success" else ""}'>#{sum_merit.ma}</span>"""
          $("#merit-b").html """<span class='badge #{if sum_merit.mb isnt 0 then "badge-success" else ""}'>#{sum_merit.mb}</span>"""
          $("#merit-c").html """<span class='badge #{if sum_merit.mc isnt 0 then "badge-success" else ""}'>#{sum_merit.mc}</span>"""
          $("#demerit-a").html """<span class='badge #{if sum_merit.da isnt 0 then "badge-important" else ""}'>#{sum_merit.da}</span>"""
          $("#demerit-b").html """<span class='badge #{if sum_merit.db isnt 0 then "badge-important" else ""}'>#{sum_merit.db}</span>"""
          $("#demerit-c").html """<span class='badge #{if sum_merit.dc isnt 0 then "badge-important" else ""}'>#{sum_merit.dc}</span>"""

          $("#behavior #discipline tbody").html items.join("")
  }

saveBaseInfo = (edit_target) ->
  request = ""
  request_udt = ""
  if edit_target is "detail"
    request = """
      <Request>
        <StudentInfo>
          <StudentID>#{global.student.StudentID}</StudentID>
          <EnglishName>#{$('#editModal #english-name').val()}</EnglishName>
          <FreshmanPhoto>#{$('#editModal #update-photo-image').attr("photo-base64")}</FreshmanPhoto>
        </StudentInfo>
      </Request>
    """
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
  if edit_target is "instant-messaging"
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
          $("#editModal #save-data").show()
        else
          if response.Result.ExecuteCount is "1"
            if edit_target is "detail"
              global.student.EnglishName = $('#editModal #english-name').val()
              global.student.FreshmanPhoto = $('#editModal #update-photo-image').attr("photo-base64")
              
            if edit_target is "phone"
              global.student.ContactPhone = $('#editModal #contact-phone').val()
              global.student.PermanentPhone = $('#editModal #permanent-phone').val()
              global.student.SMSPhone = $('#editModal #sms-phone').val()
              
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
              
            if edit_target is "instant-messaging"
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
                
            setBaseInfo()		
              
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
                    $("#editModal #save-data").show()
                  else
                    if response.Result.ExecuteCount is "1"
                      if edit_target is "instant-messaging"
                        global.student.FacebookID = $('#editModal #facebook').val()
                        global.student.SkypeID = $('#editModal #skype').val()
                          
                      if edit_target is "emergency-contact"
                        global.student.EmergencyContactName = $('#editModal #name').val()
                        global.student.EmergencyContactRelationship = $('#editModal #relationship').val()
                        global.student.EmergencyContactTel = $('#editModal #phone').val()

                      setBaseInfo()
                      
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
              if edit_target is "instant-messaging"
                global.student.FacebookID = $('#editModal #facebook').val()
                global.student.SkypeID = $('#editModal #skype').val()

                  
              if edit_target is "emergency-contact"
                global.student.EmergencyContactName = $('#editModal #name').val()
                global.student.EmergencyContactRelationship = $('#editModal #relationship').val()
                global.student.EmergencyContactTel = $('#editModal #phone').val()
                  
              setBaseInfo()

            $("#editModal").modal "hide"
      }
    else
      $("#editModal").modal "hide"

get_notes = (uid) ->  
  UID = ""
  UID = "<UID>#{uid}</UID>"  if uid?
  gadget.getContract("ischool.notebook").send
    service: "notebook.GetNotes"
    body: "<Request><StudentID>#{global.student.StudentID}</StudentID>#{UID}</Request>"
    result: (response, error, http) ->
      if error?
        $("#editModal #errorMessage").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """        
      else
        if $(response.Result.Note).size() is 0
          $(".my-notebook-manager .my-stream-items").html "目前無資料" 
        else
          if response.Result.Note?
            $(response.Result.Note).each ->
              stream_item = """
                <div class='my-stream-item' note-id='#{@UID}'>
                  <div class='my-stram-item-content my-stream-note-item'>
                    <div class='my-stream-note-content'>
                      <div class='my-stream-note-text'>#{@Content}</div>
                      <div class='my-stream-note-row'>                        
                        <span class='btn-group my-stream-note-actions'>
                          <a href='editModal' class='btn my-update-action' title='更新' data-toggle='modal' note-id='#{@UID}' note-content='#{@Content.replace(/'/g, "")}'><span><i class='icon-edit'></i></span></a>
                          <a href='editModal' class='btn my-delete-action' title='刪除' data-toggle='modal' note-id='#{@UID}' note-content='#{@Content.replace(/'/g, "")}'><span><i class='icon-trash'></i></span></a>
                        </span>
                        <span class='my-stream-note-timestamp'>#{@LastUpdate.substr(0, 16)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              """
              unless uid?
                $(stream_item).appendTo $(".my-notebook-manager .my-stream-items")
              else
                $(stream_item).prependTo($(".my-notebook-manager .my-stream-items")).effect "pulsate", {}, 500


      $(".my-notebook-manager .my-update-action").bind 'click', ->
        $("#editModal #save-data")
          .attr("note-id", $(@).attr("note-id"))
          .attr("edit-target", "update-note")
          .html "儲存變更"
        $("#editModal .modal-header h3").html "更新筆記"
        $("#editModal .modal-body").html "<textarea class='my-content-textarea-editor'></textarea>"
        $("#editModal .my-content-textarea-editor").val $(@).attr("note-content")        
        $("#editModal").modal "show"

      $(".my-notebook-manager .my-delete-action").bind 'click', ->
        $("#editModal #save-data")
          .attr("note-id", $(@).attr("note-id"))
          .attr("edit-target", "delete-note")
          .html "刪除"
        $("#editModal .modal-header h3").html "是否確定刪除此筆記？"
        $("#editModal .modal-body").html $(@).attr("note-content")  
        $("#editModal .my-content-textarea-editor").val $(@).attr("note-content")
        $("#editModal").modal "show"

      $(".my-notebook-manager .my-stream-item").hover (->
        $(@).find(".my-stream-note-actions").css "visibility", "visible"
      ), ->
        $(@).find(".my-stream-note-actions").css "visibility", "hidden"
update_note = ->  
  note_id = $("#editModal #save-data").attr("note-id")
  note_content = $("#editModal .my-content-textarea-editor").val()
  gadget.getContract("ischool.notebook").send
    service: "notebook.UpdateNote"
    body: "<Request><Note><UID>#{note_id}</UID><Subject>" + note_content.substr(0, 16) + "..." + "</Subject><Content>" + note_content + "</Content></Note></Request>"
    result: (response, error, http) ->
      if error?
        $("#editModal #errorMessage").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
        $("#editModal #save-data").show()
      else
        $(".my-stream-item[note-id='" + note_id + "'] .my-stream-note-text").html note_content
        $(".my-stream-item[note-id='" + note_id + "']").effect "pulsate", {}, 500, ->          
          $(".my-stream-item[note-id='" + note_id + "'] .my-update-action").attr "note-content", note_content
          $(".my-stream-item[note-id='" + note_id + "'] .my-delete-action").attr "note-content", note_content

        $("#editModal").modal "hide"
delete_note = ->  
  note_id = $("#editModal #save-data").attr("note-id")
  gadget.getContract("ischool.notebook").send
    service: "notebook.DeleteNote"
    body: "<Request><Note><UID>#{note_id}</UID></Note></Request>"
    result: (response, error, http) ->
      if error?
        $("#editModal #errorMessage").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
        $("#editModal #save-data").show()
      else
        $(".my-stream-item[note-id='" + note_id + "']").effect "drop", {}, 500, ->
          $(".my-stream-item[note-id='" + note_id + "']").detach()

        $("#editModal").modal "hide"


get_message_about_one_student = (uid) ->
  UID = ""
  UID = "<UID>#{uid}</UID>"  if uid?
  gadget.getContract("ischool.message").send
    service: "message.GetMessageAboutOneStudent"
    body: "<Request><StudentID>#{global.student.StudentID}</StudentID>#{UID}</Request>"
    result: (response, error, http) ->
      if error?
        $("#mainMsg").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
      else
        if response.Result.Message?
          $(response.Result.Message).each ->
            stream_item = """
              <div class='my-stream-item' message-id='#{@UID}'>
                <div class='my-stram-item-content my-stream-message-item'>
                  <div class='my-stream-message-content'>
                    <div class='my-stream-message-text'>#{@Content}</div>
                    <div class='my-stream-message-row'>                      
                      <span class='btn-group my-stream-message-actions'>
                        <a href='#' class='btn my-addnote-action' title='加入筆記本' message-id='#{@UID}' message-content='#{@Content.replace(/'/g, "")}'><i class='icon-plus'></i></a>
                        #{
                          if (global._myInfo[0].UserID is @Author)
                            "<a href='#' class='btn my-delete-action' message-id='#{@UID}' title='刪除' message-content='#{@Content.replace(/'/g, "")}'><i class='icon-trash'></i></a>" 
                          else 
                            ""
                        }
                      </span>
                      <span class='my-stream-message-timestamp'>#{@CreateTime.substr(0, 16)}</span>
                    </div>
                  </div>
                </div>
              </div>
            """
            unless uid?
              $(stream_item).appendTo $(".my-message-manager .my-stream-items")
            else
              $(stream_item).prependTo($(".my-message-manager .my-stream-items")).effect "pulsate", {}, 500

          $(".my-message-manager .my-addnote-action").bind "click", ->
            $("#editModal #save-data")
              .attr("message-id", $(@).attr("message-id"))
              .attr("edit-target", "add-note")
              .html "加入"
            $("#editModal .modal-header h3").html "加入筆記本"
            $("#editModal .modal-body").html $(this).attr("message-content")
            $("#editModal .my-content-textarea-editor").val $(@).attr("note-content")
            $("#editModal").modal "show"

          $(".my-message-manager .my-delete-action").bind "click", ->       
            $("#editModal #save-data")
              .attr("message-id", $(@).attr("message-id"))
              .attr("edit-target", "delete-message")
              .html "刪除"
            $("#editModal .modal-header h3").html "是否確定刪除此筆記？"
            $("#editModal .modal-body").html $(this).attr("message-content")
            $("#editModal .my-content-textarea-editor").val $(@).attr("note-content")
            $("#editModal").modal "show"


          $(".my-message-manager .my-stream-item").hover (->
            $(this).find(".my-stream-message-actions").css "visibility", "visible"
          ), ->
            $(this).find(".my-stream-message-actions").css "visibility", "hidden"
delete_message = () ->
  message_id = $("#editModal #save-data").attr("message-id")
  gadget.getContract("ischool.message").send
    service: "message.DeleteMessage"
    body: "<Request><Message><UID>#{message_id}</UID></Message></Request>"
    result: (response, error, http) ->
      if error?
        $("#editModal #errorMessage").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
        $("#editModal #save-data").show()
      else
        $(".my-stream-item[message-id='" + message_id + "']").effect "drop", {}, 500, ->
          $(".my-stream-item[message-id='" + message_id + "']").detach()

         $("#editModal").modal "hide"


add_note = () ->
  note_value = $("#editModal .modal-body").html()
  gadget.getContract("ischool.notebook").send
    service: "notebook.AddNote"
    body: "<Request><Note><StudentID>#{global.student.StudentID}</StudentID><Content>#{note_value}</Content></Note></Request>"
    result: (response, error, http) ->
      if error?
        $("#editModal #errorMessage").html """
          <div class='alert alert-error'>
            <button class='close' data-dismiss='alert'>×</button>
            <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>
          </div>
        """
        $("#editModal #save-data").show()
      else
        get_notes response.Result.NewID  unless response.Result.NewID is 'undefined'
        $("#mainMsg").html "<div class='alert alert-success'><button class='close' data-dismiss='alert'>×</button><strong>加入成功!</strong></div>"
        $("#editModal").modal "hide"    
