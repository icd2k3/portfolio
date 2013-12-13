'use strict';
/*
	GRID CONTROLLER
	- this handles the rendering of the portfolio items grid
*/

// Main grid controller
angular.module('Portfolio').controller('GridCtrl',
['$rootScope', '$scope', '$state', '$stateParams', 'data', 'aboutService',
function($rootScope, $scope, $state, $stateParams, data, aboutService) {
	// set shared vars
	aboutService.set(data.about);

	// set scope vars
	$scope.items       = data.items;
	$scope.rows        = [];
	$scope.itemsPerRow = 0;
	$scope.projectData = {};
	$scope.about       = aboutService.get;
	$scope.templates = {
		about: '/views/partials/about.html',
		item: '/views/partials/item.html'
	};

	console.log(data);

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
	});
}]);

angular.module('Portfolio').controller('AboutCtrl',
['$rootScope', '$scope', 'aboutService',
function($rootScope, $scope, aboutService) {
	$scope.about = aboutService.get; // allow for grabbing dynamic data between controllers ex: "about().active"
	$scope.aboutData = aboutService.get();  // use static data
}]);

// Grid item controller
angular.module('Portfolio').controller('ItemCtrl',
['$rootScope', '$scope', '$http', '$timeout',
function($rootScope, $scope, $http, $timeout) {

	$scope.setCube = function(firstRun) {
		var directions      = ['left', 'right', 'up', 'down'],
			randomDirection = directions[Math.round(Math.random()*4)],
			index,
			nextIndex;

		if(firstRun) {
			index = Math.floor(Math.random()*$scope.item.images.small.length);
		} else {
			index = $scope.cube.next;
		}
		if(index === $scope.item.images.small.length-1) {
			nextIndex = 0;
		} else {
			nextIndex = index + 1;
		}

		$scope.cube = {
			ready      : false,    			// both sides loaded
			transition : false,      		// start transition
			index      : index,      		// current image/side
			next       : nextIndex,
			direction  : randomDirection,	// animation direction of the cube
			sides: [						// data for each side
				{
					ready: false,
					image: $scope.item.images.small[index]
				},
				{
					ready: false,
					image: $scope.item.images.small[nextIndex]
				}
			]
		};
	};

	$scope.setCube(true);

	$scope.transitionComplete = function() {
		$scope.setCube();
	};
}]);