(function() {
    var app = angular.module('myapp', []);
    /* ------------
    Registration */
    app.controller('RegistrationController', function($scope, $http, $window) {
        $scope.passwordsMatch = function() {
            if ($scope.p === $scope.pconfirm) {
                return true;
            } else {
                return false;
            }
        };
        $scope.createUser = function() {
            $http.post("http://127.0.0.1:3000/users/new", {
                username: $scope.username,
                p: $scope.p
            }).success(function(data, status) {
                console.log("user successfully created: ", data);
                $window.location.href = 'mytodolist.html?u=' + $scope.username;
            }).error(function(data, status) {
                console.log("user already exists: ", data);
                $scope.errorMessage = data;
            });
        };
    });
    /* ------------
    Login */
    app.controller('LoginController', function($scope, $http, $window) {
        $scope.loginUser = function() {
            $http.post("http://127.0.0.1:3000/users/login", {
                username: $scope.username,
                p: $scope.p
            }).success(function(data, status) {
                console.log("User logged in");
                $window.location.href = 'mytodolist.html?u=' + $scope.username;
            }).error(function(data, status) {
                console.log("User or password not found");
                $scope.errorMessage = data;
            });
        };
    });
    /* ------------
    To-do */
    app.controller('TodoController', function($scope, $http, $window) {

        $scope.user = $window.location.href.split('?')[1].split('=')[1];

        $scope.submitNew = function() {
            $http.post("http://127.0.0.1:3000/todos/new", {
                description: $scope.todoEntry,
                checked: false,
                user: $scope.user
            }).success(function(data, status) {
                $scope.todos.push(data);
                $scope.todoEntry = undefined;
            }).error(function(data, status) {
                console.log(data);
            });
        };

        $scope.updateTodo = function(todo) {
            $http.post("http://127.0.0.1:3000/todos/update", todo)
                .success(function(data, status) {
                    console.log('todo updated: ', data);
                }).error(function(data, status) {
                    console.log(data);
                });
        }

        $scope.initTodos = function() {
            $http.get("http://127.0.0.1:3000/todos?user=" + $scope.user)
                .success(function(data, status) {
                    $scope.todos = data;
                    console.log($scope.todos);
                }).error(function(data, status) {
                    console.log('error: ', data);
                });
        }
        $scope.todos = [];
        $scope.initTodos();
    });
})();
