import { Base, DSEvent } from "dubc-ds-base"
import { TMap, IN_EX, IN_IN, EX_IN, EX_EX, Include } from "dubc-ds-tmap"

export { IN_EX, IN_IN, EX_IN, EX_EX }
export type { Include }

export interface Conf<K extends {},V extends {}> {
  readonly index:(v:V)=>K
  readonly compare:(a:K,b:K)=>number
}

export class TIndex<K extends {},V extends {}> extends Base<V> {

  private readonly map:TMap<K,V>
  readonly conf:Conf<K,V>

  constructor(i:Iterable<V>, c:Conf<K,V>) {
    super()
    this.conf = c
    this.map = new TMap<K,V>([], {
      compare: c.compare,
      unique: true,
      valueEq: Object.is,
    })
    this.addAll(i)
    this.map.hear(this, evt => {
      const e2:DSEvent<V> = {}
      if (evt.cleared !== undefined) e2.cleared = evt.cleared
      if (evt.deleted !== undefined) {
        e2.deleted = {items:map(evt.deleted.items, x => x.value)}
        if (evt.deleted.at !== undefined) e2.deleted.at = evt.deleted.at
      }
      if (evt.added !== undefined) {
        e2.added = {items:map(evt.added.items, x => x.value)}
        if (evt.added.at !== undefined) e2.added.at = evt.added.at
      }
      this.fire(e2)
    })
  }

  toEmpty() {
    return new TIndex([], this.conf)
  }

  get compare() { return this.map.compare }
  set compare(f:(a:K,b:K)=>number) { this.map.compare = f }

  get first() { return this.map.first?.value }
  get last() { return this.map.last?.value }
  get only() { return this.map.only.value }
  get size() { return this.map.size }

  get(k:K) { return this.map.get(k) }
  has(v:V) { return this.map.has(this.conf.index(v)) }
  hasAll(i:Iterable<V>) {
    return this.map.hasAll(map(i, x => this.conf.index(x)))
  }

  at(i:number) { return this.map.at(i).value }
  rank(v:V) { return this.map.rank(this.conf.index(v)) }

  from(v:V) { return this.map.from(this.conf.index(v))?.value }
  to(v:V) { return this.map.to(this.conf.index(v))?.value }
  before(v:V) { return this.map.before(this.conf.index(v))?.value }
  after(v:V) { return this.map.after(this.conf.index(v))?.value }

  *[Symbol.iterator]() { for (const v of this.map.values()) yield v }
  reversed() { return map(this.map.reversed(), x => x.value) }
  
  range(start:V, end:V, inc:Include = IN_EX) {
    const s = this.conf.index(start)
    const e = this.conf.index(end)
    return map(this.map.range(s, e, inc), x => x.value)
  }

  add(value:V) {
    const key = this.conf.index(value)
    return this.map.set(key, value) !== value
  }

  addAll(i:Iterable<V>) {
    const index = this.conf.index
    return this.map.setAll(map(i, x => { return {key:index(x), value:x}}))
  }

  clear() {
    this.map.clear()
  }

  replace(i:Iterable<V>) {
    const index = this.conf.index
    return this.map.replace(map(i, x => { return {key:index(x), value:x}}))
  }

  delete(v:V) {
    return this.map.delete(this.conf.index(v)) !== undefined
  }

  deleteAll(i:Iterable<V>) {
    return this.map.deleteAll(map(i, x => this.conf.index(x)))
  }

  drop(f:(v:V)=>boolean) {
    return this.map.drop(pair => f(pair.value))
  }

}

function *map<T,R>(i:Iterable<T>, f:(x:T)=>R) {
  for (const x of i) yield f(x)
}