export const toArray = (s) =>
  s.split(",").map((x) => x.trim()).filter(Boolean);

export const errMsg = (err) =>
  err.response?.data?.message || "Could not connect to the server";