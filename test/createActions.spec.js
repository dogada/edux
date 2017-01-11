/* global describe, expect, it, beforeEach */

import { bindActionCreators, createStore } from 'redux'
import { createActions, createReducer } from '../src'
import * as changes from './helpers/changes'

const actionCreators = createActions(changes)

function cloneOnlyFunctions (obj) {
  let clone = { ...obj }
  Object.keys(clone).forEach(key => {
    if (typeof clone[key] !== 'function') {
      delete clone[key]
    }
  })
  return clone
}

function initStore () {
  const futureDispatch = (action) => store.dispatch(action)
  const futureGetState = () => store.getState()
  const reducer = createReducer(changes, futureDispatch, futureGetState)
  const store = createStore(reducer)
  return store
}

describe('createActions', () => {
  let store, actionCreatorFunctions

  beforeEach(() => {
    store = initStore()
    actionCreatorFunctions = cloneOnlyFunctions(actionCreators)
  })

  it('wraps the action creators with the dispatch function', () => {
    const boundActionCreators = bindActionCreators(actionCreators, store.dispatch)
    expect(
      Object.keys(boundActionCreators)
    ).toEqual(
      Object.keys(actionCreatorFunctions)
    )

    const action = boundActionCreators.addTodo('Hello')
    expect(action).toEqual(
      actionCreators.addTodo('Hello')
    )
    expect(store.getState()).toEqual([
      { id: 1, text: 'Hello' }
    ])
  })

  it('skips non-function values in the passed object', () => {
    const boundActionCreators = bindActionCreators({
      ...actionCreators,
      foo: 42,
      bar: 'baz',
      wow: undefined,
      much: {},
      test: null
    }, store.dispatch)
    expect(
      Object.keys(boundActionCreators)
    ).toEqual(
      Object.keys(actionCreatorFunctions)
    )
  })

  it('supports wrapping a single function only', () => {
    const actionCreator = actionCreators.addTodo
    const boundActionCreator = bindActionCreators(actionCreator, store.dispatch)

    const action = boundActionCreator('Hello')
    expect(action).toEqual(actionCreator('Hello'))
    expect(store.getState()).toEqual([
      { id: 1, text: 'Hello' }
    ])
  })
})
