"use client";
import { useSession } from "next-auth/react";
import {
  getSalonStockAction,
  updateStockQuantityAction,
  getStockCategoriesAction,
} from "@/lib/queries/stocks";
import { PaginationInfo, StockItemProps } from "@/lib/type";
import { useEffect, useState, useCallback } from "react";
// import { AiOutlineEdit } from "react-icons/ai";
import { FaDatabase } from "react-icons/fa";
import CreateOrUpdateItem from "./CreateOrUpdateItem";
import DeleteItemStock from "./DeleteItemStock";
import StockTable from "./StockTable";
import PageHeader from "@/components/Shared/PageHeader";
import DashboardButton from "@/components/Shared/DashboardButton";
import { toast } from "sonner";
import LockedFeatureCard from "@/components/Shared/LockedFeatureCard";

export default function StockList() {
  const { data: session } = useSession();

  // Vérifier si l'utilisateur a un plan Free
  const isFreeAccount = session?.user?.saasPlan === "FREE";

  const [loading, setLoading] = useState(true);

  //! State
  const [itemsStock, setItemsStock] = useState<StockItemProps[]>([]);
  const [selectedItem, setSelectedItem] = useState<StockItemProps | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalClients: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [error, setError] = useState<string | null>(null);

  //! Pagination
  const [currentPage, setCurrentPage] = useState(1);

  //! Filtre
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  //! Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  //! Récupère les catégories
  const fetchCategories = useCallback(async () => {
    try {
      const categories = await getStockCategoriesAction();
      setCategories(categories);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  }, []);

  //! Récupère le stock avec pagination
  const fetchStockItems = useCallback(
    async (page: number = currentPage, search: string = searchTerm) => {
      try {
        setLoading(true);
        setError(null);

        const data = await getSalonStockAction(page, search);

        if (data.error) {
          throw new Error(
            data.message ||
              "Erreur lors de la récupération des articles de stock",
          );
        }

        if (Array.isArray(data.stockItems)) {
          setItemsStock(data.stockItems);
          if (data.pagination) {
            setPagination(data.pagination);
          }
        } else {
          console.error("Les données reçues ne sont pas un tableau:", data);
          setItemsStock([]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des articles de stock :", err);
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
        setItemsStock([]);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, searchTerm],
  );

  // Effet pour charger les clients au changement de page ou de recherche
  useEffect(() => {
    if (session?.user?.id) {
      fetchStockItems(currentPage, searchTerm);
    }
  }, [session?.user?.id, currentPage, fetchStockItems, searchTerm]);

  // Effet pour la recherche avec debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (session?.user?.id) {
        setCurrentPage(1); // Reset à la page 1 lors d'une nouvelle recherche
        fetchStockItems(1, searchTerm);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, session?.user?.id, fetchStockItems]);

  // Effet pour charger les catégories au démarrage
  useEffect(() => {
    if (session?.user?.id) {
      fetchCategories();
    }
  }, [session?.user?.id, fetchCategories]);


  //! Tri par type
  const [sortByType, setSortByType] = useState<null | 'asc' | 'desc'>(null);

  // Filtrage local par catégorie
  let filteredItems = categoryFilter
    ? itemsStock.filter((item) => item.category === categoryFilter)
    : itemsStock;

  // Tri par type si activé
  if (sortByType) {
    filteredItems = [...filteredItems].sort((a, b) => {
      const typeA = a.type?.toLowerCase() || '';
      const typeB = b.type?.toLowerCase() || '';
      if (typeA < typeB) return sortByType === 'asc' ? -1 : 1;
      if (typeA > typeB) return sortByType === 'asc' ? 1 : -1;
      return 0;
    });
  }

  //! Calcul des statistiques
  const statistics = {
    totalItems: itemsStock.length,
    totalValue: itemsStock.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0,
    ),
    lowStockItems: itemsStock.filter(
      (item) => item.minQuantity && item.quantity <= item.minQuantity,
    ).length,
    outOfStockItems: itemsStock.filter((item) => item.quantity === 0).length,
    totalCategories: new Set(
      itemsStock.map((item) => item.category).filter(Boolean),
    ).size,
    averageValue:
      itemsStock.length > 0
        ? itemsStock.reduce((sum, item) => sum + (item.totalPrice || 0), 0) /
          itemsStock.length
        : 0,
  };

  //! Fonctions de gestion
  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: StockItemProps) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: StockItemProps) => {
    setSelectedItem(item);
    setIsModalDeleteOpen(true);
  };

  //! Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  //! Fonction pour modifier rapidement la quantité
  const handleUpdateQuantity = async (
    item: StockItemProps,
    increment: number,
  ) => {
    const newQuantity = Math.max(0, item.quantity + increment);

    try {
      const result = await updateStockQuantityAction(item.id, newQuantity);

      if (result.ok) {
        // Mettre à jour l'item localement pour une réactivité immédiate
        setItemsStock((prevItems) =>
          prevItems.map((prevItem) =>
            prevItem.id === item.id
              ? {
                  ...prevItem,
                  quantity: newQuantity,
                  totalPrice: prevItem.pricePerUnit
                    ? prevItem.pricePerUnit * newQuantity
                    : 0,
                }
              : prevItem,
          ),
        );
      } else {
        console.error("Erreur lors de la mise à jour de la quantité");
        // Optionnel : afficher une notification d'erreur
        toast.error("Erreur lors de la mise à jour de la quantité");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité:", error);
    }
  };

  const maxButtons = 5;
  const pageButtons = Array.from(
    { length: Math.min(pagination.totalPages, maxButtons) },
    (_, index) => {
      if (pagination.totalPages <= maxButtons) {
        return index + 1;
      }

      if (currentPage <= Math.floor(maxButtons / 2) + 1) {
        return index + 1;
      }

      if (currentPage >= pagination.totalPages - Math.floor(maxButtons / 2)) {
        return pagination.totalPages - maxButtons + 1 + index;
      }

      return currentPage - Math.floor(maxButtons / 2) + index;
    },
  );

  return (
    <section className="w-full space-y-3">
      <PageHeader
        icon={<FaDatabase size={15} className="text-tertiary-400" />}
        title="Stocks"
      >
        {!isFreeAccount && (
          <DashboardButton onClick={handleCreate}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvel article
          </DashboardButton>
        )}
      </PageHeader>

      {!isFreeAccount && !loading && !error && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          <div className="border-white/10 border-1 rounded-2xl p-2.5 lg:p-2">
            <div className="dashboard-stat-inner">
              <p className="dashboard-soft-label text-[10px] leading-none">Articles</p>
              <p className="mt-1 text-base font-semibold text-white font-one lg:text-[17px]">{statistics.totalItems}</p>
            </div>
          </div>
          <div className="border-white/10 border-1 rounded-2xl p-2.5 lg:p-2">
            <div className="dashboard-stat-inner">
              <p className="dashboard-soft-label text-[10px] leading-none">Valeur totale</p>
              <p className="mt-1 text-base font-semibold text-white font-one lg:text-[17px]">{statistics.totalValue.toFixed(2)} €</p>
            </div>
          </div>
          <div className="border-white/10 border-1 rounded-2xl p-2.5 lg:p-2">
            <div className="dashboard-stat-inner">
              <p className="dashboard-soft-label text-[10px] leading-none">Stock bas</p>
              <p className="mt-1 text-base font-semibold text-amber-300 font-one lg:text-[17px]">{statistics.lowStockItems}</p>
            </div>
          </div>
          <div className="border-white/10 border-1 rounded-2xl p-2.5 lg:p-2">
            <div className="dashboard-stat-inner">
              <p className="dashboard-soft-label text-[10px] leading-none">Ruptures</p>
              <p className="mt-1 text-base font-semibold text-red-300 font-one lg:text-[17px]">{statistics.outOfStockItems}</p>
            </div>
          </div>
          <div className="border-white/10 border-1 rounded-2xl p-2.5 lg:p-2">
            <div className="dashboard-stat-inner">
              <p className="dashboard-soft-label text-[10px] leading-none">Catégories</p>
              <p className="mt-1 text-base font-semibold text-white font-one lg:text-[17px]">{statistics.totalCategories}</p>
            </div>
          </div>
          <div className="border-white/10 border-1 rounded-2xl p-2.5 lg:p-2">
            <div className="dashboard-stat-inner">
              <p className="dashboard-soft-label text-[10px] leading-none">Valeur moyenne</p>
              <p className="mt-1 text-base font-semibold text-white font-one lg:text-[17px]">{statistics.averageValue.toFixed(2)} €</p>
            </div>
          </div>
        </div>
      )}

      {isFreeAccount ? (
        <LockedFeatureCard
          className="dashboard-panel p-6 lg:p-8"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
          title="Gestion des stocks disponible avec un abonnement"
          description="Accédez à la gestion complète de votre stock : suivi des quantités, alertes de rupture, catégorisation et historique des mouvements."
          features={[
            "Inventaire complet",
            "Alertes de rupture",
            "Suivi des quantités",
            "Catégorisation",
            "Historique des mouvements",
            "Recherche et filtres",
          ]}
          primaryLabel="Passer à PRO"
        />
      ) : (
        <div className=" space-y-3">
          <div className="">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-xl">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un article"
                  className="w-full rounded-xl border border-white/15 bg-white/8 py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-400/20 font-one"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs text-white focus:border-tertiary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-400/20 font-one sm:w-56"
              >
                <option value="" className="text-black">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="text-black">
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!loading && !error && (
            <div className="flex flex-col gap-2 text-xs text-white/65 font-one sm:flex-row sm:items-center sm:justify-between">
              <p>
                {filteredItems.length} article{filteredItems.length > 1 ? "s" : ""} visible{filteredItems.length > 1 ? "s" : ""}
                {searchTerm ? ` · recherche "${searchTerm}"` : ""}
                {categoryFilter ? ` · catégorie "${categoryFilter}"` : ""}
              </p>
              <p>Page {currentPage} sur {pagination.totalPages}</p>
            </div>
          )}

          {loading ? (
            <div className="space-y-2.5">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="dashboard-list-item animate-pulse p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-40 rounded-lg bg-white/10" />
                      <div className="h-3 w-28 rounded-lg bg-white/10" />
                    </div>
                    <div className="hidden h-8 w-28 rounded-xl bg-white/10 sm:block" />
                    <div className="h-8 w-18 rounded-xl bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="dashboard-empty-state p-6">
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-one font-semibold mb-2">Erreur de chargement</h3>
                <p className="text-red-400 mb-4 text-sm">{error}</p>
                <button
                  onClick={() => fetchStockItems(currentPage, searchTerm)}
                  className="rdv-btn-primary cursor-pointer px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white rounded-lg hover:from-tertiary-500 hover:to-tertiary-600 transition-colors text-sm font-medium"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="dashboard-empty-state p-6">
              <div className="text-center py-10">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/8 bg-white/5">
                  <svg className="w-7 h-7 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-white/72 font-one text-base">
                  {searchTerm || categoryFilter ? "Aucun article trouvé" : "Aucun article"}
                </p>
                <p className="mt-1 text-white/45 text-sm font-one">
                  {searchTerm || categoryFilter
                    ? `Aucun article ne correspond aux filtres appliqués.`
                    : "Commencez par créer votre premier article de stock."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <StockTable
                items={filteredItems}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateQuantity={handleUpdateQuantity}
                sortByType={sortByType}
                setSortByType={setSortByType}
              />

              {pagination.totalPages > 1 && (
                <div className="flex flex-col items-center justify-center gap-3 pt-1 sm:flex-row">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!pagination.hasPreviousPage}
                    className="dashboard-nav-button w-full sm:w-auto sm:px-3 sm:py-1.5 sm:h-auto sm:rounded-xl sm:border sm:border-white/12 sm:bg-white/6 sm:text-[11px] sm:text-white sm:font-one disabled:opacity-45"
                  >
                    Précédent
                  </button>
                  <div className="flex items-center gap-2">
                    {pageButtons.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`cursor-pointer h-7 w-7 rounded-xl text-[11px] font-medium transition-all duration-200 font-one ${
                          currentPage === pageNumber
                            ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.hasNextPage}
                    className="dashboard-nav-button w-full sm:w-auto sm:px-3 sm:py-1.5 sm:h-auto sm:rounded-xl sm:border sm:border-white/12 sm:bg-white/6 sm:text-[11px] sm:text-white sm:font-one disabled:opacity-45"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!isFreeAccount && isModalOpen && (
        <CreateOrUpdateItem
          userId={session?.user?.id ?? ""}
          onCreate={() => {
            fetchStockItems();
            setIsModalOpen(false);
          }}
          setIsOpen={setIsModalOpen}
          existingProduct={selectedItem ?? undefined}
        />
      )}

      {!isFreeAccount && isModalDeleteOpen && (
        <DeleteItemStock
          onDelete={() => {
            fetchStockItems();
            setIsModalDeleteOpen(false);
          }}
          setIsOpen={setIsModalDeleteOpen}
          item={selectedItem ?? undefined}
        />
      )}
    </section>
  );
}
