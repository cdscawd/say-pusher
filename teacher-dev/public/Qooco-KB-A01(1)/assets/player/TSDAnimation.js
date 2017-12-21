var KNAnimationActionAcceleration = {
  kSFXActionAccelerationNone: 0,
  kSFXActionAccelerationEaseIn: 1,
  kSFXActionAccelerationEaseOut: 2,
  kSFXActionAccelerationEaseBoth: 3,
  kSFXActionAccelerationCustom: 4
};
var KNActionOpacityName = "apple:action-opacity";
var KNActionMotionPathName = "apple:action-motion-path";
var KNActionRotationName = "apple:action-rotation";
var KNActionScaleName = "apple:action-scale";
var KNActionPopName = "apple:action-pop";
var KNActionPulseName = "apple:action-pulse";
var KNActionBlinkName = "apple:action-blink";
var KNActionFlipName = "apple:action-flip";
var KNActionBounceName = "apple:action-bounce";
var KNActionJiggleName = "apple:action-jiggle";
var KNDirection = {
  kKNDirectionNone: 0,
  kKNDirectionLeftToRight: 11,
  kKNDirectionRightToLeft: 12,
  kKNDirectionTopToBottom: 13,
  kKNDirectionBottomToTop: 14,
  kKNDirectionUpperLeftToBottomRight: 21,
  kKNDirectionUpperRightToBottomLeft: 22,
  kKNDirectionLowerLeftToUpperRight: 23,
  kKNDirectionLowerRightToUpperLeft: 24,
  kKNDirectionClockwise: 31,
  kKNDirectionCounterclockwise: 32,
  kKNDirectionIn: 41,
  kKNDirectionOut: 42,
  kKNDirectionUp: 43,
  kKNDirectionDown: 44,
  kKNDirectionStartToEnd: 51,
  kKNDirectionEndToStart: 52,
  kKNDirectionMiddleToEnds: 53,
  kKNDirectionEndsToMiddle: 54,
  kKNDirectionRandom: 91,
  kKNDirectionAlternating: 92,
  kKNDirectionSimultaneous: 93,
  kKNDirectionBCForward: 111,
  kKNDirectionBCBackward: 112,
  kKNDirectionBCRandom: 113,
  kKNDirectionBCCenter: 114,
  kKNDirectionBCEdges: 115,
  kKNDirectionGravity: 121,
  kKNDirectionNoGravity: 122
};
var kKNAnimationStringTypeNone = "None";
var kKNAnimationStringTypeBuildIn = "In";
var kKNAnimationStringTypeBuildOut = "Out";
var kKNAnimationStringTypeTransition = "Transition";
var kKNAnimationStringTypeActionBuild = "Action";
function KNEffectIsActionEffect(a) {
  if ([KNActionOpacityName, KNActionMotionPathName, KNActionRotationName, KNActionScaleName].indexOf(a) > -1) {
      return true
  } else {
      return false
  }
}
function KNEffectIsEmphasisEffect(a) {
  if ([KNActionPopName, KNActionPulseName, KNActionBlinkName, KNActionFlipName, KNActionBounceName, KNActionJiggleName].indexOf(a) > -1) {
      return true
  } else {
      return false
  }
};