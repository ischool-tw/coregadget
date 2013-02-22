var _gg = _gg || {};
_gg.connection = gadget.getContract("campuslite.directory.parent");

jQuery(function () {
    var vm = new MyViewModel();
    ko.applyBindings(vm);

    $('#myModal').on('hidden', function () {
        $('#errorMessage').html('');
        $('#myModal input:text').val('');
    });


    // TODO: 預設輸入代碼為focus
    $('#inputCode').focus();

    // TODO: 代碼確認
    $('#save-data').bind('click', function() {
        $('#errorMessage').html('');
        if ($('#inputCode').val() && $('#relationship').val()) {
            $(this).button("loading");
            vm.setAccount();
        } else {
            $('#inputCode').focus().addClass('error');
            if (!($('#inputCode').val())) {
                $('#errorMessage').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  請輸入代碼！\n</div>");
            } else {
                $('#errorMessage').html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  請輸入稱謂！\n</div>");
            }
        }
    });
});

var MyViewModel = function() {
    var self = this;
    self.children = ko.observableArray();

    // TODO: 建立帳號關連
    self.setAccount = function() {
        var code = $('#inputCode').val();
        var relationship = $('#relationship').val();
        if (code && relationship) {
            gadget.getContract("auth.guest").send({
                service: "Join.AsParent",
                body: '<Request><ParentCode>' + code + '</ParentCode><Relationship>' + relationship + '</Relationship></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        _gg.set_error_message('#errorMessage', 'Join.AsParent', error);
                        $('#save-data').button("reset");
                    } else {
                        self.getChildren();
                        $("#save-data").button("reset");
                        $('#mainMsg').html("<div class='alert alert-success'>\n  儲存成功！\n</div>");
                        setTimeout("$('#mainMsg').html('')", 1500);
                        $('#myModal').modal('hide');
                    }
                }
            });
        }
    };


    // TODO: 關係表
    self.getChildren = function() {
        self.children.removeAll();
        gadget.getContract("auth.parent").send({
            service: 'My.Children',
            body: '',
            result: function (response, error, http) {
                if (error != null) {
                    _gg.set_error_message('#errorMessage', 'My.Children', error);
                } else {
                    var _ref;
                    if (((_ref = response.Children) != null ? _ref.Child : void 0) != null) {
                        $(response.Children.Child).each(function(index, item) {
                            self.children.push(item);
                        });
                    }
                }
            }
        });
    };

    self.getChildren();
}

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                if (error.dsaError.message) {
                    tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
                }
            }
        }
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
        $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
    }
};