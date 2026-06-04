let css = new CSSStyleSheet()

export function getCSS() {
  return css
}

export function setCSS(sheet:CSSStyleSheet) {
  css = sheet
}