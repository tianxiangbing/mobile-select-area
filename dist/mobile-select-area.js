/*
 * Created with Sublime Text 2.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-03-31
 * Time: 09:49:11
 * Contact: 55342775@qq.com
 */
;
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$', 'dialog'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.MobileSelectArea = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($, Dialog) {
	var MobileSelectArea = function() {
		var rnd = Math.random().toString().replace('.', '');
		this.id = 'scroller_' + rnd;
		this.scroller;
		this.data;
		this.index = 0;
		this.value = [0, 0, 0];
		this.oldvalue;
		this.text = ['', '', ''];
		this.level = 3;
		this.mtop = 30;
		this.separator = ' ';
	};
	MobileSelectArea.prototype = {
		init: function(settings) {
			this.settings = $.extend({eventName:'click'}, settings);
			this.trigger = $(this.settings.trigger);
			level = parseInt(this.settings.level);
			this.level = level > 0 ? level : 3;
			this.trigger.attr("readonly", "readonly");
			this.value = (this.settings.value && this.settings.value.split(",")) || [0, 0, 0];
			this.text = this.settings.text || this.trigger.val().split(' ') || ['', '', ''];
			this.oldvalue = this.value.concat([]);
			this.clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
			this.clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
			this.getData();
			this.bindEvent();
		},
		getData: function() {
			var _this = this;
			if (typeof this.settings.data == "object") {
				this.data = this.settings.data;
			} else {
				$.ajax({
					dataType: 'json',
					cache: true,
					url: this.settings.data,
					type: 'GET',
					success: function(result) {
						_this.data = result.data;
					},
					accepts: {
						json: "application/json, text/javascript, */*; q=0.01"
					}
				});
			}
		},
		bindEvent: function() {
			var _this = this;
			this.trigger[_this.settings.eventName](function(e) {
				var dlgContent = '';
				for (var i = 0; i < _this.level; i++) {
					dlgContent += '<div></div>';
				};
				$.confirm('<div class="ui-scroller-mask"><div id="' + _this.id + '" class="ui-scroller">' + dlgContent + '<p></p></div></div>', null, function(t, c) {
					if (t == "yes") {
						_this.submit()
					}
					if (t == 'no') {
						_this.cancel();
					}
					this.dispose();
				}, {
					width:320,
					height:180
				});
				_this.scroller = $('#' + _this.id);
				_this.format();
				var start = 0,
					end = 0
				_this.scroller.children().bind('touchstart', function(e) {
					start = (e.changedTouches||e.originalEvent.changedTouches)[0].pageY;
				});
				_this.scroller.children().bind('touchmove', function(e) {
					end = (e.changedTouches||e.originalEvent.changedTouches)[0].pageY;
					var diff = end - start;
					var dl = $(e.target).parent();
					if (dl[0].nodeName != "DL") {
						return;
					}
					var top = parseInt(dl.css('top') || 0) + diff;
					dl.css('top', top);
					start = end;
					return false;
				});
				_this.scroller.children().bind('touchend', function(e) {
					end = (e.changedTouches||e.originalEvent.changedTouches)[0].pageY;
					var diff = end - start;
					var dl = $(e.target).parent();
					if (dl[0].nodeName != "DL") {
						return;
					}
					var i = $(dl.parent()).index();
					var top = parseInt(dl.css('top') || 0) + diff;
					if (top > _this.mtop) {
						top = _this.mtop;
					}
					if (top < -$(dl).height() + 60) {
						top = -$(dl).height() + 60;
					}
					var mod = top / _this.mtop;
					var mode = Math.round(mod);
					var index = Math.abs(mode) + 1;
					if (mode == 1) {
						index = 0;
					}
					_this.value[i] = $(dl.children().get(index)).attr('ref');
					_this.value[i] == 0 ? _this.text[i] = "" : _this.text[i] = $(dl.children().get(index)).html();
					for (var j = _this.level - 1; j > i; j--) {
						_this.value[j] = 0;
						_this.text[j] = "";
					}
					if (!$(dl.children().get(index)).hasClass('focus')) {
						_this.format();
					}
					$(dl.children().get(index)).addClass('focus').siblings().removeClass('focus');
					dl.css('top', mode * _this.mtop);
					return false;
				});
				return false;
			});
		},
		format: function() {
			var _this = this;
			var child = _this.scroller.children();
			this.f(this.data);
		},
		f: function(data) {
			var _this = this;
			var item = data;
			if (!item) {
				item = [];
			};
			var str = '<dl><dd ref="0">——</dd>';
			var focus = 0,
				childData, top = _this.mtop;
			if (_this.index !== 0 && _this.value[_this.index - 1] == "0") {
				str = '<dl><dd ref="0" class="focus">——</dd>';
				_this.value[_this.index] = 0;
				_this.text[_this.index] = "";
				focus = 0;
			} else {
				if (_this.value[_this.index] == "0") {
					str = '<dl><dd ref="0" class="focus">——</dd>';
					focus = 0;
				}
				for (var j = 0, len = item.length; j < len; j++) {
					var pid = item[j].pid || 0;
					var id = item[j].id || 0;
					var cls = '';
					if (_this.value[_this.index] == id) {
						cls = "focus";
						focus = id;
						childData = item[j].child;
						top = _this.mtop * (-j);
					};
					str += '<dd pid="' + pid + '" class="' + cls + '" ref="' + id + '">' + item[j].name + '</dd>';
				}
			}
			str += "</dl>";
			var newdom = $(str);
			newdom.css('top', top);
			var child = _this.scroller.children();
			$(child[_this.index]).html(newdom);
			_this.index++;
			if (_this.index > _this.level - 1) {
				_this.index = 0;
				return;
			}
			_this.f(childData);
		},
		submit: function() {
			this.oldvalue = this.value.concat([]);
			if (this.trigger[0].nodeType == 1) {
				//input
				this.trigger.val(this.text.join(this.separator));
				this.trigger.attr('data-value', this.value.join(','));
			}
			this.trigger.next(':hidden').val(this.value.join(','));
			this.settings.callback && this.settings.callback.call(this,this.scroller,this.text,this.value);
		},
		cancel: function() {
			this.value = this.oldvalue.concat([]);
		}
	};
	return MobileSelectArea;
});