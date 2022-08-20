import {expect, test} from 'vitest';

import {HEX_CHARACTER_CLASS, createRegExp, removeHash} from './index';

test('should work when a single pattern is provided, not in an array', () => {
	const replaced = removeHash({
		stringWithHash: 'http://localhost:3000/main.abcd1234.js',
		replacement: '[hash]',
		regexps: createRegExp({
			characters: HEX_CHARACTER_CLASS,
			size: 8,
			before: '.',
			after: '.',
		}),
	});

	expect(replaced).toBe('http://localhost:3000/main.[hash].js');
});

test('should work when a single pattern is provided in an array', () => {
	const replaced = removeHash({
		stringWithHash: 'http://localhost:3000/main.abcd1234.js',
		replacement: '[hash]',
		regexps: [
			createRegExp({
				characters: HEX_CHARACTER_CLASS,
				size: 8,
				before: '.',
				after: '.',
			}),
		],
	});

	expect(replaced).toBe('http://localhost:3000/main.[hash].js');
});

test('should work when multiple patterns are provided', () => {
	const replaced = removeHash({
		stringWithHash: 'http://localhost:3000/main.abcd1234.js',
		replacement: '[hash]',
		regexps: [
			new RegExp('WILL_NOT_MATCH', 'd'),
			createRegExp({
				characters: HEX_CHARACTER_CLASS,
				size: 8,
				before: '.',
				after: '.',
			}),
		],
	});

	expect(replaced).toBe('http://localhost:3000/main.[hash].js');
});

test(`should remove the hash when the replacement is ''`, () => {
	const replaced = removeHash({
		stringWithHash: 'http://localhost:3000/main.abcd1234.js',
		replacement: '',
		regexps: [new RegExp(`(\.${HEX_CHARACTER_CLASS}{8})\.`, 'd')],
	});

	expect(replaced).toBe('http://localhost:3000/main.js');
});

test('should throw when a RegExp without capture groups is used', () => {
	expect(() =>
		removeHash({
			stringWithHash: 'http://localhost:3000/main.abcd1234.js',
			replacement: '',
			regexps: [new RegExp(`\.${HEX_CHARACTER_CLASS}{8}\.`, 'd')],
		}),
	).toThrow('capture group');
});

test('should throw when a RegExp does not have match indices', () => {
	expect(() =>
		removeHash({
			stringWithHash: 'http://localhost:3000/main.abcd1234.js',
			replacement: '',
			regexps: [new RegExp(`\.${HEX_CHARACTER_CLASS}{8}\.`)],
		}),
	).toThrow('Match indices');
});

test('should throw when none of the RegExps match', () => {
	expect(() =>
		removeHash({
			stringWithHash: 'http://localhost:3000/main.abcd1234.js',
			replacement: '',
			regexps: [new RegExp('WILL_NOT_MATCH', 'd')],
		}),
	).toThrow('No match found');
});
