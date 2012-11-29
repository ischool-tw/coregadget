var _gg = _gg || {};
_gg.connection = gadget.getContract("campuslite.message");
_gg.tmp_msgs = [];
_gg.getdata = {
    loading : false,
    sender : {
        page_size : 10,
        get_send  : false,
        pageno    : 0,
        to_last   : false
    },
    receive : {
        page_size   : 10,
        get_receive : false,
        pageno      : 0,
        to_last     : false
    },
    preview : {
        msgid     : 0,
        profileid : 0,
        loading   : false,
        page_size : 30,
        pageno    : 0,
        to_last   : false
    }
};

jQuery(function () {
    _gg.getMySend();
    _gg.getMyReceiver();

    $('#boxlist').alternateScroll();
    $('#boxcontent').alternateScroll();

    $('.my-left').width('100%');
    $('#msgcontainer').hide();

    $('body')
        // TODO: 計算字數
        .on('keyup', '.my-message-input', function (event) {
            $(".my-message-word").html(140 - $(this).val().length);

            if (parseInt($(".my-message-word").html(), 10) < 0) {
                $(".my-message-word").css("color", "#f00");
                $(".my-message-button").addClass("disabled").attr("disabled", "disabled");
            }
            else if (parseInt($(".my-message-word").html(), 10) == 140) {
                $(".my-message-word").css("color", "#999");
                $(".my-message-button").addClass("disabled").attr("disabled", "disabled");
            }
            else {
                $(".my-message-word").css("color", "#999");
                $(".my-message-button").removeClass("disabled").removeAttr("disabled");
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

            _gg.getdata.preview.msgid = $(this).attr('msgid');
            _gg.getdata.preview.profileid = $(this).attr('profileid');

            // TODO: 設為已閱讀
            if ($(this).hasClass('my-unread')) {
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
            // $('.my-left').width('100%');
            // $('#msgcontainer').hide();
            loadMainData();
        })
        .on('mousewheel', 'div.alt-scroll-holder', function() {
            // $('.my-left').width('100%');
            // $('#msgcontainer').hide();
            loadMainData();
        });

    // TODO: 載入主要資料
    var loadMainData = function() {
        var box = $('#boxlist');
        var total_height = $(box).find('div.alt-scroll-holder').height();
        var scroll = $(box).find('div.alt-scroll-vertical-bar');
        var t = parseInt($(scroll).css('top'), 10);
        var h = $(scroll).height();

        if ( (total_height - (t + h)) <= 5 ) {
            var msgdata = _gg.getdata;

            if (msgdata.loading == false && (msgdata.sender.to_last == false || msgdata.receive.to_last == false)) {
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
                msgdata.sender.get_send = false; // 設為false，表示尚未讀取完成
                msgdata.receive.get_receive = false; // 設為false，表示尚未讀取完成
                _gg.getMySend();
                _gg.getMyReceiver();
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
        var total_height = $(box).find('div.alt-scroll-holder').height();
        var scroll = $(box).find('div.alt-scroll-vertical-bar');
        var t = parseInt($(scroll).css('top'), 10);
        var h = $(scroll).height();

        if ( (total_height - (t + h)) <= 5 ) {
            var msgdata = _gg.getdata.preview;

            if (msgdata.loading == false && msgdata.to_last == false) {
                msgdata.loading = true; // 設為ture，表示正在讀取中
                _gg.getMutualData();
            }
        }
    };
});

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case '501':
                        tmp_msg = '<strong>很抱歉，您無此權限!</strong>(' + serviceName + ')';
                        break;
                    default:
                        tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
                }
            } else {
                tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            }
        } else {
            tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
        }
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
    }
};

