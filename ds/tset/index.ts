import { Base, DSEvent } from "dubc-ds-base"
import { TMap, IN_EX, IN_IN, EX_IN, EX_EX, Include } from "dubc-ds-tmap"

export { IN_EX, IN_IN, EX_IN, EX_EX }
export type { Include }

export interface Conf<T extends {}> {
  readonly compare:(a:T,b:T)=>number
}

export class TSet<T extends {}> extends Base<T> {

  private readonly map:TMap<T,true>
  readonly conf:Conf<T>

  constructor(i:Iterable<T>, c:Conf<T>) {
    super()
    this.conf = c
    this.map = new TMap<T,true>([], {
      compare: c.compare,
      unique: true,
      valueEq: Object.is,
    })
    this.addAll(i)
    this.map.hear(this, evt => {
      const e2:DSEvent<T> = {}
      if (evt.cleared !== undefined) e2.cleared = evt.cleared
      if (evt.deleted !== undefined) {
        e2.deleted = {items:map(evt.deleted.items, x => x.key)}
        if (evt.deleted.at !== undefined) e2.deleted.at = evt.deleted.at
      }
      if (evt.added !== undefined) {
        e2.added = {items:map(evt.added.items, x => x.key)}
        if (evt.added.at !== undefined) e2.added.at = evt.added.at
      }
      this.fire(e2)
    })
  }

  static of<T extends {}>(compare:(a:T, b:T)=>number, ...items:T[]) {
    return new TSet(items, {compare})
  }

  toEmpty() {
    return new TSet([], this.conf)
  }

  get compare() { return this.map.compare }
  set compare(f:(a:T,b:T)=>number) { this.map.compare = f }

  get first() { return this.map.first?.key }
  get last() { return this.map.last?.key }
  get only() { return this.map.only.key }
  get size() { return this.map.size }

  has(v:T) { return this.map.has(v) }
  hasAll(i:Iterable<T>) { return this.map.hasAll(i) }

  at(i:number) { return this.map.at(i).key }
  rank(v:T) { return this.map.rank(v) }

  from(v:T) { return this.map.from(v)?.key }
  to(v:T) { return this.map.to(v)?.key }
  before(v:T) { return this.map.before(v)?.key }
  after(v:T) { return this.map.after(v)?.key }

  *[Symbol.iterator]() { for (const v of this.map.keys()) yield v }
  reversed() { return map(this.map.reversed(), x => x.key) }
  
  range(start:T, end:T, inc:Include = IN_EX) {
    return map(this.map.range(start, end, inc), x => x.key)
  }

  add(value:T) {
    return this.map.set(value, true) === undefined
  }

  addAll(i:Iterable<T>) {
    return this.map.setAll(map(i, x => { return {key:x, value:true}}))
  }

  clear() {
    this.map.clear()
  }

  replace(i:Iterable<T>) {
    return this.map.replace(map(i, x => { return {key:x, value:true}}))
  }

  delete(v:T) {
    return this.map.delete(v) !== undefined
  }

  deleteAll(i:Iterable<T>) {
    return this.map.deleteAll(i)
  }

  drop(f:(v:T)=>boolean) {
    return this.map.drop(pair => f(pair.key))
  }

}

function *map<T,R>(i:Iterable<T>, f:(x:T)=>R) {
  for (const x of i) yield f(x)
}