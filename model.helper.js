(function() {
  'use strict';

  var serviceId = 'ModelHelperService';

  angular.module('Helper.Model,[]')
    .factory(serviceId, ModelHelperService);

  var _default = {
    'pk': 'id'
  };

  ModelHelperService.$inject = ['$q'];

  /** @ngInject */
  function ModelHelperService($q) {
    var service = function(option) {
      /**
       * 模型存储
       * @private
       */
      this._store = {};
      this._promiseStore = {};
      this.option = angular.extend({}, _default, option);
    };

    service.prototype.find = find;
    service.prototype.forceFind = forceFind;
    service.prototype.list = list;
    service.prototype._load = _load;
    service.prototype._loadCollection = _loadCollection;
    service.prototype._update = _update;
    service.prototype._index = _index;
    service.prototype._indexFindPromise = _indexFindPromise;
    service.prototype._findPromise = _findPromise;
    service.prototype._listPromise = _listPromise;

    return service;

    //////////////////////////

    /**
     * 根据id查找单个数据
     * @param id
     * @returns {promise.promise|Function|jQuery.promise|*|b.promise|promise}
     */
    function find(id) {
      /*jshint validthis:true */
      var self = this;

      var deferred = $q.defer();

      var model = self._index(id);
      if (model) {
        deferred.resolve(model);
      } else {
        self._load(deferred, id);
      }
      return deferred.promise;
    }

    function forceFind(id) {
      /*jshint validthis:true */
      var self = this;

      var deferred = $q.defer();

      var model = self._index(id);
      if (model) {
        deferred.resolve(model);
      } else {
        self._load(deferred, id, true);
      }
      return deferred.promise;
    }

    function list(params, headers) {
      var deferred = $q.defer();
      /*jshint validthis:true */
      this._loadCollection(deferred, params, headers);
      return deferred.promise;
    }


    function _indexFindPromise(id, force) {
      /*jshint validthis:true */
      var self = this;
      var promise;
      if (!self._promiseStore[id] || force) {
        promise = self._findPromise(id);
        self._promiseStore[id] = promise;
      } else {
        promise = self._promiseStore[id];
      }
      return promise;
    }

    /**
     * 载入数据
     * @param id
     * @param deferred
     * @private
     */
    function _load(deferred, id, force) {
      /*jshint validthis:true */
      var self = this;
      var promise = self._indexFindPromise(id, force);
      promise.then(function(modelData) {
        var model = self._update(modelData);
        deferred.resolve(model);
      }, function(data) {
        deferred.reject(data);
      });
    }


    /**
     * 载入列表数据
     * @param deferred
     * @param params
     * @param headers
     * @private
     */
    function _loadCollection(deferred, params, headers) {
      /*jshint validthis:true */
      var self = this;
      var promise = self._listPromise(params, headers);
      promise.then(function(collection) {
        // wrap each obj
        collection.forEach(function(modelData, index) {
          if (modelData === null || modelData === undefined) {
            return;
          }
          collection[index] = self._update(modelData);
        });
        deferred.resolve(collection);

      }, function(data) {
        deferred.reject(data);
      });
    }

    /**
     * 更新存储的变量
     * @param {object} modelData
     * @returns {model|undefined|*}
     * @private
     */
    function _update(modelData) {
      /*jshint validthis:true */
      var self = this;
      var model = self._index(modelData[self.option.pk]);
      if (model) {
        angular.extend(model, modelData);
      } else {
        model = modelData;
        self._store[modelData[self.option.pk]] = model;
      }
      return model;
    }

    /**
     * 索引当储存的变量
     * @param {int} id
     * @returns {model|undefined}
     * @private
     */
    function _index(id) {
      /*jshint validthis:true */
      var self = this;
      return self._store[id];
    }

    //noinspection JSUnusedLocalSymbols
    /**
     * find的辅助方法，在使用时重写当前方法，返回promise
     * @param {int} id
     * @returns {promise}
     * @private
     */
    function _findPromise(id) { // jshint ignore:line
      throw new Error('Create your own _findPromise method to return promise for get single Model!');
    }

    //noinspection JSUnusedLocalSymbols
    /**
     * list的辅助方法，在使用时重写当前方法，返回promise
     * @param {object} params
     * @param {object} headers
     * @returns {promise}
     * @private
     */
    function _listPromise(params, headers) { // jshint ignore:line
      throw new Error('Create your own _listPromise method to return promise for get list of Model!');
    }
  }
})();
