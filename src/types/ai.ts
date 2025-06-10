import {
  Amenity,
  Location,
  Project,
  ProjectAmenity,
  ProjectMedia,
  ProjectTranslation
} from "@prisma/client";

export type ProjectWithRelations = Project & {
  translations: ProjectTranslation[];
  location: Location | null;
  amenities: (ProjectAmenity & {
    amenity: Amenity;
  })[];
  media: ProjectMedia[];
};

export interface ProjectRecommendation {
  project: ProjectWithRelations;
  highlights: string[];
  aiComment: string;
  score: number;
  avatarText?: string;
  matchingFeatures: {
    category: string;
    features: string[];
    analysis?: string;
  }[];
  comparativeAnalysis?: string;
  bestSuitedFor?: string;
}

export interface AIAssistantResponse {
  introduction: string;
  searchSummary?: string;
  recommendations: ProjectRecommendation[];
  summary?: string;
  conclusion?: string;
  sessionId: string;
  locale?: string;
  searchCriteria: {
    category: string;
    importance: number;
    criteria: string;
  }[];
  avatar?: AIAssistantAvatar;
}

export interface HeyGenSession {
  session_id: string;
  access_token: string;
  url: string;
  status?: string;
  created_at?: number;
  api_key_type?: string;
}

export interface HeyGenVoiceSettings {
  voice_id: string;
  rate?: number;
  emotion?: "Excited" | "Friendly" | "Serious" | "Soothing" | "Broadcaster";
}

export interface HeyGenStreamingConfig {
  quality?: string;
  avatar_id?: string;
  voice?: {
    voice_id: string;
    rate: number;
  };
  video_encoding?: string;
  version?: string;
}

export interface AIAssistantAvatar {
  sessionId?: string;
  videoUrl?: string;
  audioUrl?: string;
  status: "idle" | "generating" | "ready" | "error";
  error?: string;
}

// WebSocket types
export interface HeyGenWebSocketMessage {
  type: "chat" | "error" | "complete" | "progress" | "audio" | "video";
  data?: {
    text?: string;
    progress?: number;
    video_url?: string;
    audio_url?: string;
    chunk?: string; // Base64 encoded audio chunk
    timestamp?: number;
    is_final?: boolean;
  };
  message?: string;
}

export interface HeyGenSessionResponse {
  code: number;
  data: {
    session_id: string;
    access_token: string;
    realtime_endpoint: string;
    session_duration_limit: number;
    url: string;
  };
  message: string;
}

export interface StreamingAvatarConfig {
  avatar_id: string;
  voice_id: string;
  input_text: string;
  background?: {
    type: "color" | "image" | "video";
    value?: string;
    url?: string;
  };
  dimension?: {
    width: number;
    height: number;
  };
}

export interface StreamingAvatarSession {
  id: string;
  status: "created" | "started" | "generating" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
}

export interface StreamingAvatarResponse {
  session_id: string;
  status: StreamingAvatarSession["status"];
  video_url?: string;
  error?: string;
}

export interface StreamingAvatarCallbacks {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export interface StreamingAvatarSDK {
  listAvatars(): Promise<any[]>;
  generate(
    text: string,
    callbacks?: StreamingAvatarCallbacks
  ): Promise<StreamingAvatarSession>;
}

// WebRTC and Streaming types
export interface StreamingSession {
  session_id: string;
  access_token: string | null;
  url: string | null;
  is_paid: boolean;
  session_duration_limit: number;
  realtime_endpoint: string;
}

export interface StreamingSessionResponse {
  code: number;
  data: StreamingSession;
  message: string;
}

export interface StreamingState {
  session: StreamingSession | null;
  status: "idle" | "connecting" | "connected" | "error";
  error: string | null;
  webSocket: WebSocket | null;
  room: any | null; // LiveKit Room
  mediaStream: MediaStream | null;
}

export interface StreamingMessage {
  type: "start_session" | "speak" | "stop_session";
  session_id: string;
  text?: string;
}

export interface StreamingResponse {
  event: "speak_started" | "speak_ended";
  session_id: string;
}
