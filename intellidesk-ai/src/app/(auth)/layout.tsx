import { Brain, Sparkles } from "lucide-react";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-[420px] space-y-8">
				{/* Logo */}
				<div className="flex flex-col items-center gap-3">
					<div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
						<Brain className="h-7 w-7 text-primary" />
						<div className="absolute -right-1 -top-1">
							<Sparkles className="h-4 w-4 text-primary/60" />
						</div>
					</div>
					<h1 className="text-xl font-semibold tracking-tight">
						Intelli<span className="text-primary">Desk</span>
					</h1>
				</div>
				{children}
			</div>
		</div>
	);
}
