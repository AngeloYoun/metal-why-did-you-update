import {deepDiff} from './deepDiff'
import {getDisplayName} from './getDisplayName'
import {normalizeOptions} from './normalizeOptions'
import {shouldInclude} from './shouldInclude'

function diffProps (prev, next, displayName) {
  if (prev && next) {
    return deepDiff(prev, next, `${displayName}.props`, [])
  }

  return []
}

function diffState (prev, next , displayName) {
  if (prev && next) {
    return deepDiff(prev, next, `${displayName}.state`, [])
  }

  return []
}

function createShouldUpdate (opts) {
  return function shouldUpdate (state, props) {
    delete this.__WHY_DID_YOU_UPDATE_NOTIFIER__

    const displayName = this.constructor.name

    if (!shouldInclude(displayName, opts)) {
      return
    }

    if (props) {
      let {children, ...sanitizedProps} = props

      props = sanitizedProps
    }

    var nextProps
    var prevProps

    for (var propName in props) {
      nextProps = nextProps || {}
      prevProps = prevProps || {}
      nextProps[propName] = props[propName].newVal;
      prevProps[propName] = props[propName].prevVal;
    }

    var nextState
    var prevState

    for (var stateName in state) {
      nextState = nextState || {}
      prevState = prevState || {}
      nextState[propName] = state[stateName].newVal;
      prevState[propName] = state[stateName].prevVal;
    }

    const diffs =
      diffProps(prevProps, nextProps, displayName)
        .concat(diffState(prevState, nextState, displayName))

    this.__WHY_DID_YOU_UPDATE_NOTIFIER__ = () => diffs.forEach(opts.notifier)

    return !!state || !!props;
  }
}

export const whyDidYouUpdate = (JSXComponent, opts = {}) => {
  opts = normalizeOptions(opts)

  const _shouldUpdate = JSXComponent.prototype.shouldUpdate

  JSXComponent.prototype.shouldUpdate = createShouldUpdate(opts)

  JSXComponent.prototype.rendered = function rendered () {
    if (this.__WHY_DID_YOU_UPDATE_NOTIFIER__) {
      this.__WHY_DID_YOU_UPDATE_NOTIFIER__()
    }
  }

  return JSXComponent
}

export default whyDidYouUpdate
