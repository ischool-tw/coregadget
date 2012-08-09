gadget.autofit(document.getElementById("widget"));

var _connection = gadget.getContract("ischool.message");	
var _src = "src",
    _myInfos,
    _receivers = [],
    _receiverType = "student",
    _receiverKeyword,
    _currentKeyword,
    _currentPageindex,
    _currentSemester;

$(function () {
    gadget.onSizeChanged(function (size) {
        $("#container-nav, #container-main").height(size.height - 47);
    });

    $(".my-query-keyword").bind("keypress", function (event) {
        if (event.keyCode == 13) {
            query_message('keyword', 1);
        }
    });

    $(".my-query-glass").bind("click", function () {
        query_message('keyword', 1);
    });

    $(".my-refresh-button").bind("click", function () {
        query_message('all', 1);
    });

    $(".my-message-button").bind("click", function () {
        post();
    });

    $("#addnew .my-message-textarea-editor").bind("keyup", function (event) {

        $("#addnew .my-message-word-counter").html(140 - $("#addnew .my-message-textarea-editor").val().length);

        if (parseInt($("#addnew .my-message-word-counter").html(), 10) < 0) {
            $("#addnew .my-message-word-counter").css("color", "#f00");
            $("#addnew .my-message-button").addClass("disabled").attr("disabled", "disabled");
        }
        else if (parseInt($("#addnew .my-message-word-counter").html(), 10) == 140) {
            $("#addnew .my-message-word-counter").css("color", "#999");
            $("#addnew .my-message-button").addClass("disabled").attr("disabled", "disabled");
        }
        else {
            $("#addnew .my-message-word-counter").css("color", "#999");
            $("#addnew .my-message-button").removeClass("disabled").removeAttr("disabled");
        }
    });

    $("#function-list li").click(function () {
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

        var msg_id = $("#save-data").attr("message-id");
        var action_type = $("#save-data").attr("action-type");

        if (action_type == "reply-message")
            reply();

        if (action_type == "add-note") {
            gadget.getContract("ischool.notebook").send({
                service: "notebook.AddNote",
                body: {
                    Request: {
                        Note: {
                            Content: $("#editModal .my-message-textarea-editor").val()
                        }
                    }
                },
                result: function (response, error, http) {
                    $("#mainMsg").html("<div class='alert alert-success'><button class='close' data-dismiss='alert'>×</button><strong>加入成功!</strong></div>");
                    $("#editModal").modal("hide");
                }
            });
        }

        if (action_type == "delete-message") {
            _connection.send({
                service: "message.DeleteMessage",
                body: {
                    Request: {
                        Message: {
                            UID: msg_id
                        }
                    }
                },
                result: function (response, error, http) {
                    $(".my-stream-item[message-id='" + msg_id + "']")
                    .effect("drop", {}, 500, function () {
                        $(".my-stream-item[message-id='" + msg_id + "']").detach();
                    });

                    $("#editModal").modal("hide");
                }
            });
        }
    });

    $(".dialog-button-cancel").bind("click", function () {
        $("#editModal").modal("hide");
    });

    $(".my-receiver-tab").bind("click", function () {
        var tmp_typeName = $(this).find("a").html();

        $(".my-receiver-tab").removeClass("active");
        $(this).addClass("active");

        _receiverType = $(this).attr("receiver-type");

        if (_receiverType == "public")
            $(".my-receiver-content").addClass("hide");
        else
            $(".my-receiver-content").removeClass("hide");

        $(".my-receiver").val("").attr("placeholder", "+收訊" + tmp_typeName + "...");
        $(".my-receivers").html("");

        _receivers = [];
    });

    $(".my-receiver")
    .focus()
    .bind("keypress", function (event) {
        if (event.keyCode === $.ui.keyCode.TAB &&
            $(this).data("autocomplete").menu.active) {
            event.preventDefault();
        }
    })
    .autocomplete({
        source: function (request, response) {

            var keyword = request.term;
            _receiverKeyword = keyword;

            switch (_receiverType) {
                case "student":
                    fill_student(keyword, response);
                    break;
                case "teacher":
                    fill_teacher(keyword, response);
                    break;
                case "class":
                    fill_class(keyword, response);
                    break;
                case "course":
                    fill_course(keyword, response);
                    break;
            }
        },
        focus: function () {
            return false;
        },
        select: function (event, ui) {

            var fill_tags = [];
            var keyword = this.value.substr(0, 1);

            switch (_receiverType) {
                case "student":
                    fill_tags = _fill_student_tags[keyword];
                    break;
                case "teacher":
                    fill_tags = _fill_teacher_tags[keyword];
                    break;
                case "class":
                    fill_tags = _fill_class_tags[keyword];
                    break;
                case "course":
                    fill_tags = _fill_course_tags[keyword];
                    break;
            }

            var include = false;
            $(fill_tags).each(function () {
                if (this.Name == ui.item.value) {
                    if ($.inArray(this.ID, _receivers) !== -1)
                        include = true;
                }
            });

            if (!include) {
                $(fill_tags).each(function () {
                    if (this.Name == ui.item.value) {
                        _receivers.push(this.ID);

                        $("<a href='#' class='my-receiver-item' receiver-data-id='" + this.ID + "'>" +
                            "<span class='label label-success'>" +
                                "<b>" + ui.item.value + "</b>" +
                                " <i class='icon-white icon-remove'></i>" +
                            "</span>" +
                        "</a> ")
                        .appendTo($(".my-receivers"));

                        $(".my-receiver-item").unbind("click");
                        $(".my-receiver-item")
                        .bind("click", function () {
                            var id = $(this).attr("receiver-data-id");

                            _receivers = $.grep(_receivers, function (value) {
                                return value != id;
                            });

                            $(this).detach();
                            return false;
                        })
                    }
                });
            }

            this.value = "";
            return false;
        }
    });

    _connection.send({
        service: "message.GetMyInfo",
        body: "",
        result: function (response, error, http) {
            _myInfos = $(response.Result.Info);
            query_message("all", 1);
        }
    });

    gadget.getContract("ta").send({
        service: "TeacherAccess.GetCurrentSemester",
        body: "",
        result: function (response, error, http) {
            _currentSemester = {
                SchoolYear: response.Current.SchoolYear,
                Semester: response.Current.Semester
            }
        }
    });
});

