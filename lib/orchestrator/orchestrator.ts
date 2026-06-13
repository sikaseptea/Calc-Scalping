// 1. HAPUS baris import { fetchETFData } dari "@/lib/orchestrator/orchestrator.ts"

// 2. Gunakan fungsi dummy lokal (Tanpa Database & Tanpa File Eksternal)
const fetchETFData = async () => []; 

export async function runETFJob() {
  try {
    // Memanggil fungsi dummy di atas
    const data = await fetchETFData();

    const result = { 
      status: 'skipped', 
      info: 'Database snapshot is disabled', 
      timestamp: new Date().toISOString() 
    };

    console.log("ETF snapshot status:", result);
  } catch (error) {
    console.error("Orchestrator Error:", error);
  }
}