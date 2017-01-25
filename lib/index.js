'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.actionCreator = actionCreator;
exports.createActions = createActions;
exports.createReducer = createReducer;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 Automatically generate Redux actions and reducers from changes files and hence reduce code duplication and need to use action types constants and switch statements.
 */

var DEFAULT_STATE_KEY = 'DEFAULT_STATE';

/**
  Make action creator for each change and assign it as `change.__eduxActionCreator`.
*/
function bindActionCreator(change, type) {
  change.__eduxActionType = type;
  var creator = change.__eduxActionCreator = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return {
      type: type,
      payload: args
    };
  };
  return creator;
}

function actionCreator(change) {
  return change.__eduxActionCreator;
}

/**
 Create for each change in changes action function and bind it to change
 function.
 @return {object} object of actions of same shape.
*/
function createActions(node) {
  var ns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var result = {};
  for (var key in node) {
    if (!node.hasOwnProperty(key)) continue;
    var child = node[key];
    var childNs = ns && ns + '.' + key || key;
    if (typeof child === 'function') result[key] = bindActionCreator(child, childNs);else if (key === DEFAULT_STATE_KEY) continue;else result[key] = createActions(child, childNs);
  }
  return result;
}

var createAsyncThunk = function createAsyncThunk(dispatch, getState) {
  return function (fn) {
    setTimeout(function () {
      return fn(dispatch, getState);
    }, 0);
  };
};

function applyChange(change, state, action, thunk) {
  if (!action.payload) throw new Error('Action ' + action.type + ' requires payload.');
  var result = change.apply(undefined, [state].concat(_toConsumableArray(action.payload)));
  var resultType = typeof result === 'undefined' ? 'undefined' : _typeof(result);
  if (resultType === 'function') {
    // don't change state now and handle function with async thunk
    thunk(result);
    return state;
  } else if (resultType === 'undefined') {
    return state;
  } else {
    return result; // new state
  }
}

function walkState(path, state, action, changes, thunk) {
  var key = path.split('.', 1)[0];
  var child = changes[key];
  if (!child) return state; // unsupported action
  var isLeaf = key === path;
  if (isLeaf) {
    if (typeof child !== 'function') return state; // unsupported action
    else return applyChange(child, state, action, thunk);
  } else {
    var childPath = path.slice(key.length + 1);
    var childState = state[key];
    var newChildState = walkState(childPath, childState, action, child, thunk);
    if (newChildState === childState) return state;else return _extends({}, state, _defineProperty({}, key, newChildState));
  }
}

function initState(changes, state) {
  var defaultState = changes[DEFAULT_STATE_KEY];
  // if we have DEFAULT_STATE property don't dive dipper
  if (typeof defaultState !== 'undefined') return state || defaultState;

  for (var key in changes) {
    if (!changes.hasOwnProperty(key)) continue;
    var child = changes[key];
    var childType = typeof child === 'undefined' ? 'undefined' : _typeof(child);
    if (childType === 'function') {
      continue; // wait for key == DEFAULT_STATE_KEY
    } else if (childType === 'object') {
      var stateType = typeof state === 'undefined' ? 'undefined' : _typeof(state);
      if (stateType === 'undefined') {
        state = _defineProperty({}, key, initState(child));
      } else if (stateType === 'object') {
        state[key] = initState(child, state[key]);
      } else {
        // console.log('initState', key, stateType, state)
        throw new Error('Nested state should be an object.');
      }
    }
  }
  return state;
}

function createReducer(changes, dispatch, getState) {
  var asyncThunk = createAsyncThunk(dispatch, getState);
  var initialState = void 0;
  return function eduxReducer(state, action) {
    if (typeof initialState === 'undefined') {
      // merge defaultValue with provide preloaded state
      state = initialState = initState(changes, state);
    }
    // Redux's combineReducers sanity check may call reducers
    // several times with undefined state
    if (typeof state === 'undefined') state = initialState;
    return walkState(action.type, state, action, changes, asyncThunk);
  };
}