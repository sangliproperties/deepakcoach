import type { YouTubeSession } from "@/lib/types";

export const youtubeChannelUrl = "https://youtube.com/@deepakkhot778?si=DndjPr2yoUhqIvSf";

export type YouTubeVideo = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
};

type YouTubeChannelResponse = {
  items?: Array<{
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type YouTubePlaylistResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      resourceId?: {
        videoId?: string;
      };
      thumbnails?: {
        maxres?: { url?: string };
        standard?: { url?: string };
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
  }>;
};

export async function getLatestYoutubeVideos(
  limit = 12
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is missing.");
    return [];
  }

  try {
    /*
     * First get Deepak Khot's channel.
     * The API supports looking up a channel by its handle.
     */
    const channelParams = new URLSearchParams({
      part: "contentDetails",
      forHandle: "@deepakkhot778",
      key: apiKey,
    });

    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?${channelParams}`,
      {
        next: {
          revalidate: 300,
        },
      }
    );

    if (!channelResponse.ok) {
      console.error(
        "YouTube channel request failed:",
        channelResponse.status
      );

      return [];
    }

    const channelData =
      (await channelResponse.json()) as YouTubeChannelResponse;

    const uploadsPlaylistId =
      channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      console.error("YouTube uploads playlist was not found.");
      return [];
    }

    /*
     * Now retrieve the latest 12 videos from the channel's
     * uploads playlist.
     */
    const playlistParams = new URLSearchParams({
      part: "snippet",
      playlistId: uploadsPlaylistId,
      maxResults: String(limit),
      key: apiKey,
    });

    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?${playlistParams}`,
      {
        next: {
          revalidate: 300,
        },
      }
    );

    if (!playlistResponse.ok) {
      console.error(
        "YouTube playlist request failed:",
        playlistResponse.status
      );

      return [];
    }

    const playlistData =
      (await playlistResponse.json()) as YouTubePlaylistResponse;

    return (playlistData.items ?? [])
      .map((item) => {
        const snippet = item.snippet;
        const videoId = snippet?.resourceId?.videoId;

        if (!snippet || !videoId) {
          return null;
        }

        const thumbnail =
          snippet.thumbnails?.maxres?.url ??
          snippet.thumbnails?.standard?.url ??
          snippet.thumbnails?.high?.url ??
          snippet.thumbnails?.medium?.url ??
          snippet.thumbnails?.default?.url ??
          "";

        return {
          videoId,
          title: snippet.title ?? "YouTube video",
          description: snippet.description ?? "",
          publishedAt: snippet.publishedAt ?? "",
          thumbnail,
        };
      })
      .filter((video): video is YouTubeVideo => video !== null);
  } catch (error) {
    console.error("Could not load YouTube videos:", error);

    return [];
  }
}

export const youtubeSessions: YouTubeSession[] = [
  {
    id: "youtube-session-1",
    title: "Finding clarity when everything feels noisy",
    description: "A guided reflection on noticing what matters before choosing your next step.",
    category: "Clarity",
    duration: "Session"
  },
  {
    id: "youtube-session-2",
    title: "Small actions that build meaningful change",
    description: "A practical conversation about turning insight into an action you can sustain.",
    category: "Personal growth",
    duration: "Session"
  },
  {
    id: "youtube-session-3",
    title: "Questions for a more intentional life",
    description: "Use these prompts to slow down, understand your choices, and move with purpose.",
    category: "Reflection",
    duration: "Session"
  }
];
