gadget.autofit(document.getElementById("widget"));

var _connection = gadget.getContract("ischool.notebook");	
var _src = "src",
    _students = [],
    _current_keyword,
    _current_pageindex;

$(function () {
    gadget.onSizeChanged(function (size) {
        $("#container-nav, #container-main").height(size.height - 47);
    });

    $(".my-query-keyword").bind("keypress", function (event) {
        if (event.keyCode == 13) {
            query_note('keyword', 1);
        }
    });

    $(".my-query-glass").bind("click", function () {
        query_note('keyword', 1);
    });

    $(".my-refresh-button").bind("click", function () {
        query_note('all', 1);
    });

    $(".my-note-button").bind("click", function () {
        post();
    });

    $("#addnew .note-textarea-editor").bind("keyup", function (event) {
        if (parseInt($("#addnew .note-textarea-editor").val().length, 10) === 0)
            $(".my-note-button").addClass("disabled").attr("disabled", "disabled");
        else
            $(".my-note-button").removeClass("disabled").removeAttr("disabled");
    });

    $("#function-list li").click(function() {
        $("#function-list i").addClass("icon-white");
        $(this).find("i").removeClass("icon-white");
    });
      
    $("#editModal").modal({
        show: false
    });

    $("#editModal").on("hidden", function () {
        return $("#editModal #errorMessage").html("");
    });

    $("#editModal").on("show", function () {
        return $("#editModal #save-data").show();
    });


    $("#save-data").bind("click", function () {
        $("#save-data").hide();

        var note_id = $("#save-data").attr("note-id");
        var action_type = $("#save-data").attr("action-type");
        var update_type = $("#save-data").attr("update-type");

        if (action_type == "update-note") {
            var note = {};
            note.UID = note_id;

            if (update_type == "student-id") {
                note.RefStudentId = $("#editModal .note-target").val();
                note.StudentName = $("#editModal .note-target option:selected").attr("student-name");
            }

            if (update_type == "deadline") {
                note.Deadline = $("#editModal .note-deadline").val();
            }

            if (update_type == "status") {
                note.Status = $("#editModal input[name='note-status']:checked").val();
            }

            if (update_type == "content") {
                note.Subject = $("#editModal .note-textarea-editor").val().substr(0, 16) + "...";
                note.Content = $("#editModal .note-textarea-editor").val();
            }

            _connection.send({
                service: "notebook.UpdateNote",
                body: {
                    Request: {
                        Note: note
                    }
                },
                result: function (response, error, http) {

                    if (response.Result.ExecuteCount == "1") {
                        if (update_type == "student-id") {
//                            $(".stream-item[note-id='" + note_id + "'] .assign-action span b").html(note.StudentName);
                            var tmp_seat_no = $("#editModal .note-target option:selected").attr("seat-no");
                            var tmp_html = (tmp_seat_no === "" ? "<img width='36px' height='30px' src='img/icon.png' />" : "<span class='my-seat-no label label-inverse'>" + tmp_seat_no + '</span><b>' + note.StudentName + '</b>');
                            $(".stream-item[note-id='" + note_id + "'] div[action-type='assign'] a").html(tmp_html);

                            $(".stream-item[note-id='" + note_id + "'] .assign-action").attr("student-id", note.RefStudentId);
                            $(".stream-item[note-id='" + note_id + "'] .div[action-type='assign'] b").html(note.StudentName);

                            $("#editModal .note-target").val($("#editModal .note-target option:first").val());
                        }

                        if (update_type == "deadline") {
//                            $(".stream-item[note-id='" + note_id + "'] .deadline-action span b").html(note.Deadline);
                            var tmp_deadline = (note.Deadline === "") ? "" : "<i class='icon-time'></i>" + note.Deadline;
                            $(".stream-item[note-id='" + note_id + "'] div[action-type='deadline']").html(tmp_deadline);
                            $(".stream-item[note-id='" + note_id + "'] .deadline-action").attr("note-deadline", note.Deadline);                            
                            $("#editModal .note-deadline").val("");
                        }

                        if (update_type == "status") {
                            var status = ((note.Status == "0") ? "未處理" : ((note.Status == "5") ? "處理中" : ((note.Status == "10") ? "已完成" : "")));
//                            $(".stream-item[note-id='" + note_id + "'] .status-action span b").html(status);
                            $(".stream-item[note-id='" + note_id + "'] div[action-type='status']").html(status);

                            $(".stream-item[note-id='" + note_id + "'] .status-action").attr("note-status", note.Status);

                            $("#editModal input[name='note-status']").attr("checked", "");
                        }

                        if (update_type == "content") {
                            $(".stream-item[note-id='" + note_id + "'] .my-stream-note-text").html(note.Content);
                            $(".stream-item[note-id='" + note_id + "']").effect("pulsate", {}, 500, function () {                                
                                $(".stream-item[note-id='" + note_id + "'] .update-action").attr("note-content", note.Content);
                            });

                            $("#editModal .note-textarea-editor").val("");
                        }
                    }
                }
            });
        }

        if (action_type == "delete-note") {
            _connection.send({
                service: "notebook.DeleteNote",
                body: {
                    Request: {
                        Note: {
                            UID: note_id
                        }
                    }
                },
                result: function (response, error, http) {

                    if (response.Result.ExecuteCount == "1") {
                        $(".stream-item[note-id='" + note_id + "']")
                        .effect("drop", {}, 500, function () {
                            $(".stream-item[note-id='" + note_id + "']").detach();
                        });
                    }
                }
            });
        }
        $("#editModal").modal("hide");
    });


    _connection.send({
        service: "notebook.GetStudents",
        body: "",
        result: function (response, error, http) {
            var students = $(response.Result.Student);
            students.sort(function (a, b) { return parseInt(a.SeatNo, 10) - parseInt(b.SeatNo, 10) });
            students.each(function () {
                this.label = this.SeatNo + " " + this.Name + " (" + this.ClassName + ")";
                _students.push(this);
            });
        }
    });

    query_note("all", 1);
});

