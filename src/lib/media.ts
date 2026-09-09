export type YouTubeSession = {
  title: string;
  description: string;
  category: string;
  duration: string;
  videoId?: string;
};

export const youtubeChannelUrl = "https://www.youtube.com/";

export const youtubeSessions: YouTubeSession[] = [
  {
    title: "Finding clarity when everything feels noisy",
    description: "A guided reflection on noticing what matters before choosing your next step.",
    category: "Clarity",
    duration: "Session"
  },
  {
    title: "Small actions that build meaningful change",
    description: "A practical conversation about turning insight into an action you can sustain.",
    category: "Personal growth",
    duration: "Session"
  },
  {
    title: "Questions for a more intentional life",
    description: "Use these prompts to slow down, understand your choices, and move with purpose.",
    category: "Reflection",
    duration: "Session"
  }
];
