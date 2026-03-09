import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateEmbedding(text: string): Promise<number[]> {
	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
	const model = genAI.getGenerativeModel(
		{ model: "gemini-embedding-001" },
		{ apiVersion: "v1beta" },
	);
	const result = await model.embedContent(text);
	return result.embedding.values;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
	const results: number[][] = [];
	for (const text of texts) {
		const embedding = await generateEmbedding(text);
		results.push(embedding);
	}
	return results;
}
