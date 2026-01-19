import { NextRequest, NextResponse } from 'next/server';
import { ProductData } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Barcode code is required' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SugarShield/1.0',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Product not found in Open Food Facts database' },
          { status: 404 }
        );
      }
      throw new Error(`OFF API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 0) {
      return NextResponse.json(
        { error: 'Product not found in Open Food Facts database' },
        { status: 404 }
      );
    }

    const product = data.product;

    const productData: ProductData = {
      name: product.product_name || null,
      brand: product.brands || null,
      imageUrl: product.image_url || null,
      ingredientsText: product.ingredients_text || null,
      sugarPerServing: extractNumber(product.sugars_serving),
      sugarPer100g: extractNumber(product.sugars_100g),
      servingSize: product.serving_size || null,
      categories: product.categories_tags || null,
      source: 'OFF',
    };

    return NextResponse.json(productData);
  } catch (error: any) {
    console.error('Open Food Facts API error:', error);

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - Open Food Facts is slow or unavailable' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch product from Open Food Facts' },
      { status: 500 }
    );
  }
}

function extractNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}
