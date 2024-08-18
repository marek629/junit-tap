import { clone } from 'ramda'

import Observer from './Observer.js'

class YamlObserver extends Observer {
  #yaml = []

  constructor (sax) {
    super(sax)
  }

  get duration_ms () {
    return this.#yaml.duration_ms
  }

  set duration_ms (value) {
    this.#yaml.duration_ms = value
  }

  get values () {
    return clone(this.#yaml)
  }

  flush () {
    const obj = this.values
    this.#yaml = {}
    return obj
  }
}

export default YamlObserver
