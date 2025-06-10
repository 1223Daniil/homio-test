import { HeyGenSession, HeyGenStreamingConfig } from "@/types/ai";

export interface Avatar {
  avatar_id: string;
  name: string;
  preview_url?: string;
}

export interface Voice {
  voice_id: string;
  name: string;
  language: string;
  gender: string;
  preview_audio?: string;
  support_interactive_avatar: boolean;
  support_pause: boolean;
  emotion_support: boolean;
  support_locale: boolean;
}

export interface StreamingSession {
  session_id: string;
  access_token: string | null;
  url: string | null;
  sdp: RTCSessionDescriptionInit;
  ice_servers2: RTCIceServer[];
  is_paid: boolean;
  session_duration_limit: number;
  realtime_endpoint: string;
}

export interface StreamingMessage {
  action: "start_session" | "speak" | "stop_session";
  session_id: string;
  avatar_id?: string;
  video_quality?: string;
  text?: string;
  voice_id?: string;
  language?: string;
}

export interface StreamingResponse {
  event: "speak_started" | "speak_ended";
  session_id: string;
}

export interface StreamingTask {
  type: "repeat";
  text: string;
}

export class HeyGenService {
  private static instance: HeyGenService | null = null;
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.heygen.com/v1";

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public static getInstance(): HeyGenService {
    if (!this.instance) {
      console.log("Environment variables:", {
        HEYGEN_API_KEY: process.env.HEYGEN_API_KEY,
        NEXT_PUBLIC_HEYGEN_API_KEY: process.env.NEXT_PUBLIC_HEYGEN_API_KEY,
        NODE_ENV: process.env.NODE_ENV
      });
      const apiKey =
        process.env.NEXT_PUBLIC_HEYGEN_API_KEY || process.env.HEYGEN_API_KEY;
      if (!apiKey) {
        throw new Error("HEYGEN_API_KEY is not set");
      }
      console.log("Using HeyGen API key:", apiKey);
      this.instance = new HeyGenService(apiKey);
    }
    return this.instance;
  }

  private async makeRequest(path: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      "X-Api-Key": this.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    console.log("Making request to:", url);
    console.log("Request options:", {
      method: options.method,
      headers: {
        ...headers,
        "X-Api-Key": "***" // Hide API key in logs
      },
      body: options.body ? JSON.parse(options.body as string) : undefined
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: text
      });
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}. ${text}`
      );
    }

    const data = await response.json();
    console.log("Response data:", data);

    return data;
  }

  async listAvatars() {
    return this.makeRequest("/avatar.list");
  }

  async listVoices() {
    return this.makeRequest("/voice.list");
  }

  async createStreamingSession(params: {
    quality?: string;
    video_encoding?: string;
    disable_idle_timeout?: boolean;
    avatar_id?: string;
    voice?: {
      voice_id: string;
      rate: number;
      language?: string;
      gender?: string;
    };
  }) {
    return this.makeRequest("/streaming.new", {
      method: "POST",
      body: JSON.stringify({
        version: "v2",
        quality: params.quality || "medium",
        avatar_id: "Dexter_Lawyer_Sitting_public",
        voice: {
          voice_id: "7a544b76e07648849ed54617f18ea280",
          language: "English",
          gender: "male",
          rate: 1
        },
        video_encoding: params.video_encoding || "VP8",
        disable_idle_timeout: params.disable_idle_timeout ?? false
      })
    });
  }

  async startStreamingSession(sessionId: string) {
    return this.makeRequest("/streaming.start", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId
      })
    });
  }

  async sendStreamingTask(
    sessionId: string,
    text: string,
    taskType: "repeat" | "once" = "repeat"
  ) {
    console.log(`=== HeyGen API: ОТПРАВКА ЗАДАЧИ ОЗВУЧИВАНИЯ ===`);
    console.log(`Запрошенный режим: ${taskType}`);
    console.log(`ID сессии: ${sessionId}`);
    console.log(`Длина текста: ${text.length}`);
    console.log(`Начало текста: ${text.substring(0, 100)}...`);

    // API HeyGen принимает только значение "repeat"
    console.log(
      `Фактический отправляемый режим: "repeat" (API не поддерживает "once")`
    );

    const response = await this.makeRequest("/streaming.task", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        text,
        task_type: "repeat" // Всегда используем "repeat" для API
      })
    });

    console.log(`=== HeyGen API: ОТВЕТ НА ЗАПРОС ОЗВУЧИВАНИЯ ===`);
    console.log(JSON.stringify(response, null, 2));

    return response;
  }

  async stopStreamingSession(sessionId: string) {
    return this.makeRequest("/streaming.stop", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId })
    });
  }

  async listActiveSessions() {
    return this.makeRequest("/streaming.list");
  }

  public onMessage(callback: (response: StreamingResponse) => void) {
    // Implementation for onMessage method
  }

  public getWebSocketUrl(params: {
    session_id: string;
    session_token: string;
    opening_text?: string;
    stt_language?: string;
  }): string {
    // Implementation for getWebSocketUrl method
    return "";
  }

  public async listSessions(): Promise<HeyGenSession[]> {
    try {
      const response = await this.makeRequest("/streaming.list");
      return response.data?.sessions || [];
    } catch (error) {
      console.error("Error listing sessions:", error);
      throw error;
    }
  }

  public async stopSession(sessionId: string): Promise<void> {
    try {
      await this.makeRequest("/streaming.stop", {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId
        })
      });
    } catch (error) {
      console.error("Error stopping session:", error);
      throw error;
    }
  }

  public async stopAllSessions(): Promise<void> {
    try {
      const sessions = await this.listSessions();
      await Promise.all(
        sessions.map(session => this.stopSession(session.session_id))
      );
    } catch (error) {
      console.error("Error stopping all sessions:", error);
      throw error;
    }
  }
}

interface ListAvatarsResponse {
  data: {
    avatar_id: string;
    name: string;
    preview_url?: string;
  }[];
}

interface ListVoicesResponse {
  data: {
    voice_id: string;
    name: string;
    preview_url?: string;
  }[];
}

interface CreateStreamingSessionParams {
  avatarId: string;
  voiceId: string;
  backgroundImageUrl?: string;
  config?: {
    quality?: string;
    version?: string;
  };
  language?: string;
  gender?: string;
}

interface CreateStreamingSessionResponse {
  data: {
    session_id: string;
    access_token: string;
    url: string;
    realtime_endpoint: string;
  };
}

interface StartStreamingSessionResponse {
  data: {
    status: string;
  };
}

interface ListActiveSessionsResponse {
  data: {
    sessions: any[];
  };
}
