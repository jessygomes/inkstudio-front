export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  const compact = phone.trim().replace(/[\s().-]/g, "");
  if (!/^\+?\d+$/.test(compact)) return phone;
  const international = compact.match(/^(\+33|0033)(\d)(\d{8})$/);
  if (international) {
    const [, prefix, first, rest] = international;
    return `${prefix} ${first} ${rest.match(/\d{2}/g)!.join(" ")}`;
  }
  return compact.replace(/(\d{2})(?=\d)/g, "$1 ");
}
