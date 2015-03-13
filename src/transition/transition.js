import reduce from 'transduce-reduce';

import send from '../common/send';
import State from '../state/state';

import Cancelation from './cancelation';
import TransitionCanceledError from './transition-canceled-error';
import IterableTransitionInfo from './iterable-transition-info';

class Transition {
  constructor(from, to) {
    this._from = from;
    this._to = to;

    this._iterable = null;

    this._isDone = false;
    this._isPaused = false;
    this._isStarted = false;
    this._isCanceled = false;

    this._metadata = {};

    this._cancelation = null;
    this._onCancelationPromiseResolved = null;

    this._pausedPromise = null;
    this._onPausedPromiseResumed = null;
    this._onPausedPromiseCanceled = null;
  }

  get from() {
    return this._from;
  }

  get to() {
    return this._to;
  }

  get isDone() {
    return this._isDone;
  }

  get isPaused() {
    return this._isPaused;
  }

  get isStarted() {
    return this._isStarted;
  }

  get isCanceled() {
    return this._isCanceled;
  }

  get metadata() {
    return this._metadata;
  }

  get cancelation() {
    return this._cancelation;
  }

  start() {
    if (this.isStarted) {
      return Promise.reject(new Error(`A transition can’t be started more than once.`));
    }

    const iterable = new IterableTransitionInfo(this.from, this.to);

    this._iterable = iterable;

    const promise = reduce((promise, state) => {
        const name = iterable.hook.name;

        if (!state.handler[name]) {
          return promise;
        }

        return promise.then(() => {
          if (this.isPaused) {
            return this._pausedPromise.then(() => state.handler[name](this));
          } else if (this.cancelation) {
            throw this.cancelation.reason;
          } else {
            return state.handler[name](this);
          }
        });
      }, Promise.resolve(), iterable)
      .then(() => this._isDone = true, (reason) => {
        if (this.cancelation) {
          this._resolveCancelationPromise();
        } else {
          this._cancelation = new Cancelation(reason);
        }

        return this.send({ event: `onTransitionCanceled`, payload: this })
          .then(() => { this._isCanceled = true; throw reason },
            (newReason) => { this._isCanceled = true; throw newReason });
      });

    this._isStarted = true;

    return promise;
  }

  cancel(reason = new TransitionCanceledError()) {
    if (!this.isStarted) {
      return Promise.reject(new Error(`A transition must have been started to be canceled.`));
    }

    if (this.isDone) {
      return Promise.reject(new Error(`A completed transition can’t be canceled.`));
    }

    if (this.cancelation) {
      return Promise.reject(new Error(`A transition can’t be canceled more than once.`));
    }

    this._cancelation = new Cancelation(reason);

    return new Promise((resolve) => {
      this._onCancelationPromiseResolved = resolve;
    });
  }

  retry() {
    if (!this.isCanceled) {
      return Promise.reject(new Error(`A transition must have been canceled to be retried.`));
    }

    this._metadata = {};
    this._isStarted = false;
    this._isCanceled = false;
    this._cancelation = null;

    return this.start();
  }

  pause() {
    if (!this.isStarted) {
      return Promise.reject(new Error(`A transition must be started to be paused.`));
    }

    if (this.isDone) {
      return Promise.reject(new Error(`A completed transition can’t be paused.`));
    }

    if (this.isCanceled) {
      return Promise.reject(this.cancelation.reason);
    }

    if (this.isPaused) {
      return Promise.resolve();
    }

    this._isPaused = true;

    this._pausedPromise = new Promise((resolve, reject) => {
      this._onPausedPromiseResumed = resolve;
      this._onPausedPromiseCanceled = reject;
    });

    return this.send({ event: `onTransitionPaused`, payload: this });
  }

  resume() {
    if (!this.isStarted) {
      return Promise.reject(new Error(`A transition must be started to be resumed.`))
    }

    if (this.isDone) {
      return Promise.reject(new Error(`A completed transition can’t be resumed.`));
    }

    if (this.isCanceled) {
      return Promise.reject(this.cancelation.reason);
    }

    if (!this.isPaused) {
      return Promise.resolve();
    }

    this._isPaused = false;

    this._resumePausedPromise();

    return this.send({ event: `onTransitionResumed`, payload: this });
  }

  toggle() {
    return this[this.isPaused ? `resume` : `pause`]();
  }

  send({ event, payload }) {
    return send(event, payload, this._iterable.states());
  }

  _resolveCancelationPromise() {
    this._onCancelationPromiseResolved();
    this._onCancelationPromiseResolved = null;

    if (this.isPaused) {
      this._cancelPausedPromise();
      this._isPaused = false;
    }
  }

  _resumePausedPromise() {
    this._onPausedPromiseResumed();
    this._onPausedPromiseResumed = null;
    this._onPausedPromiseCanceled = null;
  }

  _cancelPausedPromise() {
    this._onPausedPromiseCanceled();
    this._onPausedPromiseCanceled = null;
  }
}

export default Transition;
