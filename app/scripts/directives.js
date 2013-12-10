'use strict';
// Directives
Portfolio.directive('itemDirective', function(){
	return function(scope, element, attrs) {
		var url = attrs.itemImage;
		element.css({
			'background-image' : 'url('+url+')'
		});
	};
});

Portfolio.directive('windowResize', function($window) {
	return function(scope, element) {
		var windowResize = function(){
			scope.rowHeight = Math.round($window.innerWidth / 3);
			scope.$apply();
		};
		angular.element($window).bind('resize', windowResize);
		// trigger initial resize
		setTimeout(function(){
			windowResize();
		}, 1);
	}
});