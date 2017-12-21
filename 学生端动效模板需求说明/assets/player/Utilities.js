var s = Class.create({
  initialize: function() {}
});
function getMobileOSVersionInfo() {
  var b = navigator.userAgent.match(/iPhone OS ([\d_]+)/) || navigator.userAgent.match(/iPad OS ([\d_]+)/) || navigator.userAgent.match(/CPU OS ([\d_]+)/);
  var c = {
      major: 0,
      minor: 0,
      point: 0
  };
  if (b) {
      var a = b[1].split("_");
      c.major = parseInt(a[0]);
      if (a.length > 1) {
          c.minor = parseInt(a[1])
      }
      if (a.length > 2) {
          c.point = parseInt(a[2])
      }
  }
  return c
}
function isMobileSafari() {
  if (navigator.userAgent.indexOf("iPod") != -1) {
      return true
  } else {
      if (navigator.userAgent.indexOf("iPhone") != -1) {
          return true
      } else {
          if (navigator.userAgent.indexOf("iPad") != -1) {
              return true
          } else {
              return false
          }
      }
  }
}
function isiPad() {
  return (navigator.userAgent.indexOf("iPad") != -1)
}
function getUrlParameter(b) {
  b = b.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var a = "[\\?&]" + b + "=([^&#]*)";
  var c = new RegExp(a);
  var d = c.exec(window.location.href);
  if (d == null) {
      return ""
  } else {
      return d[1]
  }
}
function setElementProperty(c, b, a) {
  if (browserPrefix == "ms") {
      c.style[b] = a
  } else {
      c.style.setProperty(b, a, null)
  }
}
function setElementOpaque(a) {
  a.style.opacity = 1
}
function setElementTransparent(a) {
  a.style.opacity = 0
}
function setElementPosition(b, e, d, c, a) {
  if (b == null) {
      window.console.log("null element passed to setElementPosition " + e + ", " + d + ", " + c + ", " + a);
      return
  }
  b.style.top = e + "px";
  b.style.left = d + "px";
  b.style.width = c + "px";
  b.style.height = a + "px"
}
function setElementRect(a, b) {
  if (a == null) {
      return
  }
  a.style.top = b.y;
  a.style.left = b.x;
  a.style.width = b.width;
  a.style.height = b.height
}
function centerElementInDiv(c, e, d, a, b) {
  if (c == null) {
      return
  }
  var g = (b - d) / 2;
  var f = (a - e) / 2;
  setElementPosition(c, g, f, e, d)
}
function showElement(a) {
  if (a == null) {
      return
  }
  a.style.visibility = "visible"
}
function hideElement(a) {
  if (a == null) {
      return
  }
  a.style.visibility = "hidden"
}
function runInNextEventLoop(a) {
  setTimeout(a, 100)
}
function ensureScaleFactorNotZero(a) {
  if (a == 0) {
      return 0.000001
  } else {
      return a
  }
}
function scaleSizeWithinSize(c, g, e, d) {
  var f = {};
  var b = c / g;
  var a = e / d;
  if (b > a) {
      f.width = e;
      f.height = g * (e / c)
  } else {
      if (b < a) {
          f.width = c * (d / g);
          f.height = d
      } else {
          f.width = e;
          f.height = d
      }
  }
  return f
}
function parseTransformMatrix(a) {
  var c = [1, 0, 0, 1, 0, 0];
  if (a.indexOf("matrix(") == 0) {
      var b = a.substring(7, a.length - 1);
      c = b.split(",")
  }
  return c
}
function escapeTextureId(b) {
  var a = b.replace(/\./g, "-");
  return a
}
function unEscapeTextureId(b) {
  var a = b.replace(/\-/g, ".");
  return a
}
var MONTH_NAMES = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
var DAY_NAMES = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
function LZ(a) {
  return (a < 0 || a > 9 ? "": "0") + a
}
Object.extend(Date.prototype, {
  format: function(D) {
      D = D + "";
      var I = this;
      var l = "";
      var v = 0;
      var G = "";
      var f = "";
      var j = I.getFullYear() + "";
      var g = I.getMonth() + 1;
      var F = I.getDate();
      var o = I.getDay();
      var n = I.getHours();
      var x = I.getMinutes();
      var q = I.getSeconds();
      var t, u, b, r, J, e, C, B, z, p, N, n, L, i, a, A;
      var w = new Object();
      if (j.length < 4) {
          j = "" + (j - 0 + 1900)
      }
      w.y = "" + j;
      w.yyyy = j;
      w.yy = j.substring(2, 4);
      w.M = g;
      w.MM = LZ(g);
      w.MMM = MONTH_NAMES[g - 1];
      w.NNN = MONTH_NAMES[g + 11];
      w.d = F;
      w.dd = LZ(F);
      w.E = DAY_NAMES[o + 7];
      w.EE = DAY_NAMES[o];
      w.H = n;
      w.HH = LZ(n);
      if (n == 0) {
          w.h = 12
      } else {
          if (n > 12) {
              w.h = n - 12
          } else {
              w.h = n
          }
      }
      w.hh = LZ(w.h);
      if (n > 11) {
          w.K = n - 12
      } else {
          w.K = n
      }
      w.k = n + 1;
      w.KK = LZ(w.K);
      w.kk = LZ(w.k);
      if (n > 11) {
          w.a = "PM"
      } else {
          w.a = "AM"
      }
      w.m = x;
      w.mm = LZ(x);
      w.s = q;
      w.ss = LZ(q);
      while (v < D.length) {
          G = D.charAt(v);
          f = "";
          while ((D.charAt(v) == G) && (v < D.length)) {
              f += D.charAt(v++)
          }
          if (w[f] != null) {
              l = l + w[f]
          } else {
              l = l + f
          }
      }
      return l
  }
});
function getHecklerElementsByTagName(a, b) {
  return getElementsByTagNameNS(a, b, "urn:iwork:property", "X:")
}
function getElementsByTagNameNS(b, c, d, e) {
  var a = null;
  if (b.getElementsByTagNameNS) {
      a = b.getElementsByTagNameNS(d, c)
  } else {
      a = b.getElementsByTagName(e + c)
  }
  return a
};