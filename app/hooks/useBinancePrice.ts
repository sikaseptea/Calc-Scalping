"use client";

import { useEffect, useRef, useState } from "react";

export function useBinancePrice(symbol: string) {
  const [price, setPrice] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@markPrice`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setPrice(Number(data.p));
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [symbol]);

  return price;
}