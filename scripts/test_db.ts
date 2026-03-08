import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
    console.log("Testing Profiles query...")
    const r1 = await supabase.from('profiles').select('*').limit(1)
    console.log(r1.error ? r1.error : "Profiles columns:", Object.keys(r1.data[0] || {}))

    console.log("\nTesting Support Tickets query...")
    const r2 = await supabase.from('support_tickets').select('*').limit(1)
    console.log(r2.error ? r2.error : "Ticket columns:", Object.keys(r2.data[0] || {}))

    console.log("\nTesting relationship...")
    const r3 = await supabase.from('support_tickets').select('*, profiles(*)').limit(1)
    console.log(r3.error ? r3.error : "Join success!")
}

testQuery()
