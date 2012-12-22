var _gg = _gg || {};
_gg.connection = gadget.getContract("campuslite.message");
_gg.tmp_msgs = [];
_gg.getdata = {
    members : {
        page_size : 18,
        loading   : false,
        pageno    : 0,
        to_last   : false
    },
    preview : {
        member_id   : 0,
        member_name : '',
        loading     : false,
        page_size   : 30,
        pageno      : 0,
        to_last     : false
    }
};

jQuery(function () {
    _gg.getMemberList();
    $('button.my-message-button').prop('disabled', true);

    $('#boxlist').alternateScroll();
    $('#boxcontent').alternateScroll();

    $('body')
        // TODO: 計算字數
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
        // TODO: 送出訊息
        .on('click', '.my-message-button', function() {
            $(this).button("loading");
            var that = this;
            _gg.sendMessage(that);
        });

    $('#boxlist')
        // TODO: 點選後處理
        .on('click', 'li', function() {
            $('#boxlist li.active').removeClass('active');
            $(this).addClass('active');

            _gg.getdata.preview.member_id = $(this).attr('memberid');
            _gg.getdata.preview.member_name = $(this).attr('membername');
            $('#msgcontainer ul li:eq(0)').html(_gg.getdata.preview.member_name);

            // TODO: 設為已閱讀
            if ($(this).hasClass('my-unread')) {
                $(this).removeClass('my-unread');
                _gg.setStatus();
            }

            $('#boxcontent div.my-mutualmsg').html('');

            var msgdata = _gg.getdata.preview;
            msgdata.loading = true; // 設為ture，表示正在讀取中
            msgdata.pageno = 0; // 重0開始
            msgdata.to_last = false; // 設為false表示尚未到達最後一筆
            _gg.getMutualTitle();
            _gg.getMutualData();
        })
        // TODO: infinite scroll，捲到底
        .on('drag', 'div.alt-scroll-vertical-bar', function() {
            loadMainData();
        })
        .on('mousewheel', 'div.alt-scroll-holder', function() {
            loadMainData();
        });

    // TODO: 載入主要資料
    var loadMainData = function() {
        var box = $('#boxlist');
        var total_height = box.find('div.alt-scroll-holder').height();
        var scroll = box.find('div.alt-scroll-vertical-bar');
        var t = parseInt(scroll.css('top'), 10);
        var h = scroll.height();

        if ( (total_height - (t + h)) <= 5 ) {
            var msgdata = _gg.getdata.members;

            if (msgdata.loading == false && msgdata.to_last == false) {
                $('#boxlist .my-msglist ul').append(
                    '<li class="loading">' +
                    '    <dl>' +
                    '        <dt>' +
                    '            <div class="my-msgtitle">載入中...</div>' +
                    '        </dt>' +
                    '    </dl>' +
                    '</li>'
                );

                msgdata.loading = true; // 設為ture，表示正在讀取中
                _gg.getMemberList();
            }
        }
    };

    $('#boxcontent')
        // TODO: infinite scroll，捲到底
        .on('drag', 'div.alt-scroll-vertical-bar', function() {
            loadMutualData();
        })
        .on('mousewheel', 'div.alt-scroll-holder', function() {
            loadMutualData();
        });

    // TODO: 載入雙方溝通資料
    var loadMutualData = function() {
        var box = $('#boxcontent');
        var total_height = box.find('div.alt-scroll-holder').height();
        var scroll = box.find('div.alt-scroll-vertical-bar');
        var t = parseInt(scroll.css('top'), 10);
        var h = scroll.height();

        if ( (total_height - (t + h)) <= 5 ) {
            var msgdata = _gg.getdata.preview;

            if (msgdata.loading == false && msgdata.to_last == false) {
                msgdata.loading = true; // 設為ture，表示正在讀取中
                _gg.getMutualData();
            }
        }
    };
});