var _fill_student_ids = {} ,_fill_student_tags = {}, _fill_student_keywords = [];
function fill_student(keyword, response) {
    
    var fill_response = response;
    var tags = [];
    
    if (keyword.length > 1) {
        var content = keyword;
        keyword = keyword.substr(0, 1);
        
        if ($.inArray(keyword, _fill_student_keywords) === -1) {
        
            _fill_student_ids[keyword] = [];
            _fill_student_tags[keyword] = [];
            _fill_student_keywords.push(keyword);
            
            _connection.send({
                service: "message.AutoFillStudents",
                body: {
                    Request: {
                        Keyword: "%" + keyword + "%"
                    }
                },
                result: function(response, error, http) {
                    $(response.Response.Student).each(function() {
                        if ($.inArray(this.ID, _fill_student_ids[keyword]) === -1) {
                            _fill_student_ids[keyword].push(this.ID);
                            _fill_student_tags[keyword].push({
                                ID: this.ID,
                                Name: this.StudentName + " (" + this.ClassName + ")"
                            });
                        }
                    });
                    
                    $(_fill_student_tags[keyword]).each(function() {
                        if (this.Name.indexOf(content) !== -1)
                            if (tags.length < 20)
                                tags.push(this.Name);
                    });
                    
                    if (content == _receiverKeyword)
                        fill_response(tags);
                }
            });
        }
        else {
            $(_fill_student_tags[keyword]).each(function() {
                if (this.Name.indexOf(content) !== -1)
                    if (tags.length < 20)
                        tags.push(this.Name);
            });
            
            if (content == _receiverKeyword)
                fill_response(tags);
        }
    }
    
    if (keyword.length === 1 && $.inArray(keyword, _fill_student_keywords) === -1) {
        
        _fill_student_ids[keyword] = [];
        _fill_student_tags[keyword] = [];
        _fill_student_keywords.push(keyword);
        
        _connection.send({
            service: "message.AutoFillStudents",
            body: {
                Request: {
                    Keyword: "%" + keyword + "%"
                }
            },
            result: function(response, error, http) {
                $(response.Response.Student).each(function() {
                    if (tags.length < 20)
                        tags.push(this.StudentName + " (" + this.ClassName + ")");
                    
                    if ($.inArray(this.ID, _fill_student_ids[keyword]) === -1) {
                        _fill_student_ids[keyword].push(this.ID);
                        _fill_student_tags[keyword].push({
                            ID: this.ID,
                            Name: this.StudentName + " (" + this.ClassName + ")"
                        });
                    }
                });
                
                if (keyword == _receiverKeyword)
                    fill_response(tags);
            }
        });
    }
    else {
        $(_fill_student_tags[keyword]).each(function() {
            if (tags.length < 20)
                tags.push(this.Name);
        });
        
        if (keyword == _receiverKeyword)
            fill_response(tags);
    }
}

