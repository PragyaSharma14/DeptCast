import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.join(__dirname, '../server');

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api`;
const AUTOGEN_URL = process.env.AUTOGEN_URL || 'http://localhost:8000';

let serverProcess;

// Helper to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Video-AI API QA Test Suite', () => {

  // Before all tests, spawn the server on port 5001
  before(() => {
    return new Promise((resolve, reject) => {
      console.log(`[QA Test] Spawning server on port ${PORT}...`);
      serverProcess = spawn('node', ['server.js'], {
        cwd: serverDir,
        env: {
          ...process.env,
          PORT: PORT.toString(),
          MOCK_VEO: 'true',
          NODE_ENV: 'test'
        }
      });

      let started = false;

      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Server Stdout]: ${output.trim()}`);
        if (output.includes(`Server is running on port ${PORT}`)) {
          started = true;
          resolve();
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(`[Server Stderr]: ${data.toString()}`);
      });

      serverProcess.on('error', (err) => {
        if (!started) {
          reject(err);
        }
      });

      // Timeout safety
      setTimeout(() => {
        if (!started) {
          reject(new Error('Server failed to start within 10 seconds.'));
        }
      }, 10000);
    });
  });

  // After all tests, shut down the server
  after(() => {
    if (serverProcess) {
      console.log('[QA Test] Stopping server...');
      serverProcess.kill('SIGINT');
    }
  });

  // 1. Health Check Test
  test('1. GET /health - Server Health Check', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.deepStrictEqual(body, { status: "ok" });
    console.log('✅ Health check passed.');
  });

  // 2. Authentication Flow
  let token;
  let orgId;
  const testEmail = `qa_user_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
  const testPassword = 'SecurePassword123!';

  test('2. POST /register - User Registration', async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA Automator',
        email: testEmail,
        password: testPassword
      })
    });
    
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.ok(body.token, 'Token should be returned');
    assert.ok(body.currentOrganizationId, 'Org ID should be returned');
    assert.strictEqual(body.email, testEmail);
    
    token = body.token;
    orgId = body.currentOrganizationId;
    console.log(`✅ Registration successful. User Email: ${testEmail}`);
  });

  test('3. POST /login - User Login', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.token, 'Token should be returned on login');
    assert.strictEqual(body.email, testEmail);
    console.log('✅ Login successful.');
  });

  test('4. POST /login (Failure Case) - Invalid Password', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword!'
      })
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.ok(body.error);
    console.log('✅ Login failure handling verified.');
  });

  // 3. Projects Management
  let projectId;
  let sceneId;

  test('5. POST /projects - Create Project', async () => {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-organization-id': orgId
      },
      body: JSON.stringify({
        additionalPrompt: 'A futuristic tech conference with holograms and developers',
        department: 'Engineering',
        style: 'Cinematic',
        dimension: '16:9',
        targetDuration: 5
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.ok(body.project?.id, 'Project ID should exist');
    assert.ok(Array.isArray(body.scenes) && body.scenes.length > 0, 'Project should have at least one scene created');
    
    projectId = body.project.id;
    sceneId = body.scenes[0]._id || body.scenes[0].id;
    console.log(`✅ Project created successfully. Project ID: ${projectId}, Scene ID: ${sceneId}`);
  });

  test('6. GET /projects - List Projects', async () => {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-organization-id': orgId
      }
    });

    assert.strictEqual(res.status, 200);
    const list = await res.json();
    assert.ok(Array.isArray(list), 'Response should be a list of projects');
    const projectExists = list.some(p => p.id === projectId);
    assert.ok(projectExists, 'Created project should be in the list');
    console.log(`✅ List projects verified. Found our test project.`);
  });

  test('7. GET /projects/:id - Get Project Details', async () => {
    const res = await fetch(`${BASE_URL}/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-organization-id': orgId
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.project?.id, projectId);
    assert.ok(body.scenes?.length > 0, 'Project details should include scenes');
    console.log('✅ Get project details verified.');
  });

  // 4. Video & Scene Generation (Mock Mode)
  test('8. POST /videos/project/:projectId/generate - Trigger Video Generation (Mocked)', async () => {
    const res = await fetch(`${BASE_URL}/videos/project/${projectId}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-organization-id': orgId
      }
    });

    assert.strictEqual(res.status, 202);
    const body = await res.json();
    assert.ok(body.message.includes('started'), 'Message should confirm generation start');
    console.log('✅ Video generation endpoint triggered successfully.');
  });

  test('9. POST /videos/scene/:sceneId/regenerate - Trigger Scene Regeneration (Should fail if generating)', async () => {
    const res = await fetch(`${BASE_URL}/videos/scene/${sceneId}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-organization-id': orgId
      },
      body: JSON.stringify({
        promptOverride: 'An alternative cyberpunk design conference room'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('already being generated'), 'Should reject concurrent regeneration');
    console.log('✅ Scene regeneration concurrent block verified.');
  });

  // 5. AutoGen Integration Check (Conditional)
  test('10. POST /projects/generate-blueprint - AutoGen Blueprint Generation (Conditional)', async () => {
    // Check if AutoGen service is up
    let autoGenOnline = false;
    try {
      const ping = await fetch(`${AUTOGEN_URL}/health`);
      if (ping.ok) autoGenOnline = true;
    } catch {
      // AutoGen is offline
    }

    if (!autoGenOnline) {
      console.log(`⚠️  AutoGen service is not running at ${AUTOGEN_URL}. Skipping blueprint test...`);
      return;
    }

    console.log(`[AutoGen Test] Sending request to generate blueprint...`);
    const res = await fetch(`${BASE_URL}/projects/generate-blueprint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-organization-id': orgId
      },
      body: JSON.stringify({
        department: 'Marketing',
        style: 'Cinematic',
        additionalPrompt: 'Write a promotional video for our cloud platform'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.jobId, 'Should return a jobId');
    console.log(`✅ Blueprint generation request accepted. Job ID: ${body.jobId}`);
  });

  // 6. Infographic Remotion Generation Test
  let infographicProjectId;
  test('11. POST /projects - Create Infographic Project', async () => {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-organization-id': orgId
      },
      body: JSON.stringify({
        additionalPrompt: '[Style: Infographics, Target Length: 10s] ## Scene 1: Introduction **Visuals:** Clean, minimal. **Narration:** Welcome to our new HR module.',
        department: 'HR',
        style: 'Infographics',
        dimension: '16:9',
        targetDuration: 10
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    infographicProjectId = body.project.id;
    console.log(`✅ Infographic Project created successfully. ID: ${infographicProjectId}`);
  });

  test('12. POST /videos/project/:projectId/generate - Trigger Infographic Generation (AST conversion)', async () => {
    const res = await fetch(`${BASE_URL}/videos/project/${infographicProjectId}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-organization-id': orgId
      }
    });

    assert.strictEqual(res.status, 202);
    const body = await res.json();
    assert.ok(body.message.includes('started'), 'Message should confirm generation start');
    console.log('✅ Infographic Video generation endpoint triggered successfully.');
    
    // Give it a second to run the background AST conversion task
    await delay(2000);
  });
});
