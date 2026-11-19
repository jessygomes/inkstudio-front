// Démarrage du serveur Next.js : les pannes réseau vers le backend produisent un message compréhensible.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { installFriendlyServerFetch } = await import("./lib/action-error");
  installFriendlyServerFetch();
}
