import { NextRequest, NextResponse } from 'next/server';
import { ProductData, Confidence } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  // Import dynamically if needed or just use the new helper
  const { extractIngredientsFromUrl } = await import('@/lib/extractIngredientsFromUrl');

  try {
    // 1. Attempt extraction
    const extractionResult = await extractIngredientsFromUrl(url);

    // 2. Define confidence & status
    let confidence: Confidence = 'LOW';
    let status = 'OK'; // OK | NEED_INGREDIENTS | ERROR
    const drivers: string[] = [];

    // Check if we got usable text
    // Strict Tier-1 check: helper returns low confidence (0.1, 0.2) for poor extractions
    if (!extractionResult.text || extractionResult.confidence < 0.5) {
      status = 'NEED_INGREDIENTS';
      drivers.push('Could not find a clear ingredients list (low confidence)');
    } else {
      confidence = extractionResult.confidence >= 0.9 ? 'HIGH' : 'MEDIUM';
      drivers.push('Ingredients extracted from page text');
    }

    const productData: ProductData & { status: string } = {
      name: null, // Could expand extraction to find title later if needed
      brand: null,
      imageUrl: null,
      ingredientsText: extractionResult.text,
      sugarPerServing: null,
      sugarPer100g: null,
      servingSize: null,
      categories: null,
      source: 'LINK',
      status, // NEW FIELD
      extraction: {
        confidence,
        drivers,
      },
    };

    return NextResponse.json(productData);

  } catch (error: any) {
    console.error('Link extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract product information', status: 'ERROR' },
      { status: 500 }
    );
  }
}
function extractProductInfo(html: string): Omit<ProductData, 'source' | 'extraction'> {
  const cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  let name: string | null = null;
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    name = titleMatch[1].trim().substring(0, 200);
  }

  let brand: string | null = null;
  const brandPatterns = [
    /brand["']?\s*:\s*["']([^"']+)["']/i,
    /<meta[^>]*property=["']og:brand["'][^>]*content=["']([^"']+)["']/i,
  ];
  for (const pattern of brandPatterns) {
    const match = html.match(pattern);
    if (match) {
      brand = match[1].trim();
      break;
    }
  }

  let imageUrl: string | null = null;
  const imagePatterns = [
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["'][^>]*product/i,
  ];
  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match) {
      imageUrl = match[1].trim();
      break;
    }
  }

  let ingredientsText: string | null = null;
  const ingredientPatterns = [
    /ingredients?\s*:?\s*([^<.]+(?:,\s*[^<.]+)+)/i,
    /<[^>]*>ingredients?\s*:?\s*<[^>]*>([^<]+)/i,
  ];
  for (const pattern of ingredientPatterns) {
    const match = cleanHtml.match(pattern);
    if (match) {
      ingredientsText = match[1].trim().substring(0, 1000);
      break;
    }
  }

  let sugarPerServing: number | null = null;
  let sugarPer100g: number | null = null;
  let servingSize: string | null = null;

  const sugarPatterns = [
    /sugars?\s*:?\s*(\d+(?:\.\d+)?)\s*g/i,
    /total\s+sugars?\s*:?\s*(\d+(?:\.\d+)?)\s*g/i,
  ];

  for (const pattern of sugarPatterns) {
    const match = cleanHtml.match(pattern);
    if (match) {
      sugarPerServing = parseFloat(match[1]);
      break;
    }
  }

  const servingPatterns = [
    /serving\s+size\s*:?\s*([^<\n]+)/i,
  ];
  for (const pattern of servingPatterns) {
    const match = cleanHtml.match(pattern);
    if (match) {
      servingSize = match[1].trim().substring(0, 100);
      break;
    }
  }

  return {
    name,
    brand,
    imageUrl,
    ingredientsText,
    sugarPerServing,
    sugarPer100g,
    servingSize,
    categories: null,
  };
}
