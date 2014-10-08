/*! AeroGear JavaScript Library - v2.0.0-beta - 2014-10-08
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
(function( window, undefined ) {

/**
    The AeroGear namespace provides a way to encapsulate the library's properties and methods away from the global namespace
    @namespace
 */
this.AeroGear = {};

/**
    AeroGear.Core is a base for all of the library modules to extend. It is not to be instantiated and will throw an error when attempted
    @class
    @private
 */
AeroGear.Core = function() {
    // Prevent instantiation of this base class
    if ( this instanceof AeroGear.Core ) {
        throw "Invalid instantiation of base class AeroGear.Core";
    }

    /**
        This function is used by the different parts of AeroGear to add a new Object to its respective collection.
        @name AeroGear.add
        @method
        @param {String|Array|Object} config - This can be a variety of types specifying how to create the object. See the particular constructor for the object calling .add for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.add = function( config ) {
        var i,
            current,
            collection = this[ this.collectionName ] || {};
        this[ this.collectionName ] = collection;

        if ( !config ) {
            return this;
        } else if ( typeof config === "string" ) {
            // config is a string so use default adapter type
            collection[ config ] = AeroGear[ this.lib ].adapters[ this.type ]( config, this.config );
        } else if ( Array.isArray( config ) ) {
            // config is an array so loop through each item in the array
            for ( i = 0; i < config.length; i++ ) {
                current = config[ i ];

                if ( typeof current === "string" ) {
                    collection[ current ] = AeroGear[ this.lib ].adapters[ this.type ]( current, this.config );
                } else {
                    if( current.name ) {

                        // Merge the Module( authz, datamanger, ... )config with the adapters settings
                        current.settings = AeroGear.extend( current.settings || {}, this.config );

                        collection[ current.name ] = AeroGear[ this.lib ].adapters[ current.type || this.type ]( current.name, current.settings );
                    }
                }
            }
        } else {
            if( !config.name ) {
                return this;
            }

            // Merge the Module( authz, datamanger, ... )config with the adapters settings
            // config is an object so use that signature
            config.settings = AeroGear.extend( config.settings || {}, this.config );

            collection[ config.name ] = AeroGear[ this.lib ].adapters[ config.type || this.type ]( config.name, config.settings );
        }

        // reset the collection instance
        this[ this.collectionName ] = collection;

        return this;
    };
    /**
        This function is used internally by datamanager, etc. to remove an Object (store, etc.) from the respective collection.
        @name AeroGear.remove
        @method
        @param {String|String[]|Object[]|Object} config - This can be a variety of types specifying how to remove the object. See the particular constructor for the object calling .remove for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.remove = function( config ) {
        var i,
            current,
            collection = this[ this.collectionName ] || {};

        if ( typeof config === "string" ) {
            // config is a string so delete that item by name
            delete collection[ config ];
        } else if ( Array.isArray( config ) ) {
            // config is an array so loop through each item in the array
            for ( i = 0; i < config.length; i++ ) {
                current = config[ i ];

                if ( typeof current === "string" ) {
                    delete collection[ current ];
                } else {
                    delete collection[ current.name ];
                }
            }
        } else if ( config ) {
            // config is an object so use that signature
            delete collection[ config.name ];
        }

        // reset the collection instance
        this[ this.collectionName ] = collection;

        return this;
    };
};

/**
    Utility function to merge many Objects in one target Object which is the first object in arguments list.
    @private
    @method
*/
AeroGear.extend = function() {
    var name, i, source,
        target = arguments[ 0 ];
    for( i=1; i<arguments.length; i++ ) {
        source = arguments[ i ];
        for( name in source ) {
            target[ name ] = source[ name ];
        }
    }
    return target;
};

/**
    This callback is executed when an HTTP request completes whether it was successful or not.
    @callback AeroGear~completeCallbackREST
    @param {Object} jqXHR - The jQuery specific XHR object
    @param {String} textStatus - The text status message returned from the server
 */
/**
    This callback is executed when an HTTP error is encountered during a request.
    @callback AeroGear~errorCallbackREST
    @param {Object} jqXHR - The jQuery specific XHR object
    @param {String} textStatus - The text status message returned from the server
    @param {Object} errorThrown - The HTTP error thrown which caused the is callback to be called
 */
/**
    This callback is executed when an HTTP success message is returned during a request.
    @callback AeroGear~successCallbackREST
    @param {Object} data - The data, if any, returned in the response
    @param {String} textStatus - The text status message returned from the server
    @param {Object} jqXHR - The jQuery specific XHR object
 */
 /**
    This callback is executed when an HTTP progress message is returned during a request.
    @callback AeroGear~progressCallbackREST
    @param {Object} XMLHttpRequestProgressEvent - The progress event
 */
/**
    This callback is executed when an error is encountered saving to local or session storage.
    @callback AeroGear~errorCallbackStorage
    @param {Object} errorThrown - The HTTP error thrown which caused the is callback to be called
    @param {Object|Array} data - An object or array of objects representing the data for the failed save attempt.
 */
/**
    This callback is executed when data is successfully saved to session or local storage.
    @callback AeroGear~successCallbackStorage
    @param {Object} data - The updated data object after the new saved data has been added
 */

(function() {
var define, requireModule, require, requirejs;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requirejs = require = requireModule = function(name) {
  requirejs._eak_seen = registry;

    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    if (!registry[name]) {
      throw new Error("Could not find module " + name);
    }

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(resolve(deps[i])));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;

    function resolve(child) {
      if (child.charAt(0) !== '.') { return child; }
      var parts = child.split("/");
      var parentBase = name.split("/").slice(0, -1);

      for (var i=0, l=parts.length; i<l; i++) {
        var part = parts[i];

        if (part === '..') { parentBase.pop(); }
        else if (part === '.') { continue; }
        else { parentBase.push(part); }
      }

      return parentBase.join("/");
    }
  };
})();

define("promise/all",
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */

    var isArray = __dependency1__.isArray;
    var isFunction = __dependency1__.isFunction;

    /**
      Returns a promise that is fulfilled when all the given promises have been
      fulfilled, or rejected if any of them become rejected. The return promise
      is fulfilled with an array that gives all the values in the order they were
      passed in the `promises` array argument.

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.resolve(2);
      var promise3 = RSVP.resolve(3);
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```

      If any of the `promises` given to `RSVP.all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.reject(new Error("2"));
      var promise3 = RSVP.reject(new Error("3"));
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```

      @method all
      @for RSVP
      @param {Array} promises
      @param {String} label
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
    */
    function all(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to all.');
      }

      return new Promise(function(resolve, reject) {
        var results = [], remaining = promises.length,
        promise;

        if (remaining === 0) {
          resolve([]);
        }

        function resolver(index) {
          return function(value) {
            resolveAll(index, value);
          };
        }

        function resolveAll(index, value) {
          results[index] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        }

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && isFunction(promise.then)) {
            promise.then(resolver(i), reject);
          } else {
            resolveAll(i, promise);
          }
        }
      });
    }

    __exports__.all = all;
  });
