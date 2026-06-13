// Tambahkan baris ini di paling atas file
import React, { useEffect, useState } from 'react'; 
import { getLatestSnapshot } from "@/lib/snapshot-engine/queries/getLatestSnapshot";

export default function ETFFlowCard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const snapshot: any = await getLatestSnapshot("ETF_FLOW");
        const payload = snapshot?.snapshots?.payload || null;

        if (payload) {
          setData(payload);
        } else {
          setData({
            totalNetFlow: 0,
            dailyChange: 0,
            status: "Offline Mode"
          });
        }
      } catch (error) {
        console.error("ETF Card Error:", error);
      }
    };
    loadData();
  }, []);

  // ... sisa kode UI komponen Anda
}