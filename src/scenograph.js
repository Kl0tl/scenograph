import reduce from 'transduce-reduce';

import DefaultHandler from './state/default-handler';
import defaultState from './state/default-state';
import formatPathToString from './state/format-path-to-string';
import State from './state/state';
import StatesHistory from './state/states-history';
import Transition from './transition/transition';
import TransitionCanceledError from './transition/transition-canceled-error';

class Scenograph {
  constructor(states) {
    this._tree = new State(defaultState, null, {
      handler: new DefaultHandler(),
      children: states
    });

    this._history = new StatesHistory([this._tree]);
    this._deferredTransitions = [];
    this._transition = null;
  }

  get current() {
    return this._history.current;
  }

  get previous() {
    return this._history.previous;
  }

  get next() {
    return this._history.next;
  }

  get transition() {
    return this._transition;
  }

  go(path, { defer = false, force = false, loud = false } = {}) {
    const startTransition = () => {
      const current = this.current;
      const next = this.state(path);

      if (next === current) {
        return Promise.reject(new Error(`The destination state must be different from the current state.`));
      }

      const transition = new Transition(current, next);

      const onTransitionCompleted = () => {
        setTimeout(() => this._startNextDeferredTransition(), 0);
      };
      const onTransitionCanceled = (reason) => {
        if (loud) this._cancelAllDeferredTransitions();
        else this._startNextDeferredTransition();
        throw reason;
      };

      this._transition = transition;

      return transition.start().then(onTransitionCompleted, onTransitionCanceled);
    };

    if (this.transition && !this.transition.isDone && !this.transition.isCanceled) {
      if (defer) {
        if (force) this._cancelAllDeferredTransitions();
        return new Promise((resolve, reject) => {
          this._deferTransition(resolve, reject);
        }).then(startTransition);
      } else if (force) {
        return this.transition.cancel().then(startTransition);
      } else {
        return Promise.reject(new Error(`A transition from '${ this.transition.from }' to '${ this.transition.to }' is already in progress.`));
      }
    } else {
      return startTransition();
    }
  }

  push(path, options) {
    return this.go(path, options).then(() => this._history.push(this.transition.to));
  }

  back(options) {
    const state = this.previous;

    if (state) {
      return this.go(state.path, options).then(() => this._history.back());
    }

    return Promise.reject(new Error(`There is no state to go back.`));
  }

  forward(options) {
    const state = this.next;

    if (state) {
      return this.go(state.path, options).then(() => this._history.forward());
    }

    return Promise.reject(new Error(`There is no state to go forward.`));
  }

  state(path) {
    const fragments = [];

    return reduce((current, fragment) => {
      const next = current.children[fragment];

      fragments.push(fragment);

      if (next) return next;

      throw new Error(`Unknown state '${ formatPathToString(fragments) }'.`);
    }, this._tree, path);
  }

  states() {
    return this._tree.children;
  }

  _deferTransition(resolve, reject) {
    this._deferredTransitions.push({ resolve, reject });
  }

  _startNextDeferredTransition() {
    if (this._deferredTransitions.length) {
      this._deferredTransitions.shift().resolve();
    }
  }

  _cancelAllDeferredTransitions() {
    while (this._deferredTransitions.length) {
      this._deferredTransitions.shift().reject(new TransitionCanceledError());
    }
  }
}

export default Scenograph;

export { DefaultHandler };
