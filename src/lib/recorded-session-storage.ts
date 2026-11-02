import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const root = process.env.RECORDED_STORAGE_DIR;

function folder(kind: "video" | "thumbnail") {
  if (!root) {
    throw new Error(
      "RECORDED_STORAGE_DIR must be configured outside the public directory",
    );
  }

  return join(root, kind);
}

export async function saveMedia(file: File, kind: "video" | "thumbnail") {
  const types =
    kind === "video"
      ? ["video/mp4"]
      : ["image/jpeg", "image/png", "image/webp"];

  const limit = kind === "video" ? 500 * 1024 * 1024 : 5 * 1024 * 1024;

  if (!types.includes(file.type) || file.size < 1 || file.size > limit) {
    throw new Error("Invalid file type or size");
  }

  const ext =
    kind === "video"
      ? ".mp4"
      : (
          {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
          } as Record<string, string>
        )[file.type];

  const key = randomUUID() + ext;

  await mkdir(folder(kind), {
    recursive: true,
  });

  await writeFile(
    join(folder(kind), key),
    Buffer.from(await file.arrayBuffer()),
    { flag: "wx" },
  );

  return key;
}

export function mediaPath(key: string, kind: "video" | "thumbnail") {
  if (!/^[a-f0-9-]{36}\.(mp4|jpg|png|webp)$/.test(key)) {
    throw new Error("Invalid media key");
  }

  return join(folder(kind), key);
}
