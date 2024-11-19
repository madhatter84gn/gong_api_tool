export const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

export const tap = (fn) => (value) => {
  fn(value);
  return value;
};

export const tryCatch =
  (tryFn, catchFn) =>
  async (...args) => {
    try {
      return await tryFn(...args);
    } catch (error) {
      return catchFn(error);
    }
  };
