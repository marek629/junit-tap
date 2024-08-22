import BreakdownObserver from './BreakdownObserver.js'

class FailureObserver extends BreakdownObserver {
  _tag = 'failure'
}

export default FailureObserver
