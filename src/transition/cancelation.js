class Cancelation {
  constructor(reason) {
    this._reason = reason;
  }

  get reason() {
    return this._reason;
  }
}

export default Cancelation;
