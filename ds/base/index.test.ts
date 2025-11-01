import { beforeEach, expect, test } from "vitest"
import { Base, DSEvent } from "./index"

class C extends Base<number> {

  constructor(private _size:number) {
    super()
  }

  get size() { return this._size }

  *[Symbol.iterator]() {
    for (let i = 0; i < this._size; i++) yield i * 10
  }

  grow() {
    const v = this._size
    this._size++
    this.fire({added:{items:[v*10], at:v}})
  }

}

const K = {}

let c = new C(0)
let captured:DSEvent<number>|undefined = undefined

test("Base", () => {
  let c = new C(0)
  expect([...c]).toStrictEqual([])
  let captured:DSEvent<number>|undefined = undefined
  c.hear(globalThis, evt => {
    captured = evt
  })
  expect(captured).toStrictEqual({cleared:0})
  c.grow()
  expect(captured).toStrictEqual({added:{items:[0], at:0}})
  expect([...c]).toStrictEqual([0])
  c.grow()
  expect(captured).toStrictEqual({added:{items:[10], at:1}})
  expect([...c]).toStrictEqual([0, 10])
  const i = c.i
  const a:number[] = []
  while (true) {
    const r = i.next()
    if (r.done) break
    a.push(r.value)
  }
  expect([...a]).toStrictEqual([0, 10])
})

test("non-empty initial fire", () => {
  let c = new C(3)
  expect([...c]).toStrictEqual([0, 10, 20])
  let captured:DSEvent<number> = {}
  c.hear(globalThis, evt => {
    captured = evt
  })
  expect(captured.added).not.toBeUndefined()
  expect([...captured.added?.items ?? []]).toStrictEqual([0, 10, 20])
  expect(captured.added?.at).toBe(0)
  expect(captured.cleared).toBeUndefined()
  expect(captured.deleted).toBeUndefined()
})