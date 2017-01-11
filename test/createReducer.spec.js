/* global describe, expect, it */

import { createReducer, createActions } from '../src'

describe.only('createReducer', () => {
  it('supports changes with single level of nesting and primitive state without default value', () => {
    const changes = {
      increment: (state) => state + 1,
      decrement: (state) => state - 1
    }
    const actions = createActions(changes)
    const reducer = createReducer(changes)
    const s0 = reducer(undefined, {type: '@@INIT'})
    expect(s0).toEqual(undefined)
    const s1 = reducer(1, {type: '@@INIT'})
    expect(s1).toEqual(1)

    const s2 = reducer(s1, actions.increment())
    expect(s2).toEqual(2)
    const s3 = reducer(s2, actions.decrement())
    expect(s3).toEqual(1)
  })

  it('supports changes with single level of nesting and default value', () => {
    const changes = {
      defaultState: 42,
      increment: (state) => state + 1,
      decrement: (state) => state - 1
    }
    const actions = createActions(changes)
    const reducer = createReducer(changes)
    const s0 = reducer(undefined, {type: '@@INIT'})
    expect(s0).toEqual(42)
    const s1 = reducer(s0, actions.increment())
    expect(s1).toEqual(43)
    const s2 = reducer(s1, actions.decrement())
    expect(s2).toEqual(42)
  })

  it('supports composite reducer with and without default state', () => {
    const changes = {
      counter: {
        defaultState: 0,
        increment: (state) => state + 1
      },
      stack: {
        push: (state = [], value) => [ ...state, value ]
      }
    }
    const reducer = createReducer(changes)
    const actions = createActions(changes)
    const s0 = reducer({}, {type: '@@INIT'})
    expect(s0).toEqual({counter: 0})
    const s1 = reducer(s0, actions.counter.increment())
    expect(s1).toEqual({counter: 1})
    const s2 = reducer(s1, actions.stack.push('a'))
    expect(s2).toEqual({ counter: 1, stack: [ 'a' ] })
    const s3 = reducer(s2, actions.stack.push('b'))
    expect(s3).toEqual({ counter: 1, stack: [ 'a', 'b' ] })
  })

  it('returns a composite reducer that maps the state keys to given changes', () => {
    const changes = {
      counter: {
        increment: (state = 0) => state + 1
      },
      stack: {
        push: (state = [], value) => [ ...state, value ]
      }
    }
    const reducer = createReducer(changes)
    const actions = createActions(changes)
    const s0 = reducer({}, {type: '@@INIT'})
    expect(s0).toEqual({})
    const s1 = reducer(s0, actions.counter.increment())
    expect(s1).toEqual({counter: 1})
    const s2 = reducer(s1, actions.stack.push('a'))
    expect(s2).toEqual({ counter: 1, stack: [ 'a' ] })
  })

  it('ignores all props which are not a function', () => {
    const reducer = createReducer({
      fake: true,
      broken: 'string',
      another: { nested: 'object' },
      stack: (state = []) => state
    })

    const s0 = reducer({ }, { type: '@@INIT' })
    // there is no stack because no defaultValue
    expect(s0).toEqual({ })
  })

  it('ignores all props which are not a function but handles defaultState', () => {
    const reducer = createReducer({
      fake: true,
      broken: 'string',
      another: { nested: 'object' },
      defaultState: [1, 2, 3],
      push: (state, value) => [...state, value]
    })

    const s0 = reducer(undefined, { type: '@@INIT' })
    expect(s0).toEqual([1, 2, 3])
    // defaultState should not overwrite preloadedState
    const s1 = reducer([7], { type: '@@INIT' })
    expect(s1).toEqual([7])
  })

  it('should return same state if action is unknown', () => {
    const changes = {
      counter: {
        increment: (state = 0) => state + 1
      }
    }
    const reducer = createReducer(changes)
    const s0 = reducer({'other': 'value'}, {type: '@@UNKNOWN'})
    expect(s0).toEqual({'other': 'value'})
  })

  it('should never return undefined for primitive defaultState', () => {
    const changes = {
      defaultState: 0,
      increment: (state) => state + 1
    }
    const reducer = createReducer(changes)

    const s0 = reducer(undefined, {type: '@@INIT'})
    expect(s0).toEqual(0)
    const s1 = reducer(undefined, {type: '@@RANDOM'})
    expect(s1).toEqual(0)
  })

  it('should never return undefined when defaultState is object', () => {
    const changes = {
      counter: {
        defaultState: 0,
        increment: (state) => state + 1
      }
    }
    const reducer = createReducer(changes)

    const s0 = reducer(undefined, {type: '@@INIT'})
    expect(s0).toEqual({counter: 0})
    const s1 = reducer(undefined, {type: '@@RANDOM'})
    expect(s1).toEqual({counter: 0})
  })
})
