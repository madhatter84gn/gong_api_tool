import ora from "ora";

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

export const createAsyncFunction =
  (fn) =>
  async (...args) =>
    fn(...args);

export const withSpinner =
  (message) =>
  (fn) =>
  async (...args) => {
    const spinner = ora(message).start();
    try {
      const result = await fn(...args);
      spinner.succeed("Operation completed successfully");
      return result;
    } catch (error) {
      spinner.fail("Operation failed");
      throw error;
    }
  };
