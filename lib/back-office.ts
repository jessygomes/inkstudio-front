// Keep in sync with the backend's src/config/back-office.ts.
export const BACK_OFFICE_PATH = "/bo-1d19161a0c34978a5a82009b634baadf";

export function isBackOfficePath(pathname: string): boolean {
  return pathname === BACK_OFFICE_PATH || pathname.startsWith(BACK_OFFICE_PATH + "/");
}
