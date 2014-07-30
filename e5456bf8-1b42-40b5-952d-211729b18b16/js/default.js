$(document).ready(function () {
    /*
    $("#editModal").modal({
        show: false
    });
    $("#editModal").on("hidden", function () {
        $("#editModal #errorMessage").html("");
    });
    $("#editModal").on("show", function () {
        $("#editModal #save-data").button("reset");
    });
    $("#editModal #save-data").click(function () {
        $(this).button("loading");
    });
*/
    // 取得學生休學記錄
    var connection = gadget.getContract("emba.student");
    connection.send({
        service: "default.GetDropoutRecord",
        body: {},
        result: function (response, error, http) {
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetDropoutRecord)\n</div>");
            } else {
                // 成功
                var ret = '';
                var _ref;
                //alert(JSON.stringify(response.Response));
                //console.log(response.Response);

                if (response.Response && response.Response['dropout_record']) {
                    var record = response.Response['dropout_record'];
                    var suspension = ['Suspension1','Suspension2','Suspension3','Suspension4','Suspension5','Suspension6','Suspension7','Suspension8'];
                    var items = [];
                    $(suspension).each(function(index, item){
                        if (record[item]) {
                            items.push(
                                '<tr>' +
                                    '<td width="100px">' + (index+1) + '</td>' +
                                    '<td>' + record[item] + '</td>' +
                                '</tr>'
                            );                        
                        }
                    });
                    if (items.length === 0) {
                        items.push(
                            '<tr>' +
                            '    <td>無</td>' +
                            '</tr>'
                        );
                    }
                    $('#dropout tbody').html(items.join(''));
                }
                //return;emba.student.dropout_record.Suspension1
                /*
                if (response.Response && response.Response.emba && response.Response.emba.student && response.Response.emba.student.dropout_record) {
                    $(response.Response.Student).each(function(index, item) {
                        ret = '<p>姓名：' + (item.Name || '') + '</p>' +
                            '<p>學號：' + (item.StudentNumber || '') + '</p>' +
                            '<p>座號：' + (item.SeatNo || '') + '</p>';
                    });
                    $('#absence').html('aaa');
                }
                */
            }
        }
    });

    //  取得休學相關說明文字
    connection.send({
        service: "default.GetDropoutReminderText",
        body: {},
        result: function (response, error, http) {
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetStudent)\n</div>");
            } else {
                // 成功

                if (response.Response && response.Response['conf']) {
                    $('#DropoutReminderText').html(response.Response['conf']['ConfContent']);
            }
        }
     }
    });
});