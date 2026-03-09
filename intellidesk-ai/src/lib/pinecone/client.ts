import { Pinecone, type RecordMetadata } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

export function getPinecone(): Pinecone {
	if (!pineconeClient) {
		pineconeClient = new Pinecone({
			apiKey: process.env.PINECONE_API_KEY!,
		});
	}
	return pineconeClient;
}

export function getIndex() {
	const pc = getPinecone();
	return pc.index(process.env.PINECONE_INDEX || "intellidesk");
}

export async function upsertVectors(
	namespace: string,
	vectors: {
		id: string;
		values: number[];
		metadata: RecordMetadata;
	}[],
) {
	const index = getIndex();
	const ns = index.namespace(namespace);
	await ns.upsert({ records: vectors });
}

export async function queryVectors(
	namespace: string,
	vector: number[],
	topK: number = 5,
	filter?: Record<string, unknown>,
) {
	const index = getIndex();
	const ns = index.namespace(namespace);
	const result = await ns.query({
		vector,
		topK,
		includeMetadata: true,
		filter,
	});
	return result.matches || [];
}
