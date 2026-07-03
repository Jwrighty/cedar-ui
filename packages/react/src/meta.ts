/**
 * Per-component usage metadata (ADR-0009). A typed object co-located with each
 * component (`*.meta.ts`) is Cedar's single source of truth for usage guidance:
 * it feeds both the human docs and the machine-readable agent artifacts
 * (llms.txt, manifest, MCP server) so they cannot drift apart.
 */
export interface ComponentMeta {
  /** One-line purpose. */
  summary: string;
  /** Situations where this component is the right choice. */
  useWhen: string[];
  /**
   * Situations to reach for something else — and what. The highest-value,
   * lowest-supply field: "when *not* to use this".
   */
  avoidWhen: { situation: string; useInstead: string }[];
  /** Accessibility behaviours a consumer can rely on / must preserve. */
  a11yNotes: string[];
  /** Sibling components worth knowing about. */
  relatedComponents: string[];
  status: "experimental" | "stable" | "deprecated";
}

/**
 * Per-composition usage metadata. Templates describe common multi-component
 * layouts agents should copy structurally before filling in project-specific
 * content.
 */
export interface TemplateMeta {
  /** Kebab-case identifier, e.g. "form-dialog". */
  id: string;
  /** One-line purpose. */
  summary: string;
  /** Situations where this composition is the right choice. */
  useWhen: string[];
  /** Cedar components this template composes. */
  components: string[];
  /** Structural outline an agent studies before props. */
  skeleton: string;
  status: "experimental" | "stable" | "deprecated";
}
