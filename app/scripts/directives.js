'use strict';
// Directives

// handles the main grid layout, items per row, window resize etc
angular.module('Portfolio').directive('gridResize', function($window, gridService) {
	return {
		link: function(scope, element, attrs) {
			// resize row height to make items perfect squares
			var windowResize = function(){
				var windowWidth = $window.innerWidth,
					itemsPerRow = 4;

				scope.grid.windowWidth = windowWidth;
				// NOTE: make sure these match the css media query values
				if(windowWidth < 1280) { itemsPerRow = 3; }
				if(windowWidth < 960)  { itemsPerRow = 2; }
				if(windowWidth < 321)  { itemsPerRow = 1; }

				// assign rows & grid layout params
				if(itemsPerRow !== scope.grid.itemsPerRow) {
					scope.grid.rows = new Array(Math.ceil(scope.items.length / itemsPerRow));
					for(var i=0; i<scope.items.length; i++) {
						var item = scope.items[i];
						item.row = Math.floor(i / itemsPerRow);
					}
					scope.grid.itemsPerRow = itemsPerRow;
					scope.$apply();
				}
				var newRowHeight = Math.round(windowWidth / itemsPerRow);
				if(newRowHeight !== scope.rowHeight) {
					scope.$apply(function(){
						scope.rowHeight = newRowHeight;
					});
				}
				// set vars in gridService so other directives can use the data
				gridService.setWindowWidth(windowWidth);
				gridService.setItemsPerRow(itemsPerRow);
			};
			angular.element($window).bind('resize', windowResize);
			// trigger initial resize on first render
			setTimeout(function(){ windowResize(); }, 1);
		}
	};
});

// handles all cube switching functionality
// TODO:
// - don't show cube until both sides are rendered on first page load
// - 3d transitions should stop when user focus leaves window
// - fallback transition for older browsers
angular.module('Portfolio').directive('cube', function($timeout, $animate, gridService){
	return {
		link: function(scope, element, attrs) {
			var transitionSpeed = 0.7;
			// watch for both sides of the cube to be loaded
			scope.$watch(function(){ return scope.item.cube.sidesLoaded }, function(val){
				if(val === 2) {
					scope.item.cube.transitionComplete = false;
					var transitionDelay = Math.round(Math.random()*10000)+1000;
					scope.item.cube.direction = scope.getRandomDirection();

					// transition the cube to the next side
					// NOTE: we have to manually apply css here as 3d translates don't support percentages
					scope.item.cube.transitionWaitTimer = $timeout(function(){
						var translateDistance = gridService.getZ();

						scope.item.cube.transition = true;
						element.css({
							'-webkit-transform' : 'translate3d(0, 0, -'+translateDistance+'px)',
							'transform'         : 'translate3d(0, 0, -'+translateDistance+'px)',
						});
						setTimeout(function(){
							element.css({'transition' : 'all '+transitionSpeed+'s cubic-bezier(0.25, 0.46, 0.45, 0.94)'});
							element.addClass('animate');
							switch(scope.item.cube.direction) {
								case 'right':
									element.css({
										'-webkit-transform' : 'rotateY(90deg) translate3d('+translateDistance+'px, 0, 0)',
										'transform'         : 'rotateY(90deg) translate3d('+translateDistance+'px, 0, 0)'
									});
								break;
								case 'left':
									element.css({
										'-webkit-transform' : 'rotateY(-90deg) translate3d(-'+translateDistance+'px, 0, 0)',
										'transform'         : 'rotateY(-90deg) translate3d(-'+translateDistance+'px, 0, 0)'
									});
								break;
								case 'up':
									element.css({
										'-webkit-transform' : 'rotateX(90deg) translate3d(0, -'+translateDistance+'px, 0)',
										'transform'         : 'rotateX(90deg) translate3d(0, -'+translateDistance+'px, 0)'
									});
								break;
								case 'down':
									element.css({
										'-webkit-transform' : 'rotateX(-90deg) translate3d(0, '+translateDistance+'px, 0)',
										'transform'         : 'rotateX(-90deg) translate3d(0, '+translateDistance+'px, 0)'
									});
								break;
							}
						}, 1);
					}, transitionDelay);

					// cube transition complete
					scope.item.cube.transitionTimer = $timeout(function(){
						element.removeClass('animate');
						scope.item.cube.transition = false;
						scope.item.cube.sidesLoaded = 1;

						// TODO: move to controller scope as function
						scope.item.cube.index = scope.item.cube.nextIndex;
						if(scope.item.cube.index === scope.item.images.small.length - 1) {
							scope.item.cube.nextIndex = 0;
						} else {
							scope.item.cube.nextIndex = scope.item.cube.index + 1;
						}

						// reset
						element.removeAttr('style');
						scope.item.cube.transitionComplete = true;
					}, transitionDelay + (transitionSpeed*1000));
				} else {
					element.removeAttr('style');
				}
			});
		}
	};
});

