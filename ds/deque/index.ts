import { Base } from "dubc-ds-base"


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
    this.#f = undefined
    this.#l = undefined
    this.#s = 0
    this.fire({cleared:sz})
  }

  replace(i:Iterable<T>) {
    this.#f = undefined
    this.#l = undefined
    this.#s = 0
    for (const x of i) this.#rawPush(x)
    this.fire({added:{items:this, at:0}})
  }

}