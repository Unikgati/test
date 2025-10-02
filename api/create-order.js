// Archived endpoint: orders creation moved/disabled on 2025-10-02
export default async function handler(req, res) {
  res.setHeader('Allow', 'POST');
  return res.status(410).json({ error: 'Endpoint archived: create-order is disabled.' });
}
