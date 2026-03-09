"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function SignupPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [organizationName, setOrganizationName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password, organizationName }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Signup failed");
				setLoading(false);
				return;
			}

			// Auto-login after signup
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Account created but login failed. Please sign in manually.");
			} else {
				router.push("/");
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
				<CardTitle className="text-center text-lg">
					Create your account
				</CardTitle>
				<CardDescription className="text-center">
					Get started with IntelliDesk for your team
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
						<label htmlFor="org-name" className="text-sm font-medium">
							Organization name
						</label>
						<Input
							id="org-name"
							type="text"
							placeholder="Acme Inc."
							value={organizationName}
							onChange={(e) => setOrganizationName(e.target.value)}
							required
							className="h-10"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="name" className="text-sm font-medium">
							Your name
						</label>
						<Input
							id="name"
							type="text"
							placeholder="Jane Smith"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="h-10"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">
							Work email
						</label>
						<Input
							id="email"
							type="email"
							placeholder="jane@acme.com"
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
							placeholder="Min. 8 characters"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							autoComplete="new-password"
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
						{loading ? "Creating account..." : "Create account"}
					</Button>

					<p className="text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-medium text-primary hover:underline"
						>
							Sign in
						</Link>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
