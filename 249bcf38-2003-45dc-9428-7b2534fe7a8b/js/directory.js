var _gg = _gg || {};
_gg.connection = gadget.getContract("campuslite.directory.parent");
_gg.msgconnection = gadget.getContract("campuslite.message");

jQuery(function () {
    if ($.browser.msie) { _gg.set_error_message('#ieMsg', '', '若照片無法完整呈現，請改用其他瀏覽器！'); }
    $('#myTab')
        .click(function() {
            $(this).find('li.active').removeClass('active');
        })
        .find('a').live('click', function(){
            $('#tabName').html($(this).html());
        });

    $('span.my-trash').click(function() {
        $("#edit-Photo div.my-proimg").attr('photo-base64', '');
        $("#edit-Photo div.my-proimg").css('background-image', 'url(css/images/nophoto.png)');
    });

    $('body')
        // popover 點選x時關閉
        .on('click', 'div.popover button.close', function() {
            $('[rel=popover]').popover('hide');
        })
        // 開啟 popover
        .on('click', '[rel=popover]', function() {
            $(this).popover('show');
        })
        // 點選列表中的大頭照連結
        .on('click', 'div.my-stlist > a', function() {
            if ($(this).attr('href') === '#teacherInfo') {
                _gg.teacher = _gg.teachers[$(this).attr('index')];
                _gg.getTeacherInfo();
            } else if ($(this).attr('href') === '#studentInfo') {
                _gg.student = _gg.students[$(this).attr('index')];
                _gg.getStudentInfo();
            }
        })
        // 計算字數
        .on('keyup', '.my-message-input', function (event) {
            $(".my-message-word").html(140 - $(this).val().length);

            if (parseInt($(".my-message-word").html(), 10) < 0) {
                $(".my-message-word").css("color", "#f00");
                $(".my-message-button").prop('disabled', true);
            }
            else if (parseInt($(".my-message-word").html(), 10) == 140) {
                $(".my-message-word").css("color", "#999");
                $(".my-message-button").prop('disabled', true);
            }
            else {
                $(".my-message-word").css("color", "#999");
                $(".my-message-button").prop('disabled', false);
            }
        })
        // 點選傳訊鈕。初始化訊息送出鈕為 disabled，處理收訊者選項
        .on('click', 'a[action-type=msgForm], button[action-type=msgForm]', function() {
            $('div[data-type=errMsg]').html('');
            $(".my-message-word").html(140);
            $('.my-message-input').val('');
            $(".my-message-button").prop('disabled', true);

            // 群組傳訊
            if (this.id === 'sendGroup') {
                $('#mySendMsg input:radio:first').attr('checked', 'checked');
                var tmp_tab = $('#myTab li.active a').attr('href');

                if (tmp_tab === '#student1') {
                    $('#mySendMsg .modal-footer')
                        .find('p.pull-left').removeClass('hide')
                        .end().find('button').attr('action-type', 'to_students');
                } else {
                    $('#mySendMsg .modal-footer')
                        .find('p.pull-left').addClass('hide')
                        .end().find('button').attr('action-type', 'to_teachers');
                }
            }
        })
        // 送出訊息
        .on('click', '.my-message-button', function() {
            $(this).button("loading");
            var that = this;
            _gg.sendMessage(that);
        })
        // 切換親子
        .on('click', '#children li', function() {
            $('#child_name').html($(this).html());
            _gg.child = _gg.children[$(this).attr('index')];
            _gg.getCourseList();
        });

    // 個性簽名的 tooltip
    $('#student1 div[rel=tooltip], #teacher1 div[rel=tooltip], #studentInfo button[rel=tooltip]').tooltip("show").tooltip("toggle");

    $.datepicker.setDefaults({
        dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"]
        ,monthNames: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
        ,dateFormat: "yy/mm/dd"
    });

    // 搜尋
    // $("#filter-keyword").keyup(function() {
    //     _gg.ResetTeacherList();
    // });

    // $("#filter-teacher").click(function() {
    //     _gg.ResetTeacherList();
    // });

    //  切換下拉選單
    $('#myTab').on('click', 'a', function() {
        $('#mainMsg').html('');
        if ($(this).attr('href') === '#teacher1') {
            $('#sendGroup').removeClass('hide');
            $('div.my-code').addClass('hide');
            _gg.getTeacherList();
        } else if ($(this).attr('href') === '#student1') {
            _gg.studentlist = {
                cid  : $(this).attr('CID'),
                kind : $(this).attr('Kind')
            };
            $('#sendGroup').removeClass('hide');
            $('div.my-code').addClass('hide');
            _gg.getStudentList();
        } else {
            $('#sendGroup').addClass('hide');
            $('div.my-code').removeClass('hide');
        }
    });

    // 點選老師
    $('#teacher1').on('click', 'a', function() {
        _gg.teacher = _gg.teachers[$(this).attr('Index')];
    })

    // 點選學生
    $('#student1').on('click', 'a', function() {
        _gg.student = _gg.students[$(this).attr('Index')];
    })

    $('#studentInfo, #teacherInfo').each(function(index, target){
        target = $(target);

        // 關閉 popover
        target.on('hidden', function() {
            $('div.popover').remove();
        });

        // 開啟 popover
        target.on('click', '[js="popover"]', function() {
            $(this).popover('show');
        });

        // 切換家長時，關閉 popover
        target.on('click', '.modal-footer a', function() {
            $(this).closest('.modal-footer').find('div.my-pulse').remove();
            $(this).append('<div class="my-pulse"></div>');
            $('div.popover').remove();
        })
    });

    // 提示照片格式
    $('#edit-Photo').tooltip({trigger:'hover'});

    // 驗證設定
    $.validator.setDefaults({
        debug: false, // 為 true 時不會 submit
        errorElement: "span", //錯誤時使用元素
        errorClass: "help-inline", //錯誤時使用樣式
        highlight: function(element) {
            // 將未通過驗證的表單元素設置高亮度
            $(element).parentsUntil('.control-group').parent().addClass("error");
        },
        unhighlight: function(element) {
            // 與 highlight 相反
            $(element).parentsUntil('.control-group').parent().removeClass("error");
        },
        errorPlacement: function (error, element) {
            // 錯誤標籤的顯示位置
            error.insertAfter(element);
        }
    });

    // 取得我的基本資料
    _gg.connection.send({
        service: "_.GetMyInfo",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetMyInfo', error);
            } else {
                _gg.myself = [];
                if (response.ParentInfo != null) {
                    $(response.ParentInfo).each(function(index, item) {
                        _gg.myself = item;
                    });

                    _gg.getMyInfo();
                    _gg.updatePhoto();

                    $('#save-myself').click(function() {
                        $('#mainMsg').html('');
                        if ($("#profile form").valid()) {
                            // 驗證通過
                            $(this).button("loading");
                            _gg.saveMyInfo();
                        } else {
                            $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  資料驗證失敗，請重新檢查！\n</div>");
                        }
                    });
                    $('#cancel-myself').click(function() {
                        var photo_base64 = _gg.myself.Photo
                            .replace("data:image/png;base64,", "")
                            .replace("data:image/jpeg;base64,", "");
                        $("#edit-Photo div.my-proimg").attr("photo-base64", photo_base64);
                        _gg.getMyInfo();
                    });
                }
                // 取得子女資料
                _gg.children = [];
                _gg.connection.send({
                    service: "_.GetStudentInfo",
                    body: '',
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetStudentInfo', error);
                        } else {
                            var _ref;
                            if (((_ref = response.Result) != null ? _ref.Student : void 0) != null) {
                                var ret = [];
                                $(response.Result.Student).each(function(index, item) {
                                    _gg.children[index] = item;
                                    ret.push('<li index="' + index + '">' + (item.StudentName || '未設定') + '</li>');
                                });
                                $('#children ul')
                                    .html(ret.join(''))
                                    .find('li:first').trigger('click');
                                $('#children').hover(
                                    function() {
                                        $('#children .my-childname').height('auto');
                                    },
                                    function() {
                                        $('#children .my-childname').height(0);
                                    }
                                );
                            } else {
                                // 無親子資料時，只呈現個人資料
                                $('#myTab')
                                    .html('<li class="active"><a href="#profile" data-toggle="tab">個人資訊</a></li>')
                                    .find('a:first').trigger('click');
                            }
                        }
                    }
                });
            }
        }
    });
});

