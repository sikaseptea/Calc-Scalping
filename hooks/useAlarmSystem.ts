import { useEffect, useRef, useState } from "react";

export type AlarmType =
  | "PRICE_ABOVE"
  | "PRICE_BELOW"
  | "SUPPORT_TOUCH"
  | "RESISTANCE_TOUCH"
  | "BOS_CHANGE"
  | "CHOCH_CHANGE";

export type AlarmStatus = "ACTIVE" | "TRIGGERED" | "ACKED";

export type Alarm = {
  id: string;
  symbol: string;
  type: AlarmType;
  price?: number;

  status: AlarmStatus;

  triggeredAt?: number;
  acknowledgedAt?: number;
};

const STORAGE_KEY = "terminal_alarms_v2";

export function useAlarmSystem(
  livePrice: number,
  symbol: string,
  context: {
    bos?: string;
    choch?: string;
    support?: number;
    resistance?: number;
  },
  onTrigger?: (alarm: Alarm & { livePrice: number }) => void
) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // =========================
  // PER SYMBOL STATE TRACKING
  // =========================
  const lastRef = useRef<
    Record<string, { bos?: string; choch?: string }>
  >({});

  const prevPriceRef = useRef<Record<string, number | null>>({});

  // =========================
  // LOAD
  // =========================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setAlarms(JSON.parse(raw));
      } catch (e) {
        console.error("Alarm load error:", e);
      }
    }
  }, []);

  // =========================
  // SAVE
  // =========================
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  }, [alarms]);

  // =========================
  // RESET PRICE TRACK ON SYMBOL SWITCH
  // =========================
  useEffect(() => {
    prevPriceRef.current[symbol] = null;
  }, [symbol]);

  // =========================
  // ADD ALARM
  // =========================
  function addAlarm(data: Omit<Alarm, "id" | "status">) {
    setAlarms((prev) => [
      ...prev,
      {
        ...data,
        id: crypto.randomUUID(),
        status: "ACTIVE",
      },
    ]);
  }

  // =========================
  // ACKNOWLEDGE
  // =========================
  function acknowledgeAlarm(id: string) {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "ACKED",
              acknowledgedAt: Date.now(),
            }
          : a
      )
    );
  }

  // =========================
  // REMOVE
  // =========================
  function removeAlarm(id: string) {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }

  // =========================
  // CLEAR ALL
  // =========================
  function clearAllAlarms() {
    setAlarms([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // =========================
  // ENGINE (PRODUCTION SAFE)
  // =========================
  useEffect(() => {
    if (livePrice == null || !symbol) return;

    const last = lastRef.current[symbol] ?? {};
    const prevPrice = prevPriceRef.current[symbol];

    setAlarms((prev) => {
      let changed = false;

      const updated = prev.map((alarm) => {
        if (alarm.symbol !== symbol) return alarm;
        if (alarm.status !== "ACTIVE") return alarm;

        let triggered = false;

        // =========================
        // PRICE ABOVE (EDGE)
        // =========================
        if (alarm.type === "PRICE_ABOVE" && alarm.price != null) {
          triggered =
            prevPrice != null &&
            prevPrice < alarm.price &&
            livePrice >= alarm.price;
        }

        // =========================
        // PRICE BELOW (EDGE)
        // =========================
        if (alarm.type === "PRICE_BELOW" && alarm.price != null) {
          triggered =
            prevPrice != null &&
            prevPrice > alarm.price &&
            livePrice <= alarm.price;
        }

        // =========================
        // SUPPORT
        // =========================
        if (
          alarm.type === "SUPPORT_TOUCH" &&
          context.support != null
        ) {
          triggered = livePrice <= context.support;
        }

        // =========================
        // RESISTANCE
        // =========================
        if (
          alarm.type === "RESISTANCE_TOUCH" &&
          context.resistance != null
        ) {
          triggered = livePrice >= context.resistance;
        }

        // =========================
        // BOS
        // =========================
        if (alarm.type === "BOS_CHANGE") {
          triggered =
            !!last.bos &&
            !!context.bos &&
            last.bos !== context.bos;
        }

        // =========================
        // CHOCH
        // =========================
        if (alarm.type === "CHOCH_CHANGE") {
          triggered =
            !!last.choch &&
            !!context.choch &&
            last.choch !== context.choch;
        }

        if (!triggered) return alarm;

        changed = true;

        const updatedAlarm: Alarm = {
          ...alarm,
          status: "TRIGGERED",
          triggeredAt: Date.now(),
        };

        onTrigger?.({
          ...updatedAlarm,
          livePrice,
        });

        return updatedAlarm;
      });

      return changed ? updated : prev;
    });

    // =========================
    // UPDATE TRACKERS
    // =========================
    lastRef.current[symbol] = {
      bos: context.bos,
      choch: context.choch,
    };

    prevPriceRef.current[symbol] = livePrice;
  }, [
    livePrice,
    symbol,
    context.bos,
    context.choch,
    context.support,
    context.resistance,
  ]);

  return {
    alarms,
    addAlarm,
    acknowledgeAlarm,
    removeAlarm,
    clearAllAlarms,
  };
}