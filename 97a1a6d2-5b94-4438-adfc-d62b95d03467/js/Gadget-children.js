/// <reference path="../include/jquery-1.7.2.min.js"/>
var myparent = myparent || {};


$(document).ready(function () {
    $('#ParentCode').focus();

    //myparent.childrenList();

    $('#send').bind('click', function () {
        $("div .control-group").removeClass("error");
        $(".help-inline").html("");
        myparent.setParentRelationship($('#ParentCode').val(), $('#IDNumber').val(), $('#Relationship').val());
    });

});

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
            if (error) {
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
                        $('#errorMessage').html('<div class="alert alert-error"><a class="close" data-dismiss="alert">×</a><strong>設定失敗！</strong> 建立關聯時發生錯誤</div>');
                        break;
                    default:
                        $('#errorMessage').html('<div class="alert alert-error"><a class="close" data-dismiss="alert">×</a><strong>設定失敗！</strong> ' + error.dsaError.message + '</div>');
                }
            } else {
                $('#editModal').modal("show");
                $('#editModal h3').html("設定成功")
                $('#editModal .modal-body').html('設定完成');
                $('#editModal #iknow').bind('click', function() {
                    window.parent.setTimeout(window.parent.menuRander.show,500);
                    window.parent.displayManager.refreshGadget((function () {
                        var vars = [], hash;
                        var p = window.location.href.slice(window.location.href.indexOf('?') + 1);
                        if (p.indexOf("#") >= 0)
                            p = p.substring(0, p.indexOf("#"));
                        var hashes = p.split('&');
                        for (var i = 0; i < hashes.length; i++) {
                            hash = decodeURI(hashes[i]);
                            var key = hash.substring(0, hash.indexOf("="));
                            vars.push(key);
                            vars[key] = hash.substring(hash.indexOf("=") + 1);
                        }
                        return vars;
                    }()).id);
                });
            }
        }
    });
};

myparent.childrenList = function () {
    myparent.parent_connection = gadget.getContract("auth.parent");
    myparent.parent_connection.ready(function () {
        myparent.parent_connection.send({
            service: 'My.Children',
            body: '',
            result: function (response, error, http) {
                if (error) {
                    console.log(error);
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

                    $('.childrenList tbody').html(tempHtml);
                }
            }
        });
    });
};
