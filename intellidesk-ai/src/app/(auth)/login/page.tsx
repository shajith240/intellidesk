"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid email or password");
			} else {
				router.push(callbackUrl);
				router.refresh();
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-center text-lg">Welcome back</CardTitle>
				<CardDescription className="text-center">
					Sign in to your IntelliDesk account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							<AlertCircle className="h-4 w-4 shrink-0" />
							{error}
						</div>
					)}

					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">
							Email
						</label>
						<Input
							id="email"
							type="email"
							placeholder="you@company.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							autoComplete="email"
							className="h-10"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium">
							Password
						</label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							autoComplete="current-password"
							minLength={8}
							className="h-10"
						/>
					</div>

					<Button
						type="submit"
						disabled={loading}
						className="h-10 w-full"
						size="lg"
					>
						{loading && <Loader2 className="h-4 w-4 animate-spin" />}
						{loading ? "Signing in..." : "Sign in"}
					</Button>

					<p className="text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link
							href="/signup"
							className="font-medium text-primary hover:underline"
						>
							Create one
						</Link>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}

export default function LoginPage() {
	return (
		<Suspense>
			<LoginForm />
		</Suspense>
	);
}
