'use strict';
/*
	GRID CONTROLLER
	- this handles the rendering of the portfolio projects grid
*/

// Main grid controller
angular.module('Portfolio').controller('GridCtrl',
['$rootScope', '$scope', '$state', '$stateParams', 'data', 'aboutService', 'Convert',
function($rootScope, $scope, $state, $stateParams, data, aboutService, Convert) {
	// set shared vars
	aboutService.set(data.about);

	// set scope vars
	$scope.projects    = data.projects;
	$scope.about       = aboutService.get;
	$scope.aboutData   = data.about;
	$scope.projectDetails = {
		projectId: null
	};
	$scope.grid = {
		projectsPerRow: 0,
		rows: []
	};
	$scope.templates = {
		about: '/views/about.html',
		item: '/views/item.html'
	};

	// assign class for grid (one-up, two-up, three-up, etc)
	// TODO: move this to a service or into the grid resize directive
	$scope.gridClass = function(projectsPerRow) {
		return Convert.numToString(projectsPerRow)+'-up';
	};

	// handle route changes
	$scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
		evt.preventDefault();
		// find the correct project if user has routed to one
		if(toState.name === 'index.project' && $scope.projectsPerRow !== 0) {
			for(var i=0; i<$scope.projects.length; i++) {
				if($scope.projects[i].selected) $scope.projects[i].selected = false;
				if($scope.projects[i].id === toParams.id) {
					$scope.projectDetails = $scope.projects[i];
					$scope.projects[i].selected = true;
					//break;
				}
			}
		} else if(toState.name === 'index.grid') {
			for(var i=0; i<$scope.projects.length; i++) {
				if($scope.projects[i].selected) $scope.projects[i].selected = false;
			}
			$scope.projectDetails = null;
		}
	});
}]);

// Grid item controller
angular.module('Portfolio').controller('ItemCtrl',
['$scope', '$http', '$timeout', 'Helpers',
function($scope, $http, $timeout, Helpers) {
	// clear both transition timers on the project cube
	var clearTimers = function() {
		if($scope.project.cube) {
			if($scope.project.cube.transitionTimer) {
				$timeout.cancel($scope.project.cube.transitionTimer);
			}
			if($scope.project.cube.transitionWaitTimer) {
				$timeout.cancel($scope.project.cube.transitionWaitTimer);
			}
		}
	};
	// cube model might already exist (for example, if user resized the grid) so we need to clear any active timers before restting the model
	clearTimers();

	// Set cube stuff
	var index = Math.floor(Math.random()*$scope.project.images.length), nextIndex;
	if(index === $scope.project.images.length - 1) {
		nextIndex = 0;
	} else {
		nextIndex = index + 1;
	}
	// TODO: move timers to array?
	$scope.project.cube = {
		index                : index,			// used for tracking the current image
		nextIndex            : nextIndex,		// used for tracking the next image in queue
		sidesLoaded          : 0,				// used for knowing when both sides of the cube are loaded
		firstLoad            : false,			// initial load of the first cube side (site load init)
		sideArchive          : [],				// used for storing sides that have already been loaded for less network calls
		transition           : false,			// cube is in transition
		transitionComplete   : false,			// cube has completed transition
		pause                : false,			// pause the cube if user is hovering on it or it's currently selected
		transitionWaitTimer  : null,			// random ammount of time the cube waits before animating to the next side
		transitionTimer      : null,			// full timer that includes the random wait delay above ^,
		direction            : Helpers.getRandomDirection()
	};

	// user is hovering over this project cube
	$scope.onMouseOver = function() { $scope.project.cube.pause = true; };
	$scope.onMouseOut = function() { if(!$scope.project.selected) { $scope.project.cube.pause = false; } };
}]);

// Cube controller
// TODO: move cube logic out of item controller into here
angular.module('Portfolio').controller('CubeCtrl',
['$scope', '$http', '$timeout', 'Helpers',
function($scope, $http, $timeout, Helpers) {

}]);	