'use strict';
/*global $:false */
/*global Modernizr:false */

// DIRECTIVES /////////////////
/*
	- Handles all dom manipulation, item transitioning, etc
*/
var portfolioDirectives = angular.module('Portfolio.directives', []);

// handles the main grid layout, projects per row, window resize etc
portfolioDirectives.directive('gridResize', function($window, GridData) {
	return {
		link: function(scope) {
			// resize row height to make projects perfect squares
			var windowResize = function(){
				var windowWidth = $window.innerWidth,
					projectsPerRow = 4;

				scope.grid.windowWidth = windowWidth;
				// NOTE: make sure these match the css media query values
				if(windowWidth < 1440) { projectsPerRow = 3; }
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
				// set vars in GridData so other directives can use the data
				GridData.set({windowWidth: windowWidth, projectsPerRow: projectsPerRow, rowHeight: newRowHeight});
			};
			angular.element($window).bind('resize', windowResize);
			// trigger initial resize on first render
			setTimeout(function(){ windowResize(); }, 1);
		}
	};
});

// handles all cube switching functionality
/* TODOS:
	- optimize for speed
*/
portfolioDirectives.directive('cube', function($timeout, $animate, GridData, cubeCSS, Helpers){
	return {
		link: function(scope, element) {
			var cube = scope.project.cube,
				transitionSpeed = cube.transitionSpeed,
				transitionComplete = function(){
					element.removeClass('animate');
					cube.transition = false;
					cube.sidesLoaded = 1;
					// set next cube image index
					cube.index = cube.nextIndex;
					if(cube.index === scope.project.images.length - 1) {
						cube.nextIndex = 0;
					} else {
						cube.nextIndex = cube.index + 1;
					}
					// clear transition
					element.removeAttr('style');
					cube.transitionComplete = true;
				},
				transitionInit = function(){
					if(cube.pause) { return; }
					scope.project.cube.transitionComplete = false;
					var transitionDelay = Math.round(Math.random()*13000)+1000;

					// transition the cube to the next side
					// NOTE: we have to manually apply css here as 3d translates don't support percentages
					cube.transitionWaitTimer = $timeout(function(){
						if(cube.pause) { return; }

						cube.transition = true;
						cube.transitionTimer = $timeout(transitionComplete, (transitionSpeed * 1000) + 100);

						// if browser doesn't support 3D transforms, this is as far as we get
						if(!Modernizr.csstransforms3d || !Helpers.browser().cubeSupported) { return; }

						// browser supports 3d transforms, so get on with it
						var translateDistance = GridData.getHalfItemWidth();
						cube.direction = Helpers.getRandomDirection();
						element.css({
							'-webkit-transform' : 'translate3d(0, 0, -'+translateDistance+'px)',
							'transform'         : 'translate3d(0, 0, -'+translateDistance+'px)',
						});

						// this timeout makes sure that the css set above takes effect before the transition starts (mostly a FF problem)
						setTimeout(function(){
							if(cube.pause) { return; }
							element.addClass('animate').css(cubeCSS.cube(cube.direction, transitionSpeed));
						}, 100);
					}, transitionDelay);
				};

			// watch for both sides of the cube to be loaded
			scope.$watch(function(){ return cube.sidesLoaded; }, function(val){
				if(val === 2) {
					transitionInit();
				} else {
					element.removeAttr('style');
				}
			});

			// cube transitions pause/resume
			scope.$watch(function(){ return cube.pause; }, function(newVal, oldVal){
				if(oldVal === newVal) { return; }
				if(newVal) {
					// clear animation timer on hover
					if(cube.transitionWaitTimer) { $timeout.cancel(cube.transitionWaitTimer); }
					if(cube.transitionTimer) { $timeout.cancel(cube.transitionTimer); }
					if(cube.transition) {
						transitionComplete();
					}
				} else if(!scope.project.selected) {
					// reset the transition
					transitionInit();
				}
			});
		}
	};
});

