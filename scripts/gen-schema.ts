import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AnalysisConfigZ } from '../src/config/schema';

// Ensure output directory exists
const outputDir = 'schemas';
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Convert Zod schema to JSON Schema
const jsonSchema = zodToJsonSchema(AnalysisConfigZ, {
  name: 'AnalysisConfig',
  $refStrategy: 'root',
  target: 'jsonSchema7',
  definitionPath: 'definitions',
  strictUnions: true,
});

// Add some metadata
const fullSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/your-org/bbf-tables/schemas/analysis-config.schema.json',
  title: 'Analysis Configuration',
  description: 'Configuration for signal analysis pipeline',
  ...jsonSchema,
};

// Write to file
const outputPath = `${outputDir}/analysis-config.schema.json`;
writeFileSync(outputPath, JSON.stringify(fullSchema, null, 2));

console.log(`✅ Generated JSON Schema: ${outputPath}`);
