interface AIInstruction {
  moduleType: "entity" | "feature";
  name: string;
  steps?: InstructionStep[];
  dependencies: string[];
  createdAt: number;
  version: string;
  tags: string[];
  author?: string;
}

interface InstructionStep {
  order: number;
  title: string;
  description: string;
  codeExamples?: CodeExample[];
  notes?: string[];
  warnings?: string[];
  requiredFiles?: string[];
}

interface CodeExample {
  fileName: string;
  code: string;
  explanation: string;
  dependencies?: string[];
  imports?: string[];
}

export const saveInstruction = async (
  instruction: Omit<AIInstruction, "createdAt">
) => {
  try {
    const response = await fetch("/api/ai-instructions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...instruction,
        version: "1.0.0",
        createdAt: Date.now()
      })
    });
    if (!response.ok) throw new Error("Failed to save instruction");
  } catch (error) {
    console.error("Error saving instruction:", error);
  }
};
