/// <reference path="../include/jquery-1.7.2.min.js"/>
/// <reference path="api.js"/>
var debug = false;
var SchoolYear, Semester;
var col = {}, colTimeTable, colCourseSection;
var MySelf, MyTimeTable, MyCourseSection;
var colMySubstituteSchedule, colSrcMyExchangeCourse, colDesMyExchangeCourse;
var GadgetTimeTable = {};
var MyViewDate = new Date(); //預設瀏覽本周
var tabsNowDate = {};

var _connection = gadget.getContract("ischool.ischeduler.student"); //非同步


function sortTimetable(a, b){
	//console.log('a='+a.innerHTML+',b='+b.innerHTML);
	if (a.Period == b.Period) {
		 return a.Weekday > b.Weekday ? 1 : -1; //asc
	} else {
		if (b.Period == "0") {
			//午休
			var d1 = funStr2Date(a.BeginTime);
			var d2 = funStr2Date(b.BeginTime);
			if ((Date.parse(d1)).valueOf() == (Date.parse(d2))) {
				return a.Weekday > b.Weekday ? 1 : -1; //asc
			} else {
				return (Date.parse(d1)).valueOf() > (Date.parse(d2)).valueOf() ? 1 : -1; //asc
			}
		} else {
			return parseInt(a.Period) > parseInt(b.Period) ? 1 : -1; //asc
		}
	}
};

function sortSubstituteSchedule(a, b) {
	//console.log('a='+a.innerHTML+',b='+b.innerHTML);
	var d1 = funStr2Date(a.SubstituteDate);
	var d2 = funStr2Date(b.SubstituteDate);
	return (Date.parse(d1)).valueOf() > (Date.parse(d2)).valueOf() ? 1 : -1;
}

function sortExchangeCourse(a, b) {
	//console.log('a='+a.innerHTML+',b='+b.innerHTML);
	var d1 = funStr2Date(a.SrcExchangeDate);
	var d2 = funStr2Date(b.SrcExchangeDate);
	return (Date.parse(d1)).valueOf() > (Date.parse(d2)).valueOf() ? 1 : -1;
}

DoGetCurrentSemester();
DoGetMyTimeTable();

function DoGetCurrentSemester() {
	_connection.send({
		service: "default.GetCurrentSemester",
		body: '',
		result: function (response, error, http) {
			// console.log(response);

			$(response.Result.SystemConfig).each(function (index, item) {
				SchoolYear=item.DefaultSchoolYear;
				Semester=item.DefaultSemester;

				$(".subtitle").html(SchoolYear + "學年度第" + Semester + "學期");
				DoGetMySubstituteSchedule();
				DoGetMyExchangeSchedule();
				DoGetMySchedule();
				Schedule_init();
			});
			//console.log('DoGetCurrentSemester', new Date());
		}
	});
}

function DoGetMySubstituteSchedule() {
	//代課
	_connection.send({
		service: "default.GetMySubstituteSchedule",
		// body:'<Request><SchoolYear>99</SchoolYear><Semester>2</Semester></Request>',
		body: '<Request><SchoolYear>' + SchoolYear + '</SchoolYear><Semester>' + Semester + '</Semester></Request>',
		result: function (response, error, http) {
			// console.log(response);
			var myColSS = {};
			var tempRequest = $(response.SubstituteCourse.CourseSection).sort(sortSubstituteSchedule);
			$(tempRequest).each(function (index, item) {
				/* 以  CourseSectionID 分類  */
				var CSID = item.CourseSectionID;
				if (!myColSS[CSID]) {
					var objSubSC = {};
					objSubSC.CourseSectionID = item.CourseSectionID;
					objSubSC.CourseSection = [];
					myColSS[CSID] = objSubSC;
				}
				var targetTT = myColSS[CSID];
				targetTT.CourseSection.push(item);
			});
			//console.log('DoGetMySubstituteSchedule', new Date());
			// console.log(col);
			colMySubstituteSchedule = myColSS;
			DrawingMyTabs();
			DrawingMyHistory();
		}
	});
}

