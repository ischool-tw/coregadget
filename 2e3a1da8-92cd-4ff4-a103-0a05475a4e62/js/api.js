/// <reference path="../include/jquery-1.7.2.min.js"/>

(function ($) {
	$.sort = function () {
		return this.pushStack([].sort.apply(this, arguments), []);
	};

	$.toFixedWidth = function (value, length, fill) {

		var result = value.toString();
		if (!fill) fill = '0';
		var padding = length - result.length;

		if (padding < 0) {
			result = result.substr(-padding);
		} else {
			for (var n = 0; n < padding; n++)
				result = fill + result;
		}
		return result;
	};

	$.formatDate = function (date, pattern) {
		var result = [];
		var srcPattern = pattern;
		while (pattern.length > 0) {
			$.formatDate.patternParts.lastIndex = 0;
			var matched = $.formatDate.patternParts.exec(pattern);
			if (matched) {
				result.push(
					$.formatDate.patternValue[matched[0]].call(this, date)
				);
				pattern = pattern.slice(matched[0].length);
			} else {
				result.push(pattern.charAt(0));
				pattern = pattern.slice(1);
			}
		}
		switch (srcPattern) {
			case 'yyyyMd':
				return result[0] + '/' + result[1] + '/' + result[2];
				break;
			case 'yyyyMMdd':
				return result[0] + '/' + result[1] + '/' + result[2];
				break;
			case 'yyyyMMddW':
				return result[0] + '/' + result[1] + '/' + result[2] + '(' + result[3] + ')';
				break;
			case 'HHmm':
				return result[0] + ':' + result[1];
				break;
			default:
				return result.join('');
		}
	};

	$.formatDate.patternParts =
    /^(yy(yy)?|M(M(M(M)?)?)?|d(d)?|W|a|H(H)?|h(h)?|m(m)?|s(s)?|S|yyyyMMdd(W)?|yyyyMd|HHmm)/;

	$.formatDate.monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June', 'July',
		'August', 'September', 'October', 'November', 'December'
	  ];

	$.formatDate.dayNames = ['日', '一', '二', '三', '四', '五', '六'];

	$.formatDate.patternValue = {
		yy: function (date) {
			return $.toFixedWidth(date.getFullYear(), 2);
		},
		yyyy: function (date) {
			return date.getFullYear().toString();
		},
		MMMM: function (date) {
			return $.formatDate.monthNames[date.getMonth()];
		},
		MMM: function (date) {
			return $.formatDate.monthNames[date.getMonth()].substr(0, 3);
		},
		MM: function (date) {
			return $.toFixedWidth(date.getMonth() + 1, 2);
		},
		M: function (date) {
			return date.getMonth() + 1;
		},
		dd: function (date) {
			return $.toFixedWidth(date.getDate(), 2);
		},
		d: function (date) {
			return date.getDate();
		},
		W: function (date) {
			return $.formatDate.dayNames[date.getDay()];
		},
		HH: function (date) {
			return $.toFixedWidth(date.getHours(), 2);
		},
		H: function (date) {
			return date.getHours();
		},
		hh: function (date) {
			var hours = date.getHours();
			return $.toFixedWidth(hours > 12 ? hours - 12 : hours, 2);
		},
		h: function (date) {
			return date.getHours() % 12;
		},
		mm: function (date) {
			return $.toFixedWidth(date.getMinutes(), 2);
		},
		m: function (date) {
			return date.getMinutes();
		},
		ss: function (date) {
			return $.toFixedWidth(date.getSeconds(), 2);
		},
		s: function (date) {
			return date.getSeconds();
		},
		S: function (date) {
			return $.toFixedWidth(date.getMilliseconds(), 3);
		},
		a: function (date) {
			return date.getHours() < 12 ? 'AM' : 'PM';
		}
	};

	/*
	 * 解析日期為 ie、safari 可支援的格式
	*/
	$.parseDate = function (input) {
		var parts = input.match(/(\d+)/g);
		if (parts) {
			if (parts[3] && parts[4] && parts[5]) {
				return new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]);
			} else {
				return new Date(parts[0], parts[1]-1, parts[2]);
			}
		} else {
			return '';
		}
	};

	/*
	 * 將xml、json轉換中不支援的字元取代為全型
	*/
	$.replaceChar = function (input) {
        var chars = [
        	{key:'/', value:'／'}, // &#47;
            {key:'\\\\', value:'＼'}, // &#92;
            {key:',', value:'，'}, // &#44;
            {key:'<', value:'＜'}, // &lt;
            {key:'>', value:'＞'} // &gt;
        ];
        // 下列方式 DSA 儲存的sql會轉錯
        // var chars = [
        // 	{key:'/', value:'&#47;'}, // &#47;
        //     {key:'\\\\', value:'&#92;'}, // &#92;
        //     {key:',', value:'&#44;'}, // &#44;
        //     {key:'<', value:'&lt;'}, // &lt;
        //     {key:'>', value:'&gt;'} // &gt;
        // ];

        chars.forEach(function(c){
          var re = new RegExp(c.key, "g");
          input = input.replace(re, c.value);
        });
        return input;
	};

})(jQuery);

