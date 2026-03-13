import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
	variable: "--font-sans",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
	variable: "--font-serif",
	subsets: ["latin"],
	style: ["normal", "italic"],
});

export const metadata: Metadata = {
	title: "IntelliDesk AI",
	description:
		"AI-powered B2B SaaS helpdesk that classifies, prioritizes, and auto-responds to customer emails",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} antialiased`}
			>
				<ThemeProvider>
					{children}
					<Toaster
						richColors
						position="top-right"
						toastOptions={{
							style: {
								background: "var(--card)",
								border: "1px solid var(--border)",
								color: "var(--foreground)",
							},
						}}
					/>
				</ThemeProvider>
			</body>
		</html>
	);
}
