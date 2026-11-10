// Optional module loading must settle even if a network request never completes.
export function withDeadline<T>(promise: Promise<T>, milliseconds = 10_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("The optional module took too long to load.")), milliseconds);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}
