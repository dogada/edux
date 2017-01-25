# Edux is Redux without (R)epetition

Edux is DRY version of Redux. Edux allows to manage state of Javascript appications writing less code and still have full compatibility with Redux ecosystem, i.e. use Redux DevTools in browser.

You don't need to add constants and share them between actions and reducers. You even don't need to write actions and reducer &mdash; Edux generates them from `changes` files.

Edux and Redux works well together. Redux state is single source of truth on data level. Edux changes are single source of truth on logic level.

Edux processes actions with O(1) speed instead of Redux's O(N) where N is number of reducers.

Bellow is an example of using Edux's changes for creating standard Redux store:

```js
// changes.js
import { actionCreator } from 'edux'

export const DEFAULT_STATE = []

export function addTodo (state, text) {
  return [...state, {id: nextId(state), text}]
}

export function addTodoAsync (state, text) {
  return dispatch => setTimeout(() => {
    dispatch(actionCreator(addTodo)(text))
  }, 1000)
}


// index.js
import { createStore } from 'redux'
import { createActions, createReducer } from 'edux'

import * as changes from './changes'
const { addTodo, addTodoAsync } = createActions(changes)

const futureDispatch = (action) => store.dispatch(action)
const futureGetState = () => store.getState()
const reducer = createReducer(changes, futureDispatch, futureGetState)
const store = createStore(reducer, preloadedState, enhancer)

render(
  <Provider store={store}>
    <App addAction={ addTodoAsync } />
  </Provider>,
  document.getElementById('root')
)
```

Full example of Edux and Redux integration you can see in [examples/async](examples/async/src) folder. This example is ported from the official  [Redux's example](https://github.com/reactjs/redux/tree/d5d1572cba55942d571b4b52cd12e5045142b9ff/examples/async/src), so you can compare both implementations.

### Examples

* [Async](https://dogada.github.io/edux/) ([source](examples/async))


### Installation

To install the stable version:

```
npm install --save edux
```

The Redux source code is written in ES2015 but we precompile both CommonJS and UMD builds to ES5 so they work in [any modern browser](http://caniuse.com/#feat=es5).


You can use Edux together with [React](https://facebook.github.io/react/), or with any other view library.  
It is tiny (1kB, including dependencies).


### License

MIT
