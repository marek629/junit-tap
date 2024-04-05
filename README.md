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

## Limitations

Mainly tested with jUnit XML output from `node.js` test runner and tap-junit produced from TAP stream from `ava` and `bats`.

It counts from 1 for every test suite.
For further output processing properly, `tap-merge` package could be helpful.
