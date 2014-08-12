var app = angular.module('myApp' , ['ngRoute']);

app.config(['$routeProvider' , function ($routeProvider){
	$routeProvider.when('/' , {
		templateUrl: 'partials/index',
		controller: 'mainControl'
	}).otherwise({redirectTo: '/'})
}])

app.controller('mainControl' , ['$scope' , '$http' , function ($scope , $http){

	$scope.url = '';
	$scope.load = false;

	$scope.test = function(){
		$('#urlInput').val('');
		$scope.load = true;
		$scope.response = '';

		$http({
		    url: "/search",
		    dataType: "json",
		    method: "POST",
		    data: {url:$scope.url},
		    headers: {
		        "Content-Type": "application/json; charset=utf-8"
		    }
		}).success(function(response){
		    $scope.response = response;
		    $scope.load = false;
		}).error(function(error){
		    console.log(error)
		});
	}
}])