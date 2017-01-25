/*

	此 Singleton 物件提供一些工具函式。
*/
var ischool = ischool || {};
ischool.chooseWish = ischool.chooseWish || {};

ischool.chooseWish.Util = function() {

	return {

		showMsg: function(msg) {
			alert(msg);
		},

		showStartupError : function(msg) {
			$('#divPopupMsg').html("<span style='color:red;'>" + msg + '</span>');
		},

		/* 將 DateTime 物件以固定格式輸出 */
		formatDateTime: function(dt) {
			var curr_date = dt.getDate();
			if (curr_date < 10) curr_date = "0" + curr_date ;

		    var curr_month = dt.getMonth() + 1; //Months are zero based
		    if (curr_month < 10) curr_month = "0" + curr_month ;

		    var curr_year = dt.getFullYear();

		    var curr_hour = dt.getHours();
		    if (curr_hour < 10) curr_hour = "0" + curr_hour ;

		    var curr_minute = dt.getMinutes() ;
		    if (curr_minute < 10) curr_minute = "0" + curr_minute ;

		    var curr_second = dt.getSeconds();
		    if (curr_second < 10) curr_second = "0" + curr_second ;

		    return curr_year + "/" + curr_month + "/" + curr_date + " " + curr_hour + ":" + curr_minute + ":" + curr_second ;
		},

		//用來處理 DSA 回傳的資料：因為當 DSA 只回傳一筆時為單一物件，沒有資料時為 undefined, 多筆時為 array
		//所以透過此函數要全部轉換成 array
		handleArray : function(obj) {
			var result ;
			//只回傳一筆時為單一物件，沒有資料時為 undefined, 多筆時為 array
			if (!$.isArray(obj)) {
				result = [];
				 if (obj) {
					result.push(obj);
				}
			}	
			else {
				result = obj ;
			}
			return result ;
		}
	}
}();