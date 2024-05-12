import { join } from 'path'
import { readFile } from 'fs/promises'

import { dirname } from 'dirname-filename-esm'
import { parse } from 'yaml'

const i18n = `${join(dirname(import.meta), '..', 'i18n')}`

export const getDescriptions = async lang => {
  const [locale] = lang.split('_', 1)
  const en = parse(await readFile(join(i18n, 'en.yml'), 'utf8'))
  if (locale === 'en') return en
  try {
    const translation = parse(await readFile(join(i18n, `${locale}.yml`), 'utf8'))
    return { ...en, ...translation }
  }
  catch {
    return en
  }
}
