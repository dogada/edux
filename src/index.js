/**
 Automatically generate Redux actions and reducers from changes files and hence reduce code duplication and need to use action types constants and switch statements.
 */

const DEFAULT_STATE_KEY = 'DEFAULT_STATE'

/**
  Make action creator for each change and assign it as `change.__eduxActionCreator`.
*/
function bindActionCreator (change, type) {
  change.__eduxActionType = type
  let creator = change.__eduxActionCreator = (...args) => ({
    type,
    payload: args
  })
  return creator
}

export function actionCreator (change) {
  return change.__eduxActionCreator
}

/**
 Create for each change in changes action function and bind it to change
 function.
 @return {object} object of actions of same shape.
*/
export function createActions (node, ns = '') {
  let result = {}
  for (let key in node) {
    if (!node.hasOwnProperty(key)) continue
    let child = node[key]
    let childNs = ns && `${ns}.${key}` || key
    if (typeof child === 'function') result[key] = bindActionCreator(child, childNs)
    else if (key === DEFAULT_STATE_KEY) continue
    else result[key] = createActions(child, childNs)
  }
  return result
}

const createAsyncThunk = (dispatch, getState) => (fn) => {
  setTimeout(() => fn(dispatch, getState), 0)
}

function applyChange (change, state, action, thunk) {
  if (!action.payload) throw new Error(`Action ${action.type} requires payload.`)
  let result = change(state, ...action.payload)
  let resultType = typeof result
  if (resultType === 'function') {
    // don't change state now and handle function with async thunk
    thunk(result)
    return state
  } else if (resultType === 'undefined') {
    return state
  } else {
    return result // new state
  }
}

function walkState (path, state, action, changes, thunk) {
  let key = path.split('.', 1)[0]
  let child = changes[key]
  if (!child) return state // unsupported action
  let isLeaf = (key === path)
  if (isLeaf) {
    if (typeof child !== 'function') return state  // unsupported action
    else return applyChange(child, state, action, thunk)
  } else {
    let childPath = path.slice(key.length + 1)
    let childState = state[key]
    let newChildState = walkState(childPath, childState, action, child, thunk)
    if (newChildState === childState) return state
    else return {...state, [key]: newChildState}
  }
}

function initState (changes, state) {
  let defaultState = changes[DEFAULT_STATE_KEY]
  // if we have DEFAULT_STATE property don't dive dipper
  if (typeof defaultState !== 'undefined') return state || defaultState

  for (let key in changes) {
    if (!changes.hasOwnProperty(key)) continue
    let child = changes[key]
    let childType = typeof child
    if (childType === 'function') {
      continue // wait for key == DEFAULT_STATE_KEY
    } else if (childType === 'object') {
      let stateType = typeof state
      if (stateType === 'undefined') {
        state = {[key]: initState(child)}
      } else if (stateType === 'object') {
        state[key] = initState(child, state[key])
      } else {
        // console.log('initState', key, stateType, state)
        throw new Error('Nested state should be an object.')
      }
    }
  }
  return state
}

export function createReducer (changes, dispatch, getState) {
  const asyncThunk = createAsyncThunk(dispatch, getState)
  let initialState
  return function eduxReducer (state, action) {
    if (typeof initialState === 'undefined') {
      // merge defaultValue with provide preloaded state
      state = initialState = initState(changes, state)
    }
    // Redux's combineReducers sanity check may call reducers
    // several times with undefined state
    if (typeof state === 'undefined') state = initialState
    return walkState(action.type, state, action, changes, asyncThunk)
  }
}
