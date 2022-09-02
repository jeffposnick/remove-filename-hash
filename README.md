# remove-filename-hash

## Installation

```sh
$ npm install remove-filename-hash
```

## Background

[Hashed URLs](https://bundlers.tooling.report/hashing/) and filenames are
commonly created as part of a production build process for modern web
applications. By designating a portion of a URL to include a series of
characters representing a hash of the file's contents, you can ensure that once
a given URL is cached, you never have to revalidate it again against a remote
server.

The hash values are frequently represented as lowercase hexadecimal characters,
although alternative character sets, like
[URL-safe Base 64](https://www.rfc-editor.org/rfc/rfc4648#section-5) is
sometimes be used as well.

## The problem

There are times when you may need to either remove the hash from a URL or
filename string entirely, or replace it with some constant placeholder value,
like `[hash]`.

One motivating use case involves performing
[runtime comparisons](https://jeffy.info/2021/10/10/smart-caching-hashes.html)
of two URLs inside of a service worker, to see if they represent different
versions of the same underlying assets. Another, less esoteric use case, has to
do with writing
[integration tests](https://github.com/jeffposnick/yt-playlist-notifier/blob/add56f0b9c9d237a57b0d9126dd7b250ddefd910/tests/sw.spec.ts)
for web apps that need to interrogate cache state. Direct string comparisons of
the set of cached URLs against a known-good set won't work unless the URLs can
first be normalized, to remove hashes.

## Usage

```js
import {
	createRegExp,
	HEX_CHARACTER_CLASS,
	removeHash,
} from 'remove-filename-hash';

// Match a hash of 8 hex characters, preceded and followed by '.'
// This pattern matches the default asset hashing used by many bundlers.
const eightCharHexRegExp = createRegExp({
	characters: HEX_CHARACTER_CLASS,
	size: 8,
	before: '.',
	after: '.',
});
// eightCharHexRegExp will be /\.[a-f0-9]{8}\./d
// Remove the hash and replace it with '[hash]'.
const replaced = removeHash({
	stringWithHash: 'http://example.com/main.abcd1234.js',
	replacement: '[hash]',
	regexps: eightCharHexRegExp,
});
// replaced will be 'http://example.com/main.[hash].js'

// Instead of using createRegexp(), you can provide any RegExp that contains one
// capture group (representing the string to be removed) and which has the 'd'
// flag enabled.
const manualRegExp = /([a-f0-9]{6}~)/d;
// Remove the 6 hex character hash and the ~, using '' as the replacement.
const removed = removeHash({
	stringWithHash: 'http://example.com/abc123~main.js',
	replacement: '',
	regexps: manualRegExp,
});
// removed will be 'http://example.com/main.js'
```

## API

### removeHash()

Returns a string with the hash value (determined by one of the matching RegExps)
swapped out for the replacement placeholder string.

This will throw an error if an invalid RegExp (one without a single capture
group, or one without match indices enabled) is used, or if there is no instance
of the hash to remove.

```js
removeHash({
  // A string which contains a hash that needs to be removed/replaced.
  stringWithHash: string,
  // The replacement value, or an empty string to remove the hash.
  replacement: string,
  // Either a single RegExp, or an array of RegExps.
  // The first matching pattern is used.
  regexps: RegExp | Array<RegExp>,
});
```

### createRegExp()

Returns a
[RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
that can then be passed to `removeHash()`. Usage of this function is optional,
but it will ensure that your RegExp has the proper capture group and
[match indices](https://v8.dev/features/regexp-match-indices) enabled.

```js
createRegExp({
	// A string representing the set of characters that used for the hash. See
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Character_Classes
	characters: string,
	// The number of characters in each hash.
	size: number,
	// Characters that always precede the hash, or an empty string.
	// This string won't be replaced.
	before: string,
	// Characters that always follow the hash, or an empty string.
	// This string won't be replaced.
	after: string,
});
```

### HEX_CHARACTER_CLASS

A constant value of `'[0-9a-f]'` that can be passed to `createRegExp()`.

### BASE64_URL_CHARACTER_CLASS

A constant value of `'[A-Za-z0-9-_]'` that can be passed to `createRegExp()`.
