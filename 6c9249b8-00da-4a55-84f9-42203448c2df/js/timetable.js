$(document).ready(function () {
	//	autocomplete start
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
			if (resp1 && resp2 && resp3) {
				retSearchList = resp1.concat(resp2, resp3);
				autocomplete_data = retSearchList;
				add(autocomplete_data);
			}
		}
		_connection.send({
			service: "default.GetTeachers",
			body: '<Request><TeacherName>%' + search_text + '%</TeacherName></Request>',
			result: function (response, error, http) {
				var data1 = [];
				$(response.Teachers.Teacher).each(function (index, item) {
					var nickname = (item.Nickname != '') ? '(' + item.Nickname + ')' : '';
					data1.push({
					  label: item.TeacherName + nickname,
					  value: item.TeacherName + nickname,
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
});

