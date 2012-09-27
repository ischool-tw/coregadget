/// <reference path="../include/jquery-1.7.2.min.js"/>
var myparent = myparent || {};
myparent.public_connection;

$(document).ready(function () {
    $('a[data-toggle=modal]').bind('click', function () {
        $("div .control-group").removeClass("error");
        $(".help-inline").html("");
        if ($(this).attr("action-type") === "profile") {
            myparent.setParentInfo();
        } else {
            myparent.setRelationship();
        }
    });

    $("#editModal").modal({ show: false });

    $("#editModal").on("hidden", function () {
        return $("#editModal #errorMessage").html("");
    });

    $("#editModal").on("show", function () {
        return $("#editModal #save-data").button('reset');
    });

    $("#editModal #save-data").click(function () {
        $("div .control-group").removeClass("error");
        $(".help-inline").html("");
        $("#editModal #save-data").button('loading');
        var edit_target = $(this).attr("edit-target");
        switch (edit_target) {
            case "profile":
                var tmp_request = {
                    Name: $('#edit_Name').val(),
                    CellPhone: $('#edit_CellPhone').val(),
                    EMail: $('#edit_EMail').val()
                };

                myparent.parentInto.set_ParentInfo(tmp_request);
                break;
            case 'relationship':
                myparent.saveParentRelationship($('#ParentCode').val(), $('#IDNumber').val(), $('#Relationship').val());
                break;
        }
    });
});

myparent.parent_connection = gadget.getContract("auth.parent");

/* 設定關係 */
myparent.saveParentRelationship = function (parentCode, idNumber, relationship) {
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
                myparent.childrenList();
                $("#editModal").modal("hide");
            }
            $("#editModal #save-data").button('reset');
        }
    });
};

/* 關係表 */
myparent.childrenList = function () {
    //	parent_connection.ready(function () {
    myparent.parent_connection.send({
        service: 'My.Children',
        body: '',
        result: function (response, error, http) {
            if (error != null) {
                return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>\n</div>");

            } else {
                var tempHtml = '';
                $(response.Children.Child).each(function (index, item) {
                    tempHtml += '<tr>';
                    tempHtml += '<td>' + item.Name + '</td>';
                    tempHtml += '<td>' + item.ClassName + '</td>';
                    tempHtml += '<td>' + item.SeatNo + '</td>';
                    tempHtml += '<td>' + item.Relationship + '</td>';
                    tempHtml += '</tr>';
                });

                $('#childrenList tbody').html(tempHtml);
            }
        }
    });
    //	});

};

/* 個人資料 */
myparent.parentInto = function () {
    var funGetParentInfo = function () {
        myparent.parent_connection.send({
            service: 'My.GetPersonalInfo',
            body: '',
            result: function (response, error, http) {
                if (error != null) {
                    return $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>\n</div>");
                } else {
                    var tempHtml = '';
                    myparent.parentProfile = response.Parent;
                    $(response.Parent).each(function (index, item) {
                        tempHtml += '<tr><th>姓名</th><td><span>' + item.Name + ' </span></td></tr>';
                        tempHtml += '<tr><th>電話</th><td><span>' + item.CellPhone + ' </span></td></tr>';
                        tempHtml += '<tr><th>電子信箱</th><td><span >' + item.EMail + ' </span></td></tr>';
                        //自訂欄位 item.Extension.Field1
                    });

                    $('#parentProfile tbody').html(tempHtml);
                }
            }
        });
    };

    var funSetParentInfo = function (updateValue) {
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
                    funGetParentInfo();
                }
            }
        });
    };

    return {
        set_ParentInfo: function (updateValue) {
            funSetParentInfo(updateValue);
        },
        get_ParentInfo: function () {
            funGetParentInfo();
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
            '<input type="text" class="input-large" id="edit_Name" placeholder="姓名..." value="' + pProfile.Name + '">' +
            '<span class="help-inline"></span>' +
          '</div>' +
        '</div>' +
        '<div class="control-group">' +
          '<label class="control-label" for="edit_CellPhone">電話</label>' +
          '<div class="controls">' +
            '<input type="text" class="input-large" id="edit_CellPhone" placeholder="電話..." value="' + pProfile.CellPhone + '">' +
            '<span class="help-inline"></span>' +
          '</div>' +
        '</div>' +
        '<div class="control-group">' +
          '<label class="control-label" for="edit_EMail">電子信箱</label>' +
          '<div class="controls">' +
            '<input type="text" class="input-large" id="edit_EMail" placeholder="電子信箱..." value="' + pProfile.EMail + '">' +
            '<span class="help-inline"></span>' +
          '</div>' +
        '</div>' +
      '</fieldset>' +
    '</form>'

    $("#editModal h3").html("家長基本資料");
    $("#editModal .modal-body").html(tmp_editProfile);
    $("#editModal #save-data").attr("edit-target", "profile")
    $("#editModal").modal("show");
};

myparent.setRelationship = function () {
    var pProfile = myparent.parentProfile;
    var tmp_editProfile = '';
    tmp_editProfile = '<form class="form-horizontal">' +
      '<fieldset>' +
        '<div class="control-group">' +
          '<label class="control-label" for="ParentCode">請輸入家長代碼</label>' +
          '<div class="controls">' +
            '<input type="text" class="input-large" id="ParentCode" placeholder="家長代碼..." value="">' +
            '<span class="help-inline"></span>' +
          '</div>' +
        '</div>' +
        '<div class="control-group">' +
          '<label class="control-label" for="IDNumber">孩子身分證字號</label>' +
          '<div class="controls">' +
            '<input type="text" class="input-large" id="IDNumber" maxlength="10" placeholder="孩子身分證字號..." value="">' +
            '<span class="help-inline"></span>' +
          '</div>' +
        '</div>' +
        '<div class="control-group">' +
          '<label class="control-label" for="relationship">請輸入親子關係</label>' +
          '<div class="controls">' +
            '<input type="text" class="input-large" id="relationship" placeholder="親子關係..." value="">' +
            '<span class="help-inline"></span>' +
          '</div>' +
        '</div>' +
      '</fieldset>'
    '</form>'

    $("#editModal h3").html("設定帳號親屬關係");
    $("#editModal .modal-body").html(tmp_editProfile);
    $("#editModal #save-data").attr("edit-target", "relationship")
    $("#editModal").modal("show");
};


/* 取回基本資料、關係表 */
myparent.parent_connection.ready(function () {
    myparent.childrenList();
    myparent.parentInto.get_ParentInfo();
});