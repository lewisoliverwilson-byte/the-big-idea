"""
Run via: python scripts/set_unlimited.py
Sets the lewis account to active/pro with reset counters.
"""
import sys, os

DATABASE_URL = "postgresql://bigidea_admin:BigIdea_Prod_2026xK9q@the-big-idea-db.c6faseyqm4h7.us-east-1.rds.amazonaws.com:5432/the_big_idea"

try:
    import psycopg2
except ImportError:
    os.system(f"{sys.executable} -m pip install psycopg2-binary -q")
    import psycopg2

conn = psycopg2.connect(DATABASE_URL)
cur  = conn.cursor()

cur.execute("""
    UPDATE users
    SET subscription_status      = 'active',
        reports_used_free        = 0,
        pro_reports_used_this_week = 0,
        pro_week_reset_at        = NOW()
    WHERE email ILIKE '%lewis%'
       OR email ILIKE '%googlemail%'
       OR email ILIKE '%gmail%'
""")

cur.execute("SELECT id, email, subscription_status, reports_used_free, pro_reports_used_this_week FROM users")
rows = cur.fetchall()
conn.commit()
conn.close()

print(f"Updated {cur.rowcount if cur.rowcount >= 0 else 'unknown'} row(s)\n")
print(f"{'Email':<45} {'Status':<12} {'FreeUsed':<10} {'ProUsed'}")
print("-" * 80)
for r in rows:
    print(f"{str(r[1]):<45} {str(r[2]):<12} {str(r[3]):<10} {r[4]}")
