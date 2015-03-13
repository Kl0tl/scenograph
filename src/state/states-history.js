class StatesHistory {
  constructor(iterable = []) {
    this._states = Array.from(iterable);
    this._currentStateIndex = this._states.length - 1;
  }

  get current() {
    return this._states[this._currentStateIndex];
  }

  get previous() {
    return this._states[this._currentStateIndex - 1];
  }

  get next() {
    return this._states[this._currentStateIndex + 1];
  }

  push(value) {
    let nextCurrentIndex = this._currentStateIndex + 1;
    let howManyStatesToRemove = this._states.length - nextCurrentIndex;

    this._states.splice(nextCurrentIndex, howManyStatesToRemove, value);
    this._currentStateIndex = nextCurrentIndex;
  }

  back() {
    this._currentStateIndex = Math.max(0, this._currentStateIndex - 1);
  }

  forward() {
    this._currentStateIndex = Math.min(this._states.length, this._currentStateIndex + 1);
  }

  *[Symbol.iterator]() {
    yield* this._states;
  }
}

export default StatesHistory;
