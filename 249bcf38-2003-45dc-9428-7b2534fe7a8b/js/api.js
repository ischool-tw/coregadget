/// <reference path="../include/jquery-1.7.2.min.js"/>

(function ($) {
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



	//ex: s.sort($.by('desc', 'last', $.by('asc', 'first')));
	//ex: s.sort($.by('asc', 'last'));
	$.by = function(model, name, minor) {
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
                        b = parseInt(b, 10);
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


    /*
     * 解析日期為 ISO8601 格式 ex.$.ISODateString(new Date('2012/11/26 10:48:00'))
    */
    $.ISODateString = function (d) {
        function pad(n){return n<10 ? '0'+n : n};
        return d.getUTCFullYear()+'-'
              + pad(d.getUTCMonth()+1)+'-'
              + pad(d.getUTCDate())+'T'
              + pad(d.getUTCHours())+':'
              + pad(d.getUTCMinutes())+':'
              + pad(d.getUTCSeconds())+'Z';
    };

    /*
     * HTMLEncode
    */
    $.htmlEncode = function (value) {
        return $('<div/>').text(value).html();
    };

    $.htmlDecode = function (value) {
        return $('<div/>').html(value).text();
    };
})(jQuery);

