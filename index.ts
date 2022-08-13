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
function escapeRegex(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

export const HEX_CHARACTER_CLASS = "[0-9a-f]";
export const BASE64_URL_CHARACTER_CLASS = "[A-Za-z0-9-_]";

export function createRegexp({
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
  return new RegExp(`${escapeRegex(before)}(${characters}{${size}})${escapeRegex(after)}`, "d");
}

export function replaceHash({
  stringWithHash,
  replacement = "[hash]",
  regexps = [
    createRegexp({
      characters: HEX_CHARACTER_CLASS,
      size: 8,
      before: ".",
      after: ".",
    }),
    createRegexp({
      characters: HEX_CHARACTER_CLASS,
      size: 32,
      before: "__WB_REVISION__=",
      after: "",
    }),
  ],
}: {
  stringWithHash: string;
  replacement?: string;
  regexps?: Array<RegExp>;
}): string | never {
  for (const regexp of regexps) {
    if (!regexp.hasIndices) {
      throw new Error(
        `Match indices (https://v8.dev/features/regexp-match-indices) must be enabled on ` +
          `/${regexp.source}/`
      );
    }

    const result = regexp.exec(stringWithHash);
    if (result) {
      if (result.indices?.length !== 2) {
        throw new Error(
          `The matching RegExp /${regexp.source}/ does not have exactly one capture group.`
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
      ""
    )}`
  );
}
