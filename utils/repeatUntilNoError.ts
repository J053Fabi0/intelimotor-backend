import sleep from "./sleep";

export default async function repeatUntilNoError<T>(
  cb: (() => T) | (() => Promise<T>),
  maxRetries = -1,
  awaitTimeBetweenRetries = 100,
  onCatch?: (error: unknown, i: number) => void
) {
  let i = 0;
  let error: unknown;
  let result: T | Promise<T> = undefined as unknown as T;

  do {
    try {
      result = cb();

      if (result instanceof Promise) result = await result;

      return result;
    } catch (e) {
      error = e;
      onCatch?.(e, i);
      await sleep(awaitTimeBetweenRetries);
    } finally {
      i++;
    }
  } while ((maxRetries < 0 ? -Infinity : i) <= maxRetries);

  if ((maxRetries < 0 ? -Infinity : i) <= maxRetries) throw error;

  return result;
}
