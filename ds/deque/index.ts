import { Base, DSEvent } from "dubc-ds-base"


interface Node<T> {
  v:T
  p?:Node<T>
  n?:Node<T>
}

export class Deque<T> extends Base<T> {

  #f?:Node<T>
  #l?:Node<T>
  #s = 0

  constructor() {
    super()
  }

  static of<T>(...a:T[]) {
    const r = new Deque<T>()
    for (const x of a) r.push(x)
    return r
  }

  toEmpty() {
    return new Deque<T>()
  }

  get size() {
    return this.#s
  }

  get first() {
    return this.#f?.v
  }

  get last() {
    return this.#l?.v
  }

  get only() {
    if (this.#s !== 1) throw new Error("expected only 1 value")
    return this.#f!.v
  }

  *[Symbol.iterator]() {
    for (let n = this.#f; n !== undefined; n = n.n) yield n.v
  }

  *reversed() {
    for (let n = this.#l; n !== undefined; n = n.p) yield n.v
  }

  push(v:T) {
    this.#rawPush(v)
    this.fire({added:{items:[v], at:this.#s - 1}})
  }

  #rawPush(v:T) {
    this.#s++
    if (this.#l === undefined) {
      this.#f = {v}
      this.#l = this.#f
    } else {
      this.#l.n = {p:this.#l, v}
      this.#l = this.#l.n
    }
  }

  pop():T|undefined {
    if (this.#s === 0) return
    this.#s--
    const r = this.#l!.v
    if (this.#s === 0) {
      this.#l = undefined
      this.#f = undefined
      this.fire({deleted:{items:[r], at:0}})
    } else {
      this.#l = this.#l!.p!
      this.#l.n = undefined
      this.fire({deleted:{items:[r], at:this.#s}})
    }
    return r
  }

  unshift(v:T) {
    this.#s++
    if (this.#f === undefined) {
      this.#f = {v}
      this.#l = this.#f
      this.fire({added:{items:[v], at:0}})
    } else {
      this.#f.p = {n:this.#f, v}
      this.#f = this.#f.p
      this.fire({added:{items:[v], at:0}})
    }    
  }

  shift():T|undefined {
    if (this.#s === 0) return
    this.#s--
    const r = this.#f!.v
    if (this.#s === 0) {
      this.#l = undefined
      this.#f = undefined
      this.fire({deleted:{items:[r], at:0}})
    } else {
      this.#f = this.#f!.n!
      this.#f.p = undefined
      this.fire({deleted:{items:[r], at:0}})
    }
    return r
  }

  clear() {
    const sz = this.#s
    if (sz === 0) return false
    this.#f = undefined
    this.#l = undefined
    this.#s = 0
    this.fire({cleared:sz})
    return true
  }

  replace(i:Iterable<T>) {
    const sz = this.#s
    this.#f = undefined
    this.#l = undefined
    this.#s = 0
    let added = false
    for (const x of i) {
      added = true
      this.#rawPush(x)
    }
    if (!added && sz === 0) return false
    const evt:DSEvent<T> = {}
    if (sz > 0) evt.cleared = sz
    if (added) evt.added = {items:this, at:0}
    this.fire(evt)
    return true
  }

  drop(f:(x:T)=>boolean) {
    let p:Node<T>|undefined
    let i = 0
    let c = 0
    for (let n = this.#f; n !== undefined; n = n.n) {
      if (f(n.v)) {
        c++
        this.#s--
        if (p === undefined) {
          this.#f = n.n
        } else {
          p.n = n.n
        }
        if (n.n) n.n.p = p
        if (n === this.#l) this.#l = p
        this.fire({deleted:{items:[n.v], at:i}})
        i--
      }
      p = n
      i++
    }
    return c > 0
  }

}