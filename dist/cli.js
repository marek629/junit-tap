#!/usr/bin/env node
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// src/cli.js
import { exit, stdin, stdout } from "process";
import { pipeline } from "stream/promises";
import yargs from "yargs";

// package.json
var package_default = {
  name: "junit-tap",
  type: "module",
  bin: "./dist/cli.js",
  engines: {
    node: ">= 14.18.3"
  },
  version: "0.2.0",
  repository: "github:marek629/junit-tap",
  homepage: "https://github.com/marek629/junit-tap",
  keywords: [
    "tap",
    "junit",
    "testing",
    "test",
    "anything",
    "protocol"
  ],
  license: "MIT",
  packageManager: "yarn@4.1.1",
  devDependencies: {
    ava: "^6.1.2",
    c8: "^9.1.0",
    esbuild: "^0.20.2",
    sinon: "^17.0.1",
    "tap-merge": "^0.3.1"
  },
  dependencies: {
    "dirname-filename-esm": "^1.1.1",
    sax: "^1.3.0",
    supertap: "^3.0.1",
    yaml: "^2.4.1",
    yargs: "^17.7.2"
  },
  scripts: {
    build: "esbuild src/cli.js --bundle --platform=node --packages=external --target=es2020 --outdir=dist --supported:top-level-await=true --format=esm --sourcemap=external && chmod +x dist/cli.js",
    "build:watch": "esbuild src/cli.js --bundle --platform=node --packages=external --target=es2020 --outdir=dist --supported:top-level-await=true --format=esm --sourcemap=external --watch",
    coverage: "c8 --src src -x '.pnp.*js' -x 'test/**'  --check-coverage -r text -r html -r lcov ava",
    demo: "node dist/cli.js < test/data/time.xml | tap-merge",
    "demo:fast": "node dist/cli.js --fast < test/data/time.xml  | tap-merge",
    test: "ava --tap",
    "test:watch": "ava --watch"
  }
};

// src/i18n.js
import { join } from "path";
import { readFile } from "fs/promises";
import { dirname } from "dirname-filename-esm";
import { parse } from "yaml";
var i18n = `${join(dirname(import.meta), "..", "i18n")}`;
var getDescriptions = async (lang) => {
  const [locale] = lang.split("_", 1);
  const en = parse(await readFile(join(i18n, "en.yml"), "utf8"));
  if (locale === "en")
    return en;
  try {
    const translation = parse(await readFile(join(i18n, `${locale}.yml`), "utf8"));
    return { ...en, ...translation };
  } catch {
    return en;
  }
};

