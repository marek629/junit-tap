import { scheduler } from 'timers/promises'

const round = ms => parseFloat(ms.toFixed(2))

class TestTimer {
  #ms = 0
  #consumedMs = 0
  #scheduler = scheduler
  #promise = Promise.resolve()
  #push

  constructor (scheduler, push) {
    if (scheduler) this.#scheduler = scheduler
    this.#push = push
  }

  get ms () {
    return this.#ms
  }

  set ms (value) {
    this.#ms = round(value)
  }

  consume () {
    this.#consumedMs += this.ms
  }

  finish () {
    this.ms -= this.#consumedMs
    if (this.ms < 0) this.ms = 0
    else this.ms = this.ms
    this.#consumedMs = 0
  }

  enqueue (tap) {
    const ms = this.ms
    this.#promise = this.#promise.then(() => this.#wait(ms, tap))
    this.ms = 0
  }

  #wait (ms, tap) {
    return this.#scheduler.wait(ms).then(() => {
      this.#push(tap)
    })
  }

  flush (next) {
    this.#promise.then(() => next())
  }
}

export default TestTimer
