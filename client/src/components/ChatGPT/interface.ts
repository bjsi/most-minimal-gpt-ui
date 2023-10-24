import { OpenAIChatMessage } from "modelfusion";
import type { ReactNode } from "react";

export interface ShowProps {
  loading?: boolean;
  fallback?: ReactNode;
  children?: ReactNode;
}
