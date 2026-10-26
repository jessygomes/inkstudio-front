import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./UsersWorkspace.module.css";
export default function UsersPagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null;
  const visible = [...new Set([1, page - 1, page, page + 1, pages])].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);
  return <nav aria-label="Pagination des utilisateurs" className={styles.pagination}>
    <span>Page <strong>{page}</strong> sur {pages}</span>
    <div className={styles.paginationControls}>
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Page précédente"><ChevronLeft size={15} /></button>
      {visible.map((n, index) => <span key={n} className="inline-flex items-center gap-1">{index > 0 && n - visible[index - 1] > 1 && <span aria-hidden="true" className="px-1">…</span>}<button type="button" aria-label={`Page ${n}`} aria-current={n === page ? "page" : undefined} onClick={() => onChange(n)}>{n}</button></span>)}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Page suivante"><ChevronRight size={15} /></button>
    </div>
  </nav>;
}
