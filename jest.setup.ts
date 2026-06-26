import "@testing-library/jest-dom";

// jsdom no implementa estos metodos, pero los componentes de Base UI (Select, etc.) los usan
// al posicionar popups con interacciones de puntero.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
// jsdom no implementa PointerEvent; Checkbox de Base UI lo usa en su manejador de click.
if (typeof window !== "undefined" && !window.PointerEvent) {
  class PointerEventPolyfill extends MouseEvent {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
    }
  }
  // @ts-expect-error - polyfill minimo para jsdom
  window.PointerEvent = PointerEventPolyfill;
}
