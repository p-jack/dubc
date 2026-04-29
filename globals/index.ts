interface Provider {
  win():Window
  doc():Document
}

export const styleSheet = new CSSStyleSheet()

export const state = new Map<string,object>()

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