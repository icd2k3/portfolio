'use strict';
// Fallback animations for browsers that don't support CSS3
angular.module('Portfolio').animation('.about-animation', function(){
	return {
		enter: function(element, done) {
			
		}
	};
});

angular.module('Portfolio').animation('.project-details', function(){
	return {
		enter: function(element, done) {
			
		}
	};
});

angular.module('Portfolio').animation('.cube-transition', function(){
	return {
		addClass: function(element, className) {
			console.log('--- add class');
		},
		removeClass: function(element, className) {
			console.log('--- remove class');
		}
	};
});