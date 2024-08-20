import CommentObserver from './xml/CommentObserver.js'
import ErrorObserver from './xml/ErrorObserver.js'
import FailureObserver from './xml/FailureObserver.js'
import YamlObserver from './xml/YamlObserver.js'

const scope = {}

const create = () => {
  const xml = Object.seal({
    sax: null,
  })

  const observer = Object.seal({
    failure: null,
    error: null,
    comment: null,
    yaml: null,
  })

  return { xml, observer }
}

const instance = (container, key, creator, area) => value => {
  const box = area ? area[container] : scope[value.uuid]
  if (!box[key]) box[key] = creator(box)
  return box[key]
}

const setter = (container, key) => value => {
  const { uuid: id } = value
  scope[id] = create()
  return instance(container, key, () => value, scope[id])()
}

const saxParser = setter('xml', 'sax')

const failure = instance('observer', 'failure', ({ xml }) => new FailureObserver(xml.sax))
const error = instance('observer', 'error', ({ xml }) => new ErrorObserver(xml.sax))
const comment = instance('observer', 'comment', ({ xml }) => new CommentObserver(xml.sax))
const yaml = instance('observer', 'yaml', ({ xml }) => new YamlObserver(xml.sax))

export {
  saxParser,
  failure, error, comment, yaml,
}
