"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeaderSignOut() {
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);

    async function handleSignOut() {
        if (signingOut) return;

        setSigningOut(true);

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Sign out failed.");
            }

            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Sign out error:", error);
            setSigningOut(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm font-semibold text-coral hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
            {signingOut ? "Signing out..." : "Sign out"}
        </button>
    );
}