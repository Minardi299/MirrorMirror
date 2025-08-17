import { useEffect, useState } from "react";

const CACHE_KEY = "userTimezoneData";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week in ms

// Config constants
const USE_24_HOUR = false; // set false for AM/PM
const USE_US_DATE = false;  // true = MM/DD/YYYY, false = DD/MM/YYYY

export function TimeSection() {
  const [time, setTime] = useState(null);
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    const fetchTimezone = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_TTL) {
          setTimezone(data.timezone);
          setTime(new Date(new Date().toLocaleString("en-US", { timeZone: data.timezone })));
          return;
        }
      }

      try {
        const res = await fetch("https://worldtimeapi.org/api/ip");
        const data = await res.json();
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timezone: data.timezone, timestamp: Date.now() }));
        setTimezone(data.timezone);
        setTime(new Date(new Date().toLocaleString("en-US", { timeZone: data.timezone })));
      } catch (err) {
        console.error("Failed to fetch timezone", err);
      }
    };

    fetchTimezone();
  }, []);

  useEffect(() => {
    if (!timezone) return;
    const interval = setInterval(() => {
      setTime(new Date(new Date().toLocaleString("en-US", { timeZone: timezone })));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  if (!time) return <div>Loading time...</div>;

  return (
    <div className="text-center">
      <div className="text-2xl font-bold">
        {time.toLocaleTimeString([], { hour12: !USE_24_HOUR })}
      </div>
      <div className="text-sm">
        {time.toLocaleDateString(USE_US_DATE ? "en-US" : "en-GB")}
      </div>
      <div className="text-xs text-gray-500">{timezone}</div>
    </div>
  );
}
