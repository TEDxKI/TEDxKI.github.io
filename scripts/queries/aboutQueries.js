export const ABOUT_IMAGES_QUERY = `
  query AboutImages($codes: [String!], $limit: Int!) {
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
