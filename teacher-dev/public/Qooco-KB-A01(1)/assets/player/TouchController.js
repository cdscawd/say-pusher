var kTouchStartEventName = "touchstart";
var kTouchMoveEventName = "touchmove";
var kTouchEndEventName = "touchend";
var kTouchCancelEventName = "touchcancel";
var kGestureStartEventName = "gesturestart";
var kGestureEndEventName = "gestureend";
var kSwipeEvent = "TouchController:SwipeEvent";
var kTapEvent = "TouchController:TapeEvent";
var TouchController = Class.create({
    initialize: function() {
        document.observe(kTouchStartEventName, this.handleTouchStartEvent.bind(this));
        document.observe(kTouchMoveEventName, this.handleTouchMoveEvent.bind(this));
        document.observe(kTouchEndEventName, this.handleTouchEndEvent.bind(this));
        document.observe(kTouchCancelEventName, this.handleTouchCancelEvent.bind(this));
        document.observe(kGestureStartEventName, this.handleGestureStartEvent.bind(this));
        document.observe(kGestureEndEventName, this.handleGestureEndEvent.bind(this));
        this.swipeInProgress = false;
        this.swipeFingerCount = 0;
        this.swipeStartTime = 0;
        this.swipeStartX = 0;
        this.swipeStartY = 0;
        this.preventDefault = true;
        this.tapEventCallback = null;
        this.setTrackArea(0, 0, 0, 0);
        this.enableTouchTracking = true
    },
    setTouchTrackingEnabled: function(a) {
        this.enableTouchTracking = a
    },
    setTrackArea: function(d, c, b, a) {
        debugMessage(kDebugTouchController_SetTrackArea, "left: " + d + " top: " + c + " width: " + b + " height: " + a);
        this.trackAreaLeft = d;
        this.trackAreaTop = c;
        this.trackAreaRight = d + b;
        this.trackAreaBottom = c + a
    },
    registerTapEventCallback: function(a) {
        this.tapEventCallback = a
    },
    isTouchWithinTrackArea: function(a) {
        debugMessage(kDebugTouchController_IsTouchWithinTrackArea, "checking...");
        if (this.enableTouchTracking === false) {
            debugMessage(kDebugTouchController_IsTouchWithinTrackArea, "- nope, tracking is disabled");
            return false
        }
        if (a.clientX < this.trackAreaLeft) {
            debugMessage(kDebugTouchController_IsTouchWithinTrackArea, "- nope, x < left");
            return false
        }
        if (a.clientX > this.trackAreaRight) {
            debugMessage(kDebugTouchController_IsTouchWithinTrackArea, "- nope, x > right");
            return false
        }
        if (a.clientY < this.trackAreaTop) {
            debugMessage(kDebugTouchController_IsTouchWithinTrackArea, "- nope, y < top");
            return false
        }
        if (a.clientY > this.trackAreaBottom) {
            debugMessage(kDebugTouchController_IsTouchWithinTrackArea, "- nope, y > bottom");
            return false
        }
        debugMessage(kDebugTouchController_IsTouchWithinTrackArea, "- yes it is!");
        return true
    },
    handleTouchStartEvent: function(b) {
        debugMessage(kDebugTouchController_HandleTouchStartEvent, "touch event has " + b.touches.length + " fingers...");
        if (this.swipeInProgress === false) {
            debugMessage(kDebugTouchController_HandleTouchStartEvent, "- this is the first finger down event...");
            var a = b.touches[0];
            if (this.isTouchWithinTrackArea(a)) {
                debugMessage(kDebugTouchController_HandleTouchStartEvent, "- start tracking a swipt event...");
                if (this.preventDefault) {
                    b.preventDefault()
                }
                this.swipeInProgress = true;
                this.swipeFingerCount = b.touches.length;
                this.swipeStartTime = new Date();
                this.swipeStartX = a.clientX;
                this.swipeStartY = a.clientY
            } else {
                debugMessage(kDebugTouchController_HandleTouchStartEvent, "- but it is outside of the track area")
            }
        } else {
            debugMessage(kDebugTouchController_HandleTouchStartEvent, "- this is a subsequent finger down event. update finger count...");
            if (b.touches.length > this.swipeFingerCount) {
                this.swipeFingerCount = b.touches.length;
                debugMessage(kDebugTouchController_HandleTouchStartEvent, "- this.swipeFingerCount:" + this.swipeFingerCount)
            }
        }
    },
    handleTouchMoveEvent: function(a) {
        if (this.preventDefault) {
            a.preventDefault()
        }
        debugMessage(kDebugTouchController_HandleTouchCancelEvent, "")
    },
    handleTouchEndEvent: function(a) {
        debugMessage(kDebugTouchController_HandleTouchEndEvent, "touch event has " + a.touches.length + " fingers...");
        if (this.swipeInProgress) {
            if (this.preventDefault) {
                a.preventDefault()
            }
            if (a.touches.length === 0) {
                debugMessage(kDebugTouchController_HandleTouchEndEvent, "-  " + this.swipeFingerCount + " finger swipe is complete.");
                var h = a.changedTouches[0];
                var m = document.viewport.getDimensions();
                var e = m.width / 3;
                var d = m.height / 3;
                var g = m.width / 3;
                var k = h.clientX - this.swipeStartX;
                var i = h.clientY - this.swipeStartY;
                var c = Math.abs(k);
                var b = Math.abs(i);
                var o = new Date();
                var q = o - this.swipeStartTime;
                var l = false;
                var p = false;
                var f = 400;
                var j = 20;
                if (q < f) {
                    debugMessage(kDebugTouchController_HandleTouchEndEvent, "-  elapsed time was short enough to be a tap, check its magnitude...");
                    if ((c < j) && (b < j)) {
                        l = true
                    } else {
                        debugMessage(kDebugTouchController_HandleTouchEndEvent, "-  magnitude time too big to be a tap, check if it's a swipe...")
                    }
                } else {
                    debugMessage(kDebugTouchController_HandleTouchEndEvent, "-  elapsed time too long to be a tap, check if it's a swipe...")
                }
                if (q > 800) {
                    debugMessage(kDebugTouchController_HandleTouchEndEvent, "-  elapsed time too long to be a swipe, ignoring...")
                } else {
                    if (c > b) {
                        if (b > d) {
                            debugMessage(kDebugTouchController_HandleTouchEndEvent, "-  vertical magnitude too high, ignoring...")
                        } else {
                            p = true
                        }
                    } else {
                        if (c > g) {
                            debugMessage(kDebugTouchController_HandleTouchEndEvent, "-  horizontal magnitude too high, ignoring...")
                        } else {
                            p = true
                        }
                    }
                }
                if (l) {
                    debugMessage(kDebugTouchController_HandleTouchEndEvent, "-  it's a " + this.swipeFingerCount + " finger tap");
                    if (this.tapEventCallback) {
                        var a = {};
                        a.memo = {};
                        a.memo.fingers = this.swipeFingerCount;
                        a.memo.pointX = h.clientX;
                        a.memo.pointY = h.clientY;
                        debugMessage(kDebugTouchController_HandleTouchEndEvent, "- invoking callback with pointX: " + h.clientX + " pointY: " + h.clientY + "...");
                        this.tapEventCallback(a);
                        debugMessage(kDebugTouchController_HandleTouchEndEvent, "- back from callback")
                    } else {
                        debugMessage(kDebugTouchController_HandleTouchEndEvent, "- firing TapEvent...");
                        document.fire(kTapEvent, {
                            fingers: this.swipeFingerCount,
                            pointX: h.clientX,
                            pointY: h.clientY
                        })
                    }
                } else {
                    if (p) {
                        var n;
                        if (c > b) {
                            n = (k < 0 ? "left": "right")
                        } else {
                            n = (i < 0 ? "up": "down")
                        }
                        debugMessage(kDebugTouchController_HandleTouchEndEvent, "-  it's a " + this.swipeFingerCount + " finger swipe in the " + n + " direction");
                        document.fire(kSwipeEvent, {
                            direction: n,
                            fingers: this.swipeFingerCount
                        })
                    }
                }
                this.swipeInProgress = false;
                this.swipeFingerCount = 0
            }
        } else {
            debugMessage(kDebugTouchController_HandleTouchEndEvent, "-  false alarm. swipe has already ended.")
        }
    },
    handleTouchCancelEvent: function(a) {
        debugMessage(kDebugTouchController_HandleTouchCancelEvent, "");
        this.swipeInProgress = false
    },
    handleGestureStartEvent: function(a) {
        debugMessage(kDebugTouchController_HandleGestureStartEvent, "");
        if (this.preventDefault) {
            a.preventDefault()
        }
    },
    handleGestureEndEvent: function(a) {
        debugMessage(kDebugTouchController_HandleGestureEndEvent, "");
        if (this.preventDefault) {
            a.preventDefault()
        }
    }
});