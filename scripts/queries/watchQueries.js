export const EMBEDDED_VIDEOS_QUERY = `
  query EmbeddedVideos($limit: Int!) {
    newEmbeddedVideoCollection(order: eventYear_DESC, limit: $limit) {
      items {
        sys { id }
        videoTitle
        eventYear
        safeEmbeddingCode {
          json
        }
      }
    }
  }
`;
