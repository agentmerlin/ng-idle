'use strict';

describe('ngIdle', function() {
  // helpers
  beforeEach(function() {
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  describe('keepalive', function() {
    var KeepaliveProvider, $rootScope, $log, $httpBackend, $interval, $http, $injector;

    beforeEach(module('ngIdle.keepalive'));

    beforeEach(function() {
      angular
      .module('app', function() {})
      .config(['KeepaliveProvider',
      function(_KeepaliveProvider_) {
        KeepaliveProvider = _KeepaliveProvider_;
      }
      ]);

      module('app');

      inject(function(_$rootScope_, _$log_, _$httpBackend_, _$interval_, _$http_, _$injector_) {
        $rootScope = _$rootScope_;
        $log = _$log_;
        $httpBackend = _$httpBackend_;
        $interval = _$interval_;
        $http = _$http_;
        $injector = _$injector_;
      });
    });

    var create = function(http) {
      if (http) KeepaliveProvider.http(http);
      return $injector.invoke(KeepaliveProvider.$get, null, {$rootScope: $rootScope, $log: $log, $interval: $interval, $http: $http});
    };

    describe('KeepaliveProvider', function() {

      it('interval() should update options', function() {
        KeepaliveProvider.interval(10);

        expect(create()._options().interval).toBe(10);
      });

      it('interval() should throw if nan or less than or equal to 0', function() {

        expect(function() {
          KeepaliveProvider.interval('asdsad');
        }).toThrow(new Error('Interval must be expressed in seconds and be greater than 0.'));

        expect(function() {
          KeepaliveProvider.interval(0);
        }).toThrow(new Error('Interval must be expressed in seconds and be greater than 0.'));

        expect(function() {
          KeepaliveProvider.interval(-1);
        }).toThrow(new Error('Interval must be expressed in seconds and be greater than 0.'));
      });
    });

    describe('Keepalive', function() {
      var Keepalive, DEFAULTKEEPALIVEINTERVAL = 10*60*1000;

      beforeEach(function() {
        Keepalive = create();
      });

      afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('setInterval should update an interval option', function(){
        Keepalive.setInterval(100);
        expect(create()._options().interval).toBe(100);
      });
      it('start() after a new LONGER timeout should NOT broadcast Keepalive when the default timeout expires', function(){
        spyOn($rootScope, '$broadcast');
        Keepalive.setInterval(100*60);
        Keepalive.start();
        $interval.flush(DEFAULTKEEPALIVEINTERVAL);
        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('Keepalive');
      });
      it('start() after a new LONGER timeout should broadcast Keepalive when the new LONGER expires', function(){
        spyOn($rootScope, '$broadcast');
        Keepalive.setInterval(100);
        Keepalive.start();
        $interval.flush(100 * 1000);
        expect($rootScope.$broadcast).toHaveBeenCalledWith('Keepalive');
      });
      it('start() should schedule ping timeout that broadcasts Keepalive event when it expires.', function() {
        spyOn($rootScope, '$broadcast');

        Keepalive.start();

        $interval.flush(DEFAULTKEEPALIVEINTERVAL);

        expect($rootScope.$broadcast).toHaveBeenCalledWith('Keepalive');
      });

      it('stop() should cancel ping timeout.', function() {
        spyOn($rootScope, '$broadcast');

        Keepalive.start();
        Keepalive.stop();

        $interval.flush(DEFAULTKEEPALIVEINTERVAL);

        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('Keepalive');
      });

      it('ping() should immediately broadcast Keepalive event', function() {
        spyOn($rootScope, '$broadcast');

        Keepalive.ping();

        $interval.flush(DEFAULTKEEPALIVEINTERVAL);

        expect($rootScope.$broadcast).toHaveBeenCalledWith('Keepalive');
      });
    });
  });

});
