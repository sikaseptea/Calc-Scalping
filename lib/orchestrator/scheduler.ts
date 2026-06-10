import { runETFJob } from "./orchestrator";
import { runNewsJob } from "./jobs/newsJob";

export function startScheduler() {
  console.log("🚀 Orchestrator started...");

  setInterval(async () => {
    await runETFJob();
  }, 30000);

  setInterval(async () => {
    await runNewsJob();
  }, 45000);
}