// TODO: 人員清單
_gg.getMemberList = function() {
    var msgdata = _gg.getdata.members;
    var page_no = msgdata.pageno + 1;

    _gg.connection.send({
        service: "_.GetMemberList",
        body: '<Request><Pagination><StartPage>' + page_no + '</StartPage><PageSize>' + msgdata.page_size + '</PageSize></Pagination></Request>',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetMemberList', error);
            } else {
                msgdata.pageno += 1;
                var _ref, ret = [];
                if (((_ref = response.Response) != null ? _ref.Messages : void 0) != null) {
                    $(response.Response.Messages).each(function(index, item) {
                        var read_css = '';
                        if (item.ReadStatus === '0') {
                            read_css =' class="my-unread"';
                        }

                        var senddate = item.LastUpdate || '';
                        if (senddate) {
                            senddate = $.ISODateString(new Date($.parseDate(senddate)));
                        }

                        var membername = '', memberid = '';
                        if (item.MemberID) {
                            memberid = item.MemberID;
                            membername = (item.MemberName || '&nbsp;');
                        } else {
                            memberid = '0';
                            membername = (item.ReceiverName || '&nbsp;');
                        }


                        ret.push(
                            '<li' + read_css + ' memberid="' + memberid + '" membername="' + membername + '">' +
                            '    <a href="javascript:void(0);">' +
                            '    <dl>' +
                            '        <dt>' +
                            '            <div class="my-msgtitle">' + membername + '</div>' +
                            '            <div class="pull-right">' +
                            '                <time class="timeago" datetime="' + senddate + '"></time>' +
                            '            </div>' +
                            '        </dt>' +
                            '    </dl>' +
                            '    </a>' +
                            '</li>'
                        );

                    });
                    if (ret.length < msgdata.page_size) {
                        // TODO: 到達最後一筆
                        msgdata.to_last = true;
                    }
                } else {
                    if (page_no === 1) {
                        $('#boxlist .my-msglist').html('<p>目前無資料</p>');
                        $('textarea.my-message-input').prop('disabled', true);
                    }
                    // TODO: 到達最後一筆
                    msgdata.to_last = true;
                }
                $('#boxlist .my-msglist li.loading').remove();
                $('#boxlist .my-msglist ul').append(ret.join(''));
                $('#boxlist .timeago').timeago();
                msgdata.loading = false;
                if (page_no === 1) {
                    $('#boxlist .my-msglist ul li:eq(0)').trigger('click');
                }
            }
        }
    });
};

// TODO: 所有互傳訊息設為已閱讀
_gg.setStatus = function() {
    var memberid = _gg.getdata.preview.member_id;
    if (memberid) {
        if (memberid !== '0')
        _gg.connection.send({
            service: "_.UpdateStatus",
            body: '<Request><Receiver><Condition><SenderID>' + memberid + '</SenderID></Condition></Receiver></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'UpdateStatus', error);
                }
            }
        });
    }
};

// TODO: 雙方互傳的標題處理
_gg.getMutualTitle = function() {
    var memberid = _gg.getdata.preview.member_id;
    if (memberid === '0') {
        // TODO: 標題資料
        $('#msgcontainer div.my-msgboxtitle img').attr('src', 'css/images/nophoto.png');
        $('#msgcontainer div.my-msgboxtitle li:eq(1)').html('');
    } else {
        _gg.connection.send({
            service: "_.GetProfile",
            body: '<Request><Condition><ProfileID>' + memberid + '</ProfileID></Condition></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetProfile', error);
                    $('#msgcontainer div.my-msgboxtitle img').attr('src', 'css/images/nophoto.png');
                    $('#msgcontainer div.my-msgboxtitle li:eq(1)').html('');
                } else {
                    var _ref, _img = 'css/images/nophoto.png', _tagline= '';
                    if (((_ref = response.Response) != null ? _ref.Profile : void 0) != null) {
                        $(response.Response.Profile).each(function(index, item) {
                            if (item.Photo) {
                                _img = 'data:image/png;base64,' + item.Photo;
                            }
                            _tagline = $.htmlEncode(item.Tagline || '');
                        });
                    }

                    $('#msgcontainer div.my-msgboxtitle img').attr('src', _img);
                    $('#msgcontainer div.my-msgboxtitle li:eq(1)').html(_tagline);
                }
            }
        });

    }
};

