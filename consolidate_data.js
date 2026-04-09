const fs = require('fs');
const path = require('path');

// Helper to extract objects from TS file strings
function extractTemplates(content, constantName) {
  const regex = new RegExp(`const\\s+${constantName}\\s*[:\\s\\w<>,\\[\\]]*\\s*=\\s*\\{`);
  const match = content.match(regex);
  if (!match) return {};
  
  const startSearch = match.index + match[0].length;
  let braceCount = 1;
  let i = startSearch;
  
  while (i < content.length && braceCount > 0) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    i++;
  }
  
  const objectStr = content.substring(match.index, i);
  const templates = {};
  
  // Custom parsing to handle comments and keys
  const entries = objectStr.split(/",?\n\s*"/); // Split roughly by entries
  // Re-joining and using a more precise regex
  const templateRegex = /"([^"]+)"\s*:\s*\{([\s\S]*?)\}(?=\s*,?\s*("|\}))/g;
  let tMatch;
  while ((tMatch = templateRegex.exec(objectStr)) !== null) {
    const key = tMatch[1];
    const body = tMatch[2];
    
    const promptMatch = body.match(/promptTemplate\s*:\s*`([\s\S]*?)`/);
    const prompt = promptMatch ? promptMatch[1].trim() : "";
    
    const keyPointsMatch = body.match(/keyPoints\s*:\s*\[([\s\S]*?)\]/);
    let keyPoints = [];
    if (keyPointsMatch) {
      keyPoints = keyPointsMatch[1]
        .split(',')
        .map(kp => kp.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim())
        .filter(kp => kp);
    }
    
    templates[key] = { prompt, key_points: keyPoints };
  }
  return templates;
}

// Extract arrays from create-video.tsx
function extractArray(content, arrayName) {
  const regex = new RegExp(`const\\s+${arrayName}\\s*[:\\s\\w\\[\\]]*\\s*=\\s*\\[`);
  const match = content.match(regex);
  if (!match) return [];
  
  const startSearch = match.index + match[0].length;
  let bracketCount = 1;
  let i = startSearch;
  
  while (i < content.length && bracketCount > 0) {
    if (content[i] === '[') bracketCount++;
    if (content[i] === ']') bracketCount--;
    i++;
  }
  
  const arrayStr = content.substring(match.index + match[0].length - 1, i);
  // This is a bit unsafe for general JS but for this specific hardcoded file it works
  // We'll use a hack to make it JSON parsable or just return the raw array if we were in a JS environment
  // Since we are in Node, we can actually evaluate it if we trust the source!
  // But let's be safer and use simple regex extraction for key fields.
  
  const objects = [];
  const objRegex = /\{([\s\S]*?)\}/g;
  let oMatch;
  while ((oMatch = objRegex.exec(arrayStr)) !== null) {
    const body = oMatch[1];
    const obj = {};
    body.split('\n').forEach(line => {
      const fieldMatch = line.match(/^\s*(\w+)\s*:\s*["']?([^"']*)["']?,?\s*$/);
      if (fieldMatch) {
        obj[fieldMatch[1]] = fieldMatch[2];
      }
    });
    if (Object.keys(obj).length > 0) objects.push(obj);
  }
  return objects;
}

async function run() {
  const baseDir = __dirname;
  const templatesPath = path.join(baseDir, 'artifacts/video-platform/src/lib/templates.ts');
  const createVideoPath = path.join(baseDir, 'artifacts/video-platform/src/pages/create-video.tsx');
  const departmentsPath = path.join(baseDir, 'artifacts/api-server/src/routes/departments.ts');
  const industriesPath = path.join(baseDir, 'artifacts/video-platform/src/lib/departments-data.ts');

  if (!fs.existsSync(templatesPath)) {
    console.error("Missing source files. Ensure you are in the project root.");
    return;
  }

  const templatesContent = fs.readFileSync(templatesPath, 'utf8');
  const createVideoContent = fs.readFileSync(createVideoPath, 'utf8');
  
  const templateCategories = [
    'HR_TEMPLATES', 'IT_SUPPORT_TEMPLATES', 'OPERATIONS_TEMPLATES', 
    'MARKETING_TEMPLATES', 'ADMIN_TEMPLATES', 'FINANCE_TEMPLATES', 
    'QUALITY_TEMPLATES', 'GENERIC_TEMPLATES'
  ];

  const content_templates = {};
  templateCategories.forEach(cat => {
    const extracted = extractTemplates(templatesContent, cat);
    if (Object.keys(extracted).length > 0) {
      content_templates[cat.replace('_TEMPLATES', '').toLowerCase().replace(/_/g, '-')] = extracted;
    }
  });

  const ui_presets = {
    avatars: extractArray(createVideoContent, 'AI_AVATARS'),
    voices: extractArray(createVideoContent, 'VOICE_AVATARS'),
    dimensions: extractArray(createVideoContent, 'VIDEO_DIMENSIONS')
  };

  const finalJson = {
    project_name: "AI Video Generation Platform Knowledge Base",
    version: "1.0.0",
    description: "Production-ready knowledge base extracted from Enterprice Communication Platform.",
    last_updated: new Date().toISOString(),
    ui_presets,
    content_templates
  };

  fs.writeFileSync('video_platform_knowledge_base.json', JSON.stringify(finalJson, null, 2));
  console.log(`Knowledge base generated! Found ${Object.keys(content_templates).length} template categories, ${ui_presets.avatars.length} avatars, and ${ui_presets.voices.length} voices.`);
}

run();