// 顯示個人基本資料
_gg.getMyInfo = function () {
    $('#profile').find('input:text, textarea').val('')
        .end().find('input:checkbox').attr('checked', false)
        .end().find('#edit-Photo').html('');

    var myself = _gg.myself;
    // 處理照片
    var photo;
    var photo_base64 = '';
    if (myself.Photo) {
        photo_base64 = myself.Photo
            .replace("data:image/png;base64,", "")
            .replace("data:image/jpeg;base64,", "");

        photo = '<div class="my-proimg" style="background-image:url(data:image/png;base64,' + myself.Photo + ');" photo-base64="' + photo_base64 + '"></div>';
    } else {
        photo = '<div class="my-proimg" style="background-image:url(css/images/nophoto.png);"></div>';
    }

    $('#edit-Photo').html(photo).find('div.my-proimg').css("background-size", "100% auto");
    $('#edit-Gender').val(myself.Gender || '');
    $('#edit-AboutMe').val(myself.AboutMe || '');
    $('#edit-Birthdate').val(myself.Birthdate || '').datepicker();
    $('#edit-CellPhone').val(myself.CellPhone || '');
    $('#edit-ContactAddress').val(myself.ContactAddress || '');
    $('#edit-ContactPhone').val(myself.ContactPhone || '');
    $('#edit-Email').val(myself.Email || '');
    $('#edit-ParentName').val(myself.ParentName || '');
    $('#edit-Tagline').val(myself.Tagline || '');

    // 處理分享對象
    var privacy_checked = function(origin, privacyName) {
        if (origin) {
            var result = parseInt(origin, 10); // 轉為10進制
            var items = [1, 2, 4, 8, 16, 32];

            $(items).each(function(key, value) {
                // 位元運算
                if (result & value) {
                    $('input:checkbox[name=' + privacyName + ']').filter('[value=' + value +']').attr('checked', true);
                }
            });
        }
    };

    privacy_checked(myself.PrivacyT, 'teacher');
    privacy_checked(myself.PrivacyS, 'student');
    privacy_checked(myself.PrivacyP, 'parent');
};

