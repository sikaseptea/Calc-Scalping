export function startETFIngestCron() {
  // jalan sekali saat server start
  console.log("🟢 ETF Cron Started (LOCAL MODE)");

  setInterval(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/sikasep/etf-ingest");
      const json = await res.json();

      console.log("ETF CRON:", json);
    } catch (err) {
      console.error("ETF CRON ERROR:", err);
    }
  }, 24 * 60 * 60 * 1000); // 24 jam
}