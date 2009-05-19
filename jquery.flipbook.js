/*!
 * jQuery Flipbook Plugin
 * written in 2009 by Marek Kubica <marek@xivilization.net>
 *
 * Dependencies:
 *  - jQuery 1.3.2 (http://jquery.com/)
 *  - jQuery UI 1.7.1 (http://jqueryui.com/)
 *  - jQuery Event Special Gesture (http://code.google.com/p/jquery-event-special-gesture/)
 *  - jQuery Preload (http://flesler.blogspot.com/2008/01/jquerypreload.html)
 */

(function($) {
    /* a closure-based class */
    var ImageManager = function (images) {
	var self = this;
	var currentPage = 0;

	self.getCurrentPages = function () {
            return [images[currentPage], 
  		    images[currentPage+1]];
	};

	self.turnNext = function () {
            currentPage += 2;
            return self.getCurrentPages();
	};

	self.turnPrevious = function () {
            currentPage -= 2;
            return self.getCurrentPages();
	};
    };

    function small_gesture(event) {
	/* called in mousedown of small images */
	var container = $(event.target).parent().parent();
	var manager = container.data('manager');
	var large = $(event.target).
            attr('src').
            replace(/small/, 'large');

	switch (event.gesture) {
	case 'U':
	case 'D':
            container.data('left').hide();
            container.data('right').hide();
            container.data('spacer').hide();
            container.data('zoomed').attr('src', large).show('clip');
            break;
	case 'R':
            var images = manager.turnPrevious();
            display_new_images(container, images, 'prev');
            break;
	case 'L':
            var images = manager.turnNext();
            display_new_images(container, images, 'next');
            break;
	}
    }

    function large_gesture(event) {
	var container = $(event.target).closest('div');
	switch (event.gesture) {
	case 'U':
	case 'D':
            $(event.target).hide();
            container.data('spacer').show();
            container.data('left').show();
            container.data('right').show();
	}
    }

    function disable_scroll(event) {
	/* Simply disables the dragging of elements */
	return false;
    }

    function display_new_images(container, images, orientation) {
	var left = container.data('left');
	var right = container.data('right');

	$([left, right]).each(function (index, value) {
	    // add the new image below
	    var new_content = $('<img src="' + images[index] 
				+ '_small.jpg" />');
	    new_content.css('position', 'absolute').
		css('top', 0).
		hide();
	    value.append(new_content);
	});

	// determine what to flip in which way
	switch (orientation) {
	case 'next':
	    fold([right, 'left'], [left, 'right']);
	    break;
	case 'prev':
	    fold([left, 'right'], [right, 'left']);
	    break;
	case 'initial':
	case undefined:
	    // show stuff without an effect
	    $([left, right]).each(function (index, value) {
		// show the next one and delete img:first
		$('img:first', value).next().show().prev().remove();
	    });
	}
    }

    function fold(first, second) {
	// options
	var effect = 'slide';
	var duration = undefined;

	// hide the first frame
	var first_old = $('img:first', first[0]);
	var first_new = first_old.next();
	var second_old = $('img:first', second[0]);
	var second_new = second_old.next();

	// move old image to front
	first_old.css('z-index', 1);
	// show the new image immediately (time: 0)
	first_new.show(effect, undefined, 0, function () {
            // after it is shown, hide the old one with an effect
            first_old.hide(effect, {direction: first[1]}, duration, function () {
  		// after that one is hidden, it is safe to remove it
  		first_old.remove();

  		// and now the same thing with the other side
  		second_new.show(effect, {direction: second[1]}, duration, function() {
  		    // after the effect finished, it is safe to remove the old element
  		    second_old.remove();
  		});
            });
	});
    }

    function updateProgress(div) {
	var percentage_display = $('<div></div>');
	div.append(percentage_display);
	div.data('percentage-display', percentage_display);

	var updater = function (stats) {
	    var percentage = Math.ceil((stats.loaded / stats.total) * 100);
	    percentage_display.text(percentage+'%');
	};
	return updater;
    }

    function doneProgress(div) {
	var finisher = function (stats) {
	    div.data('percentage-display').remove();
	    div.removeData('percentage-display');
	};
	return finisher;
    }

    jQuery.fn.flipbook = function (images) {
	/* jQuery entry point for this plugin */
	var div = this;
	// delete everything that was inside the div
	// (people might want to write an JavaScript-less fallback there)
	div.empty();

	// create an array with the names of all images
	var image_files = [];
	for (var i = 0; i < images.length; i++) {
	    image_files.push(images[i] + '_small');
	    image_files.push(images[i] + '_large');
	}

	$.preload(image_files, {
	    base: '',
	    ext: '.jpg',
	    onComplete: updateProgress(div),
	    onFinish: doneProgress(div)
	});

	var manager = new ImageManager(images);
	// take care that the number of images stays even
	images.unshift(null);
	images.push(null);
	// attach the manager to the data attribute
	div.data('manager', manager);

	// apply the style
	div.css('background-color', 'black').
            css('width', '900px').
            css('height', '650px').
            css('border', '2px dashed white');

	// create a spacer div and attach it
	var spacer = $('<div class="spacer"></div>').
            css('height', '162px');
	// add the spacer to the divs data
	div.data('spacer', spacer).
            // and append it to the div in the DOM
            append(spacer);

	// create the zoomed element
	var zoomed = $('<img />');
	zoomed.gestureable();
	zoomed.mouseup(large_gesture).
            mousedown(disable_scroll).
            hide();

	// add to the data attribute and add to DOM
	div.data('zoomed', zoomed).
            append(zoomed);

	// create the image holders, style them
	var left = $('<div><img /></div>').
            css('float', 'left');
	var right = $('<div><img /></div>').
            css('float', 'right');
	// add them to the data of the containing DIV
	div.data('left', left);
	div.data('right', right);

	// get the pages that should get displayed
	var currentImages = manager.getCurrentPages();
	display_new_images(div, currentImages, 'initial');

	$([left, right]).each(function (index, value) {
            value.css('width', '450px').
  		css('position', 'relative');
            // enable gestures
            value.gestureable();
            value.mouseup(small_gesture).
  		mousedown(disable_scroll);
            // add to the display
            div.append(value);
	});

	// return the passed object, since this is jQuery
	return div;
    };
})(jQuery);