var _fill_teacher_ids = {}, _fill_teacher_tags = {}, _fill_teacher_keywords = [];
function fill_teacher(keyword, response) {
    
    var fill_response = response;
    var tags = [];
    
    if (keyword.length > 1) {
        var content = keyword;
        keyword = keyword.substr(0, 1);
        
        if ($.inArray(keyword, _fill_teacher_keywords) === -1) {
        
            _fill_teacher_ids[keyword] = [];
            _fill_teacher_tags[keyword] = [];
            _fill_teacher_keywords.push(keyword);
            
            _connection.send({
                service: "message.AutoFillTeachers",
                body: {
                    Request: {
                        Keyword: "%" + keyword + "%"
                    }
                },
                result: function(response, error, http) {
                    $(response.Response.Teacher).each(function() {
                        if ($.inArray(this.ID, _fill_teacher_ids[keyword]) === -1) {
                            _fill_teacher_ids[keyword].push(this.ID);
                            _fill_teacher_tags[keyword].push({
                                ID: this.ID,
                                Name: (this.Nickname == "") ? this.TeacherName : this.TeacherName + " (" + this.Nickname + ")"
                            });
                        }
                    });
                    
                    $(_fill_teacher_tags[keyword]).each(function() {
                        if (this.Name.indexOf(content) !== -1)
                            if (tags.length < 20)
                                tags.push(this.Name);
                    });
                    
                    if (content == _receiverKeyword)
                        fill_response(tags);
                }
            });
        }
        else {
            $(_fill_teacher_tags[keyword]).each(function() {
                if (this.Name.indexOf(content) !== -1)
                    if (tags.length < 20)
                        tags.push(this.Name);
            });
            
            if (content == _receiverKeyword)
                fill_response(tags);
        }
    }
    
    if (keyword.length === 1 && $.inArray(keyword, _fill_teacher_keywords) === -1) {
        
        _fill_teacher_ids[keyword] = [];
        _fill_teacher_tags[keyword] = [];
        _fill_teacher_keywords.push(keyword);
        
        _connection.send({
            service: "message.AutoFillTeachers",
            body: {
                Request: {
                    Keyword: "%" + keyword + "%"
                }
            },
            result: function(response, error, http) {
                $(response.Response.Teacher).each(function() {
                    if (tags.length < 20)
                        tags.push((this.Nickname == "") ? this.TeacherName : this.TeacherName + " (" + this.Nickname + ")");
                    
                    if ($.inArray(this.ID, _fill_teacher_ids[keyword]) === -1) {
                        _fill_teacher_ids[keyword].push(this.ID);
                        _fill_teacher_tags[keyword].push({
                            ID: this.ID,
                            Name: (this.Nickname == "") ? this.TeacherName : this.TeacherName + " (" + this.Nickname + ")"
                        });
                    }
                });
                
                if (keyword == _receiverKeyword)
                    fill_response(tags);
            }
        });
    }
    else {
        $(_fill_teacher_tags[keyword]).each(function() {
            if (tags.length < 20)
                tags.push(this.Name);
        });
        
        if (keyword == _receiverKeyword)
            fill_response(tags);
    }
}

