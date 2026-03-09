import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST() {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	try {
		// Add ai_classification JSONB column to tickets table
		const { error } = await supabaseAdmin.rpc("exec_sql", {
			sql: "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_classification JSONB;",
		});

		if (error) {
			// If RPC doesn't exist, try raw query via postgrest
			// Alternative: just check if column exists by trying to update
			const { error: testError } = await supabaseAdmin
				.from("tickets")
				.select("ai_classification")
				.limit(1);

			if (testError && testError.message.includes("ai_classification")) {
				return NextResponse.json(
					{
						error:
							"Column does not exist and cannot be added via API. Please run SQL manually in Supabase dashboard.",
						sql: "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_classification JSONB;",
					},
					{ status: 500 },
				);
			}

			return NextResponse.json({
				message: "Column already exists or was added successfully",
			});
		}

		return NextResponse.json({ message: "Migration successful" });
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
