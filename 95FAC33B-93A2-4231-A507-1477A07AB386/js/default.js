$(function () {
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

    // 取得學生資訊
    var connection = gadget.getContract("ischool.cadre");
    connection.send({
        service: "_.GetCadre",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                $('#title').html("查詢發生錯誤...");
            } else {
                // 成功
				
				var dct = {};
				var ref = {};
				
                if (response.Response && response.Response.Bt) {
				
					$('#title').hide();
					
                    $(response.Response.Bt).each(function(index, item) {
					
						dct_key = (item.Schoolyear || "") + '學年度 第' + (item.Semester || "") + '學期';
						ref_key = (item.Schoolyear || "") + (item.Semester || "");
						
						if(!(ref_key in ref))
						{
							ref[ref_key] = dct_key;
						}
						
						if (dct_key in dct)
						{
							dct[dct_key] += '<p>' + (item.Referencetype || "") + ' ' + (item.Cadrename || "") + ' ' + (item.Text || "") + '</p>';
						}
						else
						{
							dct[dct_key] = '<p>' + (item.Referencetype || "") + ' ' + (item.Cadrename || "") + ' ' + (item.Text || "") + '</p>';
						}
                        
                    });
					
					//很神奇會自己排序...
					for(var k in ref)
					{
						//動態表格
						schoolYear = ref[k];
						cadreName = dct[ref[k]];
						
						ret1 = '<div class="col-md-3"><div class="panel panel-default"><div class="panel-heading"><i class="fa fa-bookmark"></i> '+ schoolYear + '</div><div class="panel-body">';
						
						ret2 = cadreName + '</div></div></div>';
						
						$('#table').append(ret1+ret2);
					}
					
                }
				else
				{
					$('#title').html("您尚未擔任過任何幹部。");
				}
            }
        }
    });
});
