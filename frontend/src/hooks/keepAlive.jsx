import { useEffect } from "react";

export function keepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch(`${import.meta.env.VITE_API_URL}health/`).catch(() => {});
    };
    ping();
    const interval=setInterval(ping, 10*60*1000); //10mins
    return ()=>clearInterval(interval);
  },[]);
}
