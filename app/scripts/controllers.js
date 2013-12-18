'use strict';
/*
	GRID CONTROLLER
	- this handles the rendering of the portfolio projects grid
*/

// Main grid controller
angular.module('Portfolio').controller('GridCtrl',
['$rootScope', '$scope', '$state', '$stateParams', 'data', 'aboutService',
function($rootScope, $scope, $state, $stateParams, data, aboutService) {
	// set shared vars
	aboutService.set(data.about);

	// set scope vars
	$scope.projects    = data.projects;
	$scope.about       = aboutService.get;
	$scope.projectDetails = {
		projectId: null
	};
	$scope.grid = {
		projectsPerRow: 0,
		rows: []
	};
	$scope.templates = {
		about: '/views/partials/about.html',
		item: '/views/partials/item.html'
	};

	// assign class for grid (one-up, two-up, three-up, etc)
	// TODO: move this to a service or into the grid resize directive
	$scope.gridClass = function(projectsPerRow) {
		var textNums = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
		return textNums[projectsPerRow]+'-up';
	};

	$scope.renderProject = function(row) {
		// returns boolean for template to know if it should render project details or not
		return (row + 1) === Math.ceil($scope.projectDetails.projectId / $scope.grid.projectsPerRow);
	};

	// handle route changes from ui-router directly in the grid
	// TODO: change this event to on state start and handle animate-out before animate in
	$scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
		evt.preventDefault();
		// find the row the project details should render in
		if(toState.name === 'index.project' && $scope.projectsPerRow !== 0) {
			$scope.projectDetails.projectId = toParams.projectId;
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
// TODO: store timer in model so we can clear it in case of screen resize etc
angular.module('Portfolio').controller('ItemCtrl',
['$rootScope', '$scope', '$http', '$timeout',
function($rootScope, $scope, $http, $timeout) {
	// model is already there. This probably means the user switched screen sizes and re-rendered the grid
	// cancel any transition timers and reset the model
	if($scope.project.cube) {
		if($scope.project.cube.transitionTimer) {
			$timeout.cancel($scope.project.cube.transitionTimer);
		}
		if($scope.project.cube.transitionWaitTimer) {
			$timeout.cancel($scope.project.cube.transitionWaitTimer);
		}
		$scope.project.cube = null;
		$scope.$apply;
	}

	// set cube model
	var index = Math.floor(Math.random()*$scope.project.images.length), nextIndex;
	if(index === $scope.project.images.length - 1) {
		nextIndex = 0;
	} else {
		nextIndex = index + 1;
	}
	$scope.getRandomDirection = function() {
		var directions = ['left', 'right', 'up', 'down'];
		return directions[Math.floor(Math.random()*directions.length)];
	};
	$scope.project.cube = {
		index                : index,			// used for tracking the current image
		nextIndex            : nextIndex,		// used for tracking the next image in queue
		sidesLoaded          : 0,				// used for knowing when both sides of the cube are loaded
		transition           : false,			// cube is in transition
		transitionComplete   : false,			// cube has completed transition
		transitionWaitTimer  : null,			// random ammount of time the cube waits before animating to the next side
		transitionTimer      : null,			// full timer that includes the random wait delay above ^,
		direction            : $scope.getRandomDirection()
	};
}]);