import { actionCreator } from '../../src/index'

export const DEFAULT_STATE = []

function nextId (state) {
  return Math.max(0, ...state.map(todo => todo.id)) + 1
}

export function addTodo (state, text) {
  return [...state, {id: nextId(state), text}]
}

export function addTodoAsync (state, text) {
  return dispatch => setTimeout(() => {
    dispatch(actionCreator(addTodo)(text))
  }, 1000)
}

export function addTodoIfEmpty (state, text) {
  if (!state.length) return addTodo(state, text)
  return state
}

export function dispatchInMiddle (state, boundDispatchFn) {
  boundDispatchFn()
  return state
}

export function throwError (state) {
  throw new Error()
}