// 取得修課清單
_gg.getCourseList = function() {
    var child = _gg.child;
    _gg.connection.send({
        service: "_.GetMyCourseList",
        body: '<Request><Condition><StudentID>' + child.StudentID + '</StudentID></Condition></Request>',
        result: function (response, error, http) {
            var dropdown_list = [];

            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetMyCourseList', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.Courses : void 0) != null) {
                    $(response.Response.Courses).each(function(index, item) {
                        dropdown_list.push(
                            '<li>' +
                            '<a href="#student1" data-toggle="tab"' +
                            ' Kind="course" CID="' + (item.CourseID || '') + '"' +
                            '>' + (item.Subject || '') + ' 通訊錄</a></li>'
                        );
                    });
                }
            }

            // 下拉選單
            var dropdown_txt = '<li><a href="#profile" data-toggle="tab" class="my-highLightItem">個人資訊</a></li>' +
                '<li><a href="#teacher1" data-toggle="tab" class="my-highLightItem">教師通訊錄</a></li>';

            if (child.ClassID) {
                dropdown_txt += '<li><a href="#student1" data-toggle="tab" class="my-highLightItem" Kind="class" CID="' + (child.ClassID || '') + '">' + (child.ClassName || '') + ' 通訊錄</a></li>';
            }

            $('#myTab').html(dropdown_txt + dropdown_list.join(''));

            // 尚未填寫個人資料時，預設載入個人資訊頁
            if (_gg.myself.ProfileID && (_gg.myself.PrivacyT !== '' || _gg.myself.PrivacyS !== '' || _gg.myself.PrivacyP !== '')) {
                if ($('#myTab a:[Kind=class]').size() > 0) {
                    $('#myTab a:[Kind=class]:first').trigger('click');
                } else if ($('#myTab a:[Kind=course]').size() > 0) {
                    $('#myTab a:[Kind=course]:first').trigger('click');
                } else {
                    $('#myTab a:[href=#teacher1]').trigger('click');
                }
            } else {
                // 未填, 載入個人資訊頁
                $('#myTab a:[href=#profile]').trigger('click');
            }
        }
    });
};

// 顯示教師通訊錄
_gg.getTeacherList = function() {
    var child = _gg.child;
    _gg.connection.send({
        service: "_.GetTeachers",
        body: '<Request><Condition1><StudentID>' + child.StudentID + '</StudentID></Condition1></Request>',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetTeachers', error);
            } else {
                var _ref;
                _gg.teachers = [];
                if (((_ref = response.Response) != null ? _ref.Teachers : void 0) != null) {
                    var ret = [];

                    $(response.Response.Teachers).each(function(index, item) {
                        _gg.teachers[index] = item;

                        var photo, p_resize = false;
                        if (item.Photo) {
                            photo ='data:image/png;base64,' + item.Photo;
                            p_resize = true;
                        } else {
                            photo = 'css/images/nophoto.png';
                        }

                        var titleT = '';
                        if (item.Kind === 'class') {
                            titleT = '(班導師)';
                        } else {
                            titleT = '(' + (item.CourseSubject || '') + ')' ;
                        }


                        ret.push(
                            '<div class="my-stlist">' +
                            '<a href="#teacherInfo" data-toggle="modal" Index="' + index + '">' +
                            '<div class="my-stpic" style="background-image: url(' + photo +');" data-resize="' + p_resize + '"></div>' +
                            '<div class="my-stext">' + (item.TeacherName || '') + titleT + '</div>' +
                            '<div class="my-mur" rel="tooltip" data-placement="top" data-original-title="' + (item.Tagline || '') +'">' + (item.Tagline || '') + '</div>' +
                            '</a>' +
                            '</div>'
                        );
                    });

                    var tmp_html = ret.join('');
                    if (tmp_html) {
                        $('#teacher1').html(tmp_html).end().find('.my-stpic[data-resize=true]').css("background-size", "100% auto");
                        $('#teacher1 div[rel=tooltip]').tooltip("show").tooltip("toggle");
                    } else {
                        $('#teacher1').html('目前無資料');
                    }
                } else {
                    $('#teacher1').html('目前無資料');
                }
            }
        }
    });
};

