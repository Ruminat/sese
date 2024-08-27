export const STORAGE_TYPE = {
  s3: "s3",
  localStorage: "localStorage",
} as const;

export type TStorageType = (typeof STORAGE_TYPE)[keyof typeof STORAGE_TYPE];

const storageTypeValues = Object.values(STORAGE_TYPE);

export function getStorageType(): TStorageType {
  return isStorageType(process.env.REACT_APP_STORAGE_TYPE) ? process.env.REACT_APP_STORAGE_TYPE : STORAGE_TYPE.s3;
}

function isStorageType(value: unknown): value is TStorageType {
  return typeof value === "string" && storageTypeValues.includes(value as TStorageType);
}
