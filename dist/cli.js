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

// src/transform.js
import { EOL } from "os";
import { Transform } from "stream";
import sax from "sax";
import { finish, start, test } from "supertap";
import { stringify } from "yaml";
var _sax, _tap, _stats, _buffer, _testCases, _failures, _comments, _yaml, _initTapData, initTapData_fn, _onOpenTestSuite, onOpenTestSuite_fn, _onOpenTestCase, onOpenTestCase_fn, _onOpenFailure, onOpenFailure_fn, _onOpenSkipped, onOpenSkipped_fn, _onCloseTestCase, onCloseTestCase_fn, _onCloseTestSuite, onCloseTestSuite_fn;
var JUnitTAPTransform = class extends Transform {
  constructor(options) {
    super(options);
    __privateAdd(this, _initTapData);
    __privateAdd(this, _onOpenTestSuite);
    __privateAdd(this, _onOpenTestCase);
    __privateAdd(this, _onOpenFailure);
    __privateAdd(this, _onOpenSkipped);
    __privateAdd(this, _onCloseTestCase);
    __privateAdd(this, _onCloseTestSuite);
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
    __privateAdd(this, _failures, []);
    __privateAdd(this, _comments, []);
    __privateAdd(this, _yaml, {});
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
    const tap = [
      __privateGet(this, _tap),
      ...__privateGet(this, _buffer)
    ].join(EOL);
    __privateSet(this, _tap, "");
    __privateGet(this, _buffer).length = 0;
    next(null, tap);
  }
};
_sax = new WeakMap();
_tap = new WeakMap();
_stats = new WeakMap();
_buffer = new WeakMap();
_testCases = new WeakMap();
_failures = new WeakMap();
_comments = new WeakMap();
_yaml = new WeakMap();
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
  let title = attributes.name;
  if ("time" in attributes) {
    __privateGet(this, _yaml).duration_ms = attributes.time * 1e3;
  }
  const yaml = __privateGet(this, _yaml);
  if (__privateGet(this, _comments).length > 0)
    yaml.comments = __privateGet(this, _comments);
  if (__privateGet(this, _failures).length > 0)
    yaml.failures = __privateGet(this, _failures).map((f) => f.attributes);
  __privateGet(this, _buffer).push(
    test(title, {
      index: ++__privateGet(this, _stats).index,
      passed: __privateGet(this, _failures).length === 0
    }),
    "  ---",
    stringify(yaml).replace(/^/gm, "  ").replace(/\n  $/, ""),
    "  ..."
  );
  __privateGet(this, _comments).length = 0;
  __privateGet(this, _failures).length = 0;
};
_onCloseTestSuite = new WeakSet();
onCloseTestSuite_fn = function() {
  __privateGet(this, _buffer).push(finish(__privateGet(this, _stats)));
  __privateSet(this, _tap, __privateGet(this, _tap) + __privateGet(this, _buffer).join(EOL));
  __privateGet(this, _buffer).length = 0;
};
var transform_default = JUnitTAPTransform;

// src/cli.js
var transform = new transform_default();
await pipeline(stdin, transform, stdout);
exit(0);
