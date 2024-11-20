const extensivePostBody = {
  contentSelector: {
    context: "Extended",
    contextTiming: ["Now", "TimeOfCall"],
    exposedFields: {
      collaboration: {
        publicComments: true,
      },
      content: {
        pointsOfInterest: true,
        structure: true,
        topics: true,
        trackers: true,
      },
      interaction: {
        personInteractionStats: true,
        questions: true,
        speakers: true,
        video: true,
      },
      media: true,
      parties: true,
    },
  },
  filter: {},
};

export { extensivePostBody };
