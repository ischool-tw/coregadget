/// <reference path="../include/jquery-1.7.2.min.js"/>
$(document).ready(function () {
	$('#send').bind('click', function () {
		myparent.setParentRelationship($('#ParentCode').val(), $('#IDNumber').val(), $('#Relationship').val());
	});

});