var _fill_class_ids = {}, _fill_class_tags = {}, _fill_class_keywords = [];
function fill_class(keyword, response) {
    
    var fill_response = response;
    var tags = [];
    
    if (keyword.length > 1) {
        var content = keyword;
        keyword = keyword.substr(0, 1);
        
        if ($.inArray(keyword, _fill_class_keywords) === -1) {
        
            _fill_class_ids[keyword] = [];
            _fill_class_tags[keyword] = [];
            _fill_class_keywords.push(keyword);
            
            _connection.send({
                service: "message.AutoFillClasses",
                body: {
                    Request: {
                        Keyword: "%" + keyword + "%"
                    }
                },
                result: function(response, error, http) {
                    $(response.Response.Class).each(function() {
                        if ($.inArray(this.ID, _fill_class_ids[keyword]) === -1) {
                            _fill_class_ids[keyword].push(this.ID);
                            _fill_class_tags[keyword].push({
                                ID: this.ID,
                                Name: this.ClassName + "(" + this.TeacherName + ")"
                            });
                        }
                    });
                    
                    $(_fill_class_tags[keyword]).each(function() {
                        if (this.Name.indexOf(content) !== -1)
                            if (tags.length < 20)
                                tags.push(this.Name);
                    });
                    
                    if (content == _receiverKeyword)
                        fill_response(tags);
                }
            });
        }
        else {
            $(_fill_class_tags[keyword]).each(function() {
                if (this.Name.indexOf(content) !== -1)
                    if (tags.length < 20)
                        tags.push(this.Name);
            });
            
            if (content == _receiverKeyword)
                fill_response(tags);
        }
    }
    
    if (keyword.length === 1 && $.inArray(keyword, _fill_class_keywords) === -1) {
        
        _fill_class_ids[keyword] = [];
        _fill_class_tags[keyword] = [];
        _fill_class_keywords.push(keyword);
        
        _connection.send({
            service: "message.AutoFillClasses",
            body: {
                Request: {
                    Keyword: "%" + keyword + "%"
                }
            },
            result: function(response, error, http) {
                $(response.Response.Class).each(function() {
                    if (tags.length < 20)
                        tags.push(this.ClassName + "(" + this.TeacherName + ")");
                    
                    if ($.inArray(this.ID, _fill_class_ids[keyword]) === -1) {
                        _fill_class_ids[keyword].push(this.ID);
                        _fill_class_tags[keyword].push({
                            ID: this.ID,
                            Name: this.ClassName + "(" + this.TeacherName + ")"
                        });
                    }
                });
                
                if (keyword == _receiverKeyword)
                    fill_response(tags);
            }
        });
    }
    else {
        $(_fill_class_tags[keyword]).each(function() {
            if (tags.length < 20)
                tags.push(this.Name);
        });
        
        if (keyword == _receiverKeyword)
            fill_response(tags);
    }
}

