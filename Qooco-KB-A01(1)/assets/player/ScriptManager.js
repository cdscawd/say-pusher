var kShowSizeDidChangeEvent = "ScriptManager:ShowSizeDidChangeEvent";
var kScriptDidDownloadEvent = "ScriptManager:ScriptDidDownloadEvent";
var kScriptDidNotDownloadEvent = "ScriptManager:ScriptDidNotDownloadEvent";
var kSlideDidDownloadEvent = "SlideManager:SlideDidDownloadEvent";
var kSlideDidNotDownloadEvent = "SlideManager:SlideDidNotDownloadEvent";
var ScriptManager = Class.create({
    initialize: function(a) {
        this.script = null;
        this.showUrl = a;
        this.slideManager = null;
        document.observe(kSlideDidDownloadEvent, this.handleSlideDidDownloadEvent.bind(this));
        document.observe(kSlideDidNotDownloadEvent, this.handleSlideDidDownloadEvent.bind(this))
    },
    handleSlideDidDownloadEvent: function(d) {
        var l = true;
        for (var m in this.slideManager.slides) {
            if (this.slideManager.slides.hasOwnProperty(m)) {
                if (!this.slideManager.slides[m].downloaded) {
                    l = false;
                    break
                }
            }
        }
        if (l) {
            this.script.events = [];
            this.script.originalEvents = [];
            this.script.slideIndexFromSceneIndexLookup = {};
            this.script.sceneIndexFromSlideIndexLookup = {};
            this.script.slides = {};
            this.script.originalSlides = {};
            var n, h, j, g, k = 0,
            b = 0,
            a = 0;
            for (var m in this.slideManager.slides) {
                if (this.slideManager.slides.hasOwnProperty(m)) {
                    j = this.slideManager.slides[m].script;
                    g = this.slideManager.slides[m].originalScript;
                    n = j.events;
                    h = g.events;
                    this.script.slides[m] = j;
                    this.script.originalSlides[m] = g;
                    this.script.sceneIndexFromSlideIndexLookup[k] = b;
                    for (var f = 0,
                    e = n.length; f < e; f++) {
                        this.script.events.push(n[f]);
                        this.script.originalEvents.push(h[f]);
                        this.script.slideIndexFromSceneIndexLookup[a] = k;
                        a += 1
                    }
                    k += 1;
                    b = a
                }
            }
            this.script.numScenes = this.script.events.length;
            this.script.lastSceneIndex = this.script.numScenes - 1;
            this.script.lastSlideIndex = this.script.slideList.length - 1;
            this.script.originalSlideWidth = this.script.slideWidth;
            this.script.originalSlideHeight = this.script.slideHeight;
            if (isIE || isEdge) {
                this.adjustScriptForIE()
            } else {
                this.adjustScript()
            }
            if (this.delegate.setViewScale) {
                this.applyScaleFactor();
                this.delegate.setViewScale(this.scaleFactor)
            }
            if (this.delegate.isUsingPreloadedFont && this.delegate.isUsingPreloadedFont()) {
                var c = document.createElement("style");
                c.type = "text/css";
                c.appendChild(document.createTextNode(this.delegate.getFontFamilyDefinitionsCssString()));
                document.getElementsByTagName("head")[0].appendChild(c)
            } else {
                this.getFontFamilyDefinitionsCssString()
            }
            document.fire(kScriptDidDownloadEvent, {
                script: this.script,
                delegate: this.delegate
            });
            document.fire(kShowSizeDidChangeEvent, {
                width: this.script.slideWidth,
                height: this.script.slideHeight
            })
        }
    },
    getFontFamilyDefinitionsCssString: function() {
        if (typeof(GSFT) === "undefined") {
            GSFT = {}
        }
        GSFT.FontFamilyDefinitionsJsonp = GSFT.FontFamilyDefinitionsJsonp || {};
        GSFT.FontFamilyDefinitionsJsonp.urlPrefix = "https://www.icloud.com";
        GSFT.FontFamilyDefinitionsJsonp.cssStringDictReady = function(d) {
            var g = "";
            var f = gShowController.scriptManager.script.fonts;
            var c = document.createElement("style");
            c.type = "text/css";
            for (var b = 0,
            e = f.length; b < e; b++) {
                var a = f[b];
                if (d[a]) {
                    g = g + d[a]
                }
            }
            c.appendChild(document.createTextNode(g));
            document.getElementsByTagName("head")[0].appendChild(c)
        }; (function() {
            var a = document.createElement("script");
            a.src = GSFT.FontFamilyDefinitionsJsonp.urlPrefix + "/applications/iw/current/fonts/font_family_definitions_jsonp.json";
            document.getElementsByTagName("head")[0].appendChild(a)
        })()
    },
    adjustScript: function() {
        for (var c = 0,
        f = this.script.events.length; c < f; c++) {
            var d = this.script.events[c];
            var e = this.script.originalEvents[c];
            for (var h = 0,
            o = d.effects.length; h < o; h++) {
                var s = d.effects[h];
                var m = e.effects[h];
                this.adjustEffects(s, m);
                this.adjustEmphasisBuilds(s, m);
                if (isChrome) {
                    this.adjustEffectsForChrome(s, m)
                }
                if (browserPrefix === "moz") {
                    this.adjustEffectsForFirefox(s, m)
                }
            }
            for (var h = 0,
            b = d.hyperlinks.length; h < b; h++) {
                var q = d.hyperlinks[h];
                var n = e.hyperlinks[h];
                for (var r in q.events) {
                    var k = q.events[r];
                    var l = n.events[r];
                    for (var g = 0,
                    o = k.effects.length; g < o; g++) {
                        var p = k.effects[g];
                        var a = l.effects[g];
                        this.adjustEffects(p, a);
                        this.adjustEmphasisBuilds(p, a);
                        if (isChrome) {
                            this.adjustEffectsForChrome(s, m)
                        }
                        if (browserPrefix === "moz") {
                            this.adjustEffectsForFirefox(s, m)
                        }
                    }
                }
            }
        }
    },
    adjustEffects: function(d, a) {
        switch (d.name) {
        case "apple:doorway":
            var c = a.baseLayer.layers[0];
            var f = d.baseLayer.layers[0];
            var b = c.layers[1];
            c.layers[1] = c.layers[2];
            c.layers[2] = b;
            var e = f.layers[1];
            f.layers[1] = f.layers[2];
            f.layers[2] = e;
            if (isChrome) {
                c.layers[1].layers[0].initialState.masksToBounds = true;
                c.layers[1].layers[1].initialState.masksToBounds = true;
                f.layers[1].layers[0].initialState.masksToBounds = true;
                f.layers[1].layers[1].initialState.masksToBounds = true;
                c.layers[1].layers[0].layers[0].initialState.masksToBounds = true;
                c.layers[1].layers[1].layers[0].initialState.masksToBounds = true;
                f.layers[1].layers[0].layers[0].initialState.masksToBounds = true;
                f.layers[1].layers[1].layers[0].initialState.masksToBounds = true
            }
            break;
        case "com.apple.iWork.Keynote.BLTBlinds":
            if (d.type === "transition") {
                var c = a.baseLayer.layers[0];
                var f = d.baseLayer.layers[0];
                f.layers.splice(0, 2);
                c.layers.splice(0, 2)
            }
            break;
        case "apple:apple-grid":
            var c = a.baseLayer.layers[0];
            var f = d.baseLayer.layers[0];
            f.layers.splice(0, 2);
            c.layers.splice(0, 2);
            break;
        case "com.apple.iWork.Keynote.BLTSwoosh":
            var c = a.baseLayer.layers[0];
            var f = d.baseLayer.layers[0];
            if (d.type === "transition") {
                f.layers[1].layers[0].layers.splice(0, 1);
                c.layers[1].layers[0].layers.splice(0, 1);
                var b = c.layers[1];
                c.layers[1] = c.layers[2];
                c.layers[2] = b;
                var e = f.layers[1];
                f.layers[1] = f.layers[2];
                f.layers[2] = e
            }
            break;
        default:
            break
        }
    },
    adjustEmphasisBuilds: function(t, o) {
        switch (t.name) {
        case "apple:action-jiggle":
            var m = o.baseLayer.layers[0];
            var n = t.baseLayer.layers[0];
            if (!m.animations[0]) {
                m = o.baseLayer.layers[0].layers[0];
                n = t.baseLayer.layers[0].layers[0]
            }
            var b = m.animations[0];
            var f = n.animations[0];
            var a = f.animations.length;
            for (var h = 0; h < a; h++) {
                var l = Math.ceil(f.duration / f.animations[h].duration);
                for (var g = 0; g < l - 1; g++) {
                    var r = JSON.parse(JSON.stringify(b.animations[h]));
                    var e = JSON.parse(JSON.stringify(f.animations[h]));
                    r.beginTime = b.animations[h].duration * (g + 1);
                    e.beginTime = f.animations[h].duration * (g + 1);
                    m.animations[0].animations.push(r);
                    n.animations[0].animations.push(e);
                    if (g === l - 2) {
                        r.duration = f.duration - r.beginTime;
                        e.duration = f.duration - e.beginTime;
                        if (f.animations[h].property === "transform.rotation.z") {
                            r.to.scalar = 0;
                            e.to.scalar = 0
                        } else {
                            if (f.animations[h].property === "position") {
                                r.to.pointX = (r.from.pointX + r.to.pointX) / 2;
                                e.to.pointX = (e.from.pointX + e.to.pointX) / 2
                            }
                        }
                    }
                }
            }
            break;
        case "apple:action-blink":
        case "apple:action-pulse":
            var m = o.baseLayer.layers[0];
            var n = t.baseLayer.layers[0];
            if (!m.animations[0]) {
                m = o.baseLayer.layers[0].layers[0];
                n = t.baseLayer.layers[0].layers[0]
            }
            var b = m.animations[0];
            var f = n.animations[0];
            var q = [];
            var p = [];
            var s = 0;
            var l = 1;
            if (f.repeatCount) {
                l = Math.floor(f.repeatCount)
            }
            m.animations[0].duration = f.duration * l;
            n.animations[0].duration = f.duration * l;
            for (var h = 0,
            a = f.animations.length; h < a; h++) {
                p.push(JSON.stringify(f.animations[h]));
                q.push(JSON.stringify(b.animations[h]));
                s = f.animations[h].beginTime + f.animations[h].duration
            }
            for (var h = 0; h < l - 1; h++) {
                for (var g = 0,
                a = p.length; g < a; g++) {
                    var r = JSON.parse(q[g]);
                    var e = JSON.parse(p[g]);
                    r.beginTime = s;
                    e.beginTime = s;
                    m.animations[0].animations.push(r);
                    n.animations[0].animations.push(e);
                    s = r.beginTime + r.duration
                }
            }
            break;
        default:
            break
        }
        for (var d = 0,
        c = t.effects.length; d < c; d++) {
            this.adjustEmphasisBuilds(t.effects[d], o.effects[d])
        }
    },
    adjustEffectsForChrome: function(p, l) {
        switch (p.name) {
        case "apple:fall":
            var o = l.baseLayer.layers[0];
            var k = p.baseLayer.layers[0];
            var a = o.layers[1].animations[0].beginTime;
            var b = o.layers[1].animations[0].duration;
            if (!o.layers[1].animations[0].animations) {
                break
            }
            var c = {
                animations: [],
                beginTime: a,
                duration: b - 0.01,
                fillMode: "forwards",
                from: {
                    scalar: 1
                },
                property: "transform.translation.z",
                timingFunction: "linear",
                to: {
                    scalar: 1
                }
            };
            var n = {
                animations: [],
                beginTime: b - 0.01,
                duration: 0.01,
                fillMode: "forwards",
                from: {
                    scalar: -1
                },
                property: "transform.translation.z",
                timingFunction: "linear",
                to: {
                    scalar: -1
                }
            };
            o.layers[1].animations[0].animations.push(c);
            k.layers[1].animations[0].animations.push(c);
            o.layers[1].animations[0].animations.push(n);
            k.layers[1].animations[0].animations.push(n);
            break;
        case "apple:scale":
            var o = l.baseLayer.layers[0];
            var k = p.baseLayer.layers[0];
            if (o.layers[0].animations.length > 0) {
                var i = o.layers[0];
                o.layers[0] = o.layers[1];
                o.layers[1] = i;
                o.layers[1].initialState.hidden = true;
                var e = k.layers[0];
                k.layers[0] = k.layers[1];
                k.layers[1] = e;
                k.layers[1].initialState.hidden = true;
                var a = o.layers[1].animations[0].beginTime;
                var b = o.layers[1].animations[0].duration;
                var g = o.layers[1].animations[0].animations[0].beginTime;
                var d = o.layers[1].animations[0].animations[0].duration;
                var h;
                if (a == g) {
                    for (var f = 0,
                    m = o.layers[1].animations[0].animations.length; f < m; f++) {
                        if (o.layers[1].animations[0].animations[f].property === "transform.translation.z") {
                            o.layers[1].animations[0].animations.splice(f, 1);
                            k.layers[1].animations[0].animations.splice(f, 1)
                        }
                    }
                    h = {
                        animations: [],
                        beginTime: a,
                        duration: b,
                        fillMode: "forwards",
                        from: {
                            scalar: false
                        },
                        property: "hidden",
                        timingFunction: "linear",
                        to: {
                            scalar: false
                        }
                    };
                    o.layers[1].animations[0].animations.push(h);
                    k.layers[1].animations[0].animations.push(h)
                } else {
                    for (var f = 0,
                    m = o.layers[1].animations[0].animations[0].animations.length; f < m; f++) {
                        if (o.layers[1].animations[0].animations[0].animations[f].property === "transform.translation.z") {
                            o.layers[1].animations[0].animations[0].animations.splice(f, 1);
                            k.layers[1].animations[0].animations[0].animations.splice(f, 1)
                        }
                    }
                    h = {
                        animations: [],
                        beginTime: o.layers[1].animations[0].animations[0].animations[0].beginTime + 0.03,
                        duration: o.layers[1].animations[0].animations[0].animations[0].duration,
                        fillMode: "forwards",
                        from: {
                            scalar: false
                        },
                        property: "hidden",
                        timingFunction: "linear",
                        to: {
                            scalar: false
                        }
                    };
                    o.layers[1].animations[0].animations[0].animations.push(h);
                    k.layers[1].animations[0].animations[0].animations.push(h)
                }
            }
            break;
        default:
            break
        }
    },
    adjustEffectsForFirefox: function(r, m) {
        switch (r.name) {
        case "apple:scale":
            var q = m.baseLayer.layers[0];
            var k = r.baseLayer.layers[0];
            if (q.layers[0].animations.length > 0) {
                var l = q.layers[0];
                q.layers[0] = q.layers[1];
                q.layers[1] = l;
                q.layers[1].initialState.hidden = true;
                var f = k.layers[0];
                k.layers[0] = k.layers[1];
                k.layers[1] = f;
                k.layers[1].initialState.hidden = true;
                var a = q.layers[1].animations[0].beginTime;
                var c = q.layers[1].animations[0].duration;
                var h = q.layers[1].animations[0].animations[0].beginTime;
                var e = q.layers[1].animations[0].animations[0].duration;
                var i;
                if (a == h) {
                    for (var g = 0,
                    o = q.layers[1].animations[0].animations.length; g < o; g++) {
                        if (q.layers[1].animations[0].animations[g].property === "transform.translation.z") {
                            q.layers[1].animations[0].animations.splice(g, 1);
                            k.layers[1].animations[0].animations.splice(g, 1)
                        }
                    }
                    i = {
                        animations: [],
                        beginTime: a,
                        duration: c,
                        fillMode: "forwards",
                        from: {
                            scalar: false
                        },
                        property: "hidden",
                        timingFunction: "linear",
                        to: {
                            scalar: false
                        }
                    };
                    q.layers[1].animations[0].animations.push(i);
                    k.layers[1].animations[0].animations.push(i)
                } else {
                    for (var g = 0,
                    o = q.layers[1].animations[0].animations[0].animations.length; g < o; g++) {
                        if (q.layers[1].animations[0].animations[0].animations[g].property === "transform.translation.z") {
                            q.layers[1].animations[0].animations[0].animations.splice(g, 1);
                            k.layers[1].animations[0].animations[0].animations.splice(g, 1)
                        }
                    }
                    i = {
                        animations: [],
                        beginTime: q.layers[1].animations[0].animations[0].animations[0].beginTime + 0.03,
                        duration: q.layers[1].animations[0].animations[0].animations[0].duration,
                        fillMode: "forwards",
                        from: {
                            scalar: false
                        },
                        property: "hidden",
                        timingFunction: "linear",
                        to: {
                            scalar: false
                        }
                    };
                    q.layers[1].animations[0].animations[0].animations.push(i);
                    k.layers[1].animations[0].animations[0].animations.push(i)
                }
            }
            break;
        case "com.apple.iWork.Keynote.KLNSwap":
            var q = m.baseLayer.layers[0];
            var k = r.baseLayer.layers[0];
            var e, d, n, b, p;
            if (q.layers[1].animations[0].animations.length > 1) {
                for (var g = 0,
                o = q.layers[1].animations[0].animations.length; g < o; g++) {
                    b = q.layers[1].animations[0].animations[g];
                    p = k.layers[1].animations[0].animations[g];
                    if (b.property === "opacity") {
                        break
                    }
                }
                e = q.layers[1].animations[0].duration
            } else {
                for (var g = 0,
                o = q.layers[1].animations[0].animations[0].animations.length; g < o; g++) {
                    b = q.layers[1].animations[0].animations[0].animations[g];
                    p = k.layers[1].animations[0].animations[0].animations[g];
                    if (b.property === "opacity") {
                        break
                    }
                }
                e = q.layers[1].animations[0].animations[0].duration
            }
            d = e * 0.4;
            n = e * 0.4;
            b.to.scalar = 0;
            b.beginTime = d;
            b.duration = n;
            p.to.scalar = 0;
            p.beginTime = d;
            p.duration = n;
            break;
        default:
            break
        }
    },
    adjustScriptForIE: function() {
        for (var c = 0,
        f = this.script.events.length; c < f; c++) {
            var d = this.script.events[c];
            var e = this.script.originalEvents[c];
            for (var h = 0,
            o = d.effects.length; h < o; h++) {
                var s = d.effects[h];
                var m = e.effects[h];
                this.adjustEffectsForIE(s, m);
                this.adjustEmphasisBuilds(s, m)
            }
            for (var h = 0,
            b = d.hyperlinks.length; h < b; h++) {
                var q = d.hyperlinks[h];
                var n = e.hyperlinks[h];
                for (var r in q.events) {
                    var k = q.events[r];
                    var l = n.events[r];
                    for (var g = 0,
                    o = k.effects.length; g < o; g++) {
                        var p = k.effects[g];
                        var a = l.effects[g];
                        this.adjustEffectsForIE(p, a);
                        this.adjustEmphasisBuilds(p, a)
                    }
                }
            }
        }
    },
    adjustEffectsForIE: function(r, m) {
        switch (r.name) {
        case "apple:bounce":
        case "apple:slide":
        case "apple:pivot":
        case "apple:scale":
            var q = m.baseLayer.layers[0];
            var k = r.baseLayer.layers[0];
            if (q.layers[0].animations.length > 0) {
                var l = q.layers[0];
                q.layers[0] = q.layers[1];
                q.layers[1] = l;
                q.layers[1].initialState.hidden = true;
                var f = k.layers[0];
                k.layers[0] = k.layers[1];
                k.layers[1] = f;
                k.layers[1].initialState.hidden = true;
                var a = q.layers[1].animations[0].beginTime;
                var c = q.layers[1].animations[0].duration;
                var h = q.layers[1].animations[0].animations[0].beginTime;
                var e = q.layers[1].animations[0].animations[0].duration;
                var i;
                if (a == h) {
                    for (var g = 0,
                    o = q.layers[1].animations[0].animations.length; g < o; g++) {
                        if (q.layers[1].animations[0].animations[g].property === "transform.translation.z") {
                            q.layers[1].animations[0].animations.splice(g, 1);
                            k.layers[1].animations[0].animations.splice(g, 1)
                        }
                    }
                    i = {
                        animations: [],
                        beginTime: a,
                        duration: c,
                        fillMode: "forwards",
                        from: {
                            scalar: false
                        },
                        property: "hidden",
                        timingFunction: "linear",
                        to: {
                            scalar: false
                        }
                    };
                    q.layers[1].animations[0].animations.push(i);
                    k.layers[1].animations[0].animations.push(i)
                } else {
                    for (var g = 0,
                    o = q.layers[1].animations[0].animations[0].animations.length; g < o; g++) {
                        if (q.layers[1].animations[0].animations[0].animations[g].property === "transform.translation.z") {
                            q.layers[1].animations[0].animations[0].animations.splice(g, 1);
                            k.layers[1].animations[0].animations[0].animations.splice(g, 1)
                        }
                    }
                    i = {
                        animations: [],
                        beginTime: q.layers[1].animations[0].animations[0].animations[0].beginTime + 0.03,
                        duration: q.layers[1].animations[0].animations[0].animations[0].duration,
                        fillMode: "forwards",
                        from: {
                            scalar: false
                        },
                        property: "hidden",
                        timingFunction: "linear",
                        to: {
                            scalar: false
                        }
                    };
                    q.layers[1].animations[0].animations[0].animations.push(i);
                    k.layers[1].animations[0].animations[0].animations.push(i)
                }
            }
            break;
        case "apple:doorway":
            var q = m.baseLayer.layers[0];
            var k = r.baseLayer.layers[0];
            var a = q.layers[0].animations[0].beginTime;
            var c = q.layers[0].animations[0].duration;
            var h = q.layers[0].animations[0].animations[0].beginTime;
            var e = q.layers[0].animations[0].animations[0].duration;
            q.layers[0].layers = [];
            q.layers[0].animations = [];
            k.layers[0].layers = [];
            k.layers[0].animations = [];
            if (a == h) {
                q.layers[1].animations[0].animations[0].beginTime = h;
                q.layers[1].animations[0].animations[0].duration = e;
                k.layers[1].animations[0].animations[0].beginTime = h;
                k.layers[1].animations[0].animations[0].duration = e
            } else {
                q.layers[1].animations[0].animations[0].animations[0].duration = e;
                k.layers[1].animations[0].animations[0].animations[0].duration = e
            }
            q.layers.splice(2, 1);
            k.layers.splice(2, 1);
            break;
        case "com.apple.iWork.Keynote.BLTBlinds":
        case "apple:3D-cube":
        case "com.apple.iWork.Keynote.BLTReflection":
        case "apple:revolve":
        case "com.apple.iWork.Keynote.BLTRevolvingDoor":
            var q = m.baseLayer.layers[0];
            var k = r.baseLayer.layers[0];
            var p;
            p = {
                animations: [],
                beginTime: 0,
                duration: m.duration,
                fillMode: "both",
                from: {
                    scalar: 1
                },
                property: "opacity",
                timingFunction: "easeInEaseOut",
                to: {
                    scalar: 0
                }
            };
            q.layers[0].layers = [];
            q.layers[0].animations = [];
            q.layers[1].layers = [];
            q.layers[1].animations = [];
            q.layers[1].animations.push(p);
            k.layers[0].layers = [];
            k.layers[0].animations = [];
            k.layers[1].layers = [];
            k.layers[1].animations = [];
            k.layers[1].animations.push(p);
            if (r.name === "com.apple.iWork.Keynote.BLTBlinds") {
                q.layers[0].initialState.hidden = false;
                q.layers[1].initialState.hidden = false;
                k.layers[0].initialState.hidden = false;
                k.layers[1].initialState.hidden = false;
                q.layers.splice(2, q.layers.length - 2);
                k.layers.splice(2, k.layers.length - 2)
            }
            break;
        case "com.apple.iWork.Keynote.KLNSwap":
            var q = m.baseLayer.layers[0];
            var k = r.baseLayer.layers[0];
            var e, d, n, b, p;
            if (q.layers[1].animations[0].animations.length > 1) {
                for (var g = 0,
                o = q.layers[1].animations[0].animations.length; g < o; g++) {
                    b = q.layers[1].animations[0].animations[g];
                    p = k.layers[1].animations[0].animations[g];
                    if (b.property === "opacity") {
                        break
                    }
                }
                e = q.layers[1].animations[0].duration
            } else {
                for (var g = 0,
                o = q.layers[1].animations[0].animations[0].animations.length; g < o; g++) {
                    b = q.layers[1].animations[0].animations[0].animations[g];
                    p = k.layers[1].animations[0].animations[0].animations[g];
                    if (b.property === "opacity") {
                        break
                    }
                }
                e = q.layers[1].animations[0].animations[0].duration
            }
            d = e * 0.4;
            n = e * 0.4;
            b.to.scalar = 0;
            b.beginTime = d;
            b.duration = n;
            p.to.scalar = 0;
            p.beginTime = d;
            p.duration = n;
            break;
        case "apple:FlipThrough":
            var q = m.baseLayer.layers[0];
            var k = r.baseLayer.layers[0];
            if (q.layers[0].animations.length > 0) {
                var l = JSON.parse(JSON.stringify(q.layers[1]));
                q.layers.splice(0, 0, l);
                var f = JSON.parse(JSON.stringify(k.layers[1]));
                k.layers.splice(0, 0, f);
                var a = q.layers[1].animations[0].beginTime;
                var c = q.layers[1].animations[0].duration;
                var h = q.layers[1].animations[0].animations[0].beginTime;
                var e = q.layers[1].animations[0].animations[0].duration;
                var i;
                if (a == h) {
                    for (var g = 0,
                    o = q.layers[1].animations[0].animations.length; g < o; g++) {
                        if (q.layers[1].animations[0].animations[g].property === "transform.translation.z") {
                            q.layers[1].animations[0].animations.splice(g, 1);
                            k.layers[1].animations[0].animations.splice(g, 1)
                        }
                    }
                    i = {
                        animations: [],
                        beginTime: a + c / 2,
                        duration: c / 2,
                        fillMode: "forwards",
                        from: {
                            scalar: true
                        },
                        property: "hidden",
                        timingFunction: "linear",
                        to: {
                            scalar: true
                        }
                    };
                    q.layers[2].animations[0].animations.push(i);
                    k.layers[2].animations[0].animations.push(i)
                } else {
                    for (var g = 0,
                    o = q.layers[1].animations[0].animations[0].animations.length; g < o; g++) {
                        if (q.layers[1].animations[0].animations[0].animations[g].property === "transform.translation.z") {
                            q.layers[1].animations[0].animations[0].animations.splice(g, 1);
                            k.layers[1].animations[0].animations[0].animations.splice(g, 1)
                        }
                    }
                    i = {
                        animations: [],
                        beginTime: q.layers[2].animations[0].animations[0].animations[0].beginTime + q.layers[2].animations[0].animations[0].animations[0].duration / 2,
                        duration: q.layers[2].animations[0].animations[0].animations[0].duration / 2,
                        fillMode: "forwards",
                        from: {
                            scalar: true
                        },
                        property: "hidden",
                        timingFunction: "linear",
                        to: {
                            scalar: true
                        }
                    };
                    q.layers[2].animations[0].animations[0].animations.push(i);
                    k.layers[2].animations[0].animations[0].animations.push(i)
                }
            }
            break;
        default:
            break
        }
    },
    handleSlideDidNotDownloadEvent: function(a) {
        this.scriptDidNotDownload.bind(this)
    },
    reapplyScaleFactor: function() {
        if (this.delegate.setViewScale) {
            this.applyScaleFactor();
            this.delegate.setViewScale(this.scaleFactor)
        }
    },
    applyScaleFactorForAnimation: function(c, b, g) {
        var h = c.property;
        if (c.path) {
            for (var e = 0,
            k = c.path.length; e < k; e++) {
                var j = c.path[e].points;
                var d = b.path[e].points;
                j[0][0] = d[0][0] * g;
                j[0][1] = d[0][1] * g
            }
        }
        switch (h) {
        case "anchorPointZ":
        case "zPosition":
        case "transform.translation.x":
        case "transform.translation.y":
            if (c.from) {
                c.from.scalar = b.from.scalar * g
            }
            if (c.to) {
                c.to.scalar = b.to.scalar * g
            }
            if (c.values) {
                for (var e = 0,
                f = c.values.length; e < f; e++) {
                    c.values[e].scalar = b.values[e].scalar * g
                }
            }
            break;
        case "transform.translation.z":
            if (c.from && c.from.scalar != 1 && c.from.scalar != 0.01) {
                c.from.scalar = b.from.scalar * g
            }
            if (c.to && c.to.scalar != 1 && c.to.scalar != 0.01) {
                c.to.scalar = b.to.scalar * g
            }
            if (c.values) {
                for (var e = 0,
                f = c.values.length; e < f; e++) {
                    c.values[e].scalar = b.values[e].scalar * g
                }
            }
            break;
        case "position":
        case "transform.translation":
            if (c.from) {
                c.from.pointX = b.from.pointX * g;
                c.from.pointY = b.from.pointY * g
            }
            if (c.to) {
                c.to.pointX = b.to.pointX * g;
                c.to.pointY = b.to.pointY * g
            }
            if (c.values) {
                for (var e = 0,
                f = c.values.length; e < f; e++) {
                    c.values[e].pointX = b.values[e].pointX * g;
                    c.values[e].pointY = b.values[e].pointY * g
                }
            }
            break;
        case "transform":
            if (c.from) {
                c.from.transform[12] = b.from.transform[12] * g;
                c.from.transform[13] = b.from.transform[13] * g;
                c.from.transform[14] = b.from.transform[14] * g
            }
            if (c.to) {
                c.to.transform[12] = b.to.transform[12] * g;
                c.to.transform[13] = b.to.transform[13] * g;
                c.to.transform[14] = b.to.transform[14] * g
            }
            if (c.values) {
                for (var e = 0,
                f = c.values.length; e < f; e++) {
                    c.values[e].transform[12] = b.values[e].transform[12] * g;
                    c.values[e].transform[13] = b.values[e].transform[13] * g;
                    c.values[e].transform[14] = b.values[e].transform[14] * g
                }
            }
            break;
        case "bounds":
            if (c.from) {
                c.from.width = b.from.width * g;
                c.from.height = b.from.height * g
            }
            if (c.to) {
                c.to.width = b.to.width * g;
                c.to.height = b.to.height * g
            }
            break;
        case "transform.scale.xy":
        case "transform.scale.x":
        case "transform.scale.y":
            break
        }
        if (c.animations) {
            for (var e = 0,
            a = c.animations.length; e < a; e++) {
                this.applyScaleFactorForAnimation(c.animations[e], b.animations[e], g)
            }
        }
    },
    applyScaleFactorForLayer: function(g, f, l, k, j, h) {
        var b = g.initialState;
        var d = f.initialState;
        var c = d.contentsRect;
        b.affineTransform[4] = d.affineTransform[4] * l;
        b.affineTransform[5] = d.affineTransform[5] * l;
        b.width = d.width * l;
        b.height = d.height * l;
        b.position.pointX = d.position.pointX * l;
        b.position.pointY = d.position.pointY * l;
        switch (k) {
        case "com.apple.iWork.Keynote.BLTBlinds":
        case "com.apple.iWork.Keynote.BLTMosaicFlip":
            this.adjustForCropAnimation(b, c, h.particleCount.x, h.particleCount.y);
            break;
        default:
            break
        }
        if (g.animations) {
            for (var e = 0,
            a = g.animations.length; e < a; e++) {
                this.applyScaleFactorForAnimation(g.animations[e], f.animations[e], l)
            }
        }
        for (var e = 0,
        a = g.layers.length; e < a; e++) {
            this.applyScaleFactorForLayer(g.layers[e], f.layers[e], l, k, j, h)
        }
    },
    applyScaleFactorForBaseLayer: function(b, c, f) {
        var a = b.initialState;
        var g = c.initialState;
        a.affineTransform[4] = g.affineTransform[4] * f;
        a.affineTransform[5] = g.affineTransform[5] * f;
        a.width = g.width * f;
        a.height = g.height * f;
        a.position.pointX = g.position.pointX * f;
        a.position.pointY = g.position.pointY * f;
        for (var d = 0,
        e = b.layers.length; d < e; d++) {
            this.applyScaleFactorForBaseLayer(b.layers[d], c.layers[d], f)
        }
    },
    applyScaleFactor: function() {
        var y = this.script.originalSlideWidth;
        var F = this.script.originalSlideHeight;
        var s = window.innerWidth;
        var B = window.innerHeight;
        var L = scaleSizeWithinSize(y, F, s, B);
        var f = L.width;
        var o = L.height;
        var k = o / F;
        this.scaleFactor = k;
        this.script.slideWidth = this.script.originalSlideWidth * k;
        this.script.slideHeight = this.script.originalSlideHeight * k;
        for (var Q = 0,
        q = this.script.events.length; Q < q; Q++) {
            var T = this.script.events[Q];
            var u = this.script.originalEvents[Q];
            var K = this.script.slideIndexFromSceneIndexLookup[Q];
            var I = this.script.slideList[K];
            this.applyScaleFactorForBaseLayer(T.baseLayer, u.baseLayer, k);
            for (var O = 0,
            c = T.effects.length; O < c; O++) {
                var M = T.effects[O];
                var n = u.effects[O];
                var C = {};
                if (M.name === "com.apple.iWork.Keynote.BLTMosaicFlip" || M.name === "com.apple.iWork.Keynote.BLTBlinds") {
                    var G = 0,
                    g = 0;
                    for (var b = 0,
                    J = M.baseLayer.layers[0].layers.length; b < J; b++) {
                        var d = n.baseLayer.layers[0].layers[b];
                        var e = d.initialState.contentsRect;
                        var l = Math.round(e.x / e.width);
                        var z = Math.round(e.y / e.height);
                        if (l > G) {
                            G = l
                        }
                        if (z > g) {
                            g = z
                        }
                    }
                    C.particleCount = {
                        x: G + 1,
                        y: g + 1
                    }
                }
                this.applyScaleFactorForLayer(M.baseLayer, n.baseLayer, k, M.name, I, C)
            }
            for (var O = 0,
            t = T.hyperlinks.length; O < t; O++) {
                var h = T.hyperlinks[O];
                var w = u.hyperlinks[O];
                var A = h.targetRectangle;
                var D = w.targetRectangle;
                A.y = D.y * k;
                A.x = D.x * k;
                A.width = D.width * k;
                A.height = D.height * k;
                for (var H in h.events) {
                    var m = h.events[H];
                    var x = w.events[H];
                    for (var N = 0,
                    c = m.effects.length; N < c; N++) {
                        var R = m.effects[N];
                        var S = x.effects[N];
                        var C = {};
                        if (R.name === "com.apple.iWork.Keynote.BLTMosaicFlip" || R.name === "com.apple.iWork.Keynote.BLTBlinds") {
                            var G = 0,
                            g = 0;
                            for (var b = 0,
                            J = R.baseLayer.layers[0].layers.length; b < J; b++) {
                                var d = R.baseLayer.layers[0].layers[b];
                                var e = d.initialState.contentsRect;
                                var l = Math.round(e.x / e.width);
                                var z = Math.round(e.y / e.height);
                                if (l > G) {
                                    G = l
                                }
                                if (z > g) {
                                    g = z
                                }
                            }
                            C.particleCount = {
                                x: G + 1,
                                y: g + 1
                            }
                        }
                        this.applyScaleFactorForLayer(R.baseLayer, S.baseLayer, k, R.name, I, C)
                    }
                }
            }
        }
        for (var p in this.script.slides) {
            if (this.script.slides.hasOwnProperty(p)) {
                var a = this.script.slides[p];
                var v = this.script.originalSlides[p];
                for (var E in a.assets) {
                    if (a.assets.hasOwnProperty(E)) {
                        var r = a.assets[E];
                        var P = v.assets[E];
                        r.width = P.width * k;
                        r.height = P.height * k
                    }
                }
            }
        }
    },
    adjustForCropAnimation: function(a, b, i, h) {
        var d = this.script.slideWidth;
        var f = this.script.slideHeight;
        var j = Math.floor(d / i);
        var g = Math.floor(f / h);
        var e = Math.round(b.x / b.width);
        var c = Math.round(b.y / b.height);
        if (b.width != 1 || b.height != 1) {
            if (e != i - 1) {
                a.width = j
            } else {
                a.width = d - j * (i - 1)
            }
            if (c != h - 1) {
                a.height = g
            } else {
                a.height = f - g * (h - 1)
            }
            a.position.pointX = j * e + a.width / 2;
            a.position.pointY = g * c + a.height / 2;
            a.contentsRect.x = j * e / d;
            a.contentsRect.y = g * c / f;
            a.contentsRect.width = a.width / d;
            a.contentsRect.height = a.height / f
        }
    },
    downloadScript: function(b) {
        this.delegate = b;
        if (this.delegate.getKPFJsonStringForShow) {
            this.script = JSON.parse(this.delegate.getKPFJsonStringForShow());
            if (this.script == null) {
                debugMessageAlways(kDebugScriptMangaer_DownloadScript, "An error occured on the server. KPF header json is null.");
                return
            }
            this.slideManager = new SlideManager({
                header: this.script
            });
            this.slideManager.getSlides(this.script.slideList, this.delegate);
            return
        }
        this.downloadTimeout = setTimeout(this.scriptDidNotDownload.bind(this), kMaxScriptDownloadWaitTime);
        this.downloadAlreadyFailed = false;
        var c = this.showUrl + "header.json";
        if (window.location.protocol === "file:") {
            c = c + "p";
            window.local_header = (function(d) {
                this.scriptDidDownload(d, true)
            }).bind(this);
            var a = document.createElement("script");
            a.setAttribute("src", c);
            document.head.appendChild(a)
        } else {
            new Ajax.Request(c, {
                method: "get",
                onSuccess: this.scriptDidDownload.bind(this),
                onFailure: this.scriptDidNotDownload.bind(this)
            })
        }
    },
    scriptDidDownload: function(b, a) {
        clearTimeout(this.downloadTimeout);
        if (a) {
            this.script = b
        } else {
            this.script = JSON.parse(b.responseText)
        }
        this.slideManager = new SlideManager({
            header: this.script
        });
        this.slideManager.downloadSlides(this.script.slideList)
    },
    scriptDidNotDownload: function(a) {
        this.downloadAlreadyFailed = true;
        if (a) {
            clearTimeout(this.downloadTimeout)
        }
        document.fire(kScriptDidNotDownloadEvent, {})
    },
    sceneIndexFromSlideIndex: function(a) {
        if ((this.script == null) || (a < 0) || (a >= this.script.slideList.length)) {
            return - 1
        }
        return this.script.sceneIndexFromSlideIndexLookup[a]
    },
    slideIndexFromSceneIndex: function(a) {
        if ((this.script == null) || (a < 0) || (a >= this.script.events.length)) {
            return - 1
        }
        return this.script.slideIndexFromSceneIndexLookup[a]
    }
});