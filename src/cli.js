#!/usr/bin/env node

import { exit, stdin, stdout } from 'process'
import { pipeline } from 'stream/promises'

import yargs from 'yargs'

import pkg from '../package.json' with { type: 'json' }

import { getDescriptions } from './i18n.js'
import Transform from './transform.js'

const { argv } = yargs(process.argv.slice(2))
  .boolean('fast')
  .describe(await getDescriptions(yargs().locale()))
  .default({
    fast: false,
  })
  .help()
  .version(pkg.version)

const transform = new Transform(argv)

await pipeline(stdin, transform, stdout)
exit(0)
