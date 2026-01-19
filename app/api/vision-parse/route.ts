import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { classifyIngredients } from '@/lib/classifier';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not set on server' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const imageDataUrl = String(body?.imageDataUrl ?? '').trim();

    if (!imageDataUrl.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Missing/invalid imageDataUrl' }, { status: 400 });
    }

    const prompt = `
Extract the INGREDIENTS line and (if visible) sugar grams per serving from the label image.

Return JSON ONLY:
{
  "ingredientsText": string,
  "sugarGramsPerServing": number | null,
  "servingSize": string | null
}

Rules:
- ingredientsText must be ONLY the ingredients string (no extra commentary).
- If ingredients are not visible, return "".
- If sugar per serving not visible, return null.
- No extra keys.
`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You extract structured label data from images.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
    });

    const content = resp.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content);

    const ingredientsText = String(parsed?.ingredientsText ?? '').trim();
    const sugarGramsPerServing =
      parsed?.sugarGramsPerServing === null || parsed?.sugarGramsPerServing === undefined
        ? null
        : Number(parsed?.sugarGramsPerServing);

    const servingSize =
      parsed?.servingSize === null || parsed?.servingSize === undefined
        ? null
        : String(parsed?.servingSize);

    // ✅ If OCR couldn't find ingredients, return a meaningful WARN result
    if (!ingredientsText) {
      return NextResponse.json({
        classification: 'WARN',
        confidence: 0.2,
        reasons: [
          'Could not detect an ingredients list in the image.',
          'Try a clearer photo: flat, well-lit, and zoomed on the ingredients section.',
        ],
        matchedTerms: [],
        notes: 'Upload worked. OCR did not find ingredients text.',
        extracted: { ingredientsText, sugarGramsPerServing, servingSize },
      });
    }

    const classification = classifyIngredients(ingredientsText);

    // ✅ Guarantee at least 1 reason for display
    const reasons =
      Array.isArray(classification?.reasons) && classification.reasons.length > 0
        ? classification.reasons
        : ['Ingredients extracted, but no specific sugar indicators matched.'];

    return NextResponse.json({
      ...classification,
      reasons,
      extracted: { ingredientsText, sugarGramsPerServing, servingSize },
      notes: 'Result generated from OCR extraction + ingredient classification.',
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'vision-parse failed', detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