var _fill_course_ids = {}, _fill_course_tags = {}, _fill_course_keywords = [];
function fill_course(keyword, response) {
    
    var fill_response = response;
    var tags = [];
    
    if (keyword.length > 1) {
        var content = keyword;
        keyword = keyword.substr(0, 1);
        
        if ($.inArray(keyword, _fill_course_keywords) === -1) {
        
            _fill_course_ids[keyword] = [];
            _fill_course_tags[keyword] = [];
            _fill_course_keywords.push(keyword);
            
            _connection.send({
                service: "message.AutoFillCourses",
                body: {
                    Request: {
                        Keyword: "%" + keyword + "%",
                        SchoolYear: _currentSemester.SchoolYear,
                        Semester: _currentSemester.Semester
                    }
                },
                result: function(response, error, http) {
                    $(response.Response.Course).each(function() {
                        if ($.inArray(this.ID, _fill_course_ids[keyword]) === -1) {
                            _fill_course_ids[keyword].push(this.ID);
                            _fill_course_tags[keyword].push({
                                ID: this.ID,
                                Name: this.CourseName + "(" + this.TeacherName + ")"
                            });
                        }
                    });
                    
                    $(_fill_course_tags[keyword]).each(function() {
                        if (this.Name.indexOf(content) !== -1)
                            if (tags.length < 20)
                                tags.push(this.Name);
                    });
                    
                    if (content == _receiverKeyword)
                        fill_response(tags);
                }
            });
        }
        else {
            $(_fill_course_tags[keyword]).each(function() {
                if (this.Name.indexOf(content) !== -1)
                    if (tags.length < 20)
                        tags.push(this.Name);
            });
            
            if (content == _receiverKeyword)
                fill_response(tags);
        }
    }
    
    if (keyword.length === 1 && $.inArray(keyword, _fill_course_keywords) === -1) {
        
        _fill_course_ids[keyword] = [];
        _fill_course_tags[keyword] = [];
        _fill_course_keywords.push(keyword);
        
        _connection.send({
            service: "message.AutoFillCourses",
            body: {
                Request: {
                    Keyword: "%" + keyword + "%",
                    SchoolYear: _currentSemester.SchoolYear,
                    Semester: _currentSemester.Semester
                }
            },
            result: function(response, error, http) {
                $(response.Response.Course).each(function() {
                    if (tags.length < 20)
                        tags.push(this.CourseName + "(" + this.TeacherName + ")");
                    
                    if ($.inArray(this.ID, _fill_course_ids[keyword]) === -1) {
                        _fill_course_ids[keyword].push(this.ID);
                        _fill_course_tags[keyword].push({
                            ID: this.ID,
                            Name: this.CourseName + "(" + this.TeacherName + ")"
                        });
                    }
                });
                
                if (keyword == _receiverKeyword)
                    fill_response(tags);
            }
        });
    }
    else {
        $(_fill_course_tags[keyword]).each(function() {
            if (tags.length < 20)
                tags.push(this.Name);
        });
        
        if (keyword == _receiverKeyword)
            fill_response(tags);
    }
}

function query_message(keyword, pageindex) {
    
    _currentKeyword = keyword;
    _currentPageindex = pageindex;
    
    if (_currentPageindex == 1) {
        $(".my-stream-items").html("");
    }
    
    var pageSize = 10;
    var request = {};
    
    if (keyword == "keyword")
        request.Keyword = "%" + $(".my-query-keyword").val() + "%";
    else if (keyword != "all")
        request.UserID = keyword;
    
    request.Pagination = {
        PageSize: pageSize,
        StartPage: pageindex
    }
    
    _connection.send({
        service: "message.GetMessages",
        body: {
            Request: request
        },
        result: function(response, error, http) {
            var messages = $(response.Result.Message);
            set_messages(messages, "multi-message");
        }
    });
}

