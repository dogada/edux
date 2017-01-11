/* global describe, expect, it */

import { createStore } from 'redux'
import { createReducer } from '../src'
import * as changes from './helpers/changes'

function initStore (preloadedState) {
  const futureDispatch = (action) => store.dispatch(action)
  const futureGetState = () => store.getState()
  const reducer = createReducer(changes, futureDispatch, futureGetState)
  const store = createStore(reducer, preloadedState)
  return store
}

describe('createStore', () => {
  it('should restore simple state from initial value', () => {
    const store = initStore([{id: 1, text: 'Default'}])
    expect(store.getState()).toEqual([
      { id: 1, text: 'Default' }
    ])
  })

  it('should restore nested state from initial value', () => {
    const store = initStore({
      todos: [{id: 2, text: 'Default'}]
    })
    expect(store.getState()).toEqual({
      todos: [{ id: 2, text: 'Default' }]
    })
  })

  it('should restore 2-level state from initial value', () => {
    const store = initStore({
      app: {
        id: 42,
        todos: [{id: 3, text: 'Default'}]
      }
    })
    expect(store.getState()).toEqual({
      app: {
        id: 42,
        todos: [{ id: 3, text: 'Default' }]
      }
    })
  })
})
