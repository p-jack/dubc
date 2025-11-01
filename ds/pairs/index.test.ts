import { beforeEach, describe, expect, test } from "vitest"
import { Pair, forEach } from "./index"

describe("forEach", () => {
  let a:Pair<string,number>[] = []
  const f = (key:string,value:number) => a.push({key,value})
  beforeEach(() => {
    a = []
  })
  const elements1 = [{key:"one", value:1}, {key:"two", value:2}]
  test("object", () => {
    forEach({"one":1, "two":2}, f)
    expect(a).toStrictEqual(elements1)
  })
  test("tuples", () => {
    const input = new Map<string,number>()
    input.set("one", 1)
    input.set("two", 2)
    forEach(input, f)
    expect(a).toStrictEqual(elements1)
  })
  test("entries", () => {
    forEach(elements1, f)
    expect(a).toStrictEqual(elements1)
  })
})