function DoGetMyExchangeSchedule() {
	//調課
	_connection.send({
		service:"default.GetMyExchangeSchedule",
		// body:'<Request><SchoolYear>99</SchoolYear><Semester>2</Semester></Request>',
		body:'<Request><SchoolYear>' +SchoolYear+ '</SchoolYear><Semester>' +Semester+ '</Semester></Request>',
		result:function(response,error,http) {
			// console.log(response);
			var myColSrc = {}, myColDes = {};
			var tempResponse = $(response.ExchangeCourse.CourseSection).sort(sortExchangeCourse);
			$(tempResponse).each(function (index, item) {
				/* 以  SrcCourseSectionID 分類  */
				var SrcID=item.SrcCourseSectionID;
				if (!myColSrc[SrcID]) {
					var objExchangeSC={};
					objExchangeSC.SrcCourseSectionID=item.SrcCourseSectionID;
					objExchangeSC.CourseSection=[];
					myColSrc[SrcID]=objExchangeSC;
				}
				var targetSrc=myColSrc[SrcID];
				targetSrc.CourseSection.push(item);

				/* 以  DesCourseSectionID 分類  */
				var DesID=item.DesCourseSectionID;
				if (!myColDes[DesID]) {
					var objExchangeDC={};
					objExchangeDC.DesCourseSectionID=item.DesCourseSectionID;
					objExchangeDC.CourseSection=[];
					myColDes[DesID]=objExchangeDC;
				}
				var targetDes=myColDes[DesID];
				targetDes.CourseSection.push(item);
			});
			//console.log('DoGetMyExchangeSchedule', new Date());
			// console.log(myColSrc);
			// console.log(myColDes);
			colSrcMyExchangeCourse = myColSrc;
			colDesMyExchangeCourse = myColDes;
			DrawingMyTabs();
			DrawingMyHistory();
		}
	});
}

function DoGetMyTimeTable() {
	_connection.send({
		service: "default.GetMyTimeTable",
		body: '',
		result: function (response, error, http) {
			// console.log(response);
			var myCol = {};
			if (error == null) {
				if ($(response.TimeTableSections).size() == 0) {
					$('.myTabContent').html('無上課時間表');
				}
				$(response.TimeTableSections.TimeTableSection).each(function (index, item) {
					var TTId = item.TimetableID;
					if (!myCol[TTId]) {
						var objTT = {};
						objTT.TimetableID = item.TimetableID;
						objTT.TimetableName = item.TimetableName;
						objTT.MaxWeekday = parseInt(item.Weekday);
						objTT.MaxPeriod = parseInt(item.Period);
						objTT.Sections = [];
						myCol[TTId] = objTT;
					}
					var targetTT = myCol[TTId];
					targetTT.Sections.push(item);
					if (parseInt(item.Weekday) > targetTT.MaxWeekday) {
						targetTT.MaxWeekday = parseInt(item.Weekday);
					}
					if (parseInt(item.Period) > targetTT.MaxPeriod) {
						targetTT.MaxPeriod = parseInt(item.Period);
					}
				});
				//console.log('DoGetMyTimeTable', new Date());
				// console.log(col);
				MySelf = myCol;
				DrawingMyTabs();
			}
		}
	});
}

function DoGetAllTimeTables(TTID, uCategory, kind) {
	if (col[TTID] == undefined) {
		_connection.send({
			service: "default.GetAllTimeTables",
			body: '<Request><Condition><TimetableID>' + TTID + '</TimetableID></Condition></Request>',
			result: function (response, error, http) {
				// console.log(response);
				$(response.TimeTableSections.TimeTableSection).each(function (index, item) {
					var TTId = item.TimetableID;
					if (!col[TTId]) {
						var objTT = {};
						objTT.TimetableID = item.TimetableID;
						objTT.TimetableName = item.TimetableName;
						objTT.MaxWeekday = parseInt(item.Weekday);
						objTT.MaxPeriod = parseInt(item.Period);
						objTT.Sections = [];
						col[TTId] = objTT;
					}
					var targetTT = col[TTId];
					targetTT.Sections.push(item);
					if (parseInt(item.Weekday) > targetTT.MaxWeekday) {
						targetTT.MaxWeekday = parseInt(item.Weekday);
					}
					if (parseInt(item.Period) > targetTT.MaxPeriod) {
						targetTT.MaxPeriod = parseInt(item.Period);
					}
				});
				// console.log(col);
				//console.log('DoGetAllTimeTables', new Date());
				if (kind == 'myself') {
					MySelf = col;
					DrawingMyTabs();
				} else {
					DrawingTabs(uCategory);
				}
			}
		});
	} else {
		DrawingTabs(uCategory);
	}
}

