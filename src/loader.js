import { randomUUID } from 'crypto'

import CommentObserver from './xml/CommentObserver.js'
import FailureObserver from './xml/FailureObserver.js'
import TextObserver from './xml/TextObserver.js'
import YamlObserver from './xml/YamlObserver.js'

const scope = {}

const create = () => {
  const xml = Object.seal({
    sax: null,
  })

  const observer = Object.seal({
    failure: null,
    comment: null,
    yaml: null,
    text: null,
  })

  return { xml, observer }
}

const instance = (container, key, creator, area) => value => {
  const box = area ? area[container] : scope[value.uuid]
  if (!box[key]) box[key] = creator(box)
  return box[key]
}

const setter = (container, key) => value => {
  const id = randomUUID()
  scope[id] = create()
  value.uuid = id
  return instance(container, key, () => value, scope[id])()
}

const saxParser = setter('xml', 'sax')

const failure = instance('observer', 'failure', ({ xml }) => new FailureObserver(xml.sax))
const comment = instance('observer', 'comment', ({ xml }) => new CommentObserver(xml.sax))
const yaml = instance('observer', 'yaml', ({ xml }) => new YamlObserver(xml.sax))
const text = instance('observer', 'text', ({ xml }) => new TextObserver(xml.sax))

export {
  saxParser,
  failure, comment, yaml, text,
}
