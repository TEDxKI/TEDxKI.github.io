export const STATIC_IMAGES_BY_CODE_QUERY = `
  query StaticImagesByCode($codes: [String!], $limit: Int!) {
    imageStaticCollection(where: { code_in: $codes }, limit: $limit) {
      items {
        code
        altDiscription
        file {
          url
          description
        }
      }
    }
  }
`;
