# Snapshot report for `test/transform/time.test.js`

The actual snapshot is saved in `time.test.js.snap`.

Generated by [AVA](https://avajs.dev).

## should support time attribute for legacy.java.xml file

> Snapshot 1

    `# Subtest: com.howtodoinjava.junit5.examples.xmlReport.HelloTest␊
    TAP version 13␊
    ok 1 - testOne␊
      ---␊
      duration_ms: 40␊
      ...␊
    ␊
    not ok 2 - testTwo␊
      ---␊
      duration_ms: 8␊
      comments:␊
        - >-␊
          org.opentest4j.AssertionFailedError: expected: <true>but was: <false>at ␊
          			org.junit.jupiter.api.AssertionFailureBuilder.build(AssertionFailureBuilder.java:151)...␊
      failures:␊
        - message: "expected: <true> but was: <false>"␊
          type: org.opentest4j.AssertionFailedError␊
      ...␊
    ␊
    ␊
    1..2␊
    # tests 2␊
    # pass 1␊
    # fail 1␊
    `

## should support time attribute for node.gource.xml file

> Snapshot 1

    `# Subtest: args␊
    TAP version 13␊
    ok 1 - 1 git repo and 1 no-git project␊
      ---␊
      duration_ms: 4.677␊
      ...␊
    ␊
    ok 2 - 3 git repos␊
      ---␊
      duration_ms: 1.242␊
      ...␊
    ␊
    ␊
    1..2␊
    # tests 2␊
    # pass 2␊
    # fail 0␊
    ␊
    # Subtest: cliOptions␊
    TAP version 13␊
    ok 1 - empty string on null given␊
      ---␊
      duration_ms: 1.174␊
      ...␊
    ␊
    ok 2 - empty string on undefined given␊
      ---␊
      duration_ms: 1.139␊
      ...␊
    ␊
    ok 3 - empty string on empty object given␊
      ---␊
      duration_ms: 1.1219999999999999␊
      ...␊
    ␊
    ok 4 - 1 short switch enabled␊
      ---␊
      duration_ms: 1.0970000000000002␊
      ...␊
    ␊
    ok 5 - 1 short switch disabled␊
      ---␊
      duration_ms: 1.0959999999999999␊
      ...␊
    ␊
    ok 6 - 1 long switch enabled␊
      ---␊
      duration_ms: 1.142␊
      ...␊
    ␊
    ok 7 - 1 long switch disabled␊
      ---␊
      duration_ms: 1.149␊
      ...␊
    ␊
    ok 8 - 1 short parameter␊
      ---␊
      duration_ms: 1.083␊
      ...␊
    ␊
    ok 9 - 1 long parameter␊
      ---␊
      duration_ms: 0.987␊
      ...␊
    ␊
    ok 10 - 1 short switch enabled and 1 short parameter␊
      ---␊
      duration_ms: 0.968␊
      ...␊
    ␊
    ok 11 - 2 long and 1 short parameters␊
      ---␊
      duration_ms: 0.953␊
      ...␊
    ␊
    ok 12 - 3 long parameters␊
      ---␊
      duration_ms: 0.937␊
      ...␊
    ␊
    ␊
    1..12␊
    # tests 12␊
    # pass 12␊
    # fail 0␊
    ␊
    not ok 13 - /tmp/gource/test/args.test.js␊
      ---␊
      duration_ms: 53.620000000000005␊
      failures:␊
        - type: testCodeFailure␊
          message: test failed␊
          text: >-␊
            ␊
            [Error: test failed] { code: 'ERR_TEST_FAILURE', failureType:␊
            'testCodeFailure', cause: 'test failed', exitCode: 1, signal: null }␊
      ...␊
    `

## should support time attribute for time.xml file

> Snapshot 1

    `# Subtest: ␊
    TAP version 13␊
    ok 1 - should not be equal␊
      ---␊
      duration_ms: 100␊
      ...␊
    ␊
    ok 2 - should be equal␊
      ---␊
      duration_ms: 30␊
      ...␊
    ␊
    ␊
    1..2␊
    # tests 2␊
    # pass 2␊
    # fail 0␊
    ␊
    # Subtest: com.baeldung.execution.time.SampleExecutionTimeUnitTest␊
    TAP version 13␊
    ok 1 - someEndToEndTest␊
      ---␊
      duration_ms: 9996␊
      ...␊
    ␊
    ok 2 - someIntegrationTest␊
      ---␊
      duration_ms: 5003␊
      ...␊
    ␊
    ok 3 - someUnitTest␊
      ---␊
      duration_ms: 2␊
      ...␊
    ␊
    ␊
    1..3␊
    # tests 3␊
    # pass 3␊
    # fail 0␊
    `