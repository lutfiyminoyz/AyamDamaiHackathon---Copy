import fs from "fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing Supabase environment variables.");
}

const comparisons = JSON.parse(
  fs.readFileSync("../submission/document_comparisons.json", "utf-8"),
);

const rows = Object.entries(comparisons).map(([email_id, c]) => ({
  email_id,
  si_file: c.si_file ?? null,
  bl_file: c.bl_file ?? null,
  status: c.status,
  review_reason:
  c.review_reason === "Bill of Lading (BL) is missing or unreadable."
    ? "unreadable"
    : c.review_reason ===
        "No usable Shipping Instruction (SI) or Bill of Lading (BL) document found."
      ? "missing_attachment"
      : c.review_reason === "Bill of Lading (BL) is unreadable."
        ? "unreadable"
        : c.review_reason === "One or more comparison fields are missing."
          ? "missing_value"
          : c.review_reason,
  defect_fields: c.defect_fields ?? [],
  review_fields: c.review_fields ?? [],
  si_fields: c.si_fields ?? {},
  bl_fields: c.bl_fields ?? {},
}));

console.log(`Prepared ${rows.length} comparison rows.`);

for (let i = 0; i < rows.length; i += 100) {
  const batch = rows.slice(i, i + 100);

  const response = await fetch(
    `${url}/rest/v1/document_comparisons?on_conflict=email_id`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(batch),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Insert failed: ${error}`);
  }

  console.log(
    `Inserted ${Math.min(i + 100, rows.length)}/${rows.length}`,
  );
}

console.log("Done.");