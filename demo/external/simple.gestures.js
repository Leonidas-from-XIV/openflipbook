/**************************************************************
*
* (simple) Gestures - recognize (simple) mouse gestures on elements. 
* 
* @info    : http://labs.d-xp.com/gestures/
* 
* @author  : Artur Heinze
* @version : 1.0
**************************************************************/

      
;(function($) {

  $.fn.extend({
    gestures: function(options) {
      return this.each(function() {
        new Gesture(this, options);
      });
    }
  });
  
  window['Gesture'] = function(){
    this.init.apply(this,arguments);
  };
  
  
  window['Gesture'].prototype = $.extend(
    window['Gesture'].prototype,
    {
      
      timerHnd : null,
      element  : null,
      history  : [],
      recorder : [],
      listen   : false,
      
      settings: {
        inputdelay: 800,
        callback: function(cmd){console.log(cmd);}
      },
      
      init: function($element,$settings){
        
        this.element = jQuery($element);
        this.settings = $.extend(this.settings,$settings);

        var $this  = this;
        
        this.element.bind('mousedown.gesture',function(e){
            
            if($this.timerHnd) clearTimeout($this.timerHnd);
            
            $this.recorder = [];
            $this.listen   = true;
            
        }).bind('mousemove.gesture',function(e){
              
              if(!$this.listen) return;
              $this.recorder.push({x:e.clientX,y:e.clientY});
            
        }).bind('mouseup.gesture',function(e){
                
                //if(!e.metaKey) return;
                
                $this.listen = false;
                
                $this.recorder.push({x:e.clientX,y:e.clientY});
                
                var cmd = $this.parseGesture();
                
                if(cmd) $this.history.push(cmd);
                
                var handler = function(){
                  if($this.history.length) $this.settings.callback.apply($this.element,[$this.history]);
                  $this.history = [];
                };
                
                $this.timerHnd = setTimeout(handler, $this.settings.inputdelay);
         }); 
      },
      
      parseGesture : function(){

            var recorder     = this.recorder;
            var historyCount = recorder.length;
            
            var strCmd = null;
            
            if(historyCount<15) return strCmd;
            
            var start = recorder[0];
            var end   = recorder[historyCount-1];
            var diffY = start.y - end.y;
            var diffX = start.x - end.x;
            
            //LEFT DOWN|UP GESTURE      
            if((Math.abs(diffY) > 30) && (start.x > end.x)){
              strCmd = (diffY<0) ? 'LD':'LU';
            }
            //RIGHT GESTURE
            if((Math.abs(diffY) > 30) && (start.x < end.x)){
              strCmd = (diffY<0) ? 'RD':'RU';
            }
            //LEFT GESTURE      
            if((Math.abs(diffY) < 30) && (start.x > end.x)){
              strCmd = 'L';
            }
            //RIGHT GESTURE
            if((Math.abs(diffY) < 30) && (start.x < end.x)){
              strCmd = 'R';
            }
            //DOWN GESTURE
            if((start.y < end.y) && (Math.abs(diffX) < 30)){
              strCmd = 'D';
            }
            //UP GESTURE
            if((start.y > end.y) && (Math.abs(diffX) < 30)){
              strCmd = 'U';
            }
            return strCmd;
      }

    }
  );

})(jQuery);