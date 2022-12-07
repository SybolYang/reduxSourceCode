/*
在redux中,核心api是createStored对象
1.createStore接收三个参数
第一个：reducer函数，用于根据action处理逻辑并返回最新状态state
第二个：preLoadedState,预存储状态state
第三个：enhancer，对store功能进行增加,必须由createStore的调用者传入
        applyMiddleware,中间件，目的是为了增强dispatch能力

2.createStored返回三个参数
{ 
    getState,//获取状态
    dispatch,//发起action
    subscribe //订阅状态,多个地方可被调用
}
*/

//创建store
function createStore(reducer, preLoadedState, enhancer) {
  //约束reducer参数类型
  if (typeof reducer !== 'function') throw new Error('reducer参数必须为函数')
  //判断enhancer参数有无传递
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('enhancer必须是函数')
    }
    return enhancer(createStore)(reducer, preLoadedState)
  }
  //获取预存储状态
  var currentState = preLoadedState
  //存储subscribe数组队列
  var currentListeners = []
  //获取状态
  function getState() {
    return currentState
  }
  //触发action
  function dispatch(action) {
    //判断action是否是对象
    //console.log(action)
    if (isPlainObject(action) === false) throw new Error('action必须为对象')
    //判断action中是否有type字段
    if (action.type === undefined) throw new Error('action对象必须有type字段')
    currentState = reducer(currentState, action) //获取reducer处理后的状态
    for (var i = 0; i < currentListeners.length; i++) {
      //获取订阅者
      var listener = currentListeners[i]
      //调用订阅者
      listener()
    }
  }
  //订阅状态
  function subscribe(listener) {
    currentListeners.push(listener)
  }
  return {
    getState,
    dispatch,
    subscribe,
  }
}
//判断object是否是对象
function isPlainObject(object) {
  //基本数据类型&&null排除在外
  if (typeof object !== 'object' || object === null) return false
  //区分数组和对象
  if (Object.prototype.toString.call(object) === '[object Object]') {
    return true
  }
  return false
}

//实现中间件
function applyMiddleware(...middlewares) {
  return function (createStore) {
    return function (reducer, preLoadedState) {
      //创建store
      var store = createStore(reducer, preLoadedState)
      //简易版store
      var middlewareAPI = {
        getState: store.getState,
        dispatch: store.dispatch,
      }
      //调用中间件的第一层函数
      var chain = middlewares.map((middleware) => middleware(middlewareAPI))
      var dispatch = compose(...chain)(store.dispatch)
      return {
        ...store,
        dispatch,
      }
    }
  }
}

function compose() {
  var funcs = [...arguments]
  console.log(funcs)
  return function (dispatch) {
    for (var i = funcs.length - 1; i >= 0; i--) {
      dispatch = funcs[i](dispatch)
    }
    return dispatch
  }
}

//实现bindActionCreators
function bindActionCreators(actionCreators, dispatch) {
  var boundActionsCreators = {}
  for (const i in actionCreators) {
    boundActionsCreators[i] = function () {
      dispatch(actionCreators[i]())
    }
  }
  return boundActionsCreators
}

//实现combineReducers,把处理逻辑的单个reducer函数在第一个参数的位置传入，判断是否为函数，第二个参数传入state, action，期待得到新的state
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers)
  for (let i = 0; i < reducerKeys.length; i++) {
    // console.log(reducerKeys, key, reducers[key])
    const key = reducerKeys[i]
    if (typeof reducers[key] !== 'function')
      throw new Error('reducer必须是一个函数')
  }
  return function (state, action) {
    const nextState = {}
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i]
      const reducer = reducers[key]
      const previousStateForKey = state[key]
      nextState[key] = reducer(previousStateForKey, action)
    }
    return nextState
  }
}
