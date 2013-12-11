'use strict';
// Directives
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

				// assign rows & grid layout params
				if(itemsPerRow !== scope.itemsPerRow) {
					scope.rows = new Array(Math.ceil(scope.items.length / itemsPerRow));
					for(var i=0; i<scope.items.length; i++) {
						var item = scope.items[i];
						item.row = Math.floor(i / itemsPerRow);
					}
					scope.itemsPerRow = itemsPerRow;
					scope.$apply();
				}
				var newRowHeight = Math.round(windowWidth / itemsPerRow);
				if(newRowHeight !== scope.rowHeight) {
					scope.$apply(function(){
						scope.rowHeight = newRowHeight;
					});
				}
			};
			angular.element($window).bind('resize', windowResize);
			// trigger initial resize on first render
			setTimeout(function(){ windowResize(); }, 1);
		}
	};
});

// update grid row height from gridResize directive
Portfolio.directive('gridRowDirective', function(){
	return {
		link: function(scope, element, attrs) {
			attrs.$observe('rowHeight', function(val){
				element.css({'height': val+'px'});
			});
		}
	}
});

// grid items directive for image loading, switching, and setting
Portfolio.directive('itemDirective', function(){
	return function(scope, element, attrs) {
		element.css({
			'background-image': 'url('+attrs.image+')'
		});
	};
});

// project details directive for applying template
Portfolio.directive('projectDetailsDirective', function(){
	return {
		link: function(scope, element, attrs) {
			console.log('project details');
		}
	}
});