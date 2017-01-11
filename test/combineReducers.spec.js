/* global describe, expect, it */

import { createStore, combineReducers } from 'redux'
import { createReducer } from '../src'
import * as changes from './helpers/changes'

describe('combineReducers', () => {
  it('should allow to use together Edux changes and Redux reducers', () => {
    const futureDispatch = (action) => store.dispatch(action)
    const futureGetState = () => store.getState()
    const todos = createReducer(changes, futureDispatch, futureGetState)
    const counter = (state = 0, action) => state
    const reducer = combineReducers({todos, counter})
    const store = createStore(reducer)

    expect(store.getState()).toEqual({
      counter: 0,
      todos: []
    })

    const preloadedStore = createStore(reducer, {
      counter: 42,
      todos: [{id: 5, text: 'Default'}]
    })

    expect(preloadedStore.getState()).toEqual({
      counter: 42,
      todos: [{ id: 5, text: 'Default' }]
    })
  })
})
