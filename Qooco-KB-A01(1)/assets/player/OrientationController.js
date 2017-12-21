var kOrientationChangedEvent = "OrientationController:OrientationChangedEvent";
var OrientationController = Class.create({
    initialize: function() {
        if (gDevice == kDeviceMobile) {
            Event.observe(window, "orientationchange", this.handleDeviceOrientationChangeEvent.bind(this));
            this.handleDeviceOrientationChangeEvent()
        }
        this.orientation = kOrientationUnknown
    },
    handleDeviceOrientationChangeEvent: function(b) {
        var c = window.orientation;
        var a = kOrientationUnknown;
        if ((c === 0) || (c === 180)) {
            a = kOrientationPortrait
        } else {
            a = kOrientationLandscape
        }
        this.changeOrientation(a)
    },
    changeOrientation: function(a) {
        this.orientation = a;
        document.fire(kOrientationChangedEvent, {
            orientation: this.orientation
        })
    }
});