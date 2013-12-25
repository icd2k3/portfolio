'use strict';

var Portfolio = angular.module('Portfolio', ['ui.router', 'ngAnimate']);

Portfolio.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
	}]);