// TODO: 取得雙方互傳的內容
_gg.getMutualData = function() {
    var msgdata = _gg.getdata.preview;
    var memberid = msgdata.member_id;
    if (memberid) {
        var page_no = msgdata.pageno + 1;

        _gg.connection.send({
            service: "_.GetMutualMessage",
            body: '<Request><Condition>' +
                    '<ReceiverID>' + memberid + '</ReceiverID>' +
                    '<ReceiverName>' + (msgdata.member_name || '') + '</ReceiverName>' +
                    '</Condition>' +
                    '<Pagination><StartPage>' + page_no + '</StartPage>' +
                    '<PageSize>' + msgdata.page_size + '</PageSize></Pagination></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetMutualMessage', error);
                } else {
                    msgdata.pageno += 1;

                    var _ref, ret = [];
                    if (((_ref = response.Response) != null ? _ref.Messages : void 0) != null) {
                        var prev_date = '';
                        $(response.Response.Messages).each(function(index, item) {
                            if (prev_date && item.LastUpdate) {
                                var prev_y = parseInt($.formatDate($.parseDate(prev_date), 'yyyy'), 10);
                                var prev_m = parseInt($.formatDate($.parseDate(prev_date), 'M'), 10);
                                var item_y = parseInt($.formatDate($.parseDate(item.LastUpdate), 'yyyy'), 10);
                                var item_m = parseInt($.formatDate($.parseDate(item.LastUpdate), 'M'), 10);

                                var item_date = ($.formatDate($.parseDate(item.LastUpdate), 'yyyyMMdd')).replace(/\//ig, '-');

                                if ((prev_y !== item_y) || (prev_m !== item_m)) {
                                    ret.push('<div class="my-date">▼ ' + item_date + '</div>');
                                }
                            }


                            var css_name1, css_name2;

                            if (item.Kind === 'send') {
                                css_name1 = 'my-transmit';
                                css_name2 = ' left';
                            } else {
                                css_name1 = 'my-recrive';
                                css_name2 = ' right';
                            }

                            ret.push(
                                '<div class="' + css_name1 + '">' +
                                '    <div class="popover' + css_name2 + '">' +
                                '        <div class="arrow"></div>' +
                                '        <div class="popover-title my-time">' +
                                (item.LastUpdate || '') +
                                '        </div>' +
                                '        <div class="popover-content">' +
                                '            <p>' + $.htmlEncode((item.Message) || '') + '</p>' +
                                '        </div>' +
                                '    </div>' +
                                '</div>'
                            );

                            prev_date = item.LastUpdate;
                        });

                        if (ret.length < msgdata.page_size) {
                            // TODO: 到達最後一筆
                            msgdata.to_last = true;
                        }
                    } else {
                        // TODO: 到達最後一筆
                        msgdata.to_last = true;
                    }
                    if (page_no === 1) {
                        $('#boxcontent div.my-mutualmsg').html('');
                    }
                    $('#boxcontent div.my-mutualmsg').append(ret.join(''));
                    msgdata.loading = false;
                }
            }
        });

    }
};