// handles loading of cube side images and setting next & current side elements for the cube directive to use
angular.module('Portfolio').directive('cubeSide', function($timeout, $animate, gridService){
	return {
		link: function(scope, element, attrs) {
			var isNextSide = element.hasClass('two');

			// adds an img tag into the div so it can preload the cube side image
			var preloadImage = function() {
				if(isNextSide) {
					element.html('<img src="'+scope.item.images.small[scope.item.cube.nextIndex]+'"></img>');
				} else {
					element.html('<img src="'+scope.item.images.small[scope.item.cube.index]+'"></img>');
				}
				var $img = element.find('img');
				$img.bind('load', function(){
					// set cube side background to the image after it's finished loading
					element.css({
						'background-image' : 'url('+$img.attr('src')+')',
						'background-size'  : 'cover'
					});
					// remove the img tag as it's no longer needed
					$img.unbind();
					$img.remove();

					// set sides loaded on cube
					scope.item.cube.sidesLoaded++;
					if(scope.item.cube.sidesLoaded === 2) {
						scope.$apply();
					}
				});
				$img.bind('error', function() { console.warn('IMAGE ERROR'); });
			};
			preloadImage();

			// cube is transitioning, apply 3d rules to the sides
			// TODO: simplify this
			scope.$watch(function(){ return scope.item.cube.transition }, function(val){
				if(!val) return;
				var translateDistance = gridService.getZ();
				if(isNextSide) {
					switch(scope.item.cube.direction) {
						case 'right':
							element.css({
								'-webkit-transform' : 'rotateY(-90deg) translate3d(0, 0, '+translateDistance+'px)',
								'transform'         : 'rotateY(-90deg) translate3d(0, 0, '+translateDistance+'px)'
							});
						break;
						case 'left':
							element.css({
								'-webkit-transform' : 'rotateY(90deg) translate3d(0, 0, '+translateDistance+'px)',
								'transform'         : 'rotateY(90deg) translate3d(0, 0, '+translateDistance+'px)'
							});
						break;
						case 'up':
							element.css({
								'-webkit-transform' : 'rotateX(-90deg) translate3d(0, 0, '+translateDistance+'px)',
								'transform'         : 'rotateX(-90deg) translate3d(0, 0, '+translateDistance+'px)'
							});
						break;
						case 'down':
							element.css({
								'-webkit-transform' : 'rotateX(90deg) translate3d(0, 0, '+translateDistance+'px)',
								'transform'         : 'rotateX(90deg) translate3d(0, 0, '+translateDistance+'px)'
							});
						break;
					}
				} else {
					element.css({
						'-webkit-transform' : 'translate3d(0, 0, '+translateDistance+'px)',
						'transform'         : 'translate3d(0, 0, '+translateDistance+'px)'
					});
				}
			});

			// swap cube sides: side 2 becomes side 1, and the new side 2 renders the next image of the cube
			scope.$watch(function(){ return scope.item.cube.transitionComplete }, function(val){
				if(!val) return;
				element.css({
					'-webkit-transform' : 'none',
					'transform'         : 'none'
				});
				if(isNextSide) {
					isNextSide = false;
					element.addClass('one').removeClass('two');
				} else {
					element.addClass('two').removeClass('one');
					isNextSide = true;
					preloadImage();
				}
			});
	    }
	};
});

// handles setting grid-row-container to be active so we can adjust z-index to top (helps with the cube illusion)
angular.module('Portfolio').directive('gridItem', function(){
	return {
		link: function(scope, element, attrs) {
			scope.$watch(function(){ return scope.item.cube.transition }, function(val) {
				if(val) {
					element.parent().parent().addClass('active');
				} else {
					element.parent().parent().removeClass('active');
				}
			});
	    }
	};
});

// set background image of div based on data-image attribute
angular.module('Portfolio').directive('bgImageDirective', function(){
	return {
		link: function(scope, element, attrs) {
			attrs.$observe('image', function(val) {
				element.css({
					'background-image': 'url('+attrs.image+')'
				});
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