// handles loading of cube side images and setting next & current side elements for the cube directive to use
/* TODOS:
	- Break up into separate directives for organization
	- Optimize for speed
*/
portfolioDirectives.directive('cubeSide', function($timeout, $animate, GridData, cubeCSS, Helpers){
	return {
		link: function(scope, element) {
			var cube = scope.project.cube,
				isNextSide = element.hasClass('two');

			// adds an img tag into the div so it can preload the cube side image
			var preloadImage = function() {
				var index        = isNextSide ? cube.nextIndex : cube.index,
					loadComplete = function() {
						var $archiveSide;
						for(var i=0; i<cube.sideArchive.length; i++) {
							if(index === cube.sideArchive[i].index) {
								$archiveSide = cube.sideArchive[i].side;
							}
						}
						// set cube side background to the image after it's finished loading
						if(!$archiveSide) {
							element.attr('style', 'background: url('+scope.project.images[index].src+') no-repeat 0 0; background-size: cover');
							// remove the img tag as it's no longer needed
							if($img) { $img.unbind().remove(); }

							// archive the side to use later (no extra network calls)
							$archiveSide = element.clone();
							$archiveSide.removeClass('one two').addClass('archive');
							element.parent().append($archiveSide);
							cube.sideArchive.push({index: index, side: $archiveSide});
						} else {
							if(!element.hasClass('archive') && !element.hasClass('archive-active')) {
								// element is one of the original non-archived sides and thus is no longer needed.
								// we'll be using the archived version from here on out to reduce network calls
								element.remove();
							}
							// switch element to the archived version
							// TODO: if element has already been switched to the archived version (images cycled twice or more) no need for this
							element = $archiveSide;
							element.removeClass('archive').addClass('archive-active');
						}

						scope.project.images[index].loaded = true;

						// set sides loaded on cube
						cube.sidesLoaded++;
						if(cube.sidesLoaded === 2) {
							if(!cube.firstLoad) {
								GridData.set({initialCubesLoaded: GridData.getInitialCubesLoaded() + 1});
								cube.firstLoad = true;
							}
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

			if(cube.firstLoad) {
				// cube sides have already been loaded (user must have resized the screen to change the grid)
				preloadImage();
			}

			scope.$watch(function(){ return GridData.getInitialCubesLoaded(); }, function(val){
				// sequentially load cube sides in order from first to last on initial site load
				if(val === scope.project.index && !cube.firstLoad) {
					preloadImage();
				}
			});

			// cube is transitioning, apply 3d rules to the sides
			scope.$watch(function(){ return cube.transition; }, function(val){
				if(!val) { return; }
				if(Modernizr.csstransforms3d && Helpers.browser().cubeSupported) {
					element.css(cubeCSS.side(cube.direction, isNextSide));
				} else {
					// browser doesn't support 3dtransforms, so instead just fade side 1 to reveal side 2
					if(!isNextSide) {
						if(!Modernizr.csstransitions) {
							$(element).animate({'opacity': 0}, 700);
						} else {
							element.css({
								'transition': 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
								'opacity': '0'
							});
						}
					}
				}
			});

			// swap cube sides: side 2 becomes side 1, and the new side 2 renders the next image of the cube
			scope.$watch(function(){ return cube.transitionComplete; }, function(val){
				if(!val) { return; }
				if(Modernizr.csstransforms3d && Helpers.browser().cubeSupported) {
					element.css({
						'-webkit-transform' : 'none',
						'transform'         : 'none'
					});
				} else {
					setTimeout(function(){
						element.css({
							'opacity': 1
						});
					}, 666); // >8-D
				}
				if(isNextSide) {
					isNextSide = false;
					element.removeClass('two').addClass('one');
				} else {
					element.removeClass('one').addClass('two');
					// if this was an archived side, send it back to the archive
					if(element.hasClass('archive-active')) {
						element.removeClass('archive-active').addClass('archive');
					}
					isNextSide = true;
					preloadImage();
				}
			});
		}
	};
});

// handles setting .grid-row-container element z-index to top when a child item is transitioning (helps with the 3D effect)
portfolioDirectives.directive('gridProject', function(){
	return {
		link: function(scope, element) {
			scope.$watch(function(){ return scope.project.cube.transition; }, function(val) {
				var gridRowContainer = element.parent().parent();
				if(val) {
					gridRowContainer.addClass('active');
				} else {
					gridRowContainer.removeClass('active');
				}
			});
		}
	};
});

// project details directive for applying template
portfolioDirectives.directive('projectDetailsDirective', function(Helpers, GridData){
	return {
		link: function(scope) {
			var scrollToProject = function() {
				// use the current project index & the grid data to find out where we should auto-scroll to
				var rowHeight      = GridData.getRowHeight(),
					currentRow     = scope.projectDetails.row,
					yPos           = Math.round(currentRow * rowHeight + (rowHeight * 0.5));

				Helpers.animateScroll(yPos, 200);
			};
			// this is on a delay so on initial page load (if the user links to a project) the grid data has time to set
			setTimeout(scrollToProject, 1);
		}
	};
});