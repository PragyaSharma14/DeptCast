import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getTemplateByDomain = (domain) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', `${domain.toLowerCase()}.json`);
    if (fs.existsSync(templatePath)) {
      const data = fs.readFileSync(templatePath, 'utf8');
      return JSON.parse(data);
    }
    console.warn(`Template for domain '${domain}' not found. Using fallback.`);
    // Fallback template
    return {
      domain: "general",
      name: "General Content",
      structure: ["Introduction", "Main Body", "Conclusion"],
      pacing: "moderate",
      tone: "neutral",
      defaultDuration: 4,
      styleHints: "standard, clear focus, balanced lighting"
    };
  } catch (error) {
    console.error(`Error loading template for domain ${domain}:`, error);
    throw error;
  }
};
