import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { once } from 'cluster';

var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

function Promise(fn) {
  //store the state which can be PENDING, FULLFILLED, or REJECTED
  var state = PENDING;
  //store the value or error once FULLFILLED or REJECTED
  var value = null;
  //store success or failure handlers attached by calling .then or .done
  var handlers = [];


  function fulfill(result) {
    state = FULFILLED;
    value = result;
    handlers.forEach(handle);
    handlers = null;
  }

  function reject(error) {
    state = REJECTED;
    value = error;
    handlers.forEach(handle);
    handlers = null;
  }


  function resolve(result) {
    try {
      var then = getThen(result);
      if (then) {
        doResolve(then.bind(result), resolve, reject);
        return
      }
      fulfill(result);
    } catch (e) {
      reject(e);
    }
  }

  function handle(handler) {
    if (state === PENDING) {
      handlers.push(handler);
    } else {
      if (state === FULFILLED &&
        typeof handler.onFulfilled === "function") {
        handlers.onFulfilled(value);
      }
      if (state === REJECTED &&
        typeof handler.onRejected === "function") {
        handler.onRejected(value);
      }
    }
  }
  this.done = function (onFulfilled, onRejected) {
    setTimeout(function () {
      handle({
        onFullfilled: onFulfilled,
        onRejected: onRejected
      })
    }, 0);
  }
  this.then = function (onFulfilled, onRejected) {
    var self = this;
    return new Promise(function (resolve, reject) {
      return self.done(function (result) {
        if (typeof onFullfilled === "function") {
          try {
            return resolve(onFulfilled(result));
          } catch (ex) {
            return reject(ex);
          }
        } else {
          return resolve(result);
        }
      }, function (error) {
        if (typeof onRejected === "function") {
          try {
            return resolve(onRejected(error))
          } catch (ex) {
            return reject(ex);
          }
        } else {
          return reject(error);
        }
      })
    })
  }
  doResolve(fn, resolve, reject);
}

// Check if a value is a Promiseand, if it is
// return the "then" method of that Promise
// @param { Promise| Any} value
// @return { function| null}
function getThen(value) {
  var t = typeof value;
  if (value && (t === "object" || t === "function")) {
    var then = value.then;
    if (typeof then === "function") {
      return then;
    }
  }
  return null;
}

// Take a potentially misbehaving resolver function and make sure
//  onFulfilled and onRejected are only called once
// 
// Makes no guarantees about asynchrony
// @param { Function } fn A resolver function that may not be trusted
// @param { Function } onFullfilled
// @params { Function } on Rejected
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) {
        return
      }
      done = true;
      onFulfilled(value)
    }, function (reason) {
      if (done) {
        return
      }
      done = true;
      onRejected(reason);
    })
  } catch (ex) {
    if (done) return
    done = true;
    onRejected(ex);
  }
}







class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
