'use strict';
/*
	GRID CONTROLLER
	- this handles the rendering of the portfolio items grid
*/

// Main grid controller
angular.module('Portfolio').controller('GridCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'data', function($rootScope, $scope, $state, $stateParams, data) {
	$scope.items       = data.items;
	$scope.rows        = [];
	$scope.itemsPerRow = 0;
	$scope.projectData = {};
	$scope.aboutToggle = false;
	$scope.templates = {
		about: '/views/partials/about.html',
		item: '/views/partials/item.html'
	};

	// TODO: hook up state on page refresh or direct link
	// console.log($rootScope.$state.params);

	// assign class for grid (one-up, two-up, three-up, etc)
	// TODO: move this to a service or into the grid resize directive
	$scope.gridClass = function(itemsPerRow) {
		var textNums = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
		return textNums[itemsPerRow]+'-up';
	};

	$scope.renderProject = function(row) {
		// returns boolean for template to know if it should render project details or not
		return (row + 1) === Math.ceil($scope.projectData.projectId / $scope.itemsPerRow);
	};

	// handle route changes from ui-router directly in the grid
	// TODO: change this event to on state start and handle animate-out before animate in
	$scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
		evt.preventDefault();
		// find the row the project details should render in
		if(toState.name === 'index.project' && $scope.itemsPerRow !== 0) {
			$scope.projectData = {
				projectId: toParams.projectId
			};
		}
		//console.log($scope.projectData);
	});
}]);

// Grid item controller
angular.module('Portfolio').controller('ItemCtrl', ['$rootScope', '$scope', 'data', function($rootScope, $scope, data) {
	
}]);