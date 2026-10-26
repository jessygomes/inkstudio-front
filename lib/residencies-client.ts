import { residencyRequest as request } from "./queries/residencies";

export async function residencyRequest(...args: Parameters<typeof request>) {
  const result = await request(...args);
  if (result?.error) throw new Error(Array.isArray(result.message) ? result.message.join(" ") : result.message);
  return result;
}
