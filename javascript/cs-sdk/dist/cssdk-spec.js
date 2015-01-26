(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\node_modules\\es6-promise\\dist\\es6-promise.js":[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.0.1
 */

(function() {
    "use strict";

    function $$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function $$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function $$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var $$utils$$_isArray;

    if (!Array.isArray) {
      $$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      $$utils$$_isArray = Array.isArray;
    }

    var $$utils$$isArray = $$utils$$_isArray;
    var $$utils$$now = Date.now || function() { return new Date().getTime(); };
    function $$utils$$F() { }

    var $$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      $$utils$$F.prototype = o;
      return new $$utils$$F();
    });

    var $$asap$$len = 0;

    var $$asap$$default = function asap(callback, arg) {
      $$asap$$queue[$$asap$$len] = callback;
      $$asap$$queue[$$asap$$len + 1] = arg;
      $$asap$$len += 2;
      if ($$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        $$asap$$scheduleFlush();
      }
    };

    var $$asap$$browserGlobal = (typeof window !== 'undefined') ? window : {};
    var $$asap$$BrowserMutationObserver = $$asap$$browserGlobal.MutationObserver || $$asap$$browserGlobal.WebKitMutationObserver;

    // test for web worker but not in IE10
    var $$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function $$asap$$useNextTick() {
      return function() {
        process.nextTick($$asap$$flush);
      };
    }

    function $$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new $$asap$$BrowserMutationObserver($$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function $$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = $$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function $$asap$$useSetTimeout() {
      return function() {
        setTimeout($$asap$$flush, 1);
      };
    }

    var $$asap$$queue = new Array(1000);

    function $$asap$$flush() {
      for (var i = 0; i < $$asap$$len; i+=2) {
        var callback = $$asap$$queue[i];
        var arg = $$asap$$queue[i+1];

        callback(arg);

        $$asap$$queue[i] = undefined;
        $$asap$$queue[i+1] = undefined;
      }

      $$asap$$len = 0;
    }

    var $$asap$$scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      $$asap$$scheduleFlush = $$asap$$useNextTick();
    } else if ($$asap$$BrowserMutationObserver) {
      $$asap$$scheduleFlush = $$asap$$useMutationObserver();
    } else if ($$asap$$isWorker) {
      $$asap$$scheduleFlush = $$asap$$useMessageChannel();
    } else {
      $$asap$$scheduleFlush = $$asap$$useSetTimeout();
    }

    function $$$internal$$noop() {}
    var $$$internal$$PENDING   = void 0;
    var $$$internal$$FULFILLED = 1;
    var $$$internal$$REJECTED  = 2;
    var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function $$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.')
    }

    function $$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        $$$internal$$GET_THEN_ERROR.error = error;
        return $$$internal$$GET_THEN_ERROR;
      }
    }

    function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function $$$internal$$handleForeignThenable(promise, thenable, then) {
       $$asap$$default(function(promise) {
        var sealed = false;
        var error = $$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          $$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          $$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function $$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, thenable._result);
      } else if (promise._state === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, thenable._result);
      } else {
        $$$internal$$subscribe(thenable, undefined, function(value) {
          $$$internal$$resolve(promise, value);
        }, function(reason) {
          $$$internal$$reject(promise, reason);
        });
      }
    }

    function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        $$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = $$$internal$$getThen(maybeThenable);

        if (then === $$$internal$$GET_THEN_ERROR) {
          $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          $$$internal$$fulfill(promise, maybeThenable);
        } else if ($$utils$$isFunction(then)) {
          $$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          $$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function $$$internal$$resolve(promise, value) {
      if (promise === value) {
        $$$internal$$reject(promise, $$$internal$$selfFullfillment());
      } else if ($$utils$$objectOrFunction(value)) {
        $$$internal$$handleMaybeThenable(promise, value);
      } else {
        $$$internal$$fulfill(promise, value);
      }
    }

    function $$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      $$$internal$$publish(promise);
    }

    function $$$internal$$fulfill(promise, value) {
      if (promise._state !== $$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = $$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
      } else {
        $$asap$$default($$$internal$$publish, promise);
      }
    }

    function $$$internal$$reject(promise, reason) {
      if (promise._state !== $$$internal$$PENDING) { return; }
      promise._state = $$$internal$$REJECTED;
      promise._result = reason;

      $$asap$$default($$$internal$$publishRejection, promise);
    }

    function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + $$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        $$asap$$default($$$internal$$publish, parent);
      }
    }

    function $$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          $$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function $$$internal$$ErrorObject() {
      this.error = null;
    }

    var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        $$$internal$$TRY_CATCH_ERROR.error = e;
        return $$$internal$$TRY_CATCH_ERROR;
      }
    }

    function $$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = $$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = $$$internal$$tryCatch(callback, detail);

        if (value === $$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          $$$internal$$reject(promise, $$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== $$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        $$$internal$$resolve(promise, value);
      } else if (failed) {
        $$$internal$$reject(promise, error);
      } else if (settled === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, value);
      } else if (settled === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, value);
      }
    }

    function $$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          $$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          $$$internal$$reject(promise, reason);
        });
      } catch(e) {
        $$$internal$$reject(promise, e);
      }
    }

    function $$$enumerator$$makeSettledResult(state, position, value) {
      if (state === $$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
        return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function $$$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor($$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          $$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            $$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        $$$internal$$reject(this.promise, this._validationError());
      }
    }

    $$$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return $$utils$$isArray(input);
    };

    $$$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    $$$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var $$$enumerator$$default = $$$enumerator$$Enumerator;

    $$$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var promise = this.promise;
      var input   = this._input;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    $$$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      if ($$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
          entry._onerror = null;
          this._settledAt(entry._state, i, entry._result);
        } else {
          this._willSettleAt(c.resolve(entry), i);
        }
      } else {
        this._remaining--;
        this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
      }
    };

    $$$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === $$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === $$$internal$$REJECTED) {
          $$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        $$$internal$$fulfill(promise, this._result);
      }
    };

    $$$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    $$$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      $$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt($$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt($$$internal$$REJECTED, i, reason);
      });
    };

    var $$promise$all$$default = function all(entries, label) {
      return new $$$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    };

    var $$promise$race$$default = function race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor($$$internal$$noop, label);

      if (!$$utils$$isArray(entries)) {
        $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        $$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        $$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    };

    var $$promise$resolve$$default = function resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$resolve(promise, object);
      return promise;
    };

    var $$promise$reject$$default = function reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$reject(promise, reason);
      return promise;
    };

    var $$es6$promise$promise$$counter = 0;

    function $$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function $$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var $$es6$promise$promise$$default = $$es6$promise$promise$$Promise;

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function $$es6$promise$promise$$Promise(resolver) {
      this._id = $$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if ($$$internal$$noop !== resolver) {
        if (!$$utils$$isFunction(resolver)) {
          $$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof $$es6$promise$promise$$Promise)) {
          $$es6$promise$promise$$needsNew();
        }

        $$$internal$$initializePromise(this, resolver);
      }
    }

    $$es6$promise$promise$$Promise.all = $$promise$all$$default;
    $$es6$promise$promise$$Promise.race = $$promise$race$$default;
    $$es6$promise$promise$$Promise.resolve = $$promise$resolve$$default;
    $$es6$promise$promise$$Promise.reject = $$promise$reject$$default;

    $$es6$promise$promise$$Promise.prototype = {
      constructor: $$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor($$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          $$asap$$default(function(){
            $$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };

    var $$es6$promise$polyfill$$default = function polyfill() {
      var local;

      if (typeof global !== 'undefined') {
        local = global;
      } else if (typeof window !== 'undefined' && window.document) {
        local = window;
      } else {
        local = self;
      }

      var es6PromiseSupport =
        "Promise" in local &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "resolve" in local.Promise &&
        "reject" in local.Promise &&
        "all" in local.Promise &&
        "race" in local.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new local.Promise(function(r) { resolve = r; });
          return $$utils$$isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        local.Promise = $$es6$promise$promise$$default;
      }
    };

    var es6$promise$umd$$ES6Promise = {
      'Promise': $$es6$promise$promise$$default,
      'polyfill': $$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = es6$promise$umd$$ES6Promise;
    }
}).call(this);
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\node_modules\\watchify\\node_modules\\browserify\\node_modules\\process\\browser.js"}],"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\node_modules\\watchify\\node_modules\\browserify\\node_modules\\process\\browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\spec\\all-specs.js":[function(require,module,exports){
require('./authentication-parameter-provider-spec');
require('./cloudshare-client-spec');
},{"./authentication-parameter-provider-spec":"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\spec\\authentication-parameter-provider-spec.js","./cloudshare-client-spec":"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\spec\\cloudshare-client-spec.js"}],"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\spec\\authentication-parameter-provider-spec.js":[function(require,module,exports){
var AuthenticationParameterProvider = require('../src/authentication-parameter-provider');

describe("AuthenticationParameterProvider", function() {

	var mockHMACService;

	beforeEach(function() {
		mockHMACService = jasmine.createSpyObj('mockHMACService', ['hash']);
		mockHMACService.hash.and.callFake(function(obj) {
			return "HASHED-VALUE";
		});
	});

	describe("get()", function() {
		it("returns the the auth param in the correct format", function() {
			var authenticationParameterProvider = createProvider();

			var result = authenticationParameterProvider.get({
				url: 'https://localhost/api/v3/BoobySchmooby',
				apiId: 'API_ID',
				apiKey: 'API_KEY'
			});

			expect(result).toMatch(/^userapiid:API_ID;timestamp:\d+;token:\w{10};hmac:HASHED-VALUE$/);
		});

		it("calls HMACService.hash() with the given apiKey, url, timestamp, and token", function() {
			var authenticationParameterProvider = createProvider();

			authenticationParameterProvider.get({
				url: 'https://localhost/api/v3/BoobySchmooby',
				apiId: 'API_ID',
				apiKey: 'API_KEY'
			});

			var params = mockHMACService.hash.calls.first().args[0];
			expect(params.apiKey).toEqual('API_KEY');
			expect(params.url).toEqual('https://localhost/api/v3/BoobySchmooby');
			expect(params.token).toMatch(/\w{10}/);
			expect(params.timestamp).toMatch(/\d+/);
		});
	});


	function createProvider() {
		return new AuthenticationParameterProvider(mockHMACService);
	}

});
},{"../src/authentication-parameter-provider":"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\src\\authentication-parameter-provider.js"}],"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\spec\\cloudshare-client-spec.js":[function(require,module,exports){
var Promise = require('es6-promise').Promise;
var CloudShareClient = require('../src/cloudshare-client');

describe("CloudShareClient", function() {

	var mockAuthenticationParameterProvider;
	var mockHttp;
	var requestPromise;

	beforeEach(function() {
		mockAuthenticationParameterProvider = jasmine.createSpyObj('mockAuthenticationParameterProvider', ['get']);
		mockHttp = jasmine.createSpyObj('mockHttp', ['req']);
		requestPromise = new Promise(function(resolve){resolve();});
		
		mockHttp.req.and.callFake(function() {
			return requestPromise;
		});
		mockAuthenticationParameterProvider.get.and.returnValue('AUTH-PARAM');
	});

	describe("req()", function() {
		it("return rejected promise if no hostname is given with an error", function(done) {
			var client = createClient();

			client.req({
				apiId: 'API_ID',
				apiKey: 'API_KEY'
			})
			.then(function() {
				expect('the promise').toBe('rejected');
				done();
			})
			.catch(function(err) {
				expect(err.message).toBe('Missing hostname');
				done();
			});
		});

		it("return rejected promise if no http method is given with an error", function(done) {
			var client = createClient();
			client.req({
				hostname: 'localhost',
				apiId: 'API_ID',
				apiKey: 'API_KEY'
			})
			.then(function() {
				expect('the promise').toBe('rejected');
				done();
			})
			.catch(function(err) {
				expect(err.message).toBe('Missing HTTP method');
				done();
			});
		});

		it("return rejected promise if no path is given with an error", function(done) {
			var client = createClient();
			
			client.req({
				hostname: 'localhost',
				method: 'GET',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect('the promise').toBe('rejected');
				done();
			})
			.catch(function(err) {
				expect(err.message).toBe('Missing path');
				done();
			});
		});

		it("calls AuthenticationParameterProvider.get() with https://localhost/api/v3/somepath as url if given hostname: 'localhost' and path: 'somepath'", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).toHaveBeenCalledWith(jasmine.objectContaining({
					url: 'https://localhost/api/v3/somepath'
				}));
				done();
			})
			.catch(function(err) {
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls AuthenticationParameterProvider.get() with https://localhost/api/v3/somepath?id=123&foo=bar as url if given hostname: 'localhost' and path: 'somepath' and queryParams: {id:123,foo:\"bar\"}", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
				queryParams: {id:123, foo:"bar"}
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).toHaveBeenCalledWith(jasmine.objectContaining({
					url: 'https://localhost/api/v3/somepath?id=123&foo=bar'
				}));
				done();
			})
			.catch(function(err) {
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls AuthenticationParameterProvider.get() with given apiId", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).toHaveBeenCalledWith(jasmine.objectContaining({
					apiId: 'API_ID'
				}));
				done();
			})
			.catch(function(err) {
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls AuthenticationParameterProvider.get() with given apiKey", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).toHaveBeenCalledWith(jasmine.objectContaining({
					apiKey: 'API_KEY'
				}));
				done();
			})
			.catch(function(err) {
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("doesn't call AuthenticationParameterProvider.get() if no apiId is given", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiKey: 'API_KEY'
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).not.toHaveBeenCalled();
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("doesn't call AuthenticationParameterProvider.get() if no apiKey is given", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID'
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).not.toHaveBeenCalled();
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with given HTTP method", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					method: 'GET'
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with https://localhost/api/v3/somepath as url if given hostname: 'localhost' and path: '/somepath'", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					url: 'https://localhost/api/v3/somepath'
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with https://localhost/api/v3/somepath as url if given hostname: 'localhost' and path: '/somepath' and queryParams: {id: 123}", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				queryParams: {id: 123},
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					url: 'https://localhost/api/v3/somepath'
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with headers: { 'Authorization': 'cs_sha1 AUTH-PARAM', 'Content-Type': 'application/json', 'Accept': 'application/json' }", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					headers: {
						'Authorization': 'cs_sha1 AUTH-PARAM',
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					}
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } if no apiId is given", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiKey: 'API_KEY'
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					}
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } if no apiKey is given", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID'
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					}
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with given queryParams", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
				queryParams: {
					a: '1',
					b: '2'
				}
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					queryParams: {
						a: '1',
						b: '2'
					}
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with given content", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
				content: {
					a: '1',
					b: '2'
				}
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					content: {
						a: '1',
						b: '2'
					}
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});


		it("returns a http.req()'s resolved promise if all input is valid", function(done) {
			requestPromise = new Promise(function(resolve, reject) {
				resolve('RESPONSE');
			});
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function(response) {
				expect(response).toBe('RESPONSE');
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("returns a http.req()'s rejected promise if all input is valid", function(done) {
			requestPromise = new Promise(function(resolve, reject) {
				reject('RESPONSE');
			});
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function(response) {
				expect('the promise').toBe('rejected');
				done();
			})
			.catch(function(err) {
				expect(err).toBe('RESPONSE');
				done();
			});
		});
	});


	function createClient() {
		return new CloudShareClient(mockHttp, mockAuthenticationParameterProvider);
	}

});
},{"../src/cloudshare-client":"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\src\\cloudshare-client.js","es6-promise":"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\node_modules\\es6-promise\\dist\\es6-promise.js"}],"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\src\\authentication-parameter-provider.js":[function(require,module,exports){

function AuthenticationParameterProvider(hmacService) {
	this.hmacService = hmacService;
}

/*
	options = {
		url: entire request url (https://...),
		apiId
		apiKey
	}
*/
AuthenticationParameterProvider.prototype.get = function(options) {
	var params = getParameters(options);
	var hmac = getHmac(this, params);
	return getAuthString(params, hmac);
};

function getAuthString(params, hmac) {
	return "userapiid:" + params.apiId + ";timestamp:" + params.timestamp + ";token:" + params.token + ";hmac:" + hmac;
}

function getParameters(options) {
	return {
		apiId: options.apiId,
		apiKey: options.apiKey,
		timestamp: getTimestamp(),
		token: getReenterancyToken(),
		url: options.url
	};
}

function getReenterancyToken() {
	return Math.random().toString().substring(2, 12);
}

function getTimestamp() {
	return Math.floor(Date.now() / 1000);
}

function getHmac(self, params) {
	return self.hmacService.hash({
		apiKey: params.apiKey,
		url: params.url,
		timestamp: params.timestamp,
		token: params.token
	});
}

module.exports = AuthenticationParameterProvider;

},{}],"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\src\\cloudshare-client.js":[function(require,module,exports){
var Promise = require('es6-promise').Promise;

function CloudShareClient(http, authenticationParameterProvider) {
	this.http = http;
	this.authParamProvider = authenticationParameterProvider;
}

/*
	options = {
		[hostname],
		method,
		path,
		[queryParams],
		[content],
		[apiId],
		[apiKey]
	}
*/
CloudShareClient.prototype.req = function(options) {
	var self = this;
	return new Promise(function(resolve, reject) {
		options = validateAndMassageOptions(options, reject);
		resolve(request(self, options));
	});
};

function request(self, options) {
	return self.http.req({
		method: options.method,
		url: generateUrlWithoutQueryString(options),
		headers: getHeaders(self, options),
		queryParams: options.queryParams,
		content: options.content
	});
}

function getHeaders(self, options) {
	var headers = {
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	};
	if (options.apiId && options.apiKey)
		headers['Authorization'] = 'cs_sha1 ' + getAuthParam(self, options);
	return headers;
}

function getAuthParam(self, options) {
	return self.authParamProvider.get({
		url: generateUrlWithQueryString(options),
		apiId: options.apiId,
		apiKey: options.apiKey
	});	
}

function validateAndMassageOptions(options, reject) {
	options = options || {};
	validateOptions(options, reject);
	prefixPathWithSlash(options);
	return options;
}

function prefixPathWithSlash(options) {
	if (options.path.indexOf('/') !== 0)
		options.path = '/' + options.path;
}

function validateOptions(options, reject) {
	if (!options.hostname)
		throw new Error("Missing hostname");
	else if (!options.method)
		throw new Error("Missing HTTP method");
	else if (!options.path)
		throw new Error("Missing path");
}

function generateUrlWithQueryString(options) {
	return generateUrlWithoutQueryString(options) + createQueryParams(options.queryParams);
}

function generateUrlWithoutQueryString(options) {
	return 'https://' + options.hostname + '/api/v3' + options.path;
}

function createQueryParams(obj) {
	if (!obj)
		return "";
	var str = [];
	for (var p in obj) {
	   if (obj.hasOwnProperty(p))
	       str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	}
	return str.length > 0 ? "?" + str.join("&") : "";
}

function tryJSONParse(text) {
	try {
		return JSON.parse(text);
	} catch (e) {
		return text;
	}
}

module.exports = CloudShareClient;


},{"es6-promise":"C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\node_modules\\es6-promise\\dist\\es6-promise.js"}]},{},["C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\spec\\all-specs.js","C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\spec\\authentication-parameter-provider-spec.js","C:\\code\\cloudshare\\src\\javascript\\cs-sdk\\spec\\cloudshare-client-spec.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcd2F0Y2hpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzXFxlczYtcHJvbWlzZVxcZGlzdFxcZXM2LXByb21pc2UuanMiLCJub2RlX21vZHVsZXNcXHdhdGNoaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xccHJvY2Vzc1xcYnJvd3Nlci5qcyIsInNwZWNcXGFsbC1zcGVjcy5qcyIsInNwZWNcXGF1dGhlbnRpY2F0aW9uLXBhcmFtZXRlci1wcm92aWRlci1zcGVjLmpzIiwic3BlY1xcY2xvdWRzaGFyZS1jbGllbnQtc3BlYy5qcyIsInNyY1xcYXV0aGVudGljYXRpb24tcGFyYW1ldGVyLXByb3ZpZGVyLmpzIiwic3JjXFxjbG91ZHNoYXJlLWNsaWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMvN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vamFrZWFyY2hpYmFsZC9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICAyLjAuMVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGZ1bmN0aW9uICQkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nIHx8ICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCR1dGlscyQkaXNGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCR1dGlscyQkaXNNYXliZVRoZW5hYmxlKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgJCR1dGlscyQkX2lzQXJyYXk7XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkpIHtcbiAgICAgICQkdXRpbHMkJF9pc0FycmF5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICQkdXRpbHMkJF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbiAgICB9XG5cbiAgICB2YXIgJCR1dGlscyQkaXNBcnJheSA9ICQkdXRpbHMkJF9pc0FycmF5O1xuICAgIHZhciAkJHV0aWxzJCRub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuICAgIGZ1bmN0aW9uICQkdXRpbHMkJEYoKSB7IH1cblxuICAgIHZhciAkJHV0aWxzJCRvX2NyZWF0ZSA9IChPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWNvbmQgYXJndW1lbnQgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICAgICAgfVxuICAgICAgJCR1dGlscyQkRi5wcm90b3R5cGUgPSBvO1xuICAgICAgcmV0dXJuIG5ldyAkJHV0aWxzJCRGKCk7XG4gICAgfSk7XG5cbiAgICB2YXIgJCRhc2FwJCRsZW4gPSAwO1xuXG4gICAgdmFyICQkYXNhcCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgICAgJCRhc2FwJCRxdWV1ZVskJGFzYXAkJGxlbl0gPSBjYWxsYmFjaztcbiAgICAgICQkYXNhcCQkcXVldWVbJCRhc2FwJCRsZW4gKyAxXSA9IGFyZztcbiAgICAgICQkYXNhcCQkbGVuICs9IDI7XG4gICAgICBpZiAoJCRhc2FwJCRsZW4gPT09IDIpIHtcbiAgICAgICAgLy8gSWYgbGVuIGlzIDEsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgICAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgICAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgICAgICQkYXNhcCQkc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgJCRhc2FwJCRicm93c2VyR2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xuICAgIHZhciAkJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gJCRhc2FwJCRicm93c2VyR2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgJCRhc2FwJCRicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG5cbiAgICAvLyB0ZXN0IGZvciB3ZWIgd29ya2VyIGJ1dCBub3QgaW4gSUUxMFxuICAgIHZhciAkJGFzYXAkJGlzV29ya2VyID0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnO1xuXG4gICAgLy8gbm9kZVxuICAgIGZ1bmN0aW9uICQkYXNhcCQkdXNlTmV4dFRpY2soKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soJCRhc2FwJCRmbHVzaCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHZhciBvYnNlcnZlciA9IG5ldyAkJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKCQkYXNhcCQkZmx1c2gpO1xuICAgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBub2RlLmRhdGEgPSAoaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyB3ZWIgd29ya2VyXG4gICAgZnVuY3Rpb24gJCRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpIHtcbiAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9ICQkYXNhcCQkZmx1c2g7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJGFzYXAkJHVzZVNldFRpbWVvdXQoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoJCRhc2FwJCRmbHVzaCwgMSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciAkJGFzYXAkJHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuXG4gICAgZnVuY3Rpb24gJCRhc2FwJCRmbHVzaCgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJCRhc2FwJCRsZW47IGkrPTIpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJCRhc2FwJCRxdWV1ZVtpXTtcbiAgICAgICAgdmFyIGFyZyA9ICQkYXNhcCQkcXVldWVbaSsxXTtcblxuICAgICAgICBjYWxsYmFjayhhcmcpO1xuXG4gICAgICAgICQkYXNhcCQkcXVldWVbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICQkYXNhcCQkcXVldWVbaSsxXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgJCRhc2FwJCRsZW4gPSAwO1xuICAgIH1cblxuICAgIHZhciAkJGFzYXAkJHNjaGVkdWxlRmx1c2g7XG5cbiAgICAvLyBEZWNpZGUgd2hhdCBhc3luYyBtZXRob2QgdG8gdXNlIHRvIHRyaWdnZXJpbmcgcHJvY2Vzc2luZyBvZiBxdWV1ZWQgY2FsbGJhY2tzOlxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgICAkJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJGFzYXAkJHVzZU5leHRUaWNrKCk7XG4gICAgfSBlbHNlIGlmICgkJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAkJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbiAgICB9IGVsc2UgaWYgKCQkYXNhcCQkaXNXb3JrZXIpIHtcbiAgICAgICQkYXNhcCQkc2NoZWR1bGVGbHVzaCA9ICQkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCRhc2FwJCRzY2hlZHVsZUZsdXNoID0gJCRhc2FwJCR1c2VTZXRUaW1lb3V0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJG5vb3AoKSB7fVxuICAgIHZhciAkJCRpbnRlcm5hbCQkUEVORElORyAgID0gdm9pZCAwO1xuICAgIHZhciAkJCRpbnRlcm5hbCQkRlVMRklMTEVEID0gMTtcbiAgICB2YXIgJCQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG4gICAgdmFyICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUiA9IG5ldyAkJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRzZWxmRnVsbGZpbGxtZW50KCkge1xuICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJZb3UgY2Fubm90IHJlc29sdmUgYSBwcm9taXNlIHdpdGggaXRzZWxmXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRjYW5ub3RSZXR1cm5Pd24oKSB7XG4gICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcignQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLicpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGdldFRoZW4ocHJvbWlzZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SLmVycm9yID0gZXJyb3I7XG4gICAgICAgIHJldHVybiAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUsIHRoZW4pIHtcbiAgICAgICAkJGFzYXAkJGRlZmF1bHQoZnVuY3Rpb24ocHJvbWlzZSkge1xuICAgICAgICB2YXIgc2VhbGVkID0gZmFsc2U7XG4gICAgICAgIHZhciBlcnJvciA9ICQkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHRoZW5hYmxlLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcblxuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgICAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0sIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSkge1xuICAgICAgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSBpZiAocHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAkJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdGhlbiA9ICQkJGludGVybmFsJCRnZXRUaGVuKG1heWJlVGhlbmFibGUpO1xuXG4gICAgICAgIGlmICh0aGVuID09PSAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoJCR1dGlscyQkaXNGdW5jdGlvbih0aGVuKSkge1xuICAgICAgICAgICQkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSkge1xuICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgJCQkaW50ZXJuYWwkJHNlbGZGdWxsZmlsbG1lbnQoKSk7XG4gICAgICB9IGVsc2UgaWYgKCQkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICQkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkcHVibGlzaFJlamVjdGlvbihwcm9taXNlKSB7XG4gICAgICBpZiAocHJvbWlzZS5fb25lcnJvcikge1xuICAgICAgICBwcm9taXNlLl9vbmVycm9yKHByb21pc2UuX3Jlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgICQkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuXG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSB2YWx1ZTtcbiAgICAgIHByb21pc2UuX3N0YXRlID0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRDtcblxuICAgICAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCRhc2FwJCRkZWZhdWx0KCQkJGludGVybmFsJCRwdWJsaXNoLCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbikge1xuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSAkJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cbiAgICAgIHByb21pc2UuX3N0YXRlID0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuXG4gICAgICAkJGFzYXAkJGRlZmF1bHQoJCQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24sIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgbGVuZ3RoID0gc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gICAgICBwYXJlbnQuX29uZXJyb3IgPSBudWxsO1xuXG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyAkJCRpbnRlcm5hbCQkRlVMRklMTEVEXSA9IG9uRnVsZmlsbG1lbnQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyAkJCRpbnRlcm5hbCQkUkVKRUNURURdICA9IG9uUmVqZWN0aW9uO1xuXG4gICAgICBpZiAobGVuZ3RoID09PSAwICYmIHBhcmVudC5fc3RhdGUpIHtcbiAgICAgICAgJCRhc2FwJCRkZWZhdWx0KCQkJGludGVybmFsJCRwdWJsaXNoLCBwYXJlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHByb21pc2UuX3N1YnNjcmliZXJzO1xuICAgICAgdmFyIHNldHRsZWQgPSBwcm9taXNlLl9zdGF0ZTtcblxuICAgICAgaWYgKHN1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm47IH1cblxuICAgICAgdmFyIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsID0gcHJvbWlzZS5fcmVzdWx0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmliZXJzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIGNoaWxkID0gc3Vic2NyaWJlcnNbaV07XG4gICAgICAgIGNhbGxiYWNrID0gc3Vic2NyaWJlcnNbaSArIHNldHRsZWRdO1xuXG4gICAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICAgICQkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRFcnJvck9iamVjdCgpIHtcbiAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciAkJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SID0gbmV3ICQkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhkZXRhaWwpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICQkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IuZXJyb3IgPSBlO1xuICAgICAgICByZXR1cm4gJCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgcHJvbWlzZSwgY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdmFyIGhhc0NhbGxiYWNrID0gJCR1dGlscyQkaXNGdW5jdGlvbihjYWxsYmFjayksXG4gICAgICAgICAgdmFsdWUsIGVycm9yLCBzdWNjZWVkZWQsIGZhaWxlZDtcblxuICAgICAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgICAgIHZhbHVlID0gJCQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gJCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUikge1xuICAgICAgICAgIGZhaWxlZCA9IHRydWU7XG4gICAgICAgICAgZXJyb3IgPSB2YWx1ZS5lcnJvcjtcbiAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgJCQkaW50ZXJuYWwkJGNhbm5vdFJldHVybk93bigpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBkZXRhaWw7XG4gICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgLy8gbm9vcFxuICAgICAgfSBlbHNlIGlmIChoYXNDYWxsYmFjayAmJiBzdWNjZWVkZWQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChmYWlsZWQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChzZXR0bGVkID09PSAkJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHByb21pc2UsIHJlc29sdmVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXNvbHZlcihmdW5jdGlvbiByZXNvbHZlUHJvbWlzZSh2YWx1ZSl7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRlbnVtZXJhdG9yJCRtYWtlU2V0dGxlZFJlc3VsdChzdGF0ZSwgcG9zaXRpb24sIHZhbHVlKSB7XG4gICAgICBpZiAoc3RhdGUgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0ZTogJ2Z1bGZpbGxlZCcsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXRlOiAncmVqZWN0ZWQnLFxuICAgICAgICAgIHJlYXNvbjogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yKENvbnN0cnVjdG9yLCBpbnB1dCwgYWJvcnRPblJlamVjdCwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IgPSBDb25zdHJ1Y3RvcjtcbiAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgdGhpcy5fYWJvcnRPblJlamVjdCA9IGFib3J0T25SZWplY3Q7XG5cbiAgICAgIGlmICh0aGlzLl92YWxpZGF0ZUlucHV0KGlucHV0KSkge1xuICAgICAgICB0aGlzLl9pbnB1dCAgICAgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5sZW5ndGggICAgID0gaW5wdXQubGVuZ3RoO1xuICAgICAgICB0aGlzLl9yZW1haW5pbmcgPSBpbnB1dC5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubGVuZ3RoIHx8IDA7XG4gICAgICAgICAgdGhpcy5fZW51bWVyYXRlKCk7XG4gICAgICAgICAgaWYgKHRoaXMuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdCh0aGlzLnByb21pc2UsIHRoaXMuX3ZhbGlkYXRpb25FcnJvcigpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGVJbnB1dCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gJCR1dGlscyQkaXNBcnJheShpbnB1dCk7XG4gICAgfTtcblxuICAgICQkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xuICAgIH07XG5cbiAgICAkJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgICB9O1xuXG4gICAgdmFyICQkJGVudW1lcmF0b3IkJGRlZmF1bHQgPSAkJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yO1xuXG4gICAgJCQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxlbmd0aCAgPSB0aGlzLmxlbmd0aDtcbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuICAgICAgdmFyIGlucHV0ICAgPSB0aGlzLl9pbnB1dDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5fZWFjaEVudHJ5KGlucHV0W2ldLCBpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJCQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uKGVudHJ5LCBpKSB7XG4gICAgICB2YXIgYyA9IHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3I7XG4gICAgICBpZiAoJCR1dGlscyQkaXNNYXliZVRoZW5hYmxlKGVudHJ5KSkge1xuICAgICAgICBpZiAoZW50cnkuY29uc3RydWN0b3IgPT09IGMgJiYgZW50cnkuX3N0YXRlICE9PSAkJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAgIGVudHJ5Ll9vbmVycm9yID0gbnVsbDtcbiAgICAgICAgICB0aGlzLl9zZXR0bGVkQXQoZW50cnkuX3N0YXRlLCBpLCBlbnRyeS5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQoYy5yZXNvbHZlKGVudHJ5KSwgaSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSB0aGlzLl9tYWtlUmVzdWx0KCQkJGludGVybmFsJCRGVUxGSUxMRUQsIGksIGVudHJ5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJCQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uKHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG5cbiAgICAgICAgaWYgKHRoaXMuX2Fib3J0T25SZWplY3QgJiYgc3RhdGUgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHRoaXMuX21ha2VSZXN1bHQoc3RhdGUsIGksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICQkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9tYWtlUmVzdWx0ID0gZnVuY3Rpb24oc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcblxuICAgICQkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl93aWxsU2V0dGxlQXQgPSBmdW5jdGlvbihwcm9taXNlLCBpKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgICQkJGludGVybmFsJCRzdWJzY3JpYmUocHJvbWlzZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoJCQkaW50ZXJuYWwkJEZVTEZJTExFRCwgaSwgdmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdCgkJCRpbnRlcm5hbCQkUkVKRUNURUQsIGksIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyICQkcHJvbWlzZSRhbGwkJGRlZmF1bHQgPSBmdW5jdGlvbiBhbGwoZW50cmllcywgbGFiZWwpIHtcbiAgICAgIHJldHVybiBuZXcgJCQkZW51bWVyYXRvciQkZGVmYXVsdCh0aGlzLCBlbnRyaWVzLCB0cnVlIC8qIGFib3J0IG9uIHJlamVjdCAqLywgbGFiZWwpLnByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHByb21pc2UkcmFjZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJhY2UoZW50cmllcywgbGFiZWwpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuXG4gICAgICBpZiAoISQkdXRpbHMkJGlzQXJyYXkoZW50cmllcykpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxtZW50KHZhbHVlKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25SZWplY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHN1YnNjcmliZShDb25zdHJ1Y3Rvci5yZXNvbHZlKGVudHJpZXNbaV0pLCB1bmRlZmluZWQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJlc29sdmUob2JqZWN0LCBsYWJlbCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgb2JqZWN0KTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRwcm9taXNlJHJlamVjdCQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJlamVjdChyZWFzb24sIGxhYmVsKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG4gICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlciA9IDA7XG5cbiAgICBmdW5jdGlvbiAkJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc05ldygpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuXG4gICAgdmFyICQkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCA9ICQkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZTtcblxuICAgIC8qKlxuICAgICAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICAgICAgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCwgd2hpY2hcbiAgICAgIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNl4oCZcyBldmVudHVhbCB2YWx1ZSBvciB0aGUgcmVhc29uXG4gICAgICB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgVGVybWlub2xvZ3lcbiAgICAgIC0tLS0tLS0tLS0tXG5cbiAgICAgIC0gYHByb21pc2VgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB3aXRoIGEgYHRoZW5gIG1ldGhvZCB3aG9zZSBiZWhhdmlvciBjb25mb3JtcyB0byB0aGlzIHNwZWNpZmljYXRpb24uXG4gICAgICAtIGB0aGVuYWJsZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIGB0aGVuYCBtZXRob2QuXG4gICAgICAtIGB2YWx1ZWAgaXMgYW55IGxlZ2FsIEphdmFTY3JpcHQgdmFsdWUgKGluY2x1ZGluZyB1bmRlZmluZWQsIGEgdGhlbmFibGUsIG9yIGEgcHJvbWlzZSkuXG4gICAgICAtIGBleGNlcHRpb25gIGlzIGEgdmFsdWUgdGhhdCBpcyB0aHJvd24gdXNpbmcgdGhlIHRocm93IHN0YXRlbWVudC5cbiAgICAgIC0gYHJlYXNvbmAgaXMgYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aHkgYSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgICAgIC0gYHNldHRsZWRgIHRoZSBmaW5hbCByZXN0aW5nIHN0YXRlIG9mIGEgcHJvbWlzZSwgZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuXG4gICAgICBBIHByb21pc2UgY2FuIGJlIGluIG9uZSBvZiB0aHJlZSBzdGF0ZXM6IHBlbmRpbmcsIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQuXG5cbiAgICAgIFByb21pc2VzIHRoYXQgYXJlIGZ1bGZpbGxlZCBoYXZlIGEgZnVsZmlsbG1lbnQgdmFsdWUgYW5kIGFyZSBpbiB0aGUgZnVsZmlsbGVkXG4gICAgICBzdGF0ZS4gIFByb21pc2VzIHRoYXQgYXJlIHJlamVjdGVkIGhhdmUgYSByZWplY3Rpb24gcmVhc29uIGFuZCBhcmUgaW4gdGhlXG4gICAgICByZWplY3RlZCBzdGF0ZS4gIEEgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmV2ZXIgYSB0aGVuYWJsZS5cblxuICAgICAgUHJvbWlzZXMgY2FuIGFsc28gYmUgc2FpZCB0byAqcmVzb2x2ZSogYSB2YWx1ZS4gIElmIHRoaXMgdmFsdWUgaXMgYWxzbyBhXG4gICAgICBwcm9taXNlLCB0aGVuIHRoZSBvcmlnaW5hbCBwcm9taXNlJ3Mgc2V0dGxlZCBzdGF0ZSB3aWxsIG1hdGNoIHRoZSB2YWx1ZSdzXG4gICAgICBzZXR0bGVkIHN0YXRlLiAgU28gYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCByZWplY3RzIHdpbGxcbiAgICAgIGl0c2VsZiByZWplY3QsIGFuZCBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIHdpbGxcbiAgICAgIGl0c2VsZiBmdWxmaWxsLlxuXG5cbiAgICAgIEJhc2ljIFVzYWdlOlxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIGBgYGpzXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBvbiBzdWNjZXNzXG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuXG4gICAgICAgIC8vIG9uIGZhaWx1cmVcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICBQcm9taXNlcyBzaGluZSB3aGVuIGFic3RyYWN0aW5nIGF3YXkgYXN5bmNocm9ub3VzIGludGVyYWN0aW9ucyBzdWNoIGFzXG4gICAgICBgWE1MSHR0cFJlcXVlc3Rgcy5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBoYW5kbGVyO1xuICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgeGhyLnNlbmQoKTtcblxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSB0aGlzLkRPTkUpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2dldEpTT046IGAnICsgdXJsICsgJ2AgZmFpbGVkIHdpdGggc3RhdHVzOiBbJyArIHRoaXMuc3RhdHVzICsgJ10nKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZ2V0SlNPTignL3Bvc3RzLmpzb24nKS50aGVuKGZ1bmN0aW9uKGpzb24pIHtcbiAgICAgICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAvLyBvbiByZWplY3Rpb25cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFVubGlrZSBjYWxsYmFja3MsIHByb21pc2VzIGFyZSBncmVhdCBjb21wb3NhYmxlIHByaW1pdGl2ZXMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGdldEpTT04oJy9wb3N0cycpLFxuICAgICAgICBnZXRKU09OKCcvY29tbWVudHMnKVxuICAgICAgXSkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuICAgICAgICB2YWx1ZXNbMF0gLy8gPT4gcG9zdHNKU09OXG4gICAgICAgIHZhbHVlc1sxXSAvLyA9PiBjb21tZW50c0pTT05cblxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQGNsYXNzIFByb21pc2VcbiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmVyXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAY29uc3RydWN0b3JcbiAgICAqL1xuICAgIGZ1bmN0aW9uICQkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZShyZXNvbHZlcikge1xuICAgICAgdGhpcy5faWQgPSAkJGVzNiRwcm9taXNlJHByb21pc2UkJGNvdW50ZXIrKztcbiAgICAgIHRoaXMuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXTtcblxuICAgICAgaWYgKCQkJGludGVybmFsJCRub29wICE9PSByZXNvbHZlcikge1xuICAgICAgICBpZiAoISQkdXRpbHMkJGlzRnVuY3Rpb24ocmVzb2x2ZXIpKSB7XG4gICAgICAgICAgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlKSkge1xuICAgICAgICAgICQkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNOZXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZSh0aGlzLCByZXNvbHZlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLmFsbCA9ICQkcHJvbWlzZSRhbGwkJGRlZmF1bHQ7XG4gICAgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJhY2UgPSAkJHByb21pc2UkcmFjZSQkZGVmYXVsdDtcbiAgICAkJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmVzb2x2ZSA9ICQkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuICAgICQkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5yZWplY3QgPSAkJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0O1xuXG4gICAgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiAkJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UsXG5cbiAgICAvKipcbiAgICAgIFRoZSBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLFxuICAgICAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgICAgIHJlYXNvbiB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgLy8gdXNlciBpcyBhdmFpbGFibGVcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHVzZXIgaXMgdW5hdmFpbGFibGUsIGFuZCB5b3UgYXJlIGdpdmVuIHRoZSByZWFzb24gd2h5XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBDaGFpbmluZ1xuICAgICAgLS0tLS0tLS1cblxuICAgICAgVGhlIHJldHVybiB2YWx1ZSBvZiBgdGhlbmAgaXMgaXRzZWxmIGEgcHJvbWlzZS4gIFRoaXMgc2Vjb25kLCAnZG93bnN0cmVhbSdcbiAgICAgIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgICAgIG9yIHJlamVjdGlvbiBoYW5kbGVyLCBvciByZWplY3RlZCBpZiB0aGUgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiB1c2VyLm5hbWU7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCBuYW1lJztcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHVzZXJOYW1lKSB7XG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAgICAgLy8gd2lsbCBiZSBgJ2RlZmF1bHQgbmFtZSdgXG4gICAgICB9KTtcblxuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIGlmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgcmVhc29uYCB3aWxsIGJlICdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScuXG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknLlxuICAgICAgfSk7XG4gICAgICBgYGBcbiAgICAgIElmIHRoZSBkb3duc3RyZWFtIHByb21pc2UgZG9lcyBub3Qgc3BlY2lmeSBhIHJlamVjdGlvbiBoYW5kbGVyLCByZWplY3Rpb24gcmVhc29ucyB3aWxsIGJlIHByb3BhZ2F0ZWQgZnVydGhlciBkb3duc3RyZWFtLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBQZWRhZ29naWNhbEV4Y2VwdGlvbignVXBzdHJlYW0gZXJyb3InKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gVGhlIGBQZWRnYWdvY2lhbEV4Y2VwdGlvbmAgaXMgcHJvcGFnYXRlZCBhbGwgdGhlIHdheSBkb3duIHRvIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFzc2ltaWxhdGlvblxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIFNvbWV0aW1lcyB0aGUgdmFsdWUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIHRvIGEgZG93bnN0cmVhbSBwcm9taXNlIGNhbiBvbmx5IGJlXG4gICAgICByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FuIGJlIGFjaGlldmVkIGJ5IHJldHVybmluZyBhIHByb21pc2UgaW4gdGhlXG4gICAgICBmdWxmaWxsbWVudCBvciByZWplY3Rpb24gaGFuZGxlci4gVGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIHRoZW4gYmUgcGVuZGluZ1xuICAgICAgdW50aWwgdGhlIHJldHVybmVkIHByb21pc2UgaXMgc2V0dGxlZC4gVGhpcyBpcyBjYWxsZWQgKmFzc2ltaWxhdGlvbiouXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gVGhlIHVzZXIncyBjb21tZW50cyBhcmUgbm93IGF2YWlsYWJsZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgSWYgdGhlIGFzc2ltbGlhdGVkIHByb21pc2UgcmVqZWN0cywgdGhlbiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgYWxzbyByZWplY3QuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCBmdWxmaWxscywgd2UnbGwgaGF2ZSB0aGUgdmFsdWUgaGVyZVxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIHJlamVjdHMsIHdlJ2xsIGhhdmUgdGhlIHJlYXNvbiBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBTaW1wbGUgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRSZXN1bHQoZnVuY3Rpb24ocmVzdWx0LCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kUmVzdWx0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciBhdXRob3IsIGJvb2tzO1xuXG4gICAgICB0cnkge1xuICAgICAgICBhdXRob3IgPSBmaW5kQXV0aG9yKCk7XG4gICAgICAgIGJvb2tzICA9IGZpbmRCb29rc0J5QXV0aG9yKGF1dGhvcik7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcblxuICAgICAgZnVuY3Rpb24gZm91bmRCb29rcyhib29rcykge1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGZhaWx1cmUocmVhc29uKSB7XG5cbiAgICAgIH1cblxuICAgICAgZmluZEF1dGhvcihmdW5jdGlvbihhdXRob3IsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaW5kQm9vb2tzQnlBdXRob3IoYXV0aG9yLCBmdW5jdGlvbihib29rcywgZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICBmYWlsdXJlKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kQXV0aG9yKCkuXG4gICAgICAgIHRoZW4oZmluZEJvb2tzQnlBdXRob3IpLlxuICAgICAgICB0aGVuKGZ1bmN0aW9uKGJvb2tzKXtcbiAgICAgICAgICAvLyBmb3VuZCBib29rc1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgdGhlblxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsZWRcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0ZWRcbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgIHRoZW46IGZ1bmN0aW9uKG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzO1xuICAgICAgICB2YXIgc3RhdGUgPSBwYXJlbnQuX3N0YXRlO1xuXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCAmJiAhb25GdWxmaWxsbWVudCB8fCBzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEICYmICFvblJlamVjdGlvbikge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3IoJCQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgICB2YXIgcmVzdWx0ID0gcGFyZW50Ll9yZXN1bHQ7XG5cbiAgICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzW3N0YXRlIC0gMV07XG4gICAgICAgICAgJCRhc2FwJCRkZWZhdWx0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgIH0sXG5cbiAgICAvKipcbiAgICAgIGBjYXRjaGAgaXMgc2ltcGx5IHN1Z2FyIGZvciBgdGhlbih1bmRlZmluZWQsIG9uUmVqZWN0aW9uKWAgd2hpY2ggbWFrZXMgaXQgdGhlIHNhbWVcbiAgICAgIGFzIHRoZSBjYXRjaCBibG9jayBvZiBhIHRyeS9jYXRjaCBzdGF0ZW1lbnQuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmdW5jdGlvbiBmaW5kQXV0aG9yKCl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGRuJ3QgZmluZCB0aGF0IGF1dGhvcicpO1xuICAgICAgfVxuXG4gICAgICAvLyBzeW5jaHJvbm91c1xuICAgICAgdHJ5IHtcbiAgICAgICAgZmluZEF1dGhvcigpO1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH1cblxuICAgICAgLy8gYXN5bmMgd2l0aCBwcm9taXNlc1xuICAgICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIGNhdGNoXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGlvblxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgJ2NhdGNoJzogZnVuY3Rpb24ob25SZWplY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGlvbik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciAkJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0ID0gZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gICAgICB2YXIgbG9jYWw7XG5cbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBsb2NhbCA9IGdsb2JhbDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmRvY3VtZW50KSB7XG4gICAgICAgIGxvY2FsID0gd2luZG93O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9jYWwgPSBzZWxmO1xuICAgICAgfVxuXG4gICAgICB2YXIgZXM2UHJvbWlzZVN1cHBvcnQgPVxuICAgICAgICBcIlByb21pc2VcIiBpbiBsb2NhbCAmJlxuICAgICAgICAvLyBTb21lIG9mIHRoZXNlIG1ldGhvZHMgYXJlIG1pc3NpbmcgZnJvbVxuICAgICAgICAvLyBGaXJlZm94L0Nocm9tZSBleHBlcmltZW50YWwgaW1wbGVtZW50YXRpb25zXG4gICAgICAgIFwicmVzb2x2ZVwiIGluIGxvY2FsLlByb21pc2UgJiZcbiAgICAgICAgXCJyZWplY3RcIiBpbiBsb2NhbC5Qcm9taXNlICYmXG4gICAgICAgIFwiYWxsXCIgaW4gbG9jYWwuUHJvbWlzZSAmJlxuICAgICAgICBcInJhY2VcIiBpbiBsb2NhbC5Qcm9taXNlICYmXG4gICAgICAgIC8vIE9sZGVyIHZlcnNpb24gb2YgdGhlIHNwZWMgaGFkIGEgcmVzb2x2ZXIgb2JqZWN0XG4gICAgICAgIC8vIGFzIHRoZSBhcmcgcmF0aGVyIHRoYW4gYSBmdW5jdGlvblxuICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHJlc29sdmU7XG4gICAgICAgICAgbmV3IGxvY2FsLlByb21pc2UoZnVuY3Rpb24ocikgeyByZXNvbHZlID0gcjsgfSk7XG4gICAgICAgICAgcmV0dXJuICQkdXRpbHMkJGlzRnVuY3Rpb24ocmVzb2x2ZSk7XG4gICAgICAgIH0oKSk7XG5cbiAgICAgIGlmICghZXM2UHJvbWlzZVN1cHBvcnQpIHtcbiAgICAgICAgbG9jYWwuUHJvbWlzZSA9ICQkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGVzNiRwcm9taXNlJHVtZCQkRVM2UHJvbWlzZSA9IHtcbiAgICAgICdQcm9taXNlJzogJCRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0LFxuICAgICAgJ3BvbHlmaWxsJzogJCRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdFxuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlOyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZVsnZXhwb3J0cyddKSB7XG4gICAgICBtb2R1bGVbJ2V4cG9ydHMnXSA9IGVzNiRwcm9taXNlJHVtZCQkRVM2UHJvbWlzZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpc1snRVM2UHJvbWlzZSddID0gZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH1cbn0pLmNhbGwodGhpcyk7IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuTXV0YXRpb25PYnNlcnZlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICBpZiAoY2FuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICB2YXIgaGlkZGVuRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXVlTGlzdCA9IHF1ZXVlLnNsaWNlKCk7XG4gICAgICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcXVldWVMaXN0LmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGhpZGRlbkRpdiwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBoaWRkZW5EaXYuc2V0QXR0cmlidXRlKCd5ZXMnLCAnbm8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsInJlcXVpcmUoJy4vYXV0aGVudGljYXRpb24tcGFyYW1ldGVyLXByb3ZpZGVyLXNwZWMnKTtcclxucmVxdWlyZSgnLi9jbG91ZHNoYXJlLWNsaWVudC1zcGVjJyk7IiwidmFyIEF1dGhlbnRpY2F0aW9uUGFyYW1ldGVyUHJvdmlkZXIgPSByZXF1aXJlKCcuLi9zcmMvYXV0aGVudGljYXRpb24tcGFyYW1ldGVyLXByb3ZpZGVyJyk7XHJcblxyXG5kZXNjcmliZShcIkF1dGhlbnRpY2F0aW9uUGFyYW1ldGVyUHJvdmlkZXJcIiwgZnVuY3Rpb24oKSB7XHJcblxyXG5cdHZhciBtb2NrSE1BQ1NlcnZpY2U7XHJcblxyXG5cdGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRtb2NrSE1BQ1NlcnZpY2UgPSBqYXNtaW5lLmNyZWF0ZVNweU9iaignbW9ja0hNQUNTZXJ2aWNlJywgWydoYXNoJ10pO1xyXG5cdFx0bW9ja0hNQUNTZXJ2aWNlLmhhc2guYW5kLmNhbGxGYWtlKGZ1bmN0aW9uKG9iaikge1xyXG5cdFx0XHRyZXR1cm4gXCJIQVNIRUQtVkFMVUVcIjtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cclxuXHRkZXNjcmliZShcImdldCgpXCIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0aXQoXCJyZXR1cm5zIHRoZSB0aGUgYXV0aCBwYXJhbSBpbiB0aGUgY29ycmVjdCBmb3JtYXRcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBhdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyID0gY3JlYXRlUHJvdmlkZXIoKTtcclxuXHJcblx0XHRcdHZhciByZXN1bHQgPSBhdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyLmdldCh7XHJcblx0XHRcdFx0dXJsOiAnaHR0cHM6Ly9sb2NhbGhvc3QvYXBpL3YzL0Jvb2J5U2NobW9vYnknLFxyXG5cdFx0XHRcdGFwaUlkOiAnQVBJX0lEJyxcclxuXHRcdFx0XHRhcGlLZXk6ICdBUElfS0VZJ1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvTWF0Y2goL151c2VyYXBpaWQ6QVBJX0lEO3RpbWVzdGFtcDpcXGQrO3Rva2VuOlxcd3sxMH07aG1hYzpIQVNIRUQtVkFMVUUkLyk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcImNhbGxzIEhNQUNTZXJ2aWNlLmhhc2goKSB3aXRoIHRoZSBnaXZlbiBhcGlLZXksIHVybCwgdGltZXN0YW1wLCBhbmQgdG9rZW5cIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBhdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyID0gY3JlYXRlUHJvdmlkZXIoKTtcclxuXHJcblx0XHRcdGF1dGhlbnRpY2F0aW9uUGFyYW1ldGVyUHJvdmlkZXIuZ2V0KHtcclxuXHRcdFx0XHR1cmw6ICdodHRwczovL2xvY2FsaG9zdC9hcGkvdjMvQm9vYnlTY2htb29ieScsXHJcblx0XHRcdFx0YXBpSWQ6ICdBUElfSUQnLFxyXG5cdFx0XHRcdGFwaUtleTogJ0FQSV9LRVknXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dmFyIHBhcmFtcyA9IG1vY2tITUFDU2VydmljZS5oYXNoLmNhbGxzLmZpcnN0KCkuYXJnc1swXTtcclxuXHRcdFx0ZXhwZWN0KHBhcmFtcy5hcGlLZXkpLnRvRXF1YWwoJ0FQSV9LRVknKTtcclxuXHRcdFx0ZXhwZWN0KHBhcmFtcy51cmwpLnRvRXF1YWwoJ2h0dHBzOi8vbG9jYWxob3N0L2FwaS92My9Cb29ieVNjaG1vb2J5Jyk7XHJcblx0XHRcdGV4cGVjdChwYXJhbXMudG9rZW4pLnRvTWF0Y2goL1xcd3sxMH0vKTtcclxuXHRcdFx0ZXhwZWN0KHBhcmFtcy50aW1lc3RhbXApLnRvTWF0Y2goL1xcZCsvKTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlUHJvdmlkZXIoKSB7XHJcblx0XHRyZXR1cm4gbmV3IEF1dGhlbnRpY2F0aW9uUGFyYW1ldGVyUHJvdmlkZXIobW9ja0hNQUNTZXJ2aWNlKTtcclxuXHR9XHJcblxyXG59KTsiLCJ2YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ2VzNi1wcm9taXNlJykuUHJvbWlzZTtcclxudmFyIENsb3VkU2hhcmVDbGllbnQgPSByZXF1aXJlKCcuLi9zcmMvY2xvdWRzaGFyZS1jbGllbnQnKTtcclxuXHJcbmRlc2NyaWJlKFwiQ2xvdWRTaGFyZUNsaWVudFwiLCBmdW5jdGlvbigpIHtcclxuXHJcblx0dmFyIG1vY2tBdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyO1xyXG5cdHZhciBtb2NrSHR0cDtcclxuXHR2YXIgcmVxdWVzdFByb21pc2U7XHJcblxyXG5cdGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRtb2NrQXV0aGVudGljYXRpb25QYXJhbWV0ZXJQcm92aWRlciA9IGphc21pbmUuY3JlYXRlU3B5T2JqKCdtb2NrQXV0aGVudGljYXRpb25QYXJhbWV0ZXJQcm92aWRlcicsIFsnZ2V0J10pO1xyXG5cdFx0bW9ja0h0dHAgPSBqYXNtaW5lLmNyZWF0ZVNweU9iaignbW9ja0h0dHAnLCBbJ3JlcSddKTtcclxuXHRcdHJlcXVlc3RQcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7cmVzb2x2ZSgpO30pO1xyXG5cdFx0XHJcblx0XHRtb2NrSHR0cC5yZXEuYW5kLmNhbGxGYWtlKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gcmVxdWVzdFByb21pc2U7XHJcblx0XHR9KTtcclxuXHRcdG1vY2tBdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyLmdldC5hbmQucmV0dXJuVmFsdWUoJ0FVVEgtUEFSQU0nKTtcclxuXHR9KTtcclxuXHJcblx0ZGVzY3JpYmUoXCJyZXEoKVwiLCBmdW5jdGlvbigpIHtcclxuXHRcdGl0KFwicmV0dXJuIHJlamVjdGVkIHByb21pc2UgaWYgbm8gaG9zdG5hbWUgaXMgZ2l2ZW4gd2l0aCBhbiBlcnJvclwiLCBmdW5jdGlvbihkb25lKSB7XHJcblx0XHRcdHZhciBjbGllbnQgPSBjcmVhdGVDbGllbnQoKTtcclxuXHJcblx0XHRcdGNsaWVudC5yZXEoe1xyXG5cdFx0XHRcdGFwaUlkOiAnQVBJX0lEJyxcclxuXHRcdFx0XHRhcGlLZXk6ICdBUElfS0VZJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRleHBlY3QoJ3RoZSBwcm9taXNlJykudG9CZSgncmVqZWN0ZWQnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuXHRcdFx0XHRleHBlY3QoZXJyLm1lc3NhZ2UpLnRvQmUoJ01pc3NpbmcgaG9zdG5hbWUnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJyZXR1cm4gcmVqZWN0ZWQgcHJvbWlzZSBpZiBubyBodHRwIG1ldGhvZCBpcyBnaXZlbiB3aXRoIGFuIGVycm9yXCIsIGZ1bmN0aW9uKGRvbmUpIHtcclxuXHRcdFx0dmFyIGNsaWVudCA9IGNyZWF0ZUNsaWVudCgpO1xyXG5cdFx0XHRjbGllbnQucmVxKHtcclxuXHRcdFx0XHRob3N0bmFtZTogJ2xvY2FsaG9zdCcsXHJcblx0XHRcdFx0YXBpSWQ6ICdBUElfSUQnLFxyXG5cdFx0XHRcdGFwaUtleTogJ0FQSV9LRVknXHJcblx0XHRcdH0pXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGV4cGVjdCgndGhlIHByb21pc2UnKS50b0JlKCdyZWplY3RlZCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG5cdFx0XHRcdGV4cGVjdChlcnIubWVzc2FnZSkudG9CZSgnTWlzc2luZyBIVFRQIG1ldGhvZCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInJldHVybiByZWplY3RlZCBwcm9taXNlIGlmIG5vIHBhdGggaXMgZ2l2ZW4gd2l0aCBhbiBlcnJvclwiLCBmdW5jdGlvbihkb25lKSB7XHJcblx0XHRcdHZhciBjbGllbnQgPSBjcmVhdGVDbGllbnQoKTtcclxuXHRcdFx0XHJcblx0XHRcdGNsaWVudC5yZXEoe1xyXG5cdFx0XHRcdGhvc3RuYW1lOiAnbG9jYWxob3N0JyxcclxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRcdGFwaUlkOiAnQVBJX0lEJyxcclxuXHRcdFx0XHRhcGlLZXk6ICdBUElfS0VZJyxcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0ZXhwZWN0KCd0aGUgcHJvbWlzZScpLnRvQmUoJ3JlamVjdGVkJyk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcblx0XHRcdFx0ZXhwZWN0KGVyci5tZXNzYWdlKS50b0JlKCdNaXNzaW5nIHBhdGgnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJjYWxscyBBdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyLmdldCgpIHdpdGggaHR0cHM6Ly9sb2NhbGhvc3QvYXBpL3YzL3NvbWVwYXRoIGFzIHVybCBpZiBnaXZlbiBob3N0bmFtZTogJ2xvY2FsaG9zdCcgYW5kIHBhdGg6ICdzb21lcGF0aCdcIiwgZnVuY3Rpb24oZG9uZSkge1xyXG5cdFx0XHR2YXIgY2xpZW50ID0gY3JlYXRlQ2xpZW50KCk7XHJcblx0XHRcdFxyXG5cdFx0XHRjbGllbnQucmVxKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRcdGhvc3RuYW1lOiAnbG9jYWxob3N0JyxcclxuXHRcdFx0XHRwYXRoOiAnc29tZXBhdGgnLFxyXG5cdFx0XHRcdGFwaUlkOiAnQVBJX0lEJyxcclxuXHRcdFx0XHRhcGlLZXk6ICdBUElfS0VZJyxcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0ZXhwZWN0KG1vY2tBdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyLmdldCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoamFzbWluZS5vYmplY3RDb250YWluaW5nKHtcclxuXHRcdFx0XHRcdHVybDogJ2h0dHBzOi8vbG9jYWxob3N0L2FwaS92My9zb21lcGF0aCdcclxuXHRcdFx0XHR9KSk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcblx0XHRcdFx0ZXhwZWN0KCd0aGUgcHJvbWlzZScpLnRvQmUoJ3Jlc29sdmVkJyk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwiY2FsbHMgQXV0aGVudGljYXRpb25QYXJhbWV0ZXJQcm92aWRlci5nZXQoKSB3aXRoIGh0dHBzOi8vbG9jYWxob3N0L2FwaS92My9zb21lcGF0aD9pZD0xMjMmZm9vPWJhciBhcyB1cmwgaWYgZ2l2ZW4gaG9zdG5hbWU6ICdsb2NhbGhvc3QnIGFuZCBwYXRoOiAnc29tZXBhdGgnIGFuZCBxdWVyeVBhcmFtczoge2lkOjEyMyxmb286XFxcImJhclxcXCJ9XCIsIGZ1bmN0aW9uKGRvbmUpIHtcclxuXHRcdFx0dmFyIGNsaWVudCA9IGNyZWF0ZUNsaWVudCgpO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2xpZW50LnJlcSh7XHJcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0XHRob3N0bmFtZTogJ2xvY2FsaG9zdCcsXHJcblx0XHRcdFx0cGF0aDogJ3NvbWVwYXRoJyxcclxuXHRcdFx0XHRhcGlJZDogJ0FQSV9JRCcsXHJcblx0XHRcdFx0YXBpS2V5OiAnQVBJX0tFWScsXHJcblx0XHRcdFx0cXVlcnlQYXJhbXM6IHtpZDoxMjMsIGZvbzpcImJhclwifVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRleHBlY3QobW9ja0F1dGhlbnRpY2F0aW9uUGFyYW1ldGVyUHJvdmlkZXIuZ2V0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChqYXNtaW5lLm9iamVjdENvbnRhaW5pbmcoe1xyXG5cdFx0XHRcdFx0dXJsOiAnaHR0cHM6Ly9sb2NhbGhvc3QvYXBpL3YzL3NvbWVwYXRoP2lkPTEyMyZmb289YmFyJ1xyXG5cdFx0XHRcdH0pKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuXHRcdFx0XHRleHBlY3QoJ3RoZSBwcm9taXNlJykudG9CZSgncmVzb2x2ZWQnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJjYWxscyBBdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyLmdldCgpIHdpdGggZ2l2ZW4gYXBpSWRcIiwgZnVuY3Rpb24oZG9uZSkge1xyXG5cdFx0XHR2YXIgY2xpZW50ID0gY3JlYXRlQ2xpZW50KCk7XHJcblx0XHRcdFxyXG5cdFx0XHRjbGllbnQucmVxKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRcdGhvc3RuYW1lOiAnbG9jYWxob3N0JyxcclxuXHRcdFx0XHRwYXRoOiAnc29tZXBhdGgnLFxyXG5cdFx0XHRcdGFwaUlkOiAnQVBJX0lEJyxcclxuXHRcdFx0XHRhcGlLZXk6ICdBUElfS0VZJyxcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0ZXhwZWN0KG1vY2tBdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyLmdldCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoamFzbWluZS5vYmplY3RDb250YWluaW5nKHtcclxuXHRcdFx0XHRcdGFwaUlkOiAnQVBJX0lEJ1xyXG5cdFx0XHRcdH0pKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuXHRcdFx0XHRleHBlY3QoJ3RoZSBwcm9taXNlJykudG9CZSgncmVzb2x2ZWQnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJjYWxscyBBdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyLmdldCgpIHdpdGggZ2l2ZW4gYXBpS2V5XCIsIGZ1bmN0aW9uKGRvbmUpIHtcclxuXHRcdFx0dmFyIGNsaWVudCA9IGNyZWF0ZUNsaWVudCgpO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2xpZW50LnJlcSh7XHJcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0XHRob3N0bmFtZTogJ2xvY2FsaG9zdCcsXHJcblx0XHRcdFx0cGF0aDogJ3NvbWVwYXRoJyxcclxuXHRcdFx0XHRhcGlJZDogJ0FQSV9JRCcsXHJcblx0XHRcdFx0YXBpS2V5OiAnQVBJX0tFWScsXHJcblx0XHRcdH0pXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGV4cGVjdChtb2NrQXV0aGVudGljYXRpb25QYXJhbWV0ZXJQcm92aWRlci5nZXQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKGphc21pbmUub2JqZWN0Q29udGFpbmluZyh7XHJcblx0XHRcdFx0XHRhcGlLZXk6ICdBUElfS0VZJ1xyXG5cdFx0XHRcdH0pKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuXHRcdFx0XHRleHBlY3QoJ3RoZSBwcm9taXNlJykudG9CZSgncmVzb2x2ZWQnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJkb2Vzbid0IGNhbGwgQXV0aGVudGljYXRpb25QYXJhbWV0ZXJQcm92aWRlci5nZXQoKSBpZiBubyBhcGlJZCBpcyBnaXZlblwiLCBmdW5jdGlvbihkb25lKSB7XHJcblx0XHRcdHZhciBjbGllbnQgPSBjcmVhdGVDbGllbnQoKTtcclxuXHRcdFx0XHJcblx0XHRcdGNsaWVudC5yZXEoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ0dFVCcsXHJcblx0XHRcdFx0aG9zdG5hbWU6ICdsb2NhbGhvc3QnLFxyXG5cdFx0XHRcdHBhdGg6ICdzb21lcGF0aCcsXHJcblx0XHRcdFx0YXBpS2V5OiAnQVBJX0tFWSdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0ZXhwZWN0KG1vY2tBdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyLmdldCkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnIuc3RhY2spO1xyXG5cdFx0XHRcdGV4cGVjdCgndGhlIHByb21pc2UnKS50b0JlKCdyZXNvbHZlZCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcImRvZXNuJ3QgY2FsbCBBdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyLmdldCgpIGlmIG5vIGFwaUtleSBpcyBnaXZlblwiLCBmdW5jdGlvbihkb25lKSB7XHJcblx0XHRcdHZhciBjbGllbnQgPSBjcmVhdGVDbGllbnQoKTtcclxuXHRcdFx0XHJcblx0XHRcdGNsaWVudC5yZXEoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ0dFVCcsXHJcblx0XHRcdFx0aG9zdG5hbWU6ICdsb2NhbGhvc3QnLFxyXG5cdFx0XHRcdHBhdGg6ICdzb21lcGF0aCcsXHJcblx0XHRcdFx0YXBpSWQ6ICdBUElfSUQnXHJcblx0XHRcdH0pXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGV4cGVjdChtb2NrQXV0aGVudGljYXRpb25QYXJhbWV0ZXJQcm92aWRlci5nZXQpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyLnN0YWNrKTtcclxuXHRcdFx0XHRleHBlY3QoJ3RoZSBwcm9taXNlJykudG9CZSgncmVzb2x2ZWQnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJjYWxscyBIdHRwLnJlcSgpIHdpdGggZ2l2ZW4gSFRUUCBtZXRob2RcIiwgZnVuY3Rpb24oZG9uZSkge1xyXG5cdFx0XHR2YXIgY2xpZW50ID0gY3JlYXRlQ2xpZW50KCk7XHJcblx0XHRcdFxyXG5cdFx0XHRjbGllbnQucmVxKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRcdGhvc3RuYW1lOiAnbG9jYWxob3N0JyxcclxuXHRcdFx0XHRwYXRoOiAnc29tZXBhdGgnLFxyXG5cdFx0XHRcdGFwaUlkOiAnQVBJX0lEJyxcclxuXHRcdFx0XHRhcGlLZXk6ICdBUElfS0VZJyxcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0ZXhwZWN0KG1vY2tIdHRwLnJlcSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoamFzbWluZS5vYmplY3RDb250YWluaW5nKHtcclxuXHRcdFx0XHRcdG1ldGhvZDogJ0dFVCdcclxuXHRcdFx0XHR9KSk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyLnN0YWNrKTtcclxuXHRcdFx0XHRleHBlY3QoJ3RoZSBwcm9taXNlJykudG9CZSgncmVzb2x2ZWQnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJjYWxscyBIdHRwLnJlcSgpIHdpdGggaHR0cHM6Ly9sb2NhbGhvc3QvYXBpL3YzL3NvbWVwYXRoIGFzIHVybCBpZiBnaXZlbiBob3N0bmFtZTogJ2xvY2FsaG9zdCcgYW5kIHBhdGg6ICcvc29tZXBhdGgnXCIsIGZ1bmN0aW9uKGRvbmUpIHtcclxuXHRcdFx0dmFyIGNsaWVudCA9IGNyZWF0ZUNsaWVudCgpO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2xpZW50LnJlcSh7XHJcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0XHRob3N0bmFtZTogJ2xvY2FsaG9zdCcsXHJcblx0XHRcdFx0cGF0aDogJy9zb21lcGF0aCcsXHJcblx0XHRcdFx0YXBpSWQ6ICdBUElfSUQnLFxyXG5cdFx0XHRcdGFwaUtleTogJ0FQSV9LRVknLFxyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRleHBlY3QobW9ja0h0dHAucmVxKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChqYXNtaW5lLm9iamVjdENvbnRhaW5pbmcoe1xyXG5cdFx0XHRcdFx0dXJsOiAnaHR0cHM6Ly9sb2NhbGhvc3QvYXBpL3YzL3NvbWVwYXRoJ1xyXG5cdFx0XHRcdH0pKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnIuc3RhY2spO1xyXG5cdFx0XHRcdGV4cGVjdCgndGhlIHByb21pc2UnKS50b0JlKCdyZXNvbHZlZCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcImNhbGxzIEh0dHAucmVxKCkgd2l0aCBodHRwczovL2xvY2FsaG9zdC9hcGkvdjMvc29tZXBhdGggYXMgdXJsIGlmIGdpdmVuIGhvc3RuYW1lOiAnbG9jYWxob3N0JyBhbmQgcGF0aDogJy9zb21lcGF0aCcgYW5kIHF1ZXJ5UGFyYW1zOiB7aWQ6IDEyM31cIiwgZnVuY3Rpb24oZG9uZSkge1xyXG5cdFx0XHR2YXIgY2xpZW50ID0gY3JlYXRlQ2xpZW50KCk7XHJcblx0XHRcdFxyXG5cdFx0XHRjbGllbnQucmVxKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRcdGhvc3RuYW1lOiAnbG9jYWxob3N0JyxcclxuXHRcdFx0XHRwYXRoOiAnL3NvbWVwYXRoJyxcclxuXHRcdFx0XHRxdWVyeVBhcmFtczoge2lkOiAxMjN9LFxyXG5cdFx0XHRcdGFwaUlkOiAnQVBJX0lEJyxcclxuXHRcdFx0XHRhcGlLZXk6ICdBUElfS0VZJyxcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0ZXhwZWN0KG1vY2tIdHRwLnJlcSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoamFzbWluZS5vYmplY3RDb250YWluaW5nKHtcclxuXHRcdFx0XHRcdHVybDogJ2h0dHBzOi8vbG9jYWxob3N0L2FwaS92My9zb21lcGF0aCdcclxuXHRcdFx0XHR9KSk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyLnN0YWNrKTtcclxuXHRcdFx0XHRleHBlY3QoJ3RoZSBwcm9taXNlJykudG9CZSgncmVzb2x2ZWQnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJjYWxscyBIdHRwLnJlcSgpIHdpdGggaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6ICdjc19zaGExIEFVVEgtUEFSQU0nLCAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLCAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nIH1cIiwgZnVuY3Rpb24oZG9uZSkge1xyXG5cdFx0XHR2YXIgY2xpZW50ID0gY3JlYXRlQ2xpZW50KCk7XHJcblx0XHRcdFxyXG5cdFx0XHRjbGllbnQucmVxKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRcdGhvc3RuYW1lOiAnbG9jYWxob3N0JyxcclxuXHRcdFx0XHRwYXRoOiAnL3NvbWVwYXRoJyxcclxuXHRcdFx0XHRhcGlJZDogJ0FQSV9JRCcsXHJcblx0XHRcdFx0YXBpS2V5OiAnQVBJX0tFWScsXHJcblx0XHRcdH0pXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGV4cGVjdChtb2NrSHR0cC5yZXEpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKGphc21pbmUub2JqZWN0Q29udGFpbmluZyh7XHJcblx0XHRcdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0XHRcdCdBdXRob3JpemF0aW9uJzogJ2NzX3NoYTEgQVVUSC1QQVJBTScsXHJcblx0XHRcdFx0XHRcdCdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcblx0XHRcdFx0XHRcdCdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbidcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KSk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyLnN0YWNrKTtcclxuXHRcdFx0XHRleHBlY3QoJ3RoZSBwcm9taXNlJykudG9CZSgncmVzb2x2ZWQnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJjYWxscyBIdHRwLnJlcSgpIHdpdGggaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLCAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nIH0gaWYgbm8gYXBpSWQgaXMgZ2l2ZW5cIiwgZnVuY3Rpb24oZG9uZSkge1xyXG5cdFx0XHR2YXIgY2xpZW50ID0gY3JlYXRlQ2xpZW50KCk7XHJcblx0XHRcdFxyXG5cdFx0XHRjbGllbnQucmVxKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRcdGhvc3RuYW1lOiAnbG9jYWxob3N0JyxcclxuXHRcdFx0XHRwYXRoOiAnL3NvbWVwYXRoJyxcclxuXHRcdFx0XHRhcGlLZXk6ICdBUElfS0VZJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRleHBlY3QobW9ja0h0dHAucmVxKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChqYXNtaW5lLm9iamVjdENvbnRhaW5pbmcoe1xyXG5cdFx0XHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdFx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG5cdFx0XHRcdFx0XHQnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKGVyci5zdGFjayk7XHJcblx0XHRcdFx0ZXhwZWN0KCd0aGUgcHJvbWlzZScpLnRvQmUoJ3Jlc29sdmVkJyk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwiY2FsbHMgSHR0cC5yZXEoKSB3aXRoIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyB9IGlmIG5vIGFwaUtleSBpcyBnaXZlblwiLCBmdW5jdGlvbihkb25lKSB7XHJcblx0XHRcdHZhciBjbGllbnQgPSBjcmVhdGVDbGllbnQoKTtcclxuXHRcdFx0XHJcblx0XHRcdGNsaWVudC5yZXEoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ0dFVCcsXHJcblx0XHRcdFx0aG9zdG5hbWU6ICdsb2NhbGhvc3QnLFxyXG5cdFx0XHRcdHBhdGg6ICcvc29tZXBhdGgnLFxyXG5cdFx0XHRcdGFwaUlkOiAnQVBJX0lEJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRleHBlY3QobW9ja0h0dHAucmVxKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChqYXNtaW5lLm9iamVjdENvbnRhaW5pbmcoe1xyXG5cdFx0XHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdFx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG5cdFx0XHRcdFx0XHQnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKGVyci5zdGFjayk7XHJcblx0XHRcdFx0ZXhwZWN0KCd0aGUgcHJvbWlzZScpLnRvQmUoJ3Jlc29sdmVkJyk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwiY2FsbHMgSHR0cC5yZXEoKSB3aXRoIGdpdmVuIHF1ZXJ5UGFyYW1zXCIsIGZ1bmN0aW9uKGRvbmUpIHtcclxuXHRcdFx0dmFyIGNsaWVudCA9IGNyZWF0ZUNsaWVudCgpO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2xpZW50LnJlcSh7XHJcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0XHRob3N0bmFtZTogJ2xvY2FsaG9zdCcsXHJcblx0XHRcdFx0cGF0aDogJy9zb21lcGF0aCcsXHJcblx0XHRcdFx0YXBpSWQ6ICdBUElfSUQnLFxyXG5cdFx0XHRcdGFwaUtleTogJ0FQSV9LRVknLFxyXG5cdFx0XHRcdHF1ZXJ5UGFyYW1zOiB7XHJcblx0XHRcdFx0XHRhOiAnMScsXHJcblx0XHRcdFx0XHRiOiAnMidcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGV4cGVjdChtb2NrSHR0cC5yZXEpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKGphc21pbmUub2JqZWN0Q29udGFpbmluZyh7XHJcblx0XHRcdFx0XHRxdWVyeVBhcmFtczoge1xyXG5cdFx0XHRcdFx0XHRhOiAnMScsXHJcblx0XHRcdFx0XHRcdGI6ICcyJ1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnIuc3RhY2spO1xyXG5cdFx0XHRcdGV4cGVjdCgndGhlIHByb21pc2UnKS50b0JlKCdyZXNvbHZlZCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcImNhbGxzIEh0dHAucmVxKCkgd2l0aCBnaXZlbiBjb250ZW50XCIsIGZ1bmN0aW9uKGRvbmUpIHtcclxuXHRcdFx0dmFyIGNsaWVudCA9IGNyZWF0ZUNsaWVudCgpO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2xpZW50LnJlcSh7XHJcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0XHRob3N0bmFtZTogJ2xvY2FsaG9zdCcsXHJcblx0XHRcdFx0cGF0aDogJy9zb21lcGF0aCcsXHJcblx0XHRcdFx0YXBpSWQ6ICdBUElfSUQnLFxyXG5cdFx0XHRcdGFwaUtleTogJ0FQSV9LRVknLFxyXG5cdFx0XHRcdGNvbnRlbnQ6IHtcclxuXHRcdFx0XHRcdGE6ICcxJyxcclxuXHRcdFx0XHRcdGI6ICcyJ1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0ZXhwZWN0KG1vY2tIdHRwLnJlcSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoamFzbWluZS5vYmplY3RDb250YWluaW5nKHtcclxuXHRcdFx0XHRcdGNvbnRlbnQ6IHtcclxuXHRcdFx0XHRcdFx0YTogJzEnLFxyXG5cdFx0XHRcdFx0XHRiOiAnMidcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KSk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyLnN0YWNrKTtcclxuXHRcdFx0XHRleHBlY3QoJ3RoZSBwcm9taXNlJykudG9CZSgncmVzb2x2ZWQnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cclxuXHRcdGl0KFwicmV0dXJucyBhIGh0dHAucmVxKCkncyByZXNvbHZlZCBwcm9taXNlIGlmIGFsbCBpbnB1dCBpcyB2YWxpZFwiLCBmdW5jdGlvbihkb25lKSB7XHJcblx0XHRcdHJlcXVlc3RQcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdFx0cmVzb2x2ZSgnUkVTUE9OU0UnKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdHZhciBjbGllbnQgPSBjcmVhdGVDbGllbnQoKTtcclxuXHRcdFx0XHJcblx0XHRcdGNsaWVudC5yZXEoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ0dFVCcsXHJcblx0XHRcdFx0aG9zdG5hbWU6ICdsb2NhbGhvc3QnLFxyXG5cdFx0XHRcdHBhdGg6ICcvc29tZXBhdGgnLFxyXG5cdFx0XHRcdGFwaUlkOiAnQVBJX0lEJyxcclxuXHRcdFx0XHRhcGlLZXk6ICdBUElfS0VZJyxcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRleHBlY3QocmVzcG9uc2UpLnRvQmUoJ1JFU1BPTlNFJyk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyLnN0YWNrKTtcclxuXHRcdFx0XHRleHBlY3QoJ3RoZSBwcm9taXNlJykudG9CZSgncmVzb2x2ZWQnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJyZXR1cm5zIGEgaHR0cC5yZXEoKSdzIHJlamVjdGVkIHByb21pc2UgaWYgYWxsIGlucHV0IGlzIHZhbGlkXCIsIGZ1bmN0aW9uKGRvbmUpIHtcclxuXHRcdFx0cmVxdWVzdFByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0XHRyZWplY3QoJ1JFU1BPTlNFJyk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR2YXIgY2xpZW50ID0gY3JlYXRlQ2xpZW50KCk7XHJcblx0XHRcdFxyXG5cdFx0XHRjbGllbnQucmVxKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRcdGhvc3RuYW1lOiAnbG9jYWxob3N0JyxcclxuXHRcdFx0XHRwYXRoOiAnL3NvbWVwYXRoJyxcclxuXHRcdFx0XHRhcGlJZDogJ0FQSV9JRCcsXHJcblx0XHRcdFx0YXBpS2V5OiAnQVBJX0tFWScsXHJcblx0XHRcdH0pXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdFx0ZXhwZWN0KCd0aGUgcHJvbWlzZScpLnRvQmUoJ3JlamVjdGVkJyk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcblx0XHRcdFx0ZXhwZWN0KGVycikudG9CZSgnUkVTUE9OU0UnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcblxyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGVDbGllbnQoKSB7XHJcblx0XHRyZXR1cm4gbmV3IENsb3VkU2hhcmVDbGllbnQobW9ja0h0dHAsIG1vY2tBdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyKTtcclxuXHR9XHJcblxyXG59KTsiLCJcclxuZnVuY3Rpb24gQXV0aGVudGljYXRpb25QYXJhbWV0ZXJQcm92aWRlcihobWFjU2VydmljZSkge1xyXG5cdHRoaXMuaG1hY1NlcnZpY2UgPSBobWFjU2VydmljZTtcclxufVxyXG5cclxuLypcclxuXHRvcHRpb25zID0ge1xyXG5cdFx0dXJsOiBlbnRpcmUgcmVxdWVzdCB1cmwgKGh0dHBzOi8vLi4uKSxcclxuXHRcdGFwaUlkXHJcblx0XHRhcGlLZXlcclxuXHR9XHJcbiovXHJcbkF1dGhlbnRpY2F0aW9uUGFyYW1ldGVyUHJvdmlkZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHR2YXIgcGFyYW1zID0gZ2V0UGFyYW1ldGVycyhvcHRpb25zKTtcclxuXHR2YXIgaG1hYyA9IGdldEhtYWModGhpcywgcGFyYW1zKTtcclxuXHRyZXR1cm4gZ2V0QXV0aFN0cmluZyhwYXJhbXMsIGhtYWMpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gZ2V0QXV0aFN0cmluZyhwYXJhbXMsIGhtYWMpIHtcclxuXHRyZXR1cm4gXCJ1c2VyYXBpaWQ6XCIgKyBwYXJhbXMuYXBpSWQgKyBcIjt0aW1lc3RhbXA6XCIgKyBwYXJhbXMudGltZXN0YW1wICsgXCI7dG9rZW46XCIgKyBwYXJhbXMudG9rZW4gKyBcIjtobWFjOlwiICsgaG1hYztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UGFyYW1ldGVycyhvcHRpb25zKSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdGFwaUlkOiBvcHRpb25zLmFwaUlkLFxyXG5cdFx0YXBpS2V5OiBvcHRpb25zLmFwaUtleSxcclxuXHRcdHRpbWVzdGFtcDogZ2V0VGltZXN0YW1wKCksXHJcblx0XHR0b2tlbjogZ2V0UmVlbnRlcmFuY3lUb2tlbigpLFxyXG5cdFx0dXJsOiBvcHRpb25zLnVybFxyXG5cdH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlZW50ZXJhbmN5VG9rZW4oKSB7XHJcblx0cmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiwgMTIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRUaW1lc3RhbXAoKSB7XHJcblx0cmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRIbWFjKHNlbGYsIHBhcmFtcykge1xyXG5cdHJldHVybiBzZWxmLmhtYWNTZXJ2aWNlLmhhc2goe1xyXG5cdFx0YXBpS2V5OiBwYXJhbXMuYXBpS2V5LFxyXG5cdFx0dXJsOiBwYXJhbXMudXJsLFxyXG5cdFx0dGltZXN0YW1wOiBwYXJhbXMudGltZXN0YW1wLFxyXG5cdFx0dG9rZW46IHBhcmFtcy50b2tlblxyXG5cdH0pO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEF1dGhlbnRpY2F0aW9uUGFyYW1ldGVyUHJvdmlkZXI7XHJcbiIsInZhciBQcm9taXNlID0gcmVxdWlyZSgnZXM2LXByb21pc2UnKS5Qcm9taXNlO1xyXG5cclxuZnVuY3Rpb24gQ2xvdWRTaGFyZUNsaWVudChodHRwLCBhdXRoZW50aWNhdGlvblBhcmFtZXRlclByb3ZpZGVyKSB7XHJcblx0dGhpcy5odHRwID0gaHR0cDtcclxuXHR0aGlzLmF1dGhQYXJhbVByb3ZpZGVyID0gYXV0aGVudGljYXRpb25QYXJhbWV0ZXJQcm92aWRlcjtcclxufVxyXG5cclxuLypcclxuXHRvcHRpb25zID0ge1xyXG5cdFx0W2hvc3RuYW1lXSxcclxuXHRcdG1ldGhvZCxcclxuXHRcdHBhdGgsXHJcblx0XHRbcXVlcnlQYXJhbXNdLFxyXG5cdFx0W2NvbnRlbnRdLFxyXG5cdFx0W2FwaUlkXSxcclxuXHRcdFthcGlLZXldXHJcblx0fVxyXG4qL1xyXG5DbG91ZFNoYXJlQ2xpZW50LnByb3RvdHlwZS5yZXEgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdG9wdGlvbnMgPSB2YWxpZGF0ZUFuZE1hc3NhZ2VPcHRpb25zKG9wdGlvbnMsIHJlamVjdCk7XHJcblx0XHRyZXNvbHZlKHJlcXVlc3Qoc2VsZiwgb3B0aW9ucykpO1xyXG5cdH0pO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gcmVxdWVzdChzZWxmLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIHNlbGYuaHR0cC5yZXEoe1xyXG5cdFx0bWV0aG9kOiBvcHRpb25zLm1ldGhvZCxcclxuXHRcdHVybDogZ2VuZXJhdGVVcmxXaXRob3V0UXVlcnlTdHJpbmcob3B0aW9ucyksXHJcblx0XHRoZWFkZXJzOiBnZXRIZWFkZXJzKHNlbGYsIG9wdGlvbnMpLFxyXG5cdFx0cXVlcnlQYXJhbXM6IG9wdGlvbnMucXVlcnlQYXJhbXMsXHJcblx0XHRjb250ZW50OiBvcHRpb25zLmNvbnRlbnRcclxuXHR9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SGVhZGVycyhzZWxmLCBvcHRpb25zKSB7XHJcblx0dmFyIGhlYWRlcnMgPSB7XHJcblx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG5cdFx0J0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJ1xyXG5cdH07XHJcblx0aWYgKG9wdGlvbnMuYXBpSWQgJiYgb3B0aW9ucy5hcGlLZXkpXHJcblx0XHRoZWFkZXJzWydBdXRob3JpemF0aW9uJ10gPSAnY3Nfc2hhMSAnICsgZ2V0QXV0aFBhcmFtKHNlbGYsIG9wdGlvbnMpO1xyXG5cdHJldHVybiBoZWFkZXJzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBdXRoUGFyYW0oc2VsZiwgb3B0aW9ucykge1xyXG5cdHJldHVybiBzZWxmLmF1dGhQYXJhbVByb3ZpZGVyLmdldCh7XHJcblx0XHR1cmw6IGdlbmVyYXRlVXJsV2l0aFF1ZXJ5U3RyaW5nKG9wdGlvbnMpLFxyXG5cdFx0YXBpSWQ6IG9wdGlvbnMuYXBpSWQsXHJcblx0XHRhcGlLZXk6IG9wdGlvbnMuYXBpS2V5XHJcblx0fSk7XHRcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVBbmRNYXNzYWdlT3B0aW9ucyhvcHRpb25zLCByZWplY3QpIHtcclxuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHR2YWxpZGF0ZU9wdGlvbnMob3B0aW9ucywgcmVqZWN0KTtcclxuXHRwcmVmaXhQYXRoV2l0aFNsYXNoKG9wdGlvbnMpO1xyXG5cdHJldHVybiBvcHRpb25zO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcmVmaXhQYXRoV2l0aFNsYXNoKG9wdGlvbnMpIHtcclxuXHRpZiAob3B0aW9ucy5wYXRoLmluZGV4T2YoJy8nKSAhPT0gMClcclxuXHRcdG9wdGlvbnMucGF0aCA9ICcvJyArIG9wdGlvbnMucGF0aDtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVPcHRpb25zKG9wdGlvbnMsIHJlamVjdCkge1xyXG5cdGlmICghb3B0aW9ucy5ob3N0bmFtZSlcclxuXHRcdHRocm93IG5ldyBFcnJvcihcIk1pc3NpbmcgaG9zdG5hbWVcIik7XHJcblx0ZWxzZSBpZiAoIW9wdGlvbnMubWV0aG9kKVxyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBIVFRQIG1ldGhvZFwiKTtcclxuXHRlbHNlIGlmICghb3B0aW9ucy5wYXRoKVxyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBwYXRoXCIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZW5lcmF0ZVVybFdpdGhRdWVyeVN0cmluZyhvcHRpb25zKSB7XHJcblx0cmV0dXJuIGdlbmVyYXRlVXJsV2l0aG91dFF1ZXJ5U3RyaW5nKG9wdGlvbnMpICsgY3JlYXRlUXVlcnlQYXJhbXMob3B0aW9ucy5xdWVyeVBhcmFtcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlVXJsV2l0aG91dFF1ZXJ5U3RyaW5nKG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gJ2h0dHBzOi8vJyArIG9wdGlvbnMuaG9zdG5hbWUgKyAnL2FwaS92MycgKyBvcHRpb25zLnBhdGg7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVF1ZXJ5UGFyYW1zKG9iaikge1xyXG5cdGlmICghb2JqKVxyXG5cdFx0cmV0dXJuIFwiXCI7XHJcblx0dmFyIHN0ciA9IFtdO1xyXG5cdGZvciAodmFyIHAgaW4gb2JqKSB7XHJcblx0ICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwKSlcclxuXHQgICAgICAgc3RyLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KHApICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW3BdKSk7XHJcblx0fVxyXG5cdHJldHVybiBzdHIubGVuZ3RoID4gMCA/IFwiP1wiICsgc3RyLmpvaW4oXCImXCIpIDogXCJcIjtcclxufVxyXG5cclxuZnVuY3Rpb24gdHJ5SlNPTlBhcnNlKHRleHQpIHtcclxuXHR0cnkge1xyXG5cdFx0cmV0dXJuIEpTT04ucGFyc2UodGV4dCk7XHJcblx0fSBjYXRjaCAoZSkge1xyXG5cdFx0cmV0dXJuIHRleHQ7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsb3VkU2hhcmVDbGllbnQ7XHJcblxyXG4iXX0=
