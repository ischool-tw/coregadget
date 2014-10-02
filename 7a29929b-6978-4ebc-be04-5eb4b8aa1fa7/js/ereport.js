gadget.autofit(document.getElementById("widget"));
				
var _connection = gadget.getContract("ta");
var _session_id, _papers = {};

$(function() {
	_connection.send({
		service: "DS.Base.Connect",
		body: { RequestSessionID : "" },
		result: function(response, error, http) {
			_session_id = response.SessionID;
		}
	});
	
	// 下載個人電子報表
	_connection.send({
		service: "TeacherAccess.GetElectronicPaperPersonal",
		body: {
			Content : { ID: "", Name: "", Format: "", Timestamp: "" }
		},
		result: function(response, error, http) {
			
			_papers.personal = [];
			
			if (response.Papers != null) {
				$(response.Papers.Paper).each(function() {
					var tr = "";
					tr += "<td class='ereport-item'>" + this.ID + "</td>";
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
	
	// 下載班級電子報表
	_connection.send({
		service: "TeacherAccess.GetElectronicPaperClass",
		body: {
			Content : { ID: "", Name: "", Format: "", Timestamp: "", ClassName: "" }
		},
		result: function(response, error, http) {
			
			_papers.clazz = [];
			
			if (response.Papers != null) {
				$(response.Papers.Paper).each(function() {
					var tr = "";
					tr += "<td class='ereport-item'>" + this.ID + "</td>";
					tr += "<td class='ereport-item'>" + this.Timestamp.substr(0, 16) + "</td>";
					tr += "<td class='ereport-item'>" + (this.Name == "" ? "&nbsp;" : this.Name) + "</td>";
					tr += "<td class='ereport-item'>" + (this.Format == "" ? "&nbsp;" : this.Format) + "</td>";
					tr += "<td class='ereport-item'><a href='#' onclick='downloadPaper(" + this.ID + ")'>下載</a></td>";
					
					_papers.clazz.push("<tr>" + tr + "</tr>");
				});
			}
				
			bind();
		}
	});
	
	// 下載課程電子報表
	_connection.send({
		service: "TeacherAccess.GetElectronicPaperCourse",
		body: {
			Content : { ID: "", Name: "", Format: "", Timestamp: "", ClassName: "" }
		},
		result: function(response, error, http) {
			
			_papers.course = [];
			
			if (response.Papers != null) {
				$(response.Papers.Paper).each(function() {
					var tr = "";
					tr += "<td class='ereport-item'>" + this.ID + "</td>";
					tr += "<td class='ereport-item'>" + this.Timestamp.substr(0, 16) + "</td>";
					tr += "<td class='ereport-item'>" + (this.Name == "" ? "&nbsp;" : this.Name) + "</td>";
					tr += "<td class='ereport-item'>" + (this.Format == "" ? "&nbsp;" : this.Format) + "</td>";
					tr += "<td class='ereport-item'><a href='#' onclick='downloadPaper(" + this.ID + ")'>下載</a></td>";
					
					_papers.course.push("<tr>" + tr + "</tr>");
				});
			}
				
			bind();
		}
	});
});

function bind() {
	
	if (_papers.personal == undefined ||
		_papers.clazz == undefined ||
		_papers.course == undefined)
		return;
	
	var thead =
		"<tr>" +
			"<td class='ereport-header'>編號</td>" +
			"<td class='ereport-header'>日期</td>" +
			"<td class='ereport-header'>名稱</td>" +
			"<td class='ereport-header'>格式</td>" +
			"<td class='ereport-header'>下載</td>" +
		"</tr>", tbody = "";
	var items = [];
	
	$(_papers.personal).each(function() {
		tbody += this;
	});
	
	$(_papers.clazz).each(function() {
		tbody += this;
	});
	
	$(_papers.course).each(function() {
		tbody += this;
	});
	
	$("#ereport-table thead").html(thead);
	$("#ereport-table tbody").html(tbody);

}

function downloadPaper(paper_id) {

	var url =
		_connection.getAccessPoint() +
		"/TeacherAccess.DownloadElectronicPaper" +
		"?stt=session" +
		"&sessionid=" + _session_id +
		"&rsptype=binarycontent" +
		"&content=<ID>" + paper_id + "</ID>";
		
	window.open(url, "_blank");
}