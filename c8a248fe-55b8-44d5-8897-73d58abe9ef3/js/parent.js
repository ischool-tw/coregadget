/// <reference path="../include/jquery-1.7.2.min.js"/>
$(document).ready(function () {
	$('.parentInfo').show();
	$('.relationshipContainer, .createRelationship').hide();

	$('ul.tabs li').bind('click', function () {
		//1. remove tab_on class
		$(this).parent().children('li').removeClass('tab-selected');
		//2. add tab_on class on the current li.
		$(this).addClass('tab-selected');

		switch ($(this).index()) {
			case 0: //家長個人資料
				$('.parentInfo').show();
				$('.relationshipContainer, .createRelationship').hide();
				break;
			case 1: //已建立的親屬關係表
				$('.parentInfo, .createRelationship').hide();
				$('.relationshipContainer').show();
				break;
			default: //加入親屬帳號
				$('.parentInfo, .relationshipContainer').hide();
				$('.createRelationship').show();
		}
	});

	$('#send').bind('click', function () {
		myparent.setParentRelationship($('#ParentCode').val(), $('#IDNumber').val(), $('#Relationship').val());
	});

});

myparent.init_InlineEdit = function (e) {
	$('.editable').inlineEdit({
		buttons: '',
		saveOnBlur: true,
		save: function (event, hash) {
			var saveObj = {};
			var id_value = (this.id).substr(5); //remove 'edit_'
			saveObj[id_value] = hash.value;
			myparent.parentInto.set_ParentInfo(saveObj);
		}
	});
};
