import React, { useEffect } from "react";
import { saveToAILearnDB } from "./aiLearnDb";

interface AILearnConfig {
  component: string;
  description: string;
  props?: Record<string, any>;
  styling?: Record<string, any>;
  usage?: string;
  codeExample?: string;
}

export const withAILearn = (
  WrappedComponent: React.ComponentType<any>,
  config: AILearnConfig
) => {
  return function WithAILearnComponent(props: any) {
    useEffect(() => {
      saveToAILearnDB(config).catch(console.error);
    }, []);

    return <WrappedComponent {...props} />;
  };
};
