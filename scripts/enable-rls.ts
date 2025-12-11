#!/usr/bin/env node

/**
 * Enable RLS Policies Script
 * 
 * This script enables RLS policies on all tables for authenticated users.
 * Run this after initial migration to allow the app to function.
 * 
 * Usage:
 *   npx ts-node scripts/enable-rls.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const tables = [
  'units',
  'roles',
  'users',
  'user_roles',
  'categories',
  'requests',
  'request_items',
  'request_comments',
  'attachments',
  'request_logs',
]

async function enableRLS() {
  console.log('🔒 Enabling RLS policies for authenticated users...\n')

  try {
    // Read and execute the SQL file
    const fs = require('fs')
    const path = require('path')
    
    const sqlPath = path.join(__dirname, '../supabase/enable_rls_authenticated.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')
    
    // Execute SQL via Supabase admin
    const { error } = await supabase.rpc('execute_sql', { sql })
    
    if (error) {
      console.error('❌ Error enabling RLS:', error)
      process.exit(1)
    }
    
    console.log('✅ RLS policies enabled successfully!')
    console.log('\n📋 Enabled policies for tables:')
    tables.forEach(table => {
      console.log(`   - ${table}`)
    })
    
    console.log('\n✨ Your Supabase database is ready for Google OAuth!')
  } catch (error) {
    console.error('❌ Failed to enable RLS:', error)
    process.exit(1)
  }
}

enableRLS()
