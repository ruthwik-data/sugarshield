
import { detectSugar } from './detectSugar';
import { extractIngredientsFromUrl, parseIngredientsFromHtml } from './extractIngredientsFromUrl';

async function runTests() {
    console.log('🧪 Running SugarShield Tests...\n');
    let passed = 0;
    let failed = 0;

    function assert(condition: boolean, message: string) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    }

    // TEST 1: Basic Sugar Detection
    console.log('\nPlease wait, running detection tests...');
    const t1 = detectSugar('Ingredients: Sugar, Water, Cocoa Butter');
    assert(t1.detected_terms.includes('sugar'), 'Should detect "sugar"');
    assert(t1.detected_terms.length === 1, 'Should only detect 1 term');

    // TEST 2: Multi-word terms
    const t2 = detectSugar('Contains high fructose corn syrup and water.');
    assert(t2.detected_terms.includes('high fructose corn syrup'), 'Should detect "high fructose corn syrup"');

    // TEST 3: Multiple detections
    const t3 = detectSugar('Ingredients: corn syrup, dextrose, maltodextrin.');
    assert(t3.detected_terms.includes('corn syrup'), 'Should detect corn syrup');
    assert(t3.detected_terms.includes('dextrose'), 'Should detect dextrose');
    assert(t3.detected_terms.includes('maltodextrin'), 'Should detect maltodextrin');

    // TEST 4: Case insensitivity
    const t4 = detectSugar('SUGAR');
    assert(t4.detected_terms.includes('sugar'), 'Should detect SUGAR (uppercase)');

    // TEST 5: Word Boundary
    const t5 = detectSugar('Sugarfree gum');
    // Actually "sugar" is in list. \bSugar\b should NOT match "Sugarfree"
    assert(t5.detected_terms.length === 0, 'Should NOT detect "sugar" in "Sugarfree"');


    console.log('\n----------------------------------------');
    console.log('Testing URL Extraction Logic (Server-side helper)...');

    // TEST 6: Extraction Failure (Short text)
    const shortHtml = '<html><body><p>Ingredients: Milk.</p></body></html>';
    const res1 = parseIngredientsFromHtml(shortHtml); // SYNC call now
    // Expect confidence low because length < 80
    assert(res1.confidence < 0.5, 'Should return LOW confidence for short parsed text');
    console.log('✅ PASS: correctly flags short ingredient list as low confidence');

    // TEST 7: Extraction Success (Mock)
    const longHtml = '<html><body><div>Ingredients: Sugar, Water, Corn Syrup, Dextrose, Carbonated Water, Natural Flavors, Caramel Color, Phosphoric Acid. This is a longer list ensuring it passes the length check.</div></body></html>';
    const res2 = parseIngredientsFromHtml(longHtml); // SYNC call now
    assert(res2.confidence >= 0.9, 'Should return HIGH confidence for valid list');
    if (res2.text) {
        assert(res2.text.includes('Sugar, Water'), 'Should extract text');
    } else {
        assert(false, 'Should have extracted text');
    }
    console.log('✅ PASS: correctly extracts valid ingredient list');

    console.log('\n----------------------------------------');
    console.log(`Results: ${passed} Passed, ${failed} Failed`);

    if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
