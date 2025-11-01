import { Base, DSEvent } from "dubc-ds-base"

export class NSet<T> extends Base<T> {

  private set = new Set<T>()

  constructor(i?:Iterable<T>) {
    super()
    if (i) this.addAll(i)
  }

  static of<T>(...items:T[]) {
    return new NSet(items)
  }

  get size() { return this.set.size }
  [Symbol.iterator]() { return this.set[Symbol.iterator]() }

  toEmpty() { return new NSet<T>() }

  has(x:T) {
    return this.set.has(x)
  }

  hasAll(i:Iterable<T>) {
    const s = this.set
    for (const x of i) {
      if (!s.has(x)) return false
    }
    return true
  }

  add(x:T) {
    const s = this.set
    if (s.has(x)) return false
    s.add(x)
    this.set.add(x)
    this.fire({added:{items:[x], at:s.size-1}})
    return true
  }

  addAll(i:Iterable<T>) {
    let r = false
    for (const x of i) r = this.add(x) || r
    return r
  }

  delete(x:T) {
    const r = this.set.delete(x)
    if (r) this.fire({deleted:{items:[x]}})
    return r
  }

  deleteAll(i:Iterable<T>) {
    let r = false
    for (const x of i) r = this.delete(x) || r
    return r
  }

  drop(f:(x:T)=>boolean) {
    let i = 0;
    let c = 0
    for (const x of this.set) {
      if (f(x)) {
        c++
        this.set.delete(x)
        this.fire({deleted:{items:[x], at:i}})
      }
      i++
    }
    return c
  }

  clear() {
    const sz = this.set.size
    if (sz === 0) return false
    this.set.clear()
    this.fire({cleared:sz})
    return true
  }

  replace(i:Iterable<T>) {
    const sz = this.set.size
    this.set.clear()
    for (const x of i) this.set.add(x)
    const evt:DSEvent<T> = {added:{items:i, at:0}}
    if (sz > 0) evt.cleared = sz
    this.fire(evt)
  }

}