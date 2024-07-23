export const getSellosCodes = (product: any, facetValues: any) => {
  return facetValues
    .filter(
      (item: any) =>
        product.facetValueIds.includes(item.facetValue.id) &&
        /sello[-_]producto/gi.test(item.facetValue.facet?.code),
    )
    .map((sello: any) => sello?.facetValue?.code.match(/[A-Za-z][A-Za-z_0-9]*/)?.[0]);
};
