'use strict';

angular.module('portfolio', ['ngRoute', 'portfolio.controllers'])
.config(function ($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$routeProvider
	.when('/', {
		templateUrl: 'views/main.html',
		controller: 'MainApp'
	})
	.when('/:projectId', {
		templateUrl: 'views/main.html',
		controller: 'MainApp'
	})
	.otherwise({
		redirectTo: '/'
	});
});