// 顯示教師詳細資料
_gg.getTeacherInfo = function() {
    $('#teacherInfo').find('h3, #t-Tagline, #t-photo, #t-info').html('');

    var teacher = _gg.teacher;
    if (teacher) {
        var gender_icon = '';
        if (teacher.Gender === '1') {
            gender_icon = '&#9794;';
        } else if (teacher.Gender === '0') {
            gender_icon = '&#9792;';
        }
        $('#teacherInfo h3').html(gender_icon + (teacher.TeacherName || '') + '&nbsp;');
        $('#t-Tagline').html((teacher.Tagline || '') + '&nbsp;');

        var photo;
        if (teacher.Photo) {
            $('#t-photo').html('<img src="data:image/png;base64,' + teacher.Photo + '">');
        } else {
            $('#t-photo').html('<img src="css/images/nophoto.png">');
        }

        $('#t-info').html(_gg.getProfile(teacher) || '');
        $('#teacherInfo')
            .find('.flexslider').flexslider({
                slideshow: false,
                controlsContainer: "#teacherInfo .modal-footer",
                directionNav: false
            });

        if (teacher.TeacherName) {
            $('#teacherInfo button[rel=popover]').prop('disabled', false);
        } else {
            $('#teacherInfo button[rel=popover]').prop('disabled', true);
        }
    }
};

// 顯示班級、課程通訊錄
_gg.getStudentList = function() {
    $('#student1').html('');
    var child = _gg.child;
    _gg.students = [];
    _gg.teachers = [];
    var studentlist = _gg.studentlist;
    var cid = studentlist.cid;

    if (child && cid && studentlist.kind) {
        var service = '', request = '';
        if (studentlist.kind === 'class') {
            service = '_.GetMyClassmate';
            request = '<Request><Condition><StudentID>' + child.StudentID + '</StudentID></Condition></Request>';
        } else {
            service = '_.GetCourseClassmate';
            request = '<Request><Condition><CourseID>' + cid + '</CourseID><MyStudentID>' + child.StudentID + '</MyStudentID></Condition></Request>';
        }

        // 取回課程老師、班級老師、同學資料
        _gg.connection.send({
            service: service,
            body: request,
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', service, error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Users : void 0) != null) {
                        var ret = [];
                        $(response.Response.Users).each(function(index, item) {
                            var tmp_class = '', tmp_href = '';

                            if (item.Kind === 'teacher') {
                                item.TeacherName = item.UserName;
                                _gg.teachers[index] = item;
                                tmp_class = ' my-teacher';
                                tmp_href = '#teacherInfo';
                            } else {
                                _gg.students[index] = item;
                                tmp_href = '#studentInfo';
                            }

                            var photo, p_resize = false;
                            if (item.Photo) {
                                photo = 'data:image/png;base64,' + item.Photo;
                                p_resize = true;
                            } else {
                                photo = 'css/images/nophoto.png';
                            }

                            var title = '';
                            if (studentlist.kind === 'class') {
                                if (item.Kind === 'teacher') {
                                    title = '(班導師)';
                                } else {
                                    if (item.SeatNo) {
                                        title = '(' + (item.SeatNo || '') + ')';
                                    }
                                }
                            }

                            ret.push(
                                '<div class="my-stlist' + tmp_class + '">' +
                                '<a href="' + tmp_href + '" data-toggle="modal" Index="' + index + '">' +
                                '<div class="my-stpic" style="background-image: url(' + photo + ');" data-resize="' + p_resize + '"></div>' +
                                '<div class="my-stext">' + (item.UserName || '') + title + '</div>' +
                                '<div class="my-mur" rel="tooltip" data-placement="top" data-original-title="' + (item.Tagline || '') +'">' + (item.Tagline || '') + '</div>' +
                                '</a>' +
                                '</div>'
                            );
                        });
                        var tmp_html = ret.join('');
                        if (tmp_html) {
                            $('#student1').html(tmp_html).find('.my-stpic[data-resize=true]').css("background-size", "100% auto");
                            $('#student1 div[rel=tooltip]').tooltip("show").tooltip("toggle");
                        } else {
                            $('#student1').html('目前無資料');
                        }
                    } else {
                        $('#student1').html('目前尚無資料');
                    }
                }
            }
        });
    }
};