define("promise/asap",
  ["exports"],
  function(__exports__) {
    "use strict";
    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var local = (typeof global !== 'undefined') ? global : this;

    // node
    function useNextTick() {
      return function() {
        process.nextTick(flush);
      };
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    function useSetTimeout() {
      return function() {
        local.setTimeout(flush, 1);
      };
    }

    var queue = [];
    function flush() {
      for (var i = 0; i < queue.length; i++) {
        var tuple = queue[i];
        var callback = tuple[0], arg = tuple[1];
        callback(arg);
      }
      queue = [];
    }

    var scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function asap(callback, arg) {
      var length = queue.push([callback, arg]);
      if (length === 1) {
        // If length is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        scheduleFlush();
      }
    }

    __exports__.asap = asap;
  });
define("promise/cast",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.Promise.cast` returns the same promise if that promise shares a constructor
      with the promise being casted.

      Example:

      ```javascript
      var promise = RSVP.resolve(1);
      var casted = RSVP.Promise.cast(promise);

      console.log(promise === casted); // true
      ```

      In the case of a promise whose constructor does not match, it is assimilated.
      The resulting promise will fulfill or reject based on the outcome of the
      promise being casted.

      In the case of a non-promise, a promise which will fulfill with that value is
      returned.

      Example:

      ```javascript
      var value = 1; // could be a number, boolean, string, undefined...
      var casted = RSVP.Promise.cast(value);

      console.log(value === casted); // false
      console.log(casted instanceof RSVP.Promise) // true

      casted.then(function(val) {
        val === value // => true
      });
      ```

      `RSVP.Promise.cast` is similar to `RSVP.resolve`, but `RSVP.Promise.cast` differs in the
      following ways:
      * `RSVP.Promise.cast` serves as a memory-efficient way of getting a promise, when you
      have something that could either be a promise or a value. RSVP.resolve
      will have the same effect but will create a new promise wrapper if the
      argument is a promise.
      * `RSVP.Promise.cast` is a way of casting incoming thenables or promise subclasses to
      promises of the exact class specified, so that the resulting object's `then` is
      ensured to have the behavior of the constructor you are calling cast on (i.e., RSVP.Promise).

      @method cast
      @for RSVP
      @param {Object} object to be casted
      @return {Promise} promise that is fulfilled when all properties of `promises`
      have been fulfilled, or rejected if any of them become rejected.
    */


    function cast(object) {
      /*jshint validthis:true */
      if (object && typeof object === 'object' && object.constructor === this) {
        return object;
      }

      var Promise = this;

      return new Promise(function(resolve) {
        resolve(object);
      });
    }

    __exports__.cast = cast;
  });
define("promise/config",
  ["exports"],
  function(__exports__) {
    "use strict";
    var config = {
      instrument: false
    };

    function configure(name, value) {
      if (arguments.length === 2) {
        config[name] = value;
      } else {
        return config[name];
      }
    }

    __exports__.config = config;
    __exports__.configure = configure;
  });
define("promise/polyfill",
  ["./promise","./utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var RSVPPromise = __dependency1__.Promise;
    var isFunction = __dependency2__.isFunction;

    function polyfill() {
      var es6PromiseSupport =
        "Promise" in window &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "cast" in window.Promise &&
        "resolve" in window.Promise &&
        "reject" in window.Promise &&
        "all" in window.Promise &&
        "race" in window.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new window.Promise(function(r) { resolve = r; });
          return isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        window.Promise = RSVPPromise;
      }
    }

    __exports__.polyfill = polyfill;
  });
define("promise/promise",
  ["./config","./utils","./cast","./all","./race","./resolve","./reject","./asap","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __exports__) {
    "use strict";
    var config = __dependency1__.config;
    var configure = __dependency1__.configure;
    var objectOrFunction = __dependency2__.objectOrFunction;
    var isFunction = __dependency2__.isFunction;
    var now = __dependency2__.now;
    var cast = __dependency3__.cast;
    var all = __dependency4__.all;
    var race = __dependency5__.race;
    var staticResolve = __dependency6__.resolve;
    var staticReject = __dependency7__.reject;
    var asap = __dependency8__.asap;

    var counter = 0;

    config.async = asap; // default async is asap;

    function Promise(resolver) {
      if (!isFunction(resolver)) {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
      }

      if (!(this instanceof Promise)) {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
      }

      this._subscribers = [];

      invokeResolver(resolver, this);
    }

    function invokeResolver(resolver, promise) {
      function resolvePromise(value) {
        resolve(promise, value);
      }

      function rejectPromise(reason) {
        reject(promise, reason);
      }

      try {
        resolver(resolvePromise, rejectPromise);
      } catch(e) {
        rejectPromise(e);
      }
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (handleThenable(promise, value)) {
        return;
      } else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        resolve(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
      }
    }

    var PENDING   = void 0;
    var SEALED    = 0;
    var FULFILLED = 1;
    var REJECTED  = 2;

    function subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      subscribers[length] = child;
      subscribers[length + FULFILLED] = onFulfillment;
      subscribers[length + REJECTED]  = onRejection;
    }

    function publish(promise, settled) {
      var child, callback, subscribers = promise._subscribers, detail = promise._detail;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        invokeCallback(settled, child, callback, detail);
      }

      promise._subscribers = null;
    }

    Promise.prototype = {
      constructor: Promise,

      _state: undefined,
      _detail: undefined,
      _subscribers: undefined,

      then: function(onFulfillment, onRejection) {
        var promise = this;

        var thenPromise = new this.constructor(function() {});

        if (this._state) {
          var callbacks = arguments;
          config.async(function invokePromiseCallback() {
            invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
          });
        } else {
          subscribe(this, thenPromise, onFulfillment, onRejection);
        }

        return thenPromise;
      },

      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };

    Promise.all = all;
    Promise.cast = cast;
    Promise.race = race;
    Promise.resolve = staticResolve;
    Promise.reject = staticReject;

    function handleThenable(promise, value) {
      var then = null,
      resolved;

      try {
        if (promise === value) {
          throw new TypeError("A promises callback cannot return that same promise.");
        }

        if (objectOrFunction(value)) {
          then = value.then;

          if (isFunction(then)) {
            then.call(value, function(val) {
              if (resolved) { return true; }
              resolved = true;

              if (value !== val) {
                resolve(promise, val);
              } else {
                fulfill(promise, val);
              }
            }, function(val) {
              if (resolved) { return true; }
              resolved = true;

              reject(promise, val);
            });

            return true;
          }
        }
      } catch (error) {
        if (resolved) { return true; }
        reject(promise, error);
        return true;
      }

      return false;
    }

    function resolve(promise, value) {
      if (promise === value) {
        fulfill(promise, value);
      } else if (!handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = value;

      config.async(publishFulfillment, promise);
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = reason;

      config.async(publishRejection, promise);
    }

    function publishFulfillment(promise) {
      publish(promise, promise._state = FULFILLED);
    }

    function publishRejection(promise) {
      publish(promise, promise._state = REJECTED);
    }

    __exports__.Promise = Promise;
  });
define("promise/race",
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */
    var isArray = __dependency1__.isArray;

    /**
      `RSVP.race` allows you to watch a series of promises and act as soon as the
      first promise given to the `promises` argument fulfills or rejects.

      Example:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 2");
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // result === "promise 2" because it was resolved before promise1
        // was resolved.
      });
      ```

      `RSVP.race` is deterministic in that only the state of the first completed
      promise matters. For example, even if other promises given to the `promises`
      array argument are resolved, but the first completed promise has become
      rejected before the other promises became fulfilled, the returned promise
      will become rejected:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error("promise 2"));
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // Code here never runs because there are rejected promises!
      }, function(reason){
        // reason.message === "promise2" because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      @method race
      @for RSVP
      @param {Array} promises array of promises to observe
      @param {String} label optional string for describing the promise returned.
      Useful for tooling.
      @return {Promise} a promise that becomes fulfilled with the value the first
      completed promises is resolved with if the first completed promise was
      fulfilled, or rejected with the reason that the first completed promise
      was rejected with.
    */
    function race(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to race.');
      }
      return new Promise(function(resolve, reject) {
        var results = [], promise;

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && typeof promise.then === 'function') {
            promise.then(resolve, reject);
          } else {
            resolve(promise);
          }
        }
      });
    }

    __exports__.race = race;
  });
