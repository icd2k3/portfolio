'use strict';
// Directives
Portfolio.directive('itemDirective', function(){
	return function(scope, element, attrs) {
		element.css({
			'background-image': 'url('+attrs.image+')'
		});
	};
});

Portfolio.directive('gridResize', function($window) {
	return {
		link: function(scope, element, attrs) {
			// resize row height to make items perfect squares
			var windowResize = function(){
				var windowWidth = $window.innerWidth,
					itemsPerRow = 4;
				// NOTE: make sure these match the css media query values
				if(windowWidth < 1280) { itemsPerRow = 3; }
				if(windowWidth < 960)  { itemsPerRow = 2; }
				if(windowWidth < 320)  { itemsPerRow = 1; }

				// trigger change container class to 1-up, 2-up, etc
				if(itemsPerRow !== scope.itemsPerRow) {
					scope.itemsPerRow = itemsPerRow;
					scope.$apply();
				}
				var newRowHeight = Math.round(windowWidth / itemsPerRow);
				if(newRowHeight !== scope.rowHeight) {
					scope.rowHeight = Math.round(windowWidth / itemsPerRow);
					element.children().css({
						'height': scope.rowHeight+'px'
					});
				}
			};
			angular.element($window).bind('resize', windowResize);
			// trigger initial resize on first render
			setTimeout(function(){ windowResize(); }, 1);
		}
	}
});