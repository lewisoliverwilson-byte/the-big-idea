/**
 * Reset all accounts for testing.
 * - Deletes all reports (clean grimoire)
 * - Sets subscription_status = 'free'
 * - Zeros out all report counters
 *
 * Run: node scripts/reset_for_testing.mjs
 */

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://bigidea_admin:BigIdea_Prod_2026xK9q@the-big-idea-db.c6faseyqm4h7.us-east-1.rds.amazonaws.com:5432/the_big_idea',
  ssl: { rejectUnauthorized: false }
})

await client.connect()

// Show state before
const { rows: before } = await client.query(
  'SELECT email, subscription_status, reports_used_free, pro_reports_used_this_week FROM users'
)
console.log('\n── Before ────────────────────────────────')
for (const r of before) console.log(' ', r)

// Delete all reports
const del = await client.query('DELETE FROM reports')
console.log(`\nDeleted ${del.rowCount} report(s)`)

// Reset all users to free tier, zero counters
const upd = await client.query(`
  UPDATE users
  SET subscription_status        = 'free',
      reports_used_free          = 0,
      pro_reports_used_this_week = 0,
      pro_week_reset_at          = NOW()
`)
console.log(`Reset ${upd.rowCount} user(s) to free tier`)

// Show state after
const { rows: after } = await client.query(
  'SELECT email, subscription_status, reports_used_free, pro_reports_used_this_week FROM users'
)
console.log('\n── After ─────────────────────────────────')
for (const r of after) console.log(' ', r)

console.log('\nDone. All accounts reset to free, all reports deleted.')
await client.end()
