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
			attrs.$observe('image', function(val) {
				element.css({
					'background-image': 'url('+attrs.image+')'
				});
			});
	    }
	};
});

// wait for both sides of cube to load, random delay, transition, reset vars
// TODO: since we can't use percentages in 3d transforms, we have to set a px ammount based on item size
angular.module('Portfolio').directive('cube', function($timeout, $animate){
	return {
		link: function(scope, element, attrs) {
			// set 3d values based on width/height of item
			scope.$watch(function(){ return scope.item.cube.sidesLoaded }, function(val){
				if(val === 2) {
					scope.item.cube.transitionComplete = false;
					$timeout(function(){      // wait random ammount of time before sitching to next side
						element.addClass('animate');
						scope.item.cube.sidesLoaded = 1;
						$timeout(function(){  // wait for cube transition to finish
							element.removeClass('animate');
							scope.item.cube.index = scope.item.cube.nextIndex;
							if(scope.item.cube.index === scope.item.images.small.length - 1) {
								//console.log('reset');
								scope.item.cube.nextIndex = 0;
							} else {
								scope.item.cube.nextIndex = scope.item.cube.index + 1;
							}
							scope.item.cube.transitionComplete = true;
						}, 1000);
					}, Math.round(Math.random()*5000)+1000);
				}
			});
	    }
	};
});

// handles loading of cube side images and setting next & current side elements for the cube directive to use
// TODO: simplify, rename, and organize
angular.module('Portfolio').directive('cubeSide', function($timeout, $animate){
	return {
		link: function(scope, element, attrs) {
			var $img       = element.find('img'),
				isNextSide = element.hasClass('two');

			var addImageEvents = function() {
				$img.bind('load', function(){
					// set cube side background to the image after it's finished loading
					element.css({
						'background-image': 'url('+$img.attr('src')+')',
						'background-size': 'cover'
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
				$img.bind('error', function(){
					console.warn('IMAGE ERROR');
				});
			};

			var addImage = function() {
				element.html('<img src="'+scope.item.images.small[scope.item.cube.nextIndex]+'"></img>');
				$img = element.find('img');
				addImageEvents();
			};

			addImageEvents();

			// NOTE:
			// ok this is some odd behavior here. Originally I was just resetting the cube data on transition complete
			// but this was causing a re-render flicker where when the cube landed in it's final state it would flash black
			// while switching to a new side.
			// Instead, I decided to swap the cube sides & add the next image in to load, so side 1 becomes side 2 and side 2 becomes side 1
			scope.$watch(function(){ return scope.item.cube.transitionComplete }, function(val){
				if(!val) return;
				if(isNextSide) {
					// make the next side the new current side of the cube
					isNextSide = false;
					element.addClass('one').removeClass('two');
				} else {
					element.addClass('two').removeClass('one');
					element.removeAttr('style');
					isNextSide = true;
					addImage();
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