export const todayKey = () => new Date().toISOString().slice(0, 10);

export const addDays = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const formatDate = (dateKey: string) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export const formatLongDate = (dateKey: string) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const toTwelveHour = (time: string) => {
  const [rawHours, minutes] = time.split(":").map(Number);
  const suffix = rawHours >= 12 ? "PM" : "AM";
  const hours = rawHours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${suffix}`;
};
