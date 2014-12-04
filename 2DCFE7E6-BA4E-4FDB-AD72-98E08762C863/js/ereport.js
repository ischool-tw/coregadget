gadget.autofit(document.getElementById("widget"));
				
var _connection = gadget.getContract("OneAdmin.eReport.Parent");
var _dl_conn = gadget.getContract("OneAdmin.eReport.Public");
var _session_id, _papers = {};

$(function() {

	// 下載個人電子報表
	_connection.send({
		service: "GetReportList",
		body: {
			Content : { StudentName:"", ID: "", Name: "", Format: "", Timestamp: "" }
		},
		result: function(response, error, http) {
			
			_papers.personal = [];
			
			if (response.Reports != null) {
				$(response.Reports.Report).each(function() {
					var tr = "";
					tr += "<td class='ereport-item'>" + this.StudentName + "</td>";
					tr += "<td class='ereport-item'>" + this.Timestamp.substr(0, 16) + "</td>";
					tr += "<td class='ereport-item'>" + (this.Name == "" ? "&nbsp;" : this.Name) + "</td>";
					tr += "<td class='ereport-item'>" + (this.Format == "" ? "&nbsp;" : this.Format) + "</td>";
					tr += "<td class='ereport-item'><a href='#' onclick='downloadPaper(" + this.ID + ")'>下載</a></td>";

					_papers.personal.push("<tr>" + tr + "</tr>");
				});
			}

			bind();
		}
	});
});

function bind() {
	var thead =
		"<tr>" +
			"<td class='ereport-header'>姓名</td>" +
			"<td class='ereport-header'>日期</td>" +
			"<td class='ereport-header'>名稱</td>" +
			"<td class='ereport-header'>格式</td>" +
			"<td class='ereport-header'>下載</td>" +
		"</tr>", tbody = "";
	var items = [];
	
	$(_papers.personal).each(function() {
		tbody += this;
	});
		
	$("#ereport-table thead").html(thead);
	$("#ereport-table tbody").html(tbody);

}

function downloadPaper(paper_id) {

	var url =
		_dl_conn.getAccessPoint() +
		"/Download?" +
		"&content=<ID>" + paper_id + "</ID>";
		
	window.open(url, "_blank");
}