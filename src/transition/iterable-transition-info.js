import State from '../state/state';

import IterableHookInfo from './iterable-hook-info';

class IterableTransitionInfo {
  constructor(from, to) {
    const commonAncestor = State.ancestor(from, to);
    const states = [];

    this._onBeforeExit = new IterableHookInfo(`onBeforeExit`,
      decorate(from.upward(commonAncestor)));

    this._onBeforeEnter = new IterableHookInfo(`onBeforeEnter`,
      decorate(commonAncestor ? commonAncestor.downward(to) : [to]));

    this._onAfterExit = new IterableHookInfo(`onAfterExit`,
      from.upward(commonAncestor));

    this._onAfterEnter = new IterableHookInfo(`onAfterEnter`,
      commonAncestor ? commonAncestor.downward(to) : [to]);

    this._states = states;
    this._hook = null;

    function* decorate(iterator) {
      for (const value of iterator) {
        states.unshift(value);
        yield value;
      }
    }
  }

  get hook() {
    return this._hook;
  }

  *hooks() {
    yield this._onBeforeExit;
    yield this._onBeforeEnter;
    yield this._onAfterExit;
    yield this._onAfterEnter;
  }

  *states() {
    yield* this._states;
  }

  [Symbol.iterator]() {
    for (const hook of this.hooks()) {
      yield* (this._hook = hook);
    }
  }
}

export default IterableTransitionInfo;
