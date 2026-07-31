export default async function handler(req, res) {
  const { date } = req.query;
  const key = process.env.FOOTBALLDATA_KEY;
  if (!key) return res.status(400).json({ error: "Missing API key" });

  try {
    const r = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${date}&dateTo=${date}`, {
      headers: { "X-Auth-Token": key },
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Fetch failed" });
  }
}
