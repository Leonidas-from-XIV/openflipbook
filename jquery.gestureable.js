/*!
 * jQuery Gestureable Plugin
 * Examples at: http://jqsandbox.mrburly.com:8888/testing-of-gestureable-plugin.html (unstable location)
 * Copyright (c) 2009 Lance Caraccioli
 * Version: 0.01 (4-APR-2009)
 * Depends: jquery.event.special.gesture.js http://jqsandbox.mrburly.lcdev/jquery.event.special.gesture.js (unstable location)
 * Dual licensed under the MIT and GPL licenses.
 * http://docs.jquery.com/License
 *
 * 
 */
(function($) {
	$.fn.gestureable = function(settings){
		settings = $.extend({},$.fn.gesture.defaults,settings);
		var me = $(this);
		me.data('handlers', []);
		me.each(function(){
			for (key in settings.handlers){
				bind.call($(this), key, settings.handlers[key]);
			}
			
		});
		me.gesture(handler);
	};
	$.fn.gesture.defaults = {
		handlers:[]
	};
	//private functions
	function bind(eventName, fn){
		if ((typeof fn)=='function'){
		    var me = $(this);
            var handlers = me.data('handlers');
			handlers[eventName]=fn;
			me.data('handlers', handlers);
		}
	};
	function handler(event){
		var me = $(this);
		var handlers = me.data('handlers');
		if (event.gesture) {
			fn = handlers[event.gesture];
			if (fn) {
				fn.call(me, event);
			}
		}
	}
})(jQuery);


