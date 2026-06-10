export type ETFProviderResponse = {
  updated_at: string;
  total_inflow: number;
  total_outflow: number;
  total_net_flow: number;
};

export async function fetchETFData(): Promise<ETFProviderResponse> {
  try {
    const inflow = 100000000;
    const outflow = 60000000;

    return {
      updated_at: new Date().toISOString(),
      total_inflow: inflow,
      total_outflow: outflow,
      total_net_flow: inflow - outflow,
    };
  } catch (error) {
    console.error("ETF provider error:", error);

    return {
      updated_at: new Date().toISOString(),
      total_inflow: 0,
      total_outflow: 0,
      total_net_flow: 0,
    };
  }
}