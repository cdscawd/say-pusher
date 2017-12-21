var kStageIsReadyEvent = "StageManager:StageIsReadyEvent";
var StageManager = Class.create({
    initialize: function(a, b) {
        this.textureManager = a;
        this.scriptManager = b;
        this.stage = document.getElementById("stage");
        this.hyperlinkPlane = document.getElementById("hyperlinkPlane");
        this.stageWidth = 0;
        this.stageHeight = 0;
        this.showWidth = 0;
        this.showHeight = 0;
        this.audioTrackOffset = 0;
        this.audioTrackIconSize = 0;
        document.observe(kShowSizeDidChangeEvent, this.handleShowSizeDidChangeEvent.bind(this));
        document.observe(kStageSizeDidChangeEvent, this.handleStageSizeDidChangeEvent.bind(this));
    },
    removeTexture: function(a) {
        a.parentNode.removeChild(a)
    },
    addHyperlink: function(b) {
        var a = document.createElement("div");
        setElementProperty(a, "pointer-events", "all");
        a.setAttribute("class", "hyperlink");
        a.style.left = b.x + "px";
        a.style.top = b.y + "px";
        a.style.width = b.width + "px";
        a.style.height = b.height + "px";
        this.hyperlinkPlane.appendChild(a)
    },
    clearAllHyperlinks: function() {
        var a;
        while (this.hyperlinkPlane.childNodes.length > 0) {
            this.hyperlinkPlane.removeChild(this.hyperlinkPlane.firstChild)
        }
        this.audioTrackOffset = this.audioTrackSpacer
    },
    handleStageSizeDidChangeEvent: function(a) {
        this.stageWidth = a.memo.width;
        this.stageHeight = a.memo.height;
        this.adjustStageToFit(this.stage);
        this.adjustStageToFit(this.hyperlinkPlane)
    },
    handleShowSizeDidChangeEvent: function(a) {
        this.showWidth = a.memo.width;
        this.showHeight = a.memo.height;
        this.adjustStageToFit(this.stage);
        this.adjustStageToFit(this.hyperlinkPlane);
        this.audioTrackIconSize = this.showHeight / 4;
        this.audioTrackSpacer = this.audioTrackIconSize / 4;
        this.audioTrackOffset = this.audioTrackSpacer
    },
    adjustStageToFit: function(b) {
        if ((this.showWidth != 0) && (this.stageWidth != 0)) {
            var d = this.stageHeight / this.showHeight;
            var f = this.stageWidth / this.showWidth;
            var a = "scaleX(" + f + ") scaleY(" + d + ")";
            var e = 20;
            var c = Math.tan(Math.PI / 180 * e / 2) * 15 * (this.showWidth > this.showHeight ? this.showHeight: this.showWidth);
            this.perspective = c;
            setElementProperty(b, kTransformOriginPropertyName, kTransformOriginCenterPropertyValue);
            setElementProperty(b, kTransformPropertyName, a);
            setElementProperty(b, kPerspectiveOriginPropertyName, kTransformOriginCenterPropertyValue);
            setElementProperty(b, kTransformStylePropertyName, kTransformStylePreserve3DPropertyValue);
            setElementPosition(b, (d - 1) * this.showHeight / 2, (f - 1) * this.showWidth / 2, this.showWidth, this.showHeight);
            document.fire(kStageIsReadyEvent, {})
        }
    },
    debugGetStageStatistics: function() {
        var a = {
            numTextures: 0,
            numPixels: 0,
            numDegraded: 0
        };
        this.debugRecursivelyWalkDomFrom(this.stage, a);
        return a
    }
});