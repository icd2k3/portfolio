'use strict';
// Directives

// handles the main grid layout, items per row, window resize etc
angular.module('Portfolio').directive('gridResize', function($window) {
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

angular.module('Portfolio').directive('itemCubeSideDirective', function(){
	return {
		link: function(scope, element, attrs) {
	    	element.css({
				'background-image': 'url('+attrs.image+')'
			});
	    }
	};
});

// image preloader directive
// usage: on img tags to know when the image has finished loading
angular.module('Portfolio').directive('imageLoader', function(){
	return {
		link: function(scope, element, attrs) {
	      console.log("Inside Image Directive");
	      element.bind("load", function() {
	         element.remove();
	         scope.item.loaded = true;
	         scope.$apply();
	      });
	      element.bind("error", function() {
	        // TODO: something on error
	      });
	    }
	};
});

// update grid row height from gridResize directive
angular.module('Portfolio').directive('gridRowDirective', function(){
	return {
		link: function(scope, element, attrs) {
			attrs.$observe('rowHeight', function(val){
				element.css({'height': val+'px'});
			});
		}
	};
});

// project details directive for applying template
angular.module('Portfolio').directive('projectDetailsDirective', function(){
	return {
		link: function(scope, element, attrs) {
			console.log('project details');
		}
	};
});