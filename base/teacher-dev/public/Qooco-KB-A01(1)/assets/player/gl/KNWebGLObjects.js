var KNWebGLRenderer = Class.create({
  initialize: function(c) {
      var a = this.canvas = c.canvas;
      this.canvasId = c.canvasId;
      this.textureAssets = c.textureAssets;
      this.durationMax = c.overallEndTime * 1000;
      this.glPrograms = [];
      this.elapsed = 0;
      var b = this.gl = a.getContext("webgl") || a.getContext("experimental-webgl");
      if (!b) {
          this.noGL = true;
          return
      }
      this.animationStarted = false;
      b.viewportWidth = a.width;
      b.viewportHeight = a.height;
      this.initMVPMatrix()
  },
  initMVPMatrix: function() {
      var i = this.gl;
      var a = i.viewportWidth;
      var e = i.viewportHeight;
      var c = 20 * (Math.PI / 180);
      var b = e / (2 * Math.tan(c / 2));
      var d = b - (a * 1.5);
      var f = b + (a * 15);
      this.slideProjectionMatrix = WebGraphics.makePerspectiveMatrix4(20, a / e, Math.max(1, d), f);
      var g = WebGraphics.translateMatrix4(WebGraphics.createMatrix4(), -a / 2, -e / 2, -b);
      this.slideProjectionMatrix = WebGraphics.multiplyMatrix4(this.slideProjectionMatrix, g);
      this.slideOrthoMatrix = WebGraphics.makeOrthoMatrix4(0, a, 0, e, -1, 1)
  },
  setupTexture: function(c) {
      var a = [];
      this.textureInfoFromEffect(c.kpfLayer, {
          pointX: 0,
          pointY: 0
      },
      a);
      for (var b = 0,
      d = a.length; b < d; b++) {
          var f = a[b].textureId;
          var e = this.textureAssets[f];
          a[b].texture = KNWebGLUtil.createTexture(this.gl, e)
      }
      return a
  },
  textureInfoFromEffect: function(f, e, a) {
      var d = {};
      d.offset = {
          pointX: e.pointX + f.bounds.offset.pointX,
          pointY: e.pointY + f.bounds.offset.pointY
      };
      if (f.textureId) {
          d.textureId = f.textureId;
          d.width = f.bounds.width;
          d.height = f.bounds.height;
          d.initialState = f.initialState;
          d.animations = f.animations;
          d.hasHighlightedBulletAnimation = f.hasHighlightedBulletAnimation;
          a.push(d)
      } else {
          for (var b = 0,
          c = f.layers.length; b < c; b++) {
              this.textureInfoFromEffect(f.layers[b], d.offset, a)
          }
      }
  },
  draw: function(c) {
      var d = {
          effect: c,
          textures: this.setupTexture(c)
      };
      var b = c.type;
      var a;
      if (b === "transition") {
          switch (c.name) {
          case "apple:wipe-iris":
              a = new KNWebGLTransitionIris(this, d);
              break;
          case "com.apple.iWork.Keynote.BUKTwist":
              a = new KNWebGLTransitionTwist(this, d);
              break;
          case "com.apple.iWork.Keynote.KLNColorPlanes":
              a = new KNWebGLTransitionColorPlanes(this, d);
              break;
          case "com.apple.iWork.Keynote.BUKFlop":
              a = new KNWebGLTransitionFlop(this, d);
              break;
          case "com.apple.iWork.Keynote.KLNConfetti":
              a = new KNWebGLTransitionConfetti(this, d);
              break;
          default:
              a = new KNWebGLDissolve(this, d);
              break
          }
      } else {
          if (b === "buildIn" || b === "buildOut") {
              switch (c.name) {
              case "apple:wipe-iris":
                  a = new KNWebGLBuildIris(this, d);
                  break;
              case "com.apple.iWork.Keynote.BUKAnvil":
                  a = new KNWebGLBuildAnvil(this, d);
                  break;
              case "com.apple.iWork.Keynote.KLNFlame":
                  a = new KNWebGLBuildFlame(this, d);
                  break;
              case "com.apple.iWork.Keynote.KLNConfetti":
                  a = new KNWebGLBuildConfetti(this, d);
                  break;
              case "com.apple.iWork.Keynote.KLNDiffuse":
                  a = new KNWebGLBuildDiffuse(this, d);
                  break;
              default:
                  a = new KNWebGLDissolve(this, d);
                  break
              }
          }
      }
      this.removeProgram(c.objectID);
      this.glPrograms.push(a)
  },
  animate: function() {
      var f = new Date();
      var h = 0;
      if (this.time) {
          var b = f.getTime();
          h = b - this.time;
          this.time = b
      } else {
          h = 0;
          this.time = f.getTime()
      }
      this.elapsed += h;
      var e = this.glPrograms;
      var d = e.length;
      if (this.elapsed <= this.durationMax) {
          this.animationRequest = window.requestAnimFrame(this.animate.bind(this))
      } else {
          for (var c = 0; c < d; c++) {
              var a = e[c];
              a.isCompleted = true
          }
      }
      var g = this.gl;
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);
      for (var c = 0; c < d; c++) {
          var a = e[c];
          a.drawFrame(h, this.elapsed, a.duration)
      }
  },
  removeProgram: function(d) {
      var b = this.glPrograms;
      var a = b.length;
      while (a--) {
          var c = b[a];
          if (c.effect.objectID === d) {
              b.splice(a, 1)
          }
      }
  },
  resize: function(a) {
      var d = this.gl;
      var b = a.width;
      var c = a.height;
      if (d.viewportWidth !== b || d.viewportHeight !== c) {
          d.viewport(0, 0, b, c);
          d.viewportWidth = b;
          d.viewportHeight = c
      }
  }
});
var KNWebGLProgram = Class.create({
  initialize: function(d, a) {
      this.renderer = d;
      this.gl = d.gl;
      this.textures = a.textures;
      var c = this.effect = a.effect;
      var b = this.type = c.type;
      this.direction = c.attributes ? c.attributes.direction: null;
      this.duration = c.duration * 1000;
      this.buildOut = b === "buildOut";
      this.buildIn = b === "buildIn";
      this.program = {};
      this.isCompleted = false;
      this.setupProgram(a)
  },
  setupProgram: function(c) {
      var e = this.gl;
      for (var b = 0,
      d = c.programNames.length; b < d; b++) {
          var a = c.programNames[b];
          this.program[a] = KNWebGLUtil.setupProgram(e, a)
      }
      e.enable(e.BLEND);
      e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA)
  }
});
var KNWebGLDrawable = Class.create(KNWebGLProgram, {
  initialize: function($super, a, b) {
      this.programData = {
          name: "WebDrawable",
          programNames: ["defaultTextureAndOpacity"],
          effect: b.effect,
          textures: b.textures
      };
      $super(a, this.programData);
      this.Opacity = 1;
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var h = this.renderer;
      var g = this.gl;
      var f = this.program.defaultTextureAndOpacity;
      var j = f.uniforms;
      var a = f.attribs;
      var e = this.textures[0];
      g.useProgram(f.shaderProgram);
      g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
      var c = this.textureCoordinateBuffer = g.createBuffer();
      var d = this.textureCoordinates = [0, 0, 0, 1, 1, 0, 1, 1, ];
      g.bindBuffer(g.ARRAY_BUFFER, c);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(d), g.STATIC_DRAW);
      var i = this.positionBuffer = g.createBuffer();
      var b = this.boxPosition = [0, 0, 0, 0, e.height, 0, e.width, 0, 0, e.width, e.height, 0];
      g.bindBuffer(g.ARRAY_BUFFER, i);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(b), g.STATIC_DRAW);
      this.MVPMatrix = WebGraphics.translateMatrix4(h.slideProjectionMatrix, e.offset.pointX, g.viewportHeight - e.offset.pointY - e.height, 0)
  },
  drawFrame: function() {
      var e = this.renderer;
      var g = this.gl;
      var c = this.program.defaultTextureAndOpacity;
      var b = c.uniforms;
      var f = c.attribs;
      var a = this.textures;
      var d = a[0].texture;
      g.useProgram(c.shaderProgram);
      g.bindBuffer(g.ARRAY_BUFFER, this.textureCoordinateBuffer);
      g.vertexAttribPointer(f.TexCoord, 2, g.FLOAT, false, 0, 0);
      g.enableVertexAttribArray(f.TexCoord);
      g.bindBuffer(g.ARRAY_BUFFER, this.positionBuffer);
      g.vertexAttribPointer(f.Position, 3, g.FLOAT, false, 0, 0);
      g.enableVertexAttribArray(f.Position);
      g.uniformMatrix4fv(b.MVPMatrix, false, this.MVPMatrix);
      g.uniform1f(b.Opacity, this.Opacity);
      g.activeTexture(g.TEXTURE0);
      g.uniform1i(b.Texture, 0);
      g.bindTexture(g.TEXTURE_2D, d);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4)
  }
});
var KNWebGLFramebufferDrawable = Class.create(KNWebGLProgram, {
  initialize: function($super, d, f) {
      var e = d.gl;
      var a = this.frameRect = f.frameRect;
      var c = this.texture = this.createFramebufferTexture(e, a);
      this.buffer = this.createFramebuffer(e, c);
      var b = {
          width: a.size.width,
          height: a.size.height,
          offset: {
              pointX: 0,
              pointY: 0
          },
          texture: c
      };
      this.programData = {
          name: "FramebufferDrawable",
          programNames: ["defaultTexture"],
          effect: f.effect,
          textures: [b]
      };
      $super(d, this.programData);
      this.drawableFrame = f.drawableFrame;
      this.animationWillBeginWithContext()
  },
  createFramebufferTexture: function(c, b) {
      var a = c.createTexture();
      c.bindTexture(c.TEXTURE_2D, a);
      c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, false);
      c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE);
      c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE);
      c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR);
      c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR);
      c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, b.size.width, b.size.height, 0, c.RGBA, c.UNSIGNED_BYTE, null);
      c.bindTexture(c.TEXTURE_2D, null);
      return a
  },
  createFramebuffer: function(c, b) {
      var a = c.createFramebuffer();
      c.bindFramebuffer(c.FRAMEBUFFER, a);
      c.framebufferTexture2D(c.FRAMEBUFFER, c.COLOR_ATTACHMENT0, c.TEXTURE_2D, b, 0);
      return a
  },
  animationWillBeginWithContext: function() {
      var h = this.renderer;
      var g = this.gl;
      var f = this.program.defaultTexture;
      var j = f.uniforms;
      var a = f.attribs;
      var e = this.textures[0];
      g.useProgram(f.shaderProgram);
      g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
      var c = this.textureCoordinateBuffer = g.createBuffer();
      var d = this.textureCoordinates = [0, 1, 0, 0, 1, 1, 1, 0, ];
      g.bindBuffer(g.ARRAY_BUFFER, c);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(d), g.STATIC_DRAW);
      var i = this.positionBuffer = g.createBuffer();
      var b = this.boxPosition = [0, 0, 0, 0, e.height, 0, e.width, 0, 0, e.width, e.height, 0];
      g.bindBuffer(g.ARRAY_BUFFER, i);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(b), g.STATIC_DRAW);
      this.MVPMatrix = WebGraphics.translateMatrix4(h.slideProjectionMatrix, e.offset.pointX, g.viewportHeight - e.offset.pointY - e.height, 0)
  },
  drawFrame: function() {
      var e = this.renderer;
      var g = this.gl;
      var c = this.program.defaultTexture;
      var b = c.uniforms;
      var f = c.attribs;
      var a = this.textures;
      var d = a[0].texture;
      g.useProgram(c.shaderProgram);
      g.bindBuffer(g.ARRAY_BUFFER, this.textureCoordinateBuffer);
      g.vertexAttribPointer(f.TexCoord, 2, g.FLOAT, false, 0, 0);
      g.enableVertexAttribArray(f.TexCoord);
      g.bindBuffer(g.ARRAY_BUFFER, this.positionBuffer);
      g.vertexAttribPointer(f.Position, 3, g.FLOAT, false, 0, 0);
      g.enableVertexAttribArray(f.Position);
      g.uniformMatrix4fv(b.MVPMatrix, false, this.MVPMatrix);
      g.activeTexture(g.TEXTURE0);
      g.uniform1i(b.Texture, 0);
      g.bindTexture(g.TEXTURE_2D, d);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4)
  }
});
var KNWebGLDissolve = Class.create(KNWebGLProgram, {
  initialize: function($super, a, b) {
      this.programData = {
          name: "dissolve",
          programNames: ["defaultTextureAndOpacity"],
          effect: b.effect,
          textures: b.textures
      };
      $super(a, this.programData);
      this.percentfinished = 0;
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var h = this.renderer;
      var g = this.gl;
      var f = this.program.defaultTextureAndOpacity;
      var j = f.uniforms;
      var a = f.attribs;
      var e = this.textures[0];
      g.useProgram(f.shaderProgram);
      g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
      var c = this.textureCoordinateBuffer = g.createBuffer();
      var d = this.textureCoordinates = [0, 0, 0, 1, 1, 0, 1, 1, ];
      g.bindBuffer(g.ARRAY_BUFFER, c);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(d), g.STATIC_DRAW);
      var i = this.positionBuffer = g.createBuffer();
      var b = this.boxPosition = [0, 0, 0, 0, e.height, 0, e.width, 0, 0, e.width, e.height, 0];
      g.bindBuffer(g.ARRAY_BUFFER, i);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(b), g.STATIC_DRAW);
      this.MVPMatrix = WebGraphics.translateMatrix4(h.slideProjectionMatrix, e.offset.pointX, g.viewportHeight - (e.offset.pointY + e.height), 0);
      this.drawFrame(0, 0, 4)
  },
  drawFrame: function(e, a, d) {
      var b = this.percentfinished;
      b += e / d;
      b > 1 ? b = 1 : 0;
      var c = TSUSineMap(b);
      if (b === 1) {
          c = 1
      }
      if (this.buildOut) {
          c = 1 - c
      }
      this.percentfinished = b;
      this.percentAlpha = c;
      this.draw()
  },
  draw: function() {
      var f = this.renderer;
      var h = this.gl;
      var c = this.program.defaultTextureAndOpacity;
      var b = c.uniforms;
      var g = c.attribs;
      var a = this.textures;
      var e = a[0].texture;
      var d;
      if (a.length > 1) {
          d = a[1].texture
      }
      h.useProgram(c.shaderProgram);
      h.blendFunc(h.ONE, h.ONE_MINUS_SRC_ALPHA);
      h.bindBuffer(h.ARRAY_BUFFER, this.textureCoordinateBuffer);
      h.vertexAttribPointer(g.TexCoord, 2, h.FLOAT, false, 0, 0);
      h.enableVertexAttribArray(g.TexCoord);
      h.bindBuffer(h.ARRAY_BUFFER, this.positionBuffer);
      h.vertexAttribPointer(g.Position, 3, h.FLOAT, false, 0, 0);
      h.enableVertexAttribArray(g.Position);
      h.uniformMatrix4fv(b.MVPMatrix, false, this.MVPMatrix);
      h.activeTexture(h.TEXTURE0);
      h.uniform1i(b.Texture, 0);
      if (d) {
          h.bindTexture(h.TEXTURE_2D, d);
          h.uniform1f(b.Opacity, 1);
          h.drawArrays(h.TRIANGLE_STRIP, 0, 4)
      }
      h.bindTexture(h.TEXTURE_2D, e);
      h.uniform1f(b.Opacity, this.percentAlpha);
      h.drawArrays(h.TRIANGLE_STRIP, 0, 4)
  }
});
var KNWebGLTransitionIris = Class.create(KNWebGLProgram, {
  initialize: function($super, a, c) {
      this.programData = {
          name: "apple:wipe-iris",
          programNames: ["iris"],
          effect: c.effect,
          textures: c.textures
      };
      $super(a, this.programData);
      var b = this.direction;
      var e = b === KNDirection.kKNDirectionOut;
      var d = this.buildOut;
      if ((d && e) || (!d && !e)) {
          this.mix = 0;
          this.percentfinished = 1
      } else {
          this.mix = 1;
          this.percentfinished = 0
      }
      this.percentAlpha = 0;
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var h = this.renderer;
      var g = this.gl;
      var f = this.program.iris;
      var a = f.attribs;
      var j = f.uniforms;
      var e = this.textures[0];
      g.useProgram(f.shaderProgram);
      g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
      this.scale = e.width / e.height;
      var c = this.textureCoordinatesBuffer = g.createBuffer();
      var d = this.textureCoordinates = [0, 0, 0, 1, 1, 0, 1, 1, ];
      g.bindBuffer(g.ARRAY_BUFFER, c);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(d), g.STATIC_DRAW);
      var i = this.positionBuffer = g.createBuffer();
      var b = this.boxPosition = [0, 0, 0, 0, e.height, 0, e.width, 0, 0, e.width, e.height, 0];
      g.bindBuffer(g.ARRAY_BUFFER, i);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(b), g.STATIC_DRAW);
      this.MVPMatrix = WebGraphics.translateMatrix4(h.slideProjectionMatrix, e.offset.pointX, g.viewportHeight - (e.offset.pointY + e.height), 0);
      this.drawFrame(0, 0, 4)
  },
  drawFrame: function(g, a, d) {
      var f = this.buildOut;
      var e = this.direction === KNDirection.kKNDirectionOut;
      var b = this.percentfinished;
      if ((f && e) || (!f && !e)) {
          b -= g / d;
          b < 0 ? b = 0 : 0
      } else {
          b += g / d;
          b > 1 ? b = 1 : 0
      }
      var c = TSUSineMap(b);
      if (b === 1) {
          c = 1
      }
      if (f) {
          c = 1 - c
      }
      this.percentAlpha = c;
      this.percentfinished = b;
      this.draw()
  },
  draw: function() {
      var f = this.renderer;
      var e = this.gl;
      var d = this.program.iris;
      var a = d.attribs;
      var h = d.uniforms;
      var i = this.textures;
      var g = i[0].texture;
      var c = i[0];
      var j;
      var b = this.scale;
      if (i.length > 1) {
          j = i[1].texture
      }
      e.useProgram(d.shaderProgram);
      e.blendFunc(e.ONE, e.ONE_MINUS_SRC_ALPHA);
      e.bindBuffer(e.ARRAY_BUFFER, this.textureCoordinatesBuffer);
      e.vertexAttribPointer(a.TexCoord, 2, e.FLOAT, false, 0, 0);
      e.enableVertexAttribArray(a.TexCoord);
      e.bindBuffer(e.ARRAY_BUFFER, this.positionBuffer);
      e.vertexAttribPointer(a.Position, 3, e.FLOAT, false, 0, 0);
      e.enableVertexAttribArray(a.Position);
      e.uniformMatrix4fv(h.MVPMatrix, false, this.MVPMatrix);
      e.activeTexture(e.TEXTURE0);
      e.uniform1i(h.Texture, 0);
      e.uniform1f(h.Opacity, 1);
      if (j) {
          e.bindTexture(e.TEXTURE_2D, j);
          e.uniform1f(h.PercentForAlpha, 0);
          e.uniform1f(h.Scale, b);
          e.uniform1f(h.Mix, 0);
          e.drawArrays(e.TRIANGLE_STRIP, 0, 4)
      }
      e.bindTexture(e.TEXTURE_2D, g);
      e.uniform1f(h.PercentForAlpha, this.percentAlpha);
      e.uniform1f(h.Scale, b);
      e.uniform1f(h.Mix, this.mix);
      e.drawArrays(e.TRIANGLE_STRIP, 0, 4)
  }
});
var KNWebGLBuildIris = Class.create(KNWebGLProgram, {
  initialize: function($super, j, d) {
      var l = d.effect;
      this.programData = {
          name: "apple:wipe-iris",
          programNames: ["iris"],
          effect: l,
          textures: d.textures
      };
      $super(j, this.programData);
      var k = this.direction;
      var a = k === KNDirection.kKNDirectionOut;
      var b = this.buildOut;
      if ((b && a) || (!b && !a)) {
          this.mix = 0;
          this.percentfinished = 1
      } else {
          this.mix = 1;
          this.percentfinished = 0
      }
      this.percentAlpha = 0;
      this.drawableObjects = [];
      for (var e = 0,
      c = this.textures.length; e < c; e++) {
          var h = d.textures[e];
          var g = {
              effect: l,
              textures: [h]
          };
          var f = new KNWebGLDrawable(j, g);
          this.drawableObjects.push(f)
      }
      this.parentOpacity = l.baseLayer.initialState.opacity;
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var k = this.renderer;
      var o = this.gl;
      var d = this.program.iris;
      var g = d.attribs;
      var q = d.uniforms;
      o.useProgram(d.shaderProgram);
      o.blendFunc(o.ONE, o.ONE_MINUS_SRC_ALPHA);
      var m = o.createBuffer();
      var b = [0, 0, 0, 1, 1, 0, 1, 1, ];
      o.bindBuffer(o.ARRAY_BUFFER, m);
      o.bufferData(o.ARRAY_BUFFER, new Float32Array(b), o.STATIC_DRAW);
      var l = o.viewportWidth;
      var a = o.viewportHeight;
      this.irisSystems = [];
      for (var p = 0,
      c = this.textures.length; p < c; p++) {
          var e = this.textures[p];
          var j = e.width;
          var h = e.height;
          var s = e.width / e.height;
          var n = o.createBuffer();
          var f = [0, 0, 0, 0, e.height, 0, e.width, 0, 0, e.width, e.height, 0];
          o.bindBuffer(o.ARRAY_BUFFER, n);
          o.bufferData(o.ARRAY_BUFFER, new Float32Array(f), o.STATIC_DRAW);
          var r = WebGraphics.translateMatrix4(k.slideProjectionMatrix, e.offset.pointX, o.viewportHeight - (e.offset.pointY + e.height), 0);
          this.irisSystems[p] = {
              textureCoordinatesBuffer: m,
              positionBuffer: n,
              MVPMatrix: r,
              scale: s
          }
      }
  },
  drawFrame: function(x, b, a) {
      var n = this.renderer;
      var q = this.gl;
      var t = this.buildOut;
      var u = this.direction === KNDirection.kKNDirectionOut;
      var m = this.percentfinished;
      if ((t && u) || (!t && !u)) {
          m -= x / a;
          if (m <= 0) {
              m = 0;
              this.isCompleted = true
          }
      } else {
          m += x / a;
          if (m >= 1) {
              m = 1;
              this.isCompleted = true
          }
      }
      var B = TSUSineMap(m);
      if (m === 1) {
          B = 1
      }
      if (t) {
          B = 1 - B
      }
      this.percentAlpha = B;
      this.percentfinished = m;
      q.blendFunc(q.ONE, q.ONE_MINUS_SRC_ALPHA);
      for (var r = 0,
      d = this.textures.length; r < d; r++) {
          var k = this.textures[r];
          var s = k.initialState;
          var h = k.animations;
          if (k.hasHighlightedBulletAnimation) {
              if (!s.hidden) {
                  var c;
                  if (h.length > 0 && h[0].property === "opacity") {
                      var e = h[0].from.scalar;
                      var g = h[0].to.scalar;
                      var j = g - e;
                      if (t) {
                          c = e + j * (1 - this.percentfinished)
                      } else {
                          c = e + j * this.percentfinished
                      }
                  } else {
                      c = k.initialState.opacity
                  }
                  this.drawableObjects[r].Opacity = this.parentOpacity * c;
                  this.drawableObjects[r].drawFrame()
              }
          } else {
              if (k.animations.length > 0) {
                  if (this.isCompleted) {
                      if (!t) {
                          this.drawableObjects[r].Opacity = this.parentOpacity * k.initialState.opacity;
                          this.drawableObjects[r].drawFrame()
                      }
                      continue
                  }
                  var f = this.program.iris;
                  var l = f.attribs;
                  var w = f.uniforms;
                  var v = this.irisSystems[r];
                  var A = v.scale;
                  q.useProgram(f.shaderProgram);
                  var o = v.textureCoordinatesBuffer;
                  q.bindBuffer(q.ARRAY_BUFFER, o);
                  q.vertexAttribPointer(l.TexCoord, 2, q.FLOAT, false, 0, 0);
                  q.enableVertexAttribArray(l.TexCoord);
                  var p = v.positionBuffer;
                  q.bindBuffer(q.ARRAY_BUFFER, p);
                  q.vertexAttribPointer(l.Position, 3, q.FLOAT, false, 0, 0);
                  q.enableVertexAttribArray(l.Position);
                  var z = v.MVPMatrix;
                  q.uniformMatrix4fv(w.MVPMatrix, false, z);
                  q.activeTexture(q.TEXTURE0);
                  q.uniform1i(w.Texture, 0);
                  q.uniform1f(w.Opacity, this.parentOpacity * k.initialState.opacity);
                  q.bindTexture(q.TEXTURE_2D, k.texture);
                  q.uniform1f(w.PercentForAlpha, this.percentAlpha);
                  q.uniform1f(w.Scale, A);
                  q.uniform1f(w.Mix, this.mix);
                  q.drawArrays(q.TRIANGLE_STRIP, 0, 4)
              } else {
                  if (!k.initialState.hidden) {
                      this.drawableObjects[r].Opacity = this.parentOpacity * k.initialState.opacity;
                      this.drawableObjects[r].drawFrame()
                  }
              }
          }
      }
  }
});
var KNWebGLTransitionTwist = Class.create(KNWebGLProgram, {
  initialize: function($super, f, c) {
      this.programData = {
          name: "com.apple.iWork.Keynote.BUKTwist",
          programNames: ["twist"],
          effect: c.effect,
          textures: c.textures
      };
      $super(f, this.programData);
      var d = this.gl;
      this.direction = this.effect.attributes.direction;
      this.percentfinished = 0;
      var g = this.mNumPoints = 24;
      var n = d.viewportWidth / (g - 1);
      var m = d.viewportHeight / (g - 1);
      var k = 1 / (g - 1);
      var i, h;
      var a = this.TexCoords = [];
      var j = this.PositionCoords = [];
      var l = this.NormalCoords = [];
      for (h = 0; h < g; h++) {
          for (i = 0; i < g; i++) {
              var e = h * g + i;
              j[e * 3] = i * n;
              j[e * 3 + 1] = h * m;
              j[e * 3 + 2] = 0;
              a.push(i * k);
              a.push(h * k);
              l.push(0);
              l.push(0);
              l.push( - 1)
          }
      }
      var e = 0;
      var b = this.elementArray = [];
      for (h = 0; h < g - 1; h++) {
          for (i = 0; i < g; i++) {
              b[e++] = (h) * (g) + i;
              b[e++] = (h + 1) * (g) + i
          }
      }
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var c = this.renderer;
      var e = this.gl;
      var b = this.program.twist;
      var a = b.uniforms;
      var d = b.attribs;
      e.enable(e.CULL_FACE);
      this.buffers = {};
      this.buffers.TexCoord = e.createBuffer();
      e.bindBuffer(e.ARRAY_BUFFER, this.buffers.TexCoord);
      e.bufferData(e.ARRAY_BUFFER, new Float32Array(this.TexCoords), e.STATIC_DRAW);
      e.vertexAttribPointer(d.TexCoord, 2, e.FLOAT, false, 0, 0);
      e.enableVertexAttribArray(d.TexCoord);
      this.buffers.Position = e.createBuffer();
      e.bindBuffer(e.ARRAY_BUFFER, this.buffers.Position);
      e.bufferData(e.ARRAY_BUFFER, new Float32Array(this.PositionCoords), e.DYNAMIC_DRAW);
      e.vertexAttribPointer(d.Position, 3, e.FLOAT, false, 0, 0);
      e.enableVertexAttribArray(d.Position);
      this.buffers.Normal = e.createBuffer();
      e.bindBuffer(e.ARRAY_BUFFER, this.buffers.Normal);
      e.bufferData(e.ARRAY_BUFFER, new Float32Array(this.NormalCoords), e.DYNAMIC_DRAW);
      e.vertexAttribPointer(d.Normal, 3, e.FLOAT, false, 0, 0);
      e.enableVertexAttribArray(d.Normal);
      this.MVPMatrix = c.slideProjectionMatrix;
      e.uniformMatrix4fv(a.MVPMatrix, false, this.MVPMatrix);
      this.AffineTransform = new Matrix3();
      this.AffineTransform.affineScale(1, -1);
      this.AffineTransform.affineTranslate(0, 1);
      this.AffineIdentity = new Matrix3();
      this.elementIndicesBuffer = e.createBuffer();
      e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, this.elementIndicesBuffer);
      e.bufferData(e.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.elementArray), e.STATIC_DRAW);
      e.activeTexture(e.TEXTURE0);
      e.uniform1i(a.Texture, 0);
      this.drawFrame(0, 0, 4)
  },
  drawFrame: function(A, c, a) {
      var v = this.gl;
      var i = this.program.twist;
      var n = i.attribs;
      var s = this.percentfinished;
      s += A / a;
      s > 1 ? s = 1 : 0;
      this.specularcolor = TSUSineMap(s * 2) * 0.5;
      var j, k;
      var p = v.viewportHeight / 2;
      var u = this.mNumPoints;
      var h = this.TexCoords;
      var e = this.PositionCoords;
      var b = this.NormalCoords;
      for (j = 0; j < u; j++) {
          for (k = 0; k < u; k++) {
              var g = j * u + k;
              var d = {};
              d.x = h[g * 2];
              d.y = h[g * 2 + 1];
              var w = -Math.PI * TwistFX(this.direction === KNDirection.kKNDirectionLeftToRight ? d.x: (1 - d.x), s);
              var m = {};
              m.y = (p - (p * (1 - d.y * 2) * Math.cos(w)));
              m.z = (p * (1 - d.y * 2) * Math.sin(w));
              e[g * 3 + 1] = m.y;
              e[g * 3 + 2] = m.z
          }
      }
      for (j = 0; j < u; j++) {
          for (k = 0; k < u; k++) {
              var z = new vector3();
              var g = j * u + k;
              for (var o = 0; o < 4; o++) {
                  var t = 0,
                  r = 0,
                  D = 0,
                  C = 0;
                  switch (o) {
                  case 0:
                      t = 1;
                      C = 1;
                      break;
                  case 1:
                      r = 1;
                      D = -1;
                      break;
                  case 2:
                      t = -1;
                      C = -1;
                      break;
                  case 3:
                      r = -1;
                      D = 1;
                  default:
                      break
                  }
                  if ((k + t) < 0 || (k + D) < 0 || (j + r) < 0 || (j + C) < 0 || k + t >= u || k + D >= u || j + r >= u || j + C >= u) {
                      continue
                  }
                  var l = new vector3([e[g * 3], e[g * 3 + 1], e[g * 3 + 2]]);
                  var B = new vector3([e[((j + r) * u + (k + t)) * 3], e[((j + r) * u + (k + t)) * 3 + 1], e[((j + r) * u + (k + t)) * 3 + 2]]);
                  var f = new vector3([e[(((j + C) * u) + (k + D)) * 3], e[(((j + C) * u) + (k + D)) * 3 + 1], e[(((j + C) * u) + (k + D)) * 3 + 2]]);
                  B.subtract(l);
                  f.subtract(l);
                  B.cross(f);
                  z.add(B)
              }
              z.normalize();
              z.scale( - 1);
              z = z.getArray();
              b[g * 3] = z[0];
              b[g * 3 + 1] = z[1];
              b[g * 3 + 2] = z[2]
          }
      }
      v.bindBuffer(v.ARRAY_BUFFER, this.buffers.Position);
      v.bufferData(v.ARRAY_BUFFER, new Float32Array(e), v.DYNAMIC_DRAW);
      v.vertexAttribPointer(n.Position, 3, v.FLOAT, false, 0, 0);
      v.bindBuffer(v.ARRAY_BUFFER, this.buffers.Normal);
      v.bufferData(v.ARRAY_BUFFER, new Float32Array(b), v.DYNAMIC_DRAW);
      v.vertexAttribPointer(n.Normal, 3, v.FLOAT, false, 0, 0);
      this.percentfinished = s;
      this.draw()
  },
  draw: function() {
      var g = this.renderer;
      var e = this.gl;
      var d = this.program.twist;
      var j = d.uniforms;
      var k = this.textures;
      var h = k[0].texture;
      var l = k[1].texture;
      var i = this.mNumPoints;
      var f = this.specularcolor;
      var a = this.AffineTransform.getColumnMajorFloat32Array();
      var b = this.AffineIdentity.getColumnMajorFloat32Array();
      var c = this.elementIndicesBuffer;
      if (!f) {
          f = 0
      }
      e.uniform1f(j.SpecularColor, f);
      if (this.percentfinished < 0.5) {
          e.cullFace(e.BACK);
          e.bindTexture(e.TEXTURE_2D, h);
          e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, c);
          e.uniformMatrix3fv(j.TextureMatrix, false, a);
          e.uniform1f(j.FlipNormals, 1);
          for (y = 0; y < i - 1; y++) {
              e.drawElements(e.TRIANGLE_STRIP, i * 2, e.UNSIGNED_SHORT, y * i * 2 * (2))
          }
          e.cullFace(e.FRONT);
          e.bindTexture(e.TEXTURE_2D, l);
          e.uniformMatrix3fv(j.TextureMatrix, false, b);
          e.uniform1f(j.FlipNormals, -1);
          for (y = 0; y < i - 1; y++) {
              e.drawElements(e.TRIANGLE_STRIP, i * 2, e.UNSIGNED_SHORT, y * i * 2 * (2))
          }
      } else {
          e.cullFace(e.FRONT);
          e.bindTexture(e.TEXTURE_2D, l);
          e.uniformMatrix3fv(j.TextureMatrix, false, b);
          e.uniform1f(j.FlipNormals, -1);
          for (y = 0; y < i - 1; y++) {
              e.drawElements(e.TRIANGLE_STRIP, i * 2, e.UNSIGNED_SHORT, y * i * 2 * (2))
          }
          e.cullFace(e.BACK);
          e.bindTexture(e.TEXTURE_2D, h);
          e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, c);
          e.uniformMatrix3fv(j.TextureMatrix, false, a);
          e.uniform1f(j.SpecularColor, f);
          e.uniform1f(j.FlipNormals, 1);
          for (y = 0; y < i - 1; y++) {
              e.drawElements(e.TRIANGLE_STRIP, i * 2, e.UNSIGNED_SHORT, y * i * 2 * (2))
          }
      }
  }
});
var KNWebGLTransitionColorPlanes = Class.create(KNWebGLProgram, {
  initialize: function($super, a, c) {
      this.programData = {
          name: "com.apple.iWork.Keynote.KLNColorPlanes",
          programNames: ["colorPlanes"],
          effect: c.effect,
          textures: c.textures
      };
      $super(a, this.programData);
      var b = this.effect.attributes.direction;
      if (b !== KNDirection.kKNDirectionLeftToRight && b !== KNDirection.kKNDirectionRightToLeft && b !== KNDirection.kKNDirectionTopToBottom && b !== KNDirection.kKNDirectionBottomToTop) {
          b = KNDirection.kKNDirectionLeftToRight
      }
      this.direction = b;
      this.mNumColors = 3;
      this.percentfinished = 0;
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var f = this.renderer;
      var e = this.gl;
      var d = this.program.colorPlanes;
      var g = d.uniforms;
      var a = d.attribs;
      var c = this.textures[0];
      e.disable(e.CULL_FACE);
      e.blendFunc(e.ONE, e.ONE);
      var i = this.buffers = {};
      i.TexCoord = e.createBuffer();
      e.bindBuffer(e.ARRAY_BUFFER, i.TexCoord);
      var b = this.TexCoords = [0, 0, 0, 1, 1, 0, 1, 1, ];
      e.bufferData(e.ARRAY_BUFFER, new Float32Array(b), e.STATIC_DRAW);
      e.vertexAttribPointer(a.TexCoord, 2, e.FLOAT, false, 0, 0);
      e.enableVertexAttribArray(a.TexCoord);
      i.Position = e.createBuffer();
      e.bindBuffer(e.ARRAY_BUFFER, i.Position);
      var h = this.PositionCoords = [0, 0, 0, 0, c.height, 0, c.width, 0, 0, c.width, c.height, 0];
      e.bufferData(e.ARRAY_BUFFER, new Float32Array(h), e.STATIC_DRAW);
      e.vertexAttribPointer(a.Position, 3, e.FLOAT, false, 0, 0);
      e.enableVertexAttribArray(a.Position);
      this.MVPMatrix = f.slideProjectionMatrix;
      e.uniformMatrix4fv(g.MVPMatrix, false, this.MVPMatrix);
      e.activeTexture(e.TEXTURE0);
      e.uniform1i(g.Texture, 0);
      this.drawFrame(0, 0, 4)
  },
  drawFrame: function(B, e, a) {
      var s = this.renderer;
      var v = this.gl;
      var n = this.program.colorPlanes;
      var z = n.uniforms;
      var q = n.attribs;
      var g = this.textures;
      var p = g[0];
      var h = g[1];
      this.percentfinished += B / a;
      this.percentfinished > 1 ? this.percentfinished = 1 : 0;
      var d = this.percentfinished;
      var A = this.direction;
      var t = 0.25;
      var o = 1;
      var w = (A == KNDirection.kKNDirectionRightToLeft || A == KNDirection.kKNDirectionBottomToTop);
      var b = (A == KNDirection.kKNDirectionLeftToRight || A == KNDirection.kKNDirectionRightToLeft);
      var c = 1 - (1 - d) * (1 - d);
      var m = b ? p.width: p.height;
      var i = TSUSineMap(d * 2);
      var C = i * m * t;
      var k = Math.sin( - c * 2 * Math.PI);
      k *= c * m * o;
      if (d < 0.5) {
          v.bindTexture(v.TEXTURE_2D, h.texture);
          v.uniform2fv(z.FlipTexCoords, new Float32Array([0, 0]))
      } else {
          v.bindTexture(v.TEXTURE_2D, p.texture);
          if (A == KNDirection.kKNDirectionTopToBottom || A == KNDirection.kKNDirectionBottomToTop) {
              v.uniform2fv(z.FlipTexCoords, new Float32Array([0, 1]))
          } else {
              v.uniform2fv(z.FlipTexCoords, new Float32Array([1, 0]))
          }
      }
      for (var f = 0,
      l = this.mNumColors; f < l; f++) {
          var r = f / l;
          var u = WebGraphics.colorWithHSBA(r, 1, 1, 1 / l);
          v.uniform4fv(z.ColorMask, new Float32Array([u.red, u.green, u.blue, u.alpha]));
          var x = (Math.PI / 180) * (180 * (TSUSineMap(d)));
          var j = WebGraphics.translateMatrix4(this.MVPMatrix, p.width / 2, p.height / 2, k);
          j = WebGraphics.rotateMatrix4AboutXYZ(j, x, (w ? -1 : 1) * (b ? 0 : 1), (w ? -1 : 1) * (b ? 1 : 0), 0);
          j = WebGraphics.translateMatrix4(j, -p.width / 2, -p.height / 2, C * (f - 1));
          v.uniformMatrix4fv(z.MVPMatrix, false, j);
          v.drawArrays(v.TRIANGLE_STRIP, 0, 4)
      }
  }
});
var KNWebGLTransitionFlop = Class.create(KNWebGLProgram, {
  initialize: function($super, m, p) {
      this.programData = {
          name: "com.apple.iWork.Keynote.BUKFlop",
          programNames: ["flop", "defaultTexture"],
          effect: p.effect,
          textures: p.textures
      };
      $super(m, this.programData);
      var q = this.effect.attributes.direction;
      if (q !== KNDirection.kKNDirectionLeftToRight && q !== KNDirection.kKNDirectionRightToLeft && q !== KNDirection.kKNDirectionTopToBottom && q !== KNDirection.kKNDirectionBottomToTop) {
          q = KNDirection.kKNDirectionLeftToRight
      }
      this.direction = q;
      this.percentfinished = 0;
      var i = this.elementArray = [];
      var o = this.gl;
      var b = o.viewportWidth;
      var a = o.viewportHeight;
      var l = b;
      var j = a;
      if (q === KNDirection.kKNDirectionTopToBottom || q === KNDirection.kKNDirectionBottomToTop) {
          j *= 0.5
      } else {
          l *= 0.5
      }
      var n = this.mNumPoints = 8;
      var c = 0;
      for (e = 0; e < n - 1; e++) {
          for (f = 0; f < n; f++) {
              i[c++] = (e + 0) * (n) + f;
              i[c++] = (e + 1) * (n) + f
          }
      }
      var h = l / (n - 1);
      var g = j / (n - 1);
      var d = (q == KNDirection.kKNDirectionTopToBottom) ? j: d = 0;
      var r = (q == KNDirection.kKNDirectionRightToLeft) ? l: r = 0;
      var k = this.attributeBufferData = {
          Position: [],
          TexCoords: [],
          Normal: [],
          ShadowPosition: [],
          ShadowTexCoord: [],
          PreviousPosition: [],
          PreviousTexCoords: [],
          PreviousNormal: []
      };
      for (var e = 0; e < n; e++) {
          for (var f = 0; f < n; f++) {
              c = e * n + f;
              KNWebGLUtil.setPoint3DAtIndexForAttribute(WebGraphics.makePoint3D(f * h + r, e * g, 0), c, k.Position);
              KNWebGLUtil.setPoint2DAtIndexForAttribute(WebGraphics.makePoint((f * h + r) / b, (e * g + d) / a), c, k.TexCoords);
              KNWebGLUtil.setPoint3DAtIndexForAttribute(WebGraphics.makePoint3D(0, 0, 1), c, k.Normal)
          }
      }
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var l = this.renderer;
      var m = this.gl;
      var d = this.program.flop;
      var g = d.attribs;
      var p = d.uniforms;
      var e = this.program.defaultTexture;
      var r = this.MVPMatrix = l.slideProjectionMatrix;
      var k = m.viewportWidth;
      var h = m.viewportHeight;
      var q = this.direction;
      if (q === KNDirection.kKNDirectionTopToBottom || q === KNDirection.kKNDirectionBottomToTop) {
          h *= 0.5
      } else {
          k *= 0.5
      }
      var b = [0, 0, 0, 0.5, 1, 0, 1, 0.5, ];
      var f = [0, 0, 0, 0, h, 0, k, 0, 0, k, h, 0, ];
      var c = [0, 0.5, 0, 1, 1, 0.5, 1, 1, ];
      var a = [0, h, 0, 0, h * 2, 0, k, h, 0, k, h * 2, 0, ];
      KNWebGLUtil.enableAttribs(m, d);
      var j = this.attributeBufferData;
      var o = this.buffers = {};
      var n = this.Coordinates = {};
      o.TexCoord = m.createBuffer();
      m.bindBuffer(m.ARRAY_BUFFER, o.TexCoord);
      m.bufferData(m.ARRAY_BUFFER, new Float32Array(j.TexCoords), m.DYNAMIC_DRAW);
      m.vertexAttribPointer(g.TexCoord, 2, m.FLOAT, false, 0, 0);
      o.Position = m.createBuffer();
      m.bindBuffer(m.ARRAY_BUFFER, o.Position);
      m.bufferData(m.ARRAY_BUFFER, new Float32Array(j.Position), m.DYNAMIC_DRAW);
      m.vertexAttribPointer(g.Position, 3, m.FLOAT, false, 0, 0);
      o.Normal = m.createBuffer();
      m.bindBuffer(m.ARRAY_BUFFER, o.Normal);
      m.bufferData(m.ARRAY_BUFFER, new Float32Array(j.Normal), m.DYNAMIC_DRAW);
      m.vertexAttribPointer(g.Normal, 3, m.FLOAT, false, 0, 0);
      m.uniformMatrix4fv(p.MVPMatrix, false, r);
      var i = this.AffineTransform = new Matrix3();
      if (q === KNDirection.kKNDirectionTopToBottom) {
          i.affineScale(1, -1);
          i.affineTranslate(0, 1)
      } else {
          if (q == KNDirection.kKNDirectionBottomToTop) {
              i.affineScale(1, -1);
              i.affineTranslate(0, 1);
              b = [0, 0.5, 0, 1, 1, 0.5, 1, 1, ];
              c = [0, 0, 0, 0.5, 1, 0, 1, 0.5, ];
              f = [0, h, 0, 0, h * 2, 0, k, h, 0, k, h * 2, 0, ];
              a = [0, 0, 0, 0, h, 0, k, 0, 0, k, h, 0, ]
          } else {
              if (q == KNDirection.kKNDirectionRightToLeft) {
                  i.affineScale( - 1, 1);
                  i.affineTranslate(1, 0);
                  b = [0, 0, 0, 1, 0.5, 0, 0.5, 1, ];
                  c = [0.5, 0, 0.5, 1, 1, 0, 1, 1, ];
                  a = [k, 0, 0, k, h, 0, k * 2, 0, 0, k * 2, h, 0, ]
              } else {
                  if (q === KNDirection.kKNDirectionLeftToRight) {
                      i.affineScale( - 1, 1);
                      i.affineTranslate(1, 0);
                      f = [k, 0, 0, k, h, 0, k * 2, 0, 0, k * 2, h, 0, ];
                      b = [0.5, 0, 0.5, 1, 1, 0, 1, 1, ];
                      c = [0, 0, 0, 1, 0.5, 0, 0.5, 1, ];
                      a = [0, 0, 0, 0, h, 0, k, 0, 0, k, h, 0, ]
                  }
              }
          }
      }
      this.AffineIdentity = new Matrix3();
      this.elementIndicesBuffer = m.createBuffer();
      m.bindBuffer(m.ELEMENT_ARRAY_BUFFER, this.elementIndicesBuffer);
      m.bufferData(m.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.elementArray), m.STATIC_DRAW);
      n.DefaultTexture = b;
      n.DefaultTexture2 = c;
      n.DefaultPosition = f;
      n.DefaultPosition2 = a;
      KNWebGLUtil.enableAttribs(m, e);
      o.TextureCoordinates = m.createBuffer();
      o.PositionCoordinates = m.createBuffer();
      m.bindBuffer(m.ARRAY_BUFFER, o.TextureCoordinates);
      m.bindBuffer(m.ARRAY_BUFFER, o.PositionCoordinates);
      m.bufferData(m.ARRAY_BUFFER, new Float32Array(b), m.DYNAMIC_DRAW);
      m.vertexAttribPointer(e.attribs.TexCoord, 2, m.FLOAT, false, 0, 0);
      m.bufferData(m.ARRAY_BUFFER, new Float32Array(f), m.DYNAMIC_DRAW);
      m.vertexAttribPointer(e.attribs.Position, 3, m.FLOAT, false, 0, 0);
      m.uniform1i(e.uniforms.Texture, 0);
      m.uniformMatrix4fv(e.uniforms.MVPMatrix, false, r);
      m.useProgram(d.shaderProgram);
      m.activeTexture(m.TEXTURE0);
      m.uniform1i(d.uniforms.Texture, 0);
      this.drawFrame(0, 0, 4)
  },
  drawFrame: function(c, a, b) {
      this.percentfinished += c / b;
      this.percentfinished > 1 ? this.percentfinished = 1 : 0;
      this.updateFlopWithPercent();
      this.draw()
  },
  updateFlopWithPercent: function() {
      var r = this.gl;
      var u = this.direction;
      var c = r.viewportWidth;
      var b = r.viewportHeight;
      var g = this.percentfinished * Math.PI;
      var f = this.percentfinished * this.percentfinished * this.percentfinished * Math.PI;
      var m = b / 2;
      var o = c / 2;
      var a = 0;
      var q = this.mNumPoints;
      var n = this.attributeBufferData;
      for (var i = 0; i < q; i++) {
          for (var k = 0; k < q; k++) {
              var h = i * q + k;
              var e = KNWebGLUtil.getPoint2DForArrayAtIndex(n.TexCoords, h);
              e.x *= c;
              e.y *= b;
              if (u === KNDirection.kKNDirectionBottomToTop) {
                  a = e.y / m
              } else {
                  if (u === KNDirection.kKNDirectionTopToBottom) {
                      a = (m * 2 - e.y) / m
                  } else {
                      if (u === KNDirection.kKNDirectionLeftToRight) {
                          a = e.x / o
                      } else {
                          a = (o * 2 - e.x) / o
                      }
                  }
              }
              var s = a * g + (1 - a) * f;
              if (u === KNDirection.kKNDirectionLeftToRight || u === KNDirection.kKNDirectionTopToBottom) {
                  s *= -1
              }
              var d = Math.sin(s);
              var v = Math.cos(s);
              var j = KNWebGLUtil.getPoint3DForArrayAtIndex(n.Position, h);
              var l = KNWebGLUtil.getPoint3DForArrayAtIndex(n.Normal, h);
              if (u === KNDirection.kKNDirectionTopToBottom || u === KNDirection.kKNDirectionBottomToTop) {
                  var p = WebGraphics.makePoint3D(j.x, m - (m - e.y) * v, (m - e.y) * d);
                  KNWebGLUtil.setPoint3DAtIndexForAttribute(p, h, n.Position);
                  var t = WebGraphics.makePoint3D(l.x, -d, v);
                  KNWebGLUtil.setPoint3DAtIndexForAttribute(t, h, n.Normal)
              } else {
                  var p = WebGraphics.makePoint3D(o - (o - e.x) * v, j.y, -(o - e.x) * d);
                  KNWebGLUtil.setPoint3DAtIndexForAttribute(p, h, n.Position);
                  var t = WebGraphics.makePoint3D( - d, l.y, v);
                  KNWebGLUtil.setPoint3DAtIndexForAttribute(t, h, n.Normal)
              }
          }
      }
  },
  draw: function() {
      var e = this.renderer;
      var d = this.gl;
      var c = this.program.flop;
      var b = this.program.defaultTexture;
      var h = this.textures;
      var l = h[1].texture;
      var j = h[0].texture;
      d.useProgram(b.shaderProgram);
      d.disable(d.CULL_FACE);
      d.bindTexture(d.TEXTURE_2D, l);
      var f = this.mNumPoints;
      var k = this.buffers;
      var a = this.Coordinates;
      var i = this.attributeBufferData;
      KNWebGLUtil.bindDynamicBufferWithData(d, b.attribs.Position, k.PositionCoordinates, a.DefaultPosition, 3);
      KNWebGLUtil.bindDynamicBufferWithData(d, b.attribs.TexCoord, k.TextureCoordinates, a.DefaultTexture, 2);
      d.drawArrays(d.TRIANGLE_STRIP, 0, 4);
      d.useProgram(b.shaderProgram);
      d.disable(d.CULL_FACE);
      d.bindTexture(d.TEXTURE_2D, j);
      KNWebGLUtil.bindDynamicBufferWithData(d, b.attribs.Position, k.PositionCoordinates, a.DefaultPosition2, 3);
      KNWebGLUtil.bindDynamicBufferWithData(d, b.attribs.TexCoord, k.TextureCoordinates, a.DefaultTexture2, 2);
      d.drawArrays(d.TRIANGLE_STRIP, 0, 4);
      d.enable(d.CULL_FACE);
      d.useProgram(c.shaderProgram);
      d.bindBuffer(d.ARRAY_BUFFER, k.Position);
      d.bufferData(d.ARRAY_BUFFER, new Float32Array(i.Position), d.DYNAMIC_DRAW);
      d.vertexAttribPointer(c.attribs.Position, 3, d.FLOAT, false, 0, 0);
      d.bindBuffer(d.ARRAY_BUFFER, k.Normal);
      d.bufferData(d.ARRAY_BUFFER, new Float32Array(i.Normal), d.DYNAMIC_DRAW);
      d.vertexAttribPointer(c.attribs.Normal, 3, d.FLOAT, false, 0, 0);
      d.bindBuffer(d.ARRAY_BUFFER, k.TexCoord);
      d.bufferData(d.ARRAY_BUFFER, new Float32Array(i.TexCoords), d.DYNAMIC_DRAW);
      d.vertexAttribPointer(c.attribs.TexCoord, 2, d.FLOAT, false, 0, 0);
      d.cullFace(d.BACK);
      d.bindTexture(d.TEXTURE_2D, j);
      d.uniformMatrix3fv(c.uniforms.TextureMatrix, false, this.AffineTransform.getColumnMajorFloat32Array());
      d.uniform1f(c.uniforms.FlipNormals, -1);
      for (var g = 0; g < f - 1; g++) {
          d.drawElements(d.TRIANGLE_STRIP, f * 2, d.UNSIGNED_SHORT, g * f * 2 * (2))
      }
      d.bindTexture(d.TEXTURE_2D, l);
      d.cullFace(d.FRONT);
      d.uniformMatrix3fv(c.uniforms.TextureMatrix, false, this.AffineIdentity.getColumnMajorFloat32Array());
      d.uniform1f(c.uniforms.FlipNormals, 1);
      for (var g = 0; g < f - 1; g++) {
          d.drawElements(d.TRIANGLE_STRIP, f * 2, d.UNSIGNED_SHORT, g * f * 2 * (2))
      }
  }
});
var KNWebGLBuildAnvil = Class.create(KNWebGLProgram, {
  initialize: function($super, g, b) {
      var j = b.effect;
      this.programData = {
          name: "com.apple.iWork.Keynote.BUKAnvil",
          programNames: ["anvilsmoke", "anvilspeck"],
          effect: j,
          textures: b.textures
      };
      $super(g, this.programData);
      var d = this.gl;
      this.smokeTexture = KNWebGLUtil.bindTextureWithImage(d, smokeImage);
      this.speckTexture = KNWebGLUtil.bindTextureWithImage(d, speckImage);
      this.percentfinished = 0;
      this.drawableObjects = [];
      for (var c = 0,
      a = this.textures.length; c < a; c++) {
          var h = b.textures[c];
          var f = {
              effect: j,
              textures: [h]
          };
          var e = new KNWebGLDrawable(g, f);
          this.drawableObjects.push(e)
      }
      this.objectY = 1;
      this.parentOpacity = j.baseLayer.initialState.opacity;
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var l = this.renderer;
      var h = this.gl;
      this.smokeSystems = [];
      this.speckSystems = [];
      for (var e = 0,
      b = this.textures.length; e < b; e++) {
          var d = this.textures[e];
          var a = d.width;
          var m = d.height;
          var j = h.viewportWidth;
          var g = h.viewportHeight;
          var f = 300;
          var k = new KNWebGLBuildAnvilSmokeSystem(l, this.program.anvilsmoke, {
              width: a,
              height: m
          },
          {
              width: j,
              height: g
          },
          this.duration, {
              width: f,
              height: 1
          },
          {
              width: kParticleSize,
              height: kParticleSize
          },
          this.smokeTexture);
          f = 40;
          var c = new KNWebGLBuildAnvilSpeckSystem(l, this.program.anvilspeck, {
              width: a,
              height: m
          },
          {
              width: j,
              height: g
          },
          this.duration, {
              width: f,
              height: 1
          },
          {
              width: kParticleSize,
              height: kParticleSize
          },
          this.speckTexture);
          this.smokeSystems.push(k);
          this.speckSystems.push(c)
      }
  },
  drawFrame: function(a, h, r) {
      var w = this.renderer;
      var n = this.gl;
      this.percentfinished += a / r;
      if (this.percentfinished >= 1) {
          this.percentfinished = 1;
          this.isCompleted = true
      }
      n.blendFunc(n.ONE, n.ONE_MINUS_SRC_ALPHA);
      for (var F = 0,
      p = this.textures.length; F < p; F++) {
          var e = this.textures[F];
          var C = e.initialState;
          var K = e.animations;
          if (e.hasHighlightedBulletAnimation) {
              if (!C.hidden) {
                  var G;
                  if (K.length > 0 && K[0].property === "opacity") {
                      var L = K[0].from.scalar;
                      var x = K[0].to.scalar;
                      var t = x - L;
                      G = L + t * this.percentfinished
                  } else {
                      G = e.initialState.opacity
                  }
                  this.drawableObjects[F].Opacity = this.parentOpacity * G;
                  this.drawableObjects[F].drawFrame()
              }
          } else {
              if (e.animations.length > 0) {
                  if (this.isCompleted) {
                      this.drawableObjects[F].Opacity = this.parentOpacity * e.initialState.opacity;
                      this.drawableObjects[F].drawFrame();
                      continue
                  }
                  var b = e.width;
                  var d = e.height;
                  var A = e.offset.pointX;
                  var z = e.offset.pointY;
                  var q = n.viewportWidth;
                  var o = n.viewportHeight;
                  r /= 1000;
                  var E = Math.min(0.2, r * 0.4);
                  var s = Math.min(0.25, r * 0.5);
                  var B = this.cameraShakePointsWithRandomGenerator();
                  var m = (this.percentfinished * r - E) / s;
                  var v = WebGraphics.makePoint(0, 0);
                  if (0 < m && m < 1) {
                      var I = Math.floor(m * kNumCameraShakePoints);
                      var g = Math.ceil(WebGraphics.clamp(m * kNumCameraShakePoints, 0, B.length - 1));
                      var J = B[I];
                      var j = B[g];
                      var f = m * kNumCameraShakePoints - I;
                      v = WebGraphics.makePoint(WebGraphics.mix(J.x, j.x, f), WebGraphics.mix(J.y, j.y, f))
                  }
                  var u = WebGraphics.clamp((this.percentfinished * r) / E, 0, 1);
                  var k = WebGraphics.clamp(((this.percentfinished * r) - E) / (r - E), 0, 1);
                  var c = this.percentfinished;
                  this.objectY = z + d;
                  this.objectY *= (1 - u * u);
                  this.drawableObjects[F].MVPMatrix = WebGraphics.translateMatrix4(w.slideOrthoMatrix, A + (v.x * q), o - z - d + this.objectY + (v.y * o), 0);
                  this.drawableObjects[F].Opacity = this.parentOpacity * e.initialState.opacity;
                  this.drawableObjects[F].drawFrame();
                  var D = WebGraphics.translateMatrix4(w.slideProjectionMatrix, A, o - (z + (d + 16)) * (1 - (k * k * 0.02)), 0);
                  var l = this.smokeSystems[F];
                  l.setMVPMatrix(D);
                  l.drawFrame(k, 1 - (k * k));
                  if (k < 0.5) {
                      D = WebGraphics.translateMatrix4(w.slideOrthoMatrix, A, o - (z + d + 16), 0);
                      var H = this.speckSystems[F];
                      H.setMVPMatrix(D);
                      H.drawFrame(k, WebGraphics.clamp(1 - WebGraphics.sineMap(k) * 2, 0, 1))
                  }
              } else {
                  if (!e.initialState.hidden) {
                      this.drawableObjects[F].Opacity = this.parentOpacity * e.initialState.opacity;
                      this.drawableObjects[F].drawFrame()
                  }
              }
          }
      }
  },
  cameraShakePointsWithRandomGenerator: function() {
      var e = [];
      var c = 0.025;
      for (var a = 0; a < kNumCameraShakePoints; a++) {
          var d = 1 - (a / kNumCameraShakePoints);
          d *= d;
          var b = WebGraphics.makePoint(WebGraphics.randomBetween( - 1, 1) * c * d * 0.4, Math.pow( - 1, a) * c * d);
          e[a] = b
      }
      return e
  }
});
var KNWebGLBuildFlame = Class.create(KNWebGLProgram, {
  initialize: function($super, k, d) {
      this.programData = {
          name: "com.apple.iWork.Keynote.KLNFlame",
          programNames: ["flame"],
          effect: d.effect,
          textures: d.textures
      };
      $super(k, this.programData);
      var g = this.gl;
      this.flameTexture = KNWebGLUtil.bindTextureWithImage(g, flameImage);
      this.percentfinished = 0;
      this.drawableObjects = [];
      this.framebufferDrawableObjects = [];
      this.slideSize = {
          width: g.viewportWidth,
          height: g.viewportHeight
      };
      var n = this.effect;
      for (var f = 0,
      c = this.textures.length; f < c; f++) {
          var l = d.textures[f];
          var j = {
              effect: n,
              textures: [l]
          };
          var h = new KNWebGLDrawable(k, j);
          this.drawableObjects.push(h);
          var m = {
              size: {
                  width: l.width,
                  height: l.height
              },
              origin: {
                  x: l.offset.pointX,
                  y: l.offset.pointY
              }
          };
          var a = this.frameOfEffectWithFrame(m);
          var e = {
              effect: n,
              textures: [],
              drawableFrame: m,
              frameRect: a
          };
          var b = new KNWebGLFramebufferDrawable(k, e);
          this.framebufferDrawableObjects.push(b)
      }
      this.parentOpacity = n.baseLayer.initialState.opacity;
      this.animationWillBeginWithContext()
  },
  frameOfEffectWithFrame: function(g) {
      var d = g.size;
      var f = this.slideSize;
      var i = (1.2 - Math.min(1, Math.sqrt(d.width / f.width))) + 1;
      var e = (1.25 - Math.min(1, Math.sqrt(d.height / f.height))) + 1;
      var h = {
          width: Math.round(d.width * i),
          height: Math.round(d.height * e)
      };
      if (d.width / d.height < 1) {
          h.width = Math.max(h.width, (d.width + d.height))
      }
      var j = {
          size: h,
          origin: {
              x: g.origin.x + (d.width - h.width) / 2,
              y: g.origin.y + (d.height - h.height) / 2
          }
      };
      j.origin.y -= (j.size.height - g.size.height) * 0.25;
      var c = this.gl;
      var b = {
          origin: {
              x: 0,
              y: 0
          },
          size: {
              width: c.viewportWidth,
              height: c.viewportHeight
          }
      };
      var a = CGRectIntersection(j, b);
      a = CGRectIntegral(a);
      return a
  },
  p_orthoTransformWithScale: function(f, e, d) {
      var c = {
          width: d.size.width * f,
          height: d.size.height * f
      };
      var b = WebGraphics.makeOrthoMatrix4(0, c.width, 0, c.height, -1, 1);
      var a = WebGraphics.translateMatrix4(b, e.x, -e.y, 0);
      return a
  },
  animationWillBeginWithContext: function() {
      var j = this.renderer;
      var m = this.gl;
      var a = this.duration / 1000;
      this.flameSystems = [];
      for (var n = 0,
      c = this.textures.length; n < c; n++) {
          var f = this.textures[n];
          var h = f.width;
          var g = f.height;
          var l = m.viewportWidth;
          var b = m.viewportHeight;
          var e = this.framebufferDrawableObjects[n];
          var q = e.frameRect;
          var s = e.drawableFrame;
          var k = {
              x: f.offset.pointX - q.origin.x,
              y: f.offset.pointY + g - (q.origin.y + q.size.height)
          };
          var t = s.origin.y - q.origin.y;
          var o = q.origin.y + q.size.height - (s.origin.y + s.size.height);
          k.y += (o - t);
          e.MVPMatrix = this.p_orthoTransformWithScale(1, k, q);
          var d = h / g;
          var p = Math.round(d * 150);
          p *= (a + Math.max(0, 1 - a / 2));
          var r = new KNWebGLBuildFlameSystem(j, this.program.flame, {
              width: h,
              height: g
          },
          {
              width: l,
              height: b
          },
          Math.max(2, this.duration), p, this.flameTexture);
          r.p_setupParticleDataWithTexture(f);
          this.flameSystems.push(r)
      }
  },
  drawFrame: function(a, h, u) {
      var x = this.renderer;
      var m = this.gl;
      var c = this.program.flame;
      var n = c.uniforms;
      var g = this.buildOut;
      var l = this.percentfinished;
      l += a / u;
      if (l >= 1) {
          l = 1;
          this.isCompleted = true
      }
      this.percentfinished = l;
      m.blendFunc(m.ONE, m.ONE_MINUS_SRC_ALPHA);
      for (var K = 0,
      p = this.textures.length; K < p; K++) {
          var f = this.textures[K];
          var E = f.initialState;
          var N = f.animations;
          if (f.hasHighlightedBulletAnimation) {
              if (!E.hidden) {
                  var L;
                  if (N.length > 0 && N[0].property === "opacity") {
                      var O = N[0].from.scalar;
                      var z = N[0].to.scalar;
                      var v = z - O;
                      L = O + v * this.percentfinished
                  } else {
                      L = f.initialState.opacity
                  }
                  this.drawableObjects[K].Opacity = this.parentOpacity * L;
                  this.drawableObjects[K].drawFrame()
              }
          } else {
              if (f.animations.length > 0) {
                  if (this.isCompleted) {
                      if (!g) {
                          this.drawableObjects[K].Opacity = this.parentOpacity * f.initialState.opacity;
                          this.drawableObjects[K].drawFrame()
                      }
                      continue
                  }
                  var b = f.width;
                  var e = f.height;
                  var C = f.offset.pointX;
                  var B = f.offset.pointY;
                  var r = m.viewportWidth;
                  var o = m.viewportHeight;
                  u /= 1000;
                  var d = l;
                  if (g) {
                      d = 1 - d
                  }
                  var J = g ? 0.25 : 0.5;
                  var t = Math.min(J, 1 / u);
                  if (d > t) {
                      var j = (d - t) / (1 - t);
                      var H = TSUSineMap(Math.min(1, 2 * j));
                      H *= this.parentOpacity * f.initialState.opacity;
                      var D = this.drawableObjects[K];
                      D.Opacity = H;
                      D.drawFrame()
                  }
                  var w = this.framebufferDrawableObjects[K];
                  var F = w.drawableFrame;
                  var A = w.frameRect;
                  var k = {
                      x: f.offset.pointX - A.origin.x,
                      y: f.offset.pointY + e - (A.origin.y + A.size.height)
                  };
                  var I = F.origin.y - A.origin.y;
                  var M = A.origin.y + A.size.height - (F.origin.y + F.size.height);
                  k.y += (M - I);
                  var G = this.p_orthoTransformWithScale(1, k, A);
                  m.viewport(0, 0, A.size.width, A.size.height);
                  m.bindFramebuffer(m.FRAMEBUFFER, w.buffer);
                  m.clear(m.COLOR_BUFFER_BIT);
                  m.enable(m.BLEND);
                  m.blendFunc(m.SRC_ALPHA, m.ONE);
                  var q = (l == 0 || l == 1 ? 0 : 1);
                  m.bindTexture(m.TEXTURE_2D, w.texture);
                  var s = this.flameSystems[K];
                  s.setMVPMatrix(G);
                  m.uniform1f(n.SpeedMax, s._speedMax);
                  s.drawFrame(l, q);
                  m.bindFramebuffer(m.FRAMEBUFFER, null);
                  m.bindTexture(m.TEXTURE_2D, null);
                  m.viewport(0, 0, m.viewportWidth, m.viewportHeight);
                  m.blendFunc(m.ONE, m.ONE_MINUS_SRC_ALPHA);
                  w.MVPMatrix = WebGraphics.translateMatrix4(x.slideProjectionMatrix, A.origin.x, m.viewportHeight - (A.origin.y + A.size.height), 0);
                  w.drawFrame()
              } else {
                  if (!f.initialState.hidden) {
                      this.drawableObjects[K].Opacity = this.parentOpacity * f.initialState.opacity;
                      this.drawableObjects[K].drawFrame()
                  }
              }
          }
      }
  }
});
var KNWebGLTransitionConfetti = Class.create(KNWebGLProgram, {
  initialize: function($super, a, b) {
      this.programData = {
          name: "com.apple.iWork.Keynote.KLNConfetti",
          programNames: ["confetti", "defaultTexture"],
          effect: b.effect,
          textures: b.textures
      };
      $super(a, this.programData);
      this.useGravity = this.direction === KNDirection.kKNDirectionGravity ? true: false;
      this.percentfinished = 0;
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var j = this.renderer;
      var g = this.gl;
      var k = this.textures;
      var d = k[0];
      var b = d.width;
      var l = d.height;
      var i = g.viewportWidth;
      var h = g.viewportHeight;
      var f = 10000;
      g.blendFunc(g.SRC_ALPHA, g.ONE_MINUS_SRC_ALPHA);
      this.confettiSystem = new KNWebGLBuildConfettiSystem(j, this.program.confetti, {
          width: b,
          height: l
      },
      {
          width: i,
          height: h
      },
      this.duration, f, k[1].texture);
      this.confettiSystem.setMVPMatrix(j.slideProjectionMatrix);
      var e = this.program.defaultTexture;
      KNWebGLUtil.enableAttribs(g, e);
      var c = [0, 0, 0, 1, 1, 0, 1, 1, ];
      var a = [0, 0, -1, 0, h, -1, i, 0, -1, i, h, -1, ];
      this.textureCoordinatesBuffer = g.createBuffer();
      g.bindBuffer(g.ARRAY_BUFFER, this.textureCoordinatesBuffer);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(c), g.STATIC_DRAW);
      g.vertexAttribPointer(e.attribs.TexCoord, 2, g.FLOAT, false, 0, 0);
      this.positionBuffer = g.createBuffer();
      KNWebGLUtil.bindDynamicBufferWithData(g, e.attribs.Position, this.positionBuffer, a, 3);
      g.uniformMatrix4fv(e.uniforms.MVPMatrix, false, j.slideOrthoMatrix);
      g.activeTexture(g.TEXTURE0);
      g.uniform1i(e.uniforms.Texture, 0);
      this.drawFrame(0, 0, 4)
  },
  drawFrame: function(b, p, e) {
      var g = this.gl;
      var j = g.viewportWidth;
      var h = g.viewportHeight;
      var a = this.percentfinished;
      a += b / e;
      if (a > 1) {
          a = 1;
          this.isCompleted = true
      }
      var l = this.percentfinished = a;
      var i = 1 - l;
      var k = 1 - i * i * i;
      k = k * (1 - l * l) + (1 - i * i) * (l * l) + l;
      k *= 0.5;
      k *= k;
      var d = 0.75 + (1 - Math.pow(i, 4)) * 0.25;
      var n = WebGraphics.translateMatrix4(this.renderer.slideProjectionMatrix, j / 2, h / 2, 0);
      n = WebGraphics.scaleMatrix4(n, d, d, 1);
      n = WebGraphics.translateMatrix4(n, -j / 2, -h / 2, 0);
      var f = this.program.defaultTexture;
      g.useProgram(f.shaderProgram);
      g.uniformMatrix4fv(f.uniforms.MVPMatrix, false, n);
      this.draw();
      var o = 1 - l;
      o = WebGraphics.clamp(o, 0, 1);
      k = WebGraphics.clamp(k, 0, 1);
      if (this.useGravity) {
          var m = 1;
          var c = this.renderer.slideProjectionMatrix;
          c = WebGraphics.translateMatrix4(c, 0, -h * 2 * l * l * (1 - m * 0.5), 0);
          this.confettiSystem.setMVPMatrix(c)
      }
      this.confettiSystem.drawFrame(k, o)
  },
  draw: function() {
      var g = this.gl;
      var d = this.program.defaultTexture;
      var f = d.attribs;
      var b = g.viewportWidth;
      var c = g.viewportHeight;
      g.useProgram(d.shaderProgram);
      var a = [0, 0, 0, 1, 1, 0, 1, 1, ];
      var e = [0, 0, -1, 0, c, -1, b, 0, -1, b, c, -1, ];
      g.bindBuffer(g.ARRAY_BUFFER, this.textureCoordinatesBuffer);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(a), g.STATIC_DRAW);
      g.vertexAttribPointer(f.TexCoord, 2, g.FLOAT, false, 0, 0);
      KNWebGLUtil.bindDynamicBufferWithData(g, f.Position, this.positionBuffer, e, 3);
      g.bindTexture(g.TEXTURE_2D, this.textures[0].texture);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4)
  }
});
var KNWebGLBuildConfetti = Class.create(KNWebGLProgram, {
  initialize: function($super, f, b) {
      var h = b.effect;
      this.programData = {
          name: "com.apple.iWork.Keynote.KLNConfetti",
          programNames: ["confetti"],
          effect: h,
          textures: b.textures
      };
      $super(f, this.programData);
      this.useGravity = this.direction === KNDirection.kKNDirectionGravity ? true: false;
      this.percentfinished = 0;
      this.drawableObjects = [];
      for (var c = 0,
      a = this.textures.length; c < a; c++) {
          var g = b.textures[c];
          var e = {
              effect: h,
              textures: [g]
          };
          var d = new KNWebGLDrawable(f, e);
          this.drawableObjects.push(d)
      }
      this.parentOpacity = h.baseLayer.initialState.opacity;
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var l = this.renderer;
      var g = this.gl;
      var j = g.viewportWidth;
      var h = g.viewportHeight;
      this.confettiSystems = [];
      for (var e = 0,
      b = this.textures.length; e < b; e++) {
          var d = this.textures[e];
          var a = d.width;
          var m = d.height;
          var k = (m / h * a / j);
          k = Math.sqrt(Math.sqrt(k));
          var f = Math.round(k * 10000);
          var c = new KNWebGLBuildConfettiSystem(l, this.program.confetti, {
              width: a,
              height: m
          },
          {
              width: j,
              height: h
          },
          this.duration, f, d.texture);
          c.ratio = k;
          this.confettiSystems.push(c)
      }
  },
  drawFrame: function(C, c, a) {
      var v = this.renderer;
      var x = this.gl;
      var w = x.viewportWidth;
      var d = x.viewportHeight;
      var g = this.buildIn;
      var B = this.buildOut;
      var t = this.percentfinished;
      t += C / a;
      if (t > 1) {
          t = 1;
          this.isCompleted = true
      }
      this.percentfinished = t;
      for (var z = 0,
      f = this.textures.length; z < f; z++) {
          var r = this.textures[z];
          var A = r.initialState;
          var n = r.animations;
          if (r.hasHighlightedBulletAnimation) {
              if (!A.hidden) {
                  var e;
                  if (n.length > 0 && n[0].property === "opacity") {
                      var k = n[0].from.scalar;
                      var m = n[0].to.scalar;
                      var q = m - k;
                      e = k + q * t
                  } else {
                      e = r.initialState.opacity
                  }
                  x.blendFunc(x.ONE, x.ONE_MINUS_SRC_ALPHA);
                  this.drawableObjects[z].Opacity = this.parentOpacity * e;
                  this.drawableObjects[z].drawFrame()
              }
          } else {
              if (r.animations.length > 0) {
                  if (this.isCompleted) {
                      if (g) {
                          this.drawableObjects[z].Opacity = this.parentOpacity * r.initialState.opacity;
                          this.drawableObjects[z].drawFrame()
                      }
                      continue
                  }
                  var u = r.width;
                  var s = r.height;
                  var b = g ? 1 - t: t;
                  var j = 1 - b;
                  var p = 1 - j * j * j;
                  p = p * (1 - b * b) + (1 - j * j) * (b * b) + b;
                  p *= 0.5;
                  if (g) {
                      p *= p
                  }
                  var h = this.confettiSystems[z];
                  var D = WebGraphics.translateMatrix4(v.slideProjectionMatrix, r.offset.pointX, d - (r.offset.pointY + s), 0);
                  var o = 1 - b;
                  o = WebGraphics.clamp(o, 0, 1);
                  p = WebGraphics.clamp(p, 0, 1);
                  if (this.useGravity) {
                      var l = h.ratio;
                      D = WebGraphics.translateMatrix4(D, 0, -d * 2 * b * b * (1 - l * 0.5), 0)
                  }
                  x.blendFunc(x.SRC_ALPHA, x.ONE_MINUS_SRC_ALPHA);
                  h.setMVPMatrix(D);
                  h.drawFrame(p, o)
              } else {
                  if (!r.initialState.hidden) {
                      x.blendFunc(x.ONE, x.ONE_MINUS_SRC_ALPHA);
                      this.drawableObjects[z].Opacity = this.parentOpacity * r.initialState.opacity;
                      this.drawableObjects[z].drawFrame()
                  }
              }
          }
      }
  }
});
var KNWebGLBuildDiffuse = Class.create(KNWebGLProgram, {
  initialize: function($super, f, b) {
      var h = b.effect;
      this.programData = {
          name: "com.apple.iWork.Keynote.KLNDiffuse",
          programNames: ["diffuse"],
          effect: h,
          textures: b.textures
      };
      $super(f, this.programData);
      this.percentfinished = 0;
      this.drawableObjects = [];
      for (var c = 0,
      a = this.textures.length; c < a; c++) {
          var g = b.textures[c];
          var e = {
              effect: h,
              textures: [g]
          };
          var d = new KNWebGLDrawable(f, e);
          this.drawableObjects.push(d)
      }
      this.parentOpacity = h.baseLayer.initialState.opacity;
      this.animationWillBeginWithContext()
  },
  animationWillBeginWithContext: function() {
      var l = this.renderer;
      var g = this.gl;
      var j = g.viewportWidth;
      var h = g.viewportHeight;
      this.diffuseSystems = [];
      for (var e = 0,
      b = this.textures.length; e < b; e++) {
          var d = this.textures[e];
          var a = d.width;
          var m = d.height;
          var k = (m / h * a / j);
          k = Math.sqrt(Math.sqrt(k));
          var f = Math.round(k * 4000);
          var c = new KNWebGLBuildDiffuseSystem(l, this.program.diffuse, {
              width: a,
              height: m
          },
          {
              width: j,
              height: h
          },
          this.duration, f, d.texture, this.direction === KNDirection.kKNDirectionRightToLeft);
          this.diffuseSystems.push(c)
      }
  },
  drawFrame: function(v, b, a) {
      var o = this.renderer;
      var q = this.gl;
      var p = q.viewportWidth;
      var c = q.viewportHeight;
      var m = this.percentfinished;
      m += v / a;
      if (m > 1) {
          m = 1;
          this.isCompleted = true
      }
      this.percentfinished = m;
      q.blendFunc(q.ONE, q.ONE_MINUS_SRC_ALPHA);
      for (var r = 0,
      e = this.textures.length; r < e; r++) {
          var k = this.textures[r];
          var s = k.initialState;
          var h = k.animations;
          if (k.hasHighlightedBulletAnimation) {
              if (!s.hidden) {
                  var d;
                  if (h.length > 0 && h[0].property === "opacity") {
                      var f = h[0].from.scalar;
                      var g = h[0].to.scalar;
                      var j = g - f;
                      d = f + j * m
                  } else {
                      d = k.initialState.opacity
                  }
                  this.drawableObjects[r].Opacity = this.parentOpacity * d;
                  this.drawableObjects[r].drawFrame()
              }
          } else {
              if (k.animations.length > 0) {
                  var n = k.width;
                  var l = k.height;
                  var u = k.offset.pointX;
                  var t = k.offset.pointY;
                  var w = this.diffuseSystems[r];
                  var x = WebGraphics.translateMatrix4(o.slideProjectionMatrix, u, c - (t + l), 0);
                  w.setMVPMatrix(x);
                  w.drawFrame(this.percentfinished, 1)
              } else {
                  if (!k.initialState.hidden) {
                      this.drawableObjects[r].Opacity = this.parentOpacity * k.initialState.opacity;
                      this.drawableObjects[r].drawFrame()
                  }
              }
          }
      }
  }
});