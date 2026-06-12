import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const description = formData.get('description') as string;
  const imageFile = formData.get('image') as File | null;

  const parts: any[] = [];

  if (imageFile) {
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    parts.push({
      inline_data: {
        mime_type: imageFile.type || 'image/jpeg',
        data: base64,
      },
    });
  }

  const prompt = `Eres un nutricionista deportivo. Analiza ${imageFile ? 'esta imagen de comida' : 'esta descripción de comida'} y estima los macronutrientes.

${description ? `Descripción: ${description}` : ''}

Responde ÚNICAMENTE con JSON válido, sin texto adicional:
{
  "name": "nombre del plato o comida",
  "calories": número_entero,
  "protein": número_decimal_gramos,
  "carbs": número_decimal_gramos,
  "fat": número_decimal_gramos,
  "notes": "breve nota sobre la estimación"
}

Sé preciso pero si hay incertidumbre, indica en notes. Si no puedes estimar, usa valores conservadores típicos.`;

  parts.push({ text: prompt });

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  const model = imageFile ? 'gemini-1.5-flash' : 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: 'Gemini error: ' + err }, { status: 500 });
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: 'No JSON in response', raw: text }, { status: 500 });
  }

  try {
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', raw: text }, { status: 500 });
  }
}
