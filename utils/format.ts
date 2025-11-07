const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const parseMetadata = (
  meta: Record<string, unknown>
): Record<string, unknown> => {
  // If meta is a string, try to parse it
  if (typeof meta === "string") {
    try {
      return JSON.parse(meta);
    } catch {
      return { raw: meta };
    }
  }
  return meta;
};

const getDeviceInfo = (meta: Record<string, unknown>): string | null => {
  const parsed = parseMetadata(meta);

  let device = parsed.device;
  // Backward compatibility: if structure is flat, fallback
  if (typeof device !== "object" || device === null) {
    device = parsed;
  }

  // Safely narrow the type of device to an object
  const deviceObj =
    device && typeof device === "object" && device !== null
      ? (device as Record<string, any>)
      : {};

  const deviceName = deviceObj.deviceName || deviceObj.deviceModel;
  const deviceOs = deviceObj.deviceOs;
  const deviceOsVersion = deviceObj.deviceOsVersion;

  // Safely narrow the type of user to an object with a possibly existing 'email'
  const user =
    parsed && typeof parsed === "object" && parsed !== null && "user" in parsed
      ? (parsed as Record<string, any>).user
      : undefined;
  const userEmail =
    user && typeof user === "object" && user !== null && "email" in user
      ? user.email
      : undefined;

  const parts: string[] = [];

  if (userEmail) {
    parts.push(`User: ${userEmail}`);
  }

  if (deviceName) {
    parts.push(deviceName);
  }

  if (deviceOs && deviceOsVersion) {
    parts.push(`${deviceOs} ${deviceOsVersion}`);
  } else if (deviceOs) {
    parts.push(deviceOs);
  }

  return parts.length > 0 ? parts.join(" • ") : null;
};

const truncateText = (text: string, maxLength: number): string => {
  if (typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  if (maxLength <= 3) return "...".slice(0, maxLength);
  return text.slice(0, maxLength - 3) + "...";
};

export { formatDate, parseMetadata, getDeviceInfo, truncateText };
