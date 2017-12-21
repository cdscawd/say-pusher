var gDebug = false;
var gDebugOnMobile = false;
var gNumDebugMessagesSent = 0;
var gNumDebugMessagesQueued = 0;
var gDebugMessageQueue = new Array();
var gDebugMessageRequest = null;
var gDebugLastClassName = "";
var gDebugLastMethodName = "";
var gDebugSimulateSlowTextureDownload = false;
var gDebugSimulateTextureLoadFailure = false;
var gDebugSimulateScriptDownloadFailure = false;
var kDebugFunction = "function";
var kDebugSurpressMessage = "!NoOp_!NoOp";
var kDebugSetupShowController = kDebugFunction + "_setupShowController";
var kDebugShowController = "!ShowController";
var kDebugShowController_AdvanceToNextBuild = kDebugShowController + "_!advanceToNextBuild";
var kDebugShowController_AdvanceToNextSlide = kDebugShowController + "_!advanceToNextSlide";
var kDebugShowController_DoIdleProcessing = kDebugShowController + "_!doIdleProcessing";
var kDebugShowController_GoBackToPreviousBuild = kDebugShowController + "_!goBackToPreviousBuild";
var kDebugShowController_GoBackToPreviousSlide = kDebugShowController + "_!goBackToPreviousSlide";
var kDebugShowController_HandleScriptDidDownloadEvent = kDebugShowController + "_!handleScriptDidDownloadEvent";
var kDebugShowController_HandleScriptDidNotDownloadEvent = kDebugShowController + "_!handleScriptDidNotDownloadEvent";
var kDebugShowController_JumpToScene = kDebugShowController + "_!jumpToScene";
var kDebugShowController_OnKeyPress = kDebugShowController + "_!onKeyPress";
var kDebugTouchController = "!TouchController";
var kDebugTouchController_HandleGestureEndEvent = kDebugTouchController + "_!handleGestureEndEvent";
var kDebugTouchController_HandleGestureStartEvent = kDebugTouchController + "_!handleGestureStartEvent";
var kDebugTouchController_HandleTouchCancelEvent = kDebugTouchController + "_!handleTouchCancelEvent";
var kDebugTouchController_HandleTouchCancelEvent = kDebugTouchController + "_!handleTouchMoveEvent";
var kDebugTouchController_HandleTouchEndEvent = kDebugTouchController + "_!handleTouchEndEvent";
var kDebugTouchController_HandleTouchStartEvent = kDebugTouchController + "_!handleTouchStartEvent";
var kDebugTouchController_Initialize = kDebugTouchController + "_!initialize";
var kDebugTouchController_IsTouchWithinTrackArea = kDebugTouchController + "_!isTouchWithinTrackArea";
var kDebugTouchController_SetTrackArea = kDebugTouchController + "_!setTrackArea";
var kDebugScriptMangaer = "!ScriptManager";
var kDebugScriptMangaer_DownloadScript = kDebugScriptMangaer + "_!downloadScript";
var kDebugTimer = "DebugTimer";
var kDebugTimer_AdvanceToNextBuild = kDebugTimer + "_!advanceToNextBuild";
var kDebugTimer_CreateAnimationsForScene = kDebugTimer + "_!createAnimationsForScene";
var kDebugTimer_ApplyAnimationsForScene = kDebugTimer + "_!applyAnimationsForScene";
var kDebugTimer_PreProcessSceneAnimations = kDebugTimer + "_!preProcessSceneAnimations";
var kDebugTimer_AdvanceToNextBuild_to_ApplyAnimations = kDebugTimer + "_!preProcessSceneAnimations_to_ApplyAnimations";
var kDebugTimer_JumpToScene = kDebugTimer + "_!jumpToScene";
var kDebugTimer_DisplayScene = kDebugTimer + "_!displayScene";
function debugWarning(a, b) {
    if (gDebug === false) {
        return
    }
    debugSendMessage(a, "WARNING: " + b, true)
}
function debugMessageAlways(a, b) {
    debugSendMessage(a, b, true)
}
function debugMessage(a, b) {
    if (gDebug == false) {
        return
    }
    if ((gDevice == kDeviceMobile) && (gDebugOnMobile == false)) {
        return
    }
    debugSendMessage(a, b, false)
}
function debugSendMessage(b, g, a) {
    var e = b.indexOf("_");
    var d = b.substring(0, e);
    var h = b.substring(e + 1);
    var f = false;
    if (d[0] == "!") {
        d = d.substring(1);
        f = true
    }
    if (h[0] == "!") {
        h = h.substring(1);
        f = true
    }
    if (h[0] == "+") {
        h = h.substring(1);
        a = true
    }
    if ((f == true) && (a == false)) {
        return
    }
    var c = "";
    if (g == null) {
        g = ""
    }
    if (g[0] != "-" || d != gDebugLastClassName || h != gDebugLastMethodName) {
        if (d == kDebugTimer) {
            c = b + ": "
        } else {
            if (d == kDebugFunction) {
                c = h + "() "
            } else {
                c = d + "." + h + "() "
            }
        }
    } else {
        c = ""
    }
    gDebugLastClassName = d;
    gDebugLastMethodName = h;
    if (gDevice == kDeviceMobile) {
        gNumDebugMessagesSent++;
        var i = escape(gNumDebugMessagesSent + ": " + c + g);
        gDebugMessageQueue[gNumDebugMessagesQueued] = i;
        gNumDebugMessagesQueued++;
        if (gNumDebugMessagesQueued == 1) {
            debugCheckMessageQueue()
        }
    } else {
        if (window.console) {
            window.console.log(c + g)
        }
    }
}
function debugSendNextMessageInQueue() {
    var b = gDebugMessageQueue[0];
    gNumDebugMessagesQueued--;
    gDebugMessageQueue.splice(0, 1);
    var a = '/debugMessage.rhtml?message="' + b + '"';
    new Ajax.Request(a, {
        method: "get",
        onSuccess: function(c) {
            debugMessageWasSent(c)
        },
        onFailure: function(c) {
            debugMessageWasNotSent(c)
        }
    })
}
function debugMessageWasSent(a) {
    debugCheckMessageQueue()
}
function debugMessageWasNotSent(a) {
    debugCheckMessageQueue()
}
function debugCheckMessageQueue() {
    if (gNumDebugMessagesQueued > 0) {
        setTimeout(debugSendNextMessageInQueue, 10)
    }
}
var DebugTimer = Class.create({
    initialize: function(a) {
        var b = a.indexOf("_");
        var c = a.substring(b + 1);
        if (c[0] != "!") {
            this.id = a;
            this.startTime = new Date();
            debugMessageAlways(a, "Start")
        } else {
            this.startTime = null
        }
    },
    stop: function() {
        if (this.startTime != null) {
            var b = new Date();
            var a = b - this.startTime;
            debugMessageAlways(this.id, "Stop - Elapsed Time: " + a)
        }
    }
});
function debugStopTimer(a) {
    if (a) {
        a.stop()
    }
}
var debugDomDumpLineNumber = 0;
function debugDumpDomFrom(c, b) {
    var a = kDebugFunction + "_debugDumpDomFrom";
    debugDomDumpLineNumber = 0;
    debugMessageAlways(a, "------------------ S T A R T   O F   D O M   D U M P --- Context: " + b);
    debugRecursivelyDumpDomFrom(c, "");
    debugMessageAlways(a, "------------------ E N D   O F   D O M   D U M P")
}
function debugRecursivelyDumpDomFrom(d, g) {
    var e = kDebugFunction + "_recursivelyDumpDomFrom";
    var b = d.id;
    var a = d.nodeName.toLowerCase();
    if (a == "#text") {
        return
    }
    debugMessageAlways(e, "-" + (debugDomDumpLineNumber++) + g + "<" + a + " id='" + b + "'>");
    var c;
    for (c = 0; c < d.childNodes.length; c++) {
        var f = d.childNodes[c];
        recursivelyDumpDomFrom(f, g + "   ")
    }
    if (a == "img") {
        return
    }
    debugMessageAlways(e, "-" + (debugDomDumpLineNumber++) + g + "</" + a + ">")
};