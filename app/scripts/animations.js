'use strict';
/*global $:false */
/*global Modernizr:false */

// ANIMATIONS //////////////////////
/*
	- Fallback animations for browsers that don't support css3 transitions and animation
*/

angular.module('Portfolio').animation('.about-animation', function(){
	return {
		enter: function(element, done) {
			if(!Modernizr.csstransitions) {
				$(element).css({'height': '0px'}).animate({'height': '120px'}, 150, function(){
					done();
				});
			}
		},
		leave: function(element, done) {
			if(!Modernizr.csstransitions) {
				$(element).animate({'height': '0px'}, 150, function(){
					done();
				});
			} else {
				done();
			}
		}
	};
});

angular.module('Portfolio').animation('.item-load-animation', function(){
	return {
		removeClass: function(element, className, done) {
			if(className === 'ng-hide' && !Modernizr.csstransitions) {
				$(element).css({
					'opacity': 0,
					'width': '0%',
					'height': '0%'
				}).animate({
					'opacity': 1,
					'width': '100%',
					'height': '100%'
				}, 500, function(){
					done();
				});
			}
		}
	};
});

/*angular.module('Portfolio').animation('.project-details', function(){
	return {
		enter: function(element, done) {
			
		}
	};
});*/