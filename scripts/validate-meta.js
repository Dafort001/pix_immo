// pix.immo Gallery Metadata Schema Validator
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemaPath = path.resolve(__dirname, "../schemas/gallery_meta.schema.json");
const samplePath = path.resolve(__dirname, "../sample_gallery_meta.json");

console.log("🔍 Validating Gallery Metadata Schema...\n");
console.log(`Schema: ${schemaPath}`);
console.log(`Sample: ${samplePath}\n`);

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
const sample = JSON.parse(fs.readFileSync(samplePath, "utf-8"));

const validate = ajv.compile(schema);
const valid = validate(sample);

if (valid) {
  console.log("✅ gallery_meta.json ist gültig!");
  console.log("\n📊 Sample enthält:");
  console.log(`  • Gallery: ${sample.gallery.name} (${sample.gallery.type})`);
  console.log(`  • Files: ${sample.files.length}`);
  console.log(`  • Status: ${sample.gallery.status}`);
  console.log(`  • Exported: ${sample.exportedAt}`);
  process.exit(0);
} else {
  console.error("❌ Schema-Validierung fehlgeschlagen!\n");
  console.error("Fehler:");
  validate.errors.forEach((err, idx) => {
    console.error(`  ${idx + 1}. ${err.instancePath || '/'}: ${err.message}`);
    if (err.params) {
      console.error(`     Details: ${JSON.stringify(err.params)}`);
    }
  });
  process.exit(1);
}