function post() {
    if ($("#addnew .note-textarea-editor").val().length == 0) return;

    _connection.send({
        service: "notebook.AddNote",
        body: {
            Request: {
                Note: {
                    Content: $("#addnew .note-textarea-editor").val()
                }
            }
        },
        result: function (response, error, http) {

            if (response.Result.NewID != undefined) {
                _connection.send({
                    service: "notebook.GetNotes",
                    body: {
                        Request: { UID: response.Result.NewID }
                    },
                    result: function (response, error, http) {
                        var notes = $(response.Result.Note);
                        set_notes(notes, "single-note");
                        $("#mainMsg").html("<div class='alert alert-success'><button class='close' data-dismiss='alert'>×</button><strong>新增成功!</strong></div>");
                    }
                });
            }
        }
    });
    $(".my-note-button").addClass("disabled").attr("disabled", "disabled");
    $("#addnew .note-textarea-editor").val("").focus();
}

function query_note(keyword, pageindex) {
    
    _current_keyword = keyword;
    _current_pageindex = pageindex;
    
    if (_current_pageindex == 1) {
        $(".stream-items").html("");
    }
    
    var pageSize = 10;
    var request = {};
    
    if (keyword == "keyword")
        request.Content = "%" + $(".my-query-keyword").val() + "%";
    
    request.Pagination = {
        PageSize: pageSize,
        StartPage: pageindex
    }
    
    _connection.send({
        service: "notebook.GetNotes",
        body: {
            Request: request
        },
        result: function(response, error, http) {
            var notes = $(response.Result.Note);
            set_notes(notes, "multi-note");
        }
    });
}

