/**
 * Converts a generator function into an iterable.
 * 
 * Generator functions already have a `Symbol.iterator`, but it 
 * can only be used once. This function returns an iterable that
 * can be used multiple times.
 */
export function iterable<T>(g:()=>Iterator<T>):Iterable<T> {
  return {[Symbol.iterator]() { return g() }}
}

function *m<T,R>(i:Iterable<T>, f:(x:T)=>R) {
  for (const x of i) yield f(x)
}

/**
 * Applies the given function to each element of the given iterable.
 * 
 * Unlike `Array.map`, this function doesn't allocate any storage;
 * changes to the given iterable will be reflected in the returned
 * iterable.
 * 
 * The returned iterable can be used multiple times.
 */
export function map<T,R>(i:Iterable<T>, f:(x:T)=>R):Iterable<R> {
  return iterable(() => m(i,f))
}

function *f<T>(i:Iterable<T>, f:(x:T)=>boolean) {
  for (const x of i) if (f(x)) yield x
}

/**
 * Filters the given iterable with the given predicate.
 * 
 * Unlike `Array.filter`, this function doesn't allocate any storage;
 * changes to the given iterable will be reflected in the returned
 * iterable.
 * 
 * The returned iterable can be used multiple times.
 */
export function filter<T>(i:Iterable<T>, p:(x:T)=>boolean):Iterable<T> {
  return iterable(() => f(i, p))
}

/**
 * Reduces an iterable to a scalar.
 * 
 * This is similar to `Array.reduce`, but the accumulator is passed
 * before the reduce function.
 */
export function reduce<A,T>(i:Iterable<T>, a:A, f:(a:A, x:T)=>A):A {
  for (const x of i) a = f(a, x)
  return a
}

/**
 * The first element of the iterable, or undefined if the iterable
 * has no elements.
 */
export function first<T>(i:Iterable<T>) {
  for (const x of i) return x
  return
}

/**
 * The last element of the iterable, or undefined if the iterable
 * has no elements. Note that for non-arrays, this function is O(n).
 */
export function last<T>(i:Iterable<T>) {
  if (Array.isArray(i)) {
    return i.length > 0 ? i[i.length - 1] : undefined
  }
  let r:T|undefined
  for (const x of i) r = x
  return r
}

/**
 * The only element of the iterable. Throws an error if the iterable
 * does not have exactly one element.
 */
export function only<T>(i:Iterable<T>) {
  let r:T|undefined
  for (const x of i) {
    if (r !== undefined) throw new Error("more than one element")
    r = x
  }
  if (r === undefined) throw new Error("no elements")
  return r
}

/**
 * True if the iterable has the given element.
 */
export function has<T>(i:Iterable<T>, v:T) {
  for (const x of i) if (x === v) return true
  return false
}