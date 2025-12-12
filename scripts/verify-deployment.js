#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before pushing to GitHub
 * 
 * Usage: node scripts/verify-deployment.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const REQUIRED_FILES = [
  '.gitignore',
  '.env.example',
  'README.md',
  'DEPLOYMENT.md',
  'DEPLOYMENT_CHECKLIST.md',
  'MASTER_PROMPT.md',
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/lib/auth/index.ts',
  'src/lib/demo-mode.ts',
  'src/data/mock-data.ts',
  'supabase/migrations/0001_full_schema.sql',
  'supabase/enable_rls_authenticated.sql',
];

const FORBIDDEN_FILES = [
  '.env.local',
  '.env',
  '.env.production',
  'node_modules',
];

const SENSITIVE_PATTERNS = [
  /supabase\.co\/auth\/v1\/token/i,
  /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/, // JWT pattern
  /sk_live_[a-zA-Z0-9]+/, // Stripe live key
  /password\s*=\s*['"]\w+['"]/, // Hardcoded password
];

console.log('🔍 Verifying deployment readiness...\n');

let errors = 0;
let warnings = 0;

// Check required files
console.log('📁 Checking required files...');
for (const file of REQUIRED_FILES) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing: ${file}`);
    errors++;
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

// Check forbidden files
console.log('\n🚫 Checking forbidden files...');
for (const file of FORBIDDEN_FILES) {
  const filePath = path.join(ROOT, file);
  if (fs.existsSync(filePath)) {
    console.warn(`⚠️  Found forbidden file: ${file}`);
    console.warn(`   → This should be in .gitignore`);
    warnings++;
  }
}

// Check for sensitive data in tracked files
console.log('\n🔐 Scanning for sensitive data...');
const filesToScan = [
  'src/**/*.ts',
  'src/**/*.tsx',
  '*.md',
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(content)) {
      console.warn(`⚠️  Potential sensitive data in: ${filePath}`);
      warnings++;
      return;
    }
  }
}

// Scan src directory
const srcDir = path.join(ROOT, 'src');
if (fs.existsSync(srcDir)) {
  scanDirectory(srcDir);
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      scanFile(filePath);
    }
  }
}

// Check .env.example
console.log('\n📝 Verifying .env.example...');
const envExamplePath = path.join(ROOT, '.env.example');
if (fs.existsSync(envExamplePath)) {
  const content = fs.readFileSync(envExamplePath, 'utf-8');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  for (const varName of requiredVars) {
    if (!content.includes(varName)) {
      console.error(`❌ Missing variable in .env.example: ${varName}`);
      errors++;
    }
  }
  
  // Check for real values
  if (content.includes('eyJ') || content.includes('.supabase.co')) {
    console.warn('⚠️  .env.example contains real values! Should be placeholders only.');
    warnings++;
  }
}

// Check package.json
console.log('\n📦 Checking package.json...');
const packageJsonPath = path.join(ROOT, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const requiredScripts = ['dev', 'build', 'start'];
  for (const script of requiredScripts) {
    if (!packageJson.scripts || !packageJson.scripts[script]) {
      console.error(`❌ Missing script in package.json: ${script}`);
      errors++;
    }
  }
  
  const requiredDeps = ['next', 'react', '@supabase/ssr'];
  for (const dep of requiredDeps) {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      console.error(`❌ Missing dependency: ${dep}`);
      errors++;
    }
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed! Ready to deploy.');
  console.log('\nNext steps:');
  console.log('1. git init');
  console.log('2. git add .');
  console.log('3. git commit -m "Initial commit"');
  console.log('4. Push to GitHub');
  console.log('5. Follow DEPLOYMENT.md');
  process.exit(0);
} else {
  if (errors > 0) {
    console.error(`\n❌ Found ${errors} error(s)`);
  }
  if (warnings > 0) {
    console.warn(`⚠️  Found ${warnings} warning(s)`);
  }
  console.log('\n⚠️  Please fix issues before deploying.');
  process.exit(1);
}
