const POLL_INTERVAL_MS = parseInt(
	process.env.EMAIL_POLL_INTERVAL_MS || "60000",
); // default: 60 seconds

async function pollEmails() {
	try {
		const { pollNewEmails } = await import("@/lib/email/imap");
		const { processEmail } = await import("@/lib/pipeline/processor");
		const { supabaseAdmin } = await import("@/lib/supabase/server");

		// Only poll orgs that have connected their email via Settings
		const { data: orgs } = await supabaseAdmin
			.from("organizations")
			.select("id, email_config")
			.not("email_config", "is", null);

		if (!orgs || orgs.length === 0) return;

		for (const org of orgs) {
			const imapConfig = org.email_config?.imap;
			if (!imapConfig?.auth?.user || !imapConfig?.auth?.pass) continue;

			const rawEmails = await pollNewEmails(imapConfig);
			if (rawEmails.length === 0) continue;

			console.log(
				`[Auto-Poll] Found ${rawEmails.length} new email(s) for org ${org.id}`,
			);

			for (let i = 0; i < rawEmails.length; i++) {
				try {
					const result = await processEmail(rawEmails[i], org.id);
					console.log(
						`[Auto-Poll] Processed: ${result.ticket_number || "unknown"} - ${result.status}`,
					);
				} catch (err) {
					console.error("[Auto-Poll] Error processing email:", err);
				}

				// Rate limit between emails (Gemini free tier)
				if (i < rawEmails.length - 1) {
					await new Promise((resolve) => setTimeout(resolve, 4000));
				}
			}
		}
	} catch (err) {
		console.error("[Auto-Poll] Poll cycle error:", err);
	}
}

export async function register() {
	// Only run on the Node.js server runtime, not in Edge or during build
	if (process.env.NEXT_RUNTIME === "nodejs") {
		console.log(
			`[Auto-Poll] Starting email polling every ${POLL_INTERVAL_MS / 1000}s`,
		);

		// Delay first poll to let the server fully start
		setTimeout(() => {
			pollEmails();
			setInterval(pollEmails, POLL_INTERVAL_MS);
		}, 5000);
	}
}
