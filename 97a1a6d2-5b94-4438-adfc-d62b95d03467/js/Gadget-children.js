/// <reference path="../include/jquery-1.7.2.min.js"/>
var myparent = myparent || {};

/// <reference path="../include/jquery-1.7.2.min.js"/>
$(document).ready(function () {
    $('#ParentCode').focus();

    myparent.DrawingChildrenList = function () {
        myparent.childrenList('.childrenList');
    };

    myparent.DrawingChildrenList();

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
                        $('#errorMessage').html('<div class="alert alert-error"><a class="close" data-dismiss="alert">×</a><strong>設定失敗！</strong> 與家長建立關聯時發生錯誤</div>');
                        break;
                    default:
                        $('#errorMessage').html('<div class="alert alert-error"><a class="close" data-dismiss="alert">×</a><strong>設定失敗！</strong> ' + error.dsaError.message + '</div>');
                }
            } else {
                myparent.DrawingChildrenList();

                $('#editModal').modal("show");
                $('#editModal h3').html("設定成功")
                $('#editModal .modal-body').html('設定完成');
                $('#editModal #iknow').bind('click', window.parent.appsLoader.reflashApplicationList());
            }
        }
    });
};

myparent.childrenList = function (e) {
    myparent.parent_connection = gadget.getContract("auth.parent");
    myparent.parent_connection.ready(function () {
        myparent.parent_connection.send({
            service: 'My.Children',
            body: '',
            result: function (response, error, http) {
                if (error) {
                    console.log(error);
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
                    tempHtmlA = '<div class="well"><table class="table table-condensed table-striped"><thead><tr><th>姓名</th><th>班級</th><th>座號</th><th>關係</th></tr></thead>';
                    tempHtmlA += '<tbody>';
                    tempHtmlB = '</tbody></table></div>';

                    $(e).html(tempHtmlA + tempHtml + tempHtmlB);
                }
            }
        });
    });
};
