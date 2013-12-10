'use strict';
/*
	GRID CONTROLLER
	- this handles the rendering of the portfolio items grid
*/
Portfolio.controller('GridCtrl', ['$rootScope', '$scope', 'data', function($rootScope, $scope, data) {
	$scope.items = data.items;
	$scope.rowHeight = 200;
}]);