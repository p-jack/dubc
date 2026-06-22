import { test, expect, describe, afterEach, beforeEach } from "vitest"
import { osignal, signaled } from "./index"

test("signal", () => {
  const k = {}
  const { signal, emit } = signaled("1")
  expect(signal.value).toStrictEqual("1")
  expect(emit.value).toStrictEqual("1")
  let captured = {nw:"", old:""}
  const n = signal.hear(k, (nw, old) => {
    captured = {nw, old}
  })
  expect(captured.nw).toStrictEqual("1")
  expect(captured.old).toStrictEqual("1")
  captured = { nw:"", old:"" }
  emit.value = "2"
  expect(captured.nw).toStrictEqual("2")
  expect(captured.old).toStrictEqual("1")
  captured = { nw:"", old:"" }
  emit.value = "2"
  expect(captured.nw).toStrictEqual("")
  expect(captured.old).toStrictEqual("")
  captured = { nw:"", old:"" }
  signal.unhear(n)
  emit.value = "3"
  expect(captured.nw).toStrictEqual("")
  expect(captured.old).toStrictEqual("")
})

test("osignal", () => {
  const { signal } = osignal<string>()
  expect(signal.value).toBeUndefined()
})