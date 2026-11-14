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
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
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

      await refresh();

      if (!editing && data.session?.id) {
        await loadLectures(data.session.id);

        setMessage(
          "Course created successfully. " +
            "Now upload Day 1, Day 2 and other lectures below.",
        );
      } else {
        setMessage("Course updated successfully.");
      }
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
    setEditingLectureId(null);
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

  async function updateLecture(
    event: FormEvent<HTMLFormElement>,
    lectureId: string,
  ) {
    event.preventDefault();

    if (!selectedCourseId) {
      setMessage("Please select a course first.");
      return;
    }

    setLectureBusy(true);
    setMessage("");

    try {
      const formElement = event.currentTarget;
      const form = new FormData(formElement);

      console.log(
        "Lecture update form:",
        Object.fromEntries(
          Array.from(form.entries()).filter(([key]) => key !== "video"),
        ),
      );

      const response = await fetch(
        `/api/admin/recorded-sessions/${selectedCourseId}` +
          `/lectures/${lectureId}`,
        {
          method: "PATCH",
          body: form,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Lecture update failed");
      }

      setEditingLectureId(null);

      await loadLectures(selectedCourseId);

      setMessage("Lecture updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Lecture update failed",
      );
    } finally {
      setLectureBusy(false);
    }
  }

  return (
    <section className="mt-10 space-y-8">
      <h2 className="font-display text-3xl">Manage Recorded Courses</h2>

      <p className="text-ink/65">
        Step 1: Create a recorded course. Step 2: Upload Day 1, Day 2 and other
        lectures separately. Step 3: Publish the course.
      </p>
      <form
        key={editing?.id || "new"}
        onSubmit={save}
        className="card space-y-4"
      >
        {(
          [
            ["title", "Course Title"],
            ["slug", "Slug"],
            ["durationMins", "Total Course Duration (minutes)"],
            ["priceInr", "Full Course Price (INR)"],
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
            {busy
              ? "Saving..."
              : editing
                ? "Update Course"
                : "Create Recorded Course"}
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
            <div>
              <h3 className="text-2xl font-semibold">
                Upload Day-wise Course Lectures
              </h3>

              <p className="mt-2 text-sm text-ink/65">
                Upload each lecture separately. All published lectures will be
                available immediately after the customer purchases the course.
              </p>
            </div>

            <button
              type="button"
              className="button-secondary"
              onClick={() => setSelectedCourseId(null)}
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">
                Uploaded Lectures ({lectures.length})
              </h4>
              {lectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="rounded-xl border border-ink/10 bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h5 className="text-lg font-semibold">
                        Day {lecture.dayNumber}: {lecture.title}
                      </h5>

                      <p className="mt-1 text-sm text-ink/60">
                        {lecture.durationMins} minutes ·{" "}
                        {lecture.active ? "Published" : "Unpublished"}
                      </p>

                      <p className="mt-1 text-sm text-ink/60">
                        Display Order: {lecture.displayOrder}
                      </p>

                      {lecture.description && (
                        <p className="mt-2 text-sm text-ink/70">
                          {lecture.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() =>
                        setEditingLectureId(
                          editingLectureId === lecture.id ? null : lecture.id,
                        )
                      }
                    >
                      {editingLectureId === lecture.id
                        ? "Close Editor"
                        : "Edit Lecture Details"}
                    </button>
                  </div>

                  {editingLectureId === lecture.id && (
                    <form
                      key={lecture.id}
                      onSubmit={(event) =>
                        void updateLecture(event, lecture.id)
                      }
                      className="mt-6 space-y-5 border-t border-ink/10 pt-5"
                    >
                      <h6 className="text-lg font-semibold">Edit Lecture</h6>

                      <label className="block text-sm font-semibold">
                        Lecture Title
                        <input
                          name="title"
                          type="text"
                          required
                          minLength={2}
                          maxLength={120}
                          defaultValue={lecture.title}
                          className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
                        />
                      </label>

                      <label className="block text-sm font-semibold">
                        Description
                        <textarea
                          name="description"
                          rows={4}
                          maxLength={2000}
                          defaultValue={lecture.description}
                          className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
                        />
                      </label>

                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="block text-sm font-semibold">
                          Day Number
                          <input
                            name="dayNumber"
                            type="number"
                            min={1}
                            required
                            defaultValue={lecture.dayNumber}
                            className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
                          />
                        </label>

                        <label className="block text-sm font-semibold">
                          Display Order
                          <input
                            name="displayOrder"
                            type="number"
                            min={1}
                            required
                            defaultValue={lecture.displayOrder}
                            className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
                          />
                        </label>

                        <label className="block text-sm font-semibold">
                          Duration (Minutes)
                          <input
                            name="durationMins"
                            type="number"
                            min={1}
                            required
                            defaultValue={lecture.durationMins}
                            className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
                          />
                        </label>
                      </div>

                      <label className="block text-sm font-semibold">
                        Lecture Status
                        <select
                          name="active"
                          defaultValue={String(lecture.active)}
                          className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
                        >
                          <option value="true">Published</option>
                          <option value="false">Unpublished</option>
                        </select>
                      </label>

                      <label className="block text-sm font-semibold">
                        Replace Lecture Video (Optional)
                        <input
                          name="video"
                          type="file"
                          accept="video/mp4"
                          className="mt-2 block w-full"
                        />
                        <span className="mt-2 block text-xs font-normal text-ink/60">
                          Leave this empty to keep the existing MP4. Maximum
                          upload size: 500 MB.
                        </span>
                      </label>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={lectureBusy}
                          className="button-primary"
                        >
                          {lectureBusy
                            ? "Saving Changes..."
                            : "Save Lecture Changes"}
                        </button>

                        <button
                          type="button"
                          disabled={lectureBusy}
                          className="button-secondary"
                          onClick={() => setEditingLectureId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>

            <form
              onSubmit={uploadLecture}
              className="space-y-4 border-t border-ink/10 pt-6"
            >
              <h4 className="text-xl font-semibold">Upload New Lecture</h4>

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
          </div>
        </div>
      )}
    </section>
  );
}
