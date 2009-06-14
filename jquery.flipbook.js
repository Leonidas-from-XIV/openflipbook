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

	/* goes to the next page and returns the images of that page */
	self.turnNext = function () {
            currentPage += 2;
            return self.getCurrentPages();
	};

	/* goes to the previous page and returns the images of that page */
	self.turnPrevious = function () {
            currentPage -= 2;
            return self.getCurrentPages();
	};

	/* determines whether turning to the next page makes any sense.
           there might not be any images to display */
	self.canTurnNext = function () {
	    // only if we are not at the last page
	    return currentPage < (images.length - 2);
	};

	/* determines whether turning to the previous page makes any sense */
	self.canTurnPrevious = function () {
	    // only if our current page is positive
	    return currentPage > 0;
	};
    };

    function small_gesture(gs) {
	/* called in mousedown of small images */
	console.log(gs);
	var target = $(this);
	var container = target.parent();
	console.log(container);

	if (!container.data('gesture-sensitive')) {
	    // short cut if an animation is playing already
	    return true;
	}
	else {
	    // deactivate any gestures until the currently
	    // processed one is done.
	    container.data('gesture-sensitive', false);
	}

	var manager = container.data('manager');
	console.log(target);
	// get the URL of the image that should be displayed
	var large = $('img:first', target).
            attr('src').
            replace(/small/, 'large');
	console.log(large);

	switch (event.gesture) {
	case 'U':
	case 'D':
            container.data('left').hide();
            container.data('right').hide();
            container.data('spacer').hide();

	    // get the large image and display it
	    $('img[src$=' + large +']', container).
		show('clip', undefined, undefined, function () {
		// re-activate gestures
		container.data('gesture-sensitive', true);
	    });

            break;
	case 'R':
	    if (manager.canTurnPrevious()) {
		var images = manager.turnPrevious();
		display_new_images(container, images, 'prev');
	    }
	    else {
		// shake the container to provide feedback
		container.effect('shake');
		container.data('gesture-sensitive', true);
	    }
            break;
	case 'L':
	    if (manager.canTurnNext()) {
		var images = manager.turnNext();
		display_new_images(container, images, 'next');
	    }
	    else {
		// not possible to turn, visual feedback
		container.effect('shake');
		container.data('gesture-sensitive', true);
	    }
            break;
	}
	return true;
    }

    function large_gesture(gs) {
	console.log("Running");
	var container = $(event.target).closest('div');
	console.log(gs);
	switch (event.gesture) {
	case 'U':
	case 'D':
            $(event.target).hide('clip', undefined, undefined, function () {
		container.data('spacer').show();
		container.data('left').show();
		container.data('right').show();
	    });
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
	    if (images[index] != null) {
		// create the image
		var new_content = $('<img src="' + images[index] 
				    + '_small.jpg" />');
	    }
	    else {
		// create a dummy-div instead of the image
		var new_content = $('<div></div>');
	    }

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
		$(':first', value).next().show().prev().remove();
	    });
	}
    }

    function fold(first, second) {
	// options
	var effect = 'slide';
	var duration = undefined;
	// the container <div> of the whole animation. 
	// not pretty to get it over first[0]
	var container = first[0].parent();

	// hide the first frame
	var first_old = $(':first', first[0]);
	var first_new = first_old.next();
	var second_old = $(':first', second[0]);
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
		    // re-activate gesture sensivity
		    container.data('gesture-sensitive', true);
  		});
            });
	});
    }

    /* function factory, creates a progress bar and an updater function */
    function updateProgress(div) {
	// create the div for the progress bar
	var percentage_display = $('<div></div>');

	percentage_display.progressbar({value: 0});
	div.data('spacer').after(percentage_display);
	div.data('percentage-display', percentage_display);

	/* called when the preloader has loaded one image */
	var updater = function (stats) {
	    var percentage = Math.ceil((stats.loaded / stats.total) * 100);
	    percentage_display.progressbar('value', percentage);

	    if (stats.image.match(/_large.jpg/)) {
		// clone node, jQuerize and hide it
		var loaded_image = $(stats.element.cloneNode(true));
		loaded_image.gesture(large_gesture).
		    mousedown(disable_scroll).
		    hide();
		div.append(loaded_image);
	    }
	};
	return updater;
    }

    /* called when the preloader has loaded all images.
       Note that the function returns a closure which will be bound
       to the event */
    function doneProgress(div) {
	var manager = div.data('manager');
	var left = div.data('left');
	var right = div.data('right');

	/* this function gets executed once the preloader is done */
	var finisher = function (stats) {
	    // remove the progress bar
	    div.data('percentage-display').remove();
	    div.removeData('percentage-display');
	    // resize the spacer to the normal size
	    div.data('spacer').css('height', '162px');

	    // get the pages that should get displayed
	    var currentImages = manager.getCurrentPages();
	    display_new_images(div, currentImages, 'initial');

	    $([left, right]).each(function (index, value) {
		value.css('width', '450px').
  		    css('position', 'relative');
		// enable gestures
		value.gesture(small_gesture).
  		    mousedown(disable_scroll);
		// add to the display
		div.append(value);
	    });

	    // activate the gesture bindings
	    div.data('gesture-sensitive', true);
	};
	return finisher;
    }

    jQuery.fn.flipbook = function (images) {
	/* jQuery entry point for this plugin */
	var div = this;
	// delete everything that was inside the div
	// (people might want to write an JavaScript-less fallback there)
	div.empty();

	// create a spacer div and attach it
	var spacer = $('<div></div>').
            css('height', 650 / 2 +'px');
	// add the spacer to the divs data
	div.data('spacer', spacer).
            // and append it to the div in the DOM
            append(spacer);

	// apply the style
	div.css('background-color', 'black').
            css('width', '900px').
            css('height', '650px');

	var manager = new ImageManager(images);
	// take care that the number of images stays even
	images.unshift(null);
	images.push(null);
	// attach the manager to the data attribute
	div.data('manager', manager);

	// create the image holders, style them
	var left = $('<div><img /></div>').
            css('float', 'left');
	var right = $('<div><img /></div>').
            css('float', 'right');
	// add them to the data of the containing DIV
	div.data('left', left);
	div.data('right', right);

	// create an array with the names of all images
	var image_files = [];
	for (var i = 0; i < images.length; i++) {
	    image_files.push(images[i] + '_small');
	    image_files.push(images[i] + '_large');
	}

	// start the preloader
	$.preload(image_files, {
	    base: '',
	    ext: '.jpg',
	    onComplete: updateProgress(div),
	    onFinish: doneProgress(div)
	});

	// return the passed object, since this is jQuery
	return div;
    };
})(jQuery);