// TODO: 我發送的
_gg.getMySend = function() {
    _gg.sendmsgs = [];
    var msgdata = _gg.getdata.sender;

    // TODO: 到達最後一筆
    if (msgdata.to_last) {
        msgdata.get_send = true; // 設為true，表示讀取完成
        _gg.arrangeMsg();
    } else {
        var page_no = msgdata.pageno + 1;

        _gg.connection.send({
            service: "_.GetMySendMessage",
            body: '<Request><Pagination><StartPage>' + page_no + '</StartPage><PageSize>' + msgdata.page_size + '</PageSize></Pagination></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetMySendMessage', error);
                } else {
                    msgdata.pageno += 1;
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Messages : void 0) != null) {
                        $(response.Response.Messages).each(function(index, item) {
                            item.tmp_index = index;
                            item.kind = 'sender';
                            _gg.sendmsgs.push(item);
                        });
                        if (_gg.sendmsgs.length < msgdata.page_size) {
                            // TODO: 到達最後一筆
                            msgdata.to_last = true;
                        }
                    } else {
                        // TODO: 到達最後一筆
                        msgdata.to_last = true;
                    }
                    msgdata.get_send = true;
                    _gg.arrangeMsg();
                }
            }
        });
    }
};

// TODO: 我接收的
_gg.getMyReceiver = function() {
    _gg.receivemsgs = [];
    var msgdata = _gg.getdata.receive;

    // TODO: 到達最後一筆
    if (msgdata.to_last) {
        msgdata.get_receive = true; // 設為true，表示讀取完成
        _gg.arrangeMsg();
    } else {
        var page_no = msgdata.pageno + 1;

        _gg.connection.send({
            service: "_.GetReceiverMessage",
            body: '<Request><Pagination><StartPage>' + page_no + '</StartPage><PageSize>' + msgdata.page_size + '</PageSize></Pagination></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetReceiverMessage', error);
                } else {
                    msgdata.pageno += 1;
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Messages : void 0) != null) {
                        $(response.Response.Messages).each(function(index, item) {
                            item.tmp_index = index;
                            item.kind = 'receive';
                            _gg.receivemsgs.push(item);
                        });
                        if (_gg.receivemsgs.length < msgdata.page_size) {
                            // TODO: 到達最後一筆
                            msgdata.to_last = true;
                        }
                    } else {
                        // TODO: 到達最後一筆
                        msgdata.to_last = true;
                    }
                    msgdata.get_receive = true;
                    _gg.arrangeMsg();
                }
            }
        });
    }
};

// TODO: 設為已閱讀
_gg.setStatus = function() {
    var msgid = _gg.getdata.preview.msgid;
    if (msgid) {
        _gg.connection.send({
            service: "_.UpdateStatus",
            body: '<Request><Receiver><Condition><MessageID>' + msgid + '</MessageID></Condition></Receiver></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'UpdateStatus', error);
                } else {
                    $('#boxlist li[msgid=' + msgid + ']').removeClass('my-unread');
                }
            }
        });
    }
};

