// api/upsert-laptop.js
// Serverless endpoint to upsert a laptop_request using SUPABASE_SERVICE_ROLE_KEY.
// Environment variables required:
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

export default async function handler(req, res) {
  const setCors = () => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '3600');
  };

  setCors();

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }

  // Expect Authorization: Bearer <user_access_token>
  const authHeader = (req.headers.authorization || '');
  const userToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!userToken) return res.status(401).json({ error: 'Missing user token' });

  try {
    // 1) Verify user token via Supabase auth endpoint
    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'apikey': SERVICE_ROLE_KEY,
      }
    });
    if (!userResp.ok) return res.status(401).json({ error: 'Invalid user token' });
    const userJson = await userResp.json();
    const uid = userJson?.id;
    if (!uid) return res.status(401).json({ error: 'Unable to verify user' });

    // 2) Check admins table using service_role key (bypass RLS)
    const adminCheck = await fetch(`${SUPABASE_URL}/rest/v1/admins?auth_uid=eq.${uid}&select=id`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Accept': 'application/json'
      }
    });
    if (!adminCheck.ok) {
      const txt = await adminCheck.text();
      return res.status(500).json({ error: 'Failed to check admin table', detail: txt });
    }
    const adminRows = await adminCheck.json();
    if (!Array.isArray(adminRows) || adminRows.length === 0) return res.status(403).json({ error: 'Not an admin' });

    // 3) Validate payload shape (basic)
    const payload = req.body;
    if (!payload || typeof payload !== 'object') return res.status(400).json({ error: 'Invalid payload' });

    // Map frontend keys to DB columns
    const keyMap = {
      id: 'id',
      destinationId: 'destination_id',
      customerName: 'customer_name',
      customerEmail: 'customer_email',
      customerPhone: 'customer_phone',
      laptopModel: 'laptop_model',
      laptopSerial: 'laptop_serial',
      powerRequirements: 'power_requirements',
      seatingPreference: 'seating_preference',
      notes: 'notes',
      createdAt: 'created_at'
    };

    const safePayload = {};
    for (const srcKey of Object.keys(payload)) {
      const normalized = keyMap[srcKey] || srcKey.toLowerCase();
      safePayload[normalized] = payload[srcKey];
    }

    // If id not provided, omit it (DB will generate identity)
    if ('id' in safePayload && (safePayload.id === null || safePayload.id === 0)) {
      delete safePayload.id;
    }

    // Ensure created_at not settable by client (let DB default) unless admin intentionally sets it
    if ('created_at' in safePayload && !safePayload.created_at) {
      delete safePayload.created_at;
    }

    // Basic length sanitization
    if (safePayload.customer_name && String(safePayload.customer_name).length > 255) safePayload.customer_name = String(safePayload.customer_name).slice(0, 255);
    if (safePayload.customer_email && String(safePayload.customer_email).length > 255) safePayload.customer_email = String(safePayload.customer_email).slice(0, 255);
    if (safePayload.customer_phone && String(safePayload.customer_phone).length > 64) safePayload.customer_phone = String(safePayload.customer_phone).slice(0, 64);

    // Use PostgREST upsert via on_conflict=id
    const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/laptop_requests?on_conflict=id`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify([safePayload])
    });

    if (!insertResp.ok) {
      const errText = await insertResp.text().catch(() => '<no body>');
      console.error('upsert-laptop: PostgREST insert failed', insertResp.status, errText);
      return res.status(insertResp.status || 500).json({ error: 'Upsert failed', status: insertResp.status, detail: errText });
    }

    let inserted;
    try {
      inserted = await insertResp.json();
    } catch (e) {
      console.error('upsert-laptop: failed to parse insert response json', e);
      return res.status(500).json({ error: 'Upsert succeeded but response parse failed' });
    }
    return res.status(200).json({ data: inserted[0] });

  } catch (err) {
    console.error('upsert-laptop error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