// 顯示學生、家長詳細資料
_gg.getStudentInfo = function() {
    $('#studentInfo').find('.slides, .modal-footer').html('');
    _gg.parents = [];
    var student = _gg.student;
    var getDataS = false, getDataP = false, ss = '', pp = '';

    var showData = function() {
        if (getDataS && getDataP) {
            $('#studentInfo')
                .find('.slides').html(ss + pp)
                .end().find('.flexslider')
                    .removeData()
                    .flexslider({
                        slideshow: false,
                        controlsContainer: "#studentInfo .modal-footer",
                        directionNav: false
                    })
                .end().find('.flex-control-nav li a:first').append('<div class="my-pulse"></div>');
        }
    };

    var sdata = function() {
        var gender_icon = '';
        if (student.Gender === '1') {
            gender_icon = '&#9794;';
        } else if (student.Gender === '0') {
            gender_icon = '&#9792;';
        }
        var photo;
        if (student.Photo) {
            photo = '<img src="data:image/png;base64,' + student.Photo + '">';
        } else {
            photo = '<img src="css/images/nophoto.png">';
        }

        var btn_attr = '';
        if (!student.UserName) {
            btn_attr = ' disabled="disabled"';
        }

        var title = '';
        var studentlist = _gg.studentlist;
        if (studentlist.kind === 'class') {
            if (student.SeatNo) {
                title = '(' + (student.SeatNo || '') + ')';
            }
        }

        ss = '' +
            '<li>' +
            '    <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
            '        <h3 id="myModalLabel">' + gender_icon + (student.UserName || '') + title + '&nbsp;</h3>' +
            '    </div>' +
            '    <div class="modal-body">' +
            '        <div class="my-ppimg">' + photo +
            '            <button class="btn"' + btn_attr + ' action-type="msgForm" rel="popover" data-trigger="manual" data-content="&lt;textarea class=&quot;span4 my-message-input&quot; rows=&quot;10&quot;&gt;&lt;/textarea&gt;' +
            '                &lt;br/&gt;' +
            '                &lt;button class=&quot;btn btn-success pull-right my-message-button&quot; action-type=&quot;to_student&quot; data-loading-text=&quot;傳送中...&quot;&gt;送出&lt;/button&gt;"' +
            ' data-original-title="&lt;i class=&quot;icon-comment&quot;&gt;&lt;/i&gt; &lt;span class=&quot;my-message-word&quot;&gt;140&lt;/span&gt; &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;popover&quot; aria-hidden=&quot;true&quot;&gt;×&lt;/button&gt;">' +
            '                <i class="icon-comment"></i> 傳送訊息' +
            '            </button>' +
            '        </div>' +
            '        <div class="alert">' + (student.Tagline || '') + '&nbsp;</div>' +
            '        <ul>' + (_gg.getProfile(student) || '') + '</ul>' +
            '    </div>' +
            '</li>';

        getDataS = true;
        showData();
    };

    var pdata = function() {
        var child = _gg.child;
        var aparent = [];
        _gg.connection.send({
            service: "_.GetParentInfo",
            body: '<Request><Condition><StudentID>' + student.UserID + '</StudentID><MyStudentID>' + child.StudentID + '</MyStudentID></Condition></Request>',

            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetParentInfo', error);
                    return aparent.join('');
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.ParentInfo : void 0) != null) {
                        var items = [];
                        $(response.Response.ParentInfo).each(function(index, item) {
                            _gg.parents.push(item);

                            var gender_icon = '';
                            if (item.Gender === '1') {
                                gender_icon = '&#9794;';
                            } else if (item.Gender === '0') {
                                gender_icon = '&#9792;';
                            }
                            var photo;
                            if (item.Photo) {
                                photo = '<img src="data:image/png;base64,' + item.Photo + '">';
                            } else {
                                photo = '<img src="css/images/nophoto.png">';
                            }

                            var title = '';
                            if (item.Relationship) {
                                title = '(' + item.Relationship + ')';
                            }

                            aparent.push(
                                '<li>' +
                                '    <div class="modal-header">' +
                                '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
                                '        <h3 id="myModalLabel">' + gender_icon + (item.ParentName || '') + title + '&nbsp;</h3>' +
                                '    </div>' +
                                '    <div class="modal-body">' +
                                '        <div class="my-ppimg">' + photo +
                                '            <button class="btn" action-type="msgForm" rel="popover" data-trigger="manual" data-content="&lt;textarea class=&quot;span4 my-message-input&quot; rows=&quot;10&quot;&gt;&lt;/textarea&gt;' +
                                '                &lt;br/&gt;' +
                                '                &lt;label class=&quot;checkbox inline&quot;&gt;' +
                                '                &lt;input type=&quot;checkbox&quot; value=&quot;1&quot;&gt;' +
                                '                傳送給' + (student.UserName || '') + '所有親屬' +
                                '                &lt;/label&gt;' +
                                '                &lt;button class=&quot;btn btn-success pull-right my-message-button&quot; pid=&quot;' + item.ProfileID + '&quot; action-type=&quot;to_family&quot; data-loading-text=&quot;傳送中...&quot;&gt;送出&lt;/button&gt;"' +
                                ' data-original-title="&lt;i class=&quot;icon-comment&quot;&gt;&lt;/i&gt; 剩餘字數：&lt;span class=&quot;my-message-word&quot;&gt;140&lt;/span&gt; &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;popover&quot; aria-hidden=&quot;true&quot;&gt;×&lt;/button&gt;">' +
                                '                <i class="icon-comment"></i> 傳送訊息' +
                                '            </button>' +
                                '        </div>' +
                                '        <div class="alert">' + (item.Tagline || '') + '&nbsp;</div>' +
                                '        <ul>' + (_gg.getProfile(item) || '') + '</ul>' +
                                '    </div>' +
                                '</li>'
                            );
                        });
                    }

                    pp = aparent.join('');
                    getDataP = true;
                    showData();
                }
            }
        });
    };

    if (student) {
        sdata();
        pdata();
    }
};

