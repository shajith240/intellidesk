import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
	if (!groqClient) {
		groqClient = new Groq({
			apiKey: process.env.GROQ_API_KEY!,
		});
	}
	return groqClient;
}

export const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Send a prompt to Groq and get text response
 */
export async function groqGenerate(
	systemPrompt: string,
	userMessage: string,
): Promise<string> {
	const client = getGroqClient();
	const completion = await client.chat.completions.create({
		model: GROQ_MODEL,
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userMessage },
		],
		temperature: 0.3,
	});
	return completion.choices[0]?.message?.content?.trim() || "";
}