// TODO: 重新編排訊息資料(所有)
_gg.arrangeMsg = function() {
    var msgdata =  _gg.getdata;
    if (msgdata.sender.get_send && msgdata.receive.get_receive) {
        var items = _gg.sendmsgs.concat(_gg.receivemsgs, _gg.tmp_msgs); // 將上次未呈現的和本次抓取的合併
        items.sort($.by('desc', 'MessageID'));

        // TODO: 是否有一邊到達最大筆數，開始暫存
        var gotoTemp = false;
        var ret = [];

        $(items).each(function(index, item) {
            // TODO: 有一邊到達最後一筆，記錄到達的是哪一邊，剩下的暫存，不顯示
            if (item.tmp_index === msgdata.page_size) {
                gotoTemp = true;
            }

            if (gotoTemp) {
                item.tmp_index = -1;
                _gg.tmp_msgs.push(item);
            } else {
                var read_css = '';
                if (item.ReadStatus === '0') {
                    read_css =' class="my-unread"';
                }

                var senddate = item.LastUpdate || '';
                if (senddate) {
                    senddate = $.ISODateString(new Date($.parseDate(senddate)));
                }

                var mark = '', title_name, profileid = '';
                if (item.kind === 'sender') {
                    // TODO: 顯示照片用，取得收件者 profileid
                    profileid = (item.ReceiverID || '');
                    title_name = (item.ReceiverName || '&nbsp;');
                    mark = '我：';
                } else {
                    // TODO: 顯示照片用，取得寄件者 profileid
                    profileid = (item.SenderID || '');
                    title_name = (item.SenderName || '&nbsp;');
                }

                ret.push(
                    '<li' + read_css + ' msgid="' + (item.MessageID || '') + '" kind="' + (item.kind || '') + '" profileid="' + profileid + '">' +
                    '    <a href="javascript:void(0);">' +
                    '    <dl>' +
                    '        <dt>' +
                    '            <div class="my-msgtitle">' + title_name + '</div>' +
                    '            <div class="pull-right">' +
                    '                <time class="timeago" datetime="' + senddate + '"></time>' +
                    '            </div>' +
                    '        </dt>' +
                    '        <dd>' +
                    mark + $.htmlEncode((item.Message) || '&nbsp;') +
                    '        </dd>' +
                    '    </dl>' +
                    '    </a>' +
                    '</li>'
                );
            }
        });

        $('#boxlist .my-msglist li.loading').remove();
        $('#boxlist .my-msglist ul').append(ret.join(''));
        $('#boxlist .timeago').timeago();
        msgdata.loading = false;
    }
};

// TODO: 雙方互傳的標題處理
_gg.getMutualTitle = function() {
    var msgid = _gg.getdata.preview.msgid;
    if (msgid) {
        var source = $('#boxlist li[msgid=' + msgid + ']');

        // TODO: 標題資料
        var title_txt = $(source).find('.my-msgtitle').html();
        var msg_txt = $(source).find('dd').html();
        $('#msgcontainer div.my-msgboxtitle')
            .find('img').attr('src', 'css/images/nophoto.png')
            .end().find('li:eq(0)').html(title_txt);

        var profileid = _gg.getdata.preview.profileid;

        if (profileid) {
            _gg.connection.send({
                service: "_.GetProfile",
                body: '<Request><Condition><ProfileID>' + profileid + '</ProfileID></Condition></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#mainMsg', 'GetProfile', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Response) != null ? _ref.Profile : void 0) != null) {
                            $(response.Response.Profile).each(function(index, item) {
                                if (item.Photo) {
                                    $('#msgcontainer div.my-msgboxtitle img').attr('src', 'data:image/png;base64,' + item.Photo);
                                }
                                $('#msgcontainer div.my-msgboxtitle li:eq(1)').html($.htmlEncode(item.Tagline || ''));
                            });
                        }
                    }
                }
            });
        }

        // TODO: 展開視窗
        $('.my-left').width('39%');
        $('#msgcontainer').show();
    }
};

// TODO: 取得雙方互傳的內容
_gg.getMutualData = function() {
    var msgdata = _gg.getdata.preview;
    var msgid = msgdata.msgid;
    if (msgid) {
        var page_no = msgdata.pageno + 1;

        _gg.connection.send({
            service: "_.GetMutualMessage",
            body: '<Request><Condition><MessageID>' + msgid + '</MessageID></Condition><Pagination><StartPage>' + page_no + '</StartPage><PageSize>' + msgdata.page_size + '</PageSize></Pagination></Request>',

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
                                    ret.push('<div class="my-date">▲ ' + item_date + '</div>');
                                }
                            }


                            var css_name1, css_name2;

                            if (item.Kind === 'sender') {
                                css_name1 = 'my-transmit';
                                css_name2 = ' left';
                            } else {
                                css_name1 = 'my-recrive';
                                css_name2 = ' right';
                            }

                            var read_css = '';
                            if (item.ReadStatus === '0') {
                                read_css =' my-unread';
                            }

                            ret.push(
                                '<div class="' + css_name1 + read_css + '">' +
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
                    $('#boxcontent div.my-mutualmsg').append(ret.join(''));
                    msgdata.loading = false;
                }
            }
        });

    }
};

