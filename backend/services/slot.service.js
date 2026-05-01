const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const convertToMinutes = (time) => {
  if (!TIME_PATTERN.test(time)) {
    throw new Error("Time must be in HH:mm format");
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const convertToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

export const generateSlots = (startTime, endTime, interval = 30) => {
  const slots = [];
  let current = convertToMinutes(startTime);
  const end = convertToMinutes(endTime);

  if (current >= end) {
    throw new Error("Start time must be before end time");
  }

  while (current < end) {
    slots.push({ time: convertToTime(current), isBooked: false });
    current += interval;
  }

  return slots;
};

export const formatWhatsAppPhone = (phone) => String(phone || "").replace(/\D/g, "");

export const buildWhatsAppUrl = ({ phone, name, city, date, time }) => {
  const formattedPhone = formatWhatsAppPhone(phone);
  const message = [
    "Appointment Request:",
    "",
    `Name: ${name}`,
    `City: ${city}`,
    `Date: ${date}`,
    `Time: ${time}`,
    "",
    "Slots are limited. Please confirm my appointment.",
  ].join("\n");

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};
