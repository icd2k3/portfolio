'use strict';
// Load portfolio JSON data
angular.module('Portfolio').factory('data', ['$http', function($http){
	var path    = '/data/portfolio.json',
		factory = {},
		data    = $http.get(path).then(function(response){
			for(var i=0; i<response.data.items.length; i++) {
				response.data.items[i].index = i;
			}
			return response.data;
		});
	factory.all = function() { return data; };
	factory.items = function(){ return data.items; };
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
			return Math.round((sharedData.windowWidth / sharedData.itemsPerRow) * 0.5);
		},
		setWindowWidth: function(w) { sharedData.windowWidth = w; },
		setItemsPerRow: function(i) { sharedData.itemsPerRow = i; }
	};
});

angular.module('Portfolio').service('Modernizr', function(){
	
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