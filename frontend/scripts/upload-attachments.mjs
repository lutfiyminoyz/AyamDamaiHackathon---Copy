import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(url, serviceKey);

const attachmentsDir = path.resolve(
  process.cwd(),
  "../data/sdoc-hackathon-bundle/attachments"
);

const files = fs.readdirSync(attachmentsDir);

console.log(`Found ${files.length} attachment files.`);

for (const file of files) {
  const filePath = path.join(attachmentsDir, file);
  const fileBuffer = fs.readFileSync(filePath);

  const { error } = await supabase.storage
    .from("attachments")
    .upload(file, fileBuffer, {
      upsert: true,
      contentType: getContentType(file),
    });

  if (error) {
    console.error(`FAILED: ${file}`, error.message);
  } else {
    console.log(`Uploaded: ${file}`);
  }
}

console.log("Upload complete.");

function getContentType(file) {
  const ext = path.extname(file).toLowerCase();

  if (ext === ".pdf") return "application/pdf";
  if (ext === ".txt") return "text/plain";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";

  return "application/octet-stream";
}