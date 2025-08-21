/* 
Convertit une valeur en objet, en essayant de parser les chaînes JSON.
- Si val est une chaîne JSON, elle la parse en objet.
- Si val est déjà un objet, elle le retourne tel quel.
- Sinon, elle retourne un objet vide du type demandé

Utilité :
Elle est utilisée pour manipuler facilement des champs qui peuvent être soit des objets, soit des chaînes JSON (par exemple, des champs details ou availability venant de la base de données ou d'une API).
*/

export const toObject = <T extends object>(val: unknown): T => {
  if (!val) return {} as T;
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return {} as T;
    }
  }
  if (typeof val === "object") return val as T;
  return {} as T;
};
