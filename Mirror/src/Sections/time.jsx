import { useEffect, useState } from "react";

export function TimeSection({ initialTime }) {
  const [systemTime, setSystemTime] = useState(initialTime);

  useEffect(() => {
    // update every second
    const interval = setInterval(async () => {
      const result = await window.api.getSystemTime();
      setSystemTime(result);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!systemTime) return <div>Loading time...</div>;

  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{systemTime.time}</div>
      <div className="text-sm">{systemTime.date}</div>
    </div>
  );
}
