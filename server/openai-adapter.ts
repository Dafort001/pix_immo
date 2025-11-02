/**
 * OpenAI ChatGPT Integration
 * Für Bildanalyse, Captioning und Exposé-Texterstellung
 */

import { getAIConfig } from './ai-providers';

export interface CaptionOptions {
  language?: 'de' | 'en';
  style?: 'marketing' | 'technical' | 'descriptive';
  roomType?: string;
  maxLength?: number;
}

export interface GenerateCaptionParams {
  imageUrl: string;
  options?: CaptionOptions;
}

export interface CaptionResult {
  caption: string;
  language: string;
  confidence: number;
  keywords?: string[];
}

/**
 * Generiere eine Marketing-Beschreibung für ein Immobilienbild
 * Nutzt GPT-4 Vision für präzise Bildanalyse
 */
export async function generateCaption(params: GenerateCaptionParams): Promise<CaptionResult> {
  const config = getAIConfig();
  
  if (!config.openaiApiKey) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable.');
  }

  const language = params.options?.language || 'de';
  const style = params.options?.style || 'marketing';
  const roomType = params.options?.roomType || 'Raum';

  // System Prompt für Immobilien-Captioning
  const systemPrompt = getSystemPrompt(language, style, roomType);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Beschreibe dieses ${roomType}-Foto für eine Immobilienanzeige.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: params.imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: params.options?.maxLength || 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const caption = data.choices[0]?.message?.content || '';

    // Extrahiere Keywords aus der Caption
    const keywords = extractKeywords(caption, language);

    return {
      caption: caption.trim(),
      language,
      confidence: 0.9, // GPT-4 Vision ist sehr zuverlässig
      keywords,
    };
  } catch (error) {
    console.error('OpenAI caption generation failed:', error);
    throw error;
  }
}

/**
 * Batch-Caption-Generierung für mehrere Bilder
 */
export async function generateCaptionBatch(
  images: Array<{ url: string; roomType?: string }>
): Promise<CaptionResult[]> {
  const results: CaptionResult[] = [];

  // Sequentiell verarbeiten um Rate Limits zu vermeiden
  for (const image of images) {
    try {
      const result = await generateCaption({
        imageUrl: image.url,
        options: { roomType: image.roomType },
      });
      results.push(result);
      
      // Rate limiting: 100ms Pause zwischen Anfragen
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to caption image ${image.url}:`, error);
      results.push({
        caption: '',
        language: 'de',
        confidence: 0,
        keywords: [],
      });
    }
  }

  return results;
}

/**
 * Generiere Exposé-Text basierend auf Bild-Captions und Job-Daten
 */
export async function generateExposeText(params: {
  propertyName: string;
  propertyAddress: string;
  roomCaptions: Array<{ roomType: string; caption: string }>;
  additionalInfo?: string;
}): Promise<string> {
  const config = getAIConfig();
  
  if (!config.openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `Du bist ein Experte für Immobilienmarketing. 
Erstelle professionelle, ansprechende Exposé-Texte für Immobilien.
Verwende die bereitgestellten Raumbeschreibungen und erstelle einen zusammenhängenden, 
verkaufsfördernden Text im deutschen Immobilien-Marketing-Stil.`;

  const userPrompt = `
Immobilie: ${params.propertyName}
Adresse: ${params.propertyAddress}

Raumbeschreibungen:
${params.roomCaptions.map(r => `- ${r.roomType}: ${r.caption}`).join('\n')}

${params.additionalInfo ? `Zusätzliche Informationen:\n${params.additionalInfo}` : ''}

Erstelle einen professionellen Exposé-Text (ca. 200-300 Wörter) der die Highlights 
dieser Immobilie hervorhebt.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI exposé generation failed:', error);
    throw error;
  }
}

// Helper Functions

function getSystemPrompt(language: string, style: string, roomType: string): string {
  if (language === 'de') {
    if (style === 'marketing') {
      return `Du bist ein professioneller Immobilienfotograf und Marketing-Texter. 
Beschreibe das Bild präzise und verkaufsfördernd für eine Immobilienanzeige.
Fokussiere auf Licht, Raumgefühl, Ausstattung und besondere Details.
Verwende maximal 2-3 kurze Sätze. Schreibe im Präsens.
Raumtyp: ${roomType}`;
    } else if (style === 'technical') {
      return `Beschreibe das Bild sachlich und präzise für eine technische Dokumentation.
Erwähne Raumgröße, Ausstattung, Zustand und besondere Merkmale.
Raumtyp: ${roomType}`;
    } else {
      return `Beschreibe das Bild klar und objektiv.
Raumtyp: ${roomType}`;
    }
  } else {
    // English prompts
    if (style === 'marketing') {
      return `You are a professional real estate photographer and marketing copywriter.
Describe the image precisely and in a sales-oriented manner for a property listing.
Focus on light, space, amenities, and special details.
Use maximum 2-3 short sentences. Write in present tense.
Room type: ${roomType}`;
    } else {
      return `Describe the image clearly and objectively.
Room type: ${roomType}`;
    }
  }
}

function extractKeywords(caption: string, language: string): string[] {
  // Einfache Keyword-Extraktion basierend auf häufigen Immobilien-Begriffen
  const germanKeywords = [
    'modern', 'hell', 'großzügig', 'hochwertig', 'stylish', 'offen', 'geräumig',
    'einladend', 'elegant', 'warm', 'freundlich', 'lichtdurchflutet', 'exklusiv',
    'luxuriös', 'komfortabel', 'funktional', 'praktisch', 'charmant', 'renoviert',
  ];

  const englishKeywords = [
    'modern', 'bright', 'spacious', 'luxury', 'stylish', 'open', 'inviting',
    'elegant', 'warm', 'friendly', 'exclusive', 'comfortable', 'functional',
    'practical', 'charming', 'renovated',
  ];

  const keywords = language === 'de' ? germanKeywords : englishKeywords;
  const lowerCaption = caption.toLowerCase();

  return keywords.filter(keyword => lowerCaption.includes(keyword));
}
