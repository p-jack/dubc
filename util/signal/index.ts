import { Weakness } from "weakness"

/** A signal. A value whose changes can be observed. */
export interface Signal<T> {
  
  /** The current value of the signal, read-only. */
  readonly value:T
  
  /**
   * Listens for changes to the signal value. The provided callback
   * will be notified immediately with the current value of
   * the signal, and then notified any time the signal value
   * changes.
   * 
   * @return a number that can be sent to `unhear` to stop listening
   */
  hear(keeper:object, f:(nw:T,old:T)=>void):number
  
  /**
   * Stops listening for changes to the signal value.
   * 
   * @param n  the result of the `hear` call to stop
   */  
  unhear(n:number):void
}

/** Emits events when the signal value changes. */
export interface Emit<T> {
  /**
   * The signal's writable value. When this changes, any listeners
   * added to the signal (via `Signal.hear()`) will be notified with
   * the new value and old value. If the value changes to the same
   * value, no notifications occur.
   */
  value:T
}

/** A signal and its emitter. */
export interface SignalPair<T> {
  signal:Signal<T>
  emit:Emit<T>
}

/**
 * Creates a new signal.
 * 
 * @param v  the initial value for the signal
 * @return the signal and its emitter
 */
export function signaled<T>(v:T):SignalPair<T> {
  let value = v
  const weakness = new Weakness<(nw:T,old:T)=>void>()
  return {
    signal: {
      get value() { return value },
      hear(keeper:object, ear:(nw:T, old:T)=>void) {
        const n = weakness.add(keeper, ear)
        ear(value, value)
        return n
      },
      unhear(n:number) {
        weakness.delete(n)
      }
    },
    emit: {
      get value() {
        return value
      },
      set value(n:T) {
        const o = value
        if (o === n) return
        value = n
        for (const x of weakness) {
          x(value, o)
        }
      }
    },
  }
}

/**
 * Convenience to create a signal for an optional value. The initial 
 * value of the returned signal will be `undefined.`
 */
export function osignal<T>():SignalPair<T|undefined> {
  return signaled<T|undefined>(undefined)
}