/* eslint-disable react/no-unescaped-entities */
"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import {
  getSalonStockAction,
  updateStockQuantityAction,
  getStockCategoriesAction,
} from "@/lib/queries/stocks";
import { PaginationInfo, StockItemProps } from "@/lib/type";
import { useEffect, useState, useCallback } from "react";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";
import { FaDatabase } from "react-icons/fa";
import CreateOrUpdateItem from "./CreateOrUpdateItem";
import DeleteItemStock from "./DeleteItemStock";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "sonner";

export default function StockList() {
  const user = useUser();

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
      console.log("Catégories chargées:", categories);
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
              "Erreur lors de la récupération des articles de stock"
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
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        setItemsStock([]);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, searchTerm]
  );

  // Effet pour charger les clients au changement de page ou de recherche
  useEffect(() => {
    if (user.id) {
      fetchStockItems(currentPage, searchTerm);
    }
  }, [user.id, currentPage, fetchStockItems, searchTerm]);

  // Effet pour la recherche avec debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (user.id) {
        setCurrentPage(1); // Reset à la page 1 lors d'une nouvelle recherche
        fetchStockItems(1, searchTerm);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, user.id, fetchStockItems]);

  // Effet pour charger les catégories au démarrage
  useEffect(() => {
    if (user.id) {
      fetchCategories();
    }
  }, [user.id, fetchCategories]);

  //! Filtrage local par catégorie
  const filteredItems = categoryFilter
    ? itemsStock.filter((item) => item.category === categoryFilter)
    : itemsStock;

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
    increment: number
  ) => {
    const newQuantity = Math.max(0, item.quantity + increment);

    try {
      const result = await updateStockQuantityAction(item.id, newQuantity);

      if (result.ok) {
        // Mettre à jour l'item localement pour une réactivité immédiate
        setItemsStock((prevItems) =>
          prevItems.map((prevItem) =>
            prevItem.id === item.id
              ? { ...prevItem, quantity: newQuantity }
              : prevItem
          )
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

  return (
    <section className="w-full">
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="w-full flex items-center gap-3 sm:gap-4 mb-4 md:mb-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
            <FaDatabase
              size={20}
              className="sm:w-7 sm:h-7 text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
              Stocks
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              Gérez le stock de votre salon
            </p>
          </div>
        </div>

        {/* Boutons d'action responsive */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={handleCreate}
            className="cursor-pointer flex justify-center items-center gap-2 py-2 px-4 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Créer un nouvel item
          </button>
        </div>
      </div>

      {/* Liste des items de stock */}
      <div>
        {/* Barre de recherche et filtre par catégorie responsive */}
        <div className="flex flex-col sm:flex-row gap-2 items-center mb-4 sm:mb-6 mt-4 sm:mt-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par article"
            className="w-full text-sm text-white bg-white/10 placeholder:text-white/30 placeholder:text-xs py-2 sm:py-1 px-4 font-one border-[1px] rounded-lg border-white/20 focus:outline-none focus:border-tertiary-400 transition-colors"
          />

          {/* Filtre par catégorie */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 text-sm text-white bg-white/10 py-2 sm:py-1 px-4 font-one border-[1px] rounded-lg border-white/20 focus:outline-none focus:border-tertiary-400 transition-colors"
          >
            <option value="" className="text-black">
              Toutes les catégories
            </option>
            {categories.map((category) => (
              <option key={category} value={category} className="text-black">
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Informations de pagination responsive */}
        {!loading && !error && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div className="text-white/70 text-xs font-one">
              Affichage de {itemsStock.length > 0 ? 1 : 0} à{" "}
              {filteredItems.length} sur {itemsStock.length} article
              {itemsStock.length > 1 ? "s" : ""}
              {searchTerm && (
                <span className="block sm:inline sm:ml-2 text-tertiary-400 mt-1 sm:mt-0">
                  (recherche: "{searchTerm}")
                </span>
              )}
              {categoryFilter && (
                <span className="block sm:inline sm:ml-2 text-purple-400 mt-1 sm:mt-0">
                  (catégorie: "{categoryFilter}")
                </span>
              )}
            </div>
            <div className="text-white/70 text-xs font-one">
              Page {currentPage} sur {pagination.totalPages}
            </div>
          </div>
        )}

        {/* Header de tableau - masqué sur mobile */}
        <div className="hidden sm:grid grid-cols-6 gap-2 px-4 py-2 mb-2 bg-white/10 rounded-lg text-white font-one text-xs font-semibold tracking-widest">
          <p>Nom de l'article</p>
          <p>Catégorie</p>
          <p>Quantité</p>
          <p>Quantité min.</p>
          <p className="text-center">Actions</p>
          <p></p>
        </div>

        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-full rounded-2xl p-10 flex flex-col items-center justify-center gap-6 mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
              <p className="text-white/60 font-two text-xs text-center">
                Chargement des articles...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full w-full flex">
            <div className="mt-4 w-full rounded-2xl shadow-xl border border-white/10 p-6 sm:p-10 flex flex-col items-center justify-center gap-6 mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-tertiary-400"
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
              </div>
              <p className="text-white font-one text-lg sm:text-xl text-center">
                {error}
              </p>
              <button
                onClick={() => fetchStockItems(currentPage, searchTerm)}
                className="cursor-pointer mt-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-medium font-one text-xs shadow-lg transition-all"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-full w-full flex">
            <div className="w-full rounded-2xl shadow-xl border border-white/10 p-6 sm:p-10 flex flex-col items-center justify-center gap-6 mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-tertiary-400"
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
              </div>
              <p className="text-white/70 font-one text-base sm:text-lg text-center">
                {searchTerm || categoryFilter
                  ? "Aucun article trouvé"
                  : "Aucun article"}
              </p>
              <p className="text-white/50 text-sm font-one text-center">
                {searchTerm || categoryFilter
                  ? `Aucun article ne correspond aux critères${
                      searchTerm ? ` "${searchTerm}"` : ""
                    }${
                      categoryFilter
                        ? ` dans la catégorie "${categoryFilter}"`
                        : ""
                    }`
                  : "Commencez par ajouter votre premier article"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Liste des articles responsive */}
            <div className="space-y-2 mb-6">
              {filteredItems.map((item) => (
                <div key={item.id}>
                  {/* Vue desktop - grille */}
                  <div className="hidden lg:grid grid-cols-6 gap-2 px-4 py-3 items-center mb-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-tertiary-400/30 transition-all duration-300">
                    <p className="text-white font-one text-xs">{item.name}</p>
                    <p className="text-white font-one text-xs break-all">
                      {item.category || "Non renseignée"}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateQuantity(item, -1)}
                        disabled={item.quantity <= 0}
                        className="cursor-pointer w-5 h-5 flex items-center justify-center bg-white/10 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-xs transition-colors"
                        title="Diminuer la quantité"
                      >
                        −
                      </button>
                      <span className="text-white font-one text-xs min-w-[60px] text-center">
                        {item.quantity} {item.unit || "pièce(s)"}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item, 1)}
                        className="cursor-pointer w-5 h-5 flex items-center justify-center bg-white/10 hover:bg-green-500/20 rounded text-white text-xs transition-colors"
                        title="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-white font-one text-xs text-left">
                      {item.minQuantity
                        ? `${item.minQuantity} ${item.unit || "pièce(s)"}`
                        : "Non définie"}
                    </p>

                    <div className="flex gap-2 text-xs items-center justify-center">
                      <button
                        className="cursor-pointer text-black"
                        onClick={() => handleEdit(item)}
                        title="Modifier l'article"
                      >
                        <AiOutlineEdit
                          size={25}
                          className="p-1 text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-tertiary-400/50 transition-all duration-200"
                        />
                      </button>
                      <button
                        className="cursor-pointer text-black"
                        onClick={() => handleDelete(item)}
                        title="Supprimer l'article"
                      >
                        <AiOutlineDelete
                          size={25}
                          className="p-1 text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-tertiary-400/50 transition-all duration-200"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Vue mobile - format carte */}
                  <div className="lg:hidden bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 hover:border-tertiary-400/30 transition-all duration-300 mb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="text-white font-one font-semibold text-sm mb-1">
                          {item.name}
                        </h3>
                        <p className="text-white/80 font-one text-sm break-all mb-1">
                          Catégorie: {item.category || "Non renseignée"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 font-one text-sm">
                            Quantité:
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item, -1)}
                              disabled={item.quantity <= 0}
                              className="cursor-pointer w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-sm transition-colors"
                              title="Diminuer la quantité"
                            >
                              −
                            </button>
                            <span className="text-white/70 font-one text-sm min-w-[80px] text-center">
                              {item.quantity} {item.unit || "pièce(s)"}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item, 1)}
                              className="cursor-pointer w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-green-500/20 rounded text-white text-sm transition-colors"
                              title="Augmenter la quantité"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <p className="text-white/70 font-one text-sm mt-2">
                          Quantité min.:{" "}
                          {item.minQuantity
                            ? `${item.minQuantity} ${item.unit || "pièce(s)"}`
                            : "Non définie"}
                        </p>
                      </div>
                    </div>

                    {/* Actions mobiles - maintenant en bas avec plus d'espace */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                      <div className="flex gap-3">
                        <button
                          className="cursor-pointer p-2.5 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-tertiary-400/50 transition-all duration-200"
                          onClick={() => handleEdit(item)}
                          title="Modifier l'article"
                        >
                          <IoCreateOutline
                            size={20}
                            className="text-white hover:text-tertiary-400 duration-200"
                          />
                        </button>
                        <button
                          className="cursor-pointer p-2.5 bg-white/10 hover:bg-red-500/20 rounded-lg border border-white/20 hover:border-red-400/50 transition-all duration-200"
                          onClick={() => handleDelete(item)}
                          title="Supprimer l'article"
                        >
                          <AiOutlineDelete
                            size={20}
                            className="text-white hover:text-tertiary-400 duration-200"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination responsive */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 py-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPreviousPage}
                  className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs w-full sm:w-auto"
                >
                  Précédent
                </button>

                <div className="flex items-center gap-1 sm:gap-2 order-first sm:order-none">
                  {Array.from(
                    {
                      length: Math.min(
                        pagination.totalPages,
                        typeof window !== "undefined" && window.innerWidth < 640
                          ? 3
                          : 5
                      ),
                    },
                    (_, i) => {
                      const maxButtons =
                        typeof window !== "undefined" && window.innerWidth < 640
                          ? 3
                          : 5;
                      let pageNumber;
                      if (pagination.totalPages <= maxButtons) {
                        pageNumber = i + 1;
                      } else if (
                        currentPage <=
                        Math.floor(maxButtons / 2) + 1
                      ) {
                        pageNumber = i + 1;
                      } else if (
                        currentPage >=
                        pagination.totalPages - Math.floor(maxButtons / 2)
                      ) {
                        pageNumber = pagination.totalPages - maxButtons + 1 + i;
                      } else {
                        pageNumber =
                          currentPage - Math.floor(maxButtons / 2) + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`cursor-pointer w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-xs font-medium transition-all duration-200 font-one ${
                            currentPage === pageNumber
                              ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs w-full sm:w-auto"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <CreateOrUpdateItem
          userId={user.id ?? ""}
          onCreate={() => {
            fetchStockItems();
            setIsModalOpen(false);
          }}
          setIsOpen={setIsModalOpen}
          existingProduct={selectedItem ?? undefined}
        />
      )}

      {isModalDeleteOpen && (
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
