import { Weakness } from "weakness"

export interface Mod<T> {
  items:Iterable<T>
  at?:number
}

export interface DSEvent<T> {
  cleared?:number
  added?:Mod<T>
  deleted?:Mod<T>
}

export abstract class Base<T> implements Iterable<T> {

  private ears = new Weakness<(evt:DSEvent<T>)=>void>()

  get i() { return this[Symbol.iterator]() }

  abstract get size():number
  abstract [Symbol.iterator]():Iterator<T>

  hear(keeper:object, ear:(evt:DSEvent<T>)=>void) {
    const r = this.ears.add(keeper, ear)
    if (this.size === 0) ear({cleared:0})
    else ear({added:{items:this, at:0}})
    return r
  }

  unhear(n:number) {
    this.ears.delete(n)
  }

  protected fire(evt:DSEvent<T>) {
    for (const f of this.ears) f(evt)
  }

  abstract toEmpty():ThisType<T>

  toJSON() {
    return [...this]
  }

}