/*
 * 取得某天當周的星期幾是幾月幾日
 * Properties：某日期, 要取得的星期(1~7，7代表星期日), 回傳的樣式
 * 樣式0: 不處理
 * 樣式1: yyyy/m/d 不補0
 * 樣式2: yyyy/mm/dd 補0
 * reutrn: 日期
*/
function funGetWeekday(date1, x, style) {
	var ret;

	// 現在日期
	var myDate = new Date(date1);

	// 現在是星期幾，日為0、一為1、二為2、三為3、四為4、五為5、六為6
	var myDay = myDate.getDay();

	// 設成日為7
	if (myDay == 0) {
		myDay = 7;
	}

	var myStartDate = new Date(date1);
	// 將日期變成目前禮拜的星期一，再加減日期
	myStartDate.setDate(myStartDate.getDate() + (0 - (myDay - 1)) + (x - 1));

	switch (style) {
		case 1:
			ret = $.formatDate(myStartDate, 'yyyyMd');
			break;
		case 2:
			ret = $.formatDate(myStartDate, 'yyyyMMdd');
			break;
		default:
			ret = myStartDate;
	}
	return ret;
}

function funStr2Date(str1) {
	var ret, strDate, strTime;
	var n = str1.split(" "); //分成日期、時間2012-01-04 00:00:00
	var strDate = n[0].split("-"); //拆解日期
	ret = new Date(strDate[1] + "/" + strDate[2] + "/" + strDate[0] + " " + n[1]);
	return ret;
}

//瀏覽的當周
function funInThisWeek(scopedate, checkdate) {
	var weekMonday = funGetWeekday(scopedate, 1, 1);
	weekMonday = (Date.parse(weekMonday)).valueOf();

	var weekSunday = funGetWeekday(scopedate, 7, 1);
	weekSunday = (Date.parse(weekSunday)).valueOf();

	var MycheckDate = checkdate;
	MycheckDate = $.formatDate(MycheckDate, 'yyyyMMdd');
	MycheckDate = (Date.parse(MycheckDate)).valueOf();

	return (MycheckDate >= weekMonday && MycheckDate <= weekSunday);
}

//大於等於瀏覽的當周
function funInAfterWeek(scopedate, checkdate) {
	var weekMonday = funGetWeekday(scopedate, 1, 1);
	weekMonday = (Date.parse(weekMonday)).valueOf();

	var MycheckDate = checkdate;
	MycheckDate = $.formatDate(MycheckDate, 'yyyyMMdd');
	MycheckDate = (Date.parse(MycheckDate)).valueOf();

	// TODO: 還原成非測試版本
	//return (MycheckDate >= weekMonday);
	return true;
}

function funGetDayName(x) {
	dayNames = ['', '一', '二', '三', '四', '五', '六', '日'];
	return dayNames[x];
}

function funGetNearWeekday(date1, weekset) {
	var myDate = date1;
	var ret;
	switch (weekset.toLowerCase()) {
		case 'prev':
			myDate.setDate(myDate.getDate() - 7);
			ret = myDate;
			break;
		case 'next':
			myDate.setDate(myDate.getDate() + 7);
			ret = myDate;
			break;
		default:
			ret = date1;
	}
	return ret;
}

// sort
var by = function (model, name, minor) {
    return function (o, p) {
        var a, b;
        if (o && p && typeof o === 'object' && typeof p === 'object') {
            a = o[name];
            b = p[name];
            if (a === b) {
                return typeof minor === 'function' ? minor(o, p) : 0;
            }
            if (typeof a === typeof b) {
            	if (parseInt(a, 10) && parseInt(b, 10)) {
            		a = parseInt(a, 10);
            		b = parseInt(b, 10)
            	}

            	if (model === 'desc') {
                	return a > b ? -1 : 1;
                } else {
                	return a < b ? -1 : 1;
                }
            }
            return typeof a < typeof b ? -1 : 1;
        } else {
            throw {
                name: 'Error',
                message: 'Expected an object when sorting by ' + name
            }
        }
    };
};
//ex: s.sort(by('desc', 'last', by('first')));