// src/transform.js
import { EOL } from "os";
import { Transform } from "stream";
import { scheduler } from "timers/promises";
import sax from "sax";
import { finish, start, test } from "supertap";
import { stringify } from "yaml";
var round = (ms) => parseFloat(ms.toFixed(2));
var _sax, _tap, _stats, _buffer, _testCases, _testSuites, _failures, _comments, _yaml, _ms, _fast, _scheduler, _consumedMs, _promise, _initTapData, initTapData_fn, _onOpenTestSuite, onOpenTestSuite_fn, _onOpenTestCase, onOpenTestCase_fn, _onOpenFailure, onOpenFailure_fn, _onOpenSkipped, onOpenSkipped_fn, _onCloseTestCase, onCloseTestCase_fn, _onCloseTestSuite, onCloseTestSuite_fn, _flush, flush_fn, _wait, wait_fn;
var JUnitTAPTransform = class extends Transform {
  constructor({ fast = false, scheduler: scheduler2, ...options }) {
    super(options);
    __privateAdd(this, _initTapData);
    __privateAdd(this, _onOpenTestSuite);
    __privateAdd(this, _onOpenTestCase);
    __privateAdd(this, _onOpenFailure);
    __privateAdd(this, _onOpenSkipped);
    __privateAdd(this, _onCloseTestCase);
    __privateAdd(this, _onCloseTestSuite);
    __privateAdd(this, _flush);
    __privateAdd(this, _wait);
    __privateAdd(this, _sax, new sax.SAXParser(true));
    __privateAdd(this, _tap, "");
    __privateAdd(this, _stats, {
      index: 0,
      passed: 0,
      skipped: 0,
      failed: 0
    });
    __privateAdd(this, _buffer, []);
    __privateAdd(this, _testCases, []);
    __privateAdd(this, _testSuites, []);
    __privateAdd(this, _failures, []);
    __privateAdd(this, _comments, []);
    __privateAdd(this, _yaml, {});
    __privateAdd(this, _ms, 0);
    __privateAdd(this, _fast, false);
    __privateAdd(this, _scheduler, scheduler);
    __privateAdd(this, _consumedMs, 0);
    __privateAdd(this, _promise, Promise.resolve());
    __privateSet(this, _fast, fast);
    if (scheduler2)
      __privateSet(this, _scheduler, scheduler2);
    __privateGet(this, _sax).onopentag = (tag) => {
      switch (tag.name) {
        case "testsuite":
          __privateMethod(this, _onOpenTestSuite, onOpenTestSuite_fn).call(this, tag);
          break;
        case "testcase":
          __privateMethod(this, _onOpenTestCase, onOpenTestCase_fn).call(this, tag);
          break;
        case "failure":
          __privateMethod(this, _onOpenFailure, onOpenFailure_fn).call(this, tag);
          break;
        case "skipped":
          __privateMethod(this, _onOpenSkipped, onOpenSkipped_fn).call(this, tag);
          break;
      }
    };
    __privateGet(this, _sax).onclosetag = (tag) => {
      switch (tag) {
        case "testcase":
          __privateMethod(this, _onCloseTestCase, onCloseTestCase_fn).call(this, tag);
          break;
        case "testsuite":
          __privateMethod(this, _onCloseTestSuite, onCloseTestSuite_fn).call(this, tag);
          break;
      }
    };
    __privateGet(this, _sax).oncdata = (data) => {
      if (__privateGet(this, _testCases).length > 0)
        __privateGet(this, _comments).push(data);
    };
  }
  _transform(chunk, encoding, next) {
    __privateGet(this, _sax).write(chunk, encoding);
    next();
  }
  _flush(next) {
    __privateGet(this, _promise).then(() => next());
  }
};
_sax = new WeakMap();
_tap = new WeakMap();
_stats = new WeakMap();
_buffer = new WeakMap();
_testCases = new WeakMap();
_testSuites = new WeakMap();
_failures = new WeakMap();
_comments = new WeakMap();
_yaml = new WeakMap();
_ms = new WeakMap();
_fast = new WeakMap();
_scheduler = new WeakMap();
_consumedMs = new WeakMap();
_promise = new WeakMap();
_initTapData = new WeakSet();
initTapData_fn = function(testsuite) {
  __privateSet(this, _stats, {
    index: 0,
    passed: 0,
    skipped: 0,
    failed: 0
  });
  __privateSet(this, _buffer, [
    `# Subtest: ${testsuite}`,
    start()
  ]);
  __privateSet(this, _testCases, []);
  __privateSet(this, _failures, []);
  __privateSet(this, _comments, []);
  __privateSet(this, _yaml, {});
};
_onOpenTestSuite = new WeakSet();
onOpenTestSuite_fn = function({ attributes, isSelfClosing }) {
  __privateGet(this, _testSuites).push({ attributes, isSelfClosing });
  if (!isSelfClosing)
    __privateMethod(this, _initTapData, initTapData_fn).call(this, attributes?.name ?? "");
};
_onOpenTestCase = new WeakSet();
onOpenTestCase_fn = function({ name, attributes, isSelfClosing }) {
  __privateGet(this, _testCases).push({ name, attributes, isSelfClosing });
  if (isSelfClosing)
    __privateGet(this, _stats).passed++;
};
_onOpenFailure = new WeakSet();
onOpenFailure_fn = function({ attributes, isSelfClosing }) {
  __privateGet(this, _failures).length = 0;
  __privateGet(this, _failures).push({ attributes, isSelfClosing });
};
_onOpenSkipped = new WeakSet();
onOpenSkipped_fn = function({ isSelfClosing }) {
  if (isSelfClosing)
    __privateGet(this, _stats).skipped++;
};
_onCloseTestCase = new WeakSet();
onCloseTestCase_fn = function() {
  const { attributes, isSelfClosing } = __privateGet(this, _testCases).pop();
  if (!isSelfClosing && __privateGet(this, _failures).length > 0) {
    __privateGet(this, _stats).failed++;
  }
  const title = attributes.name;
  if ("time" in attributes) {
    __privateGet(this, _yaml).duration_ms = attributes.time * 1e3;
    if (!__privateGet(this, _fast)) {
      __privateSet(this, _ms, round(__privateGet(this, _yaml).duration_ms));
    }
  }
  const yaml = __privateGet(this, _yaml);
  if (__privateGet(this, _comments).length > 0)
    yaml.comments = __privateGet(this, _comments);
  if (__privateGet(this, _failures).length > 0)
    yaml.failures = __privateGet(this, _failures).map((f) => f.attributes);
  __privateGet(this, _buffer).push(test(title, {
    index: ++__privateGet(this, _stats).index,
    passed: __privateGet(this, _failures).length === 0
  }));
  if (Object.keys(yaml).length > 0) {
    __privateGet(this, _buffer).push(
      "  ---",
      stringify(yaml).replace(/^/gm, "  ").replace(/\n  $/, ""),
      "  ..."
    );
  }
  __privateGet(this, _comments).length = 0;
  __privateGet(this, _failures).length = 0;
  if (__privateGet(this, _ms) > 0) {
    __privateSet(this, _consumedMs, __privateGet(this, _consumedMs) + __privateGet(this, _ms));
    __privateMethod(this, _flush, flush_fn).call(this);
  }
};
_onCloseTestSuite = new WeakSet();
onCloseTestSuite_fn = function() {
  const { attributes } = __privateGet(this, _testSuites).pop();
  if (!__privateGet(this, _fast) && "time" in attributes) {
    __privateSet(this, _ms, round(attributes.time * 1e3));
  }
  __privateGet(this, _buffer).push(finish(__privateGet(this, _stats)));
  __privateSet(this, _ms, __privateGet(this, _ms) - __privateGet(this, _consumedMs));
  if (__privateGet(this, _ms) < 0)
    __privateSet(this, _ms, 0);
  else
    __privateSet(this, _ms, round(__privateGet(this, _ms)));
  __privateSet(this, _consumedMs, 0);
  __privateMethod(this, _flush, flush_fn).call(this);
};
_flush = new WeakSet();
flush_fn = function() {
  __privateSet(this, _tap, __privateGet(this, _tap) + __privateGet(this, _buffer).join(EOL));
  __privateGet(this, _buffer).length = 0;
  if (!__privateGet(this, _tap).endsWith("\n"))
    __privateSet(this, _tap, __privateGet(this, _tap) + "\n");
  const tap = __privateGet(this, _tap);
  const ms = __privateGet(this, _ms);
  __privateSet(this, _promise, __privateGet(this, _promise).then(() => __privateMethod(this, _wait, wait_fn).call(this, ms, tap)));
  __privateSet(this, _tap, "");
  __privateSet(this, _ms, 0);
};
_wait = new WeakSet();
wait_fn = function(ms, tap) {
  return __privateGet(this, _scheduler).wait(ms).then(() => {
    this.push(tap);
  });
};
var transform_default = JUnitTAPTransform;

// src/cli.js
var { argv } = yargs(process.argv.slice(2)).boolean("fast").describe(await getDescriptions(yargs().locale())).default({
  fast: false
}).help().version(package_default.version);
var transform = new transform_default(argv);
await pipeline(stdin, transform, stdout);
exit(0);
