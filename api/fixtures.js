export default async function handler(req, res) {
  const { date } = req.query;
  const key = process.env.APIFOOTBALL_KEY;
  if (!key) return res.status(400).json({ error: "Missing API key" });

  try {
    const r = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
      headers: { "x-apisports-key": key },
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Fetch failed" });
  }
}
