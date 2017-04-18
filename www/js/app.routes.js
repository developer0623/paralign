ParalignApp.config(['$stateProvider', '$urlRouterProvider', routes]);


function routes($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login',    login)
    .state('sidemenu', sidemenu)
      .state('home',           home)
      .state('tutorial',       tutorial)
      .state('companion',      companion)
      .state('connections',    connections)
      .state('chat',           chat)
      .state('myMinds',        myMinds)
      .state('similarMinds',   similarMinds)
      .state('wonderingMinds', wonderingMinds)
      .state('newThought',     newThought)
      .state('contactUs',      contactUs)

      .state('icedivingintro', icedivingintro)
      .state('icediving',      icediving)

      .state('sunshine',       sunshine)
      .state('sunshineintro',  sunshineintro)

      .state('lake',           lake)
      .state('lakeintro',      lakeintro);


  $urlRouterProvider.otherwise('/');
}








/************************
 * State Controllers
 ************************/
var login = {
  url: '/:mode',
  templateUrl: 'pages/login.html',
  controller: 'LoginCtrl',
  cache: false,
  data: {
    noLogin: true
  },
  resolve: {
    _goHomeifLogged: goHomeifLogged
  }
};

var sidemenu = {
  url: '/sidemenu',
  //abstract: true,
  templateUrl: 'pages/sideMenu.html'
};

var home = {
  url: '^/home',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/home.html',
      controller: 'HomeCtrl'
    }
  }
};

var tutorial = {
  url: '^/tutorial',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/tutorial.html',
      controller: 'TutorialCtrl'
    }
  }
};

var contactUs = {
  url: '^/contactus',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/contactUs.html',
      controller: 'ContactUsCtrl'
    }
  }
};

var connections = {
  url: '^/connections',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/connections.html',
      controller: 'ConnectionsCtrl'
    }
  }
};

var newThought = {
  url: '^/newthought',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/newThought.html',
      controller: 'NewThoughtCtrl'
    }
  }
};

var chat = {
  url: '^/chat/:id',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/chat.html',
      controller: 'ChatCtrl',
      resolve: {
        CurrentChat: getCurrentChat,
        ChatMessages: getChatMessages
      }
    }
  }
};


var icedivingintro = {
  url: '^/icedivingintro',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/icediving/icedivingintro.html'
    }
  }
};
var icediving = {
  url: '^/icediving',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/icediving/icediving.html',
      controller: 'IceDivingCtrl'
    }
  }
};



var sunshineintro = {
  url: '^/sunshineintro',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/sunshine/sunshineintro.html'
    }
  }
};
var sunshine = {
  url: '^/sunshine',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/sunshine/sunshine.html',
      controller: 'SunshineCtrl'
    }
  }
};



var lakeintro = {
  url: '^/lakeintro',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/lake/lakeintro.html',
      controller: 'LakeCtrl'
    }
  }
};
var lake = {
  url: '^/lake',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/lake/lake.html',
      controller: 'LakeCtrl'
    }
  }
};



var companion = {
  url: '^/companion',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/companion.html',
      controller: 'CompanionCtrl'
    }
  }
};

/*
* Params:
* :thought {String} selected thought ID
* :processingThought {Object} thought which was created just now and it is in process
* */
var myMinds = {
  url: '^/myminds/:thought/:processingThought',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/myMinds/myMinds.html',
      controller: 'MyMindsCtrl'
    }
  }
};

var similarMinds = {
  url: '^/similarminds',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/similarMinds.html',
      controller: 'SimilarMindsCtrl'
    }
  }
};

var wonderingMinds = {
  url: '^/wonderingminds',
  parent: 'sidemenu',
  cache: false,
  views: {
    mainContent: {
      templateUrl: 'pages/wonderingMinds.html',
      controller: 'WonderingMindsCtrl'
    }
  }
};
/************************
 * End State Controllers
 ************************/










/************************
 * Resolve functions
 ************************/
function goHomeifLogged($rootScope, $q, $state, $stateParams) {
  var deferred = $q.defer();

  if ($stateParams.mode === 'identificationAnonymous') deferred.resolve();
  if ($stateParams.mode === 'force') deferred.resolve();
  else {
    if (!$rootScope.user || !$rootScope.user.id) {
      $rootScope.getLoggedUser(function(user){
        $rootScope.user = user;
        if (user && user.id) $state.go('home');
        return deferred.resolve(user);
      });
    }
    else {
      $state.go('home');
      deferred.resolve($rootScope.user);
    }
  }
  return deferred.promise;
}







function getCurrentChat($rootScope, $stateParams, ChatService, $q) {
  $rootScope.loadingOn();
  var deferred   = $q.defer();
  var cachedChat = ChatService.getFromCache($stateParams.id);
  if (cachedChat) {
    deferred.resolve(cachedChat);
  }
  else {
    ChatService.chatCache($stateParams.id, function(err){
      if (err) {
        error('resolve :: getCurrentChat :: ChatService.chatCache.', err);
        return deferred.resolve([]);
      }
      else {
        return deferred.resolve(ChatService.getFromCache($stateParams.id));
      }
    });
  }
  return deferred.promise;
}






function getChatMessages($stateParams, ChatService, $q) {
  var deferred       = $q.defer();
  var cachedMessages = ChatService.getFromCacheMessages($stateParams.id);
  if (cachedMessages && cachedMessages.length) {
    deferred.resolve(cachedMessages);
  }
  else {
    ChatService.fetchNewMessages($stateParams.id, function(err, resultMessages){
      if (err) {
        error('resolve :: getChatMessages :: ChatService.fetchNewMessages.', err);
        return deferred.resolve([]);
      }
      else {
        return deferred.resolve(resultMessages);
      }
    });
  }
  return deferred.promise;
}





/************************
 * End Resolve functions
 ************************/
