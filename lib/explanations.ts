export interface TermExplanation {
    category: "Added sugar" | "Natural sugar" | "Artificial sweetener";
    reason: string;
}

const EXPLANATIONS: Record<string, TermExplanation> = {
    "sugar": { category: "Added sugar", reason: "Standard refined sugar (sucrose)." },
    "cane sugar": { category: "Added sugar", reason: "Refined sugar from sugar cane." },
    "brown sugar": { category: "Added sugar", reason: "Refined sugar with molasses." },
    "corn syrup": { category: "Added sugar", reason: "Liquid sweetener made from corn starch." },
    "high fructose corn syrup": { category: "Added sugar", reason: "Highly processed corn syrup with high fructose content." },
    "hfcs": { category: "Added sugar", reason: "Abbreviation for High Fructose Corn Syrup." },
    "honey": { category: "Natural sugar", reason: "Natural sweetener, but still counts as added sugar in many contexts." },
    "agave": { category: "Natural sugar", reason: "Syrup from agave plant, very high in fructose." },
    "maple syrup": { category: "Natural sugar", reason: "Natural syrup from maple trees, high in sugar." },
    "maltodextrin": { category: "Added sugar", reason: "Processed carbohydrate often used as filler or sweetener." },
    "dextrose": { category: "Added sugar", reason: "Simple sugar identical to blood sugar (glucose)." },
    "fructose": { category: "Added sugar", reason: "Fruit sugar, often added in crystalline form." },
    "glucose": { category: "Added sugar", reason: "Simple sugar, main source of energy." },
    "molasses": { category: "Added sugar", reason: "Byproduct of refining sugar cane or beets." },
    "caramel": { category: "Added sugar", reason: "Heated sugar, often used for color or flavor." },
    "fruit juice concentrate": { category: "Added sugar", reason: "Highly processed fruit juice with fiber removed." },
    // Default fallbacks handled in function
};

export function getExplanation(term: string): TermExplanation {
    const lower = term.toLowerCase();

    if (EXPLANATIONS[lower]) {
        return EXPLANATIONS[lower];
    }

    // Fallback heuristics
    if (lower.includes("syrup")) {
        return { category: "Added sugar", reason: "Liquid sweetener source." };
    }
    if (lower.includes("juice")) {
        return { category: "Added sugar", reason: "Concentrated fruit sugars." };
    }
    if (lower.includes("malt")) {
        return { category: "Added sugar", reason: "Malt-based sweetener." };
    }

    return {
        category: "Added sugar",
        reason: "Detected as a sugar or sweetener variant."
    };
}
