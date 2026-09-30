import { Component, type ReactNode } from "react";

interface SceneBoundaryProps {
  fallback: ReactNode;
  onError?: (e: unknown) => void;
  children: ReactNode;
}

interface SceneBoundaryState {
  failed: boolean;
}

export class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false };
  private warned = false;

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (!this.warned) {
      this.warned = true;
      console.warn("[scene]", error);
    }
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
