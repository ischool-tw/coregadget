
var CreateCallbackQueue = function () {
	//  結構為2維陣列的工作排程，第1維表示單執行緒，第2維表示多執行緒
	var _Queues = [];

	//  執行中的工作
	var _Current = [];

	//  尚未完成的工作
	var _Finished = [];

	//  記錄所有錯誤訊息
	var _InternalError = [];

	//  執行目前工作中的每一個子工作
	var _Execute = function (object) {
		//  _Current 中的工作，全部一起執行(單執行緒與多執行緒皆適用)     
		while (object.length > 0) {
			var o = object.shift();
			if (jQuery.isFunction(o)) {
				o();
			} else {
				_InternalError.push("函式：" + arguments.callee + " 無法執行。");
			}
		}
	};

	//  執行目前工作
	var _DoCurrentJob = function () {
		_Current = _Queues.shift();
		_Finished = _Current.slice(0);
		_Execute(_Current);
	};

	return {
		Push: function (object) {
			if (typeof object === 'object' && typeof object.length === 'number' && typeof object.splice === 'function' && !(object.propertyIsEnumerable('length'))) {
				_Queues.push(object);
			} else {
				_Queues.push([object]);
			}
		},

		Start: function () {
			if (_Queues.length === 0) {
				_InternalError.push('無工作排程可執行。');
				return;
			}
			_DoCurrentJob();
		},

		JobFinished: function () {
			_Finished.shift();

			if (_Queues.length === 0 && _Finished.length === 0 && _Current.length === 0) {
				return;
			}

			if (_Finished.length === 0) {
				_DoCurrentJob();
			}
		},

		Clear: function () {
			_Queues = [];
			_Current = [];
			_Finished = [];
			_InternalError = [];
		}
	}
};
