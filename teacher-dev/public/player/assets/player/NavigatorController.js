
/**
 * 侧边栏相关控制
 */
var NavigatorController = Class.create({
  initialize: function(a) {
      this.domNode = a;
      this.thumbnailSidebar = new NavigatorThumbnailSidebar();
      this.thumbnailScroller = new NavigatorThumbnailScroller();
      this.thumbnailSelection = new NavigatorThumbnailSelection();
      this.thumbnailContainer = new NavigatorThumbnailContainer();
      this.thumbnailSidebar.domNode.appendChild(this.thumbnailScroller.domNode);
      this.thumbnailScroller.domNode.appendChild(this.thumbnailSelection.domNode);
      this.thumbnailScroller.domNode.appendChild(this.thumbnailContainer.domNode);
      this.domNode.appendChild(this.thumbnailSidebar.domNode);
      this.leftSidebar = new NavigatorLeftSidebar();
      this.domNode.appendChild(this.leftSidebar.domNode);
      Event.observe(this.domNode, "click", this.handleClickEvent.bind(this));
      Event.observe(this.leftSidebar.domNode, "mouseover", this.handleMouseOverEvent.bind(this));
      Event.observe(this.domNode, "mouseleave", this.handleMouseOutEvent.bind(this));
      document.observe(kSlideIndexDidChangeEvent, this.handleSlideIndexDidChangeEvent.bind(this));
      document.observe(kScriptDidDownloadEvent, this.handleScriptDidDownloadEvent.bind(this));
      this.slideThumbnail = null
  },
  initScrollbar: function() {
      if (this.thumbnailScroller.domNode.scrollHeight > this.thumbnailScroller.domNode.offsetHeight) {
          this.thumbnailScroller.domNode.style.width = "126px"
      } else {
          this.thumbnailScroller.domNode.style.width = "129px"
      }
      if (browserPrefix === "ms") {
          this.domNode.style.width = "148px";
          this.thumbnailSidebar.domNode.style.left = "-148px";
          this.thumbnailSidebar.domNode.style.width = "137px";
          this.thumbnailScroller.domNode.style.width = "137px"
      }
  },
  handleClickEvent: function(b) {
    console.log(' handleClickEvent() 侧边栏 click')
    if (gShowController.isRecording) {
        return
    }
    b = b || window.event;
    var c = b.target || b.srcElement;
    var a;
    if (browserPrefix === "ms") {
        b.cancelBubble = true
    } else {
        b.stopPropagation()
    }
    while ((c.slideNumber == null) && c.nodeName.toLowerCase() != "body") {
        c = c.parentNode
    }
    if (c.slideNumber) {
        this.selectedSlideIndex = c.slideNumber;
        this.select(this.selectedSlideIndex)
    }
  },
  select: function(a) {
    gShowController.jumpToSlide(a)
  },
  handleMouseOverEvent: function(e) {
    console.log(" handleMouseOverEvent() 侧边栏 mouseover..." )
    e = e || window.event;
    var c = 0;
    var g = 0;
    if (e.pageX || e.pageY) {
    c = e.pageX;
    g = e.pageY
    } else {
        if (e.clientX || e.clientY) {
            c = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
            g = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop
        }
    }
    if (c === 0 && g === 0) {
        return
    }
    var b = this.selectedSlideIndex * 76;
    var f = this.thumbnailScroller.domNode.scrollTop;
    var a = this.thumbnailScroller.domNode.clientHeight;
    if (f > b) {
        this.thumbnailScroller.domNode.scrollTop = b
    } else {
        if (f + a < b + 76) {
            var d = b - f - a + 76;
            this.thumbnailScroller.domNode.scrollTop = this.thumbnailScroller.domNode.scrollTop + d
        }
    }
    clearTimeout(this.navigatorTimeout);
    this.navigatorTimeout = setTimeout(this.thumbnailSidebar.show.bind(this.thumbnailSidebar, this.leftSidebar), 400)
  },
  handleMouseOutEvent: function(a) {
      console.log(' handleMouseOutEvent() 侧边栏 mouseleave...' )
      clearTimeout(this.navigatorTimeout);
      this.navigatorTimeout = setTimeout(this.thumbnailSidebar.hide.bind(this.thumbnailSidebar, this.leftSidebar), 400)
  },
  handleSlideIndexDidChangeEvent: function(a) {
      this.selectedSlideIndex = a.memo.slideIndex;
      this.thumbnailSelection.select(this.selectedSlideIndex)
  },
  handleScriptDidDownloadEvent: function(g) {
      var c = g.memo.script;
      for (var e = 0,
      f = c.slideList.length; e < f; e++) {
          var d = c.slideList[e];
          var b = new NavigatorThumbnailItem();
          b.domNode.slideNumber = e + 1;
          b.numberNode.innerHTML = e + 1;
          setElementProperty(b.domNode, "top", e * 76 + "px");
          this.thumbnailContainer.addItem(b);
          if (gShowController.delegate.getKPFJsonStringForShow == null) {
              var h = "../" + d + "/thumbnail.jpeg";
              var a = document.createElement("img");
              Event.observe(a, "load", this.updateThumbnail.bind(this, e, a));
              a.src = h
          } else {
              gShowController.delegate.loadTextureBySlideIndex(e, {
                  type: "slideThumbnail",
                  state: "outgoing"
              },
              (function(j, i) {
                  this.updateThumbnail(j, i)
              }).bind(this, e))
          }
      }
      this.initScrollbar()
  },
  updateThumbnail: function(g, d) {
      var h = this.thumbnailContainer.thumbnailItems[g].canvasContainer;
      if (this.slideThumbnail == null) {
          var b = gShowController.script.originalSlideWidth;
          var f = gShowController.script.originalSlideHeight;
          var e = b / f;
          var c, a;
          if (e >= 4 / 3) {
              c = 88;
              a = Math.ceil(88 * (1 / e))
          } else {
              c = Math.ceil(66 * e);
              a = 66
          }
          this.slideThumbnail = {
              width: c,
              height: a,
              top: Math.ceil((66 - a) / 2),
              left: Math.ceil((88 - c) / 2),
              scaleX: c / b,
              scaleY: a / f
          }
      }
      if (d.nodeName.toLowerCase() === "svg") {
          d.firstElementChild.setAttribute("transform", "matrix(" + this.slideThumbnail.scaleX + ",0,0," + this.slideThumbnail.scaleY + ",0,0)")
      }
      d.setAttribute("style", kTransitionPropertyName + ":opacity; " + kTransitionDurationName + ":500; width:" + this.slideThumbnail.width + "px; height:" + this.slideThumbnail.height + "px; left:" + this.slideThumbnail.left + "px; top:" + this.slideThumbnail.top + "px; opacity: 0; position: absolute;");
      d.setAttribute("draggable", false);
      if (browserPrefix === "moz") {
          Event.observe(d, "dragstart",
          function(i) {
              i.preventDefault()
          })
      }
      h.appendChild(d);
      d.style.opacity = 1
  }
});
var NavigatorLeftSidebar = Class.create({
  initialize: function() {
      this.domNode = document.createElement("div");
      this.domNode.setAttribute("class", "navigatorLeftSidebar")
  }
});
var NavigatorThumbnailSidebar = Class.create({
  initialize: function() {
      this.domNode = document.createElement("div");
      this.domNode.setAttribute("class", "navigatorThumbnailSidebar")
  },
  show: function(a) {
      a.domNode.style.visibility = "hidden";
      this.domNode.style.left = "0px";
      gShowController.displayManager.navigatorIsShowing = true;
      gShowController.displayManager.clearTimeoutForCursor()
  },
  hide: function(a) {
      a.domNode.style.visibility = "visible";
      this.domNode.style.left = "-140px";
      gShowController.displayManager.navigatorIsShowing = false;
      gShowController.displayManager.setTimeoutForCursor()
  }
});
var NavigatorThumbnailScroller = Class.create({
  initialize: function() {
      this.domNode = document.createElement("div");
      this.domNode.setAttribute("class", "navigatorThumbnailScroller")
  }
});
var NavigatorThumbnailSelection = Class.create({
  initialize: function(a) {
      this.domNode = document.createElement("div");
      this.domNode.setAttribute("class", "navigatorThumbnailSelection")
  },
  select: function(a) {
      this.domNode.style.top = 76 * a + "px";
      this.domNode.style.display = "block"
  }
});
var NavigatorThumbnailContainer = Class.create({
  initialize: function() {
      this.domNode = document.createElement("div");
      this.domNode.setAttribute("class", "navigatorThumbnailContainer");
      this.thumbnailItems = []
  },
  addItem: function(a) {
      this.thumbnailItems.push(a);
      this.domNode.appendChild(a.domNode)
  }
});
var NavigatorThumbnailItem = Class.create({
  initialize: function() {
      this.domNode = document.createElement("div");
      this.domNode.setAttribute("class", "navigatorThumbnailItem");
      this.thumbnailContentNode = document.createElement("div");
      this.thumbnailContentNode.setAttribute("style", "position: absolute; height: 76px; width: 119px;");
      this.numberNode = document.createElement("div");
      this.numberNode.setAttribute("style", "position: absolute; bottom: 1px; width: 20px; height: 20px; text-align: right; font-weight: bold; color: white;");
      this.imageNode = document.createElement("div");
      this.imageNode.setAttribute("style", "position: absolute; left: 24px; width: 95px; height: 76px;");
      this.thumb = document.createElement("div");
      this.thumb.setAttribute("style", "position: absolute; top: 4px; width: 90px; height: 68px;");
      this.canvasContainer = document.createElement("div");
      this.canvasContainer.setAttribute("class", "navigatorThumbnailItemCanvasContainer");
      this.thumb.appendChild(this.canvasContainer);
      this.imageNode.appendChild(this.thumb);
      this.thumbnailContentNode.appendChild(this.numberNode);
      this.thumbnailContentNode.appendChild(this.imageNode);
      this.domNode.appendChild(this.thumbnailContentNode)
  }
});