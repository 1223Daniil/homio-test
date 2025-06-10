interface AILearnEntry {
  component: string;
  description: string;
  props?: Record<string, any>;
  styling?: Record<string, any>;
  usage?: string;
  codeExample?: string;
  timestamp?: number;
  lastUpdated?: number;
}

export const saveToAILearnDB = async (componentInfo: AILearnEntry) => {
  try {
    const response = await fetch("/api/ailearn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(componentInfo)
    });

    if (!response.ok) {
      throw new Error("Failed to save component info");
    }
  } catch (error) {
    console.error("Error saving to ailearn.db:", error);
  }
};