// 個人基本資料-上傳照片
_gg.updatePhoto = function() {
    // 處理上傳圖片
    $('#edit-Photo').click(function(evt) {
        $('#mainMsg').html('');
        $('#files').val('').trigger('click');
    });
    $('#files').change(function(evt) {
        if (evt.target == undefined ||
        evt.target.files == undefined ||
        evt.target.files.length == 0) {
            alert("您的瀏覽器並未支援讀取檔案功能，請更新您的瀏覽器，謝謝!\n\n建議瀏覽器：Chrome 10+, IE 10+, Firefox 10+");
            return;
        }

        var file = evt.target.files[0];

        // 限制檔案大小
        var fileSize = 0; //檔案大小
        var SizeLimit = 1024 * 50;  //上傳上限，單位:byte, 50KB
        if ($.browser.msie) {
            //FOR IE
            var img = new Image();
            img.onload = checkSize;
            img.src = file.value;
            fileSize = this.fileSize;
        }
        else {
            //FOR Firefox,Chrome
            fileSize = file.size;
        }

        if (fileSize > SizeLimit) {
            var _filesize = (fileSize / 1024).toPrecision(4);
            var _limit = (SizeLimit / 1024).toPrecision();
            var msg = "您所選擇的檔案大小為 " + _filesize + " KB\n已超過上傳上限 " + _limit + " KB\n不允許上傳！"
            $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + msg + "\n</div>");
            return;
        }

        if (!(file.type == "image/png" || file.type == "image/jpeg")) {
            $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  請使用 .jpg 或 .png 格式！\n</div>");
            return;
        }

        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                $("#edit-Photo div.my-proimg").css('background-image', 'url(' + e.target.result + ')').css("background-size", "100% auto");

                var photo_base64 = e.target.result
                .replace("data:image/png;base64,", "")
                .replace("data:image/jpeg;base64,", "");

                $("#edit-Photo div.my-proimg").attr("photo-base64", photo_base64);
            };
        })(file);
        reader.readAsDataURL(file);

    });
};

// 儲存個人基本資料
_gg.saveMyInfo = function() {
    var myself = _gg.myself;
    var parentname = $('#edit-ParentName').val() || '';
    if (parentname) {
        var photo = $('#edit-Photo div.my-proimg').attr('photo-base64') || '';
        var gender = $('#edit-Gender').val() || '';
        var aboutme = $('#edit-AboutMe').val() || '';
        var birthdate = $('#edit-Birthdate').val() || '';
        var cellphone = $('#edit-CellPhone').val() || '';
        var contactaddress = $('#edit-ContactAddress').val() || '';
        var contactphone = $('#edit-ContactPhone').val() || '';
        var email = $('#edit-Email').val() || '';
        var tagline = $('#edit-Tagline').val() || '';

        // 處理分享對象
        var privacy_t = 0, privacy_s = 0, privacy_p = 0;

        $("#profile input:checkbox:checked").each(function(index, item) {
            switch ($(this).attr('name')) {
                case 'teacher':
                    privacy_t += parseInt($(this).val(), 10); // 數值運算
                    break;
                case 'student':
                    privacy_s += parseInt($(this).val(), 10); // 數值運算
                    break;
                case 'parent':
                    privacy_p += parseInt($(this).val(), 10); // 數值運算
                    break;
            }
        });

        var request = [];
        request.push('<AboutMe>' + aboutme + '</AboutMe>');
        request.push('<Birthdate>' + birthdate + '</Birthdate>');
        request.push('<CellPhone>' + cellphone + '</CellPhone>');
        request.push('<ContactAddress>' + contactaddress + '</ContactAddress>');
        request.push('<ContactPhone>' + contactphone + '</ContactPhone>');
        request.push('<Email>' + email + '</Email>');
        request.push('<Gender>' + gender + '</Gender>');
        request.push('<Photo>' + photo + '</Photo>');
        request.push('<Tagline>' + tagline + '</Tagline>');
        request.push('<ParentName>' + parentname + '</ParentName>');
        request.push('<PrivacyT>' + privacy_t + '</PrivacyT>');
        request.push('<PrivacyS>' + privacy_s + '</PrivacyS>');
        request.push('<PrivacyP>' + privacy_p + '</PrivacyP>');


        _gg.connection.send({
            service: "_.SetMyInfo",
            body: '<Request><Profile><Field>' + request.join('') + '</Field></Profile></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    $("#save-myself").button("reset");
                    _gg.set_error_message('#mainMsg', 'SetMyInfo', error);
                } else {
                    // 重設資料
                    myself.ParentName = parentname;
                    myself.Photo = photo;
                    myself.Gender = gender;
                    myself.AboutMe = aboutme;
                    myself.Birthdate = birthdate;
                    myself.CellPhone = cellphone;
                    myself.ContactAddress = contactaddress;
                    myself.ContactPhone = contactphone;
                    myself.Email = email;
                    myself.Tagline = tagline;
                    myself.PrivacyT = privacy_t;
                    myself.PrivacyS = privacy_s;
                    myself.PrivacyP = privacy_p;
                    _gg.getMyInfo();
                }
                $("#save-myself").button("reset");
                $('#mainMsg').html("<div class='alert alert-success'>\n  儲存成功！\n</div>");
                setTimeout("$('#mainMsg').html('')", 1500);
            }
        });
    } else {
        $("#save-myself").button("reset");
        $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  姓名為必填值！\n</div>");
    }
};

