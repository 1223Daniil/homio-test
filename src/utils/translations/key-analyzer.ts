import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface KeyAnalysis {
  key: string;
  file: string;
  line: number;
  issues: string[];
  suggestion?: string;
}

export class TranslationKeyAnalyzer {
  private analyses: KeyAnalysis[] = [];
  private namespaces = new Set<string>();
  private standardizedPrefixes = new Map<string, string>([
    ['form', 'forms'],
    ['button', 'buttons'],
    ['message', 'messages'],
    ['error', 'errors'],
    ['label', 'labels'],
    ['title', 'titles'],
    ['description', 'descriptions'],
    ['placeholder', 'placeholders']
  ]);

  constructor(private readonly rootDir: string) {}

  async analyze(): Promise<void> {
    const files = await glob('**/*.{ts,tsx}', {
      cwd: this.rootDir,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    for (const file of files) {
      await this.analyzeFile(file);
    }
  }

  private async analyzeFile(file: string): Promise<void> {
    const content = await fs.promises.readFile(path.join(this.rootDir, file), 'utf-8');
    const lines = content.split('\n');

    const translationKeyPattern = /t\(['"]([^'"]+)['"]\)/g;
    
    lines.forEach((line, index) => {
      let match;
      while ((match = translationKeyPattern.exec(line)) !== null) {
        const key = match[1];
        this.analyzeKey(key, file, index + 1);
      }
    });
  }

  private analyzeKey(key: string, file: string, line: number): void {
    const parts = key.split('.');
    const analysis: KeyAnalysis = {
      key,
      file,
      line,
      issues: []
    };

    // Check namespace
    const namespace = parts[0];
    this.namespaces.add(namespace);

    // Check namespace capitalization
    if (namespace !== namespace.charAt(0).toUpperCase() + namespace.slice(1)) {
      analysis.issues.push('Namespace should be PascalCase');
    }

    // Check common prefixes
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const standardized = this.standardizedPrefixes.get(part);
      if (standardized && standardized !== part) {
        analysis.issues.push(`Use "${standardized}" instead of "${part}" for consistency`);
      }
    }

    // Check nesting depth
    if (parts.length > 4) {
      analysis.issues.push('Nesting depth should not exceed 4 levels');
    }

    // Check camelCase for non-namespace parts
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (!/^[a-z][a-zA-Z0-9]*$/.test(part)) {
        analysis.issues.push(`"${part}" should be camelCase`);
      }
    }

    // Generate suggestion if there are issues
    if (analysis.issues.length > 0) {
      analysis.suggestion = this.suggestKey(parts);
    }

    this.analyses.push(analysis);
  }

  private suggestKey(parts: string[]): string {
    const newParts = parts.map((part, index) => {
      if (index === 0) {
        // Namespace in PascalCase
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      }
      
      // Check if part needs standardization
      const standardized = this.standardizedPrefixes.get(part);
      if (standardized) {
        return standardized;
      }
      
      // Convert to camelCase
      return part.toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, '');
    });

    return newParts.join('.');
  }

  generateReport(): string {
    let report = '# Translation Key Analysis Report\n\n';

    // Namespace summary
    report += '## Namespaces\n\n';
    const namespacesList = Array.from(this.namespaces).sort();
    namespacesList.forEach(ns => {
      report += `- ${ns}\n`;
    });

    // Issues by file
    const byFile = this.analyses.reduce((acc, analysis) => {
      if (analysis.issues.length === 0) return acc;
      
      if (!acc[analysis.file]) {
        acc[analysis.file] = [];
      }
      acc[analysis.file].push(analysis);
      return acc;
    }, {} as Record<string, KeyAnalysis[]>);

    report += '\n## Issues by File\n\n';
    for (const [file, analyses] of Object.entries(byFile)) {
      report += `### ${file}\n\n`;
      analyses.forEach(analysis => {
        report += `#### Line ${analysis.line}: \`${analysis.key}\`\n\n`;
        analysis.issues.forEach(issue => {
          report += `- ${issue}\n`;
        });
        if (analysis.suggestion) {
          report += `\nSuggested key: \`${analysis.suggestion}\`\n`;
        }
        report += '\n';
      });
    }

    return report;
  }

  getAnalyses(): KeyAnalysis[] {
    return this.analyses;
  }
} 