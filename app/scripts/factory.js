'use strict';
// Handles loading portfolio data
Portfolio.factory('data', ['$http', function($http){
	var path    = 'data/portfolio.json',
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