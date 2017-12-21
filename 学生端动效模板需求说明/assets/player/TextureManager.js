var KNStaticAssets = {};
KNStaticAssets["./images/KNTransitionSwoosh_Shadow.png"] = new Image();
KNStaticAssets["./images/KNTransitionSwoosh_Shadow.png"].src = static_url("./images/KNTransitionSwoosh_Shadow.png");
KNStaticAssets["./images/KNTransitionSlide_Black.png"] = new Image();
KNStaticAssets["./images/KNTransitionSlide_Black.png"].src = static_url("./images/KNTransitionSlide_Black.png");
var TextureManager = Class.create({
    initialize: function(a) {
        this.script = null;
        this.showUrl = a;
        this.slideCache = {};
        this.sceneDidLoadCallbackHandler = null;
        this.viewScale = 1;
        document.observe(kScriptDidDownloadEvent, (function(b) {
            this.handleScriptDidDownloadEvent(b)
        }).bind(this), false)
    },
    setSceneDidLoadCallbackHandler: function(a, b) {
        this.sceneDidLoadCallbackHandler = {
            handler: a,
            sceneIndex: b
        }
    },
    processTextureDidLoadCallback: function(d, b) {
        if (this.sceneDidLoadCallbackHandler == null) {
            return
        }
        var c = this.sceneDidLoadCallbackHandler.sceneIndex;
        var a = this.script.slideIndexFromSceneIndexLookup[c];
        if (a != b) {
            return
        }
        if (this.isSlidePreloaded(b)) {
            this.callSceneDidLoadCallback();
            setTimeout(function() {
                this.destroyPDFDocument(b)
            }.bind(this), 5000)
        }
    },
    destroyPDFDocument: function(c) {
        var b = this.slideCache[c];
        if (b) {
            var a = b.pdf;
            if (a) {
                a.destroy();
                delete this.slideCache[c].pdf
            }
        }
    },
    processSlideDidLoadCallback: function(b) {
        if (this.sceneDidLoadCallbackHandler == null) {
            return
        }
        var c = this.sceneDidLoadCallbackHandler.sceneIndex;
        var a = this.script.slideIndexFromSceneIndexLookup[c];
        if (a != b) {
            return
        }
        this.callSceneDidLoadCallback()
    },
    processSceneDidLoadCallback: function(a) {
        if (this.sceneDidLoadCallbackHandler && a === this.sceneDidLoadCallbackHandler.sceneIndex && this.isScenePreloaded(a)) {
            this.callSceneDidLoadCallback()
        }
    },
    callSceneDidLoadCallback: function() {
        this.sceneDidLoadCallbackHandler.handler();
        this.sceneDidLoadCallbackHandler = null
    },
    loadScene: function(c, a) {
        if (c < 0 || c > this.script.numScenes) {
            return
        }
        if (a) {
            this.setSceneDidLoadCallbackHandler(a, c)
        }
        var b = this.script.slideIndexFromSceneIndexLookup[c];
        if (usePDF) {
            this.requestPdfDocument(b)
        } else {
            this.requestSlideSvgmap(b)
        }
    },
    preloadScenes: function(a) {
        for (var c in a) {
            var b = this.script.slideIndexFromSceneIndexLookup[c];
            if (b == null) {
                continue
            }
            if (this.slideCache.hasOwnProperty(b) === false) {
                this.loadScene(c)
            }
        }
    },
    isSlidePreloaded: function(b) {
        var a = false;
        if (this.slideCache[b]) {
            a = true;
            for (var c in this.slideCache[b].textureRequests) {
                if (this.slideCache[b].textureRequests[c] === false) {
                    a = false;
                    break
                }
            }
        }
        return a
    },
    isScenePreloaded: function(c) {
        var b = this.script.slideIndexFromSceneIndexLookup[c];
        var a = this.isSlidePreloaded(b);
        return a
    },
    handleScriptDidDownloadEvent: function(a) {
        this.script = a.memo.script;
        this.delegate = a.memo.delegate
    },
    requestPdfDocument: function(g) {
        if (!this.slideCache[g]) {
            this.slideCache[g] = {
                textureAssets: {},
                textureRequests: {},
                pdf: null,
                requested: false
            }
        }
        var f = this.script.slideList[g];
        if (!this.slideCache[g].requested) {
            var d = this.script.slides[f];
            var i = d.assets;
            for (var a in i) {
                var e = i[a];
                if (e.type === "texture") {
                    this.slideCache[g].textureRequests[a] = false
                }
            }
        } else {
            if (this.isSlidePreloaded(g)) {
                this.processSlideDidLoadCallback(g)
            }
            return
        }
        var b = this.showUrl + f + "/assets/" + f + ".pdf";
        var c = {
            slideId: f,
            slideIndex: g
        };
        this.slideCache[g].requested = true;
        if (window.location.protocol === "file:") {
            b = b + "p";
            if (window.local_pdf == null || window.local_pdf == undefined) {
                window.local_pdf = function(j) {
                    this.handleRequestLocalPdfCallback(j)
                }.bind(this)
            }
            var h = document.createElement("script");
            h.setAttribute("src", b);
            document.head.appendChild(h)
        } else {
            PDFJS.getDocument(b).then(this.handleRequestPdfDocumentCompleted.bind(this, c))
        }
    },
    handleRequestLocalPdfCallback: function(b) {
        var a = b.slide;
        var d = this.script.slideList.indexOf(a);
        var e = atob(b.pdf);
        var c = {
            slideId: a,
            slideIndex: d
        };
        PDFJS.getDocument({
            data: e
        }).then(this.handleRequestPdfDocumentCompleted.bind(this, c))
    },
    handleRequestPdfDocumentCompleted: function(d, b) {
        var i = d.slideId;
        var j = d.slideIndex;
        var f = this.script.slides[i];
        var l = f.assets;
        this.slideCache[j]["pdf"] = b;
        for (var a in l) {
            var h = l[a];
            if (h.type !== "texture") {
                continue
            }
            var g = this.urlForTexture(a, i);
            var m = /(?:\.([^.]+))?$/;
            var c = m.exec(g)[1];
            if (c.toLowerCase() === "pdf") {
                var k = h.index + 1;
                b.getPage(k).then(this.handleRequestPdfPageCompleted.bind(this, a, j))
            } else {
                var e = new Image();
                Event.observe(e, "load", this.handleImageOnloadEvent.bind(this, a, j));
                e.src = g
            }
        }
    },
    handleRequestPdfPageCompleted: function(a, i, h) {
        var g = h.getViewport(pdfScaleFactor);
        var d = document.createElement("canvas");
        var c = d.getContext("2d");
        d.height = g.height;
        d.width = g.width;
        var e = {
            canvasContext: c,
            viewport: g
        };
        var f = this;
        var b = h.render(e);
        var j = b._internalRenderTask.callback;
        b._internalRenderTask.callback = function(k) {
            j.call(this, k);
            f.slideCache[i].textureAssets[a] = d;
            f.slideCache[i].textureRequests[a] = true;
            f.processTextureDidLoadCallback(a, i)
        }
    },
    requestSlideSvgmap: function(g) {
        if (!this.slideCache[g]) {
            this.slideCache[g] = {};
            this.slideCache[g].textureAssets = {};
            this.slideCache[g].textureRequests = {}
        }
        var f = this.script.slideList[g];
        if (!this.slideCache[g]["svgmap"]) {
            var d = this.script.slides[f];
            var i = d.assets;
            for (var a in i) {
                var e = i[a];
                if (e.type === "texture") {
                    this.slideCache[g].textureRequests[a] = false
                }
            }
        } else {
            if (this.isSlidePreloaded(g)) {
                this.processSlideDidLoadCallback(g)
            }
            return
        }
        var c = this.showUrl + f + "/assets/" + f + ".svgmap";
        if (window.location.protocol === "file:") {
            c = c + "p";
            if (window.svgmap == null || window.svgmap == undefined) {
                window.svgmap = this.handleRequestSlideSvgmapCompleted.bind(this, null, true)
            }
            var h = document.createElement("script");
            h.setAttribute("src", c);
            document.head.appendChild(h)
        } else {
            var b = {
                slideId: f,
                slideIndex: g
            };
            new Ajax.Request(c, {
                method: "get",
                onSuccess: this.handleRequestSlideSvgmapCompleted.bind(this, b, false)
            })
        }
    },
    handleRequestSlideSvgmapCompleted: function(n, l, f) {
        var d;
        var a;
        if (l) {
            d = f.slide;
            a = f.svg
        } else {
            d = n.slideId;
            a = JSON.parse(f.responseText)
        }
        var o = this.script.slideList.indexOf(d);
        var b = this.script.slides[d];
        var e = b.assets;
        this.slideCache[o]["svgmap"] = a;
        for (var r in e) {
            var j = e[r];
            if (j.type !== "texture") {
                continue
            }
            var h = this.urlForTexture(r, d);
            var m = h.split("/");
            var g = m.length;
            var c = m[g - 1];
            var p = c.split(".");
            var i = p[p.length - 1];
            if (i === "svgmap") {
                var k = a[j.index];
                var n = {
                    textureId: r,
                    slideId: d,
                    slideIndex: o
                };
                this.handleFetchCompleted(n, k)
            } else {
                var q = new Image();
                Event.observe(q, "load", this.handleImageOnloadEvent.bind(this, r, o));
                q.src = h
            }
        }
    },
    handleFetchCompleted: function(q, k) {
        var a = this.viewScale;
        var s = q.textureId;
        var b = q.slideId;
        var r = q.slideIndex;
        var c = new DOMParser();
        var l = this.showUrl + b + "/assets/";
        var h = c.parseFromString(k, "text/xml");
        var g = h.documentElement.getAttribute("viewBox").split(" ");
        var f = g[2];
        var m = g[3];
        var d = h.getElementsByTagName("image");
        for (var n = 0,
        e = d.length; n < e; n++) {
            var p = d[n];
            var o = p.getAttributeNS("http://www.w3.org/1999/xlink", "href");
            p.setAttributeNS("http://www.w3.org/1999/xlink", "href", l + o)
        }
        var j = document.importNode(h.documentElement, true);
        j.setAttributeNS("http://www.w3.org/2000/svg", "width", f);
        j.setAttributeNS("http://www.w3.org/2000/svg", "height", m);
        this.slideCache[r].textureAssets[s] = j;
        this.slideCache[r].textureRequests[s] = true;
        this.processTextureDidLoadCallback(s, r)
    },
    handleImageOnloadEvent: function(d, c, b) {
        b = b || window.event;
        var a = b.target || b.srcElement;
        this.slideCache[c].textureAssets[d] = a;
        this.slideCache[c].textureRequests[d] = true;
        this.processTextureDidLoadCallback(d, c)
    },
    getTextureObject: function(d, c) {
        var a;
        var b = this.script.slideIndexFromSceneIndexLookup[d];
        a = this.slideCache[b].textureAssets[c];
        return a
    },
    getTextureInfo: function(e, d) {
        var c = this.script.slideIndexFromSceneIndexLookup[e];
        if (c == null) {
            return null
        }
        var a = this.script.slideList[c];
        var b = this.script.slides[a].assets[d];
        return b
    },
    getTextureUrl: function(d, c) {
        var b = this.script.slideIndexFromSceneIndexLookup[d];
        if (b == null) {
            return null
        }
        var a = this.script.slideList[b];
        return this.urlForTexture(c, a)
    },
    getMovieUrl: function(d, c) {
        var b = this.script.slideIndexFromSceneIndexLookup[d];
        if (b == null) {
            return null
        }
        var a = this.script.slideList[b];
        return this.urlForAsset(c, a)
    },
    urlForAsset: function(e, c) {
        var b = "";
        var d = this.script.slides[c].assets[e];
        if (d == null) {
            return b
        }
        var a;
        if (usePDF) {
            a = d.url["native"]
        } else {
            a = d.url.web
        }
        if ((a != null) && (a != "")) {
            if (a.toLowerCase().substring(0, 4) === "http") {
                b = a
            } else {
                b = this.showUrl + (c ? c + "/": "") + a
            }
        }
        return b
    },
    urlForTexture: function(b, a) {
        return this.generateUrl(b, a, false)
    },
    generateUrl: function(e, b) {
        var a = "";
        var c = "";
        var d = this.script.slides[b].assets[e];
        if (!d) {
            return a
        }
        if (usePDF) {
            c = d.url["native"]
        } else {
            c = d.url.web
        }
        if ((c != null) && (c != "")) {
            if (c.toLowerCase().substring(0, 4) === "http") {
                a = c
            } else {
                a = this.showUrl + (b ? b + "/": "") + c
            }
        }
        return a
    }
});