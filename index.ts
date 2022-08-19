// See https://github.com/microsoft/TypeScript/pull/46073/files#diff-e2f9169b6b66c0e336c413dec9b6df6b36a05051256073f8a9de542c08313126
declare global {
	interface RegExpExecArray {
		indices?: RegExpIndicesArray;
	}

	interface RegExpIndicesArray extends Array<[number, number]> {
		groups?: {
			[key: string]: [number, number];
		};
	}

	interface RegExp {
		readonly hasIndices: boolean;
	}
}

// See https://stackoverflow.com/a/3561711/385997
function escapeRegExp(str: string): string {
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * A RegExp character class containing the characters used in hex hashes.
 */
export const HEX_CHARACTER_CLASS = '[0-9a-f]';

/**
 * A RegExp character class containing the characters used in URL-safe Base64 hashes.
 */
export const BASE64_URL_CHARACTER_CLASS = '[A-Za-z0-9-_]';

/**
 * Helper function to create a RegExp that can be passed to
 * @returns {RegExp}
 */
export function createRegExp({
	characters,
	size,
	before,
	after,
}: {
	characters: string;
	size: number;
	before: string;
	after: string;
}): RegExp {
	return new RegExp(`${escapeRegExp(before)}(${characters}{${size}})${escapeRegExp(after)}`, 'd');
}

export function removeHash({
	stringWithHash,
	replacement,
	regexps,
}: {
	stringWithHash: string;
	replacement: string;
	regexps: RegExp | Array<RegExp>;
}): string | never {
	if (!Array.isArray(regexps)) {
		regexps = [regexps];
	}

	for (const regexp of regexps) {
		if (!regexp.hasIndices) {
			throw new Error(
				`Match indices (https://v8.dev/features/regexp-match-indices) must be enabled on ` +
					`/${regexp.source}/`,
			);
		}

		const result = regexp.exec(stringWithHash);
		if (result) {
			if (result.indices?.length !== 2) {
				throw new Error(
					`The matching RegExp /${regexp.source}/ does not have exactly one capture group.`,
				);
			}

			const [start, end] = result.indices[1];
			return stringWithHash.substring(0, start) + replacement + stringWithHash.substring(end);
		}
	}

	throw new Error(
		`No match found: ${JSON.stringify(
			{
				regexps,
				stringWithHash,
			},
			null,
			'',
		)}`,
	);
}
