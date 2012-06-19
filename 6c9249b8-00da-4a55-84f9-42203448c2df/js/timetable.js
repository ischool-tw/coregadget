/// <reference path="../include/jquery-1.7.2.min.js"/>

$(document).ready(function () {
	$('#function_Search, #function_history').hide();
	$('.ExahangeCourseList').hide();

	$(window).resize(function () {
		$('.SplitterBar').css("top", 50);
		$('.SplitterBottomPane').css("top", 162);
	});

	$('ul.tabs li').live('click', function () {
		//1. remove tab_on class
		$(this).parent().children('li').removeClass('tab-selected');
		//2. add tab_on class on the current li.
		$(this).addClass('tab-selected');
	});

	$('ul.menu li').bind('click', function () {
		//1. remove tab_on class
		$('ul.menu li').removeClass('menu-selected');
		//2. add tab_on class on the current li.
		$(this).addClass('menu-selected');
		
		switch ($(this).attr('id')) {
			case 'menuSchedule':				
				$('#function_MySchedule, #function_history').hide();
				$('#function_Search').show();
				break;
			case 'menuHistory':
				$('#function_MySchedule, #function_Search').hide();
				$('#function_history').show();
				break;
			default:
				$('#function_Search, #function_history').hide();
				$('#function_MySchedule').show();
		}
	});

	$('ul.historyTabs li').bind('click', function () {
		switch ($(this).index()) {
			case 1: //調課
				$('.SubstituteCourseList').hide();
				$('.ExahangeCourseList').show(); 
				break;
			default: //代課
				$('.ExahangeCourseList').hide();
				$('.SubstituteCourseList').show();
		}
	});

	$('#scrollbar_handle').draggable({ axis: 'y', containment: 'parent' });
	if (($('#menu').height() - $('#scrollbar_handle').height()) > 0) {
		$('#scrollbar_handle').bind('drag', function (event, info) {
			var height1 = $('#menu').height() - $('#scrollbar_track').height();
			if (height1 > 0) {
				x = ($('#menu').height() - $('#scrollbar_track').height()) / ($('#scrollbar_track').height() - $('#scrollbar_handle').height());
				$('#menu').css("margin-top", -(info.position.top * x));
			}
		});
	}

	/*	Splitter start	*/
	// $('.Splitter').height($(document).height()-200);
	$('.SplitterBar').draggable({ axis: 'y', containment: 'parent' });
	$('.SplitterBar').bind("drag", function (even, info) {
		var TopPane_height = parseInt($('.SplitterBar').css("margin-top")) + info.position.top;
		$('.SplitterTopPane').height(TopPane_height);
		var BottomPane_height = TopPane_height + $('.SplitterBar').outerHeight();
		$('.SplitterBottomPane').css("top", BottomPane_height);
	});


	/*	autocomplete start	*/
	$.widget("custom.catcomplete", $.ui.autocomplete, {
		_renderMenu: function (ul, items) {
			var self = this,
			currentCategory = "";
			$.each(items, function (index, item) {
				if (item.category != currentCategory) {
					ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
					currentCategory = item.category;
				}
				self._renderItem(ul, item);
			});
		}
	});

	var autocomplete_data = [], getSearch;
	$("#search1").catcomplete({
		delay: 0,
		source: function (req, add) {
			doSearch(req, add);
			// getSearch = add;
		},
		select: function (event, uCategory) {
			$(".search-text, .searchTabs, .searchTabContent, #condition").html("");
			DoGetSchedule(uCategory, 'search');			
		}
	})
		.focus(function () {
			$("#search1").removeClass("inputerror");
			$("#input_msg").html("");
		})
	;


	function doSearch(req, add) {
		var resp1, resp2, resp3;
		var search_text = req.term;
		var retSearchList = [];

		function doIt(add) {
			// if( resp1 && resp2 && resp3 && (req.term==$("#search").val()) ){
			if (resp1 && resp2 && resp3) {
				// console.log(resp1);
				// console.log(resp2);
				// console.log(resp3);
				retSearchList = resp1.concat(resp2, resp3);
				// console.log(retSearchList);
				autocomplete_data = retSearchList;
				// getSearch(autocomplete_data);
				add(autocomplete_data);
			}
		}
		_connection.send({
			service: "default.GetTeachers",
			body: '<Request><TeacherName>%' + search_text + '%</TeacherName></Request>',
			result: function (response, error, http) {
				var data1 = [];
				$(response.Teachers.Teacher).each(function (index, item) {
//					var nickname = (item.Nickname != '') ? '(' + item.Nickname + ')' : '';
					data1.push({
						label: item.TeacherName,
						value: item.TeacherName,
						category: '教師',
						categoryid: 'T',
						myid: item.ID
					});
				});
				resp1 = data1;
				doIt(add);
			}
		});
		_connection.send({
			service: "default.GetClasses",
			body: '<Request><ClassName>%' + search_text + '%</ClassName></Request>',
			result: function (response, error, http) {
				var data2 = [];
				$(response.Classes.Class).each(function (index, item) {
					data2.push({
						label: item.ClassName,
						value: item.ClassName,
						category: '班級',
						categoryid: 'C',
						myid: item.ID
					});
				});
				resp2 = data2;
				doIt(add);
			}
		});
		_connection.send({
			service: "default.GetClassrooms",
			body: '<Request><ClassroomName>%' + search_text + '%</ClassroomName></Request>',
			result: function (response, error, http) {
				var data3 = [];
				$(response.Classrooms.Classroom).each(function (index, item) {
					data3.push({
						label: item.Name,
						value: item.Name,
						category: '場地',
						categoryid: 'CR',
						myid: item.Uid
					});
				});
				resp3 = data3;
				doIt(add);
			}
		});
	}

	//print
	$('.print-button').bind('click', function () { window.print(); });

});