function DoGetMySchedule() {
	_connection.send({
		service: "default.GetMySchedule",
		body: '<Request><SchoolYear>' + SchoolYear + '</SchoolYear><Semester>' + Semester + '</Semester></Request>',
		result: function (response, error, http) {
			if (error == null) {
				if ($(response.Schedule).size() == 0) {
					$('.myTabContent').html('無學期課表');
				}

				// console.log(response);
				var myColTimeTable = response;
				var myColCourseSection = {};
				$(response.Schedule.CourseSection).each(function (index, item) {
					/* 以  CourseSectionID 分類  */
					var CSID = item.CourseSectionID;
					if (!myColCourseSection[CSID]) {
						myColCourseSection[CSID] = item;
					}
				});
				MyTimeTable = myColTimeTable;
				MyCourseSection = myColCourseSection;
				// console.log(MyTimeTable);
				// console.log(MyCourseSection);
				//console.log('DoGetMySchedule', new Date());
				DrawingMyTabs();
				DrawingMyHistory();
			}
		}
	});
}

function DoGetSchedule(uCategory, kind) {
	switch (uCategory.item.categoryid) {
		case 'T':
			request_body = '<TeacherID>' + uCategory.item.myid + '</TeacherID>';
			break;
		case 'C':
			request_body = '<ClassID>' + uCategory.item.myid + '</ClassID>';
			break;
		case 'CR':
			request_body = '<ClassroomID>' + uCategory.item.myid + '</ClassroomID>';
			break;
	}

	//console.log('request_body='+request_body);

	_connection.send({
		service: "default.GetSchedule",
		// body:'<Request><SchoolYear>99</SchoolYear><Semester>2</Semester><TeacherID>9216</TeacherID></Request>',
		body: '<Request><SchoolYear>' + SchoolYear + '</SchoolYear><Semester>' + Semester + '</Semester>' + request_body + '</Request>',
		result: function (response, error, http) {
			if (debug == true) console.log(response);

			if (error == null) {

				if ($(response.Schedule).size() == 0) {
					$("#condition").html("尚無課表資料！");
				} else {
					var myColTimeTable = {};
					var myColCourseSection = {};
					$(response.Schedule.CourseSection).each(function (index, item) {
						/* 以  TimetableID 分類  */
						var TTId = item.TimetableID;
						if (!myColTimeTable[TTId]) {
							if (col[TTId] == undefined) { DoGetAllTimeTables(TTId, uCategory, kind); };

							var objTT = {};
							objTT.TimetableID = item.TimetableID;
							objTT.Schedule = [];
							myColTimeTable[TTId] = objTT;
						}
						var targetTT = myColTimeTable[TTId];
						targetTT.Schedule.push(item);

						/* 以  CourseSectionID 分類  */
						var CSID = item.CourseSectionID;
						if (!myColCourseSection[CSID]) {
							myColCourseSection[CSID] = item;
						}
					});

					if (debug == true) {
						console.log(myColTimeTable);
						console.log(myColCourseSection);
					}

					if (kind == 'myself') {
						MyTimeTable = myColTimeTable;
						MyCourseSection = myColCourseSection;
						DrawingMyTabs();
					} else {
						colTimeTable = myColTimeTable;
						colCourseSection = myColCourseSection;
						DrawingTabs(uCategory);
					}
				}
			}
		}
	});
}

function DrawingMyTabs() {
	if (MySelf && MyTimeTable && MyCourseSection && colMySubstituteSchedule && colSrcMyExchangeCourse && colDesMyExchangeCourse) {
		// console.log(MySelf);
		// console.log(MyTimeTable);
		// console.log(MyCourseSection);

		for (var TTID in MySelf) {
			var item = MySelf[TTID];

			var Alias = "tab_My" + TTID;

			var tab_li = '<li class="tab1 tab-selected ' + Alias  + '">';
			tab_li += '<a href="javascript:TabsAction(\'My' + TTID  + '\');">';
			tab_li += item.TimetableName + '</a></li>';

			$('ul.myTabs').append(tab_li);

			tabsNowDate["My"+TTID] = MyViewDate;

			DrawingTimeTable("My" + TTID);
		}
	}
}