// 處理選擇性公開資訊
_gg.getProfile = function(obj) {
    var birthdate = '<li><i class="icon-gift" />' + (obj.Birthdate === 'not public' ? '未公開' : (obj.Birthdate || '')) + '</li>';
    var contact_phone = '<li><i class="icon-headphones" />' + (obj.ContactPhone === 'not public' ? '未公開' : (obj.ContactPhone || '')) + '</li>';
    var cell_phone = '<li><i class="icon-headphones" />' + (obj.CellPhone === 'not public' ? '未公開' : (obj.CellPhone || '')) + '</li>';
    var Email = '<li><i class="icon-envelope" />' + (obj.Email === 'not public' ? '未公開' : (obj.Email || '')) + '</li>';
    var contact_address = '<li><i class="icon-home" />' + (obj.ContactAddress === 'not public' ? '未公開' : (obj.ContactAddress || '')) + '</li>';
    var about_me = '<li class="my-profile">' + (obj.AboutMe === 'not public' ? '未公開' : (obj.AboutMe || '')) + '</li>';

    return (birthdate + contact_phone + cell_phone + Email + contact_address + about_me);
};

// 傳送訊息
_gg.sendMessage = function(e) {
    var getList1 = false, getList2 = false, tmp_recipients = [];
    var content = '', receiverName = '', receiverID = '', that_msg_id, that_msg_obj, that_msg_type;
    var that_send_obj = $(e); // 送出鈕物件

    // 開始傳送
    var saveMsg = function() {
        if (getList1 && getList2) {
            $.unique(tmp_recipients); // 移除重複的元素，但會產出空元素
            var all_recipients = $.map(tmp_recipients, function(value) { return (value) ? value : null; }); // 移除空元素

            var request = [];
            request.push(
                '<Browser><![CDATA[' + $.param(jQuery.browser, false) + ']]></Browser>' +
                '<Message><![CDATA[' + content + ']]></Message>' +
                '<ReceiverName><![CDATA[' + receiverName + ']]></ReceiverName>' +
                '<ReceiverID>' + receiverID + '</ReceiverID>'
            );

            if ($.isEmptyObject(all_recipients)) {
                if (that_msg_type === 'group-btn') {
                    $('.modal.in').modal('hide');
                }
                that_send_obj.button("reset");
                that_msg_obj.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  收訊者尚未建立資料，目前無法傳送！\n</div>")
            } else {
                _gg.msgconnection.send({
                    service: "_.AddMessage",
                    body: '<Request><Record>' + request.join('') + '</Record></Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            if (that_msg_type === 'group-btn') {
                                $('.modal.in').modal('hide');
                            }
                            that_send_obj.button("reset");
                            _gg.set_error_message(that_msg_id, 'AddMessage', error);
                        } else {
                            var _ref;
                            if (((_ref = response.Result) != null ? _ref.NewID : void 0) != null) {
                                var receiverReq = [];
                                $(all_recipients).each(function(key, value) {
                                    receiverReq.push(
                                        '<Receiver>' +
                                            '<ProfileID>' + value + '</ProfileID>' +
                                            '<MessageID>' + response.Result.NewID + '</MessageID>' +
                                        '</Receiver>'
                                    );
                                });

                                _gg.msgconnection.send({
                                    service: "_.AddReceiver",
                                    body: '<Request>' + receiverReq.join('') + '</Request>',
                                    result: function (response, error, http) {
                                        if (error !== null) {
                                            if (that_msg_type === 'group-btn') {
                                                $('.modal.in').modal('hide');
                                            }
                                            that_send_obj.button("reset");
                                            _gg.set_error_message(that_msg_id, 'AddReceiver', error);
                                        } else {
                                            if (that_msg_type === 'group-btn') {
                                                $('.modal.in').modal('hide');
                                            } else {
                                                $('.modal.in').find('[action-type=msgForm]').popover('hide');
                                            }
                                            that_send_obj.button("reset");
                                            that_msg_obj.html('<div class="alert alert-success">\n  傳送成功！\n</div>');
                                            setTimeout("$('" + that_msg_id + "').html('')", 1500);
                                        }
                                    }
                                });

                            }
                        }
                    }
                });
            }
        }
    };

    // 取得收訊者 ProfileID, 及訊息
    var target = that_send_obj.attr('action-type');

    var n = 0;
    if (target === 'to_teachers' || target === 'to_students') {
        content = $('#mySendMsg textarea').val();
        that_msg_id = '#mainMsg';
        that_msg_obj = $(that_msg_id); // 訊息物件
        that_msg_type = 'group-btn';
    } else {
        var obj = that_send_obj.closest('div.popover');
        content = obj.find('textarea').val();
        n = obj.find('input:checked').length;
        that_msg_id = '#' + $('.modal.in div.my-Msg').attr('id');
        that_msg_obj = $(that_msg_id); // 訊息物件
        that_msg_type = 'member-btn';
    }

    that_msg_obj.html('');

    if (content) {
        switch (target) {
            case 'to_teacher':
                var teacher = _gg.teacher;
                tmp_recipients.push(teacher.ProfileID);
                receiverID = teacher.ProfileID;
                break;

            case 'to_teachers':
                // 全校教師
                var teachers = _gg.teachers;
                $(teachers).each(function(index, item) {
                    if (item) {
                        tmp_recipients.push(item.ProfileID);
                    }
                });
                receiverName = '全校教師';
                break;

            case 'to_student':
                var student = _gg.student;
                tmp_recipients.push(student.ProfileID);
                receiverID = student.ProfileID;
                break;

            case 'to_family':
                if (n > 0) {
                    var parents = _gg.parents;
                    // 某學生所有親屬
                    $(parents).each(function(index, item) {
                        tmp_recipients.push(item.ProfileID);
                    })
                    var student = _gg.student;
                    receiverName = (student.UserName || '') + '所有親屬';
                } else {
                    tmp_recipients.push(that_send_obj.attr('pid'));
                    receiverID = that_send_obj.attr('pid');
                }
                break;

            case 'to_students':
                // 此課程、班級 的 所有學生與家長 or 所有學生 or 所有家長
                var kind = $('#mySendMsg input:radio:checked').val(); //sp, s, p

                switch (kind) {
                    case 's':
                        receiverName = ($('#myTab li.active a').html() || '').replace(' 通訊錄', '') + '所有學生';
                        break;
                    case 'p':
                        receiverName = ($('#myTab li.active a').html() || '').replace(' 通訊錄', '') + '所有家長';
                        break;
                    case 'sp':
                        receiverName = ($('#myTab li.active a').html() || '').replace(' 通訊錄', '') + '所有學生與家長';
                        break;
                }

                var students = _gg.students;
                if (kind === 's' || kind === 'sp') {
                    $(students).each(function(index, item){
                        if (item) {
                            tmp_recipients.push(item.ProfileID);
                        }
                    });
                }

                if (kind === 'p' || kind === 'sp') {
                    var studentlist = _gg.studentlist;
                    var cid = studentlist.cid;
                    var child = _gg.child;

                    if (cid && studentlist.kind) {
                        var service = '', request = '';
                        if (studentlist.kind === 'class') {
                            service = '_.GetClassParentAccount';
                            request = '<Request><Condition><MyStudentID>' + child.StudentID + '</MyStudentID></Condition></Request>';
                        } else {
                            service = '_.GetCourseParentAccount';
                            request = '<Request><Condition1><CourseID>' + cid + '</CourseID></Condition1><Condition2><MyStudentID>' + child.StudentID + '</MyStudentID></Condition2></Request>';
                        }
                    }
                    // 某班級的全部家長 ProfileID or 某課程的全部家長 ProfileID
                    _gg.connection.send({
                        service: service,
                        body: request,
                        result: function (response, error, http) {
                            if (error !== null) {
                                that_send_obj.button("reset");
                                _gg.set_error_message('#mySendMsg_Msg', service, error);
                            } else {
                                var _ref;
                                if (((_ref = response.Response) != null ? _ref.Parents : void 0) != null) {
                                    $(response.Response.Parents).each(function(index, item) {
                                        tmp_recipients.push(item.ProfileID);
                                    });
                                }
                                getList2 = true;
                                saveMsg();
                            }
                        }
                    });
                } else {
                    getList2 = true;
                    saveMsg();
                }

                break;
        }

        if (target !== 'to_students') {
            getList2 = true;
        }
        getList1 = true;
        saveMsg();
    } else {
        that_send_obj.button("reset");
    }
};

// 錯誤訊息
// 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    if (serviceName) {
        var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
        if (error !== null) {
            if (error.dsaError) {
                if (error.dsaError.status === "504") {
                    switch (error.dsaError.message) {
                        default:
                            tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
                    }
                } else if (error.dsaError.message) {
                    tmp_msg = error.dsaError.message;
                }
            } else if (error.loginError.message) {
                tmp_msg = error.loginError.message;
            } else if (error.message) {
                tmp_msg = error.message;
            }
            $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
            $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
        }
    } else {
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
    }
};