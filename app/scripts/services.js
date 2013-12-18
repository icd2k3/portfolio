'use strict';
// Load portfolio JSON data
angular.module('Portfolio').factory('data', ['$http', function($http){
	var path    = '/data/portfolio.json',
		factory = {},
		data    = $http.get(path).then(function(response){
			for(var i=0; i<response.data.projects.length; i++) {
				response.data.projects[i].index = i;
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
		windowWidth: 1024,
		z: 188
	};
	return {
		getZ: function() {
			return Math.round((sharedData.windowWidth / sharedData.projectsPerRow) * 0.5);
		},
		setWindowWidth: function(w) { sharedData.windowWidth = w; },
		setProjectsPerRow: function(i) { sharedData.projectsPerRow = i; }
	};
});

// TODO: move css logic from directives to here
angular.module('Portfolio').service('cubeSide', function(){
	return {
		getCSS: function(direction){

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