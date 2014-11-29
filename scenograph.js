import Transition from './transition';
import { none } from './symbols';

class Scenograph {
  constructor(initial, states) {
    this._root = new State(none, null, {
      handler: new DefaultHandler(),
      children: states
    });

    this._history = [this._root];
    this._currentIndex = 0;

    this.transition = null;

    this._queue = [];

    this.push(initial);
  }

  get current() {
    return this._history[this._currentIndex];
  }

  previous() {
    return this._currentIndex < 1 ? null :
      this._history[this._currentIndex - 1];
  }

  next() {
    return this._currentIndex > this._history.length - 2 ? null :
      this._history[this._currentIndex + 1];
  }

  go(path, options) {
    let current = this.current;
    let next = this.state(path);

    if (this.transition && !this.transition.done && !this.transition.canceled) {
      if (options && options.force) {
        this.transition.cancel();
      } else {
        return Promise.reject(new Error(`A transition from '${ this.transition.from.path }' to '${ this.transition.to.path }' is already in progress. You should use 'Scenograph#defer()' to schedule a new transition after the current one.`));
      }
    }

    this.transition = new Transition(current, next);

    return this.transition.promise;
  }

  push(path, options) {
    let onTransitionCompleted = () => {
      let next = this._currentIndex + 1;
      let tail = this._history.length - next;

      this._history.splice(next, tail, this.transition.to);
      this._currentIndex = next;

      this._unqueue();
    };

    return this.go(path, options).then(onTransitionCompleted);
  }

  back(options) {
    let state = this.previous();
    let onTransitionCompleted = () => {
      this._currentIndex -= 1;
      this._unqueue();
    };

    return state ? this.go(state.path.fragments, options).then(onTransitionCompleted) :
      Promise.reject(new Error(`There is no state to go back`));
  }

  forward(options) {
    let state = this.next();
    let onTransitionCompleted = () => {
      this._currentIndex += 1;
      this._unqueue();
    };

    return state ? this.go(state.path.fragments, options).then(onTransitionCompleted) :
      Promise.reject(new Error(`There is no state to go forward`));
  }

  defer(callback) {
    var deferred = {};

    deferred.promise = new Promise((resolve) => {
      deferred.resolve = resolve;
    });

    if (this.transition && this.transition.done) deferred.resolve();
    else this._queue.push(deferred);

    return deferred.promise.then(() => {
      return typeof callback === `function` ? callback() : this.push(callback);
    });
  }

  states() {
    return this._root.children;
  }

  state(fragments) {
    if (!Array.isArray(fragments)) fragments = [fragments];

    return fragments.reduce((current, name, index) => {
      let next = current.children[name];

      if (next) return next;
      else throw new Error(`Unknown state at '${ new Path(fragments.slice(0, index + 1)) }'`);
    }, this._root);
  }

  _unqueue() {
    if (this._queue.length === 0) return;
    if (this.transition && !this.transition.done) return;

    let deferred = this._queue.shift();

    deferred.promise.then(() => this._unqueue());
    deferred.resolve();
  }
}

class State {
  constructor(name, parent, config) {
    this.name = name;
    this.parent = parent;

    if (config instanceof DefaultHandler) {
      this.handler = config;
      this.children = {};
    } else {
      this.handler = config.handler;
      this.children = {};

      for (let key in config.children) {
        this.children[key] = new State(key, this, config.children[key]);
      }
    }
  }

  get path() {
    let fragments = [this.name];
    let current = this;

    while ((current = current.parent)) {
      if (current.name !== none) {
        fragments.unshift(current.name);
      }
    }

    return new Path(fragments);
  }
}

class Path {
  constructor(fragments) {
    this.fragments = fragments;
  }

  toString() {
    return this.fragments.map((fragment) => fragment.toString()).join(` > `);
  }
}

class DefaultHandler {
  onBeforeEnter() {}
  onAfterEnter() {}
  onBeforeLeave() {}
  onAfterLeave() {}
}

export default Scenograph;
export { DefaultHandler };
