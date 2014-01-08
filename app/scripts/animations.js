'use strict';
/*global $:false */
/*global Modernizr:false */

// ANIMATIONS //////////////////////
/*
	- Fallback animations for browsers that don't support css3 transitions and animation
*/
/*
	TODOS:
	- Fallback animation for project details open/close
*/
var portfolioAnimations = angular.module('Portfolio.animations', []);

portfolioAnimations.animation('.about-animation', function(){
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

portfolioAnimations.animation('.item-load-animation', function(){
	return {
		removeClass: function(element, className, done) {
			if(className === 'ng-hide' && !Modernizr.csstransitions) {
				$(element).css({'opacity': 0}).animate({'opacity': 1}, 500, function(){
					done();
				});
			}
		}
	};
});