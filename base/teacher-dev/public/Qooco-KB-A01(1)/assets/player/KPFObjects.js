var kpfLayerCounter = 0;
var eventOverallDuration = 0;
var KPFPlaybackController = Class.create({
    initialize: function(b, a) {
        this.domNode = a;
        this.kpfEvent = null
    },
    destroy: function() {
        this.removeEvent();
        this.domNode = null
    },
    removeEvent: function() {
        if (this.kpfEvent) {
            this.kpfEvent.destroy();
            delete this.kpfEvent;
            this.kpfEvent = null;
            while (this.domNode.childNodes.length > 0) {
                this.domNode.removeChild(this.domNode.childNodes[0])
            }
        }
    },
    renderEvent: function(a) {
        this.removeEvent();
        this.kpfEvent = a;
        this.kpfEvent.renderEvent(this.domNode)
    },
    renderEffects: function() {
        var a = this.kpfEvent.renderEffects(this.kpfEvent.event.effects);
        return a
    },
    animateEffects: function(a) {
        this.kpfEvent.animateEffects(a)
    },
    eventOverallEndTime: function() {
        return this.kpfEvent.eventOverallEndTime
    }
});
var KPFEvent = Class.create({
    initialize: function(a) {
        this.slideId = a.slideId;
        this.slideIndex = a.slideIndex;
        this.sceneIndex = a.sceneIndex;
        this.animationSupported = a.animationSupported;
        this.event = a.event;
        this.baseLayer = {};
        this.effects = [];
        this.cssRenderer = {};
        this.glRenderer = {};
        this.canvasIdFromObjectIdLookup = {};
        this.eventOverallEndTime = 0;
        this.overallEndTimeInternal()
    },
    destroy: function() {
        this.baseLayer.destroy();
        this.cssRenderer.destroy();
        for (var a = 0,
        b = this.effects.length; a < b; a++) {
            this.effects[a].destroy()
        }
        delete this.baseLayer;
        delete this.cssRenderer;
        delete this.effects;
        delete this.event;
        this.slideId = null;
        this.slideIndex = null;
        this.sceneIndex = null;
        this.animationSupported = null;
        this.eventOverallEndTime = null
    },
    addAnimationsToIdenticalLayer: function(c, f) {
        if (c.animations && c.animations.length > 0) {
            for (var b = 0,
            e = c.animations.length; b < e; b++) {
                f.animations.push(c.animations[b])
            }
        }
        if (c.layers && c.layers.length > 0) {
            for (var a = 0,
            d = c.layers.length; a < d; a++) {
                this.addAnimationsToIdenticalLayer(c.layers[a], f.layers[a])
            }
        }
    },
    processEffects: function(a) {
        var d = [];
        for (var h = 0; h < a.length; h++) {
            var m = a[h];
            if (m.type === "actionBuild") {
                var f = false;
                var l;
                for (var g = 0,
                b = d.length; g < b; g++) {
                    if (d[g].type === "actionBuild" && d[g].objectID === m.objectID) {
                        l = g;
                        f = true;
                        break
                    }
                }
                if (f) {
                    this.addAnimationsToIdenticalLayer(m.baseLayer, d[l].baseLayer);
                    if (m.beginTime < d[l].beginTime) {
                        d[l].beginTime = m.beginTime
                    }
                    if (m.beginTime + m.duration > d[l].beginTime + d[l].duration) {
                        d[l].duration = m.beginTime + m.duration
                    }
                    for (var e = 0,
                    c = m.effects.length; e < c; e++) {
                        d[l].effects.push(m.effects[e])
                    }
                    if (d[l].names == null) {
                        d[l].names = []
                    }
                    d[l].names.push(m.name)
                } else {
                    d.push(m)
                }
            } else {
                d.push(m)
            }
        }
        for (var h = 0,
        b = d.length; h < b; h++) {
            d[h].effects = this.processEffects(d[h].effects)
        }
        return d
    },
    renderEffects: function(c) {
        var o = [];
        for (var h = 0,
        f = c.length; h < f; h++) {
            var m = new KPFEffect(c[h], this.animationSupported);
            var k = false;
            var b = m.objectID;
            this.cssRenderer.initRendererFlags(m);
            if (m.baseLayer == null) {
                this.renderAudioOnlyEffect(m)
            } else {
                if (m.name === "renderMovie") {
                    this.renderMovie(this.baseLayer, m)
                } else {
                    if (m.type === "actionBuild" && !m.isEmphasisBuild) {
                        for (var g = 0,
                        q = this.effects.length; g < q; g++) {
                            if (this.effects[g].objectID === b) {
                                if (this.effects[g].type === "actionBuild" || this.effects[g].name === "renderMovie") {
                                    k = true
                                } else {
                                    k = false
                                }
                            }
                        }
                    }
                    if (this.baseLayer.objectID === b) {
                        var l = new KPFLayer(m.baseLayer, {
                            animationSupported: this.animationSupported,
                            name: m.name,
                            type: m.type,
                            objectID: b
                        });
                        var n = "layer" + this.baseLayer.layerId;
                        var p = document.getElementById(n);
                        var a = p.parentNode;
                        var r = document.createElement("div");
                        r.setAttribute("id", "layer" + l.layerId);
                        this.baseLayer = l;
                        m.kpfLayer = l;
                        if (useWebGL && kSupportedWebGLEffects.indexOf(m.name) !== -1) {
                            var e = this.canvasId;
                            var d;
                            if (e) {
                                d = document.getElementById(e)
                            } else {
                                e = this.canvasId = b + "-canvas";
                                d = this.createCanvasElement(e);
                                a.appendChild(d)
                            }
                            m.nodeToSwapId = n;
                            m.canvasId = e
                        } else {
                            this.cssRenderer.layer = l;
                            this.cssRenderer.domNode = r;
                            this.cssRenderer.draw(a);
                            a.removeChild(p)
                        }
                    } else {
                        this.renderEffect(this.baseLayer, m, k)
                    }
                }
            }
            this.effects.push(m);
            o.push(m)
        }
        return o
    },
    renderMovie: function(c, m) {
        var h;
        for (var j = 0,
        f = c.layers.length; j < f; j++) {
            var d = m.objectID;
            var b = m.name;
            var p = m.type;
            var g = m.movie;
            if (c.layers[j].objectID === d) {
                var l = new KPFLayer(m.baseLayer, {
                    animationSupported: this.animationSupported,
                    name: b,
                    type: p,
                    objectID: d,
                    movie: g
                },
                c.bounds.offset);
                var o = "layer" + c.layers[j].layerId;
                var n = "layer" + c.layers[j].layerId;
                var q = document.getElementById(n);
                if (!q) {
                    continue
                }
                var a = q.parentNode;
                m.kpfLayer = l;
                var e = this.canvasIdFromObjectIdLookup[d];
                if (e) {
                    var k = this.glRenderer[e];
                    if (k) {
                        k.removeProgram(d)
                    }
                }
                c.layers[j] = l;
                var r = this.cssRenderer.createNodes(a, c, l);
                a.replaceChild(r, q);
                h = true
            } else {
                h = this.renderMovie(c.layers[j], m)
            }
            if (h) {
                break
            }
        }
        return h
    },
    renderEffect: function(E, C, k) {
        var D;
        for (var z = 0,
        j = E.layers.length; z < j; z++) {
            var x = C.objectID;
            var G = C.name;
            var h = C.type;
            var v = C.movie;
            if (E.layers[z].objectID === x) {
                var F = new KPFLayer(C.baseLayer, {
                    animationSupported: this.animationSupported,
                    name: G,
                    type: h,
                    objectID: x,
                    movie: v
                },
                E.bounds.offset);
                var u = "layer" + E.layers[z].layerId;
                var a = "layer" + E.layers[z].layerId;
                var l = document.getElementById(a);
                if (!l) {
                    continue
                }
                var q = l.parentNode;
                C.kpfLayer = F;
                if (useWebGL && kSupportedWebGLEffects.indexOf(G) !== -1) {
                    var B = this.canvasId;
                    var f;
                    if (B) {
                        f = document.getElementById(B);
                        f.style.opacity = 1
                    } else {
                        B = this.canvasId = x + "-canvas";
                        f = this.createCanvasElement(B);
                        q.appendChild(f)
                    }
                    this.canvasIdFromObjectIdLookup[x] = B;
                    C.nodeToSwapId = a;
                    C.canvasId = B
                } else {
                    var B = this.canvasIdFromObjectIdLookup[x];
                    if (B) {
                        var y = this.glRenderer[B];
                        if (y) {
                            y.removeProgram(x)
                        }
                    }
                    if (!k) {
                        E.layers[z] = F;
                        var b = this.cssRenderer.createNodes(q, E, F);
                        q.replaceChild(b, l)
                    } else {
                        var c = C.objectID + "-video";
                        var A = gShowController.movieCache && gShowController.movieCache[c];
                        if (C.name === "apple:action-scale" && !A) {
                            var g = document.getElementById(l.childNodes[0].id + "-contents");
                            var w = this.cssRenderer.createNodes(q, E, F);
                            var p = w.childNodes[0].id;
                            var o = document.getElementById(p + "-contents-from");
                            var t = document.getElementById(p + "-contents-to");
                            if (o && t) {
                                var r = E.bounds;
                                var e = r.width;
                                var m = r.height;
                                var s = l.childNodes[0].id;
                                var d = document.createElement("div");
                                d.id = s + "-contents-to";
                                this.setStyle(d, "0px", "0px", e + "px", m + "px", kPositionAbsolutePropertyValue, null, null);
                                d.appendChild(t.childNodes[0]);
                                g.appendChild(d);
                                setElementProperty(d, "opacity", 0);
                                var n = document.createElement("div");
                                n.id = s + "-contents-from";
                                this.setStyle(n, "0px", "0px", e + "px", m + "px", kPositionAbsolutePropertyValue, null, null);
                                n.appendChild(o.childNodes[0]);
                                g.appendChild(n)
                            } else {
                                w.parentNode.removeChild(w)
                            }
                        }
                        C.currentKPFLayer = E.layers[z]
                    }
                }
                D = true
            } else {
                D = this.renderEffect(E.layers[z], C, k)
            }
            if (D) {
                break
            }
        }
        return D
    },
    renderEvent: function(a) {
        var b = {
            animationSupported: this.animationSupported
        };
        if (this.event.effects && this.event.effects.length === 1) {
            b.name = this.event.effects[0].name;
            b.type = this.event.effects[0].type;
            b.objectID = this.event.effects[0].objectID
        }
        this.baseLayer = new KPFLayer(this.event.baseLayer, b);
        this.cssRenderer = new KPFCssRenderer(this.baseLayer, this.sceneIndex, this.animationSupported, this.effects);
        this.cssRenderer.draw(a)
    },
    renderAudioOnlyEffect: function(e) {
        if (e.name != "renderMovie") {
            return
        }
        var b = e.movie;
        if (!b.isAudioOnly) {
            return
        }
        if (gShowController.audioCache == null) {
            gShowController.audioCache = {}
        }
        var a = b.asset + "-audio";
        var d = gShowController.audioCache[a];
        if (d == null) {
            var c = gShowController.textureManager.urlForAsset(b.asset, this.slideId);
            d = new Audio(c);
            if (b) {
                if (b.loopMode && b.loopMode === "looping") {
                    d.loop = true
                }
                if (b.volume) {
                    d.volume = b.volume
                }
            }
            gShowController.audioCache[a] = d
        }
        d.play()
    },
    animateEffects: function(e) {
        for (var b = 0,
        c = e.length; b < c; b++) {
            var a = e[b];
            this.animateEffect(a)
        }
        for (var f in this.glRenderer) {
            var d = this.glRenderer[f];
            d.animate();
            d.animationStarted = true
        }
    },
    animateEffect: function(c) {
        var f = c.canvasId;
        var g = c.nodeToSwapId;
        if (f) {
            var b = document.getElementById(f);
            var e = {
                canvasId: f,
                canvas: b,
                nodeToSwapId: g,
                textureAssets: gShowController.textureManager.slideCache[this.slideIndex].textureAssets,
                effect: c,
                overallEndTime: this.eventOverallEndTime
            };
            var d = this.glRenderer[f];
            if (!d) {
                d = new KNWebGLRenderer(e);
                this.glRenderer[f] = d
            }
            var a = c.beginTime * 1000;
            if (c.type === "transition") {
                a = 0
            }
            setTimeout(this.animateEffectWillBegin.bind(this, e), a)
        } else {
            this.cssRenderer.animate(c)
        }
        if (c.effects.length > 0) {
            setTimeout(this.handleEffectDidComplete.bind(this, c), (c.beginTime + c.duration) * 1000)
        }
    },
    animateEffectWillBegin: function(e) {
        var d = e.canvasId;
        var b = e.effect;
        var c = this.glRenderer[d];
        c.draw(b);
        if (!c.animationStarted) {
            c.animate();
            c.animationStarted = true
        }
        var a = document.getElementById(e.nodeToSwapId);
        if (!a) {
            return
        }
        if (b.type === "transition") {
            a.parentNode.removeChild(a)
        } else {
            a.style.opacity = 0
        }
    },
    handleEffectDidComplete: function(c) {
        var e = this.renderEffects(c.effects);
        for (var b = 0,
        d = e.length; b < d; b++) {
            var a = e[b];
            this.animateEffect(a)
        }
    },
    overallEndTime: function() {
        return this.eventOverallEndTime
    },
    overallEndTimeInternal: function() {
        for (var a = 0,
        d = this.event.effects.length; a < d; a++) {
            var c = 0;
            var b = this.event.effects[a];
            this.calculateOverallEndTime(c, b)
        }
    },
    calculateOverallEndTime: function(e, c) {
        var b = e + c.beginTime + c.duration;
        if (b > this.eventOverallEndTime) {
            this.eventOverallEndTime = b
        }
        for (var a = 0,
        d = c.effects.length; a < d; a++) {
            this.calculateOverallEndTime(b, c.effects[a])
        }
    },
    createCanvasElement: function(b) {
        var a = document.createElement("canvas");
        a.width = gShowController.script.slideWidth;
        a.height = gShowController.script.slideHeight;
        a.setAttribute("id", b);
        return a
    },
    setStyle: function(f, h, g, e, b, a, d, c) {
        f.style.top = h;
        f.style.left = g;
        f.style.width = e;
        f.style.height = b;
        f.style.position = a;
        if (d != null && d != undefined) {
            f.style.opacity = d
        }
        if (c != null && c != undefined) {
            f.style.visibility = c
        }
    }
});
var KPFEffect = Class.create({
    initialize: function(b, a) {
        this.attributes = b.attributes;
        this.type = b.type;
        this.name = b.name;
        this.beginTime = b.beginTime;
        this.duration = b.duration;
        this.objectID = b.objectID;
        this.baseLayer = b.baseLayer;
        if (kEmphasisEffects.indexOf(this.name) > -1) {
            this.isEmphasisBuild = true
        }
        if (b.movie) {
            this.movie = b.movie
        }
        this.effects = [];
        this.addSubEffect(b.effects, a)
    },
    destroy: function() {
        for (var a = 0,
        b = this.effects.length; a < b; a++) {
            this.destroyEffect(this.effects[a])
        }
        this.type = null;
        this.name = null;
        this.beginTime = null;
        this.duration = null;
        this.objectID = null;
        delete this.kpfLayer;
        delete this.effects;
        delete this.baseLayer;
        if (this.movie) {
            delete this.movie
        }
        if (this.currentKPFLayer) {
            delete this.currentKPFLayer
        }
    },
    destroyEffect: function(b) {
        for (var a = 0,
        c = b.effects.length; a < c; a++) {
            this.destroyEffect(b.effects[a])
        }
        b.type = null;
        b.name = null;
        b.beginTime = null;
        b.duration = null;
        b.objectID = null;
        delete b.kpfLayer;
        delete b.effects;
        delete b.baseLayer;
        if (b.movie) {
            delete b.movie
        }
        if (b.currentKPFLayer) {
            delete b.currentKPFLayer
        }
    },
    addSubEffect: function(c, a) {
        for (var b = 0,
        e = c.length; b < e; b++) {
            var d = new KPFEffect(c[b], a);
            this.effects.push(d)
        }
    }
});
var KPFMovie = Class.create({
    initialize: function(b) {
        this.objectID = b.objectID;
        this.movieId = b.movieId;
        this.width = b.width;
        this.height = b.height;
        this.sceneIndex = b.sceneIndex;
        this.textureId = b.textureId;
        this.src = b.src;
        this.showControls = b.showControls;
        this.movieDiv = b.movieDiv;
        this.parentLayer = b.parentLayer;
        var a = this.videoElement = document.createElement("video");
        this.setDefaultStyle();
        this.setInsertBeforeOrAfterTextureId();
        setElementProperty(a, "pointer-events", "all");
        a.setAttribute("id", this.movieId);
        a.setAttribute("src", this.src);
        if (this.showControls) {
            Event.observe(a, "mouseover", this.handleMouseOver.bind());
            Event.observe(a, "mouseleave", this.handleMouseLeave.bind())
        }
        this.isFirstRendered = true;
        this.isEnded = false;
        this.isPlaying = false
    },
    destroy: function() {
        var a = this.videoElement;
        if (a) {
            a.pause();
            a.src = ""
        }
    },
    handleMouseOver: function() {
        this.setAttribute("controls", "controls")
    },
    handleMouseLeave: function() {
        this.removeAttribute("controls")
    },
    setDefaultStyle: function() {
        var a = this.videoElement.style;
        a.top = "0px";
        a.left = "0px";
        a.width = this.width + "px";
        a.height = this.height + "px";
        a.position = kPositionAbsolutePropertyValue;
        a.visibility = "hidden"
    },
    setInsertBeforeOrAfterTextureId: function() {
        var d = this.parentLayer.layers;
        for (var b = 0,
        c = d.length; b < c; b++) {
            var a = d[b];
            if (a.isVideoLayer) {
                if (b + 1 < c) {
                    this.insertBeforeTextureId = d[b + 1].textureId
                }
                if (b - 1 >= 0) {
                    this.insertAfterTextureId = d[b - 1].textureId
                }
            }
        }
    },
    observeEvents: function(a) {
        var b = this.videoElement;
        Event.stopObserving(b, "canplay");
        Event.stopObserving(b, "ended");
        Event.observe(b, "canplay", this.handleMovieDidStart.bind(this, a));
        Event.observe(b, "ended", this.handleMovieDidEnd.bind(this, a))
    },
    setLoop: function(a) {
        this.videoElement.loop = a
    },
    setVolume: function(a) {
        this.videoElement.volume = a
    },
    removeControls: function() {
        if (this.videoElement.hasAttribute("controls")) {
            this.videoElement.removeAttribute("controls")
        }
    },
    handleMovieDidStart: function(a) {
        this.videoElement.style.visibility = "visible";
        if (a) {
            setTimeout(this.hideMoviePoster.bind(this, a), 120)
        }
    },
    handleMovieDidEnd: function(a) {
        if (!this.videoElement.loop) {
            this.isEnded = true
        }
    },
    startMovie: function() {
        if (this.videoElement) {
            this.videoElement.play();
            this.isPlaying = true
        }
    },
    stopMovie: function() {
        if (this.videoElement) {
            this.videoElement.pause()
        }
    },
    hideMoviePoster: function(a) {
        var b = a.style;
        b.visibility = "hidden";
        b.display = "none";
        if (a.parentNode) {
            a.parentNode.removeChild(a)
        }
    }
});
var KPFCssRenderer = Class.create({
    initialize: function(b, d, a, c) {
        this.textureId = b.textureId;
        this.nativeWidth = b.bounds.width;
        this.nativeHeight = b.bounds.height;
        this.opacity = b.opacity;
        this.visibility = b.hidden === true ? "hidden": "visible";
        this.textureTransform = b.textureTransform;
        this.affineTransform = b.affineTransform;
        this.anchorPoint = b.anchorPoint;
        this.contentsRect = b.contentsRect;
        this.layer = b;
        this.sceneIndex = d;
        this.animationSupported = a;
        this.enableCompositingUsingBackface = false;
        this.enablePreserve3DFromParent = false;
        if (c.length > 0) {
            this.initRendererFlags(c[0])
        }
        this.domNode = document.createElement("div");
        this.domNode.setAttribute("id", "layer" + b.layerId)
    },
    initRendererFlags: function(a) {
        if (a.type === "transition" && a.name != "apple:ca-swing" && a.name != "com.apple.iWork.Keynote.BLTSwoosh") {
            this.enableCompositingUsingBackface = true;
            this.enablePreserve3DFromParent = true;
            if (isChrome && (a.name === "apple:ca-push" || a.name === "com.apple.iWork.Keynote.BLTFadeThruColor")) {
                this.enableCompositingUsingBackface = false;
                this.enablePreserve3DFromParent = false
            }
        } else {
            this.enableCompositingUsingBackface = false;
            this.enablePreserve3DFromParent = false
        }
        if (a.name === "apple:apple-grid") {
            this.isGridTransition = true
        } else {
            if (a.name === "com.apple.iWork.Keynote.BLTMosaicFlip") {
                this.isMosaicTransition = true
            } else {
                if (a.name === "com.apple.iWork.Keynote.BLTSwoosh" && a.type === "transition") {
                    this.isSwooshTransition = true
                }
            }
        }
    },
    destroy: function() {
        this.textureId = null;
        this.nativeWidth = null;
        this.nativeHeight = null;
        this.opacity = null;
        this.visibility = null;
        this.textureTransform = null;
        this.affineTransform = null;
        this.anchorPoint = null;
        this.textureAnimation = null;
        this.contentsRect = null;
        this.requiresPerspectiveTransform = null;
        this.sceneIndex = null;
        var d = this.domNode.getElementsByTagName("canvas");
        for (var c = d.length; c--;) {
            var a = d[c];
            if (a) {
                var b = a.getContext("2d");
                if (b) {
                    b.clearRect(0, 0, a.width, a.height);
                    d[c].remove()
                }
            }
        }
        if (this.domNode.hasChildNodes()) {
            while (this.domNode.childNodes.length > 0) {
                this.domNode.removeChild(this.domNode.firstChild)
            }
        }
        this.domNode = null
    },
    addAnimationNode: function(e, d, a, c) {
        if (d == null) {
            return e
        }
        var f = d.shift();
        if (f == null) {
            return e
        }
        var h = document.createElement("div");
        var g = a + "-" + escapeTextureId(f);
        h.setAttribute("id", g);
        if (c.initialState.masksToBounds) {
            setElementProperty(h, "overflow", "hidden")
        }
        if (this.enableCompositingUsingBackface) {
            setElementProperty(h, kBackfaceVisibilityPropertyName, "hidden")
        } else {
            if (this.isSwooshTransition) {
                setElementProperty(h, kTransformPropertyName, "translateZ(0px)")
            }
        }
        this.setStyle(h, "0px", "0px", e.style.width, e.style.height, kPositionAbsolutePropertyValue, null, null);
        setElementProperty(h, kTransformStylePropertyName, kTransformStylePreserve3DPropertyValue);
        if (c.anchorPoint.pointX != 0.5 || c.anchorPoint.pointY != 0.5) {
            setElementProperty(h, kTransformOriginPropertyName, (c.anchorPoint.pointX * 100) + "% " + (c.anchorPoint.pointY * 100) + "%")
        }
        var b;
        if (c.animationInfo.name === "apple:ca-revolve" && c.transformOriginValue && c.transformOriginZValue) {
            b = ["opacity", "doubleSided", "anchorPointZ", "anchorPoint", "position", "zPosition"]
        } else {
            b = ["opacity", "doubleSided", "anchorPointZ"]
        }
        if (c.transformOriginZValue && b.indexOf(f) === -1) {
            if (Prototype.Browser.Gecko) {
                setElementProperty(h, kTransformOriginPropertyName, (c.anchorPoint.pointX * 100) + "% " + (c.anchorPoint.pointY * 100) + "% " + c.transformOriginZValue + "px")
            } else {
                setElementProperty(h, kTransformOriginZPropertyName, c.transformOriginZValue + "px");
                if (navigator.userAgent.lastIndexOf("Chrome/") <= 0) {
                    setElementProperty(h, kTransformPropertyName, "translateZ(" + c.transformOriginZValue + "px)")
                }
            }
        }
        e.appendChild(h);
        return this.addAnimationNode(h, d, a, c)
    },
    createNodes: function(a, d, c) {
        var b = gShowController.movieCache;
        if (b && c.animationInfo.name !== "renderMovie") {
            this.setVideoLayer(c, b)
        }
        var e = this.addNode(a, d, c);
        return e
    },
    setVideoLayer: function(l, p) {
        var a = l.objectID;
        var o = a + "-video";
        kpfMovie = p[o];
        if (!kpfMovie) {
            for (var h = 0,
            b = l.layers.length; h < b; h++) {
                this.setVideoLayer(l.layers[h], p)
            }
        } else {
            if (l.layers.length === 1) {
                if (l.layers[0].textureId) {
                    l.layers[0].isVideoLayer = true;
                    l.layers[0].movieObjectID = a
                } else {
                    if (l.layers[0].layers[0].textureId) {
                        l.layers[0].layers[0].isVideoLayer = true;
                        l.layers[0].layers[0].movieObjectID = a
                    }
                }
            } else {
                var m = false;
                var d;
                for (var h = 0,
                b = l.layers.length; h < b; h++) {
                    var k;
                    if (l.layers[h].textureId) {
                        k = l.layers[h]
                    } else {
                        k = l.layers[h].layers[0]
                    }
                    var g = k.textureId;
                    if (g === kpfMovie.insertAfterTextureId) {
                        d = k
                    }
                    var n = false;
                    for (var f = 0,
                    c = kpfMovie.parentLayer.layers.length; f < c; f++) {
                        var e = kpfMovie.parentLayer.layers[f].textureId;
                        if (e === g) {
                            n = true;
                            break
                        }
                    }
                    if (!n) {
                        m = true;
                        k.isVideoLayer = true;
                        k.movieObjectID = a
                    }
                }
                if (!m && d) {
                    d.isVideoLayer = true;
                    d.movieObjectID = a
                }
            }
        }
    },
    addNode: function(r, E, f) {
        if (f.canvasId) {
            return
        }
        var G = "layer" + f.layerId;
        var ae = document.createElement("div");
        ae.setAttribute("id", G);
        setElementProperty(ae, "pointer-events", "none");
        var Q = f.contentsRect.x;
        var O = f.contentsRect.y;
        var R = f.contentsRect.width;
        var ad = f.contentsRect.height;
        var ao = f.affineTransform[0];
        var am = f.affineTransform[1];
        var al = f.affineTransform[2];
        var ak = f.affineTransform[3];
        var ai = f.affineTransform[4];
        var af = f.affineTransform[5];
        var v = f.animationInfo;
        var S = false;
        if (ao === -1 && v.name === "com.apple.iWork.Keynote.KLNComet") {
            ao = 1;
            S = true
        }
        var C = "matrix(" + ao + "," + am + "," + al + "," + ak + "," + (ai + f.bounds.offset.pointX) + "," + (af + f.bounds.offset.pointY) + ")";
        var o = f.bounds;
        var s = o.width;
        var U = o.height;
        this.setStyle(ae, "0px", "0px", s + "px", U + "px", kPositionAbsolutePropertyValue, f.opacity, f.visibility);
        setElementProperty(ae, kTransformPropertyName, C);
        if (f.anchorPoint.pointX != 0.5 || f.anchorPoint.pointY != 0.5) {
            setElementProperty(ae, kTransformOriginPropertyName, (f.anchorPoint.pointX * 100) + "% " + (f.anchorPoint.pointY * 100) + "%")
        }
        if (f.initialState.masksToBounds) {
            setElementProperty(ae, "overflow", "hidden")
        }
        r.appendChild(ae);
        var H;
        if (this.animationSupported) {
            H = this.addAnimationNode(ae, f.divNames, G, f)
        } else {
            H = ae
        }
        if (f.isTransition && this.enablePreserve3DFromParent) {
            if (E.sublayerTransform[11] != 0) {
                setElementProperty(ae, kTransformStylePropertyName, kTransformStylePreserve3DPropertyValue)
            }
            if (f.sublayerTransform[11] != 0) {
                setElementProperty(ae, kPerspectivePropertyName, gShowController.stageManager.perspective + "px");
                setElementProperty(ae, kTransformStylePropertyName, kTransformStylePreserve3DPropertyValue)
            }
        } else {
            if (E.sublayerTransform[11] != 0) {
                setElementProperty(r, kPerspectivePropertyName, gShowController.stageManager.perspective + "px");
                setElementProperty(ae, kTransformStylePropertyName, kTransformStylePreserve3DPropertyValue)
            } else {
                setElementProperty(ae, kTransformStylePropertyName, kTransformStyleFlatPropertyValue)
            }
        }
        if (isChrome) {
            if (this.enableCompositingUsingBackface) {
                setElementProperty(ae, kBackfaceVisibilityPropertyName, "hidden")
            } else {
                if (this.isSwooshTransition) {
                    setElementProperty(ae, kTransformPropertyName, "translateZ(0px)")
                }
            }
        }
        var M = f.textureId;
        if (M) {
            var z = gShowController.textureManager;
            var F = z.getTextureObject(this.sceneIndex, M);
            var p = document.createElement("canvas");
            var ap = p.getContext("2d");
            var a = F.width;
            var d = F.height;
            if (Q === 0 && O === 0 && R === 1 && ad === 1) {
                p.width = a;
                p.height = d;
                ap.drawImage(F, 0, 0);
                this.setStyle(p, "0px", "0px", s + "px", U + "px", kPositionAbsolutePropertyValue, null, null)
            } else {
                var n = O * d;
                var X = (Q + R) * a;
                var c = (O + ad) * d;
                var k = Q * a;
                var u = p.width = X - k;
                var j = p.height = c - n;
                ap.drawImage(F, k * pdfScaleFactor, n * pdfScaleFactor, u * pdfScaleFactor, j * pdfScaleFactor, 0, 0, u, j);
                this.setStyle(p, "0px", "0px", u + "px", j + "px", kPositionAbsolutePropertyValue, null, null)
            }
            var L = p;
            L.setAttribute("id", M);
            if (browserPrefix === "webkit" && f.isTransition == null) {
                if (S) {
                    setElementProperty(L, kTransformPropertyName, "rotateY(180deg) translateZ(0px)")
                } else {
                    setElementProperty(L, kTransformPropertyName, "translateZ(0px)")
                }
            }
            if (f.isTransition) {
                if (isChrome) {
                    if (this.enableCompositingUsingBackface) {
                        if (!this.isGridTransition && !this.isMosaicTransition) {
                            setElementProperty(L, kBackfaceVisibilityPropertyName, "hidden")
                        }
                    } else {
                        if (this.isSwooshTransition) {
                            setElementProperty(L, kTransformPropertyName, "translateZ(0px)")
                        }
                    }
                } else {
                    if (this.enableCompositingUsingBackface) {
                        setElementProperty(L, kBackfaceVisibilityPropertyName, "hidden")
                    } else {
                        setElementProperty(L, kTransformPropertyName, "translateZ(0px)")
                    }
                }
            }
            var K = v.objectID;
            var g = v && v.type === "buildOut";
            var W;
            var t;
            if (f.isVideoLayer) {
                if (v.name === "renderMovie") {
                    var Y = z.getMovieUrl(this.sceneIndex, v.movie.asset);
                    var P = /(?:\.([^.]+))?$/;
                    var ah = P.exec(Y)[1];
                    if (ah === "gif") {
                        t = new Image();
                        this.setStyle(t, "0px", "0px", s + "px", U + "px", kPositionAbsolutePropertyValue, null, null);
                        Event.observe(t, "load", this.hideElement.bind(this, L));
                        t.src = Y
                    } else {
                        if (gShowController.movieCache == null) {
                            gShowController.movieCache = {}
                        }
                        var V = K + "-video";
                        f.hasMovie = true;
                        f.movieId = V;
                        W = gShowController.movieCache[V];
                        if (W == null) {
                            var ag = {
                                objectID: K,
                                movieId: V,
                                width: s,
                                height: U,
                                sceneIndex: this.sceneIndex,
                                textureId: M,
                                src: Y,
                                showControls: gShowController.isRecording === false ? true: false,
                                movieDiv: ae,
                                parentLayer: E
                            };
                            W = new KPFMovie(ag);
                            gShowController.movieCache[V] = W;
                            W.observeEvents(L)
                        }
                    }
                } else {
                    var Z = gShowController.movieCache;
                    if (Z) {
                        var V = f.movieObjectID + "-video";
                        W = Z[V]
                    }
                }
            }
            if (f.hasContentsAnimation) {
                var an = f.cssAnimation.animations;
                var T;
                var e;
                for (var m = 0,
                ab = an.length; m < ab; m++) {
                    if (an[m].property === "contents") {
                        T = an[m].to.texture;
                        e = an[m].from.texture;
                        break
                    }
                }
                var b = z.getTextureObject(this.sceneIndex, T);
                var N = document.createElement("canvas");
                var aq = N.getContext("2d");
                var a = N.width = b.width;
                var d = N.height = b.height;
                var J = a / s;
                var I = d / U;
                aq.drawImage(b, 0, 0);
                N.setAttribute("id", T);
                if (J > 1 && I > 1 && J !== 0 && I !== 0) {
                    this.setStyle(N, "0px", "0px", a + "px", d + "px", kPositionAbsolutePropertyValue, null, null);
                    setElementProperty(N, kTransformOriginPropertyName, "0% 0%");
                    setElementProperty(N, kTransformPropertyName, "scale(" + 1 / J + "," + 1 / I + ")")
                } else {
                    this.setStyle(N, "0px", "0px", s + "px", U + "px", kPositionAbsolutePropertyValue, null, null)
                }
                var B = document.createElement("div");
                B.id = G + "-contents-to";
                this.setStyle(B, "0px", "0px", s + "px", U + "px", kPositionAbsolutePropertyValue, null, null);
                B.appendChild(N);
                H.appendChild(B);
                setElementProperty(B, "opacity", 0);
                var D = z.getTextureObject(this.sceneIndex, e);
                var q = document.createElement("canvas");
                var aj = q.getContext("2d");
                q.width = D.width;
                q.height = D.height;
                aj.drawImage(D, 0, 0);
                q.setAttribute("id", e);
                this.setStyle(q, "0px", "0px", s + "px", U + "px", kPositionAbsolutePropertyValue, null, null);
                var l = document.createElement("div");
                l.id = G + "-contents-from";
                this.setStyle(l, "0px", "0px", s + "px", U + "px", kPositionAbsolutePropertyValue, null, null);
                l.appendChild(q);
                H.appendChild(l)
            } else {
                H.appendChild(L);
                if (t) {
                    H.appendChild(t)
                }
            }
            if (W) {
                if (W.isFirstRendered) {
                    H.insertBefore(W.videoElement, L);
                    W.isFirstRendered = false
                } else {
                    if (f.animationInfo && f.animationInfo.name !== "renderMovie") {
                        if (W.objectID === K && g) {
                            W.stopMovie();
                            W.removeControls();
                            W.isBuiltOut = true
                        } else {
                            if (!W.isBuiltOut) {
                                H.parentNode.appendChild(W.movieDiv)
                            }
                        }
                    }
                }
            }
        } else {
            if (f.initialState.backgroundColor) {
                var aa = f.initialState.backgroundColor;
                setElementProperty(H, "background-color", "rgba(" + parseInt(aa[0] * 255) + "," + parseInt(aa[1] * 255) + "," + parseInt(aa[2] * 255) + "," + aa[3] + ")")
            }
        }
        for (var ac = 0,
        A = f.layers.length; ac < A; ac++) {
            this.addNode(H, f, f.layers[ac])
        }
        return ae
    },
    hideElement: function(a) {
        a.style.visibility = "hidden"
    },
    serializeSvg: function(e) {
        var f = e.getElementsByTagName("image");
        for (var d = 0,
        b = f.length; d < b; d++) {
            var a = f[d];
            var g = document.createElement("a");
            g.href = a.getAttributeNS("http://www.w3.org/1999/xlink", "href");
            var j = window.location.protocol + "//" + g.host + g.pathname;
            a.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", j)
        }
        var h = new XMLSerializer;
        var c = h.serializeToString(e);
        return c
    },
    draw: function(a) {
        this.setStyle(this.domNode, "0px", "0px", this.nativeWidth + "px", this.nativeHeight + "px", kPositionAbsolutePropertyValue, this.opacity, this.visibility);
        if (browserPrefix === "webkit") {
            if (this.enableCompositingUsingBackface && isChrome) {
                setElementProperty(this.domNode, kBackfaceVisibilityPropertyName, "hidden")
            } else {
                setElementProperty(this.domNode, kTransformPropertyName, "translateZ(0px)")
            }
        }
        if (this.layer.sublayerTransform[11] != 0) {
            setElementProperty(this.domNode, kPerspectivePropertyName, gShowController.stageManager.perspective + "px");
            setElementProperty(this.domNode, kTransformStylePropertyName, kTransformStylePreserve3DPropertyValue)
        } else {
            setElementProperty(this.domNode, kTransformStylePropertyName, kTransformStyleFlatPropertyValue)
        }
        for (var b = 0,
        c = this.layer.layers.length; b < c; b++) {
            this.createNodes(this.domNode, this.layer, this.layer.layers[b])
        }
        a.appendChild(this.domNode)
    },
    setStyle: function(f, h, g, e, b, a, d, c) {
        f.style.top = h;
        f.style.left = g;
        f.style.width = e;
        f.style.height = b;
        f.style.position = a;
        if (d != null && d != undefined) {
            f.style.opacity = d
        }
        if (c != null && c != undefined) {
            f.style.visibility = c
        }
    },
    overallEndTime: function(a) {
        var b = {};
        b.duration = 0;
        this.overallEndTimeForLayer(this.layer, b);
        return b.duration
    },
    overallEndTimeForLayer: function(b, c) {
        if (b.cssAnimation) {
            if (b.cssAnimation.overallEndTime > c.duration) {
                c.duration = b.cssAnimation.overallEndTime
            }
        }
        for (var a = 0,
        d = b.layers.length; a < d; a++) {
            this.overallEndTimeForLayer(b.layers[a], c)
        }
    },
    animate: function(a) {
        if (this.animationSupported) {
            if (a.kpfLayer) {
                if (a.movie) {
                    this.animateEffect(a, a.kpfLayer, a.currentKPFLayer ? a.currentKPFLayer: null, a.movie)
                } else {
                    this.animateEffect(a, a.kpfLayer, a.currentKPFLayer ? a.currentKPFLayer: null)
                }
            }
        }
    },
    animateEffect: function(p, b, j, e) {
        var l = p.objectID + "-video";
        if (b.cssAnimationRules.length > 0) {
            var g = j ? "layer" + j.layerId: "layer" + b.layerId;
            var d = document.getElementById(g);
            if (d) {
                this.applyCssAnimation(d, b, j)
            } else {
                if (p.currentKPFLayer) {
                    g = "layer" + p.currentKPFLayer.layerId;
                    if (p.currentKPFLayer.layers[0]) {
                        g = "layer" + p.currentKPFLayer.layers[0].layerId
                    }
                    d = document.getElementById(g);
                    if (d) {
                        this.applyCssAnimation(d, b, p.currentKPFLayer)
                    }
                }
            }
        } else {
            if (b.isRenderMovie && b.animationInfo.name === "renderMovie") {
                var o = gShowController.movieCache[l];
                if (o) {
                    if (e.loopMode && e.loopMode === "looping") {
                        o.setLoop(true)
                    }
                    if (e.volume) {
                        o.setVolume(e.volume)
                    }
                    o.startMovie()
                }
            }
            if (j) {
                var a = document.getElementById("layer" + j.layerId);
                var k = window.getComputedStyle(a, null);
                var m = k.getPropertyValue(kTransformPropertyName);
                var f = parseTransformMatrix(m);
                var n = "matrix(" + f[0] + "," + f[1] + "," + f[2] + "," + f[3] + "," + b.bounds.offset.pointX + "," + b.bounds.offset.pointY + ")";
                if (p.name === "apple:action-motion-path") {
                    setElementProperty(a, kTransformPropertyName, n)
                }
            }
        }
        for (var h = 0,
        c = b.layers.length; h < c; h++) {
            if (gShowController.movieCache && gShowController.movieCache[l]) {
                this.animateEffect(p, b.layers[h], j, e)
            } else {
                this.animateEffect(p, b.layers[h], j ? j.layers[h] : null, e)
            }
        }
    },
    applyCssAnimation: function(u, e, G) {
        var O = e.cssAnimation;
        var x = e.cssAnimationRules;
        var N = e.cssAnimation.overallEndTime;
        if (e.hasMovie) {
            if (e.animationInfo.type === "buildOut") {
                this.stopMovie(document.getElementById(e.movieId))
            }
        }
        if (isChrome && e.animationInfo.name === "apple:doorway") {
            if (e.layers.length === 0 && e.contentsRect.x === 0 && e.contentsRect.y === 0 && e.contentsRect.width === 1 && e.contentsRect.height === 1) {
                u.style.visibility = "hidden"
            }
        }
        var d = O.keyAnimations.bounds;
        if (d) {
            var v = document.styleSheets[1].cssRules;
            var Y = v.length;
            var z = u.id + "-bounds";
            if (G) {
                z = "layer" + e.layerId + "-bounds"
            }
            for (var U = 0; U < Y; U++) {
                var r = v[U];
                if (r.name === z) {
                    while (r.cssRules.length > 0) {
                        if (isIE) {
                            for (var T = 0,
                            A = r.cssRules.length; T < A; T++) {
                                r.deleteRule(T)
                            }
                        } else {
                            r.deleteRule(r.cssRules[0].keyText)
                        }
                    }
                    for (var T = 0,
                    w = d.keyframes.length; T < w; T++) {
                        var f = d.keyframes[T];
                        var P, V, a, c;
                        if (f.keyframe == 0) {
                            P = f.value.width;
                            V = f.value.height;
                            r.appendRule("0% {" + kTransformPropertyName + ": scaleX(1) scaleY(1); " + kAnimationTimingFunctionPropertyName + ": " + f.timingFunction + ";}")
                        } else {
                            a = f.value.width;
                            c = f.value.height;
                            r.appendRule(f.keyframe + "% {" + kTransformPropertyName + ": scaleX(" + a / P + ") scaleY(" + c / V + "); " + kAnimationTimingFunctionPropertyName + ": " + f.timingFunction + ";}")
                        }
                    }
                }
            }
        }
        if (e.animationInfo.name !== "apple:ca-swing" && (e.initialState.rotation !== 0 || e.initialState.scale !== 1)) {
            var g = document.getElementById(u.id);
            var D = window.getComputedStyle(g, null);
            var I = D.getPropertyValue(kTransformPropertyName);
            var J = parseTransformMatrix(I);
            var l = "matrix(1,0,0,1," + J[4] + "," + J[5] + ")";
            setElementProperty(g, kTransformPropertyName, l);
            var t = document.getElementById(u.id + "-" + escapeTextureId("transform.rotation.z"));
            if (t) {
                setElementProperty(t, kTransformPropertyName, "rotateZ(" + e.initialState.rotation + "rad)")
            }
            var B = document.getElementById(u.id + "-" + escapeTextureId("transform.scale.x"));
            if (B) {
                setElementProperty(B, kTransformPropertyName, "scaleX(" + e.initialState.scale + ")")
            }
            var m = document.getElementById(u.id + "-" + escapeTextureId("transform.scale.y"));
            if (m) {
                setElementProperty(m, kTransformPropertyName, "scaleY(" + e.initialState.scale + ")")
            }
        }
        for (var C in O.keyAnimations) {
            var q = O.keyAnimations[C];
            var y = q.keyActions;
            var F = y[y.length - 1];
            var E = q.keyframes[q.keyframes.length - 1];
            var Z = this.cssPropertyNameForAction(C);
            var S = this.cssPropertyValueForActionValue(C, E.value);
            var k = N + "s";
            var z = "";
            var L = "";
            if (C === "isPlaying") {
                continue
            }
            if (G && e.animationInfo.type === "actionBuild" && kActionBuildKeyAnimations[e.animationInfo.name].indexOf(C) === -1) {
                continue
            }
            if (C === "doubleSided") {
                var h = document.getElementById(u.id + "-" + escapeTextureId(C));
                if (h) {
                    setElementProperty(h, Z, S)
                }
                continue
            }
            if (e.animationInfo.name === "apple:ca-swing" && (C === "anchorPoint" || C === "transform.translation")) {
                continue
            }
            if (e.animationInfo.name === "apple:ca-revolve" && e.transformOriginValue && e.transformOriginZValue && (C === "anchorPointZ" || C === "zPosition")) {
                continue
            }
            switch (C) {
            case "opacity":
                z = u.id + "-opacity";
                L = z;
                if (G) {
                    if (document.getElementById(z) == null) {
                        z = u.id
                    }
                    L = "layer" + e.layerId + "-opacity"
                } else {
                    setElementProperty(u, "opacity", 1)
                }
                break;
            case "hidden":
                Z = "opacity";
                if (S === "hidden") {
                    S = 0
                } else {
                    u.style.visibility = "visible";
                    S = 1
                }
                z = u.id;
                L = z + "-hidden";
                if (G) {
                    L = "layer" + e.layerId + "-hidden"
                }
                break;
            case "bounds":
                z = u.id + "-bounds";
                L = z;
                if (G) {
                    L = "layer" + e.layerId + "-bounds"
                }
                var P, V, s, H;
                var n = q.keyframes[0];
                var Q = q.keyframes[q.keyframes.length - 1];
                S = "scaleX(" + Q.value.width / n.value.width + ") scaleY(" + Q.value.height / n.value.height + ")";
                break;
            default:
                z = u.id + "-" + escapeTextureId(C);
                L = z;
                if (G) {
                    L = "layer" + e.layerId + "-" + escapeTextureId(C)
                }
                break
            }
            if (C === "contents") {
                var R = u.id + "-contents-from";
                var W = u.id + "-contents-to";
                var K = R;
                var p = W;
                if (G) {
                    K = "layer" + e.layerId + "-contents-from";
                    p = "layer" + e.layerId + "-contents-to"
                }
                var o = document.getElementById(R);
                var X = document.getElementById(W);
                setElementProperty(o, "opacity", 0);
                setElementProperty(o, kAnimationNamePropertyName, K);
                setElementProperty(o, kAnimationDurationPropertyName, k);
                setElementProperty(X, "opacity", 1);
                setElementProperty(X, kAnimationNamePropertyName, p);
                setElementProperty(X, kAnimationDurationPropertyName, k);
                continue
            }
            var b = document.getElementById(z);
            if (b) {
                if (C === "anchorPoint") {
                    var M = {
                        x: E.value.pointX,
                        y: E.value.pointY
                    };
                    if (e.magicMoveOffsetValue) {
                        M.x = e.magicMoveOffsetValue.pointX;
                        M.y = e.magicMoveOffsetValue.pointY
                    }
                    Z = kTransformPropertyName;
                    S = "translateX(" + M.x + "px) translateY(" + M.y + "px)"
                } else {
                    if (C === "anchorPointZ") {
                        if (Prototype.Browser.Gecko || navigator.userAgent.lastIndexOf("Chrome/") > 0) {
                            Z = kTransformPropertyName;
                            S = "translateZ(" + -e.transformOriginZValue + "px)"
                        } else {
                            Z = kTransformPropertyName;
                            S = "translateZ(" + e.transformOriginZValue + "px)"
                        }
                    }
                }
                if (C !== "hidden") {
                    setElementProperty(b, Z, S)
                }
                setElementProperty(b, kAnimationFillModePropertyName, F.fillMode === "removed" ? "none": F.fillMode);
                setElementProperty(b, kAnimationNamePropertyName, L);
                setElementProperty(b, kAnimationDurationPropertyName, k)
            }
        }
    },
    cssPropertyValueForActionValue: function(a, b) {
        switch (a) {
        case "hidden":
            if (b.scalar === true) {
                return "hidden"
            } else {
                return "visible"
            }
        case "anchorPoint":
            return b.pointX + "% " + b.pointY + "%";
        case "anchorPointZ":
            return b.scalar;
        case "position":
            return "translate(" + b.pointX + "px," + b.pointY + "px)";
        case "zPosition":
            return "translateZ(" + b.scalar + "px)";
        case "translationEmphasis":
            return "translateX(" + b.translationEmphasis[0] + "px) translateY(" + b.translationEmphasis[1] + "px) translateZ(" + b.translationEmphasis[2] + ")";
        case "rotationEmphasis":
            return "rotateZ(" + b.rotationEmphasis[6] + "rad)";
        case "scaleEmphasis":
            return "scale3d(" + ensureScaleFactorNotZero(b.scaleEmphasis[3]) + "," + ensureScaleFactorNotZero(b.scaleEmphasis[4]) + "," + ensureScaleFactorNotZero(b.scaleEmphasis[5]) + ")";
        case "transform.scale":
        case "transform.scale.xy":
            return "scale(" + ensureScaleFactorNotZero(b.scalar) + ")";
        case "transform.scale.x":
            return "scaleX(" + ensureScaleFactorNotZero(b.scalar) + ")";
        case "transform.scale.y":
            return "scaleY(" + ensureScaleFactorNotZero(b.scalar) + ")";
        case "transform.rotation.x":
            return "rotateX(" + b.scalar + "rad)";
        case "transform.rotation.y":
            return "rotateY(" + b.scalar + "rad)";
        case "transform.rotation.z":
        case "transform.rotation":
            return "rotateZ(" + b.scalar + "rad)";
        case "transform.translation":
            return "translateX(" + b.pointX + "px) translateY(" + b.pointY + "px)";
        case "transform.translation.x":
            return "translateX(" + b.scalar + "px)";
        case "transform.translation.y":
            return "translateY(" + b.scalar + "px)";
        case "transform.translation.z":
            return "translateZ(" + b.scalar + "px)";
        case "isPlaying":
        case "opacity":
        case "opacityMultiplier":
            return b.scalar + "";
        case "transform":
            return "matrix3d(" + b.transform + ")";
        case "doubleSided":
            if (b.scalar === false) {
                return "hidden"
            } else {
                return "visible"
            }
        default:
            return "some value"
        }
    },
    cssPropertyNameForAction: function(a) {
        switch (a) {
        case "hidden":
            return kVisibilityPropertyName;
        case "anchorPoint":
            return kTransformOriginPropertyName;
        case "anchorPointZ":
            return kTransformOriginZPropertyName;
        case "opacityMultiplier":
            return kOpacityPropertyName;
        case "translationEmphasis":
        case "rotationEmphasis":
        case "scaleEmphasis":
        case "position":
        case "zPosition":
        case "transform":
        case "transform.scale":
        case "transform.scale.xy":
        case "transform.scale.x":
        case "transform.scale.y":
        case "transform.rotation.x":
        case "transform.rotation.y":
        case "transform.rotation.z":
        case "transform.rotation":
        case "transform.translation":
        case "transform.translation.x":
        case "transform.translation.y":
        case "transform.translation.z":
        case "bounds":
            return kTransformPropertyName;
        case "doubleSided":
            return kBackfaceVisibilityPropertyName;
        case "contents":
            return kBackgroundImagePropertyName;
        default:
            return a
        }
    },
    hideMoviePoster: function(a) {
        a.style.visibility = "hidden"
    },
    handleMovieDidStart: function(a, b) {
        b.style.visibility = "visible";
        setTimeout(this.hideMoviePoster.bind(this, a), 120)
    },
    handleMovieDidEnd: function(a, b) {
        if (!b.loop) {
            b.isEnded = true
        }
    },
    startMovie: function(a) {
        if (a) {
            a.play();
            a.isPlaying = true
        }
    },
    stopMovie: function(a) {
        if (a) {
            a.pause()
        }
    }
});
var KPFLayer = Class.create({
    initialize: function(c, d, b) {
        this.animationInfo = d;
        this.layerId = kpfLayerCounter;
        kpfLayerCounter = kpfLayerCounter + 1;
        this.objectID = c.objectID != null ? c.objectID: null;
        this.textureId = c.texture ? c.texture: null;
        this.animations = c.animations;
        this.initialState = c.initialState;
        this.isVideoLayer = c.isVideoLayer;
        this.hasHighlightedBulletAnimation = c.hasHighlightedBulletAnimation;
        this.cssAnimationRules = [];
        this.layers = [];
        this.affineTransform = this.initialState.affineTransform;
        this.position = this.initialState.position;
        this.textureTransform = "";
        if (this.initialState.transform != null && this.initialState.transform != undefined) {
            this.textureTransform = "matrix3D(" + this.initialState.transform + ")"
        } else {
            this.textureTransform = "matrix(" + this.affineTransform + ")"
        }
        this.anchorPoint = this.initialState.anchorPoint;
        if (b == null) {
            b = {
                pointX: 0,
                pointY: 0
            }
        }
        var a = this.position.pointX - this.initialState.width / 2 - (this.anchorPoint.pointX - 0.5) * this.initialState.width;
        var e = this.position.pointY - this.initialState.height / 2 - (this.anchorPoint.pointY - 0.5) * this.initialState.height;
        a = Math.round(a * 1000000) / 1000000;
        e = Math.round(e * 1000000) / 1000000;
        this.bounds = {
            width: this.initialState.width,
            height: this.initialState.height,
            origin: {
                pointX: this.affineTransform[4],
                pointY: this.affineTransform[5]
            },
            offset: {
                pointX: a,
                pointY: e
            },
            canvasOffset: {
                pointX: a + b.pointX,
                pointY: e + b.pointY
            }
        };
        this.sublayerTransform = this.initialState.sublayerTransform;
        this.contentsRect = this.initialState.contentsRect;
        this.hidden = this.initialState.hidden;
        this.opacity = this.initialState.opacity;
        this.visibility = this.hidden === true ? "hidden": "visible";
        this.addSublayer(c.layers, d, this.bounds.offset);
        if (d.animationSupported) {
            this.initLayerAnimations()
        }
    },
    destroy: function() {
        this.initialState = null;
        this.cssAnimationRules = null;
        this.affineTransform = null;
        this.textureTransform = null;
        this.anchorPoint = null;
        this.anchorPointZ = null;
        this.bounds = null;
        this.contentsRect = null;
        this.hidden = null;
        this.opacity = null
    },
    addSublayer: function(f, e, d) {
        for (var a = 0,
        b = f.length; a < b; a++) {
            var c = new KPFLayer(f[a], e, d);
            this.layers.push(c)
        }
    },
    initLayerAnimations: function() {
        var l = false;
        var h = false;
        var b = false;
        var s = false;
        var g = false;
        var f = false;
        var d = false;
        var a = false;
        var p = false;
        var o = false;
        var m = false;
        var u = false;
        var x = false;
        var w = false;
        var c = false;
        var y = false;
        var r = false;
        var t = [];
        var e = false;
        var n = this.animationInfo;
        var k = n.type;
        var A = n.name;
        var q = ["isPlaying", "opacityMultiplier", "hidden"];
        if (k === "actionBuild") {
            this.isActionBuild = true
        } else {
            if (k === "buildIn") {
                this.isBuildIn = true
            } else {
                if (k === "buildOut") {
                    this.isBuildOut = true
                } else {
                    if (k === "transition") {
                        this.isTransition = true
                    }
                }
            }
        }
        if (A === "apple:magic-move-implied-motion-path") {
            this.isMagicMove = true
        } else {
            if (A === "apple:ca-isometric") {
                e = true
            } else {
                if (A === "renderMovie") {
                    this.isRenderMovie = true
                } else {
                    if (kEmphasisEffects.indexOf(A) > -1) {
                        this.isEmphasisBuild = true
                    }
                }
            }
        }
        if (this.animations.length > 0) {
            this.cssAnimation = new KPFCssAnimation(this.animations, this)
        }
        this.divNames = [];
        if (this.objectID && this.isRenderMovie) {
            this.divNames = ["opacity", "position", "transform.rotation.z", "transform.scale.x", "transform.scale.y", "bounds", "contents"]
        } else {
            if (this.cssAnimation) {
                for (var z in this.cssAnimation.keyAnimations) {
                    if (q.indexOf[z] > 0) {
                        continue
                    }
                    if (z == "opacity") {
                        h = true
                    } else {
                        if (z === "anchorPoint") {
                            b = true
                        } else {
                            if (z === "anchorPointZ") {
                                s = true
                            } else {
                                if (!e && z === "transform.translation.x") {
                                    g = true
                                } else {
                                    if (!e && z === "transform.translation.y") {
                                        f = true
                                    } else {
                                        if (!e && z === "transform.translation.z") {
                                            d = true
                                        } else {
                                            if (!e && z === "transform.translation") {
                                                a = true
                                            } else {
                                                if (!e && z === "transform.rotation.x") {
                                                    p = true
                                                } else {
                                                    if (!e && z === "transform.rotation.y") {
                                                        o = true
                                                    } else {
                                                        if (!e && z === "transform.rotation.z") {
                                                            m = true
                                                        } else {
                                                            if (!e && z === "transform.rotation") {
                                                                u = true
                                                            } else {
                                                                if (z === "transform.scale.x") {
                                                                    x = true
                                                                } else {
                                                                    if (z === "transform.scale.y") {
                                                                        w = true
                                                                    } else {
                                                                        if (z === "transform.scale.xy") {
                                                                            c = true
                                                                        } else {
                                                                            if (z === "transform.scale") {
                                                                                y = true
                                                                            } else {
                                                                                if (z === "transform") {
                                                                                    r = true
                                                                                } else {
                                                                                    if (z === "doubleSided") {
                                                                                        l = true
                                                                                    } else {
                                                                                        if (z === "contents") {
                                                                                            this.hasContentsAnimation = true
                                                                                        } else {
                                                                                            if (z === "bounds") {
                                                                                                this.hasBoundsAnimation = true
                                                                                            } else {
                                                                                                if (z === "position") {
                                                                                                    this.hasPosition = true
                                                                                                } else {
                                                                                                    t.push(z)
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (h && this.isActionBuild && !this.isEmphasisBuild) {
                    this.divNames.push("opacity");
                    for (var v = 0,
                    j = this.layers.length; v < j; v++) {
                        if (this.layers[v].animations.length === 0) {
                            this.layers[v].divNames = ["opacity", "position", "transform.rotation.z", "transform.scale.x", "transform.scale.y", "bounds", "contents"]
                        }
                    }
                } else {
                    if ((h || this.isActionBuild) && this.divNames.indexOf("opacity") === -1) {
                        this.divNames.push("opacity")
                    }
                    if (r) {
                        this.divNames.push("transform")
                    }
                    if (this.hasPosition || this.isActionBuild) {
                        this.divNames.push("position")
                    }
                    if (b) {
                        this.divNames.push("anchorPoint")
                    }
                    if (s) {
                        this.divNames.push("anchorPointZ")
                    }
                    for (var v = 0,
                    j = t.length; v < j; v++) {
                        this.divNames.push(t[v])
                    }
                    if (g) {
                        this.divNames.push("transform.translation.x")
                    }
                    if (f) {
                        this.divNames.push("transform.translation.y")
                    }
                    if (a) {
                        this.divNames.push("transform.translation")
                    }
                    if (d) {
                        this.divNames.push("transform.translation.z")
                    }
                    if (p) {
                        this.divNames.push("transform.rotation.x")
                    }
                    if (o) {
                        this.divNames.push("transform.rotation.y")
                    }
                    if (m) {
                        this.divNames.push("transform.rotation.z")
                    }
                    if ((this.initialState.rotation !== 0 || this.isActionBuild) && this.divNames.indexOf("transform.rotation.z") === -1) {
                        this.divNames.push("transform.rotation.z")
                    }
                    if (u) {
                        this.divNames.push("transform.rotation")
                    }
                    if (x) {
                        this.divNames.push("transform.scale.x")
                    }
                    if (w) {
                        this.divNames.push("transform.scale.y")
                    }
                    if (this.initialState.scale !== 1 || this.isActionBuild) {
                        if (this.divNames.indexOf("transform.scale.x") === -1) {
                            this.divNames.push("transform.scale.x")
                        }
                        if (this.divNames.indexOf("transform.scale.y") === -1) {
                            this.divNames.push("transform.scale.y")
                        }
                    }
                    if (c) {
                        this.divNames.push("transform.scale.xy")
                    }
                    if (y) {
                        this.divNames.push("transform.scale")
                    }
                    if (this.textureId && (this.hasBoundsAnimation || this.isActionBuild)) {
                        this.divNames.push("bounds")
                    }
                    if (this.textureId && (this.hasContentsAnimation || this.isActionBuild)) {
                        this.divNames.push("contents")
                    }
                    if (l) {
                        this.divNames.push("doubleSided")
                    }
                }
            }
        }
    }
});
var KPFCssAnimation = Class.create({
    initialize: function(o, I) {
        this.kDelta = 0.0001;
        this.kRoundingFactor = 10000;
        this.animations = [];
        this.keyAnimations = {};
        for (var C = 0,
        g = o.length; C < g; C++) {
            var F = o[C];
            var v = F.beginTime;
            var b = F.duration;
            var d = F.timingFunction ? F.timingFunction: "linear";
            var H;
            var G;
            var l;
            var f;
            var y;
            var w = v + b;
            this.overallEndTime = 0;
            if (w > this.overallEndTime) {
                this.overallEndTime = w
            }
            if (d == "custom") {
                H = F.timingControlPoint1x;
                G = F.timingControlPoint1y;
                l = F.timingControlPoint2x;
                f = F.timingControlPoint2y
            }
            if (F.animations != null && F.animations.length > 0) {
                var q = F.animations;
                var p = v;
                if (q[0].property == null) {
                    p = q[0].beginTime;
                    q = q[0].animations
                }
                for (var z = 0,
                e = q.length; z < e; z++) {
                    var a = q[z];
                    var n = a.property;
                    var B = this.keyAnimations[n];
                    if (B == null) {
                        B = {
                            groupBeginTime: p,
                            earliestBeginTime: p + a.beginTime,
                            latestEndTime: -1,
                            keyActions: []
                        };
                        this.keyAnimations[n] = B
                    }
                    if (p + a.beginTime + a.duration > B.latestEndTime) {
                        B.latestEndTime = p + a.beginTime + a.duration
                    }
                    if (a.path) {
                        var E = F.path.length;
                        for (var x = 0; C < E - 1; x++) {
                            var r = F.path[x];
                            var c = F.path[x + 1];
                            var A = r.points[0];
                            var h = c.points[0];
                            var u = {
                                pointX: A[0],
                                pointY: A[1]
                            };
                            var D = {
                                pointX: h[0],
                                pointY: h[1]
                            };
                            switch (r.type) {
                            case "MoveToPoint":
                            case "AddLine":
                            case "AddCurve":
                            case "AddQuadCurve":
                                y = {
                                    property: "position",
                                    from: u,
                                    to: D,
                                    fillMode: "forwards",
                                    beginTime: p + a.beginTime + (x / (E - 1)) * a.duration,
                                    duration: 1 / (E - 1) * a.duration,
                                    timingFunction: "linear",
                                    groupTimingFunction: d,
                                    groupBeginTime: v,
                                    groupDuration: b,
                                    groupTimingControlPoint1x: H,
                                    groupTimingControlPoint1y: G,
                                    groupTimingControlPoint2x: l,
                                    groupTimingControlPoint2y: f
                                };
                                break
                            }
                            this.addAction(y, a)
                        }
                    } else {
                        if (a.keyTimes) {
                            var t = a.keyTimes.length;
                            for (var x = 0; x < t - 1; x++) {
                                var s = a.keyTimes[x];
                                var m = a.keyTimes[x + 1];
                                y = {
                                    property: a.property,
                                    from: a.values[x],
                                    to: a.values[x + 1],
                                    fillMode: a.fillMode,
                                    beginTime: p + a.beginTime + (s / 1 * a.duration),
                                    duration: (m - s) * a.duration,
                                    timingFunction: a.timingFunctions ? a.timingFunctions[x] : "linear",
                                    groupTimingFunction: d,
                                    groupBeginTime: v,
                                    groupDuration: b,
                                    groupTimingControlPoint1x: H,
                                    groupTimingControlPoint1y: G,
                                    groupTimingControlPoint2x: l,
                                    groupTimingControlPoint2y: f
                                };
                                this.addAction(y, a)
                            }
                        } else {
                            y = {
                                property: a.property,
                                from: a.from,
                                to: a.to,
                                fillMode: a.fillMode,
                                beginTime: p + a.beginTime,
                                duration: a.duration,
                                timingFunction: a.timingFunction ? a.timingFunction: "linear",
                                groupTimingFunction: d,
                                groupBeginTime: v,
                                groupDuration: b,
                                groupTimingControlPoint1x: H,
                                groupTimingControlPoint1y: G,
                                groupTimingControlPoint2x: l,
                                groupTimingControlPoint2y: f
                            };
                            this.addAction(y, a)
                        }
                    }
                }
            } else {
                var n = F.property;
                var B = this.keyAnimations[n];
                if (B == null) {
                    B = {
                        groupBeginTime: 0,
                        earliestBeginTime: F.beginTime,
                        latestEndTime: -1,
                        keyActions: []
                    };
                    this.keyAnimations[n] = B
                }
                if (F.beginTime + F.duration > B.latestEndTime) {
                    B.latestEndTime = F.beginTime + F.duration
                }
                if (F.path) {
                    var E = F.path.length;
                    for (var x = 0; x < E - 1; x++) {
                        var r = F.path[x];
                        var c = F.path[x + 1];
                        var A = r.points[0];
                        var h = c.points[0];
                        var u = {
                            pointX: A[0],
                            pointY: A[1]
                        };
                        var D = {
                            pointX: h[0],
                            pointY: h[1]
                        };
                        switch (r.type) {
                        case "MoveToPoint":
                        case "AddLine":
                        case "AddCurve":
                        case "AddQuadCurve":
                            y = {
                                property: "position",
                                from: u,
                                to: D,
                                fillMode: "forwards",
                                beginTime: v + x / (E - 1) * b,
                                duration: 1 / (E - 1) * b,
                                timingFunction: "linear"
                            };
                            break
                        }
                        this.addAction(y, F)
                    }
                } else {
                    if (F.keyTimes) {
                        var t = F.keyTimes.length;
                        for (var x = 0; x < t - 1; x++) {
                            var s = F.keyTimes[x];
                            var m = F.keyTimes[x + 1];
                            y = {
                                property: F.property,
                                from: F.values[x],
                                to: F.values[x + 1],
                                fillMode: F.fillMode,
                                beginTime: s / 1 * b,
                                duration: (m - s) * b,
                                timingFunction: F.timingFunctions ? F.timingFunctions[x] : "linear"
                            };
                            this.addAction(y, F)
                        }
                    } else {
                        y = {
                            property: F.property,
                            from: F.from,
                            to: F.to,
                            fillMode: F.fillMode,
                            beginTime: v,
                            duration: b,
                            timingFunction: d ? d: "linear"
                        };
                        this.addAction(y, F)
                    }
                }
            }
        }
        this.createKeyActions();
        this.createAnimationRules(I);
        this.createAnimationRuleForKeyframes(I)
    },
    addAction: function(b, a) {
        if (a.timingFunction === "custom") {
            b.timingControlPoint1x = a.timingControlPoint1x;
            b.timingControlPoint1y = a.timingControlPoint1y;
            b.timingControlPoint2x = a.timingControlPoint2x;
            b.timingControlPoint2y = a.timingControlPoint2y
        } else {
            if (b.timingFunction.timingFunction != null) {
                if (b.timingFunction.timingFunction === "custom") {
                    b.timingControlPoint1x = b.timingFunction.timingControlPoint1x;
                    b.timingControlPoint1y = b.timingFunction.timingControlPoint1y;
                    b.timingControlPoint2x = b.timingFunction.timingControlPoint2x;
                    b.timingControlPoint2y = b.timingFunction.timingControlPoint2y
                }
                b.timingFunction = b.timingFunction.timingFunction
            }
        }
        this.animations.push(b)
    },
    createKeyActions: function() {
        for (var e = 0,
        a = this.animations.length; e < a; e++) {
            var c = this.animations[e];
            var d = c.beginTime;
            var b = c.duration;
            var g = d + b;
            var n = c.property;
            var h = this.keyAnimations[n];
            var m = h.keyActions;
            var k = h.latestEndTime - h.earliestBeginTime;
            var l = 0;
            var j = 100;
            if (k > 0) {
                l = 100 * d / this.overallEndTime;
                j = 100 * g / this.overallEndTime
            }
            if (j > 99.9999) {
                j = 100
            }
            var f = {
                startKeyframe: l,
                endKeyframe: j,
                from: c.from,
                to: c.to,
                timingFunction: c.timingFunction
            };
            if (c.fillMode) {
                f.fillMode = c.fillMode
            }
            if (c.timingFunction == "custom") {
                f.timingControlPoint1x = c.timingControlPoint1x;
                f.timingControlPoint1y = c.timingControlPoint1y;
                f.timingControlPoint2x = c.timingControlPoint2x;
                f.timingControlPoint2y = c.timingControlPoint2y
            }
            m.push(f);
            m.sort(this.sortAction)
        }
    },
    sortAction: function(b, a) {
        return b.startKeyframe - a.startKeyframe
    },
    roundNum: function(a) {
        return Math.round(a * this.kRoundingFactor) / this.kRoundingFactor
    },
    createAnimationRules: function(w) {
        var f = this.kDelta;
        for (var h in this.keyAnimations) {
            if (h == "playing") {
                continue
            }
            var q = this.keyAnimations[h];
            var g = q.keyActions;
            var j = false;
            q.keyframes = [];
            var o = g[0];
            var s = this.roundNum(o.startKeyframe);
            var m = this.roundNum(100 * q.groupBeginTime / this.overallEndTime);
            if (h == "anchorPoint") {
                var c = {};
                c.x = o.to.pointX;
                c.y = o.to.pointY;
                var n = {
                    pointX: -(o.from.pointX - w.anchorPoint.pointX) * w.bounds.width,
                    pointY: -(o.from.pointY - w.anchorPoint.pointY) * w.bounds.height
                };
                if (w.isMagicMove) {
                    var u = this.anchorPointOffset(w, {
                        x: o.from.pointX,
                        y: o.from.pointY
                    });
                    var k = {
                        pointX: u.x,
                        pointY: u.y
                    };
                    var d = this.anchorPointOffset(w, {
                        x: o.to.pointX,
                        y: o.to.pointY
                    });
                    var v = {
                        pointX: d.x,
                        pointY: d.y
                    };
                    if (k.pointX !== v.pointX || k.pointY != v.pointY) {
                        n = {
                            pointX: v.pointX - k.pointX,
                            pointY: v.pointY - k.pointY
                        };
                        w.magicMoveOffsetValue = n
                    }
                }
                if (s != 0) {
                    var t = {
                        pointX: 0,
                        pointY: 0
                    };
                    if (m > 0) {
                        this.insertInitialKeyframes(q, m - f, "position", t)
                    }
                    if (s - m > f) {
                        if (o.fillMode === "both" || o.fillMode === "backwards") {
                            t = n
                        }
                        q.keyframes.push({
                            keyframe: m,
                            keyName: "position",
                            value: t,
                            timingFunction: "linear"
                        });
                        q.keyframes.push({
                            keyframe: s - f,
                            keyName: "position",
                            value: t,
                            timingFunction: "linear"
                        })
                    }
                }
                q.keyframes.push({
                    keyframe: s,
                    keyName: "position",
                    value: n,
                    timingFunction: "linear"
                });
                q.keyframes.push({
                    keyframe: 100,
                    keyName: "position",
                    value: n,
                    timingFunction: "linear"
                });
                w.transformOriginValue = (c.x * 100) + "% " + (c.y * 100) + "%";
                continue
            }
            if (h == "anchorPointZ") {
                j = true;
                if (s != 0) {
                    var t = this.createInitialKeyframeValue(w, h, o.from, true);
                    q.keyframes.push({
                        keyframe: 0,
                        keyName: "zPosition",
                        value: t,
                        timingFunction: "linear"
                    });
                    q.keyframes.push({
                        keyframe: s - f,
                        keyName: "zPosition",
                        value: t,
                        timingFunction: "linear"
                    })
                }
                q.keyframes.push({
                    keyframe: s,
                    keyName: "zPosition",
                    value: o.from,
                    timingFunction: "linear"
                });
                q.keyframes.push({
                    keyframe: 100,
                    keyName: "zPosition",
                    value: o.to,
                    timingFunction: "linear"
                });
                w.transformOriginZValue = o.to.scalar;
                continue
            }
            if (o == null) {
                continue
            }
            var l = 0;
            var r = null;
            var e = null;
            if (s != 0) {
                if (h === "hidden") {
                    e = {
                        scalar: w.hidden
                    };
                    this.insertInitialKeyframes(q, s - f, h, e)
                } else {
                    if (h === "opacity") {
                        if (o.fillMode === "both" || o.fillMode === "backwards") {
                            e = o.from
                        } else {
                            e = {
                                scalar: w.opacity
                            }
                        }
                        this.insertInitialKeyframes(q, s - f, h, e)
                    } else {
                        if (h === "position") {
                            if (w.isBuildIn || w.isBuildOut) {
                                if (m > 0 && o.fillMode !== "both" && o.fillMode !== "backwards") {
                                    e = {
                                        pointX: 0,
                                        pointY: 0
                                    }
                                } else {
                                    e = {
                                        pointX: this.roundNum(o.from.pointX - w.initialState.position.pointX),
                                        pointY: this.roundNum(o.from.pointY - w.initialState.position.pointY)
                                    }
                                }
                            } else {
                                e = {
                                    pointX: 0,
                                    pointY: 0
                                }
                            }
                            this.insertInitialKeyframes(q, s - f, h, e)
                        } else {
                            e = this.createInitialKeyframeValue(w, h, o.from, j);
                            if (m > 0) {
                                this.insertInitialKeyframes(q, m - f, h, e)
                            }
                            if (s - m > f) {
                                if (o.fillMode === "both" || o.fillMode === "backwards") {
                                    e = o.from
                                }
                                if (h === "transform.translation") {
                                    e.pointX = this.roundNum(e.pointX);
                                    e.pointY = this.roundNum(e.pointY)
                                }
                                q.keyframes.push({
                                    keyframe: m,
                                    keyName: h,
                                    value: e,
                                    timingFunction: "linear"
                                });
                                q.keyframes.push({
                                    keyframe: s - f,
                                    keyName: h,
                                    value: e,
                                    timingFunction: "linear"
                                })
                            }
                        }
                    }
                }
                l = o.startKeyframe;
                r = e
            }
            for (var p = 0,
            b = g.length; p < b; p++) {
                o = g[p];
                if (h == "position") {
                    e = w.initialState.position;
                    o.from = {
                        pointX: this.roundNum(o.from.pointX - e.pointX),
                        pointY: this.roundNum(o.from.pointY - e.pointY)
                    };
                    o.to = {
                        pointX: this.roundNum(o.to.pointX - e.pointX),
                        pointY: this.roundNum(o.to.pointY - e.pointY)
                    }
                }
                if (Math.abs(o.startKeyframe - l) > f) {
                    q.keyframes.push({
                        keyframe: this.roundNum(o.startKeyframe) - f,
                        keyName: h,
                        value: r,
                        timingFunction: "linear"
                    })
                }
                if (h === "transform.translation") {
                    o.from.pointX = this.roundNum(o.from.pointX);
                    o.from.pointY = this.roundNum(o.from.pointY);
                    o.to.pointX = this.roundNum(o.to.pointX);
                    o.to.pointY = this.roundNum(o.to.pointY)
                }
                var a = this.createTimingFunctionForAction(o);
                q.keyframes.push({
                    keyframe: this.roundNum(o.startKeyframe),
                    keyName: h,
                    value: o.from,
                    timingFunction: a
                });
                q.keyframes.push({
                    keyframe: this.roundNum(o.endKeyframe) - (o.endKeyframe == 100 ? 0 : f),
                    keyName: h,
                    value: o.to,
                    timingFunction: a
                });
                r = o.to;
                l = o.endKeyframe
            }
            if (l != 100 && h != "hidden") {
                q.keyframes.push({
                    keyframe: this.roundNum(l),
                    keyName: h,
                    value: r,
                    timingFunction: "linear"
                });
                q.keyframes.push({
                    keyframe: 100,
                    keyName: h,
                    value: r,
                    timingFunction: "linear"
                })
            }
        }
    },
    insertInitialKeyframes: function(b, c, d, a) {
        b.keyframes.push({
            keyframe: 0,
            keyName: d,
            value: a,
            timingFunction: "linear"
        });
        b.keyframes.push({
            keyframe: c,
            keyName: d,
            value: a,
            timingFunction: "linear"
        })
    },
    anchorPointOffset: function(c, e) {
        var a = {};
        var b = {};
        var f = {};
        var d = c.bounds;
        a.x = d.width / 2;
        a.y = d.height / 2;
        b.x = e.x * d.width;
        b.y = e.y * d.height;
        f.x = (a.x - b.x);
        f.y = (a.y - b.y);
        return f
    },
    createInitialKeyframeValue: function(a, c, e, b) {
        var d = {};
        switch (c) {
        case "anchorPoint":
            d.pointX = (a.anchorPoint.pointX - 0.5) * a.bounds.width;
            d.pointY = (a.anchorPoint.pointY - 0.5) * a.bounds.height;
            break;
        case "anchorPointZ":
            if (Prototype.Browser.Gecko || Prototype.Browser.IE || isChrome || isIE || isEdge) {
                d.scalar = 0
            } else {
                d.scalar = e.scalar + e.scalar
            }
            break;
        case "opacity":
        case "opacityMultiplier":
            d.scalar = a.opacity;
            break;
        case "hidden":
            d.scalar = a.hidden;
            break;
        case "position":
            d.pointX = a.affineTransform[4];
            d.pointY = a.affineTransform[5];
            break;
        case "zPosition":
            d.scalar = 0;
            break;
        case "transform.scale":
        case "transform.scale.xy":
        case "transform.scale.x":
        case "transform.scale.y":
            d.scalar = a.initialState.scale;
            break;
        case "transform.rotation.z":
            d.scalar = a.initialState.rotation;
        case "transform":
            d.transform = e.transform;
            break;
        case "bounds":
            d.pointX = 0;
            d.pointY = 0;
            d.width = a.initialState.width;
            d.height = a.initialState.height;
            break;
        default:
            d.scalar = 0;
            d.pointX = 0;
            d.pointY = 0;
            break
        }
        return d
    },
    createTimingFunctionForAction: function(c) {
        var b = "";
        var a = c.timingFunction;
        var d = c;
        if (typeof a === "object") {
            a = a.timingFunction;
            d = c.timingFunction
        }
        switch (a.toLowerCase()) {
        case "easein":
            b = "ease-in";
            break;
        case "easeout":
            b = "ease-out";
            break;
        case "easeinout":
        case "easeineaseout":
            b = "ease-in-out";
            break;
        case "custom":
            b = "cubic-bezier(" + d.timingControlPoint1x + "," + d.timingControlPoint1y + "," + d.timingControlPoint2x + "," + d.timingControlPoint2y + ")";
            break;
        case "linear":
            b = "linear";
            break;
        default:
            b = "linear";
            break
        }
        return b
    },
    createAnimationRuleForKeyframes: function(d) {
        for (var n in this.keyAnimations) {
            var f = this.keyAnimations[n];
            var e = "layer" + d.layerId + "-" + escapeTextureId(n);
            var b;
            var h = "";
            var o;
            if (n === "contents") {
                var m = this.roundNum(f.keyActions[0].startKeyframe);
                b = gShowController.animationManager.createAnimation(e + "-from");
                var l = "0% {opacity: 1; " + kAnimationTimingFunctionPropertyName + ": linear;}";
                var k = "49.999% {opacity: 1; " + kAnimationTimingFunctionPropertyName + ": linear;}";
                var j = "50% {opacity: 0; " + kAnimationTimingFunctionPropertyName + ": linear;}";
                var g = "100% {opacity: 0; " + kAnimationTimingFunctionPropertyName + ": linear;}";
                if (m !== 0) {
                    k = ((100 - m) / 2 + m - this.kDelta) - this.kDelta + "% {opacity: 1; " + kAnimationTimingFunctionPropertyName + ": linear;}";
                    j = ((100 - m) / 2 + m) + "% {opacity: 0; " + kAnimationTimingFunctionPropertyName + ": linear;}"
                }
                b.appendRule(l);
                b.appendRule(k);
                b.appendRule(j);
                b.appendRule(g);
                b = gShowController.animationManager.createAnimation(e + "-to");
                l = "0% {opacity: 0; " + kAnimationTimingFunctionPropertyName + ": linear;}";
                k = "49.999% {opacity: 0; " + kAnimationTimingFunctionPropertyName + ": linear;}";
                j = "50% {opacity: 1; " + kAnimationTimingFunctionPropertyName + ": linear;}";
                g = "100% {opacity: 1; " + kAnimationTimingFunctionPropertyName + ": linear;}";
                if (m !== 0) {
                    k = ((100 - m) / 2 + m - this.kDelta) - this.kDelta + "% {opacity: 0; " + kAnimationTimingFunctionPropertyName + ": linear;}";
                    j = ((100 - m) / 2 + m) + "% {opacity: 1; " + kAnimationTimingFunctionPropertyName + ": linear;}"
                }
                b.appendRule(l);
                b.appendRule(k);
                b.appendRule(j);
                b.appendRule(g);
                d.cssAnimationRules.push(e);
                continue
            }
            if (!isIE) {
                b = gShowController.animationManager.createAnimation(e);
                for (var c = 0,
                a = f.keyframes.length; c < a; c++) {
                    o = f.keyframes[c];
                    h = this.createAnimationRuleForKeyframe(n, o, d) + " ";
                    b.appendRule(h)
                }
                d.cssAnimationRules.push(e)
            } else {
                if (browserVersion >= 10) {
                    for (var c = 0,
                    a = f.keyframes.length; c < a; c++) {
                        o = f.keyframes[c];
                        h += this.createAnimationRuleForKeyframe(n, o, d) + " "
                    }
                    gShowController.animationManager.styleSheet.insertRule(kKeyframesPropertyName + " " + e + " {" + h + "}", 0);
                    d.cssAnimationRules.push(e)
                }
            }
        }
    },
    createAnimationRuleForKeyframe: function(l, m, g) {
        var j = m.keyframe;
        var f = m.keyName;
        var k = m.value;
        var n = m.timingFunction;
        var d;
        var c = g.transformOriginValue;
        var e = g.transformOriginZValue;
        var h = "";
        if (c) {
            h = kTransformOriginPropertyName + ": " + c + ";"
        }
        if (g.animationInfo.name === "apple:ca-swing" && f === "hidden") {
            h = ""
        }
        if (f === "hidden") {
            var a = {
                scalar: -1
            };
            if (k.scalar == false) {
                a.scalar = 1
            } else {
                a.scalar = 0
            }
            f = "opacity";
            d = this.cssPropertyValueForActionValue(l, f, a)
        } else {
            d = this.cssPropertyValueForActionValue(l, f, k)
        }
        var b;
        b = this.cssPropertyNameForAction(f) + ": " + d + "; " + (j < 100 ? kAnimationTimingFunctionPropertyName + ": " + n + ";": "");
        var i = j + "% {" + h + b + "}";
        return i
    },
    cssPropertyValueForActionValue: function(b, a, c) {
        switch (a) {
        case "hidden":
            if (c.scalar == true) {
                return "hidden"
            } else {
                return "visible"
            }
        case "anchorPoint":
            return c.pointX + "% " + c.pointY + "%";
        case "anchorPointZ":
            return c.scalar;
        case "position":
            return "translate(" + c.pointX + "px," + c.pointY + "px)";
        case "zPosition":
            if (b == "anchorPointZ" && (Prototype.Browser.Gecko || navigator.userAgent.lastIndexOf("Chrome/") > 0)) {
                return "translateZ(" + -c.scalar + "px)"
            } else {
                return "translateZ(" + c.scalar + "px)"
            }
        case "translationEmphasis":
            return "translateX(" + c.translationEmphasis[0] + "px) translateY(" + c.translationEmphasis[1] + "px) translateZ(" + c.translationEmphasis[2] + ")";
        case "rotationEmphasis":
            return "rotateZ(" + c.rotationEmphasis[6] + "rad)";
        case "scaleEmphasis":
            return "scale3d(" + ensureScaleFactorNotZero(c.scaleEmphasis[3]) + "," + ensureScaleFactorNotZero(c.scaleEmphasis[4]) + "," + ensureScaleFactorNotZero(c.scaleEmphasis[5]) + ")";
        case "transform.scale":
        case "transform.scale.xy":
            return "scale(" + ensureScaleFactorNotZero(c.scalar) + ")";
        case "transform.scale.x":
            return "scaleX(" + ensureScaleFactorNotZero(c.scalar) + ")";
        case "transform.scale.y":
            return "scaleY(" + ensureScaleFactorNotZero(c.scalar) + ")";
        case "transform.rotation.x":
            return "rotateX(" + c.scalar + "rad)";
        case "transform.rotation.y":
            return "rotateY(" + c.scalar + "rad)";
        case "transform.rotation.z":
        case "transform.rotation":
            return "rotateZ(" + c.scalar + "rad)";
        case "transform.translation":
            return "translateX(" + c.pointX + "px) translateY(" + c.pointY + "px)";
        case "transform.translation.x":
            return "translateX(" + c.scalar + "px)";
        case "transform.translation.y":
            return "translateY(" + c.scalar + "px)";
        case "transform.translation.z":
            return "translateZ(" + c.scalar + "px)";
        case "isPlaying":
        case "opacity":
        case "opacityMultiplier":
            return c.scalar + "";
        case "transform":
            return "matrix3d(" + c.transform + ")";
        case "doubleSided":
            if (c.scalar == false) {
                return "hidden"
            } else {
                return "visible"
            }
        case "contents":
            return c.texture;
        default:
            return "some value"
        }
    },
    cssPropertyNameForAction: function(a) {
        switch (a) {
        case "hidden":
            return kVisibilityPropertyName;
        case "anchorPoint":
            return kTransformOriginPropertyName;
        case "anchorPointZ":
            return kTransformOriginZPropertyName;
        case "opacityMultiplier":
            return kOpacityPropertyName;
        case "translationEmphasis":
        case "rotationEmphasis":
        case "scaleEmphasis":
        case "position":
        case "zPosition":
        case "transform":
        case "transform.scale":
        case "transform.scale.xy":
        case "transform.scale.x":
        case "transform.scale.y":
        case "transform.rotation.x":
        case "transform.rotation.y":
        case "transform.rotation.z":
        case "transform.rotation":
        case "transform.translation":
        case "transform.translation.x":
        case "transform.translation.y":
        case "transform.translation.z":
        case "bounds":
            return kTransformPropertyName;
        case "doubleSided":
            return kBackfaceVisibilityPropertyName;
        case "contents":
            return kBackgroundImagePropertyName;
        default:
            return a
        }
    }
});