function set_notes(notes, type) {

    $(notes).each(function () {
        var stream_item =
            "<div class='stream-item' note-id='" + this.UID + "'>" +
                "<div class='my-stram-item-content'>" +
                    "<div class='my-stream-note-studentname'>" +
                        "<div action-type='assign'><a href='#' class='assign-action' note-id='" + this.UID + "' student-id='" + this.StudentID + "' title='指定學生'>" +
                            (this.SeatNo === "" ? "<img width='36px' height='30px' src='img/icon.png' />" : "<span class='my-seat-no label label-inverse'>" +this.SeatNo + '</span>') +
                            "<b>" + this.StudentName + "</b>" +
                        "</a></div>" +
                        "<div action-type='deadline'>" + (this.Deadline == "" ? "" : "<i class='icon-time'></i>" + this.Deadline.substr(0, 10)) + "</div>" +
                        "<div action-type='status'>" + ((this.Status == "0") ? "" : ((this.Status == "5") ? "處理中" : ((this.Status == "10" ? "已完成" : "")))) + "</div>" +
                    "</div>" +
                    "<div class='my-stream-note-content'>" +
                        "<div class='my-stream-note-text'>" +
                            (parseInt(this.Content.length, 10) === 0 ? "&nbsp;" : this.Content) +
                        "</div>" +
                        "<div class='my-stream-note-row'>" +
                            "<div class='my-stream-note-actions'>" +
                                "<div class='btn-group'>" +
                                    "<button class='btn assign-action' title='指定學生' note-id='" + this.UID + "' student-id='" + this.StudentID + "'>" +
                                        "<i class='icon-user'></i>" +
                                    "</button>" +
                                    "<button class='btn deadline-action' title='到期日' note-id='" + this.UID + "' note-deadline='" + this.Deadline.substr(0, 10) + "'>" +
                                        "<i class='icon-time'></i>" +
                                    "</button>" +
                                    "<button class='btn status-action' title='處理狀態' note-id='" + this.UID + "' note-status='" + this.Status + "'>" +
                                        "<i class='icon-star-empty'></i>" +
                                    "</button>" +
                                    "<button class='btn update-action' title='更新' note-id='" + this.UID + "' note-content='" + this.Content.replace(/'/ig, "") + "'>" +
                                        "<i class='icon-edit'></i>" +
                                    "</button>" +
                                    "<button class='btn delete-action' title='刪除' note-id='" + this.UID + "' note-content='" + this.Content.replace(/'/ig, "") + "'>" +
                                        "<i class='icon-trash'></i>" +
                                    "</button>" +
                                "</div>" +

//                                "<a href='#' class='assign-action' note-id='" + this.UID + "' student-id='" + this.StudentID + "'>" +
//                                    "<span>" +
//                                        "<i class='icon-user'></i>" +
//                                        "<b>" + (this.StudentName == "" ? "指定學生" : this.StudentName) + "</b>" +
//                                    "</span>" +
//                                "</a>&nbsp;" +
//                                "<a href='#' class='deadline-action' note-id='" + this.UID + "' note-deadline='" + this.Deadline.substr(0, 10) + "'>" +
//                                    "<span>" +
//                                        "<i class='icon-time'></i>" +
//                                        "<b>" + (this.Deadline == "" ? "無到期日" : this.Deadline.substr(0, 10)) + "</b>" +
//                                    "</span>" +
//                                "</a>&nbsp;" +
//                                "<a href='#' class='status-action' note-id='" + this.UID + "' note-status='" + this.Status + "'>" +
//                                    "<span>" +
//                                        "<i class='icon-star-empty'></i>" +
//                                        "<b>" + ((this.Status == "0") ? "未處理" : ((this.Status == "5") ? "處理中" : ((this.Status == "10" ? "已完成" : "無狀態")))) + "</b>" +
//                                    "</span>" +
//                                "</a>&nbsp;" +
//                                "<a href='#' class='update-action' note-id='" + this.UID + "' note-content='" + this.Content.replace(/'/ig, "") + "'>" +
//                                    "<span>" +
//                                        "<i class='icon-edit'></i>" +
//                                        "<b>更新</b>" +
//                                    "</span>" +
//                                "</a>&nbsp;" +
//                                "<a href='#' class='delete-action' note-id='" + this.UID + "' note-content='" + this.Content.replace(/'/ig, "") + "'>" +
//                                    "<span>" +
//                                        "<i class='icon-trash'></i>" +
//                                        "<b>刪除</b>" +
//                                    "</span>" +
//                                "</a>" +

                            "</div>" +
                            "<span class='my-stream-note-timestamp'>" +
                                this.LastUpdate.substr(0, 16) +
                            "</span>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
            "</div>";

        if (type == "multi-note")
            $(stream_item).appendTo($(".stream-items"));
        else
            $(stream_item).prependTo($(".stream-items")).effect("slide", {}, 500);
    });
    
    if (type == "multi-note") {
        if (notes.length == 10) {
            $("<div class='btn btn-success my-stream-more-note'>顯示更多...</div>").appendTo($(".stream-items"))
            .bind("click", function() {
                $(this).detach();
                query_note(_current_keyword, _current_pageindex + 1);
            });
        }
        
        if (_current_pageindex == 1)
            $(".stream-items").effect("slide", {}, 500);
    }
    
    set_actions();
}

function set_actions() {

    $(".assign-action").bind("click", function() {
        
        $("#editModal .modal-body")
        .html("<select class='note-target'><option value=''>- 指定學生 -</option></select>");
        
        $(_students).each(function() {
            $("#editModal .note-target")
            .html($("#editModal .note-target")
                  .html() + "<option value='" + this.ID + "' student-name='" + this.Name + "' seat-no='" + this.SeatNo + "'>" + this.label + "</option>"
            );
        });
        
        $("#editModal .note-target").val($(this).attr("student-id"));
        
        $("#editModal h3").html("指定學生");
        $("#save-data").attr("note-id", $(this).attr("note-id"));
        $("#save-data").attr("update-type", "student-id");
        $("#save-data").attr("action-type", "update-note");
        $("#save-data").html("儲存變更");
        $("#editModal").modal("show");
        
        return false;
    });
    
    $(".deadline-action").bind("click", function() {
        
        $("#editModal .modal-body")
        .html("<input type='text' class='note-deadline' value='" + $(this).attr("note-deadline") + "' placeholder='點我指定到期日' />");
        
        $("#editModal .note-deadline").datepicker({ dateFormat: "yy-mm-dd" });
        
        $("#editModal h3").html("指定到期日");
        $("#save-data").attr("note-id", $(this).attr("note-id"));
        $("#save-data").attr("update-type", "deadline");
        $("#save-data").attr("action-type", "update-note");
        
        $("#editModal").modal("show");
        
        return false;
    });
    
    $(".status-action")
    .bind("click", function() {
        
        $("#editModal .modal-body")
        .html(
            "<div class='note-status'>" +
                "<label class='radio inline' for='status0'><input type='radio' id='status0' name='note-status' value=''/> 無狀態</label>" +
                "<label class='radio inline' for='status1'><input type='radio' id='status1' name='note-status' value='0'/> 未處理</label>" +
                "<label class='radio inline' for='status5'><input type='radio' id='status5' name='note-status' value='5'/> 處理中</label>" +
                "<label class='radio inline' for='status10'><input type='radio' id='status10' name='note-status' value='10'/> 已完成</label>" +
            "</div>"
        );
        
        $("#editModal .note-status input[value='" + $(this).attr("note-status") + "']").attr("checked", "checked");
        
        $("#editModal h3").html("指定進度狀態");
        $("#save-data").attr("note-id", $(this).attr("note-id"));
        $("#save-data").attr("update-type", "status");
        $("#save-data").attr("action-type", "update-note");
        
        $("#editModal").modal("show");
        
        return false;
    });
    
    $(".update-action").bind("click", function() {
        
        $("#editModal .modal-body")
        .html("<textarea class='note-textarea-editor'>" + $(this).attr("note-content") + "</textarea>");
        
        $("#editModal h3").html("更新筆記");
        $("#save-data").attr("note-id", $(this).attr("note-id"));
        $("#save-data").attr("update-type", "content");
        $("#save-data").attr("action-type", "update-note");
        $("#save-data").html("儲存變更");
        $("#editModal").modal("show");
        
        return false;
    });
    
    $(".delete-action").bind("click", function() {
        
        $("#editModal .modal-body").html($(this).attr("note-content"));
        
        $("#editModal h3").html("是否確定刪除此筆記？");
        $("#save-data").attr("note-id", $(this).attr("note-id"));
        $("#save-data").attr("action-type", "delete-note");
        $("#save-data").html("刪除");
        
        $("#editModal").modal("show");
        
        return false;
    });
    
    $(".stream-item").hover(
        function() { $(this).find(".my-stream-note-actions").css("visibility", "visible")},
        function() { $(this).find(".my-stream-note-actions").css("visibility", "hidden")}
    );
}