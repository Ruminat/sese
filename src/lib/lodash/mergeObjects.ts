import mergeWith from "lodash/mergeWith";

/*
  A customizer to treat arrays as primitives, so they are not merged.
*/
function mergeWithArraysAsPrimitivesCustomizer(_objValue: unknown, srcValue: unknown) {
  if (srcValue instanceof Array) {
    return srcValue;
  } else {
    return undefined;
  }
}

/*
  Merge two objects treating arrays as primitives.
*/
export const mergeObjectsOnly = <TObject, TSource>(object: TObject, source: TSource): TObject & TSource => {
  return mergeWith(object, source, mergeWithArraysAsPrimitivesCustomizer);
};
