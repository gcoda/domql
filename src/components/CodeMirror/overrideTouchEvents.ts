//  Added non-passive event listener to a scroll-blocking 'touchstart' event. Consider marking event handler as 'passive' to make the page more responsive.
//  Added non-passive event listener to a scroll-blocking 'touchmove' ...
//  Added non-passive event listener to a scroll-blocking 'mousewheel
;(function() {
  if (typeof EventTarget !== 'undefined') {
    let addEventListenerFn = EventTarget.prototype.addEventListener
    EventTarget.prototype.addEventListener = function(type, fn, capture) {
      ;(this as any).addEventListenerFn = addEventListenerFn
      if (['touchstart', 'touchmove', 'mousewheel'].indexOf(type) !== -1) {
        if (typeof capture !== 'boolean') {
          capture = capture || {}
        } else {
          capture = { capture, passive: capture }
        }
        ;(this as any).addEventListenerFn(type, fn, capture)
      } else {
        ;(this as any).addEventListenerFn(type, fn, capture)
      }
    }
  }
})()
