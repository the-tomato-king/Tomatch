export const formatRecordDateTime = (dateValue: any): string => {
  let date: Date;

  if (dateValue && typeof dateValue.toDate === "function") {
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === "string") {
    date = new Date(dateValue);
  } else {
    console.warn("Unexpected date format:", dateValue);
    return "Invalid date";
  }

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${formattedDate} at ${formattedTime}`;
};
