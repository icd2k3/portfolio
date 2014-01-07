'use strict';

var Portfolio = angular.module('Portfolio', [
	'ui.router',
	'ngAnimate',
	'ngSanitize',
	'Portfolio.controllers',
	'Portfolio.services',
	'Portfolio.directives',
	'Portfolio.animations'
]);

Portfolio.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
	}]);