function DrawingTabs(uCategory) {
	var col_asyn = true;
	$.each(colTimeTable, function (TTID, value) {
		if (!col[TTID]) col_asyn = false;
	});

	if (col_asyn && colTimeTable && colCourseSection && colMySubstituteSchedule && colSrcMyExchangeCourse && colDesMyExchangeCourse) {
		// console.log(col);
		// console.log(colTimeTable);
		// console.log(colCourseSection);


		if (typeof (uCategory) != "undefined") {
			var searchText = uCategory.item.value + '的課表';
		}

		var firstAlias, Alias;
		var k = 0;
		var tab_li = "";
		var cssname = "";
	
		$.each(colTimeTable, function (TTID, value) {
			k++;
			
			if (TTID != "") {
				cssname = "";
				Alias = "tab_TT" + TTID;

				if (k == 1) {
					$(".search-text").html(searchText);
					cssname = " tab-selected";
					firstAlias = "TT" + TTID;
				}

				tab_li += '<li class="tab1 ' + cssname + ' ' + Alias + '">';
				tab_li += '<a href="javascript:TabsAction(\'TT' + TTID + '\');">';
				tab_li += col[TTID].TimetableName + '</a></li>';

				tabsNowDate["TT"+TTID] = new Date();
			}
		});
		$('ul.searchTabs').append(tab_li);
		
		DrawingTimeTable(firstAlias);
	}
}

function TabsAction(index1) {
	DrawingTimeTable(index1);
}

