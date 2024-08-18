#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
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
var __privateSet = (obj, member, value, setter2) => {
  __accessCheck(obj, member, "write to private field");
  setter2 ? setter2.call(obj, value) : member.set(obj, value);
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
    ramda: "^0.30.1",
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
    "test:watch": "ava --watch --fail-fast"
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

// src/xml/SaxWrapper.js
import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import sax from "sax";
var _sax, _uuid;
var SaxWrapper = class extends EventEmitter {
  constructor() {
    super();
    __privateAdd(this, _sax, new sax.SAXParser(true));
    __privateAdd(this, _uuid, randomUUID());
    __privateGet(this, _sax).ontext = (text) => this.emit("text", text);
  }
  get uuid() {
    return __privateGet(this, _uuid);
  }
  set onopentag(cb) {
    __privateGet(this, _sax).onopentag = cb;
  }
  set onclosetag(cb) {
    __privateGet(this, _sax).onclosetag = cb;
  }
  set oncdata(cb) {
    __privateGet(this, _sax).oncdata = cb;
  }
  write(chunk, encoding) {
    return __privateGet(this, _sax).write(chunk, encoding);
  }
};
_sax = new WeakMap();
_uuid = new WeakMap();
var SaxWrapper_default = SaxWrapper;

// src/xml/Observer.js
var Observer = class {
  constructor(sax2) {
    /**
     * @type sax.SAXParser
     */
    __publicField(this, "_sax");
    this._sax = sax2;
  }
  flush() {
    throw new TypeError("Observer is an interface!");
  }
};
var Observer_default = Observer;

// src/xml/SkippedObserver.js
var _testSuite;
var SkippedObserver = class extends Observer_default {
  constructor(sax2, testSuite) {
    super(sax2);
    __privateAdd(this, _testSuite, void 0);
    __privateSet(this, _testSuite, testSuite);
  }
  onOpen({ isSelfClosing }) {
    if (isSelfClosing)
      __privateGet(this, _testSuite).testSkipped();
  }
};
_testSuite = new WeakMap();
var SkippedObserver_default = SkippedObserver;

// src/xml/TestCaseObserver.js
import { test } from "supertap";
import { stringify } from "yaml";

// src/xml/CommentObserver.js
var _comments, _testCase;
var CommentObserver = class extends Observer_default {
  constructor(sax2) {
    super(sax2);
    __privateAdd(this, _comments, []);
    __privateAdd(this, _testCase, void 0);
    this._sax.oncdata = (data) => {
      if (!__privateGet(this, _testCase).empty)
        __privateGet(this, _comments).push(data);
    };
  }
  set testCase(value) {
    __privateSet(this, _testCase, value);
  }
  get empty() {
    return __privateGet(this, _comments).length === 0;
  }
  get values() {
    return [...__privateGet(this, _comments)];
  }
  flush() {
    const a = this.values;
    __privateGet(this, _comments).length = 0;
    return a;
  }
};
_comments = new WeakMap();
_testCase = new WeakMap();
var CommentObserver_default = CommentObserver;

// src/xml/TextObserver.js
var _text, _breakdown;
var TextObserver = class extends Observer_default {
  constructor(sax2, breakdown) {
    super(sax2);
    __privateAdd(this, _text, "");
    __privateAdd(this, _breakdown, void 0);
    __privateSet(this, _breakdown, breakdown);
    sax2.on("text", (text) => {
      if (__privateGet(this, _breakdown).empty)
        return;
      const t = text.trimEnd();
      if (t.length > 0)
        __privateSet(this, _text, t);
    });
  }
  flush() {
    const t = __privateGet(this, _text);
    __privateSet(this, _text, "");
    return t;
  }
};
_text = new WeakMap();
_breakdown = new WeakMap();
var TextObserver_default = TextObserver;

// src/xml/BreakdownObserver.js
var BreakdownObserver = class extends Observer_default {
  constructor(sax2) {
    super(sax2);
    __publicField(this, "_list", []);
    __publicField(this, "_text");
    this._text = new TextObserver_default(sax2, this);
  }
  get empty() {
    return this._list.length === 0;
  }
  get attributes() {
    return this._list.map((f) => f.attributes);
  }
  onOpen({ attributes, isSelfClosing }) {
    this._list.length = 0;
    this._list.push({ attributes, isSelfClosing });
  }
  onClose() {
    const text = this._text.flush();
    if (text.length > 0) {
      this._list[this._list.length - 1].attributes.text = text;
    }
  }
  flush() {
    const a = [...this._list];
    this._list.length = 0;
    return a;
  }
};
var BreakdownObserver_default = BreakdownObserver;

// src/xml/ErrorObserver.js
var ErrorObserver = class extends BreakdownObserver_default {
};
var ErrorObserver_default = ErrorObserver;

// src/xml/FailureObserver.js
var FailureObserver = class extends BreakdownObserver_default {
};
var FailureObserver_default = FailureObserver;

// src/xml/YamlObserver.js
import { clone } from "ramda";
var _yaml;
var YamlObserver = class extends Observer_default {
  constructor(sax2) {
    super(sax2);
    __privateAdd(this, _yaml, []);
  }
  get duration_ms() {
    return __privateGet(this, _yaml).duration_ms;
  }
  set duration_ms(value) {
    __privateGet(this, _yaml).duration_ms = value;
  }
  get values() {
    return clone(__privateGet(this, _yaml));
  }
  flush() {
    const obj = this.values;
    __privateSet(this, _yaml, {});
    return obj;
  }
};
_yaml = new WeakMap();
var YamlObserver_default = YamlObserver;

// src/loader.js
var scope = {};
var create = () => {
  const xml = Object.seal({
    sax: null
  });
  const observer = Object.seal({
    failure: null,
    error: null,
    comment: null,
    yaml: null
  });
  return { xml, observer };
};
var instance = (container, key, creator, area) => (value) => {
  const box = area ? area[container] : scope[value.uuid];
  if (!box[key])
    box[key] = creator(box);
  return box[key];
};
var setter = (container, key) => (value) => {
  const { uuid: id } = value;
  scope[id] = create();
  return instance(container, key, () => value, scope[id])();
};
var saxParser = setter("xml", "sax");
var failure = instance("observer", "failure", ({ xml }) => new FailureObserver_default(xml.sax));
var error = instance("observer", "error", ({ xml }) => new ErrorObserver_default(xml.sax));
var comment = instance("observer", "comment", ({ xml }) => new CommentObserver_default(xml.sax));
var yaml = instance("observer", "yaml", ({ xml }) => new YamlObserver_default(xml.sax));

// src/xml/TestCaseObserver.js
var _cases, _buffer, _fast, _timer, _flush, _testSuite2, _failure, _error, _yaml2, _comment;
var TestCaseObserver = class extends Observer_default {
  constructor(sax2, buffer, isFast, timer, flush, testSuite) {
    super(sax2);
    __privateAdd(this, _cases, []);
    __privateAdd(this, _buffer, []);
    __privateAdd(this, _fast, false);
    __privateAdd(this, _timer, void 0);
    __privateAdd(this, _flush, void 0);
    __privateAdd(this, _testSuite2, void 0);
    __privateAdd(this, _failure, void 0);
    __privateAdd(this, _error, void 0);
    __privateAdd(this, _yaml2, void 0);
    __privateAdd(this, _comment, void 0);
    __privateSet(this, _buffer, buffer);
    __privateSet(this, _fast, isFast);
    __privateSet(this, _timer, timer);
    __privateSet(this, _flush, flush);
    __privateSet(this, _testSuite2, testSuite);
    __privateSet(this, _failure, failure(sax2));
    __privateSet(this, _error, error(sax2));
    __privateSet(this, _yaml2, yaml(sax2));
    __privateSet(this, _comment, comment(sax2));
    __privateGet(this, _comment).testCase = this;
    __privateGet(this, _testSuite2).testCase = this;
  }
  get empty() {
    return __privateGet(this, _cases).length === 0;
  }
  onOpen({ name, attributes, isSelfClosing }) {
    __privateGet(this, _cases).push({ name, attributes, isSelfClosing });
    if (isSelfClosing)
      __privateGet(this, _testSuite2).testPassed();
  }
  onClose() {
    const { attributes, isSelfClosing } = __privateGet(this, _cases).pop();
    if (!isSelfClosing && !(__privateGet(this, _failure).empty && __privateGet(this, _error).empty)) {
      __privateGet(this, _testSuite2).testFailed();
    }
    const title = attributes.name;
    if ("time" in attributes) {
      __privateGet(this, _yaml2).duration_ms = attributes.time * 1e3;
      if (!__privateGet(this, _fast)) {
        __privateGet(this, _timer).ms = __privateGet(this, _yaml2).duration_ms;
      }
    }
    const yaml2 = __privateGet(this, _yaml2).values;
    if (!__privateGet(this, _comment).empty)
      yaml2.comments = __privateGet(this, _comment).values;
    if (!__privateGet(this, _failure).empty)
      yaml2.failures = __privateGet(this, _failure).attributes;
    if (!__privateGet(this, _error).empty)
      yaml2.errors = __privateGet(this, _error).attributes;
    __privateGet(this, _buffer).push(test(title, {
      index: __privateGet(this, _testSuite2).testIndex(),
      passed: __privateGet(this, _failure).empty && __privateGet(this, _error).empty
    }));
    if (Object.keys(yaml2).length > 0) {
      __privateGet(this, _buffer).push(
        "  ---",
        stringify(yaml2).replace(/^/gm, "  ").replace(/\n  $/, ""),
        "  ..."
      );
    }
    __privateGet(this, _comment).flush();
    __privateGet(this, _failure).flush();
    __privateGet(this, _error).flush();
    __privateGet(this, _yaml2).flush();
    if (__privateGet(this, _timer).ms > 0) {
      __privateGet(this, _timer).consume();
      __privateGet(this, _flush).call(this);
    }
  }
  flush() {
    const a = [...__privateGet(this, _cases)];
    __privateGet(this, _cases).length = 0;
    return a;
  }
};
_cases = new WeakMap();
_buffer = new WeakMap();
_fast = new WeakMap();
_timer = new WeakMap();
_flush = new WeakMap();
_testSuite2 = new WeakMap();
_failure = new WeakMap();
_error = new WeakMap();
_yaml2 = new WeakMap();
_comment = new WeakMap();
var TestCaseObserver_default = TestCaseObserver;

// src/xml/TestSuiteObserver.js
import { finish, start } from "supertap";
var _suites, _stats, _buffer2, _fast2, _timer2, _flush2, _comment2, _failure2, _error2, _testCase2, _yaml3, _initTapData, initTapData_fn;
var TestSuiteObserver = class extends Observer_default {
  constructor(sax2, buffer, isFast, timer, flush) {
    super(sax2);
    __privateAdd(this, _initTapData);
    __privateAdd(this, _suites, []);
    __privateAdd(this, _stats, {
      index: 0,
      passed: 0,
      skipped: 0,
      failed: 0
    });
    __privateAdd(this, _buffer2, []);
    __privateAdd(this, _fast2, false);
    __privateAdd(this, _timer2, void 0);
    __privateAdd(this, _flush2, void 0);
    __privateAdd(this, _comment2, void 0);
    __privateAdd(this, _failure2, void 0);
    __privateAdd(this, _error2, void 0);
    __privateAdd(this, _testCase2, void 0);
    __privateAdd(this, _yaml3, void 0);
    __privateSet(this, _buffer2, buffer);
    __privateSet(this, _fast2, isFast);
    __privateSet(this, _timer2, timer);
    __privateSet(this, _flush2, flush);
    __privateSet(this, _comment2, comment(sax2));
    __privateSet(this, _failure2, failure(sax2));
    __privateSet(this, _error2, error(sax2));
    __privateSet(this, _yaml3, yaml(sax2));
  }
  set testCase(value) {
    __privateSet(this, _testCase2, value);
  }
  testIndex() {
    return ++__privateGet(this, _stats).index;
  }
  testPassed() {
    __privateGet(this, _stats).passed++;
  }
  testSkipped() {
    __privateGet(this, _stats).skipped++;
  }
  testFailed() {
    __privateGet(this, _stats).failed++;
  }
  onOpen({ attributes, isSelfClosing }) {
    __privateGet(this, _suites).push({ attributes, isSelfClosing });
    if (!isSelfClosing)
      __privateMethod(this, _initTapData, initTapData_fn).call(this, attributes?.name ?? "");
  }
  onClose() {
    const { attributes } = __privateGet(this, _suites).pop();
    if (!__privateGet(this, _fast2) && "time" in attributes) {
      __privateGet(this, _timer2).ms = attributes.time * 1e3;
    }
    __privateGet(this, _buffer2).push(finish(__privateGet(this, _stats)));
    __privateGet(this, _timer2).finish();
    __privateGet(this, _flush2).call(this);
  }
};
_suites = new WeakMap();
_stats = new WeakMap();
_buffer2 = new WeakMap();
_fast2 = new WeakMap();
_timer2 = new WeakMap();
_flush2 = new WeakMap();
_comment2 = new WeakMap();
_failure2 = new WeakMap();
_error2 = new WeakMap();
_testCase2 = new WeakMap();
_yaml3 = new WeakMap();
_initTapData = new WeakSet();
initTapData_fn = function(testsuite) {
  __privateSet(this, _stats, {
    index: 0,
    passed: 0,
    skipped: 0,
    failed: 0
  });
  __privateGet(this, _buffer2).length = 0;
  __privateGet(this, _buffer2).push(
    `# Subtest: ${testsuite}`,
    start()
  );
  __privateGet(this, _testCase2).flush();
  __privateGet(this, _failure2).flush();
  __privateGet(this, _error2).flush();
  __privateGet(this, _comment2).flush();
  __privateGet(this, _yaml3).flush();
};
var TestSuiteObserver_default = TestSuiteObserver;

// src/TestTimer.js
import { scheduler } from "timers/promises";
var round = (ms) => parseFloat(ms.toFixed(2));
var _ms, _consumedMs, _scheduler, _promise, _push, _wait, wait_fn;
var TestTimer = class {
  constructor(scheduler2, push) {
    __privateAdd(this, _wait);
    __privateAdd(this, _ms, 0);
    __privateAdd(this, _consumedMs, 0);
    __privateAdd(this, _scheduler, scheduler);
    __privateAdd(this, _promise, Promise.resolve());
    __privateAdd(this, _push, void 0);
    if (scheduler2)
      __privateSet(this, _scheduler, scheduler2);
    __privateSet(this, _push, push);
  }
  get ms() {
    return __privateGet(this, _ms);
  }
  set ms(value) {
    __privateSet(this, _ms, round(value));
  }
  consume() {
    __privateSet(this, _consumedMs, __privateGet(this, _consumedMs) + this.ms);
  }
  finish() {
    this.ms -= __privateGet(this, _consumedMs);
    if (this.ms < 0)
      this.ms = 0;
    else
      this.ms = this.ms;
    __privateSet(this, _consumedMs, 0);
  }
  enqueue(tap) {
    const ms = this.ms;
    __privateSet(this, _promise, __privateGet(this, _promise).then(() => __privateMethod(this, _wait, wait_fn).call(this, ms, tap)));
    this.ms = 0;
  }
  flush(next) {
    __privateGet(this, _promise).then(() => next());
  }
};
_ms = new WeakMap();
_consumedMs = new WeakMap();
_scheduler = new WeakMap();
_promise = new WeakMap();
_push = new WeakMap();
_wait = new WeakSet();
wait_fn = function(ms, tap) {
  return __privateGet(this, _scheduler).wait(ms).then(() => {
    __privateGet(this, _push).call(this, tap);
  });
};
var TestTimer_default = TestTimer;

// src/transform.js
var _sax2, _tap, _buffer3, _testCase3, _testSuite3, _failure3, _error3, _skipped, _timer3, _fast3, _flush3, flush_fn;
var JUnitTAPTransform = class extends Transform {
  constructor({ fast = false, scheduler: scheduler2, ...options }) {
    super(options);
    __privateAdd(this, _flush3);
    __privateAdd(this, _sax2, new SaxWrapper_default());
    __privateAdd(this, _tap, "");
    __privateAdd(this, _buffer3, []);
    __privateAdd(this, _testCase3, void 0);
    __privateAdd(this, _testSuite3, void 0);
    __privateAdd(this, _failure3, void 0);
    __privateAdd(this, _error3, void 0);
    __privateAdd(this, _skipped, void 0);
    __privateAdd(this, _timer3, void 0);
    __privateAdd(this, _fast3, false);
    saxParser(__privateGet(this, _sax2));
    __privateSet(this, _fast3, fast);
    __privateSet(this, _timer3, new TestTimer_default(scheduler2, this.push.bind(this)));
    __privateSet(this, _testSuite3, new TestSuiteObserver_default(__privateGet(this, _sax2), __privateGet(this, _buffer3), __privateGet(this, _fast3), __privateGet(this, _timer3), __privateMethod(this, _flush3, flush_fn).bind(this)));
    __privateSet(this, _testCase3, new TestCaseObserver_default(__privateGet(this, _sax2), __privateGet(this, _buffer3), __privateGet(this, _fast3), __privateGet(this, _timer3), __privateMethod(this, _flush3, flush_fn).bind(this), __privateGet(this, _testSuite3)));
    __privateSet(this, _failure3, failure(__privateGet(this, _sax2)));
    __privateSet(this, _error3, error(__privateGet(this, _sax2)));
    __privateSet(this, _skipped, new SkippedObserver_default(__privateGet(this, _sax2), __privateGet(this, _testSuite3)));
    __privateGet(this, _sax2).onopentag = (tag) => {
      switch (tag.name) {
        case "testsuite":
          __privateGet(this, _testSuite3).onOpen(tag);
          break;
        case "testcase":
          __privateGet(this, _testCase3).onOpen(tag);
          break;
        case "failure":
          __privateGet(this, _failure3).onOpen(tag);
          break;
        case "error":
          __privateGet(this, _error3).onOpen(tag);
          break;
        case "skipped":
          __privateGet(this, _skipped).onOpen(tag);
          break;
      }
    };
    __privateGet(this, _sax2).onclosetag = (tag) => {
      switch (tag) {
        case "testcase":
          __privateGet(this, _testCase3).onClose(tag);
          break;
        case "testsuite":
          __privateGet(this, _testSuite3).onClose(tag);
          break;
        case "failure":
          __privateGet(this, _failure3).onClose(tag);
          break;
        case "error":
          __privateGet(this, _error3).onClose(tag);
          break;
      }
    };
  }
  _transform(chunk, encoding, next) {
    __privateGet(this, _sax2).write(chunk, encoding);
    next();
  }
  _flush(next) {
    __privateGet(this, _timer3).flush(next);
  }
};
_sax2 = new WeakMap();
_tap = new WeakMap();
_buffer3 = new WeakMap();
_testCase3 = new WeakMap();
_testSuite3 = new WeakMap();
_failure3 = new WeakMap();
_error3 = new WeakMap();
_skipped = new WeakMap();
_timer3 = new WeakMap();
_fast3 = new WeakMap();
_flush3 = new WeakSet();
flush_fn = function() {
  __privateSet(this, _tap, __privateGet(this, _tap) + __privateGet(this, _buffer3).join(EOL));
  __privateGet(this, _buffer3).length = 0;
  if (!__privateGet(this, _tap).endsWith("\n"))
    __privateSet(this, _tap, __privateGet(this, _tap) + "\n");
  __privateGet(this, _timer3).enqueue(__privateGet(this, _tap));
  __privateSet(this, _tap, "");
};
var transform_default = JUnitTAPTransform;

// src/cli.js
var { argv } = yargs(process.argv.slice(2)).boolean("fast").describe(await getDescriptions(yargs().locale())).default({
  fast: false
}).help().version(package_default.version);
var transform = new transform_default(argv);
await pipeline(stdin, transform, stdout);
exit(0);
