ParalignAppControllers
  .controller('ContactUsCtrl', ['$rootScope', '$scope', 'Feedback', ContactUsCtrl]);

function ContactUsCtrl($rootScope, $scope, Feedback) {
  $scope.feedback = {
    content: '',
    user: $rootScope.user.id
  };



  $scope.sendFeedback = function () {
    $rootScope.loadingOn();

    if (!$scope.feedback.content) {
      return $rootScope.alert(
        'Hmm...',
        'But your message is empty! Please, specify your thoughts more closely.'
      );
    }

    new Feedback
      .$save($scope.feedback, function(){
        $rootScope.alert('Wow!', 'Thanks!');
        return undefined;
      })
      .catch(function(err){
        console.error('Failed send the message.', err);
        return $rootScope.alertError(3, 'Failed send the message', 'Please try again later');
      })
      .finally(function(){
        $rootScope.loadingOff();
        return $scope.feedback.content = '';
      });
    return undefined;
  };
}