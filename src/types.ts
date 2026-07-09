export interface Artwork {
  id: string;
  title: string;
  artist_name: string;
  artist_bio?: string;
  year_created: number;
  origin_country: string;
  origin_city?: string;          // e.g., "Lahore" or "Karachi"
  price?: number;                // e.g., 45000 (in USD)
  medium: 'Painting' | 'Clay & Ceramic';
  dimensions: string;
  rating: number; // strictly 1 to 5
  image_url: string;
  audio_description_url: string; // English audioguide audio (or dynamic synthesis fallback)
  audio_urdu_url: string;        // Urdu audioguide audio (or dynamic synthesis fallback)
  text_description: string;      // English narration text
  text_description_urdu?: string; // Urdu translation narration text
  is_published: boolean;
  created_at?: string | Date;
}

export type PlaybackLanguage = 'en' | 'ur';

export interface ActiveAudioState {
  artworkId: string;
  language: PlaybackLanguage;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}