define("promise/reject",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.reject` returns a promise that will become rejected with the passed
      `reason`. `RSVP.reject` is essentially shorthand for the following:

      ```javascript
      var promise = new RSVP.Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      var promise = RSVP.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @for RSVP
      @param {Any} reason value that the returned promise will be rejected with.
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become rejected with the given
      `reason`.
    */
    function reject(reason) {
      /*jshint validthis:true */
      var Promise = this;

      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    }

    __exports__.reject = reject;
  });
define("promise/resolve",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.resolve` returns a promise that will become fulfilled with the passed
      `value`. `RSVP.resolve` is essentially shorthand for the following:

      ```javascript
      var promise = new RSVP.Promise(function(resolve, reject){
        resolve(1);
      });

      promise.then(function(value){
        // value === 1
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      var promise = RSVP.resolve(1);

      promise.then(function(value){
        // value === 1
      });
      ```

      @method resolve
      @for RSVP
      @param {Any} value value that the returned promise will be resolved with
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    function resolve(value) {
      /*jshint validthis:true */
      var Promise = this;
      return new Promise(function(resolve, reject) {
        resolve(value);
      });
    }

    __exports__.resolve = resolve;
  });
define("promise/utils",
  ["exports"],
  function(__exports__) {
    "use strict";
    function objectOrFunction(x) {
      return isFunction(x) || (typeof x === "object" && x !== null);
    }

    function isFunction(x) {
      return typeof x === "function";
    }

    function isArray(x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    }

    // Date.now is not available in browsers < IE9
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
    var now = Date.now || function() { return new Date().getTime(); };


    __exports__.objectOrFunction = objectOrFunction;
    __exports__.isFunction = isFunction;
    __exports__.isArray = isArray;
    __exports__.now = now;
  });
requireModule('promise/polyfill').polyfill();
}());
/**
    A collection of data connections (stores) and their corresponding data models. This object provides a standard way to interact with client side data no matter the data format or storage mechanism used.
    @status Stable
    @class
    @augments AeroGear.Core
    @param {String|Array|Object} [config] - A configuration for the store(s) being created along with the DataManager. If an object or array containing objects is used, the objects can have the following properties:
    @param {String} config.name - the name that the store will later be referenced by
    @param {String} [config.type="Memory"] - the type of store as determined by the adapter used
    @param {String} [config.recordId="id"] - @deprecated the identifier used to denote the unique id for each record in the data associated with this store
    @param {Object} [config.settings={}] - the settings to be passed to the adapter. For specific settings, see the documentation for the adapter you are using.
    @param {Boolean} [config.settings.fallback=true] - falling back to a supported adapter is on by default, to opt-out, set this setting to false
    @param {Array} [config.settings.preferred] - a list of preferred adapters to try when falling back. Defaults to [ "IndexedDB", "WebSQL", "SessionLocal", "Memory" ]
    @returns {object} dataManager - The created DataManager containing any stores that may have been created
    @example
// Create an empty DataManager
var dm = AeroGear.DataManager();

// Create a single store using the default adapter
var dm2 = AeroGear.DataManager( "tasks" );

// Create multiple stores using the default adapter
var dm3 = AeroGear.DataManager( [ "tasks", "projects" ] );

// Create a custom store
var dm3 = AeroGear.DataManager({
    name: "mySessionStorage",
    type: "SessionLocal",
    id: "customID"
});

// Create multiple custom stores
var dm4 = AeroGear.DataManager([
    {
        name: "mySessionStorage",
        type: "SessionLocal",
        id: "customID"
    },
    {
        name: "mySessionStorage2",
        type: "SessionLocal",
        id: "otherId",
        settings: { ... }
    }
]);
 */
AeroGear.DataManager = function( config ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager ) ) {
        return new AeroGear.DataManager( config );
    }

    /**
        This function is used by the AeroGear.DataManager to add a new Object to its respective collection.
        @name AeroGear.add
        @method
        @param {String|Array|Object} config - This can be a variety of types specifying how to create the object. See the particular constructor for the object calling .add for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.add = function( config ){
        config = config || {};

        var i, type, fallback, preferred, settings;

        config = Array.isArray( config ) ? config : [ config ];

        config = config.map( function( value ) {
            settings = value.settings || {};
            fallback = settings.fallback === false ? false : true;
            if( fallback ) {
                preferred = settings.preferred ? settings.preferred : AeroGear.DataManager.preferred;
                if ( typeof value !== "string" ) {
                    type = value.type || "Memory";
                    if( !( type in AeroGear.DataManager.validAdapters ) ) {
                        for( i = 0; i < preferred.length; i++ ) {
                            if( preferred[ i ] in AeroGear.DataManager.validAdapters ) {
                                // For Deprecation purposes in 1.3.0  will be removed in 1.4.0
                                if( type === "IndexedDB" || type === "WebSQL" ) {
                                    value.settings = AeroGear.extend( value.settings || {}, { async: true } );
                                }
                                value.type = preferred[ i ];
                                return value;
                            }
                        }
                    }
                }
            }
            return value;
        }, this );

        AeroGear.Core.call( this );
        this.add( config );

        // Put back DataManager.add
        this.add = this._add;
    };

    // Save a reference to DataManager.add to put back later
    this._add = this.add;

    /**
        This function is used internally by datamanager to remove an Object from the respective collection.
        @name AeroGear.remove
        @method
        @param {String|String[]|Object[]|Object} config - This can be a variety of types specifying how to remove the object.
        @returns {Object} The object containing the collection that was updated
     */
    this.remove = function( config ){
        AeroGear.Core.call( this );
        this.remove( config );

        // Put back DataManager.remove
        this.remove = this._remove;
    };

    // Save a reference to DataManager.remove to put back later
    this._remove = this.remove;

    this.lib = "DataManager";

    this.type = config ? config.type || "Memory" : "Memory";

    /**
        The name used to reference the collection of data store instances created from the adapters
        @memberOf AeroGear.DataManager
        @type Object
        @default stores
     */
    this.collectionName = "stores";

    this.add( config );
};

AeroGear.DataManager.prototype = AeroGear.Core;
AeroGear.DataManager.constructor = AeroGear.DataManager;

/**
    Stores the valid adapters
*/
AeroGear.DataManager.validAdapters = {};

/**
    preferred adapters for the fallback strategy
*/
AeroGear.DataManager.preferred = [ "IndexedDB", "WebSQL", "SessionLocal", "Memory" ];

/**
    Method to determine and store what adapters are valid for this environment
*/
AeroGear.DataManager.validateAdapter = function( id, obj ) {
    if( obj.isValid() ) {
        AeroGear.DataManager.validAdapters[ id ] = obj;
    }
};

/**
    The adapters object is provided so that adapters can be added to the AeroGear.DataManager namespace dynamically and still be accessible to the add method
    @augments AeroGear.DataManager
 */
AeroGear.DataManager.adapters = {};

// Constants
AeroGear.DataManager.STATUS_NEW = 1;
AeroGear.DataManager.STATUS_MODIFIED = 2;
AeroGear.DataManager.STATUS_REMOVED = 0;

/**
    The Base adapter that all other adapters will extend from.
    Not to be Instantiated directly
 */
AeroGear.DataManager.adapters.base = function( storeName, settings ) {
    if ( this instanceof AeroGear.DataManager.adapters.base ) {
        throw "Invalid instantiation of base class AeroGear.DataManager.adapters.base";
    }

    settings = settings || {};

    // Private Instance vars
    var data = null,
        recordId = settings.recordId ? settings.recordId : "id",
        crypto = settings.crypto || {},
        cryptoOptions = crypto.options || {};

    // Privileged Methods
    /**
        Returns the value of the private data var
        @private
        @augments base
        @returns {Array}
     */
    this.getData = function() {
        return data || [];
    };

    /**
        Sets the value of the private data var
        @private
        @augments base
     */
    this.setData = function( newData ) {
        data = newData;
    };
    /**
        Returns the value of the private recordId var
        @private
        @augments base
        @returns {String}
     */
    this.getRecordId = function() {
        return recordId;
    };

    /**
        Encrypt data being saved or updated if applicable
        @private
        @augments base
     */
    this.encrypt = function( data ) {
        var content;

        if( crypto.agcrypto ) {
            cryptoOptions.data = sjcl.codec.utf8String.toBits( JSON.stringify( data ) );
            content = {
                id: data[ recordId ],
                data: crypto.agcrypto.encrypt( cryptoOptions )
            };
            window.localStorage.setItem( "ag-" + storeName + "-IV", JSON.stringify( { id: crypto.agcrypto.getIV() } ) );
            return content;
        }

        return data;
    };

    /**
        Decrypt data being read if applicable
        @private
        @augments base
     */
    this.decrypt = function( data, isSessionLocal ) {
        var content, IV;

        if( crypto.agcrypto ) {
            IV = JSON.parse( window.localStorage.getItem( "ag-" + storeName + "-IV" ) ) || {};
            cryptoOptions.IV = IV.id;
            data = Array.isArray( data ) ? data : [ data ];
            content = data.map( function( value ) {
                cryptoOptions.data = value.data;
                return JSON.parse( sjcl.codec.utf8String.fromBits( crypto.agcrypto.decrypt( cryptoOptions ) ) );
            });

            return isSessionLocal ? content[ 0 ] : content;
        }

        return data;
    };
};

/**
    The Memory adapter is the default type used when creating a new store. Data is simply stored in a data var and is lost on unload (close window, leave page, etc.)
    This constructor is instantiated when the "DataManager.add()" method is called
    @status Stable
    @constructs AeroGear.DataManager.adapters.Memory
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @returns {Object} The created store
    @example
// Create an empty DataManager
var dm = AeroGear.DataManager();

// Add a custom memory store
dm.add({
    name: "newStore",
    settings: {
        recordId: "customID"
    }
});
 */
AeroGear.DataManager.adapters.Memory = function( storeName, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.Memory ) ) {
        return new AeroGear.DataManager.adapters.Memory( storeName, settings );
    }

    AeroGear.DataManager.adapters.base.apply( this, arguments );
    /**
        Empties the value of the private data var
        @private
        @augments Memory
     */
    this.emptyData = function() {
        this.setData( null );
    };

    /**
        Adds a record to the store's data set
        @private
        @augments Memory
     */
    this.addDataRecord = function( record ) {
        this.getData().push( record );
    };

    /**
        Adds a record to the store's data set
        @private
        @augments Memory
     */
    this.updateDataRecord = function( index, record ) {
        this.getData()[ index ] = record;
    };

    /**
        Removes a single record from the store's data set
        @private
        @augments Memory
     */
    this.removeDataRecord = function( index ) {
        this.getData().splice( index, 1 );
    };

    /**
        Returns a Promise that immediately resolves for api symmetry
        @private
        @augments base
     */
    this.open = function() {
        return Promise.resolve();
    };

    /**
        This method is just for sake of API symmetry with other DataManagers. It immediately returns.
        @private
        @augments base
    */
    this.close = function() {
    };

    /**
        Little utility used to compare nested object values in the filter method
        @private
        @augments Memory
        @param {String} nestedKey - Filter key to test
        @param {Object} nestedFilter - Filter object to test
        @param {Object} nestedValue - Value object to test
        @returns {Boolean}
     */
    this.traverseObjects = function( nestedKey, nestedFilter, nestedValue ) {
        while ( typeof nestedFilter === "object" ) {
            if ( nestedValue ) {
                // Value contains this key so continue checking down the object tree
                nestedKey = Object.keys( nestedFilter )[ 0 ];
                nestedFilter = nestedFilter[ nestedKey ];
                nestedValue = nestedValue[ nestedKey ];
            } else {
                break;
            }
        }
        if ( nestedFilter === nestedValue ) {
            return true;
        } else {
            return false;
        }
    };
};

// Public Methods
/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.Memory.isValid = function() {
    return true;
};

/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @returns {Object} A Promise
    @example
    var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

    // Get an array of all data in the store
    dm.read()
        .then( function( data ) {
            console.log( data );
        });

    // Read a specific piece of data based on an id
    dm.read( 12345 )
        .then( function( data ) {
            console.log( data );
        });
 */
AeroGear.DataManager.adapters.Memory.prototype.read = function( id ) {
    var filter = {};

    filter[ this.getRecordId() ] = id;
    if( id ) {
        return this
            .filter( filter )
            .then(function( filtered ) {
                return filtered;
            });
    } else {
        return Promise.resolve( this.getData() );
    }
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @returns {Object} A Promise
    @example
    var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

    dm.open()
        .then( function() {

            // save one record
            dm.save({
                    title: "Created Task",
                    date: "2012-07-13",
                    ...
                })
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );

            // save multiple records
            dm.save([
                    {
                        title: "Task2",
                        date: "2012-07-13"
                    },
                    {
                        title: "Task3",
                        date: "2012-07-13"
                        ...
                    }
                ])
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );

            // Update an existing piece of data
            var toUpdate = dm.read()[ 0 ];
            toUpdate.data.title = "Updated Task";
            dm.save( toUpdate )
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );
        });
 */
AeroGear.DataManager.adapters.Memory.prototype.save = function( data, options ) {
    var itemFound = false;

    data = Array.isArray( data ) ? data : [ data ];

    if ( options && options.reset ) {
        this.setData( data );
    } else {
        if ( this.getData() && this.getData().length !== 0 ) {
            for ( var i = 0; i < data.length; i++ ) {
                for( var item in this.getData() ) {
                    if ( this.getData()[ item ][ this.getRecordId() ] === data[ i ][ this.getRecordId() ] ) {
                        this.updateDataRecord( item, data[ i ] );
                        itemFound = true;
                        break;
                    }
                }
                if ( !itemFound ) {
                    this.addDataRecord( data[ i ] );
                }

                itemFound = false;
            }
        } else {
            this.setData( data );
        }
    }
    return Promise.resolve( this.getData() );
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @returns {Object} A Promise
    @example
    var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

    dm.open()
        .then( function() {

            // Delete a record
            dm.remove( 1, )
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );

            // Remove all data
            dm.remove( undefined )
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );

            // Delete all remaining data from the store
            dm.remove()
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );
        });
 */
AeroGear.DataManager.adapters.Memory.prototype.remove = function( toRemove ) {
    var delId, data, item;

    if ( !toRemove ) {
        // empty data array and return
        this.emptyData();
        return Promise.resolve( this.getData() );
    } else {
        toRemove = Array.isArray( toRemove ) ? toRemove : [ toRemove ];
    }

    for ( var i = 0; i < toRemove.length; i++ ) {
        if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
            delId = toRemove[ i ];
        } else if ( toRemove ) {
            delId = toRemove[ i ][ this.getRecordId() ];
        } else {
            // Missing record id so just skip this item in the arrray
            continue;
        }

        data = this.getData( true );
        for( item in data ) {
            if ( data[ item ][ this.getRecordId() ] === delId ) {
                this.removeDataRecord( item );
            }
        }
    }

    return Promise.resolve( this.getData() );
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key/value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @return {Object} A Promise
    @example
    var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

    / Create an empty DataManager
    var dm = AeroGear.DataManager();

    dm.open()
        .then( function() {

            // An object can be passed to filter the data
            // This would return all records with a user named 'admin' **AND** a date of '2012-08-01'
            dm.filter( {
                    date: "2012-08-01",
                    user: "admin"
                } )
                .then( function( filteredData ) { ... } )
                .catch( function( error ) { ... } );

            // The matchAny parameter changes the search to an OR operation
            // This would return all records with a user named 'admin' **OR** a date of '2012-08-01'
            dm.filter( {
                    date: "2012-08-01",
                    user: "admin"
                }, true )
                .then( function( filteredData ) { ... } )
                .catch( function( error ) { ... } );
        });
 */
AeroGear.DataManager.adapters.Memory.prototype.filter = function( filterParameters, matchAny ) {
    var filtered, key, j, k,
        that = this;

    if ( !filterParameters ) {
        filtered = this.getData() || [];
        return Promise.resolve( filtered );
    }

    filtered = this.getData().filter( function( value ) {
        var match = matchAny ? false : true,
            keys = Object.keys( filterParameters ),
            filterObj, paramResult;

        for ( key = 0; key < keys.length; key++ ) {
            if ( filterParameters[ keys[ key ] ].data ) {
                // Parameter value is an object
                filterObj = filterParameters[ keys[ key ] ];
                paramResult = filterObj.matchAny ? false : true;

                for ( j = 0; j < filterObj.data.length; j++ ) {
                    if( Array.isArray( value[ keys[ key ] ] ) ) {
                        if( value[ keys [ key ] ].length ) {
                              if ( matchAny || filterObj.matchAny ) {
                                  for( k = 0; k < value[ keys[ key ] ].length; k++ ) {
                                      if ( filterObj.data[ j ] === value[ keys[ key ] ][ k ] ) {
                                          paramResult = true;
                                          break;
                                      }
                                  }
                              } else {
                                  if ( value[ keys[ key ] ].length !== filterObj.data.length ) {
                                      paramResult = false;
                                  } else {
                                      for( k = 0; k < value[ keys[ key ] ].length; k++ ) {
                                          if ( filterObj.data[ k ] !== value[ keys[ key ] ][ k ] ) {
                                              paramResult = false;
                                              break;
                                          }
                                      }
                                  }
                              }
                        } else {
                            paramResult = false;
                        }
                    } else {
                        if ( typeof filterObj.data[ j ] === "object" ) {
                            if ( filterObj.matchAny && that.traverseObjects( keys[ key ], filterObj.data[ j ], value[ keys[ key ] ] ) ) {
                                // At least one value must match and this one does so return true
                                paramResult = true;
                                break;
                            }
                            if ( !filterObj.matchAny && !that.traverseObjects( keys[ key ], filterObj.data[ j ], value[ keys[ key ] ] ) ) {
                                // All must match but this one doesn't so return false
                                paramResult = false;
                                break;
                            }
                        } else {
                            if ( filterObj.matchAny && filterObj.data[ j ] === value[ keys[ key ] ] ) {
                                // At least one value must match and this one does so return true
                                paramResult = true;
                                break;
                            }
                            if ( !filterObj.matchAny && filterObj.data[ j ] !== value[ keys[ key ] ] ) {
                                // All must match but this one doesn't so return false
                                paramResult = false;
                                break;
                            }
                        }
                    }
                }
            } else {
                // Filter on parameter value
                if( Array.isArray( value[ keys[ key ] ] ) ) {
                    paramResult = matchAny ? false: true;

                    if( value[ keys[ key ] ].length ) {
                        for(j = 0; j < value[ keys[ key ] ].length; j++ ) {
                            if( matchAny && filterParameters[ keys[ key ] ] === value[ keys[ key ] ][ j ]  ) {
                                // at least one must match and this one does so return true
                                paramResult = true;
                                break;
                            }
                            if( !matchAny && filterParameters[ keys[ key ] ] !== value[ keys[ key ] ][ j ] ) {
                                // All must match but this one doesn't so return false
                                paramResult = false;
                                break;
                            }
                        }
                    } else {
                        paramResult = false;
                    }
                } else {
                    if ( typeof filterParameters[ keys[ key ] ] === "object" ) {
                        paramResult = that.traverseObjects( keys[ key ], filterParameters[ keys[ key ] ], value[ keys[ key ] ] );
                    } else {
                        paramResult = filterParameters[ keys[ key ] ] === value[ keys[ key ] ] ? true : false;
                    }
                }
            }

            if ( matchAny && paramResult ) {
                // At least one item must match and this one does so return true
                match = true;
                break;
            }
            if ( !matchAny && !paramResult ) {
                // All must match but this one doesn't so return false
                match = false;
                break;
            }
        }

        return match;
    });
    return Promise.resolve( filtered );
};

/**
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "Memory", AeroGear.DataManager.adapters.Memory );

/**
    The SessionLocal adapter extends the Memory adapter to store data in either session or local storage which makes it a little more persistent than memory
    This constructor is instantiated when the "DataManager.add()" method is called
    @status Stable
    @constructs AeroGear.DataManager.adapters.SessionLocal
    @mixes AeroGear.DataManager.adapters.Memory
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @param {String} [settings.storageType="sessionStorage"] - the type of store can either be sessionStorage or localStorage
    @param {Object} [settings.crypto] - the crypto settings to be passed to the adapter
    @param {Object} [settings.crypto.agcrypto] - the AeroGear.Crypto object to be used
    @param {Object} [settings.crypto.options] - the specific options for the AeroGear.Crypto encrypt/decrypt methods
    @returns {Object} The created store
    @example
// Create an empty DataManager
var dm = AeroGear.DataManager();

// Add a custom SessionLocal store using local storage as its storage type
dm.add({
    name: "newStore",
    type: "SessionLocal"
    settings: {
        recordId: "customID",
        storageType: "localStorage"
    }
});
 */
AeroGear.DataManager.adapters.SessionLocal = function( storeName, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.SessionLocal ) ) {
        return new AeroGear.DataManager.adapters.SessionLocal( storeName, settings );
    }

    AeroGear.DataManager.adapters.Memory.apply( this, arguments );

    // Private Instance vars
    var storeType = settings.storageType || "sessionStorage",
        name = storeName,
        appContext = document.location.pathname.replace(/[\/\.]/g,"-"),
        storeKey = name + appContext,
        content = window[ storeType ].getItem( storeKey ),
        currentData = content ? this.decrypt( JSON.parse( content ), true ) : null ;

    // Initialize data from the persistent store if it exists
    if ( currentData ) {
        AeroGear.DataManager.adapters.Memory.prototype.save.call( this, currentData, true );
    }

    // Privileged Methods
    /**
        Returns the value of the private storeType var
        @private
        @augments SessionLocal
        @returns {String}
     */
    this.getStoreType = function() {
        return storeType;
    };

    /**
        Returns the value of the private storeKey var
        @private
        @augments SessionLocal
        @returns {String}
     */
    this.getStoreKey = function() {
        return storeKey;
    };
};

/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.SessionLocal.isValid = function() {
    try {
        return !!(window.localStorage && window.sessionStorage);
    } catch( error ){
        return false;
    }
};

// Inherit from the Memory adapter
AeroGear.DataManager.adapters.SessionLocal.prototype = Object.create( new AeroGear.DataManager.adapters.Memory(), {
    // Public Methods
    /**
        Saves data to the store, optionally clearing and resetting the data
        @method
        @memberof AeroGear.DataManager.adapters.SessionLocal
        @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
        @param {Object} [options] - The options to be passed to the save method
        @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
        @returns {Object} A Promise
        @example
        var dm = AeroGear.DataManager([{ name: "tasks", type: "SessionLocal" }]).stores[ 0 ];

        dm.open()
            .then( function() {

                // save one record
                dm.save({
                        title: "Created Task",
                        date: "2012-07-13",
                        ...
                    })
                    .then( function( newData ) { ... } )
                    .catch( function( error ) { ... } );

                // save multiple records
                dm.save([
                        {
                            title: "Task2",
                            date: "2012-07-13"
                        },
                        {
                            title: "Task3",
                            date: "2012-07-13"
                            ...
                        }
                    ])
                    .then( function( newData ) { ... } )
                    .catch( function( error ) { ... } );

                // Update an existing piece of data
                var toUpdate = dm.read()[ 0 ];
                toUpdate.data.title = "Updated Task";
                dm.save( toUpdate )
                    .then( function( newData ) { ... } )
                    .catch( function( error ) { ... } );
            });
     */
    save: {
        value: function( data, options ) {
            // Call the super method
            var that = this,
                reset = options && options.reset ? options.reset : false,
                oldData = window[ this.getStoreType() ].getItem( this.getStoreKey() );

            return AeroGear.DataManager.adapters.Memory.prototype.save.apply( this, [ arguments[ 0 ], { reset: reset } ] )
                .then( function( newData ) {
                    // Sync changes to persistent store
                    try {
                        window[ that.getStoreType() ].setItem( that.getStoreKey(), JSON.stringify( that.encrypt( newData ) ) );
                    } catch( error ) {
                        oldData = oldData ? JSON.parse( oldData ) : [];

                        return AeroGear.DataManager.adapters.Memory.prototype.save.apply( that, [ oldData, { reset: reset } ] )
                            .then( function() {
                                return Promise.reject();
                            });
                    }
                    return newData;
                });
        }, enumerable: true, configurable: true, writable: true
    },
    /**
        Removes data from the store
        @method
        @memberof AeroGear.DataManager.adapters.SessionLocal
        @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
        @returns {Object} A Promise
        @example
        var dm = AeroGear.DataManager([{ name: "tasks", type: "SessionLocal" }]).stores[ 0 ];

        dm.open()
            .then( function() {

                // Delete a record
                dm.remove( 1, )
                    .then( function( newData ) { ... } )
                    .catch( function( error ) { ... } );

                // Remove all data
                dm.remove( undefined )
                    .then( function( newData ) { ... } )
                    .catch( function( error ) { ... } );

                // Delete all remaining data from the store
                dm.remove()
                    .then( function( newData ) { ... } )
                    .catch( function( error ) { ... } );
            });
     */
    remove: {
        value: function( toRemove ) {
            var that = this;

            return AeroGear.DataManager.adapters.Memory.prototype.remove.apply( this, arguments )
                .then( function( newData ) {
                    // Sync changes to persistent store
                    window[ that.getStoreType() ].setItem( that.getStoreKey(), JSON.stringify( that.encrypt( newData ) ) );
                });
        }, enumerable: true, configurable: true, writable: true
    }
});

/**
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "SessionLocal", AeroGear.DataManager.adapters.SessionLocal );

/**
    The IndexedDB adapter stores data in an IndexedDB database for more persistent client side storage
    This constructor is instantiated when the "DataManager.add()" method is called
    @constructs AeroGear.DataManager.adapters.IndexedDB
    @status Experimental
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @param {Boolean} [settings.auto=true] - set to 'false' to disable 'auto-connect' for read/remove/save/filter
    @param {Object} [settings.crypto] - the crypto settings to be passed to the adapter
    @param {Object} [settings.crypto.agcrypto] - the AeroGear.Crypto object to be used
    @param {Object} [settings.crypto.options] - the specific options for the AeroGear.Crypto encrypt/decrypt methods
    @returns {Object} The created store
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

 */
AeroGear.DataManager.adapters.IndexedDB = function( storeName, settings ) {

    if ( !window.indexedDB ) {
        throw "Your browser doesn't support IndexedDB";
    }

    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.IndexedDB ) ) {
        return new AeroGear.DataManager.adapters.IndexedDB( storeName, settings );
    }

    AeroGear.DataManager.adapters.base.apply( this, arguments );

    settings = settings || {};

    // Private Instance vars
    var database,
        auto = ( settings.auto === undefined || settings.auto ) ? true : false;

    // Privileged Methods
    /**
        Returns the value of the private database var
        @private
        @augments IndexedDB
        @returns {Object}
     */
    this.getDatabase = function() {
        return database;
    };

    /**
        Sets the value of the private database var
        @private
        @augments IndexedDB
     */
    this.setDatabase = function( db ) {
        database = db;
    };

    /**
        Returns the value of the private storeName var
        @private
        @augments IndexedDB
        @returns {String}
     */
    this.getStoreName = function() {
        return storeName;
    };

    /**
        @private
        @augments IndexedDB
        Compatibility fix
        Added in 1.3 to remove in 1.4
    */
    this.getAsync = function() {
        return true;
    };

    /**
        This function will check if the database is open.
        If 'auto' is not true, an error is thrown.
        If 'auto' is true, attempt to open the database then
        run the function passed in
        @private
        @augments IndexedDB
     */
    this.run = function( fn ) {
        var that = this;

        if( !database ) {
            if( !auto ) {
                // hasn't been opened yet
                throw "Database not opened";
            } else {
                this.open()
                    .then( function( value, status ) {
                        if( status === "error" ) {
                            throw "Database not opened";
                        } else {
                            fn.call( that, database );
                        }
                    });
            }
        } else {
            fn.call( this, database );
        }
    };
};

// Public Methods
/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.IndexedDB.isValid = function() {
    return !!window.indexedDB;
};

/**
    Open the Database
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open()
        .then(function() { ... })
        .catch(function(error) { ... });
*/
AeroGear.DataManager.adapters.IndexedDB.prototype.open = function() {

    var request, database,
        that = this,
        storeName = this.getStoreName(),
        recordId = this.getRecordId();

    return new Promise( function( resolve, reject ) {
        // Attempt to open the indexedDB database
        request = window.indexedDB.open( storeName );

        request.onsuccess = function( event ) {
            database = event.target.result;
            that.setDatabase( database );
            resolve( database );
        };

        request.onerror = function( event ) {
            reject( event );
        };

        // Only called when the database doesn't exist and needs to be created
        request.onupgradeneeded = function( event ) {
            database = event.target.result;
            database.createObjectStore( storeName, { keyPath: recordId } );
        };
    });
};


/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open()
        .then( function() {

            // read all records
            dm.stores.test1.read( undefined )
                .then( function( data ) { ... } )
                .catch( function( error ) { ... } );

            // read a record with a particular id
            dm.stores.test1.read( 5 )
                .then( function( data ) { ... } )
                .catch( function( error ) { ... } );
        });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.read = function( id ) {

    var transaction, objectStore, cursor, request,
        that = this,
        data = [],
        storeName = this.getStoreName();

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function( database ) {

            if( !database.objectStoreNames.contains( storeName ) ) {
                return resolve( [] );
            }

            transaction = database.transaction( storeName );
            objectStore = transaction.objectStore( storeName );

            if( id ) {
                request = objectStore.get( id );

                request.onsuccess = function() {
                    data.push( request.result );
                };

            } else {
                cursor = objectStore.openCursor();
                cursor.onsuccess = function( event ) {
                    var result = event.target.result;
                    if( result ) {
                        data.push( result.value );
                        result.continue();
                    }
                };
            }

            transaction.oncomplete = function() {
                resolve( that.decrypt( data ));
            };

            transaction.onerror = function( event ) {
                reject( event );
            };
        });
    });
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - additional options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open()
        .then( function() {

            // save one record
            dm.stores.newStore.save( { "id": 3, "name": "Grace", "type": "Little Person" })
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );

            // save multiple Records
            dm.stores.newStore.save([
                    { "id": 3, "name": "Grace", "type": "Little Person" },
                    { "id": 4, "name": "Graeham", "type": "Really Little Person" }
                ])
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );
        });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.save = function( data, options ) {
    options = options || {};

    var transaction, objectStore,
        that = this,
        storeName = this.getStoreName(),
        i = 0;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function( database ) {
            transaction = database.transaction( storeName, "readwrite" );
            objectStore = transaction.objectStore( storeName );

            if( options.reset ) {
                objectStore.clear();
            }

            if( Array.isArray( data ) ) {
                for( i; i < data.length; i++ ) {
                    objectStore.put( this.encrypt( data[ i ] ) );
                }
            } else {
                objectStore.put( this.encrypt( data ) );
            }

            transaction.oncomplete = function() {
                that.read()
                    .then( function( newData ) {
                        resolve( newData );
                    })
                    .catch( function() {
                        reject( data, status );
                    });
            };

            transaction.onerror = function( event ) {
                reject( event );
            };
        });
    });
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open()
        .then( function() {

        // remove one record
        dm.stores.newStore.remove( 1 )
            .then( function( newData ) { ... } )
            .catch( function( error ) { ... } );

        // save multiple Records
        dm.stores.newStore.remove( undefined )
            .then( function( newData ) { ... } )
            .catch( function( error ) { ... } );
      });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.remove = function( toRemove ) {

    var objectStore, transaction,
        that = this,
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        i = 0;

    return new Promise( function( resolve, reject) {
        that.run.call( that, function() {
            transaction = database.transaction( storeName, "readwrite" );
            objectStore = transaction.objectStore( storeName );

            if( !toRemove ) {
               objectStore.clear();
            } else  {
               toRemove = Array.isArray( toRemove ) ? toRemove: [ toRemove ];

               for( i; i < toRemove.length; i++ ) {
                   if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
                       objectStore.delete( toRemove[ i ] );
                   } else if ( toRemove ) {
                       objectStore.delete( toRemove[ i ][ this.getRecordId() ] );
                   } else {
                       continue;
                   }
               }
            }

            transaction.oncomplete = function() {
                that.read()
                    .then( function( newData ) {
                        resolve( newData );
                    })
                    .catch( function( error ) {
                        reject( error );
                    });
            };

            transaction.onerror = function( event ) {
               reject( event );
            };
        });
    });
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key/value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open()
        .then( function() {

        dm.stores.test1.filter( { "name": "Lucas" }, true )
            .then( function( filteredData ) { ... } )
            .catch( function( error ) { ... } );
    });

 */
AeroGear.DataManager.adapters.IndexedDB.prototype.filter = function( filterParameters, matchAny ) {

    var that = this;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function() {
            this.read()
                .then( function( data ) {
                    AeroGear.DataManager.adapters.Memory.prototype.save.call( that, data, true );
                    AeroGear.DataManager.adapters.Memory.prototype.filter.call( that, filterParameters, matchAny ).then( function( filteredData ) {
                        resolve( filteredData );
                    });
                })
                .catch( function( error ) {
                    reject( error );
                });
        });
    });
};

/**
    Close the current store
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store and then delete a record
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.close();
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.close = function() {
    var database = this.getDatabase();
    if( database ) {
        database.close();
    }
};

/**
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "IndexedDB", AeroGear.DataManager.adapters.IndexedDB );

/**
    The WebSQL adapter stores data in a WebSQL database for more persistent client side storage
    This constructor is instantiated when the "DataManager.add()" method is called
    @constructs AeroGear.DataManager.adapters.WebSQL
    @status Experimental
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @param {Boolean} [settings.auto=true] - set to 'false' to disable 'auto-connect' for read/remove/save/filter
    @param {Object} [settings.crypto] - the crypto settings to be passed to the adapter
    @param {Object} [settings.crypto.agcrypto] - the AeroGear.Crypto object to be used
    @param {Object} [settings.crypto.options] - the specific options for the AeroGear.Crypto encrypt/decrypt methods
    @returns {Object} The created store
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

 */
AeroGear.DataManager.adapters.WebSQL = function( storeName, settings ) {

    if ( !window.openDatabase ) {
        throw "Your browser doesn't support WebSQL";
    }

    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.WebSQL ) ) {
        return new AeroGear.DataManager.adapters.WebSQL( storeName, settings );
    }

    AeroGear.DataManager.adapters.base.apply( this, arguments );

    settings = settings || {};

    // Private Instance vars
    var database,
        auto = ( settings.auto === undefined || settings.auto ) ? true : false;

    // Privileged Methods
    /**
        Returns the value of the private database var
        @private
        @augments WebSQL
        @returns {Object}
     */
    this.getDatabase = function() {
        return database;
    };

    /**
        Sets the value of the private database var
        @private
        @augments WebSQL
     */
    this.setDatabase = function( db ) {
        database = db;
    };

    /**
        Returns the value of the private storeName var
        @private
        @augments WebSQL
        @returns {String}
     */
    this.getStoreName = function() {
        return storeName;
    };

    /**
        @private
        @augments WebSQL
        Compatibility fix
        Added in 1.3 to remove in 1.4
    */
    this.getAsync = function() {
        return true;
    };

    /**
        This function will check if the database is open.
        If 'auto' is not true, an error is thrown.
        If 'auto' is true, attempt to open the databse then
        run the function passed in
        @private
        @augments WebSQL
     */
    this.run = function( callback ) {
        var that = this;

        if( !database ) {
            if( !auto ) {
                // hasn't been opened yet
                throw "Database not opened";
            } else {
                this.open()
                    .then( function() {
                        callback.call( that, database );
                    })
                    .catch( function() {
                        throw "Database not opened";
                    });
            }
        } else {
            callback.call( this, database );
        }
    };
};

// Public Methods
/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.WebSQL.isValid = function() {
    return !!window.openDatabase;
};

/**
    Open the Database
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open()
        .then(function() { ... })
        .catch(function(error) { ... });
*/
AeroGear.DataManager.adapters.WebSQL.prototype.open = function() {

    var database,
        that = this,
        version = "1",
        databaseSize = 2 * 1024 * 1024,
        recordId = this.getRecordId(),
        storeName = this.getStoreName(),
        success, error;

    // Do some creation and such
    database = window.openDatabase( storeName, version, "AeroGear WebSQL Store", databaseSize );

    return new Promise( function( resolve, reject ) {
        error = function( transaction, error ) {
            reject( error );
        };

        success = function() {
            that.setDatabase( database );
            resolve( database );
        };

        database.transaction( function( transaction ) {
            transaction.executeSql( "CREATE TABLE IF NOT EXISTS '" + storeName + "' ( " + recordId + " REAL UNIQUE, json)", [], success, error );
        });
    });
};

/**
 This method is just for sake of API symmetry with other DataManagers. It immediately returns.
 @private
 @augments base
 */
AeroGear.DataManager.adapters.WebSQL.prototype.close = function() {
};

/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open()
        .then( function() {

        // read all records
        dm.stores.test1.read( undefined )
            .then( function( data ) { ... } )
            .catch( function( error ) { ... } );

        // read a record with a particular id
        dm.stores.test1.read( 5 )
            .then( function( data ) { ... } )
            .catch( function( error ) { ... } );
    });

 */
AeroGear.DataManager.adapters.WebSQL.prototype.read = function( id ) {

    var that = this,
        data = [],
        params = [],
        storeName = this.getStoreName(),
        database = this.getDatabase(),
        sql, success, error,
        i = 0;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function() {

            error = function( transaction, error ) {
                reject( error );
            };

            success = function( transaction, result ) {
                var rowLength = result.rows.length;
                for( i; i < rowLength; i++ ) {
                    data.push( JSON.parse( result.rows.item( i ).json ) );
                }
                resolve( that.decrypt( data ) );
            };

            sql = "SELECT * FROM '" + storeName + "'";

            if( id ) {
                sql += " WHERE ID = ?";
                params = [ id ];
            }

            database.transaction( function( transaction ) {
                transaction.executeSql( sql, params, success, error );
            });
        });
    });
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - additional options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open()
    .then( function() {

        // save one record
        dm.stores.newStore.save( { "id": 3, "name": "Grace", "type": "Little Person" })
            .then( function( newData ) { ... } )
            .catch( function( error ) { ... } );

        // save multiple Records
        dm.stores.newStore.save([
                { "id": 3, "name": "Grace", "type": "Little Person" },
                { "id": 4, "name": "Graeham", "type": "Really Little Person" }
            ])
            .then( function( newData ) { ... } )
            .catch( function( error ) { ... } );
    });
 */
AeroGear.DataManager.adapters.WebSQL.prototype.save = function( data, options ) {
    options = options || {};

    var that = this,
        recordId = this.getRecordId(),
        storeName = this.getStoreName(),
        error, success;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function( database ) {

            error = function( transaction, error ) {
                reject( error );
            };

            success = function() {
                that.read()
                    .then( function( newData ) {
                        resolve( newData );
                    })
                    .catch( function( error ) {
                        reject( error );
                    });
            };

            data = Array.isArray( data ) ? data : [ data ];

            database.transaction( function( transaction ) {
                if( options.reset ) {
                    transaction.executeSql( "DROP TABLE " + storeName );
                    transaction.executeSql( "CREATE TABLE IF NOT EXISTS '" + storeName + "' ( " + recordId + " REAL UNIQUE, json)" );
                }
                data.forEach( function( value ) {
                    value = that.encrypt( value );
                    transaction.executeSql( "INSERT OR REPLACE INTO '" + storeName + "' ( id, json ) VALUES ( ?, ? ) ", [ value[ recordId ], JSON.stringify( value ) ] );
                });
            }, error, success );
        });
    });
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open()
        .then( function() {

            // remove one record
            dm.stores.newStore.remove( 1 )
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );

            // save multiple Records
            dm.stores.newStore.remove( undefined )
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );
        });

 */
AeroGear.DataManager.adapters.WebSQL.prototype.remove = function( toRemove ) {

    var that = this,
        storeName = this.getStoreName(),
        sql, success, error,
        i = 0;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function( database ) {

            error = function( transaction, error ) {
                reject( error );
            };

            success = function() {
                that.read()
                    .then( function( newData ) {
                        resolve( newData );
                    })
                    .catch( function( error ) {
                        reject( error );
                    });
            };

            sql = "DELETE FROM '" + storeName + "'";

            if( !toRemove ) {
                // remove all
                database.transaction( function( transaction ) {
                    transaction.executeSql( sql, [], success, error );
                });
            } else {
                toRemove = Array.isArray( toRemove ) ? toRemove: [ toRemove ];
                database.transaction( function( transaction ) {
                    for( i; i < toRemove.length; i++ ) {
                        if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
                            transaction.executeSql( sql + " WHERE ID = ? ", [ toRemove[ i ] ] );
                        } else if ( toRemove ) {
                            transaction.executeSql( sql + " WHERE ID = ? ", [ toRemove[ i ][ this.getRecordId() ] ] );
                        } else {
                            continue;
                        }
                    }
                }, error, success );
            }
        });
    });
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key/value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open()
        .then( function() {

        dm.stores.test1.filter( { "name": "Lucas" }, true )
            .then( function( filteredData ) { ... } )
            .catch( function( error ) { ... } );
    });
 */
AeroGear.DataManager.adapters.WebSQL.prototype.filter = function( filterParameters, matchAny ) {

    var that = this;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function() {
            this.read()
                .then( function( data ) {
                    AeroGear.DataManager.adapters.Memory.prototype.save.call( that, data, true );
                    AeroGear.DataManager.adapters.Memory.prototype.filter.call( that, filterParameters, matchAny ).then( function( filteredData ) {
                        resolve( filteredData );
                    });
                })
                .catch( function( error ) {
                    reject( error );
                });
        });
    });
};

/**
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "WebSQL", AeroGear.DataManager.adapters.WebSQL );
})( this );
