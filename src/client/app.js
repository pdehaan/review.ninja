var module = angular.module('app', 
    ['ninja.filters', 
     'ninja.config',
     'ui.utils',
     'ui.router', 
     'ui.bootstrap',
     'infinite-scroll',
     'angulartics', 
     'angulartics.google.analytics']);

var filters = angular.module('ninja.filters', []);

// *************************************************************
// Delay start 
// *************************************************************

angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
});

// *************************************************************
// States
// *************************************************************

module.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$analyticsProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider, $analyticsProvider) {

        $stateProvider

            // 
            // Home state 
            //
            .state('home', {
                url: '/',
                templateUrl: '/templates/home.html',
                controller: 'HomeCtrl'
            })

            //
            // Repo state (abstract)
            //
            .state('repo', {
                abstract: true,
                url: '/:user/:repo',
                templateUrl: '/templates/repo.html',
                resolve: {
                    repo: ['$rootScope', '$stateParams', '$HUBService',
                        function($rootScope, $stateParams, $HUBService) {
                            return $HUBService.call('repos', 'get', {
                                user: $stateParams.user,
                                repo: $stateParams.repo
                            }, function(err, repo) {
                                if(!err) {
                                    $rootScope.$emit('repos:get', repo.value);
                                }
                            });
                        }
                    ]
                }
            })

            //
            // Repo master state
            //
            .state('repo.list', {
                url: '',
                templateUrl: '/templates/list.html',
                controller: 'RepoCtrl',
                resolve: {
                    repo: ['repo', function(repo) {
                        return repo; // inherited from parent state
                    }]
                }
            })

            //
            // Repo detail state (pull request list)
            //
            .state('repo.pull', {
                abstract: true,
                url: '/pull/:number',
                templateUrl: '/templates/pull.html',
                controller: 'PullCtrl',
                resolve: {
                    repo: ['repo', function(repo) {
                        return repo; // inherited from parent state
                    }],
                    pull: ['$stateParams', '$HUBService',
                        function($stateParams, $HUBService) {
                            return $HUBService.wrap('pullRequests', 'get', {
                                user: $stateParams.user,
                                repo: $stateParams.repo,
                                number: $stateParams.number
                            });
                        }
                    ]
                }
            })

            //
            // Repo issue state (abstract)
            //
            .state('repo.pull.issue', {
                abstract: true,
                url: '?state',
                templateUrl: '/templates/issue.html',
                resolve: {
                    issues: ['$HUBService', '$stateParams', 'Issue',
                        function($HUBService, $stateParams, Issue) {

                            var state = ($stateParams.state==='open' || $stateParams.state==='closed') ? $stateParams.state : 'open';

                            return $HUBService.call('issues', 'repoIssues', {
                                user: $stateParams.user,
                                repo: $stateParams.repo,
                                labels: 'review.ninja, pull-request-' + $stateParams.number,
                                state: state
                            }, function(err, res) {
                                if(!err) {
                                    res.affix.forEach(function(issue) {
                                        issue = Issue.parse(issue);
                                    });
                                }
                            });
                        }
                    ]
                }
            })

            //
            // Repo issue master state
            //
            .state('repo.pull.issue.master', {
                url: '?issues',
                templateUrl: '/templates/pull/list.html',
                controller: 'PullListCtrl',
                resolve: {
                    issues: ['issues', function(issues) {
                        return issues;
                    }]
                }
            })

            //
            // Repo issue detail state
            //
            .state('repo.pull.issue.detail', {
                url: '/:issue',
                templateUrl: '/templates/pull/issue.html',
                controller: 'PullIssueCtrl',
                resolve: {
                    issue: ['$stateParams', '$HUBService', 'Issue',
                        function($stateParams, $HUBService, Issue) {
                            return $HUBService.call('issues', 'getRepoIssue', {
                                user: $stateParams.user,
                                repo: $stateParams.repo,
                                number: $stateParams.issue
                            }, function(err, issue) {
                                if(!err) {
                                    issue.value = Issue.parse(issue.value);
                                }
                            });
                        }
                    ]
                }
            })

            .state('repo.settings', {
                url: '/settings',
                templateUrl: '/templates/settings.html',
                controller: 'SettingsCtrl',
                resolve: {
                    repo: ['repo', function(repo) {
                        return repo; // inherited from parent state
                    }]
                }
            });

        $urlRouterProvider.otherwise('/');

        $locationProvider.html5Mode(true);

        $analyticsProvider.withAutoBase(true); // Records full path

    }
])
.run(['$config', '$rootScope', '$state', '$stateParams',
    function($config, $rootScope, $state, $stateParams) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $config.get(function(data, status) {
            if (data.gacode) {
                ga('create', data.gacode, 'auto');
            }
        });
    }
]);
