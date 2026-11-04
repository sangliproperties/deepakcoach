"use client";
import { FormEvent, useEffect, useState } from "react";
type Item = {
  id: string;
  title: string;
  slug: string;
  description: string;
  durationMins: number;
  priceInr: number;
  active: boolean;
};
export default function RecordedSessionAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  type Lecture = {
    id: string;
    title: string;
    description: string;
    dayNumber: number;
    displayOrder: number;
    durationMins: number;
    active: boolean;
  };

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [lectures, setLectures] = useState<Lecture[]>([]);

  const [lectureBusy, setLectureBusy] = useState(false);
  async function refresh() {
    const r = await fetch("/api/admin/recorded-sessions");
    if (r.ok) setItems((await r.json()).sessions);
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData(e.currentTarget);
      form.set("active", String(editing?.active ?? false));
      const r = await fetch(
        editing
          ? `/api/admin/recorded-sessions/${editing.id}`
          : "/api/admin/recorded-sessions",
        { method: editing ? "PATCH" : "POST", body: form },
      );
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Save failed");
      setEditing(null);
      (e.target as HTMLFormElement).reset();
      setMessage("Saved. New sessions remain inactive until published.");
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }
  async function toggle(item: Item) {
    const form = new FormData();
    Object.entries(item).forEach(([k, v]) => {
      if (k !== "id") form.set(k, String(v));
    });
    form.set("active", String(!item.active));
    const r = await fetch(`/api/admin/recorded-sessions/${item.id}`, {
      method: "PATCH",
      body: form,
    });
    setMessage(r.ok ? "Status updated" : (await r.json()).error);
    await refresh();
  }

  async function loadLectures(courseId: string) {
    setSelectedCourseId(courseId);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/recorded-sessions/${courseId}/lectures`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load lectures");
      }

      setLectures(data.lectures ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load lectures",
      );
    }
  }

  async function uploadLecture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCourseId) return;

    setLectureBusy(true);
    setMessage("");

    try {
      const form = new FormData(event.currentTarget);

      const response = await fetch(
        `/api/admin/recorded-sessions/${selectedCourseId}/lectures`,
        {
          method: "POST",
          body: form,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Lecture upload failed");
      }

      (event.target as HTMLFormElement).reset();

      setMessage("Lecture uploaded successfully.");

      await loadLectures(selectedCourseId);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Lecture upload failed",
      );
    } finally {
      setLectureBusy(false);
    }
  }

  return (
    <section className="mt-10 space-y-8">
      <h2 className="font-display text-3xl">Upload Recorded Sessions</h2>
      <form
        key={editing?.id || "new"}
        onSubmit={save}
        className="card space-y-4"
      >
        {(
          [
            ["title", "Session title"],
            ["slug", "Slug"],
            ["durationMins", "Duration (minutes)"],
            ["priceInr", "Price (INR)"],
          ] as const
        ).map(([name, label]) => (
          <label key={name} className="block text-sm font-semibold">
            {label}
            <input
              name={name}
              required
              type={
                name === "durationMins" || name === "priceInr"
                  ? "number"
                  : "text"
              }
              min={name === "durationMins" ? 1 : 0}
              defaultValue={editing?.[name] ?? ""}
              className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
            />
          </label>
        ))}
        <label className="block text-sm font-semibold">
          Description
          <textarea
            name="description"
            required
            minLength={2}
            maxLength={2000}
            defaultValue={editing?.description || ""}
            className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
            rows={4}
          />
        </label>
        <label className="block text-sm font-semibold">
          Thumbnail (JPG/PNG/WebP; max 5 MB)
          <input
            name="thumbnail"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required={!editing}
            className="mt-2 block w-full"
          />
        </label>
        <div className="flex gap-3">
          <button disabled={busy} className="button-primary">
            {busy ? "Uploading…" : editing ? "Save changes" : "Add Session"}
          </button>
          {editing && (
            <button
              type="button"
              className="button-secondary"
              onClick={() => setEditing(null)}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>
      {message && (
        <p role="status" className="rounded-xl bg-sand p-3">
          {message}
        </p>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-ink/10 bg-white p-4"
          >
            <img
              src={`/api/recorded-sessions/${item.id}/thumbnail`}
              alt=""
              className="h-20 w-32 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-ink/60">
                {item.durationMins} min · ₹{item.priceInr} ·{" "}
                {item.active ? "Active" : "Inactive"}
              </p>
            </div>
            <button
              className="button-secondary"
              onClick={() => setEditing(item)}
            >
              Edit
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => void loadLectures(item.id)}
            >
              Manage Lectures
            </button>
            <button
              className="button-secondary"
              onClick={() => void toggle(item)}
            >
              {item.active ? "Deactivate" : "Activate"}
            </button>
          </article>
        ))}
      </div>

      {selectedCourseId && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Manage Course Lectures</h3>

            <button
              type="button"
              className="button-secondary"
              onClick={() => setSelectedCourseId(null)}
            >
              Close
            </button>
          </div>

          <form onSubmit={uploadLecture} className="space-y-4">
            <label className="block">
              Day Number
              <input
                name="dayNumber"
                type="number"
                min={1}
                required
                className="mt-2 w-full rounded-xl border p-3"
              />
            </label>

            <label className="block">
              Lecture Title
              <input
                name="title"
                type="text"
                required
                minLength={2}
                className="mt-2 w-full rounded-xl border p-3"
              />
            </label>

            <label className="block">
              Description
              <textarea
                name="description"
                className="mt-2 w-full rounded-xl border p-3"
                rows={3}
              />
            </label>

            <label className="block">
              Display Order
              <input
                name="displayOrder"
                type="number"
                min={1}
                required
                className="mt-2 w-full rounded-xl border p-3"
              />
            </label>

            <label className="block">
              Duration (Minutes)
              <input
                name="durationMins"
                type="number"
                min={1}
                required
                className="mt-2 w-full rounded-xl border p-3"
              />
            </label>

            <label className="block">
              Lecture Video (MP4)
              <input
                name="video"
                type="file"
                accept="video/mp4"
                required
                className="mt-2 block w-full"
              />
            </label>

            <button
              type="submit"
              disabled={lectureBusy}
              className="button-primary"
            >
              {lectureBusy ? "Uploading..." : "Upload Lecture"}
            </button>
          </form>

          <div className="space-y-3">
            <h4 className="font-semibold">
              Uploaded Lectures ({lectures.length})
            </h4>

            {lectures.map((lecture) => (
              <div key={lecture.id} className="rounded-xl border p-4">
                <p className="font-semibold">
                  Day {lecture.dayNumber}: {lecture.title}
                </p>

                <p className="text-sm text-gray-500">
                  {lecture.durationMins} minutes ·{" "}
                  {lecture.active ? "Published" : "Unpublished"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
