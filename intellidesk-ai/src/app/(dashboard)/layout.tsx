"use client";

import { Sidebar } from "@/components/sidebar";
import { AuthProvider } from "@/components/auth-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<div className="flex h-screen overflow-hidden bg-background">
				<Sidebar />
				<main className="flex-1 overflow-y-auto">
					<div className="mx-auto max-w-[1600px]">{children}</div>
				</main>
			</div>
		</AuthProvider>
	);
}