function DrawingTimeTable(strTTID) {
	//	TTID = 85686; //午休
	//	TTID = 85696; //固定排課

	//儲存格id = 'My'+TTID+Period+Weekday

	var Alias = funGetAlias(strTTID);
	var TTID = strTTID.substr(2);

	var theTimeTable;

	if (funUseMySelf(strTTID)) {
		theTimeTable = MySelf[TTID];
	} else {
		theTimeTable = col[TTID];
	}
	
	var max_Weekday=parseInt(theTimeTable.MaxWeekday);
	var max_Period=parseInt(theTimeTable.MaxPeriod);
	var theSchedule=$(theTimeTable.Sections).sort(sortTimetable);
	if (debug == true) console.log(theSchedule);
	var content = "";
	var prev_Weekday = max_Weekday;  //for-each中上一個日期，決定是否補空儲存格
	var prev_Period = 1; //for-each中上一個節次，決定是否換行
	var prev_BeginTime = ""; //給午休用的

	$(theSchedule).each(function (index, item) {
		//節次的開始時間、結束時間
		//		var BeginTime, EndTime;

		//		var tempBeginTime = funStr2Date(item.BeginTime);
		//		BeginTime = $.formatDate(tempBeginTime, 'HHmm');

		//		var tEndTime = funStr2Date(item.BeginTime);
		//		tEndTime.setMinutes(tEndTime.getMinutes() + parseInt(item.Duration));

		//		EndTime = $.formatDate(tEndTime, 'HHmm');

		//換行處理
		if (index == 0 || (parseInt(item.Period) != prev_Period)) {
			//第一節不處理
			if (index != 0 && (parseInt(item.Period) != prev_Period)) {
				//補上一節的空白儲存格
				if (prev_Weekday != max_Weekday) {
					for (var j = prev_Weekday + 1; j <= max_Weekday; j++) {
						content += '<td id="' + Alias + item.Period + '_' + j + '"  class="empty_column">'; 
						if (debug == true) content += item.Period + ',' + item.Weekday + '補上一節的空白儲存格';
						content += '</td>';
					}
				}
			}

			//一節的起始
			if (index != 0) { content += '</tr>' };
			prev_Weekday = 0; //換行之後weekday歸零


			if (item.Period != '0') {
				//				content += '<tr><td>' + item.DisplayPeriod + '<br />' + BeginTime + '~' + EndTime + '</td>';
				content += '<tr><td>' + item.DisplayPeriod + '</td>';
			}
		}

		//補行處理
		if ((parseInt(item.Period) > (prev_Period + 1)) && prev_Period != 0) {
			for (var i = (prev_Period + 1); i < item.Period; i++) {

				content += '<tr><td class="empty_column">';
				if (debug == true) content += item.Period + ',' + item.Weekday + '補行處理1';
				content += '</td>';


				for (var j = 1; j < max_Weekday; j++) {
					content += '<td id="' + Alias + i + '_' + j + '" class="empty_column">';
					if (debug == true) content += item.Period + ',' + item.Weekday + '補行處理';
					content += '</td>';
				}
				content += '</tr>';
			}
		}

		//補這一節的空白儲存格
		if (parseInt(item.Weekday) > (prev_Weekday + 1)) {
			for (var j = prev_Weekday + 1; j < parseInt(item.Weekday); j++) {
				content += '<td id="' + Alias + item.Period + '_' + j + '" class="empty_column">';
				if (debug == true) content += item.Period + ',' + item.Weekday + '補這一節的空白儲存格';
				content += '</td>';
			}
		}

		if (item.Period == "0") {
			//午休Period=0
			if (item.Weekday == "1") {
				content += '<td></td><td>';
			} else {
				content += '<td>';
			}
			if (debug == true) content += item.Period + ',' + item.Weekday + '午休';
			content += '午休</td>';
		} else {
			// 不排課
			if (item.Disable == 't') {
				content += '<td>';
				content += '<div>' + item.DisableMessage + '</div>';
				if (debug == true) content += item.Period + ',' + item.Weekday + '不排課';
				content += '</td>';
			}
			else {
				content += '<td id="' + Alias + item.Period + '_' + item.Weekday + '">';
				if (debug == true) content += item.Period + ',' + item.Weekday + '正常';
				content += '</td>';
			}
		}

		prev_Period = parseInt(item.Period);
		prev_Weekday = parseInt(item.Weekday);
		prev_BeginTime = item.BeginTime;
	});
	
	//補最後一節的空白儲存格
	if (prev_Weekday!=max_Weekday) {
		for (var j=prev_Weekday+1; j<=max_Weekday; j++) {
			content += '<td id="' + Alias + prev_Period + '_' + j + '" class="empty_column"></td>';
		}
	}
	
	/*thead start*/
	var thead_content='<tr><th>節次\\<br />星期</th>';
	for(var i=1; i<=max_Weekday; i++){
		thead_content += '<th>' + funGetDayName(i) + '<br /><span class="week' + i + '"></span></th>';
	}
	thead_content += '</tr>';

	//呈現於前端
	var HTMLStr = '\
		<div id="' + Alias + '"> \
			<div class="week-container"></div> \
			<table class="grid"> \
				<thead>' + thead_content + '</thead> \
				<tbody>' + content + '</tbody> \
			</table> \
		</div>';

	if (funUseMySelf(strTTID)) {
		$('.myTabContent').html(HTMLStr);	
	} else {
		$('.searchTabContent').html(HTMLStr);
	}
	
	DrawingSchedule(strTTID);
}

function DrawingSchedule(strTTID) {
	//儲存格文字 div id=My + TTID + '_CSID' + CourseSectionID
	
	var Alias = funGetAlias(strTTID);
	var TTID = strTTID.substr(2);
	var ViewDate = tabsNowDate[strTTID];
	
	var theSchedule ;

	var theSchedule = (funUseMySelf(strTTID)) ? MyTimeTable.Schedule.CourseSection : colTimeTable[TTID].Schedule;

	$(theSchedule).each(function (index, item) {
		var content = '';
		content += '<div class="' + Alias + '_CSID' + item.CourseSectionID + '">';
		content += '<div>' + item.CourseName + '</div>';
		content += '<div>' + item.TeacherName + '</div>';
		content += '<div>' + item.ClassroomName + '</div>';
		content += '</div>';

		//開發用
		if (debug == true) content += '<div>Weekday=' + item.Weekday + ',Period=' + item.Period + ',Length=' + item.Length + '</div>';
		if (debug == true) content += '<div>CourseSectionID=' + item.CourseSectionID + '</div>';

		//課程分段處理
		for (var i = 0; i < item.Length; i++) {
			$('#' + Alias + (parseInt(item.Period) + i) + '_' + item.Weekday).append(content); //儲存格id = 'My'+TTID+Period+Weekday
		}
	});

	funChangeWeek('today', strTTID);
}

