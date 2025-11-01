import { Base, Mod, DSEvent } from "dubc-ds-base"


export interface Capture<T> {
  only():DSEvent<T>
  all():DSEvent<T>[]
  clear():void
}

function mod<T>(m:Mod<T>) {
  const m2:Mod<T> = { items:[...m.items] }
  if (m.at !== undefined) m2.at = m.at
  return m2
}

function event<T>(e:DSEvent<T>) {
  const e2:DSEvent<T> = {}
  if (e.cleared !== undefined) e2.cleared = e.cleared
  if (e.added !== undefined) e2.added = mod(e.added)
  if (e.deleted !== undefined) e2.deleted = mod(e.deleted)
  return e2
}

class CaptureC<T> implements Capture<T> {

  events:DSEvent<T>[] = []

  add(e:DSEvent<T>) {
    this.events.push(event(e))
  }

  only() {
    if (this.events.length !== 1) throw new Error("Expected 1 captured event but got " + this.events.length)
    const r = this.events[0]!
    this.events = []
    return r
  }

  all() {
    const r = this.events
    this.events = []
    return r
  }

  clear() {
    this.events = []
  }

}

export function capture<T>(keeper:object, ds:Base<T>):Capture<T> {
  const r = new CaptureC<T>()
  ds.hear(keeper, evt => {
    r.add(evt)
  })
  return r
}
