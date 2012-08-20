/// <reference path="../include/jquery-1.7.2.min.js"/>
var myparent = myparent || {};
myparent.public_connection;

$(document).ready(function () {
    $('#send').bind('click', function () {
        $("div .control-group").removeClass("error");
        $(".help-inline").html("");
        myparent.setParentRelationship($('#ParentCode').val(), $('#IDNumber').val(), $('#Relationship').val());
    });

    $('#parentProfile .btn').live('click', function () {
        myparent.setParentInfo();
    });

    $("#editModal").modal({ show: false });

    $("#editModal").on("hidden", function () {
        return $("#editModal #errorMessage").html("");
    });

    $("#editModal").on("show", function () {
        return $("#editModal #save-data").show();
    });

    $("#editModal #save-data").click(function () {
        var edit_target;
        $("#editModal #save-data").hide();
        edit_target = $(this).attr("edit-target");
        switch (edit_target) {
            case "profile":
                var tmp_request = {
                    Name: $('#edit_Name').val(),
                    CellPhone: $('#edit_CellPhone').val(),
                    EMail: $('#edit_EMail').val()
                };

                myparent.parentInto.set_ParentInfo('#parentProfile', tmp_request);
                break;
        }
    });
});

myparent.parent_connection = gadget.getContract("auth.parent");

/* 設定關係 */
myparent.setParentRelationship = function (parentCode, idNumber, relationship) {
    myparent.public_connection = gadget.getContract("parentguest");
    myparent.public_connection.send({
        service: 'Parent.SetParentRelationship',
        body: {
            Request: {
                ParentCode: parentCode,
                IDNumber: idNumber,
                Relationship: relationship
            }
        },
        result: function (response, error, http) {
            if (error != null) {
                switch (error.dsaError.header.DSFault.Fault.Code) {
                    case '001': //家長代碼或身分證號不正確
                        $('#ParentCode, #IDNumber')
                            .parent().parent().addClass("error")
                            .find(".help-inline").html(error.dsaError.message);
                        $('#ParentCode').focus();
                        break;
                    case '002': //此代碼已經設定過了
                        $('#ParentCode')
                            .focus()
                            .parent().parent().addClass("error")
                            .find(".help-inline").html(error.dsaError.message);
                        break;
                    case '003': //與家長建立關聯時發生錯誤
                        $('#errorMessage').html('<div class="alert alert-error"><a class="close" data-dismiss="alert">×</a><strong>設定失敗！</strong> 與家長建立關聯時發生錯誤</div>');
                        break;
                    default:
                        $('#errorMessage').html('<div class="alert alert-error"><a class="close" data-dismiss="alert">×</a><strong>設定失敗！</strong> ' + error.dsaError.message + '</div>');
                }
            } else {
                    myparent.childrenList('#childrenList');
                    $('#mainMsg').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">×</a><strong>設定成功！</strong> </div>');
            }
        }
    });
};

/* 關係表 */
myparent.childrenList = function (e) {
    //	parent_connection.ready(function () {
    myparent.parent_connection.send({
        service: 'My.Children',
        body: '',
        result: function (response, error, http) {
            if (error != null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>\n</div>");

            } else {
                var tempHtmlA = '', tempHtmlB = '', tempHtml = '';
                $(response.Children.Child).each(function (index, item) {
                    tempHtml += '<tr>';
                    tempHtml += '<td>' + item.Name + '</td>';
                    tempHtml += '<td>' + item.ClassName + '</td>';
                    tempHtml += '<td>' + item.SeatNo + '</td>';
                    tempHtml += '<td>' + item.Relationship + '</td>';
                    tempHtml += '</tr>';
                });

                tempHtmlA = '<div class="well">' +
                    '<table class="table table-condensed table-striped"><thead><tr><th>姓名</th><th>班級</th><th>座號</th><th>關係</th></tr></thead>';
                tempHtmlA += '<tbody>';
                tempHtmlB = '</tbody></table></div>';

                $(e).html(tempHtmlA + tempHtml + tempHtmlB);
            }
        }
    });
    //	});

};

/* 個人資料 */
myparent.parentInto = function () {
    var funSetParentInfo = function (e, updateValue) {
        myparent.parent_connection.send({
            service: 'My.UpdatePersonalInfo',
            body: {
                Request: {
                    Parent: updateValue
                }
            },
            result: function (response, error, http) {
                if (error != null) {
                    return $("#editModal #errorMessage").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>\n</div>");
                } else {
                    $("#editModal").modal("hide");
                    funGetParentInfo(e);
                }
            }
        });
    };

    var funGetParentInfo = function (e) {
        myparent.parent_connection.send({
            service: 'My.GetPersonalInfo',
            body: '',
            result: function (response, error, http) {
                if (error != null) {
                    return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>\n</div>");
                } else {
                    var tempHtmlA = '', tempHtmlB = '', tempHtml = '';
                    myparent.parentProfile = response.Parent;
                    $(response.Parent).each(function (index, item) {
                        tempHtml += '<tr><th>姓名</th><td><span>' + item.Name + ' </span></td></tr>';
                        tempHtml += '<tr><th>電話</th><td><span>' + item.CellPhone + ' </span></td></tr>';
                        tempHtml += '<tr><th>電子信箱</th><td><span >' + item.EMail + ' </span></td></tr>';
                        //自訂欄位 item.Extension.Field1
                    });

                    tempHtmlA = '<div class="well"><table class="table table-condensed table-striped">' +
                                '<div class="my-label-title"><a class="btn btn-success" edit-target="profile">' +
                                '<i class="icon-edit icon-white"></i>個人資料</a> </div>'
                    tempHtmlB = '</table></div>';

                    $(e).html(tempHtmlA + tempHtml + tempHtmlB);
                }
            }
        });
    };

    return {
        set_ParentInfo: function (e, updateValue) {
            funSetParentInfo(e, updateValue);
        },
        get_ParentInfo: function (e) {
            funGetParentInfo(e);
        }
    };
} ();


myparent.setParentInfo = function () {
    var pProfile = myparent.parentProfile;
    var tmp_editProfile = '';
    tmp_editProfile = '<form class="form-horizontal">' +
      '<fieldset>' +
        '<div class="control-group">' +
          '<label class="control-label" for="edit_Name">姓名</label>' +
          '<div class="controls">' +
            '<input type="text" class="input-large" id="edit_Name" value="' + pProfile.Name + '">' +
          '</div>' +
        '</div>' +
        '<div class="control-group">' +
          '<label class="control-label" for="edit_CellPhone">電話</label>' +
          '<div class="controls">' +
            '<input type="text" class="input-large" id="edit_CellPhone" value="' + pProfile.CellPhone + '">' +
          '</div>' +
        '</div>' +
        '<div class="control-group">' +
          '<label class="control-label" for="edit_EMail">電子信箱</label>' +
          '<div class="controls">' +
            '<input type="text" class="input-large" id="edit_EMail" value="' + pProfile.EMail + '">' +
          '</div>' +
        '</div>' +
      '</fieldset>' +
    '</form>'

    $("#editModal h3").html("編輯 - 個人資料");
    $("#editModal .modal-body").html(tmp_editProfile);
    $("#editModal #save-data").attr("edit-target", "profile")
    $("#editModal").modal("show");
};


/* 取回基本資料、關係表 */
myparent.parent_connection.ready(function () {
    myparent.childrenList('#childrenList');
    myparent.parentInto.get_ParentInfo('#parentProfile');
});