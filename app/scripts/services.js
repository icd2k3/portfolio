'use strict';
// Load portfolio JSON data
angular.module('Portfolio').factory('data', ['$http', function($http){
	var path    = '/data/portfolio.json',
		factory = {},
		data    = $http.get(path).then(function(response){
			console.log('Data loaded');
			return response.data;
		});
	factory.all = function() { return data; };
	factory.items = function(){ return data.items; };
	factory.about = function() { return data.about; };
	return factory;
}]);

angular.module('Portfolio').service('imageLoader', function($http){

});

angular.module('Portfolio').service('aboutService', function(){
	var sharedData = {
		active: false,
		data: {}
	};
	return {
		get: function(){ return sharedData; },
		set: function(d){ sharedData.data = d; }
	}
});