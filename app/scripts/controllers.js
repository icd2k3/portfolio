'use strict';
// CONTROLLERS ///////////////////
/*
	- Handles the overall data structure for the site
*/

// Main grid controller
/*
	This root controller handles all the main data for the site (from the json file),
	router state switching (/project/name), and grid layout.
*/
angular.module('Portfolio').controller('GridCtrl',
['$rootScope', '$scope', '$state', '$stateParams', 'data', 'Convert',
function($rootScope, $scope, $state, $stateParams, data, Convert) {
	// set overall scope vars
	$scope.projects = data.projects;	// all project data
	$scope.projectDetails = {			// used to store the currently selected project's data 
		projectId: null
	};
	$scope.grid = {
		projectsPerRow: 0,
		rows: []
	};
	$scope.about = {
		active: false,
		data: data.about
	};
	$scope.templates = {
		about: '/views/about.html',
		item: '/views/item.html'
	};

	// assign class for grid (one-up, two-up, three-up, etc)
	$scope.gridClass = function(projectsPerRow) {
		return Convert.numToString(projectsPerRow)+'-up';
	};

	// handle project url route changes
	$scope.$on('$stateChangeSuccess', function(evt, toState, toParams) { //, fromState, fromParams
		evt.preventDefault();
		var i;
		// find the correct project if user has routed to one
		if(toState.name === 'index.project' && $scope.projectsPerRow !== 0) {
			for(i=0; i<$scope.projects.length; i++) {
				if($scope.projects[i].selected) { $scope.projects[i].selected = false; }
				if($scope.projects[i].id === toParams.id) {
					$scope.projectDetails = $scope.projects[i];
					$scope.projects[i].selected = true;
				}
			}
		} else if(toState.name === 'index.grid') {
			for(i=0; i<$scope.projects.length; i++) {
				if($scope.projects[i].selected) { $scope.projects[i].selected = false; }
			}
			$scope.projectDetails = null;
		}
	});
}]);

// Grid item controller
/*
	This controller handles each individual item within the grid.
	Handles things like pausing, selecting, hovering
*/
angular.module('Portfolio').controller('ItemCtrl',
['$scope', '$http', '$timeout', 'WindowFocus',
function($scope, $http, $timeout, WindowFocus) {
	// user is hovering over this project block
	$scope.onMouseOver = function() {
		$scope.project.cube.pause = true;
	};
	$scope.onMouseOut = function() {
		if(!$scope.project.selected) { $scope.project.cube.pause = false; }
	};

	// watch project select/deselect
	$scope.$watch(function(){ return $scope.project.selected; }, function(newVal, oldVal){
		if(newVal === oldVal) { return; }
		if(newVal) {
			$scope.project.cube.pause = true;
		} else {
			$scope.project.cube.pause = false;
		}
	});

	// pause all cubes when user has left the window/tab (causes issues with transitions etc)
	$scope.$watch(WindowFocus.get, function(newVal, oldVal) {
		if(newVal === oldVal) { return; }
		if(newVal) {
			$scope.project.cube.pause = false;
		} else {
			$scope.project.cube.pause = true;
		}
	});
}]);

// Cube controller
/*
	This controller handles setting cube data for each grid item
*/
angular.module('Portfolio').controller('CubeCtrl',
['$scope', '$http', '$timeout', 'Helpers',
function($scope, $http, $timeout, Helpers) {
	// set cube data if it exists
	var cube = $scope.project.cube,
		index, nextIndex,  // index & next index of the project image that should be displayed
		firstLoad;		   // used for the initial staggered load-in animation for all items
	// clear both transition timers on the project cube
	var clearTimers = function() {
		if(cube && cube.transitionTimer) { $timeout.cancel(cube.transitionTimer); }
		if(cube && cube.transitionWaitTimer) { $timeout.cancel(cube.transitionWaitTimer); }
	};
	if(cube) {
		// cube data already exists (can happen when user resizes the grid for example)
		clearTimers();
		index     = cube.index;
		nextIndex = cube.nextIndex;
		firstLoad = cube.firstLoad;
	} else {
		// no cube data already exists, this will be the initial cube
		index = Math.floor(Math.random()*$scope.project.images.length);
		if(index === $scope.project.images.length - 1) { nextIndex = 0;
		} else { nextIndex = index + 1; }
		firstLoad = false;
	}
	$scope.project.cube = {
		index                : index,			// used for tracking the current image
		nextIndex            : nextIndex,		// used for tracking the next image in queue
		sidesLoaded          : 0,				// used for knowing when both sides of the cube are loaded
		firstLoad            : firstLoad,		// initial load of the first cube side (site load init)
		sideArchive          : [],				// used for storing sides that have already been loaded for less network calls
		transition           : false,			// cube is in transition
		transitionComplete   : false,			// cube has completed transition
		pause                : false,			// pause the cube if user is hovering on it or it's currently selected
		transitionWaitTimer  : null,			// random ammount of time the cube waits before animating to the next side
		transitionTimer      : null,			// full timer that includes the random wait delay above ^,
		direction            : Helpers.getRandomDirection()
	};
}]);