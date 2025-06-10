type LogLevel = "info" | "warn" | "error" | "debug";

interface LogOptions {
  component?: string;
  action?: string;
  data?: any;
  error?: Error;
}

const isDebugEnabled = process.env.NODE_ENV === "development";
const cursor = "👉";

export const debug = {
  log: (message: string, options: LogOptions = {}) => {
    if (!isDebugEnabled) return;

    const { component, action, data, error } = options;
    const timestamp = new Date().toISOString();
    const prefix = [
      cursor,
      timestamp,
      component && `[${component}]`,
      action && `{${action}}`
    ]
      .filter(Boolean)
      .join(" ");

    console.group(prefix);
    console.log(message);
    if (data) {
      console.log("Data:", data);
    }
    if (error) {
      console.error("Error:", error);
    }
    console.groupEnd();
  },

  api: (method: string, path: string, data?: any) => {
    debug.log(`API ${method} ${path}`, {
      component: "API",
      action: method,
      data
    });
  },

  render: (component: string, props?: any) => {
    debug.log(`Rendering ${component}`, {
      component,
      action: "render",
      data: props
    });
  },

  error: (error: Error, component?: string) => {
    debug.log(error.message, {
      component: component || "App",
      action: "error",
      error
    });
  },

  state: (component: string, state: any) => {
    debug.log("State updated", {
      component,
      action: "state",
      data: state
    });
  }
};
