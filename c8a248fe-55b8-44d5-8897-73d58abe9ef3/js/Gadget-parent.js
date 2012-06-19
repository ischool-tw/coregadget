/// <reference path="../include/jquery-1.7.2.min.js"/>
var public_connection;
var parent_connection = gadget.getContract("auth.parent");
var myparent = {};
myparent.parentPosition = false;

parent_connection.ready(function () {
	DrawingChildrenList();
	DrawingParentInto();
});

myparent.setParentRelationship = function (parentCode, idNumber, relationship) {
	public_connection = public_connection || gadget.getContract("parentguest");
	public_connection.send({
		service: 'Parent.SetParentRelationship',
		body: {
			Request: {
				ParentCode: parentCode,
				IDNumber: idNumber,
				Relationship: relationship
			}
		},
		result: function (response, error, http) {
			if (error) {
				switch (error.dsaError.header.DSFault.Fault.Code) {
					case '001':
						$('#ParentCode, #IDNumber').addClass('inputerror');
						break;
					case '002':
						$('#ParentCode').addClass('inputerror');
						break;
				}
				alert(error.dsaError.message);
			} else {
				if (myparent.parentPosition == true) {
					DrawingChildrenList();					
					alert('設定完成!');
				} else {
					alert('設定完成!請重新登入本系統，以獲得完整的功能。');
					$('.message').html('關係設定完成，請重新登入本系統，以獲得完整的功能，謝謝您。');
					$('#send').hide();
				}				
			}
		}
	});
};

myparent.childrenList = function (e) {
//	parent_connection.ready(function () {
		parent_connection.send({
			service: 'My.Children',
			body: '',
			result: function (response, error, http) {
				if (error) {
					console.log(error);
				} else {
					var tempHtmlA = '', tempHtmlB = '', tempHtml = '';
					$(response.Children.Child).each(function (index, item) {
						tempHtml += '<tr>';
						tempHtml += '<td>' + item.Name + '</td>';
						tempHtml += '<td>' + item.ClassName + '</td>';
						tempHtml += '<td>' + item.SeatNo + '</td>';
						tempHtml += '<td>' + item.Relationship + '</td>';
						tempHtml += '</tr>';
					});

					tempHtmlA = '<table class="linear"><thead><tr><th>姓名</th><th>班級</th><th>座號</th><th>關係</th></tr></thead>';
					tempHtmlA += '<tbody>';
					tempHtmlB = '</tbody></table>';

					$(e).html(tempHtmlA + tempHtml + tempHtmlB);
				}
			}
		});
//	});

};

myparent.parentInto = function () {
	var tempHtmlA = '', tempHtmlB = '', tempHtml = '';
	//	parent_connection.ready(function () {
	var funSetParentInfo = function (updateValue) {
		parent_connection.send({
			service: 'My.UpdatePersonalInfo',
			body: {
				Request: {
					Parent: updateValue
				}
			},
			result: function (response, error, http) {
				if (error) {
					console.log(error);
				}
			}
		});
	};

	var funGetParentInfo = function (e) {
		parent_connection.send({
			service: 'My.GetPersonalInfo',
			body: '',
			result: function (response, error, http) {
				if (error) {
					console.log(error);
				} else {
					$(response.Parent).each(function (index, item) {
						tempHtml += '<tr><th>姓名：</th><td><span id="edit_Name" class="editable">' + item.Name + '</span></td></tr>';
						tempHtml += '<tr><th>電話：</th><td><span id="edit_CellPhone" class="editable">' + item.CellPhone + '</span></td></tr>';
						tempHtml += '<tr><th>電子信箱：</th><td><span id="edit_EMail" class="editable">' + item.EMail + '</span></td></tr>';
						//自訂欄位 item.Extension.Field1
					});

					tempHtmlA = '<table class="grid">';
					tempHtmlB = '</table>';

					$(e).html(tempHtmlA + tempHtml + tempHtmlB);
					myparent.init_InlineEdit();
				}
			}
		});
	};

	return {
		set_ParentInfo: function (updateValue) {
			funSetParentInfo(updateValue);
		},
		get_ParentInfo: function (e) {
			funGetParentInfo(e);
		}
	};

	//	});
}();


var DrawingChildrenList = function () {
	myparent.childrenList('.childrenList');
};

var DrawingParentInto = function () {
	myparent.parentInto.get_ParentInfo('.parentProfile');
};
