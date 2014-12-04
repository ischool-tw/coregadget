gadget.autofit(document.getElementById("widget"));
				
var _connection = gadget.getContract("OneAdmin.eReport.Student");
var _dl_conn = gadget.getContract("OneAdmin.eReport.Public");
// var _session_id;

$(function() {
	// _connection.send({
	// 	service: "DS.Base.Connect",
	// 	body: { RequestSessionID : "" },
	// 	result: function(response, error, http) {
	// 		_session_id = response.SessionID;
	// 	}
	// });

	// 下載個人電子報表
	_connection.send({
		service: "GetReportList",
		body: {
			Content : { ID: "", Name: "", Format: "", Timestamp: "" }
		},
		result: function(response, error, http) {
		
			var thead =
				"<tr>" +
					//"<td class='ereport-header'>編號</td>" +
					"<td class='ereport-header'>日期</td>" +
					"<td class='ereport-header'>名稱</td>" +
					"<td class='ereport-header'>格式</td>" +
					"<td class='ereport-header'>下載</td>" +
				"</tr>", tbody = "";
			var items = [];
			
			if (response.Reports != null) {
				$(response.Reports.Report).each(function() {
					var tr = "";
					//tr += "<td class='ereport-item'>" + this.ID + "</td>";
					tr += "<td class='ereport-item'>" + this.Timestamp.substr(0, 16) + "</td>";
					tr += "<td class='ereport-item'>" + (this.Name == "" ? "&nbsp;" : this.Name) + "</td>";
					tr += "<td class='ereport-item'>" + (this.Format == "" ? "&nbsp;" : this.Format) + "</td>";
					tr += "<td class='ereport-item'><a href='#' onclick='downloadPaper(" + this.ID + ")'>下載</a></td>";
					
					tbody += "<tr>" + tr + "</tr>";
				});
			}
			
			$("#ereport-table thead").html(thead);
			$("#ereport-table tbody").html(tbody);
		}
	});
});


function downloadPaper(paper_id) {

	var url =
		_dl_conn.getAccessPoint() +
		"/Download?" +
		"&content=<ID>" + paper_id + "</ID>";
		
	window.open(url, "_blank");
}