// pix.immo Schema Validator
import fs from "fs";
import path from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import dotenv from "dotenv";

dotenv.config();

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemaPath = path.resolve("schemas/gallery_meta.schema.json");
const samplePath = path.resolve("sample_gallery_meta.json");

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
const sample = JSON.parse(fs.readFileSync(samplePath, "utf-8"));

const validate = ajv.compile(schema);
const valid = validate(sample);

if (valid) {
  console.log("✅ gallery_meta.json ist gültig.");
  process.exit(0);
} else {
  console.error("❌ Schema-Fehler:");
  console.error(validate.errors);
  process.exit(1);
}
