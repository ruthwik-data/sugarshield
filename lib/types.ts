import { ConfidenceLabel, IngredientSource } from './confidence';

export type Verdict = 'PASS' | 'WARN' | 'FAIL';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type DataSource = 'OFF' | 'VISION' | 'LINK' | 'LINK_MANUAL';

export interface ExplanationTrigger {
  term: string;
  category: string;
  reason: string;
}

export interface AnalysisResponse {
  status: "OK" | "NEED_INGREDIENTS" | "ERROR";
  ingredients_source: IngredientSource;
  confidence: number;
  confidence_label: ConfidenceLabel;
  triggers: ExplanationTrigger[];
  summary: string;
  user_message?: string;

  // Legacy / Compatibility fields for existing UI components until refactored
  // We can populate these from the new data
  classification: Verdict;
  verdict: Verdict;
  matchedTerms: any[]; // Allow loose typing for now or map correctly
  reasons: string[]; // Required for ClassificationResult compatibility
  notes?: string;
  extracted?: any;
}

export interface MatchedTerm {
  term: string;
  type:
  | 'added_sugar'
  | 'artificial_sweetener'
  | 'hidden_sugar'
  | 'sugar_alcohol'
  | 'natural_non_sugar'
  // Legacy / Other potentially used types
  | 'SWEETENER'
  | 'SUGAR_ALCOHOL'
  | 'ADDED_SUGAR';
}
export interface SugarData {
  perServing: number | null;
  per100g: number | null;
  servingSize: string | null;
}

export interface DataQuality {
  hasIngredients: boolean;
  hasSugarNumbers: boolean;
  source: DataSource;
}

export interface ClassificationResult {
  // Support both naming conventions seen in codebase
  classification?: Verdict;
  verdict?: Verdict;

  // Unify confidence to number (0-1) as used in ResultCard and Classifier
  confidence: number;

  reasons: string[];
  matchedTerms: MatchedTerm[];

  // Optional fields from original types
  sugar?: SugarData;
  dataQuality?: DataQuality;
  summary?: string;
  confidenceWhy?: string;
  notes?: string;
  triggers?: ExplanationTrigger[];
  ingredients_source?: string | IngredientSource;
}

export interface ProductData {
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  ingredientsText: string | null;
  sugarPerServing: number | null;
  sugarPer100g: number | null;
  servingSize: string | null;
  categories: string[] | null;
  source: DataSource;
  extraction?: {
    confidence: Confidence;
    drivers: string[];
  };
}

export interface VisionParseResult {
  ok: boolean;
  data?: {
    ingredientsText: string | null;
    sugarPerServing: number | null;
    sugarPer100g: number | null;
    servingSize: string | null;
    notes: string[];
    source: 'VISION';
  };
  error?: string;
  howTo?: string;
}

export interface AnalyticsEvent {
  timestamp: string;
  mode: 'scan' | 'upload' | 'link' | 'link_manual';
  verdict: Verdict;
}

export interface AnalyticsData {
  scans_count: number;
  uploads_count: number;
  link_pastes_count: number;
  verdicts: {
    pass: number;
    warn: number;
    fail: number;
  };
  recent: AnalyticsEvent[];
}

export interface TestCase {
  id: string;
  name: string;
  ingredientsText: string | null;
  sugarPerServing: number | null;
  sugarPer100g: number | null;
  servingSize: string | null;
  expectedVerdict: Verdict;
  notes: string;
}

export interface EvaluationResult {
  testCase: TestCase;
  result: ClassificationResult;
  correct: boolean;
}
