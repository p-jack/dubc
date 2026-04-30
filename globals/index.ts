interface Provider {
  win():Window
  doc():Document
}

const styleSheet = new CSSStyleSheet()

export function getGlobalStyleSheet() {
  return styleSheet
}

let hydration:object[] = []

export function getHydration() {
  return hydration
}

export function setHydration(a:object[]) {
  hydration = a
}

const providers:Provider = {
  win:()=>window,
  doc:()=>document,
}

export function setProviders(win:()=>Window, doc:()=>Document) {
  providers.win = win
  providers.doc = doc
}

export function win() {
  return providers.win()
}

export function doc() {
  return providers.doc()
}