function DrawingSS(ViewDate, strTTID) {	
	//處理代課，只處理表格
	//儲存格文字 div id=My + TTID + '_CSID' + CourseSectionID

	var Alias = funGetAlias(strTTID);
	var TTID = strTTID.substr(2);
	var SubstituteInfo;

	$.each(colMySubstituteSchedule, function (index, responseSS) {
		$(responseSS.CourseSection).each(function (index, itemSS) {
			//瀏覽的周次
			if (funInThisWeek(ViewDate, funStr2Date(itemSS.SubstituteDate))) {
				SubstituteInfo = '<div class="tag" style="text-align:left;"><span class="tag2">代課</span>' + itemSS.NewTeacherName + '</div>';

				$('.' + Alias + '_CSID' + itemSS.CourseSectionID).prepend(SubstituteInfo); // 儲存格id = 'My'+TTID+Period+Weekday
			}
		});
	});
}

function DrawingEC(ViewDate, strTTID) {
	//儲存格文字 div id=My + TTID + '_CSID' + CourseSectionID

	var Alias = funGetAlias(strTTID);
	var TTID = strTTID.substr(2);
	var UseCourseSection;
	var ExchangeInfo;

	UseCourseSection = (funUseMySelf(strTTID)) ? MyCourseSection : colCourseSection;
	
	
	//處理要調課，只處理表格
	$.each(colSrcMyExchangeCourse, function (index, responseSrc) {
		ExchangeInfo = '';

		$(responseSrc.CourseSection).each(function (index, itemSCS) {
			//要調課
			var Src = UseCourseSection[itemSCS.SrcCourseSectionID];
			var srcHTMLa = '', srcHTMLb = '', srcPeriod = '';

			//被調課
			var Des = UseCourseSection[itemSCS.DesCourseSectionID];

			//瀏覽的周次
			if (funInThisWeek(ViewDate, funStr2Date(itemSCS.SrcExchangeDate))) {
				ExchangeInfo = '<div class="tag"><span class="tag1">調課</span></div>';
				ExchangeInfo += '<div>' + Des.CourseName + '</div>';
				ExchangeInfo += '<div>' + Des.TeacherName + '</div>';
				ExchangeInfo += '<div>' + Des.ClassroomName + '</div>';
			}

		});

		//還原未設定
		if (ExchangeInfo == '') {
			var defaultCS = UseCourseSection[responseSrc.SrcCourseSectionID];
			if (defaultCS) {
				ExchangeInfo = '<div>' + defaultCS.CourseName + '</div>';
				ExchangeInfo += '<div>' + defaultCS.TeacherName + '</div>';
				ExchangeInfo += '<div>' + defaultCS.ClassroomName + '</div>';
			}
		}

		$('.' + Alias + '_CSID' + responseSrc.SrcCourseSectionID).html(ExchangeInfo); //儲存格文字 div id=My + TTID + '_CSID' + CourseSectionID

	});


	//處理被調課，只處理表格
	$.each(colDesMyExchangeCourse, function (index, responseDes) {
		ExchangeInfo = '';

		$(responseDes.CourseSection).each(function (index, itemDCS) {
			//要調課
			var Src = UseCourseSection[itemDCS.SrcCourseSectionID];

			//被調課
			var Des = UseCourseSection[itemDCS.DesCourseSectionID];
			var desHTMLa = '', desHTMLb = '', desPeriod = '';

			//瀏覽的周次
			if (funInThisWeek(ViewDate, funStr2Date(itemDCS.DesExchangeDate))) {
				ExchangeInfo = '<div style="text-align:left;"><span class="tag1">調課</span></div>';
				ExchangeInfo += '<div>' + Src.CourseName + '</div>';
				ExchangeInfo += '<div>' + Src.TeacherName + '</div>';
				ExchangeInfo += '<div>' + Src.ClassroomName + '</div>';
			}
		});


		//還原未設定
		if (ExchangeInfo == '') {
			var defaultCS = UseCourseSection[responseDes.DesCourseSectionID];
			if (defaultCS) {
				ExchangeInfo = '<div>' + defaultCS.CourseName + '</div>';
				ExchangeInfo += '<div>' + defaultCS.TeacherName + '</div>';
				ExchangeInfo += '<div>' + defaultCS.ClassroomName + '</div>';
			}
		}

		$('.' + Alias + '_CSID' + responseDes.DesCourseSectionID).html(ExchangeInfo); //儲存格文字 div id=My + TTID + '_CSID' + CourseSectionID
	})
}

