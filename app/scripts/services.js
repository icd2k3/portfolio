'use strict';

// SERVICES //////////////////////
/*
	- Handles data that should be able to be shared across multiple controlles & directives
*/
var portfolioServices = angular.module('Portfolio.services', []);

// Load portfolio JSON data
portfolioServices.factory('data', ['$http', function($http){
	var path    = '/portfolio.json',
		factory = {},
		data    = $http.get(path).then(function(response){
			for(var i=0; i<response.data.projects.length; i++) {
				var project = response.data.projects[i];
				project.index = i;
				// set id as title url slug
				project.id = project.title.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
				project.url = '/project/'+project.id;
			}
			return response.data;
		});
	factory.all = function() { return data; };
	factory.projects = function(){ return data.projects; };
	factory.about = function() { return data.about; };
	return factory;
}]);

// For sharing data about the grid between directives & controllers
portfolioServices.service('GridData', function(){
	var sharedData = {
		windowWidth: 0,
		projectsPerRow: 0,
		rowHeight: 0,
		initialCubesLoaded: 0   // used for sequential loading of cubes on first site init (so they don't all try loading their sides at once)
	};
	return {
		getHalfItemWidth: function() {
			return Math.round((sharedData.windowWidth / sharedData.projectsPerRow) * 0.5);
		},
		getProjectsPerRow: function(){
			return sharedData.projectsPerRow;
		},
		getRowHeight: function(){
			return sharedData.rowHeight;
		},
		getInitialCubesLoaded: function(){
			return sharedData.initialCubesLoaded;
		},
		set: function(obj) {
			if(obj.windowWidth) { sharedData.windowWidth = obj.windowWidth; }
			if(obj.projectsPerRow) { sharedData.projectsPerRow = obj.projectsPerRow; }
			if(obj.rowHeight) { sharedData.rowHeight = obj.rowHeight; }
			if(obj.initialCubesLoaded) { sharedData.initialCubesLoaded = obj.initialCubesLoaded; }
		}
	};
});

// Used for setting/getting when browser tab is inactive (used for pausing cube anims)
portfolioServices.service('WindowFocus', function($window){
	var focused = true,
		windowFocus = function() { focused = true; },
		windowBlur = function() { focused = false; };
	angular.element($window).bind('focus', windowFocus);
	angular.element($window).bind('blur', windowBlur);
	return {
		get: function() {
			return focused;
		},
		set: function(bool) {
			focused = bool;
		}
	};
});

// helper functions
portfolioServices.service('Helpers', function() {
	var animateScroll = function(to, duration) {
		// animates scrollTop without jQuery
		if (duration <= 0) { return; }
		var	scrollTop  = window.pageYOffset,
			difference = to - scrollTop,
			perTick    = (difference / duration) * 10;
		setTimeout(function() {
			window.scroll(0, window.pageYOffset + perTick);
			animateScroll(to, duration - 10);
		}, 10);
	};
	var usrAgent = navigator.userAgent || navigator.vendor,
		browser = {
			isMobile  : /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(usrAgent),
			isOpera   : /Opera/i.test(usrAgent),
			isiPhone  : /iphone/i.test(usrAgent),
			isiOS     : /iPhone|iPad|iPod/i.test(usrAgent),
			isIE      : /msie/i.test(usrAgent)
		};
	// TODO: IE10 & 11 should be able to display a cube animation, but they don't support preserve3d
	// this means eventually I'll have to change around the cube & transitions to have the sides individually
	// animate instead of the entire cube... but until then, we'll just disable for IE.
	// this should be used in conjunction with Modernizr.csstransforms3d
	browser.cubeSupported = !browser.isIE && !browser.isMobile;
	return {
		getRandomDirection: function() {
			// returns a random direction string (up, left, right, or down)
			var directions = ['left', 'right', 'up', 'down'];
			return directions[Math.floor(Math.random()*directions.length)];
		},
		browser: function() {
			return browser;
		},
		setTitle: function(title) {
			document.title = title;
		},
		convert: (function() {
			return {
				numToString: function(num){
					var textNums = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
					return textNums[Math.round(num)];
				}
			};
		})(),
		animateScroll: animateScroll
	};
});

// This service returns a css 3d object for the cube/sides based on direction of the current animation
// because 3d transforms don't support percentages unfortunately, we have to create them here based on the dimensions of the grid
portfolioServices.service('cubeCSS', function(GridData){
	return {
		cube: function(direction, transitionSpeed) {
			var translateDistance = GridData.getHalfItemWidth(),
				returnObj;
			switch(direction) {
				case 'right':
					returnObj = {
						'transition'        : 'all '+transitionSpeed+'s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
						'-webkit-transform' : 'rotateY(90deg) translate3d('+translateDistance+'px, 0, 0)',
						'transform'         : 'rotateY(90deg) translate3d('+translateDistance+'px, 0, 0)'
					};
					break;
				case 'left':
					returnObj = {
						'transition'        : 'all '+transitionSpeed+'s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
						'-webkit-transform' : 'rotateY(-90deg) translate3d(-'+translateDistance+'px, 0, 0)',
						'transform'         : 'rotateY(-90deg) translate3d(-'+translateDistance+'px, 0, 0)'
					};
					break;
				case 'up':
					returnObj = {
						'transition'        : 'all '+transitionSpeed+'s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
						'-webkit-transform' : 'rotateX(90deg) translate3d(0, -'+translateDistance+'px, 0)',
						'transform'         : 'rotateX(90deg) translate3d(0, -'+translateDistance+'px, 0)'
					};
					break;
				case 'down':
					returnObj = {
						'transition'        : 'all '+transitionSpeed+'s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
						'-webkit-transform' : 'rotateX(-90deg) translate3d(0, '+translateDistance+'px, 0)',
						'transform'         : 'rotateX(-90deg) translate3d(0, '+translateDistance+'px, 0)'
					};
					break;
			}
			return returnObj;
		},
		side: function(direction, isNextSide){
			var translateDistance = GridData.getHalfItemWidth(),
				returnObj;
			if(isNextSide) {
				switch(direction) {
					case 'right':
						returnObj = {
							'-webkit-transform' : 'rotateY(-90deg) translate3d(0, 0, '+translateDistance+'px)',
							'transform'         : 'rotateY(-90deg) translate3d(0, 0, '+translateDistance+'px)'
						};
						break;
					case 'left':
						returnObj = {
							'-webkit-transform' : 'rotateY(90deg) translate3d(0, 0, '+translateDistance+'px)',
							'transform'         : 'rotateY(90deg) translate3d(0, 0, '+translateDistance+'px)'
						};
						break;
					case 'up':
						returnObj = {
							'-webkit-transform' : 'rotateX(-90deg) translate3d(0, 0, '+translateDistance+'px)',
							'transform'         : 'rotateX(-90deg) translate3d(0, 0, '+translateDistance+'px)'
						};
						break;
					case 'down':
						returnObj = {
							'-webkit-transform' : 'rotateX(90deg) translate3d(0, 0, '+translateDistance+'px)',
							'transform'         : 'rotateX(90deg) translate3d(0, 0, '+translateDistance+'px)'
						};
						break;
				}
			} else {
				returnObj = {
					'-webkit-transform' : 'translate3d(0, 0, '+translateDistance+'px)',
					'transform'         : 'translate3d(0, 0, '+translateDistance+'px)'
				};
			}
			return returnObj;
		}
	};
});