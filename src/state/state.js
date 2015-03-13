import reduce from 'transduce-reduce';

import send from '../common/send';

import DefaultHandler from './default-handler';
import defaultState from './default-state';
import formatPathToString from './format-path-to-string';

class State {
  constructor(name, parent, { handler = new DefaultHandler(), children = {} } = {}) {
    this.name = name;
    this.parent = parent;
    this.handler = handler;

    this.children = Object.keys(children).reduce((tree, key) => {
      return Object.assign(tree, {
        [key]: new State(key, this, children[key])
      });
    }, {});

    if (handler.onRegister) {
      handler.onRegister(this);
    }
  }

  static ancestor(a, b) {
    let parentOfA = a;

    while ((parentOfA = parentOfA.parent)) {
      let parentOfB = b;

      while ((parentOfB = parentOfB.parent)) {
        if (parentOfA === parentOfB) {
          return parentOfA;
        }
      }
    }

    return null;
  }

  get path() {
    const fragments = [];
    let state = this;

    while (state && state.name !== defaultState) {
      fragments.unshift(state.name);
      state = state.parent;
    }

    return Object.defineProperty(this, `path`, {
      value: fragments,
      writable: false,
      configurable: false,
      enumerable: true
    }).path;
  }

  send({ event, payload }) {
    return send(event, payload, this.upward(null));
  }

  isParentOf(child) {
    let state = child;

    while ((state = state.parent)) {
      if (state === this) {
        return true;
      }
    }

    return false;
  }

  *upward(ancestor) {
    if (ancestor && !ancestor.isParentOf(this)) {
      throw new Error(`The state ${ this } is not a child of ${ ancestor }.`);
    }

    for (let state = this; state && state !== ancestor; state = state.parent) {
      yield state;
    }
  }

  *downward(child) {
    if (!this.isParentOf(child)) {
      throw new Error(`The state ${ child } is not a child of ${ this }.`);
    }

    let state = this;

    for (let i = this.path.length; i < child.path.length; i += 1) {
      yield (state = state.children[child.path[i]]);
    }
  }

  toString() {
    return this.name === defaultState ?
      `DefaultState` : formatPathToString(this.path);
  }
}

export default State;
