import pg from 'pg'
const { Client } = pg

const DB = 'postgresql://bigidea_admin:BigIdea_Prod_2026xK9q@the-big-idea-db.c6faseyqm4h7.us-east-1.rds.amazonaws.com:5432/the_big_idea'

const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } })
await client.connect()

await client.query(`
  UPDATE users
  SET subscription_status        = 'active',
      reports_used_free          = 0,
      pro_reports_used_this_week = 0,
      pro_week_reset_at          = NOW()
  WHERE email ILIKE '%lewis%'
     OR email ILIKE '%googlemail%'
     OR email ILIKE '%gmail%'
`)

const { rows } = await client.query(
  `SELECT email, subscription_status, reports_used_free, pro_reports_used_this_week FROM users`
)

console.log('\nAll users:')
for (const r of rows) {
  console.log(`  ${r.email.padEnd(45)} ${r.subscription_status.padEnd(12)} free=${r.reports_used_free}  pro_used=${r.pro_reports_used_this_week}`)
}

await client.end()
console.log('\nDone.')
