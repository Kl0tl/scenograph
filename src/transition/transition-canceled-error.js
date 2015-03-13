class TransitionCanceledError extends Error {
  constructor() {
    super(`Transition canceled.`);
    Error.captureStackTrace(this);
  }
}

export default TransitionCanceledError;