function DrawingMyHistory() {
	var tempHTMLSS = "", tempHTMLEC = "", MaxLen;

	if (MyCourseSection && colSrcMyExchangeCourse && colDesMyExchangeCourse) {
		
		//處理代課
		var SSList = "", tempPeriod;

		$.each(colMySubstituteSchedule, function (index, item) {
			$(item.CourseSection).each(function (index, itemSS) {
				var MyCourseSectionData = MyCourseSection[itemSS.CourseSectionID];
				tempPeriod = "";

				//課程分段處理
				MaxLen=(parseInt(MyCourseSectionData.Period) + parseInt(MyCourseSectionData.Length));

				for (var ii = parseInt(MyCourseSectionData.Period);  ii< MaxLen; ii++) {
					if (tempPeriod != '') tempPeriod += '.';
					tempPeriod += ii.toString();
				}

				//符合本周及未來的代課
				if (funInAfterWeek(new Date(), funStr2Date(itemSS.SubstituteDate))) {
					var tempHTMLa = '', tempHTMLb = '';
					tempHTMLa = '<p>';
					tempHTMLa += '<a href="javascript:funMoveToWeek(\'' + itemSS.SubstituteDate + '\', \'' + itemSS.CourseSectionID + '\');" class="tag_link">';
					tempHTMLa += $.formatDate(funStr2Date(itemSS.SubstituteDate), 'yyyyMMddW') + ' 第';
					tempHTMLb = '節由' + itemSS.NewTeacherName + '老師代課</a></p>';
					tempHTMLSS += tempHTMLa + tempPeriod + tempHTMLb;
				}


				//處理代課記錄
				SSList += '<tr>';
				SSList += '<td>' + $.formatDate(funStr2Date(itemSS.SubstituteDate), 'yyyyMd') + '</td>';
				SSList += '<td>' + funGetDayName(itemSS.Weekday) + '</td>';
				SSList += '<td>' + (tempPeriod) + '</td>';
				SSList += '<td>' + (itemSS.CourseName) + '</td>';
				SSList += '<td>' + (itemSS.AbsenceName) + '</td>';
				SSList += '<td>由' + itemSS.NewTeacherName + '老師代課</td>';
				SSList += '<td>' + (MyCourseSectionData.Length) + '</td>';
				SSList += '</tr>';
			});
		});

		if (tempHTMLSS != "") {
			tempHTMLSS = '<span class="tag2">代課</span>' + tempHTMLSS;
		}

		$('table.SubstituteCourseList > tbody').html(SSList);

		//處理調課
		var ECList = "", srcPeriod = "", desPeriod = "";

		$.each(colSrcMyExchangeCourse, function (index, item) {

			$(item.CourseSection).each(function (index, itemSCS) {
				var Src = MyCourseSection[itemSCS.SrcCourseSectionID];
				var Des = MyCourseSection[itemSCS.DesCourseSectionID];
				srcPeriod = "";
				desPeriod = "";

				//要調課課程分段處理
				MaxLen=(parseInt(Src.Period) + parseInt(Src.Length));

				for (var ii = parseInt(Src.Period); ii < MaxLen; ii++) {
					if (srcPeriod != '') srcPeriod += '.';
					srcPeriod += ii.toString();
				}

				//被調課課程分段處理
				MaxLen=(parseInt(Des.Period) + parseInt(Des.Length));

				for (var ii = parseInt(Des.Period); ii < MaxLen; ii++) {
					if (desPeriod != '') desPeriod += '.';
					desPeriod += ii.toString();
				}

				if (funInAfterWeek(new Date(), funStr2Date(itemSCS.SrcExchangeDate)) || funInThisWeek(new Date(), funStr2Date(itemSCS.DesExchangeDate))) {

					//要調課
					var srcHTMLa = '', srcHTMLb = '', srcContent;

					//被調課
					var desHTMLa = '', desHTMLb = '', desContent;

					//符合本周及未來的要調課
					if (funInAfterWeek(new Date(), funStr2Date(itemSCS.SrcExchangeDate))) {
						srcHTMLa = '<p>';
						srcHTMLa += '<a href="javascript:funMoveToWeek(\'' + itemSCS.SrcExchangeDate + '\', \'' + itemSCS.SrcCourseSectionID  + '\');" class="tag_link">';
						srcHTMLa += $.formatDate(funStr2Date(itemSCS.SrcExchangeDate), 'yyyyMMddW') + ' 第';
						srcHTMLb = '節<br />改上 ' + Des.CourseName + '</a></p>';
						tempHTMLEC += srcHTMLa + srcPeriod + srcHTMLb;
					}

					//符合本周及未來的被調課
					if (funInAfterWeek(new Date(), funStr2Date(itemSCS.DesExchangeDate))) {
						desHTMLa = '<p>';
						desHTMLa += '<a href="javascript:funMoveToWeek(\'' + itemSCS.DesExchangeDate + '\', \''+itemSCS.DesCourseSectionID+'\');" class="tag_link">';
						desHTMLa += $.formatDate(funStr2Date(itemSCS.DesExchangeDate), 'yyyyMMddW') + ' 第';
						desHTMLb = '節<br />改上 ' + Src.CourseName + '</a></p>';
						tempHTMLEC += desHTMLa + desPeriod + desHTMLb;
					}

				}

				//處理調課記錄
				ECList += '<tr>'
				ECList += '<td>' + $.formatDate(funStr2Date(itemSCS.SrcExchangeDate), 'yyyyMd') + '</td>';
				ECList += '<td>' + $.formatDate(funStr2Date(itemSCS.SrcExchangeDate), 'W') + '</td>';
				ECList += '<td>' + (srcPeriod) + '</td>';
				ECList += '<td>' + (Src.CourseName) + '</td>';
				ECList += '<td>跟' + $.formatDate(funStr2Date(itemSCS.DesExchangeDate), 'yyyyMMddW') + ' 第' + desPeriod + '節 ' + Des.TeacherName + '老師 的' + Des.CourseName + ' 調課。</td>';
				ECList += '<td>' + (Src.Length) + '</td>';
				ECList += '</tr>'
			});
		});

		
		
		if (tempHTMLEC != "") {
			tempHTMLEC = '<span class="tag1">調課</span>' + tempHTMLEC;
		}

		$('table.ExahangeCourseList > tbody').html(ECList);

	}
	$(".SplitterBottomPane").html(tempHTMLSS + tempHTMLEC);
}

