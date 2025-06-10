export interface InstructionStep {
  order: number;
  title: string;
  description: string;
  requiredFiles?: string[];
  codeExamples: {
    fileName: string;
    code: string;
    explanation: string;
    dependencies?: string[];
  }[];
  warnings?: string[];
  notes?: string[];
}

export interface AIInstruction {
  moduleType: "entity";
  name: string;
  dependencies: string[];
  tags: string[];
  version: string;
  steps: InstructionStep[];
  createdAt?: Date;
}
