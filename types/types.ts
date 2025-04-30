export type ServerError = {
  log: string;
  status: number;
  message: { err: string };
};

export type TextMetadata = {
  id: string;
  title: string;
  fullStory: string;
  theme: string;
  traits: string[];
  summary: string;
};