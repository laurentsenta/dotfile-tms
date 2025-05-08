/**
 * Interface for rule evaluation results
 * This is shared across all rule implementations to ensure consistent result structure
 */
export interface RuleEvalResult {
  /**
   * Indicates whether the transaction is suspicious according to the rule
   */
  isSuspicious: boolean;
  
  /**
   * Optional reason explaining why the transaction was flagged as suspicious
   * Only provided when isSuspicious is true
   */
  reason?: string;
  
  /**
   * Optional name of the rule that triggered the alert
   * This can be used to identify which rule flagged the transaction
   */
  ruleName?: string;
}
