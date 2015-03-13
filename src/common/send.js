function send(iterable, event, payload) {
  return reduce((promise, state) => {
    if (state.handler[event]) {
      return promise.then(() => {
        return state.handler[event](payload);
      });
    } else {
      return promise;
    }
  }, Promise.resolve(), iterable);
}

export default send;
