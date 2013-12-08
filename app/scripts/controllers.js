'use strict';

var controllers = angular.module('portfolio.controllers', []);

controllers.controller('MainApp', ['$scope', '$routeParams',
	function($scope, $routeParams){
		if($routeParams.projectId) {
			$scope.projectId = $routeParams.projectId;
		}
	}
]);