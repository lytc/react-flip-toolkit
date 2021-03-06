import { toArray, assign } from "../../utilities"
import * as constants from "../../constants"

const cancelInProgressAnimations = inProgressAnimations => {
  Object.keys(inProgressAnimations).forEach(id => {
    if (inProgressAnimations[id].stop) inProgressAnimations[id].stop()
    delete inProgressAnimations[id]
  })
}

const addTupleToObject = (acc, curr) => assign(acc, { [curr[0]]: curr[1] })

export const getAllElements = (element, portalKey) => {
  if (portalKey) {
    return toArray(
      document.querySelectorAll(`[${constants.DATA_PORTAL_KEY}="${portalKey}"]`)
    )
  } else {
    return toArray(element.querySelectorAll(`[${constants.DATA_FLIP_ID}]`))
  }
}

/**
 * Called in getSnapshotBeforeUpdate in the Flipped Component
 * @param {Object} args
 * @param {HTMLElement} args.element - the ref for the parent Flipper component
 * @param {Object} args.flipCallbacks - passed in solely to identify which
 * elements have onExit callbacks, and cache their dom elements appropriately
 * @param {Object} args.inProgressAnimations - stop callbacks for currently in
 * progress animations
 * @returns {Object} flippedElementPositions
 */
export const getFlippedElementPositionsBeforeUpdate = ({
  element,
  flipCallbacks = {},
  inProgressAnimations = {},
  portalKey
}) => {
  const flippedElements = getAllElements(element, portalKey)

  const inverseFlippedElements = toArray(
    element.querySelectorAll(`[${constants.DATA_INVERSE_FLIP_ID}]`)
  )

  const childIdsToParentBCRs = {}
  const parentBCRs = []
  const childIdsToParents = {}
  // this is for exit animations so we can re-insert exiting elements in the
  // DOM later
  flippedElements
    .filter(
      el =>
        flipCallbacks &&
        flipCallbacks[el.dataset.flipId] &&
        flipCallbacks[el.dataset.flipId].onExit
    )
    .forEach(el => {
      let parent = el.parentNode
      // this won't work for IE11
      if (el.closest) {
        const exitContainer = el.closest(`[${constants.DATA_EXIT_CONTAINER}]`)
        if (exitContainer) parent = exitContainer
      }
      let bcrIndex = parentBCRs.findIndex(n => n[0] === parent)
      if (bcrIndex === -1) {
        parentBCRs.push([parent, parent.getBoundingClientRect()])
        bcrIndex = parentBCRs.length - 1
      }
      childIdsToParentBCRs[el.dataset.flipId] = parentBCRs[bcrIndex][1]
      childIdsToParents[el.dataset.flipId] = parent
    })

  const flippedElementPositions = flippedElements
    .map(child => {
      let domData = {}
      const childBCR = child.getBoundingClientRect()

      // only cache extra data for exit animations
      // if the element has an onExit listener
      if (
        flipCallbacks &&
        flipCallbacks[child.dataset.flipId] &&
        flipCallbacks[child.dataset.flipId].onExit
      ) {
        const parentBCR = childIdsToParentBCRs[child.dataset.flipId]

        assign(domData, {
          element: child,
          parent: childIdsToParents[child.dataset.flipId],
          childPosition: {
            top: childBCR.top - parentBCR.top,
            left: childBCR.left - parentBCR.left,
            width: childBCR.width,
            height: childBCR.height
          }
        })
      }

      return [
        child.dataset.flipId,
        {
          rect: childBCR,
          opacity: parseFloat(window.getComputedStyle(child).opacity),
          domData
        }
      ]
    })
    .reduce(addTupleToObject, {})

  // do this at the very end since we want to cache positions of elements
  // while they are mid-transition
  cancelInProgressAnimations(inProgressAnimations)

  flippedElements.concat(inverseFlippedElements).forEach(el => {
    el.style.transform = ""
    el.style.opacity = ""
  })
  return {
    flippedElementPositions,
    cachedOrderedFlipIds: flippedElements.map(el => el.dataset.flipId)
  }
}

/**
 * This function is called in onFlipKeyUpdate
 * (which is called in the Flipper component's componentDidUpdate)
 * @param {HTMLElement} args.element - the ref for the parent Flipper component
 * @returns {Object} flippedElementPositions
 */
export const getFlippedElementPositionsAfterUpdate = ({
  element,
  portalKey
}) => {
  return getAllElements(element, portalKey)
    .map(child => {
      const computedStyle = window.getComputedStyle(child)
      const rect = child.getBoundingClientRect()
      return [
        child.dataset.flipId,
        {
          rect,
          opacity: parseFloat(computedStyle.opacity),
          domData: {},
          transform: computedStyle.transform
        }
      ]
    })
    .reduce(addTupleToObject, {})
}
