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
	 * 取得某天當周的星期幾是幾月幾日
	 * Properties：某日期, 要取得的星期(1~7，7代表星期日), 回傳的樣式
	 * 樣式0: 不處理
	 * 樣式1: yyyy/m/d 不補0
	 * 樣式2: yyyy/mm/dd 補0
	 * reutrn: 日期
	*/
	$.funGetWeekday = function(date1, x, style) {
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
	};

	$.funStr2Date = function(str1) {
		var ret, strDate, strTime;
		var n = str1.split(" "); //分成日期、時間2012-01-04 00:00:00
		var strDate = n[0].split("-"); //拆解日期
		ret = new Date(strDate[1] + "/" + strDate[2] + "/" + strDate[0] + " " + n[1]);
		return ret;
	};

	//瀏覽的當周
	$.funInThisWeek = function(scopedate, checkdate) {
		var weekMonday = funGetWeekday(scopedate, 1, 1);
		weekMonday = (Date.parse(weekMonday)).valueOf();

		var weekSunday = funGetWeekday(scopedate, 7, 1);
		weekSunday = (Date.parse(weekSunday)).valueOf();

		var MycheckDate = checkdate;
		MycheckDate = $.formatDate(MycheckDate, 'yyyyMMdd');
		MycheckDate = (Date.parse(MycheckDate)).valueOf();

		return (MycheckDate >= weekMonday && MycheckDate <= weekSunday);
	};

	//大於等於瀏覽的當周
	$.funInAfterWeek = function(scopedate, checkdate) {
		var weekMonday = funGetWeekday(scopedate, 1, 1);
		weekMonday = (Date.parse(weekMonday)).valueOf();

		var MycheckDate = checkdate;
		MycheckDate = $.formatDate(MycheckDate, 'yyyyMMdd');
		MycheckDate = (Date.parse(MycheckDate)).valueOf();

		// TODO: 還原成非測試版本
		//return (MycheckDate >= weekMonday);
		return true;
	};

	$.funGetDayName = function(x) {
		dayNames = ['', '一', '二', '三', '四', '五', '六', '日'];
		return dayNames[x];
	};

	$.funGetNearWeekday = function(date1, weekset) {
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
	};

	// 排序
	$.by = function(name, minor, order) {
	    return function (o, p, d) {
	        var a, b, d;
	        d = ( d ==='desc') ? d: 'asc';
	        if (o && p && typeof o === 'object' && typeof p === 'object') {
	            a = o[name];
	            b = p[name];
	            if (a === b) {
	                return typeof minor === 'function' ? minor(o, p, d) : 0;
	            }
	            if (typeof a === typeof b) {
	                if (d === 'desc') {
	                    return a - b;
	                } else {
	                    return b - a;
	                }
	            }
	            return typeof a < typeof b ? -1 : 1;
	        } else {
	            throw {
	                name: 'Error',
	                message: 'Expected an object when sorting by ' + name
	            };
	        }
	    };
	};

	// 浮點運算
	$.FloatMath = function (x, operators, y) {
        var arg1,
            arg2,
            e,
            m,
            r1,
            r2;

        x = Number(x);
        y = Number(y);
        arg1 = x + '';
        arg2 = y + '';
        try {
            r1 = arg1.split(".")[1].length;
        } catch (_error) {
            e = _error;
            r1 = 0;
        }
        try {
            r2 = arg2.split(".")[1].length;
        } catch (_error) {
            e = _error;
            r2 = 0;
        }
        m = Math.max(r1, r2);
        switch (operators) {
        case "+":
            return ($.FloatMath(x, '*', Math.pow(10, m)) + $.FloatMath(y, '*', Math.pow(10, m))) / Math.pow(10, m);
        case "-":
            return ($.FloatMath(x, '*', Math.pow(10, m)) - $.FloatMath(y, '*', Math.pow(10, m))) / Math.pow(10, m);
        case "*":
            m = r1 + r2;
            return (Number(arg1.replace(".", "")) * Number(arg2.replace(".", ""))) / Math.pow(10, m);
        case "/":
            return $.FloatMath(x, '*', Math.pow(10, m)) / $.FloatMath(y, '*', Math.pow(10, m));
        default:
            return '';
        }
    };

})(jQuery);

