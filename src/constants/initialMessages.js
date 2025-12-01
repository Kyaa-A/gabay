export const INITIAL_MESSAGES = [
  {
    id: 1,
    text: `Hi! How can I help you today?`,
    sender: "bot",
    timestamp: new Date(),
  },
];

export const MESSAGE_CONFIG = {
  LONG_MESSAGE_THRESHOLD: 300,
  PREVIEW_LENGTH: 220,
};

export const UI_CONFIG = {
  SCROLL_THRESHOLD: 100,
  COPY_SUCCESS_DURATION: 2000,
  HEADER_HEIGHT: "80px",
  INPUT_HEIGHT: "120px",
};
