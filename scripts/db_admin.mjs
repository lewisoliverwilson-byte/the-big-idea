import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://bigidea_admin:BigIdea_Prod_2026xK9q@the-big-idea-db.c6faseyqm4h7.us-east-1.rds.amazonaws.com:5432/the_big_idea',
  ssl: { rejectUnauthorized: false }
})

await client.connect()

const { rows: before } = await client.query('SELECT id, email, subscription_status, reports_used_free FROM users')
console.log('Users before update:')
for (const r of before) console.log(' ', r)

const res = await client.query(`
  UPDATE users
  SET subscription_status        = 'active',
      reports_used_free          = 0,
      pro_reports_used_this_week = 0,
      pro_week_reset_at          = NOW()
`)
console.log(`\nUpdated ${res.rowCount} row(s)`)

const { rows: after } = await client.query('SELECT email, subscription_status, reports_used_free, pro_reports_used_this_week FROM users')
console.log('\nUsers after update:')
for (const r of after) console.log(' ', r)

await client.end()
