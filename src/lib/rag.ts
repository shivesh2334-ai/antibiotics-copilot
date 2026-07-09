import { readFile } from "node:fs/promises";
import path from "node:path";

export interface RetrievedChunk {
  id: string;
  page: number | null;
  text: string;
  score: number;
}

interface PolicyChunk {
  id: string;
  page: number | null;
  text: string;
  tokens: string[];
}

interface PolicyIndex {
  chunks: PolicyChunk[];
  documentFrequency: Map<string, number>;
}

const POLICY_PATH = path.join(
  process.cwd(),
  "JIPMER_Antibiotic_Policy_2026.txt"
);
const MAX_CHUNK_CHARS = 1200;
const MIN_PARAGRAPH_CHARS = 60;

let policyIndexPromise: Promise<PolicyIndex> | null = null;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function buildDocumentFrequency(chunks: PolicyChunk[]): Map<string, number> {
  const frequency = new Map<string, number>();

  for (const chunk of chunks) {
    const uniqueTerms = new Set(chunk.tokens);
    for (const term of uniqueTerms) {
      frequency.set(term, (frequency.get(term) ?? 0) + 1);
    }
  }

  return frequency;
}

function splitByParagraph(lines: string[]): Array<{ text: string; page: number | null }> {
  const paragraphs: Array<{ text: string; page: number | null }> = [];
  let currentPage: number | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 0) {
      return;
    }

    const paragraphText = normalizeText(buffer.join(" "));
    if (paragraphText.length >= MIN_PARAGRAPH_CHARS) {
      paragraphs.push({ text: paragraphText, page: currentPage });
    }
    buffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    const pageMatch = line.match(/Page\s*\((\d+)\)\s*Break/i);
    if (pageMatch) {
      flush();
      currentPage = Number(pageMatch[1]);
      continue;
    }

    if (!line) {
      flush();
      continue;
    }

    buffer.push(line);
  }

  flush();
  return paragraphs;
}

function mergeParagraphs(paragraphs: Array<{ text: string; page: number | null }>): PolicyChunk[] {
  const chunks: PolicyChunk[] = [];
  let currentText = "";
  let currentPage: number | null = null;
  let chunkNumber = 1;

  const flush = () => {
    const text = normalizeText(currentText);
    if (!text) {
      return;
    }

    chunks.push({
      id: `policy-${chunkNumber}`,
      page: currentPage,
      text,
      tokens: tokenize(text),
    });

    chunkNumber += 1;
    currentText = "";
  };

  for (const paragraph of paragraphs) {
    if (!currentText) {
      currentPage = paragraph.page;
      currentText = paragraph.text;
      continue;
    }

    const candidate = `${currentText}\n\n${paragraph.text}`;
    if (candidate.length > MAX_CHUNK_CHARS) {
      flush();
      currentPage = paragraph.page;
      currentText = paragraph.text;
    } else {
      currentText = candidate;
    }
  }

  flush();
  return chunks;
}

async function loadPolicyIndex(): Promise<PolicyIndex> {
  const content = await readFile(POLICY_PATH, "utf8");
  const lines = content.replace(/\r/g, "").split("\n");
  const paragraphs = splitByParagraph(lines);
  const chunks = mergeParagraphs(paragraphs);
  const documentFrequency = buildDocumentFrequency(chunks);

  return {
    chunks,
    documentFrequency,
  };
}

function scoreChunk(
  queryTokens: string[],
  chunk: PolicyChunk,
  documentFrequency: Map<string, number>,
  totalChunks: number
): number {
  if (queryTokens.length === 0) {
    return 0;
  }

  let score = 0;
  const chunkTokenSet = new Set(chunk.tokens);

  for (const token of queryTokens) {
    if (!chunkTokenSet.has(token)) {
      continue;
    }

    const tokenCount = chunk.tokens.filter((t) => t === token).length;
    const termFrequency = tokenCount / chunk.tokens.length;
    const docsWithTerm = documentFrequency.get(token) ?? 0;
    const inverseDocumentFrequency =
      Math.log((totalChunks + 1) / (docsWithTerm + 1)) + 1;

    score += termFrequency * inverseDocumentFrequency;
  }

  const phraseBonus =
    normalizeText(chunk.text.toLowerCase()).includes(
      normalizeText(queryTokens.join(" "))
    ) && queryTokens.length > 1
      ? 0.15
      : 0;

  return score + phraseBonus;
}

export async function retrieveRelevantChunks(
  query: string,
  limit = 6
): Promise<RetrievedChunk[]> {
  if (!policyIndexPromise) {
    policyIndexPromise = loadPolicyIndex();
  }

  const { chunks, documentFrequency } = await policyIndexPromise;
  const queryTokens = tokenize(query);

  const scored = chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(queryTokens, chunk, documentFrequency, chunks.length),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((chunk) => ({
      id: chunk.id,
      page: chunk.page,
      text: chunk.text,
      score: chunk.score,
    }));

  return scored;
}

export function formatRetrievedContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, index) => {
      const pageLabel = chunk.page !== null ? `Page ${chunk.page}` : "Page unknown";
      return `Source ${index + 1} (${pageLabel}, ${chunk.id}):\n${chunk.text}`;
    })
    .join("\n\n---\n\n");
}