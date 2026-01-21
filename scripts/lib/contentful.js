import dotenv from 'dotenv';

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master';
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.CONTENTFUL_TIMEOUT_MS || '25000', 10);

if (!SPACE_ID || !ACCESS_TOKEN) {
  throw new Error('Missing Contentful credentials. Set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN in your environment.');
}

const ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/${ENVIRONMENT}`;

export async function runContentfulQuery(query, variables = {}) {
  if (!query) throw new Error('Missing GraphQL query');

  let timeoutId;
  const controller = typeof AbortController === 'function' ? new AbortController() : null;

  try {
    if (controller && Number.isFinite(REQUEST_TIMEOUT_MS) && REQUEST_TIMEOUT_MS > 0) {
      timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    }

    const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
      body: JSON.stringify({ query, variables }),
      signal: controller?.signal,
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Contentful request failed (${response.status}): ${payload.errors?.[0]?.message || 'Unknown error'}`);
    }

    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message || 'Contentful response contained errors');
    }

    return payload.data;
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`Contentful request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