function set_messages(messages, type) {
    
    $(messages).each(function() {
        var img_src =
            (this.Photo == "" || this.Photo == undefined)
            ? _src + "/icon.png"
            : "data:image/png;base64," + this.Photo;
        
        var stream_item =
            "<div class='my-stream-item' message-id='" + this.UID + "'>" +
                "<div class='my-stram-item-content my-stream-message-item'>" +
                    "<div class='my-stream-message-image'>" +
                        "<img src='" + img_src + "' height='48px' width='48px'/>" +
                    "</div>" +
                    "<div class='my-stream-message-content'>" +
                        "<div class='my-stream-message-row'>" +
                            "<span class='my-stream-message-user-name'>" +
                                "<span class='my-stream-message-screen-name'><b>" +
                                    this.AuthorName +
                                "</b></span>" +
                                " <span class='my-stream-message-full-name'>" +
                                    this.Author +
                                "</span>" +
                            "</span>" +
                        "</div>" +
                        "<div class='my-stream-message-row'>" +
                            "<div class='my-stream-message-text'>" +
                                this.Content +
                            "</div>" +
                        "</div>" +
                        "<div class='my-stream-message-row'>" +
                            "<span class='my-stream-message-timestamp'>" +
                                this.CreateTime.substr(0, 16) +
                            "</span>" +
                            "<span class='btn-group my-stream-message-actions'>" +
                                "<a href='#' class='btn my-reply-action' title='回覆' message-id='" + this.UID + "' author-id='" + this.AuthorID + "' author-name='" + this.AuthorName + "' author-role='" + this.AuthorRole + "' message-content='" + this.Content.replace(/'/ig, "") + "'>" +
                                    "<span>" +
                                        "<i class='icon-comment'></i>" +
//                                        "<b>回覆</b>" +
                                    "</span>" +
                                "</a> " +
                                "<a href='#' class='btn my-addnote-action' title='加入筆記本' message-id='" + this.UID + "' author-id='" + this.AuthorID + "' author-name='" + this.AuthorName + "' author-role='" + this.AuthorRole + "' message-content='" + this.Content.replace(/'/ig, "") + "'>" +
                                    "<span>" +
                                        "<i class='icon-plus'></i>" +
//                                        "<b>加入筆記本</b>" +
                                    "</span>" +
                                "</a> " +
                                ((_myInfos[0].UserID == this.Author)
                                    ?
                                    "<a href='#' class='btn my-delete-action' title='刪除' message-id='" + this.UID + "' message-content='" + this.Content.replace(/'/ig, "") + "'>" +
                                        "<span>" +
                                            "<i class='icon-trash'></i>" +
//                                            "<b>刪除</b>" +
                                        "</span>" +
                                    "</a>"
                                    : ""
                                ) +
                            "</span>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
            "</div>";
        
        if (type == "multi-message")
            $(stream_item).appendTo($(".my-stream-items"));
        else
            $(stream_item).prependTo($(".my-stream-items")).effect("slide", {}, 500);
    });
    
    if (type == "multi-message") {
        if (messages.length == 10) {
            $("<div class='btn btn-success my-stream-more-message'>顯示更多...</div>").appendTo($(".my-stream-items"))
            .appendTo($(".my-stream-items"))
            .bind("click", function() {
                $(this).detach();
                query_message(_currentKeyword, _currentPageindex + 1);
            });
        }
        
        if (_currentPageindex == 1) {
            $(".my-stream-items").effect("slide", {}, 500);
        }
    }
    
    set_actions();
}

function set_actions() {
    
    $(".my-reply-action").bind("click", function() {

        $("#editModal .modal-body")
        .html("<textarea class='my-message-textarea-editor'></textarea><div class='my-message-content-text'></div>");
        
        $("#editModal .my-message-content-text").html($(this).attr("message-content"));
        $("#editModal .my-message-word-counter").html("140");
        $("#save-data").addClass("disabled").attr("disabled", "disabled");
        
        $("#editModal h3").html("回覆：" + $(this).attr("author-name"));
        $("#save-data").attr("message-id", $(this).attr("message-id"));
        $("#save-data").attr("author-id", $(this).attr("author-id"));
        $("#save-data").attr("author-role", $(this).attr("author-role"));
        $("#save-data").attr("action-type", "reply-message");
        $("#save-data").html("回覆");
        
        $("#editModal .my-message-textarea-editor").bind("keyup", function(event) {
            
            $("#editModal .my-message-word-counter").html(140 - $("#editModal .my-message-textarea-editor").val().length);
            
            if (parseInt($("#editModal .my-message-word-counter").html(), 10) < 0) {
                $("#editModal .my-message-word-counter").css("color", "#f00");
                $("#save-data").addClass("disabled").attr("disabled", "disabled");
            }
            else if (parseInt($("#editModal .my-message-word-counter").val(), 10) == 140) {
                $("#editModal .my-message-word-counter").css("color", "#999");
                $("#save-data").addClass("disabled").attr("disabled", "disabled");
            }
            else {
                $("#editModal .my-message-word-counter").css("color", "#999");
                $("#save-data").removeClass("disabled").removeAttr("disabled");
            }
        });
        
        $("#editModal").modal("show");
        
        return false;
    });

    $(".my-addnote-action").bind("click", function () {

        $("#editModal .modal-body")
        .html("<textarea class='my-message-textarea-editor'></textarea>");
        
        $("#editModal .my-message-textarea-editor").val($(this).attr("author-name") + "留言：" + $(this).attr("message-content"));
        $("#editModal .my-message-word-counter").html("");
        $("#save-data").removeClass("disabled").removeAttr("disabled");
        
        $("#editModal h3").html("加入筆記本");
        $("#save-data").attr("message-id", $(this).attr("message-id"));
        $("#save-data").attr("author-id", $(this).attr("author-id"));
        $("#save-data").attr("author-role", $(this).attr("author-role"));
        $("#save-data").attr("action-type", "add-note");
        $("#save-data").html("加入");
        $("#editModal").modal("show");
        
        return false;
    });

    $(".my-delete-action").bind("click", function () {
        
        $("#editModal .modal-body").html($(this).attr("message-content"));
        $("#editModal .my-message-word-counter").html("");
        $("#save-data").removeClass("disabled").removeAttr("disabled");
        
        $("#editModal h3").html("是否確定刪除此筆記？");
        $("#save-data").attr("message-id", $(this).attr("message-id"));
        $("#save-data").attr("action-type", "delete-message");
        $("#save-data").html("刪除");
        $("#editModal").modal("show");
        
        return false;
    });

    $(".my-stream-item").hover(
        function () { $(this).find(".my-stream-message-actions").css("visibility", "visible") },
        function () { $(this).find(".my-stream-message-actions").css("visibility", "hidden") }
    );
}

function post() {

    if ($(".my-message-textarea-editor").val().length > 140 ||
        $(".my-message-textarea-editor").val().length == 0) return;
    
    var message = {};
    message.Content = $(".my-message-textarea-editor").val();
    
    if (_receiverType == "public")
        message.IsPublic = true;
    
    _connection.send({
        service: "message.AddMessage",
        body: {
            Request: {
                Message: message
            }
        },
        result: function(response, error, http) {
            
            if (response.Result.NewID != undefined) {
            
                var new_id = response.Result.NewID;
                var items = [];
                var request = {};
                var service = "";
                
                $(_receivers).each(function() {
                    items.push({
                        "@ID": this.toString(),
                        "@MsgID": new_id
                    });
                });
                
                switch(_receiverType) {
                    case "student":
                        service = "message.SetStudentLink";
                        request.Student = items;
                    break;
                    case "teacher":
                        service = "message.SetTeacherLink";
                        request.Teacher = items;
                    break;
                    case "class":
                        service = "message.SetClassLink";
                        request.Class = items;
                    break;
                    case "course":
                        service = "message.SetCourseLink";
                        request.Course = items;
                    break;
                }
                
                _connection.send({
                    service: service,
                    body: {
                        Request: request
                    },
                    result: function(response, error, http) {
                        _receivers = [];
                    }
                });
                
                _connection.send({
                    service: "message.GetMessages",
                    body: {
                        Request: {
                            UID: new_id
                        }
                    },
                    result: function(response, error, http) {
                        var messages = $(response.Result.Message);
                        set_messages(messages, "single-message");
                    }
                });
            }
        }
    });
    
    $(".my-receivers").html("");
    $(".my-message-textarea-editor").val("");
    $(".my-message-word-counter").html("140");
}

function reply() {
    
    if ($("#editModal .my-message-textarea-editor").val().length > 140 ||
        $("#editModal .my-message-textarea-editor").val().length == 0) return;
    
    var message = {};
    message.Content = $("#editModal .my-message-textarea-editor").val();
    
    _connection.send({
        service: "message.AddMessage",
        body: {
            Request: {
                Message: message
            }
        },
        result: function(response, error, http) {
            
            if (response.Result.NewID != undefined) {
                
                var author_id = $("#save-data").attr("author-id");
                var author_role = $("#save-data").attr("author-role").toLowerCase();
                
                var request = {};
                var service = "";
                
                switch(author_role) {
                    case "student":
                        service = "message.SetStudentLink";
                        request.Student = {
                            "@ID": author_id,
                            "@MsgID": response.Result.NewID
                        };
                    break;
                    case "teacher":
                        service = "message.SetTeacherLink";
                        request.Teacher = {
                            "@ID": author_id,
                            "@MsgID": response.Result.NewID
                        };
                    break;
                }
                
                if (service != "") {
                    _connection.send({
                        service: service,
                        body: {
                            Request: request
                        },
                        result: function(response, error, http) {
                        }
                    });
                }
                
                _connection.send({
                    service: "message.GetMessages",
                    body: {
                        Request: {
                            UID: response.Result.NewID
                        }
                    },
                    result: function(response, error, http) {
                        var messages = $(response.Result.Message);
                        set_messages(messages, "single-message");
                    }
                });
                
                $("#editModal").modal("hide");
            }
        }
    });
}