class IterableHookInfo {
  constructor(name, iterator) {
    this._name = name;
    this._iterator = iterator;
  }

  get name() {
    return this._name;
  }

  *[Symbol.iterator]() {
    yield* this._iterator;
  }
}

export default IterableHookInfo;
