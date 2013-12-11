'use strict';
/*
	STATES
	- This code handles switching of app states based on the url
*/

Portfolio.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouteProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$urlRouteProvider.otherwise('/');
	// typically we would use the built in angular router for routing an app,
	// but because this site doesn't need to completely re-render it's better to use
	// angular ui-router for state switching support & nested views
	$stateProvider
		.state('index', {
			abstract: true,
			url: '/',
			templateUrl: '/views/grid.html',
			resolve: {
				// make portfolio json data a dependency of the controller
				data: ['data', function(data){
					return data.all();
				}]
			},
			controller: 'GridCtrl'
		})
		.state('index.grid', {
			url: ''
		})
		.state('index.project', {
			url: 'project/:projectId',
			templateUrl: '/views/partials/item_detail.html'
		});
}]);