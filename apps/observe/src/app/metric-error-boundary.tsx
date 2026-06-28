"use client";

import { Component, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Button, Text } from "@jwrighty/cedar-react";

interface MetricErrorBoundaryProps {
  children: ReactNode;
  label: string;
}

interface MetricErrorBoundaryState {
  hasError: boolean;
}

export class MetricErrorBoundary extends Component<
  MetricErrorBoundaryProps,
  MetricErrorBoundaryState
> {
  state: MetricErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <MetricErrorFallback label={this.props.label} />;
    }

    return this.props.children;
  }
}

function MetricErrorFallback({ label }: { label: string }) {
  const router = useRouter();

  return (
    <div
      className="metric-card metric-card--error"
      role="group"
      aria-label={label}
    >
      <Text as="p" size="sm" tone="muted">
        {label}
      </Text>
      <Text as="p" weight="semibold" tone="danger">
        Unable to load
      </Text>
      <Button
        size="sm"
        variant="secondary"
        onPress={() => {
          router.replace("/");
          router.refresh();
        }}
      >
        Retry
      </Button>
    </div>
  );
}
