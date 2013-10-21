var DirectoryManager = DirectoryManager || {};
DirectoryManager.system_position = gadget.params.system_position || "student"; // parent, teacher
switch (DirectoryManager.system_position) {
    case 'student':
        DirectoryManager.connection_dir = gadget.getContract("campuslite.directory.student");
        DirectoryManager.connection_cloud = gadget.getContract("cloud.student");
        break;
    case 'parent':
        DirectoryManager.connection_dir = gadget.getContract("campuslite.directory.parent");
        DirectoryManager.connection_cloud = gadget.getContract("cloud.parent");
        break;
    case 'teacher':
        DirectoryManager.connection_dir = gadget.getContract("campuslite.directory.teacher");
        DirectoryManager.connection_cloud = gadget.getContract("cloud.teacher");
        break;
}
DirectoryManager.connection_msg = gadget.getContract("campuslite.message");
DirectoryManager.SaveStatus = true; // 個人資訊已儲存


jQuery(function () {
    if (DirectoryManager.system_position !== 'parent') { $('#children').remove(); }

    gadget.onLeave(function() {
        if (!DirectoryManager.SaveStatus) {
            return '您尚未儲存個人資訊，要離開此網頁嗎?';
        }
        return '';
    });

    // 取得我的基本資料
    DirectoryManager.connection_cloud.send({
        service: "beta.GetMyInfo",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                DirectoryManager.Util.msg($('#mainMsg'), 'GetMyInfo', error);
            } else {
                DirectoryManager.myself = {};
                DirectoryManager.myself = response;
                DirectoryManager.setMyInfo();
                DirectoryManager.updatePhoto();

                // 取得子女資料
                if (DirectoryManager.system_position === 'parent') {
                    DirectoryManager.children = [];
                    DirectoryManager.connection_cloud.send({
                        service: "beta.GetMyChildren",
                        body: '',
                        result: function (response, error, http) {
                            if (error !== null) {
                                DirectoryManager.Util.msg($('#mainMsg'), 'GetStudentInfo', error);
                            } else {
                                var ret = [];
                                $(response.Student).each(function(index, item) {
                                    DirectoryManager.children[index] = item;
                                    ret.push('<li index="' + index + '">' + (item.StudentName || '未設定') + '</li>');
                                });
                                $('#children ul')
                                    .html(ret.join(''))
                                    .find('li:first').trigger('click');

                                $('#children').on('hover', function(e) {
                                    if (e.type == "mouseenter") {
                                        $('#children .my-childname').height('auto');
                                    } else { // mouseleave
                                        $('#children .my-childname').height(0);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    DirectoryManager.child = DirectoryManager.myself;
                    DirectoryManager.getGroupList();
                }
            }
        }
    });

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

    if ($.browser.msie) {
        DirectoryManager.Util.msg($('#ieMsg'), '', '若照片無法完整呈現，請改用其他瀏覽器！');
    }

    $('[js="panel_nav"]').each(function(index, target){
        target = $(target);

        //  切換下拉選單
        target.on('show', 'li a', function(e) {
            if ($(this).attr('href') !== '#profile') {
                if (!DirectoryManager.SaveStatus) {
                    if (!confirm('您尚未儲存個人資料，要離開此網頁嗎?')) {
                        return false;
                    }
                }
            }
            $('#mainMsg').html('');
            target.find('.active').removeClass('active');
            target.find('#tabName').html($(this).html());
            target.find('#sendGroup').addClass('hide');

            if ($(this).attr('href') === '#student1') {
                DirectoryManager.studentlist = {
                    kindId : $(this).attr('data-kindId'),
                    kind : $(this).attr('data-kind')
                };
                target.find('#sendGroup').removeClass('hide');
                DirectoryManager.getStudentList();
            }
        });
    });

    $('#profile').each(function(index, target){
        target = $(target);

        target.find('[js="share"] > p').remove();
        target.find('[js="share"] > table tr td:nth-child(3)').addClass('hide');

        // if (DirectoryManager.system_position === 'student') {
        //     target.find('span[js="share2s"').html('群組成員');
        //     target.find('span[js="share2t"').html('老師');
        //     target.find('span[js="share2p"').html('成員的家長');
        // } else  {
        //     target.find('span[js="share2s"').html('群組成員');
        //     target.find('span[js="share2t"').html('孩子的老師');
        //     target.find('span[js="share2p"').html('成員的家長');
        // }

        // 刪除照片
        target.find('span.my-trash').click(function() {
            $("#edit-Photo div.my-proimg").attr('photo-base64', '');
            $("#edit-Photo div.my-proimg").css('background-image', 'url(css/images/nophoto.png)');
        });

        // 提示照片格式
        target.find('#edit-Photo').tooltip({trigger:'hover'});

        target.on('focus', 'input.date:not(.hasDatepicker)', function() {
            $(this).datepicker({
                dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"],
                monthNames: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
                monthNamesShort: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
                dateFormat: "yy/mm/dd",
                changeMonth: true,
                changeYear: true,
                showButtonPanel: true,
                onSelect: function() {
                    target.find('form').validate().element(this);
                }
            });
        });

        target.find('#save-myself').click(function() {
            $('#mainMsg').html('');
            if ($("#profile form").valid()) {
                // 驗證通過
                $(this).button("loading");
                DirectoryManager.saveMyInfo();
            } else {
                $('#mainMsg').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  資料驗證失敗，請重新檢查！\n</div>");
            }
        });

        target.find('#cancel-myself').click(function() {
            var photo_base64 = DirectoryManager.myself.Photo
                .replace("data:image/png;base64,", "")
                .replace("data:image/jpeg;base64,", "");
            $("#edit-Photo div.my-proimg").attr("photo-base64", photo_base64);
            DirectoryManager.setMyInfo();
            DirectoryManager.SaveStatus = true;
        });

        target.find('input').on('keyup', function(){
            DirectoryManager.SaveStatus = false;
        });
    });

    $('#student1, #teacher1').each(function(index, target){
        target = $(target);

        // 點選列表中的大頭照連結
        target.on('click', 'div.my-stlist > a', function() {
            if ($(this).attr('href') === '#teacherInfo') {
                DirectoryManager.teacher = DirectoryManager.teachers[$(this).attr('index')];
                DirectoryManager.getTeacherInfo();
            } else if ($(this).attr('href') === '#studentInfo') {
                DirectoryManager.student = DirectoryManager.students[$(this).attr('index')];
                DirectoryManager.getStudentInfo();
            }
        });
    });

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
            $('div.popover').remove();
        })
    });


    $('body')
        // popover 點選x時關閉
        .on('click', 'div.popover button.close', function() {
           $('div.popover').remove();
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
            DirectoryManager.sendMessage(that);
        })
        // 切換親子
        .on('click', '#children li', function() {
            $('#child_name').html($(this).html());
            DirectoryManager.child = DirectoryManager.children[$(this).attr('index')];
            DirectoryManager.getGroupList();
        });
});

// 顯示個人基本資料
DirectoryManager.setMyInfo = function () {
    $('#profile').find('input:text, textarea').val('')
        .end().find('input:checkbox').attr('checked', false)
        .end().find('#edit-Photo').html('');

    var myself = DirectoryManager.myself;
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
    $('#edit-Name').val(myself.StudentName || myself.ParentName || myself.TeacherName || '');
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

// 取得群組清單
DirectoryManager.getGroupList = function() {
    var child = DirectoryManager.child;
    var send = {};
    switch (DirectoryManager.system_position) {
        case 'parent':
            send.service = 'beta.GetChildGroup';
            send.body = {StudentId: child.StudentId};
            break;
        case 'student':
            send.service = 'beta.GetMyGroup';
            send.body = {};
            break;
        case 'teacher':
            send.service = 'beta.GetMyGroup';
            send.body = {};
            break;
    }

    DirectoryManager.connection_cloud.send({
        service: send.service,
        body: send.body,
        result: function (response, error, http) {
            // 下拉選單
            var dropdown_list = ['<li><a href="#profile" data-toggle="tab" class="my-highLightItem">個人資訊</a></li>'];

            if (error !== null) {
                DirectoryManager.Util.msg($('#mainMsg'), 'GetMyCourseList', error);
            } else {
                $(response.Group).each(function(index, item) {
                    dropdown_list.push(
                        '<li>' +
                        '<a href="#student1" data-toggle="tab"' +
                        ' data-kind="group" data-kindId="' + (item.GroupId || '') + '"' +
                        '>' + (item.GroupName || '') + '</a></li>'
                    );
                });
            }

            $('#myTab').html(dropdown_list.join(''));

            // 尚未填寫個人資料時，預設載入個人資訊頁
            if (DirectoryManager.myself.ProfileId && (DirectoryManager.myself.PrivacyT !== '' || DirectoryManager.myself.PrivacyS !== '' || DirectoryManager.myself.PrivacyP !== '')) {
                if ($('#myTab a:[data-kind=group]').size() > 0) {
                    $('#myTab a:[data-kind=group]:first').trigger('click');
                } else {
                    // 沒有任何群組
                    $('#myTab a:[href=#profile]').trigger('click');
                }
            } else {
                // 未填, 載入個人資訊頁
                $('#myTab a:[href=#profile]').trigger('click');
            }
        }
    });
};

// 顯示教師詳細資料
DirectoryManager.getTeacherInfo = function() {
    $('#teacherInfo').find('h3, #t-Tagline, #t-photo, #t-info, .modal-footer').html('');
    if($('.slidercentext').data('flexslider')) {
        $('.slidercentext').flexslider('destroy');
    }

    var teacher = DirectoryManager.teacher;
    if (teacher) {
        var gender_icon = '';
        if (teacher.Gender === '男') {
            gender_icon = '&#9794;';
        } else if (teacher.Gender === '女') {
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

        $('#t-info').html(DirectoryManager.getProfile(teacher) || '');

        $('#teacherInfo')
            .find('.slidercentext').flexslider({
                animation: "slide",
                slideshow: false,
                controlsContainer: "#teacherInfo .modal-footer",
                directionNav: true,
                prevText: "<",
                nextText: ">"
            });

        if (teacher.TeacherName) {
            $('#teacherInfo button[rel=popover]').prop('disabled', false);
        } else {
            $('#teacherInfo button[rel=popover]').prop('disabled', true);
        }
    }
};

// 顯示群組通訊錄
DirectoryManager.getStudentList = function() {
    $('#student1').html('');
    var child = DirectoryManager.child;
    DirectoryManager.students = [];
    DirectoryManager.teachers = [];
    var studentlist = DirectoryManager.studentlist;
    var kindId = studentlist.kindId;

    if (child && kindId && studentlist.kind) {
        var send = {
            member: {},
            teacher: {}
        };
        if (studentlist.kind === 'group') {
            switch (DirectoryManager.system_position) {
                case 'parent':
                    send.teacher.service = 'beta.GetChildGroupTeacher';
                    send.teacher.body = {StudentId: child.StudentId, GroupId: kindId, Photo: 'photo'};
                    send.member.service = 'beta.GetChildGroupmate';
                    send.member.body = {StudentId: child.StudentId, GroupId: kindId, Photo: 'photo'};
                    break;
                case 'student':
                    send.teacher.service = 'beta.GetMyGroupTeacher';
                    send.teacher.body = {StudentId: child.StudentId, GroupId: kindId, Photo: 'photo'};
                    send.member.service = 'beta.GetMyGroupmate';
                    send.member.body = {GroupId: kindId, Photo: 'photo'};
                    break;
                case 'teacher':
                    send.teacher.service = '';
                    send.teacher.body = {};
                    send.member.service = 'beta.GetMyGroupMember';
                    send.member.body = {GroupId: kindId, Photo: 'photo'};
                    break;
            }
        }

        // 取回老師資料
        if (send.teacher.service) {
            DirectoryManager.connection_cloud.send({
                service: send.teacher.service,
                body: send.teacher.body,
                result: function (response, error, http) {
                    if (error !== null) {
                        DirectoryManager.Util.msg($('#mainMsg'), send.teacher.service, error);
                    } else {
                        var ret = [];
                        $(response.Group).each(function(index, item) {
                            $(item.Teacher).each(function(index, item) {
                                var tmp_class = '', tmp_href = '';

                                DirectoryManager.teachers[index] = item;
                                tmp_class = ' my-teacher';
                                tmp_href = '#teacherInfo';

                                var photo, p_resize = false;
                                if (item.Photo) {
                                    photo = 'data:image/png;base64,' + item.Photo;
                                    p_resize = true;
                                } else {
                                    photo = 'css/images/nophoto.png';
                                }

                                var title = '';

                                ret.push(
                                    '<div class="my-stlist' + tmp_class + '">' +
                                    '<a href="' + tmp_href + '" data-toggle="modal" Index="' + index + '">' +
                                    '<div class="my-stpic" style="background-image: url(' + photo + ');" data-resize="' + p_resize + '"></div>' +
                                    '<div class="my-stext">' + (item.TeacherName || '') + title + '</div>' +
                                    '<div class="my-mur" rel="tooltip" data-placement="top" data-original-title="' + (item.Tagline || '') +'">' + (item.Tagline || '') + '</div>' +
                                    '</a>' +
                                    '</div>'
                                );
                            });
                        });
                        var tmp_html = ret.join('');
                        if (tmp_html) {
                            $('#student1').prepend(tmp_html).find('.my-stpic[data-resize=true]').css("background-size", "100% auto");
                            $('#student1 div[rel=tooltip]').tooltip("show").tooltip("toggle");
                        }
                    }
                }
            });
        }

        // 取回其他成員資料
        if (send.member.service) {
            DirectoryManager.connection_cloud.send({
                service: send.member.service,
                body: send.member.body,
                result: function (response, error, http) {
                    if (error !== null) {
                        DirectoryManager.Util.msg($('#mainMsg'), send.member.service, error);
                    } else {
                        var ret = [];

                        $(response.Group).each(function(index, item) {
                            $(item.Student).each(function(index, item) {
                                var tmp_class = '', tmp_href = '';

                                DirectoryManager.students[index] = item;
                                tmp_href = '#studentInfo';

                                var photo, p_resize = false;
                                if (item.Photo) {
                                    photo = 'data:image/png;base64,' + item.Photo;
                                    p_resize = true;
                                } else {
                                    photo = 'css/images/nophoto.png';
                                }

                                var title = '';
                                if (studentlist.kind === 'group') {
                                    if (item.SeatNo) {
                                        title = '(' + (item.SeatNo || '') + ')';
                                    }
                                }

                                ret.push(
                                    '<div class="my-stlist' + tmp_class + '">' +
                                    '<a href="' + tmp_href + '" data-toggle="modal" Index="' + index + '">' +
                                    '<div class="my-stpic" style="background-image: url(' + photo + ');" data-resize="' + p_resize + '"></div>' +
                                    '<div class="my-stext">' + (item.StudentName || '') + title + '</div>' +
                                    '<div class="my-mur" rel="tooltip" data-placement="top" data-original-title="' + (item.Tagline || '') +'">' + (item.Tagline || '') + '</div>' +
                                    '</a>' +
                                    '</div>'
                                );
                            });
                        });

                        var tmp_html = ret.join('');
                        if (tmp_html) {
                            $('#student1').append(tmp_html).find('.my-stpic[data-resize=true]').css("background-size", "100% auto");
                            $('#student1 div[rel=tooltip]').tooltip("show").tooltip("toggle");
                        }
                    }
                }
            });
        }
    }
};

// 顯示學生、家長詳細資料
DirectoryManager.getStudentInfo = function() {
    $('#studentInfo').find('.slides, .modal-footer').html('');
    if($('.slidercentext').data('flexslider')) {
        $('.slidercentext').flexslider('destroy');
    }

    DirectoryManager.parents = [];
    var student = DirectoryManager.student;
    var getDataS = false, getDataP = false, ss = '', pp = '';

    var showData = function() {
        if (getDataS && getDataP) {
            $('#studentInfo')
                .find('.slides').html(ss + pp)
                .end().find('.slidercentext')
                    .flexslider({
                        animation: "slide",
                        slideshow: false,
                        controlsContainer: "#studentInfo .modal-footer",
                        directionNav: true,
                        prevText: "<",
                        nextText: ">"
                    });
        }
    };

    var sdata = function() {
        var gender_icon = '';
        if (student.Gender === '男') {
            gender_icon = '&#9794;';
        } else if (student.Gender === '女') {
            gender_icon = '&#9792;';
        }
        var photo;
        if (student.Photo) {
            photo = '<img src="data:image/png;base64,' + student.Photo + '">';
        } else {
            photo = '<img src="css/images/nophoto.png">';
        }

        var btn_attr = '';
        if (!student.StudentName) {
            btn_attr = ' disabled="disabled"';
        }

        var title = '';
        var studentlist = DirectoryManager.studentlist;
        if (studentlist.kind === 'group') {
            if (student.SeatNo) {
                title = '(' + (student.SeatNo || '') + ')';
            }
        }

        ss = '' +
            '<li>' +
            '    <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
            '        <h3 id="myModalLabel">' + gender_icon + (student.StudentName || '') + title + '&nbsp;</h3>' +
            '    </div>' +
            '    <div class="modal-body">' +
            '        <div class="my-ppimg">' + photo +
            '            <button class="btn"' + btn_attr + ' action-type="msgForm" js="popover" data-trigger="manual" data-content="&lt;textarea class=&quot;span4 my-message-input&quot; rows=&quot;10&quot;&gt;&lt;/textarea&gt;' +
            '                &lt;br/&gt;' +
            '                &lt;button class=&quot;btn btn-success pull-right my-message-button&quot; action-type=&quot;to_student&quot; data-loading-text=&quot;傳送中...&quot;&gt;送出&lt;/button&gt;"' +
            ' data-original-title="&lt;i class=&quot;icon-comment&quot;&gt;&lt;/i&gt; &lt;span class=&quot;my-message-word&quot;&gt;140&lt;/span&gt; &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;popover&quot; aria-hidden=&quot;true&quot;&gt;×&lt;/button&gt;">' +
            '                <i class="icon-comment"></i> 傳送訊息' +
            '            </button>' +
            '        </div>' +
            '        <div class="alert">' + (student.Tagline || '') + '&nbsp;</div>' +
            '        <ul>' + (DirectoryManager.getProfile(student) || '') + '</ul>' +
            '    </div>' +
            '</li>';

        getDataS = true;
        showData();
    };

    var pdata = function() {
        var child = DirectoryManager.child;
        var aparent = [];
        var send = {};
        switch (DirectoryManager.system_position) {
            case 'parent':
                send.service = 'beta.GetParent';
                send.body = {StudentId: student.StudentId, Photo: 'photo'};
                break;
            case 'student':
                send.service = 'beta.GetParent';
                send.body = {StudentId: student.StudentId, Photo: 'photo'};
                break;
            case 'teacher':
                send.service = 'beta.GetStudentParent';
                send.body = {
                    Kind: 'group',
                    KindId: DirectoryManager.studentlist.kindId,
                    StudentId: student.StudentId,
                    Photo: 'photo'
                };
                break;
        }

        DirectoryManager.connection_cloud.send({
            service: send.service,
            body: send.body,
            result: function (response, error, http) {
                if (error !== null) {
                    DirectoryManager.Util.msg($('#mainMsg'), 'GetParent', error);
                    return aparent.join('');
                } else {
                    var items = [];
                    $(response.Student).each(function(index, item) {
                        $(item.Parent).each(function(index, item) {
                            DirectoryManager.parents.push(item);

                            var gender_icon = '';
                            if (item.Gender === '男') {
                                gender_icon = '&#9794;';
                            } else if (item.Gender === '女') {
                                gender_icon = '&#9792;';
                            }
                            var photo;
                            if (item.Photo) {
                                photo = '<img src="data:image/png;base64,' + item.Photo + '">';
                            } else {
                                photo = '<img src="css/images/nophoto.png">';
                            }

                            var title = '';
                            if (item.RelationName) {
                                title = '(' + item.RelationName + ')';
                            }

                            aparent.push(
                                '<li>' +
                                '    <div class="modal-header">' +
                                '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
                                '        <h3 id="myModalLabel">' + gender_icon + (item.StudentName || item.ParentName || item.TeacherName || '') + title + '&nbsp;</h3>' +
                                '    </div>' +
                                '    <div class="modal-body">' +
                                '        <div class="my-ppimg">' + photo +
                                '            <button class="btn" action-type="msgForm" js="popover" data-trigger="manual" data-content="&lt;textarea class=&quot;span4 my-message-input&quot; rows=&quot;10&quot;&gt;&lt;/textarea&gt;' +
                                '                &lt;br/&gt;' +
                                '                &lt;label class=&quot;checkbox inline&quot;&gt;' +
                                '                &lt;input type=&quot;checkbox&quot; value=&quot;1&quot;&gt;' +
                                '                傳送給' + (student.StudentName || '') + '所有親屬' +
                                '                &lt;/label&gt;' +
                                '                &lt;button class=&quot;btn btn-success pull-right my-message-button&quot; pid=&quot;' + item.ProfileId + '&quot; action-type=&quot;to_family&quot; data-loading-text=&quot;傳送中...&quot;&gt;送出&lt;/button&gt;"' +
                                ' data-original-title="&lt;i class=&quot;icon-comment&quot;&gt;&lt;/i&gt; 剩餘字數：&lt;span class=&quot;my-message-word&quot;&gt;140&lt;/span&gt; &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;popover&quot; aria-hidden=&quot;true&quot;&gt;×&lt;/button&gt;">' +
                                '                <i class="icon-comment"></i> 傳送訊息' +
                                '            </button>' +
                                '        </div>' +
                                '        <div class="alert">' + (item.Tagline || '') + '&nbsp;</div>' +
                                '        <ul>' + (DirectoryManager.getProfile(item) || '') + '</ul>' +
                                '    </div>' +
                                '</li>'
                            );
                        });
                    });
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
DirectoryManager.updatePhoto = function() {
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
                DirectoryManager.SaveStatus = false;
            };
        })(file);
        reader.readAsDataURL(file);

    });
};

// 儲存個人基本資料
DirectoryManager.saveMyInfo = function() {
    var myself = DirectoryManager.myself;
    var myname = $('#edit-Name').val() || '';
    if (myname) {
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
        var privacy_t = 63, privacy_s = 63, privacy_p = 63;
        // var privacy_t = 0, privacy_s = 0, privacy_p = 0;

        // $("#profile input:checkbox:checked").each(function(index, item) {
        //     switch ($(this).attr('name')) {
        //         case 'teacher':
        //             privacy_t += parseInt($(this).val(), 10); // 數值運算
        //             break;
        //         case 'student':
        //             privacy_s += parseInt($(this).val(), 10); // 數值運算
        //             break;
        //         case 'parent':
        //             privacy_p += parseInt($(this).val(), 10); // 數值運算
        //             break;
        //     }
        // });

        var request = {
            AboutMe: aboutme,
            Birthdate: birthdate,
            CellPhone: cellphone,
            ContactAddress: contactaddress,
            ContactPhone: contactphone,
            Email: email,
            Gender: gender,
            Photo: photo,
            Tagline: tagline,
            PrivacyT: privacy_t,
            PrivacyS: privacy_s,
            PrivacyP: privacy_p
        };

        switch (DirectoryManager.system_position) {
            case 'parent':
                request.ParentName = myname;
                break;
            case 'student':
                request.StudentName = myname;
                break;
            case 'teacher':
                request.TeacherName = myname;
                break;
        }

        DirectoryManager.connection_dir.send({
            service: "_.SetMyInfo",
            body: {
                Request: {
                    Profile: {
                        Field: request
                    }
                }
            },
            result: function (response, error, http) {
                if (error !== null) {
                    $("#save-myself").button("reset");
                    DirectoryManager.Util.msg($('#mainMsg'), 'SetMyInfo', error);
                } else {
                    // 重設資料
                    switch (DirectoryManager.system_position) {
                        case 'parent':
                            myself.ParentName = myname;
                            break;
                        case 'student':
                            myself.StudentName = myname;
                            break;
                        case 'teacher':
                            myself.TeacherName = myname;
                            break;
                    }

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
                    DirectoryManager.setMyInfo();
                }
                DirectoryManager.SaveStatus = true;
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
DirectoryManager.getProfile = function(obj) {
    var birthdate = '<li><i class="icon-gift" />' + (obj.Birthdate === 'not public' ? '未公開' : (obj.Birthdate || '')) + '</li>';
    var contact_phone = '<li><i class="icon-headphones" />' + (obj.ContactPhone === 'not public' ? '未公開' : (obj.ContactPhone || '')) + '</li>';
    var cell_phone = '<li><i class="icon-headphones" />' + (obj.CellPhone === 'not public' ? '未公開' : (obj.CellPhone || '')) + '</li>';
    var Email = '<li><i class="icon-envelope" />' + (obj.Email === 'not public' ? '未公開' : (obj.Email || '')) + '</li>';
    var contact_address = '<li><i class="icon-home" />' + (obj.ContactAddress === 'not public' ? '未公開' : (obj.ContactAddress || '')) + '</li>';
    var about_me = '<li class="my-profile">' + (obj.AboutMe === 'not public' ? '未公開' : (obj.AboutMe || '')) + '</li>';

    return (birthdate + contact_phone + cell_phone + Email + contact_address + about_me);
};

// 傳送訊息
DirectoryManager.sendMessage = function(e) {
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
                DirectoryManager.connection_msg.send({
                    service: "_.AddMessage",
                    body: '<Request><Record>' + request.join('') + '</Record></Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            if (that_msg_type === 'group-btn') {
                                $('.modal.in').modal('hide');
                            }
                            that_send_obj.button("reset");
                            DirectoryManager.Util.msg($(that_msg_id), 'AddMessage', error);
                        } else {
                            if (response.Result && response.Result.NewID) {
                                var receiverReq = [];
                                $(all_recipients).each(function(key, value) {
                                    receiverReq.push(
                                        '<Receiver>' +
                                            '<ProfileID>' + value + '</ProfileID>' +
                                            '<MessageID>' + response.Result.NewID + '</MessageID>' +
                                        '</Receiver>'
                                    );
                                });

                                DirectoryManager.connection_msg.send({
                                    service: "_.AddReceiver",
                                    body: '<Request>' + receiverReq.join('') + '</Request>',
                                    result: function (response, error, http) {
                                        if (error !== null) {
                                            if (that_msg_type === 'group-btn') {
                                                $('.modal.in').modal('hide');
                                            }
                                            that_send_obj.button("reset");
                                            DirectoryManager.Util.msg($(that_msg_id), 'AddReceiver', error);
                                        } else {
                                            if (that_msg_type === 'group-btn') {
                                                $('.modal.in').modal('hide');
                                            } else {
                                                $('div.popover').remove();
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

    // 取得收訊者 ProfileId, 及訊息
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
                var teacher = DirectoryManager.teacher;
                tmp_recipients.push(teacher.ProfileId);
                receiverID = teacher.ProfileId;
                break;

            case 'to_teachers':
                // 全校教師
                var teachers = DirectoryManager.teachers;
                $(teachers).each(function(index, item) {
                    if (item) {
                        tmp_recipients.push(item.ProfileId);
                    }
                });
                receiverName = '全校教師';
                break;

            case 'to_student':
                var student = DirectoryManager.student;
                tmp_recipients.push(student.ProfileId);
                receiverID = student.ProfileId;
                break;

            case 'to_family':
                if (n > 0) {
                    var parents = DirectoryManager.parents;
                    // 某學生所有親屬
                    $(parents).each(function(index, item) {
                        tmp_recipients.push(item.ProfileId);
                    })
                    var student = DirectoryManager.student;
                    receiverName = (student.StudentName || '') + '所有親屬';
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
                        receiverName = ($('#myTab li.active a').html() || '') + '所有學生';
                        break;
                    case 'p':
                        receiverName = ($('#myTab li.active a').html() || '') + '所有家長';
                        break;
                    case 'sp':
                        receiverName = ($('#myTab li.active a').html() || '') + '所有學生與家長';
                        break;
                }

                var students = DirectoryManager.students;
                if (kind === 's' || kind === 'sp') {
                    $(students).each(function(index, item){
                        if (item) {
                            tmp_recipients.push(item.ProfileId);
                        }
                    });
                }

                if (kind === 'p' || kind === 'sp') {
                    var studentlist = DirectoryManager.studentlist;
                    var kindId = studentlist.kindId;
                    var child = DirectoryManager.child;
                    var send = {};

                    if (kindId && studentlist.kind) {
                        if (studentlist.kind === 'group') {
                            switch (DirectoryManager.system_position) {
                                case 'parent':
                                    send.service = 'beta.GetDirectoryParent';
                                    send.body = {Kind: 'group', KindId: kindId, StudentId: child.StudentId};
                                    break;
                                case 'student':
                                    send.service = 'beta.GetDirectoryParent';
                                    send.body = {Kind: 'group', KindId: kindId, StudentId: child.StudentId};
                                    break;
                                case 'teacher':
                                    send.service = 'beta.GetStudentParent';
                                    send.body = {Kind: 'group', KindId: kindId};
                                    break;
                            }
                        }
                    }
                    // 某班級的全部家長 ProfileId or 某課程的全部家長 ProfileId
                    DirectoryManager.connection_cloud.send({
                        service: send.service,
                        body: send.body,
                        result: function (response, error, http) {
                            if (error !== null) {
                                that_send_obj.button("reset");
                                DirectoryManager.Util.msg($('#mySendMsg_Msg'), send.service, error);
                            } else {
                                $(response.Student).each(function(index, item) {
                                    $(item.Parent).each(function(index, item) {
                                        tmp_recipients.push(item.ProfileId);
                                    });
                                });
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