function funGetAlias(strTTID) {
	return strTTID;
}

function funUseMySelf(strTTID) {
	var ret;
	ret = (strTTID.indexOf('My') > -1);
	return ret;
}

function funChangeWeek(WeekSet, strTTID) {

	var Alias = funGetAlias(strTTID);
	var TTID = strTTID.substr(2);
	var NowDate = tabsNowDate[strTTID];
	var ViewDate = NowDate;

	switch (WeekSet.toLowerCase()) {
		case 'prev':
		case 'next':
			ViewDate = funGetNearWeekday(NowDate, WeekSet);
			tabsNowDate[strTTID] = ViewDate;

		case 'today':
			//清除代課的標籤
			$('#' + Alias + ' div.tag').remove();

			/*thead start*/
			for (var i = 1; i <= 7; i++) {
				$('#' + Alias + ' span.week' + i).html(funGetWeekday(ViewDate, i, 2));
			}


			/*change week*/
			var week_control = '<div><a href="javascript:funChangeWeek(\'prev\', \'' + strTTID + '\');" class="week-last">&lt;上星期</a></div>';
			week_control += '<div><a href="javascript:funChangeWeek(\'next\', \'' + strTTID + '\');" class="week-next">下星期&gt;</a></div>';

			$('div#' + Alias + ' div.week-container').html(week_control);

			DrawingEC(ViewDate, strTTID); //調課
			DrawingSS(ViewDate, strTTID); //代課

			break;
		default:
			ViewDate = NowDate;
	}
}

function funMoveToWeek(setDate, CSID) {
	$('ul.menu li:first').trigger('click');
	var MySelfTTID = "My" + MyCourseSection[CSID].TimetableID;
	tabsNowDate[MySelfTTID] = funStr2Date(setDate); 
	funChangeWeek('today', MySelfTTID);
}