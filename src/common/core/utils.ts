import CyrillicToTranslit from "cyrillic-to-translit-js";

// @ts-expect-error I don't know man...
const cyrillicToTranslit = new CyrillicToTranslit();

export function transformNameToCode(name: string) {
  const withoutSpaces = name.replace(/\s+/g, "-");
  const translit = cyrillicToTranslit.transform(withoutSpaces, "-");
  const codeSymbolsOnly = translit.replace(/[^a-z0-9_-]/gi, "");
  return codeSymbolsOnly.toLowerCase();
}
