
// 无视频
if (!ispring.compatibility.performRedirectIfNeeded("data/html5-unsupported.html")) { (function(startup) {
  function start(savedPresentationState) {
      var presInfo = "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";
      PresentationPlayer.start(presInfo, "content", "playerView", onPlayerInit, savedPresentationState);
      function onPlayerInit(player) { (function(player) { (function(player) {
                  function findConnector(win) {
                      var retries = 0;
                      while (!win.ispringPresentationConnector && win.parent && win.parent != win) {++retries;
                          if (retries > 7) {
                              return null
                          }
                          win = win.parent
                      }
                      return win.ispringPresentationConnector
                  }
                  function getConnector() {
                      var api = findConnector(window);
                      if (!api && window.opener && (typeof(window.opener) != "undefined")) {
                          api = findConnector(window.opener)
                      }
                      return api
                  }
                  var connector = getConnector();
                  if (connector) {
                      connector.register(player)
                  }
              })(player)
          })(player);
          var preloader = document.getElementById("preloader");
          preloader.parentNode.removeChild(preloader)
      }
  }
  if (startup) {
      startup(start)
  } else {
      start()
  }
})()
};

// 有视频
// if (!ispring.compatibility.performRedirectIfNeeded("data/html5-unsupported.html")) { (function(startup) {
//   function start(savedPresentationState) {
//       var presInfo = "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";
//       PresentationPlayer.start(presInfo, "content", "playerView", onPlayerInit, savedPresentationState);
//       function onPlayerInit(player) { (player);

//           var preloader = document.getElementById("preloader");
//           preloader.parentNode.removeChild(preloader);
//       }
//   }
//   if (startup) {
//     startup(start);
//   } else { 
//     start();
//   }
// })();};