"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSubmitting(true);
        setSuccess("");
        setError("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Your enquiry could not be submitted.");
                return;
            }

            setSuccess("Thank you. Your enquiry has been submitted successfully.");

            setName("");
            setEmail("");
            setMessage("");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="card" onSubmit={handleSubmit}>
            <label
                className="block text-sm font-semibold"
                htmlFor="name"
            >
                Your name
            </label>

            <input
                id="name"
                name="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
            />

            <label
                className="mt-5 block text-sm font-semibold"
                htmlFor="email"
            >
                Email address
            </label>

            <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
            />

            <label
                className="mt-5 block text-sm font-semibold"
                htmlFor="message"
            >
                What would you like to explore?
            </label>

            <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
            />

            <button
                type="submit"
                disabled={submitting}
                className="button-primary mt-6 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? "Sending..." : "Send enquiry"}
            </button>

            {success && (
                <p
                    role="status"
                    className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm text-moss"
                >
                    {success}
                </p>
            )}

            {error && (
                <p
                    role="alert"
                    className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                    {error}
                </p>
            )}
        </form>
    );
}