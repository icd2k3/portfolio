'use strict';

// handles the main grid layout, projects per row, window resize etc
angular.module('Portfolio').directive('gridResize', function($window, gridService) {
	return {
		link: function(scope, element, attrs) {
			// resize row height to make projects perfect squares
			var windowResize = function(){
				var windowWidth = $window.innerWidth,
					projectsPerRow = 4;

				scope.grid.windowWidth = windowWidth;
				// NOTE: make sure these match the css media query values
				if(windowWidth < 1280) { projectsPerRow = 3; }
				if(windowWidth < 960)  { projectsPerRow = 2; }
				if(windowWidth < 321)  { projectsPerRow = 1; }

				// assign rows & grid layout params
				if(projectsPerRow !== scope.grid.projectsPerRow) {
					scope.grid.rows = new Array(Math.ceil(scope.projects.length / projectsPerRow));
					for(var i=0; i<scope.projects.length; i++) {
						var project = scope.projects[i];
						project.row = Math.floor(i / projectsPerRow);
					}
					scope.grid.projectsPerRow = projectsPerRow;
					scope.$apply();
				}
				var newRowHeight = Math.round(windowWidth / projectsPerRow);
				if(newRowHeight !== scope.rowHeight) {
					scope.$apply(function(){
						scope.rowHeight = newRowHeight;
					});
				}
				// set vars in gridService so other directives can use the data
				gridService.setWindowWidth(windowWidth);
				gridService.setProjectsPerRow(projectsPerRow);
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
angular.module('Portfolio').directive('cube', function($timeout, $animate, gridService, cubeCSS){
	return {
		link: function(scope, element, attrs) {
			var transitionSpeed = 0.7;
			// watch for both sides of the cube to be loaded
			scope.$watch(function(){ return scope.project.cube.sidesLoaded }, function(val){
				if(val === 2) {
					scope.project.cube.transitionComplete = false;
					var transitionDelay = Math.round(Math.random()*1000)+1000;
					scope.project.cube.direction = scope.getRandomDirection();

					// transition the cube to the next side
					// NOTE: we have to manually apply css here as 3d translates don't support percentages
					scope.project.cube.transitionWaitTimer = $timeout(function(){
						var translateDistance = gridService.getHalfItemWidth();

						scope.project.cube.transition = true;
						element.css({
							'-webkit-transform' : 'translate3d(0, 0, -'+translateDistance+'px)',
							'transform'         : 'translate3d(0, 0, -'+translateDistance+'px)',
						});

						// this timeout makes sure that the css set above takes effect before the transition starts (mostly a FF problem)
						setTimeout(function(){
							//element.css({'transition' : 'all '+transitionSpeed+'s cubic-bezier(0.25, 0.46, 0.45, 0.94)'});
							element.addClass('animate');
							element.css(cubeCSS.cube(scope.project.cube.direction, transitionSpeed));
						}, 100);
					}, transitionDelay);

					// cube transition complete
					scope.project.cube.transitionTimer = $timeout(function(){
						element.removeClass('animate');
						scope.project.cube.transition = false;
						scope.project.cube.sidesLoaded = 1;

						// TODO: move to controller scope as function
						scope.project.cube.index = scope.project.cube.nextIndex;
						if(scope.project.cube.index === scope.project.images.length - 1) {
							scope.project.cube.nextIndex = 0;
						} else {
							scope.project.cube.nextIndex = scope.project.cube.index + 1;
						}

						// reset
						element.removeAttr('style');
						scope.project.cube.transitionComplete = true;
					}, transitionDelay + (transitionSpeed*1000) + 100);
				} else {
					element.removeAttr('style');
				}
			});
		}
	};
});

// handles loading of cube side images and setting next & current side elements for the cube directive to use
// TODO: keep previous sides and make them invisible, then pull them back in if cube index resets
angular.module('Portfolio').directive('cubeSide', function($timeout, $animate, gridService, cubeCSS){
	return {
		link: function(scope, element, attrs) {
			var isNextSide = element.hasClass('two');

			// adds an img tag into the div so it can preload the cube side image
			var preloadImage = function() {
				var index        = isNextSide ? scope.project.cube.nextIndex : scope.project.cube.index,
					loadComplete = function() {
						var $archiveSide;
						for(var i=0; i<scope.project.cube.sideArchive.length; i++) {
							if(index === scope.project.cube.sideArchive[i].index) {
								$archiveSide = scope.project.cube.sideArchive[i].side;
							}
						}
						console.log('load complete');
						// set cube side background to the image after it's finished loading
						if(!$archiveSide) {
							element.css({
								'background-image' : 'url('+scope.project.images[index].src+')',
								'background-size'  : 'cover'
							});
							// remove the img tag as it's no longer needed
							if($img) { $img.unbind().remove(); }

							// archive the side to use later (no extra network calls)
							$archiveSide = element.clone();
							$archiveSide.removeClass('one two').addClass('archive');
							element.parent().append($archiveSide)
							scope.project.cube.sideArchive.push({index: index, side: $archiveSide});
						} else {
							console.log('archive side found');
							//element.remove();
							element = $archiveSide;
							element.removeClass('archive').addClass('archive-active');
						}

						scope.project.images[index].loaded = true;

						// set sides loaded on cube
						scope.project.cube.sidesLoaded++;
						if(scope.project.cube.sidesLoaded === 2) {
							scope.$apply();
						}
					};
				if(scope.project.images[index].loaded) {
					setTimeout(function(){ loadComplete(); }, 1);
				} else {
					element.html('<img src="'+scope.project.images[index].src+'"></img>');
					var $img = element.find('img');
					$img.bind('load', loadComplete);
					$img.bind('error', function() { console.warn('IMAGE ERROR'); });
				}
			};
			preloadImage();

			// cube is transitioning, apply 3d rules to the sides
			scope.$watch(function(){ return scope.project.cube.transition }, function(val){
				if(!val) return;
				element.css(cubeCSS.side(scope.project.cube.direction, isNextSide));
			});

			// swap cube sides: side 2 becomes side 1, and the new side 2 renders the next image of the cube
			scope.$watch(function(){ return scope.project.cube.transitionComplete }, function(val){
				if(!val) return;
				element.css({
					'-webkit-transform' : 'none',
					'transform'         : 'none'
				});
				if(isNextSide) {
					isNextSide = false;
					element.removeClass('two').addClass('one');
				} else {
					element.removeClass('one').addClass('two');
					// if this was an archived side, send it back to the archive
					if(element.hasClass('archive-active')) {
						element.addClass('archive');
					}
					isNextSide = true;
					preloadImage();
				}
			});
	    }
	};
});

// handles setting grid-row-container to be active so we can adjust z-index to top (helps with the cube illusion)
angular.module('Portfolio').directive('gridProject', function(){
	return {
		link: function(scope, element, attrs) {
			scope.$watch(function(){ return scope.project.cube.transition }, function(val) {
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