/**
 * Interface for rule evaluation results
 * This is shared across all rule implementations to ensure consistent result structure
 */
export interface RuleEvalResult {
  isSuspicious: boolean;
  reason?: string;
  ruleId?: string;
}
