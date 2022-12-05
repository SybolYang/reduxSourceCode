/*
在redux中,核心api是createStored对象
1.createStore接收三个参数
第一个：reducer函数，用于根据action处理逻辑并返回最新状态state
第二个：preLoadedState,预存储状态state
第三个：enhancer，对store功能进行增加

2.createStored返回三个参数
{ 
    getState,//获取状态
    dispatch,//发起action
    subscribe //订阅状态,多个地方可被调用
}
*/
function createStore(reducer, preLoadedState) {
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
