const HF_EMBEDDING_URL =
  'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

function getHfToken(): string {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error(
      'HF_TOKEN environment variable is not set. Get a free token at https://huggingface.co/settings/tokens'
    );
  }
  return token;
}

export async function createEmbedding(text: string): Promise<number[]> {
  const res = await fetch(HF_EMBEDDING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getHfToken()}`,
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Hugging Face embedding error: ${res.status} — ${err}`);
  }

  const data = await res.json();

  // The API returns an array of token-level vectors; we average them
  // to get a single sentence-level vector
  if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
    const numTokens = data.length;
    const dims = data[0].length;
    const avg = new Array(dims).fill(0);
    for (let i = 0; i < numTokens; i++) {
      for (let j = 0; j < dims; j++) {
        avg[j] += data[i][j];
      }
    }
    for (let j = 0; j < dims; j++) {
      avg[j] /= numTokens;
    }
    return avg;
  }

  // Sometimes returns a single vector directly
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'number') {
    return data;
  }

  throw new Error(`Unexpected Hugging Face embedding response format`);
}

export async function createEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  // Process sequentially to avoid rate limits on free tier
  const results: number[][] = [];
  for (const text of texts) {
    const embedding = await createEmbedding(text);
    results.push(embedding);
    // Small delay to avoid rate limiting
    if (texts.length > 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return results;
}
