"use client";

import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { IconAlertTriangle } from "@tabler/icons-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-4">
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <IconAlertTriangle className="w-12 h-12 text-danger" />
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-default-500 text-center">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button 
              color="primary"
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          </CardBody>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
