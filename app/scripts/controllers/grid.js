'use strict';
/*
	GRID CONTROLLER
	- this handles the rendering of the portfolio items grid
*/
Portfolio.controller('GridCtrl', ['$rootScope', '$scope', 'data', function($rootScope, $scope, data) {
	// scope vars
	$scope.items       = data.items;
	$scope.itemsPerRow = 0;

	console.log($rootScope.$state.current.name);

	// assign class for grid (one-up, two-up, three-up, etc)
	// note: itemsPerRow is set in gridResize directive
	$scope.gridClass = function(itemsPerRow) {
		var textNums = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
		return textNums[itemsPerRow]+'-up';
	};
}]);

Portfolio.controller('ItemCtrl', ['$rootScope', '$scope', 'data', function($rootScope, $scope, data) {
	$scope.onClick = function(index){
		console.log('clicked item at index: '+index);
	};
}]);