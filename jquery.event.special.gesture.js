/*!
 * jQuery Gestureable Plugin
 * Examples at: http://jqsandbox.mrburly.com:8888/testing-of-gesture-special-event.html (unstable location)
 * Copyright (c) 2009 Lance Caraccioli
 * Version: 0.01 (4-APR-2009)
 * Depends: jquery 1.3+
 * Dual licensed under the MIT and GPL licenses.
 * http://docs.jquery.com/License
 *
 * Adapted from the work of: Adrien Friggeri (http://random.friggeri.net/jquery-gestures/)
 */
(function($) {
    $.fn.gesture = function(fn){
        return fn ? this.bind('gesture', fn) : this.trigger('gesture');
    };
    $.event.special.gesture = {
        setup: function(data, namespaces) {
            var me = $(this);
            me.bind('mousedown', $.event.special.gesture.mousedown);
            me.bind('mousemove', $.event.special.gesture.mousemove);
            me.bind('mouseup', $.event.special.gesture.mouseup);
            me.data('gestureState', {
		        active:false,
		        current:{x:0, y:0},
		        previous:{x:0, y:0},
		        gestureChain:[],
		        bound:[]
	        });
        },

        teardown: function(namespaces) {
            var me = $(this);
            me.unbind('mousedown', $.event.special.gesture.mousedown);
            me.unbind('mousemove', $.event.special.gesture.mousemove);
            me.unbind('mouseup', $.event.special.gesture.mouseup);
            me.data('gestureState', {});
        },

        mousedown: function(event) {
            event.preventDefault();
            var me = $(this);
            var gestureState = me.data('gestureState');
	        gestureState.active = true;
	        gestureState.previous.x = event.clientX;
	        gestureState.previous.y = event.clientY;
	        me.data('gestureState',gestureState);
	
        },
        mousemove: function(event) {
            var me = $(this);
            var gestureState = me.data('gestureState');
	        if(gestureState.active){
	            gestureState.current.x = event.clientX;
	            gestureState.current.y = event.clientY;
	            me.data('gestureState', gestureState);//the step call will use the gestureState of the current object so save down the current location of the event
		        if (step.call(me)){
           			//after a successful step prepare for the next step by updating the previous position to be the one we just processed
			        gestureState.previous.x=gestureState.current.x;
			        gestureState.previous.y=gestureState.current.y;
            		me.data('gestureState', gestureState);		        
		        }
	        }
        },
        mouseup: function(event) {
			var me = $(this);
			var gestureState = me.data('gestureState');
			if (gestureState.active){
				gesture = getGesture.call(me);
				if (gesture != null){
				    //console.debug(gesture);
				    gestureState.active=false;
				    gestureState.gestureChain = [];
				    me.data('gestureState', gestureState);
				    event.type = 'gesture';
				    event.gesture = gesture;
				    $.event.handle.apply(this, arguments);
				}
			}
		},
    };
    function step(){
        var me = $(this);
		var gestureState = me.data('gestureState');
		var mv = getLastMove.call(me);
		if (mv != null) {
			if (gestureState.gestureChain[gestureState.gestureChain.length-1] != mv) {
				gestureState.gestureChain.push(mv);
			}
            return true;//a new move was found
		}
		return false;//a new move was not found
    };
    
    function getLastMove(){
		var me = $(this);
		var gestureState = me.data('gestureState');
		var diff = {
			x:gestureState.current.x-gestureState.previous.x,
			y:gestureState.current.y-gestureState.previous.y
		};
		var mv = null;
		if (Math.abs(diff.x) > Math.abs(diff.y)) {
			if (diff.x <= -10){mv = 'L';}
			else if (diff.x >= 10){mv = 'R';}
		} else {
			if (diff.y <= -10){mv = 'U';}
			else if (diff.y >= 10){mv = 'D';}
		}
		return mv;
	};
	function getGesture(){
		var me = $(this);
		var gestureState = me.data('gestureState');
		if (gestureState.gestureChain.length) {
			var gesture = gestureState.gestureChain.join('');
            return (gesture);
		}
		return(null);
	}
})(jQuery);
