import { useEffect, useRef, useState } from "react";

export type AlarmType =
  | "PRICE_ABOVE"
  | "PRICE_BELOW"
  | "SUPPORT_TOUCH"
  | "RESISTANCE_TOUCH"
  | "BOS_CHANGE"
  | "CHOCH_CHANGE";

export type Alarm = {
  id: string;
  symbol: string;
  type: AlarmType;
  price?: number;
  active: boolean;
  acknowledged?: boolean;
  triggeredAt?: number;
};

const STORAGE_KEY = "terminal_alarms_v1";

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
  const lastRef = useRef<{
    bos?: string;
    choch?: string;
  }>({});

  // =========================
  // LOAD STORAGE
  // =========================
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        setAlarms(JSON.parse(raw));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // =========================
  // SAVE STORAGE
  // =========================
  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(alarms)
    );
  }, [alarms]);

  // =========================
  // ADD ALARM
  // =========================
  function addAlarm(
    data: Omit<Alarm, "id" | "active">
  ) {
    setAlarms((prev) => [
      ...prev,
      {
        ...data,
        id: crypto.randomUUID(),
        active: true,
        acknowledged: false,
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
              active: false,
              acknowledged: true,
            }
          : a
      )
    );
  }

  // =========================
  // DELETE ONE
  // =========================
  function removeAlarm(id: string) {
    setAlarms((prev) =>
      prev.filter((a) => a.id !== id)
    );
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
  // CHECK TRIGGER
  // =========================
  useEffect(() => {

    if (livePrice == null) return;

    let changed = false;

    setAlarms((prev) => {

      const updated = prev.map((alarm) => {

        // pair berbeda → skip
        if (alarm.symbol !== symbol) {
          return alarm;
        }

        // sudah mati → skip
        if (!alarm.active || alarm.acknowledged) {
          return alarm;
        }

        let triggered = false;

        // PRICE ABOVE
        if (
          alarm.type === "PRICE_ABOVE" &&
          typeof alarm.price === "number"
        ) {

          triggered =
            Number(livePrice.toFixed(2)) >=
            Number(alarm.price.toFixed(2));
        }

        // PRICE BELOW
        if (
          alarm.type === "PRICE_BELOW" &&
          typeof alarm.price === "number"
        ) {

          triggered =
            Number(livePrice.toFixed(2)) <=
            Number(alarm.price.toFixed(2));
        }

        // SUPPORT
        if (
          alarm.type === "SUPPORT_TOUCH" &&
          typeof context.support === "number"
        ) {

          triggered =
            livePrice <= context.support;
        }

        // RESISTANCE
        if (
          alarm.type === "RESISTANCE_TOUCH" &&
          typeof context.resistance === "number"
        ) {

          triggered =
            livePrice >= context.resistance;
        }

        // BOS
        if (alarm.type === "BOS_CHANGE") {

          const prevBos = lastRef.current.bos;
          const currentBos = context.bos;

          triggered =
            !!prevBos &&
            !!currentBos &&
            prevBos !== currentBos;
        }

        // CHOCH
        if (alarm.type === "CHOCH_CHANGE") {

          const prevChoch = lastRef.current.choch;
          const currentChoch = context.choch;

          triggered =
            !!prevChoch &&
            !!currentChoch &&
            prevChoch !== currentChoch;
        }

        if (!triggered) {
          return alarm;
        }

        changed = true;

        const updatedAlarm: Alarm = {
          ...alarm,
          active: false,
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

    lastRef.current = {
      bos: context.bos,
      choch: context.choch,
    };

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