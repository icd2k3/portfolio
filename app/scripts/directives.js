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

// set background image of div based on data-image attribute
angular.module('Portfolio').directive('bgImageDirective', function(){
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
			element.bind("load", function() {
				scope.cube.sides[attrs.side].ready = true;
				if(scope.cube.sides[0].ready && scope.cube.sides[1].ready) {
					scope.cube.ready = true;
				}
				// end set scope vars
				scope.$apply();
			});
			element.bind("error", function() {
				console.warn('ERROR LOADING IMAGE');
			});
	    }
	};
});

// wait for both sides of cube to load, random delay, transition, reset vars
// TODO: since we can't use percentages in 3d transforms, we have to set a px ammount based on item size
// TODO: use element.find() to determine if images are loaded
angular.module('Portfolio').directive('itemCubeDirective', function($timeout, $animate){
	return {
		link: function(scope, element, attrs) {
			// set 3d values based on width/height of item
			attrs.$observe('ready', function(val){
				if(val === "true") {
		    		$timeout(function(){
		    			scope.cube.transition = true;
		    			$timeout(function(){
		    				scope.transitionComplete();
		    			}, 400); // NOTE: make sure this matches the css transition speed*/
		    		}, Math.round(Math.random()*10000)+1000);
		    	}
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