// TODO: 傳送訊息
_gg.sendMessage = function(e) {
    var msgid = _gg.getdata.preview.msgid;
    var that_send_obj = $(e); // 送出鈕物件
    var that_msg_obj = $('#mySendMsg_errorMessage'); // 錯誤訊息物件
    that_msg_obj.html('');

    // TODO: 取得收訊者 ProfileID, 及訊息
    var content = $('textarea.my-message-input').val();

    if (content) {
        var receiverID = _gg.getdata.preview.profileid;

        var request = [];
        request.push(
            '<Browser><![CDATA[' + $.param(jQuery.browser, false) + ']]></Browser>' +
            '<Message><![CDATA[' + content + ']]></Message>' +
            '<ReceiverID>' + receiverID + '</ReceiverID>'
        );

        if (!receiverID) {
            that_send_obj.button("reset");
            that_msg_obj.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  收訊者資料不正確，目前無法傳送！\n</div>")
        } else {
            // TODO: 開始傳送
            _gg.connection.send({
                service: "_.AddMessage",
                body: '<Request><Record>' + request.join('') + '</Record></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        that_send_obj.button("reset");
                        _gg.set_error_message(that_msg_id, 'AddMessage', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Result) != null ? _ref.NewID : void 0) != null) {
                            var receiverReq = [];
                            var NewID = response.Result.NewID;
                            receiverReq.push(
                                '<Receiver>' +
                                    '<ProfileID>' + receiverID + '</ProfileID>' +
                                    '<MessageID>' + response.Result.NewID + '</MessageID>' +
                                '</Receiver>'
                            );

                            _gg.connection.send({
                                service: "_.AddReceiver",
                                body: '<Request>' + receiverReq.join('') + '</Request>',
                                result: function (response, error, http) {
                                    if (error !== null) {
                                        that_send_obj.button("reset");
                                        _gg.set_error_message(that_msg_id, 'AddReceiver', error);
                                    } else {
                                        that_send_obj.button("reset");
                                        $('div.my-successMessage').html('<div class="alert alert-success">\n  傳送成功！\n</div>');
                                        setTimeout("$('div.my-successMessage').html('')", 1500);
                                        $(".my-message-word").html(140);
                                        $('.my-message-input').val('');
                                        $(".my-message-button").addClass("disabled").attr("disabled", "disabled");


                                        // TODO: 新增左方訊息
                                        var senddate = $.ISODateString(new Date());
                                        var mark = '我：';
                                        var title_name = $('#boxlist li[msgid=' + msgid + '] div.my-msgtitle').html();

                                        var ret = [];
                                        ret.push(
                                            '<li msgid="' + (NewID || '') + '" kind="sender" profileid="' + receiverID + '">' +
                                            '    <a href="javascript:void(0);">' +
                                            '    <dl>' +
                                            '        <dt>' +
                                            '            <div class="my-msgtitle">' + title_name + '</div>' +
                                            '            <div class="pull-right">' +
                                            '                <time class="timeago" datetime="' + senddate + '"></time>' +
                                            '            </div>' +
                                            '        </dt>' +
                                            '        <dd>' +
                                            mark + (content || '&nbsp;') +
                                            '        </dd>' +
                                            '    </dl>' +
                                            '    </a>' +
                                            '</li>'
                                        );
                                        $('#boxlist .my-msglist ul').prepend(ret.join(''));
                                    }
                                }
                            });

                        }
                    }
                }
            });
        }

    } else {
        that_send_obj.button("reset");
        that_msg_obj.html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  請填入訊息內容！\n</div>")
    }
};