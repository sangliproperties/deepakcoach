"use client";

import {
    useState
} from "react";

import {
    useRouter
} from "next/navigation";


type ProfileEditorProps = {
    initialName: string;
    initialEmail: string;
    initialPhone: string;
};


export default function ProfileEditor({
    initialName,
    initialEmail,
    initialPhone
}: ProfileEditorProps) {
    const router = useRouter();

    const [editing, setEditing] =
        useState(false);

    const [name, setName] =
        useState(initialName);

    const [email, setEmail] =
        useState(initialEmail);

    const [phone, setPhone] =
        useState(initialPhone);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    function cancelEditing() {
        setName(initialName);
        setEmail(initialEmail);
        setPhone(initialPhone);

        setError("");
        setMessage("");
        setEditing(false);
    }


    async function saveProfile(
        event: React.FormEvent
    ) {
        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response =
                await fetch(
                    "/api/account/profile",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            email,
                            phone
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                setError(
                    data.error ||
                    "Profile could not be updated."
                );

                return;
            }

            setName(data.user.name);
            setEmail(data.user.email);
            setPhone(
                data.user.phone || ""
            );

            setEditing(false);

            setMessage(
                "Profile updated successfully."
            );

            /*
             * Refresh Server Components so
             * Account/header can read the
             * updated user from the database.
             */
            router.refresh();
        } catch {
            setError(
                "Profile could not be updated."
            );
        } finally {
            setSaving(false);
        }
    }


    if (!editing) {
        return (
            <div className="mt-6">
                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                            Full name
                        </p>

                        <p className="mt-1 font-semibold">
                            {name}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                            Email
                        </p>

                        <p className="mt-1 break-all">
                            {email}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                            Phone
                        </p>

                        <p className="mt-1">
                            {phone ||
                                "Not provided"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setMessage("");
                        setError("");
                        setEditing(true);
                    }}
                    className="button-secondary mt-6"
                >
                    Edit Profile
                </button>

                {message && (
                    <p
                        role="status"
                        className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm text-moss"
                    >
                        {message}
                    </p>
                )}
            </div>
        );
    }


    return (
        <form
            onSubmit={saveProfile}
            className="mt-6 space-y-5"
        >
            <label className="block text-sm font-semibold">
                Full Name

                <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={(event) =>
                        setName(
                            event.target.value
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
                />
            </label>

            <label className="block text-sm font-semibold">
                Email Address

                <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) =>
                        setEmail(
                            event.target.value
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
                />
            </label>

            <label className="block text-sm font-semibold">
                Phone Number

                <input
                    type="tel"
                    required
                    minLength={10}
                    maxLength={30}
                    value={phone}
                    onChange={(event) =>
                        setPhone(
                            event.target.value
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
                />
            </label>

            {error && (
                <p
                    role="alert"
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                    {error}
                </p>
            )}

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={saving}
                    className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving
                        ? "Saving..."
                        : "Save Changes"}
                </button>

                <button
                    type="button"
                    disabled={saving}
                    onClick={cancelEditing}
                    className="button-secondary"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}