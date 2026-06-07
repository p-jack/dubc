const sym = Symbol("Load")

/** A custom element that asynchrously loads its state. */
export interface Loadable extends HTMLElement {

  /** The promise returned after `triggerLoad` is called. */
  readonly loading?:Promise<void>

  /**
   * Triggers the load; typically the last thing you'll call from
   * your custom element's constructor.
   * 
   * You should always trigger the load via this method, and never
   * by calling the `load` method directly, because this method
   * method also notifies the `onLoad` callback, allowing servers
   * to know they should wait for the load to finish before
   * rendering the element for SSR.
   */
  triggerLoad():void

  /**
   * Override to load your element's state.
   */
  load():Promise<void>
}

/** Extends the given class to be Loadable. */
export function Load<T extends HTMLElement>(cls:new()=>T):new()=>T&Loadable {
  // @ts-ignore
  return class extends cls {
    /* v8 ignore next */
    static get [sym]() { return true }

    #loading?:Promise<void>
    get loading() { return this.#loading }

    triggerLoad() {
      this.#loading = this.load()
      callback(this)
    }

    async load() {
      throw new Error("unimplemented")
    }

  } as unknown as new()=>T&Loadable
}

/** Returns true of the given element is Loadable. */
export function loadable(el:HTMLElement):el is Loadable {
  return sym in el.constructor
}


function defaultCallback(el:Loadable) {
  el.loading!.catch(e => console.error(`${el.constructor.name}.load() error:`, e))
}

let callback = defaultCallback

/**
 * Registers a function to be called every time a load is triggered
 * via `Loadable.triggerLoad()`.
 * 
 * By default, the callback simply logs any errors to the console.
 */
export function onLoad(f:(el:Loadable)=>void) {
  callback = f
}

/**
 * Resets the `onLoad` callback to the default behavior, which 
 * simply logs any errors to the console.
 */
export function reset() {
  callback = defaultCallback
}