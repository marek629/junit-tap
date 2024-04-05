#!/usr/bin/env node

import { exit, stdin, stdout } from 'process'
import { pipeline } from 'stream/promises'

import Transform from './transform.js'

const transform = new Transform()

await pipeline(stdin, transform, stdout)
exit(0)
