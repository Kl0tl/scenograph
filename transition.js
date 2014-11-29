import { abort } from './symbols';

class Transition {
  constructor(from, to) {
    this.from = from;
    this.to = to;

    this.pending = Promise.resolve();

    this._done = false;
    this._canceled = false;

    this._reject = null;
    this._resume = null;

    this.promise = new Promise((resolve, reject) => {
      this.pending
        .then(() => this.from.handler.onBeforeLeave(this.to))
        .then((value) => {
          if (value === abort) throw new Error(`Transition aborted by the '${ this.from.path }' state`);
          return this.pending.then(() => this.to.handler.onBeforeEnter(this.from));
        })
        .then((value) => {
          if (value === abort) throw new Error(`Transition aborted by the '${ this.to.path }' state`);
          return this.pending.then(() => this.from.handler.onAfterLeave());
        })
        .then((meta) => this.pending.then(() => this.to.handler.onAfterEnter(meta)))
        .then(() => (this._done = true, resolve()), (err) => this._reject(err));

      this._reject = (err) => {
        this._canceled = true;
        reject(err);
      };
    });
  }

  get done() {
    return this._done;
  }

  get paused() {
    return Boolean(this._resume);
  }

  get canceled() {
    return this._canceled;
  }

  cancel() {
    if (this._canceled || this._done) return;
    this._reject(new Error(`Transition canceled`));
  }

  pause() {
    if (this._resume) return this._resume;

    this.pending = new Promise((resolve, reject) => {
      this.promise.catch(reject);

      this._resume = () => {
        this._resume = null;
        resolve();
      };
    });

    return this._resume;
  }
}

export default Transition;
