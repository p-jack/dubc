type HETNM = HTMLElementTagNameMap
type Keys = keyof HETNM

const sym = Symbol("QueryShadow")

export class Result {

  constructor(readonly el:Element) {}

  as<K extends Keys>(tag:K):HETNM[K] {
    const elTag = this.el.tagName.toLowerCase()
    if (elTag !== tag) {
      throw new Error(`expected ${tag} but got ${elTag}`)
    }
    return this.el as HETNM[K]
  }

  cast<T extends Element>(cls:new(...args:any[])=>T):T {
    if (this.el instanceof cls) return this.el
    throw new Error(`expected ${cls.name} but got ${this.el.constructor.name}`)
  }

}

export class Results {

  constructor(readonly list:NodeListOf<Element>) {}

  tag<K extends Keys>(tag:K) {
    tag = tag.toUpperCase() as K
    const r:HETNM[K][] = []
    for (const x of this.list) {
      if (x.tagName === tag) r.push(x as HETNM[K])
    }
    return r
  }

  cls<T extends Element>(cls:new(...args:any[])=>T) {
    const r:T[] = []
    for (const x of this.list) {
      if (x instanceof cls) r.push(x)
    }
    return r
  }

}

export interface Queryable extends HTMLElement {
  all<K extends Keys>(tag:K):HETNM[K][]
  only<K extends Keys>(tag:K):HETNM[K]
  byId(id:string):Result
  query(selector:string):Result
  queryAll(selector:string):Results
}


export function QueryShadow<T extends HTMLElement>(cls:new()=>T):new()=>T&Queryable {
  // @ts-ignore
  return class extends cls {

    /* v8 ignore next */
    static get [sym]() { return true }

    get #root() {
      if (this.shadowRoot === null) throw new Error("no shadow root to query")
      return this.shadowRoot
    }

    all<K extends Keys>(tag:K) {
      return [...this.#root.querySelectorAll(tag)]
    }

    only<K extends Keys>(tag:K) {
      const r = this.#root.querySelectorAll(tag)
      if (r.length === 0) throw new Error("no such element: " + tag)
      if (r.length > 1) throw new Error("more than one match: " + tag)
      return r.item(0)
    }

    byId(id:string) {
      const r = this.#root.getElementById(id)
      if (r === null) throw new Error(`no such ID: ${id}`)
      return new Result(r)
    }

    query(selector:string) {
      const r = this.#root.querySelector(selector)
      if (r === null) throw new Error(`no match for selector: ${selector}`)
      return new Result(r)
    }

    queryAll(selector:string) {
      return new Results(this.#root.querySelectorAll(selector))
    }

  } as unknown as new()=>T&Queryable
}

export function queryable(el:HTMLElement):el is Queryable {
  return sym in el.constructor
}
