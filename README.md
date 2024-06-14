# junit-tap

XML jUnit formatted stream conventer produces a TAP output.

## Usage

Simply pass XML input in jUnit format

```sh
junit-tap < junit.xml
```

or using cat

```sh
cat junit.xml | junit-tap
```

or in shell pipeline

```sh
( cd ../gource; node --test --test-reporter junit test/ ) | junit-tap | tap-merge | faucet
```

### Help

```sh
junit-tap --help
```

It should produce output like below:

```
Options:
  --fast     Do not simulate test duration based on time argument value
                                                      [boolean] [default: false]
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

### Real time test reproduction

`junit-tap` can produce TAP output acts like tests running in real time.
The behaviour is based on `time` attribute of `testsuite` and `testcase` tags.

You can produce TAP stream as fast as possible by using `--fast` switch.

## Limitations

Mainly tested with jUnit XML output from `node.js` test runner and tap-junit produced from TAP stream from `ava` and `bats`.

It counts from 1 for every test suite.
For further output processing properly, `tap-merge` package could be helpful.
