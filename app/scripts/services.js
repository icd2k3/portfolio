'use strict';
// Load portfolio JSON data
angular.module('Portfolio').factory('data', ['$http', function($http){
	var path    = '/portfolio.json',
		factory = {},
		data    = $http.get(path).then(function(response){
			for(var i=0; i<response.data.projects.length; i++) {
				var project = response.data.projects[i];
				project.index = i;
				// set id as title url slug
				project.id = project.title.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
			}
			return response.data;
		});
	factory.all = function() { return data; };
	factory.projects = function(){ return data.projects; };
	factory.about = function() { return data.about; };
	return factory;
}]);

// Since 3d transforms don't support percentages, we have to let the cube know what dimensions it should be manually
angular.module('Portfolio').service('gridService', function(){
	var sharedData = {
		windowWidth: 0,
		projectsPerRow: 0
	};
	return {
		getHalfItemWidth: function() {
			return Math.round((sharedData.windowWidth / sharedData.projectsPerRow) * 0.5);
		},
		set: function(obj) {
			if(obj.windowWidth) { sharedData.windowWidth = obj.windowWidth; }
			if(obj.projectsPerRow) { sharedData.projectsPerRow = obj.projectsPerRow; }
		}
	};
});

// Unit conversion helpers
angular.module('Portfolio').service('Convert', function(){
	var textNums = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
	return {
		numToString: function(num) {
			return textNums[Math.round(num)];
		}
	};
});

// Random helper functions
angular.module('Portfolio').service('Helpers', function(){
	return {
		getRandomDirection: function(){
			// returns a random direction string (up, left, right, or down)
			var directions = ['left', 'right', 'up', 'down'];
			return directions[Math.floor(Math.random()*directions.length)];	
		}
	};
});

// this service returns a css 3d object for the cube/sides based on direction of the current animation
angular.module('Portfolio').service('cubeCSS', function(gridService){
	return {
		cube: function(direction, transitionSpeed) {
			var translateDistance = gridService.getHalfItemWidth();
			switch(direction) {
				case 'right':
					return {
						'transition'        : 'all '+transitionSpeed+'s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
						'-webkit-transform' : 'rotateY(90deg) translate3d('+translateDistance+'px, 0, 0)',
						'transform'         : 'rotateY(90deg) translate3d('+translateDistance+'px, 0, 0)'
					};
				break;
				case 'left':
					return {
						'transition'        : 'all '+transitionSpeed+'s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
						'-webkit-transform' : 'rotateY(-90deg) translate3d(-'+translateDistance+'px, 0, 0)',
						'transform'         : 'rotateY(-90deg) translate3d(-'+translateDistance+'px, 0, 0)'
					};
				break;
				case 'up':
					return {
						'transition'        : 'all '+transitionSpeed+'s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
						'-webkit-transform' : 'rotateX(90deg) translate3d(0, -'+translateDistance+'px, 0)',
						'transform'         : 'rotateX(90deg) translate3d(0, -'+translateDistance+'px, 0)'
					};
				break;
				case 'down':
					return {
						'transition'        : 'all '+transitionSpeed+'s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
						'-webkit-transform' : 'rotateX(-90deg) translate3d(0, '+translateDistance+'px, 0)',
						'transform'         : 'rotateX(-90deg) translate3d(0, '+translateDistance+'px, 0)'
					};
				break;
			}
		},
		side: function(direction, isNextSide){
			var translateDistance = gridService.getHalfItemWidth();
			if(isNextSide) {
				switch(direction) {
					case 'right':
						return {
							'-webkit-transform' : 'rotateY(-90deg) translate3d(0, 0, '+translateDistance+'px)',
							'transform'         : 'rotateY(-90deg) translate3d(0, 0, '+translateDistance+'px)'
						};
					break;
					case 'left':
						return {
							'-webkit-transform' : 'rotateY(90deg) translate3d(0, 0, '+translateDistance+'px)',
							'transform'         : 'rotateY(90deg) translate3d(0, 0, '+translateDistance+'px)'
						};
					break;
					case 'up':
						return {
							'-webkit-transform' : 'rotateX(-90deg) translate3d(0, 0, '+translateDistance+'px)',
							'transform'         : 'rotateX(-90deg) translate3d(0, 0, '+translateDistance+'px)'
						};
					break;
					case 'down':
						return {
							'-webkit-transform' : 'rotateX(90deg) translate3d(0, 0, '+translateDistance+'px)',
							'transform'         : 'rotateX(90deg) translate3d(0, 0, '+translateDistance+'px)'
						};
					break;
				}
			} else {
				return {
					'-webkit-transform' : 'translate3d(0, 0, '+translateDistance+'px)',
					'transform'         : 'translate3d(0, 0, '+translateDistance+'px)'
				};
			}
		}
	}
});

angular.module('Portfolio').service('aboutService', function(){
	var sharedData = {
		active: false,
		data: {}
	};
	return {
		get: function(){ return sharedData; },
		set: function(d){ sharedData.data = d; }
	};
});