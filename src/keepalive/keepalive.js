angular.module('ngIdle.keepalive', [])
  .provider('Keepalive', function() {
    var options = {
      interval: 10 * 60
    };

    var setInterval = this.interval = function(seconds) {
      seconds = parseInt(seconds);

      if (isNaN(seconds) || seconds <= 0) throw new Error('Interval must be expressed in seconds and be greater than 0.');
      options.interval = seconds;
    };

    this.$get = ['$rootScope', '$log', '$interval',
      function($rootScope, $log, $interval) {

        var state = {
          ping: null
        };

        function ping() {
          $rootScope.$broadcast('Keepalive');
        }

        return {
          _options: function() {
            return options;
          },
          setInterval: setInterval,
          start: function() {
            $interval.cancel(state.ping);

            state.ping = $interval(ping, options.interval * 1000);
            return state.ping;
          },
          stop: function() {
            $interval.cancel(state.ping);
          },
          ping: function() {
            ping();
          }
        };
      }
    ];
  });
