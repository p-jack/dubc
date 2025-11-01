import { beforeEach, describe, expect, test } from "vitest"
import { Base, DSEvent } from "dubc-ds-base"
import { capture } from "./index"

class Range {
  constructor(private from:number, private to:number) {}
  *[Symbol.iterator]() {
    for (let i = this.from; i < this.to; i++) yield i * 10
  }
}

class DS extends Base<number> {

  constructor(private _size:number, private at:boolean) {
    super()
  }

  get size() { return this._size }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.size; i++) yield i * 10
  }

  toEmpty() { return new DS(0, this.at) }

  resize(by:number) {
    const sz = this._size
    if (by === 0) return
    if (by > 0) {
      this._size = sz + by
      const items = new Range(sz, this._size)
      const event:DSEvent<number> = {added:{items}}
      if (this.at) event.added!.at = sz
      this.fire(event)
      return
    }
    if (sz + by <= 0) {
      this.fire({cleared:sz})
      return
    }
    this._size = sz + by
    const items = new Range(this._size, sz)
    const event:DSEvent<number> = {deleted:{items}}
    if (this.at) event.deleted!.at = this._size
    this.fire(event)
  }
}

const K = {}

describe("at:true", () => {
  let ds = new DS(10, true)
  let c = capture(K, ds)
  beforeEach(() => {
    ds = new DS(10, true)
    c = capture(K, ds)
    c.clear()
  })
  test("cleared", () => {
    ds.resize(-50)
    expect(c.only()).toStrictEqual({cleared:10})
  })
  test("added", () => {
    ds.resize(5)
    expect(c.only()).toStrictEqual({added:{items:[100,110,120,130,140], at:10}})
  })
  test("deleted", () => {
    ds.resize(-5)
    expect(c.only()).toStrictEqual({deleted:{items:[50,60,70,80,90], at:5}})
  })
})

describe("at:false", () => {
  let ds = new DS(10, false)
  let c = capture(K, ds)
  beforeEach(() => {
    ds = new DS(10, false)
    c = capture(K, ds)
    c.clear()
  })
  test("cleared", () => {
    ds.resize(-50)
    expect(c.only()).toStrictEqual({cleared:10})
    expect(() => c.only()).toThrowError()
  })
  test("added", () => {
    ds.resize(5)
    expect(c.only()).toStrictEqual({added:{items:[100,110,120,130,140]}})
    expect(() => c.only()).toThrowError()
  })
  test("deleted", () => {
    ds.resize(-5)
    expect(c.only()).toStrictEqual({deleted:{items:[50,60,70,80,90]}})
    expect(() => c.only()).toThrowError()
  })
})

test("all", () => {
  const ds = new DS(0, false)
  const c = capture(K, ds)
  c.clear()
  expect(() => c.only()).toThrowError()
  ds.resize(5)
  ds.resize(-5)
  expect(() => c.only()).toThrowError()
  expect(c.all()).toStrictEqual([
    {added:{items:[0, 10, 20, 30, 40]}},
    {cleared:5},
  ])
  expect(c.all()).toStrictEqual([])
})