// TODO: 傳送訊息
_gg.sendMessage = function(e) {
    var that_send_obj = $(e); // 送出鈕物件
    var that_msg_obj = $('#mainMsg'); // 錯誤訊息物件
    that_msg_obj.html('');

    var begin_send = function() {
        var _request = request.join('');
        if (_request) {
            // TODO: 開始傳送
            _gg.connection.send({
                service: "_.AddMessage",
                body: '<Request><Record>' + _request + '</Record></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        that_send_obj.button("reset");
                        _gg.set_error_message(that_msg_id, 'AddMessage', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Result) != null ? _ref.NewID : void 0) != null) {
                            var receiverReq = [];
                            var NewID = response.Result.NewID;
                            if (receiverID === '0') {
                                $(receivers).each(function(index, item) {
                                    receiverReq.push(
                                        '<Receiver>' +
                                            '<ProfileID>' + item.ReceiverID + '</ProfileID>' +
                                            '<MessageID>' + NewID + '</MessageID>' +
                                        '</Receiver>'
                                    );
                                });
                            } else {
                                receiverReq.push(
                                    '<Receiver>' +
                                        '<ProfileID>' + receiverID + '</ProfileID>' +
                                        '<MessageID>' + NewID + '</MessageID>' +
                                    '</Receiver>'
                                );
                            }

                            that_send_obj.button("reset");
                            _gg.connection.send({
                                service: "_.AddReceiver",
                                body: '<Request>' + receiverReq.join('') + '</Request>',
                                result: function (response, error, http) {
                                    if (error !== null) {
                                        _gg.set_error_message(that_msg_id, 'AddReceiver', error);
                                    } else {
                                        that_msg_obj.html('<div class="alert alert-success">\n  傳送成功！\n</div>');
                                        setTimeout("$('#mainMsg').html('')", 1500);

                                        // TODO: 新增右方訊息
                                        var senddate = $.ISODateString(new Date());
                                        var _text = '' +
                                            '<div class="my-transmit">' +
                                            '    <div class="popover left">' +
                                            '        <div class="arrow"></div>' +
                                            '        <div class="popover-title my-time">' +
                                            senddate +
                                            '        </div>' +
                                            '        <div class="popover-content">' +
                                            '            <p>' + $.htmlEncode(content || '') + '</p>' +
                                            '        </div>' +
                                            '    </div>' +
                                            '</div>';
                                        $('#boxcontent div.my-mutualmsg').prepend(_text);

                                        $(".my-message-word").html(140);
                                        $('.my-message-input').val('');
                                        that_send_obj.attr('disabled', 'disabled')
                                    }
                                }
                            });

                        }
                    }
                }
            });
        } else {
            that_send_obj.button("reset");
            that_msg_obj.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  收訊者資料不正確，目前無法傳送！\n</div>")
        }
    };

    // TODO: 取得收訊者 MemberID, 及訊息
    var content = $('textarea.my-message-input').val();

    if (content) {
        var receiverID = _gg.getdata.preview.member_id;
        var receivers;
        var request = [];
        request.push(
            '<Browser><![CDATA[' + $.param(jQuery.browser, false) + ']]></Browser>' +
            '<Message><![CDATA[' + content + ']]></Message>'
        );

        if (receiverID === '0') {
            // TODO: 寄送群組信件
            var member_name = (_gg.getdata.preview.member_name || '');
            if (member_name) {
                _gg.connection.send({
                    service: "_.GetGroupConsignee",
                    body: '<Request><Condition><ReceiverName>' + member_name + '</ReceiverName></Condition></Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            _gg.set_error_message('#mainMsg', 'GetGroupConsignee', error);
                        } else {
                            var _ref;
                            if (((_ref = response.Response) != null ? _ref.Receiver : void 0) != null) {
                                request.push('<ReceiverName>' + member_name + '</ReceiverName>');
                                receivers = response.Response.Receiver;
                                begin_send();
                            }
                        }
                    }
                });
            }
        } else {
            request.push('<ReceiverID>' + receiverID + '</ReceiverID>');
            begin_send();
        }

    } else {
        that_send_obj.button("reset");
        that_msg_obj.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  請填入訊息內容！\n</div>")
    }
};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case '501':
                        tmp_msg = '<strong>很抱歉，您無此權限!</strong>(' + serviceName + ')';
                        break;
                }
            }
        }
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
        $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
    }
};