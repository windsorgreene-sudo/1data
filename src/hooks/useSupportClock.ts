import { useEffect, useState } from "react";

const ZONE = "America/Vancouver";

const read = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  const minutes = hour * 60 + minute;
  let open = false;
  if (["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday)) open = minutes >= 9 * 60 && minutes < 18 * 60;
  else if (weekday === "Sat") open = minutes >= 10 * 60 && minutes < 16 * 60;
  return {
    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    zone: get("timeZoneName") || "PT",
    open,
  };
};

export const useSupportClock = () => {
  const [state, setState] = useState(read);
  useEffect(() => {
    const id = window.setInterval(() => setState(read()), 20000);
    return () => window.clearInterval(id);
  }, []);
  return state;
};
