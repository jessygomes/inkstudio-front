"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ProductSalonProps } from "@/lib/type";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { MdOutlineSell } from "react-icons/md";
import Image from "next/image";
import CreateOrUpdateProduct from "./CreateOrUpdateProduct";
import DeleteProduct from "./DeleteProduct";
import PageHeader from "@/components/Shared/PageHeader";
import DashboardButton from "@/components/Shared/DashboardButton";
import { getProductsAction } from "@/lib/queries/productSalon";

export default function ProductList() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  //! State
  const [products, setProducts] = useState<ProductSalonProps[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSalonProps | null>(null);

  //! Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  //! Récupère les produits (paginé)
  const fetchProducts = useCallback(
    async (page: number = 1, reset: boolean = true) => {
      if (!session?.user?.id) {
        setProducts([]);
        setHasNextPage(false);
        setCurrentPage(1);
        setLoading(false);
        return;
      }

      try {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const result = await getProductsAction(session.user.id, page);

        if (!result.ok || !result.data) {
          if (reset) {
            setProducts([]);
            setHasNextPage(false);
            setCurrentPage(1);
          }
          return;
        }

        const nextProducts = result.data.products as ProductSalonProps[];
        if (reset) {
          setProducts(nextProducts);
        } else {
          setProducts((prev) => [...prev, ...nextProducts]);
        }

        setHasNextPage(result.data.pagination.hasNextPage);
        setCurrentPage(result.data.pagination.page);
      } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
        if (reset) {
          setProducts([]);
          setHasNextPage(false);
          setCurrentPage(1);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [session?.user?.id],
  );

  useEffect(() => {
    if (session?.user?.id) {
      fetchProducts(1, true);
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, fetchProducts]);

  useEffect(() => {
    if (!loadMoreRef.current || loading || loadingMore || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !loadingMore) {
          fetchProducts(currentPage + 1, false);
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [currentPage, fetchProducts, hasNextPage, loading, loadingMore]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: ProductSalonProps) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: ProductSalonProps) => {
    setSelectedProduct(product);
    setIsModalDeleteOpen(true);
  };

  return (
    <section className="w-full space-y-3">
      <PageHeader
        icon={<MdOutlineSell size={15} className="text-tertiary-400" />}
        title="Produits"
      >
        <DashboardButton onClick={handleCreate}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau produit
        </DashboardButton>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg sm:rounded-2xl"
            >
              <div className="aspect-square relative overflow-hidden bg-white/10 animate-pulse"></div>

              <div className="space-y-2.5 p-3 sm:p-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-4 bg-white/10 rounded-lg flex-1 animate-pulse"></div>
                    <div className="h-6 bg-white/10 rounded-full w-16 animate-pulse"></div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2 space-y-2">
                  <div className="h-3 bg-white/10 rounded-lg w-full animate-pulse"></div>
                  <div className="h-3 bg-white/10 rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-white/10 rounded-lg w-1/2 animate-pulse"></div>
                </div>

                <div className="flex gap-2 justify-end pt-2 lg:hidden">
                  <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse"></div>
                  <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="h-full w-full flex">
          <div className="dashboard-empty-state mx-auto flex w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 p-6 sm:p-8">
            <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 sm:h-16 sm:w-16">
              <MdOutlineSell
                size={28}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <h2 className="text-center text-lg text-white font-one sm:text-xl">
              Aucun produit dans votre boutique
            </h2>
            <p className="text-center text-xs text-white/60 font-two">
              Ajoutez vos produits pour montrer aux clients ce que vous proposez
              !
            </p>
            <button
              onClick={handleCreate}
              className="cursor-pointer mt-1 rounded-2xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-5 py-2 text-xs font-medium text-white shadow-lg transition-all hover:from-tertiary-500 hover:to-tertiary-600 font-one"
            >
              Ajouter un produit
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-noir-500/10 to-noir-500/5 shadow-xl transition-all duration-300 hover:border-tertiary-400/50 hover:shadow-2xl backdrop-blur-lg sm:rounded-2xl"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  width={500}
                  height={500}
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden xl:flex items-center justify-center">
                  <div className="flex gap-3">
                    <button
                      className="cursor-pointer p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200"
                      onClick={() => handleEdit(product)}
                    >
                      <IoCreateOutline
                        size={20}
                        className="text-white hover:text-tertiary-400 transition-colors"
                      />
                    </button>
                    <button
                      className="cursor-pointer p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-red-500/30 transition-all duration-200"
                      onClick={() => handleDelete(product)}
                    >
                      <AiOutlineDelete
                        size={20}
                        className="text-white hover:text-red-400 transition-colors"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 p-3 sm:p-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="flex-1 truncate text-[13px] font-bold tracking-wide text-white font-one sm:text-sm">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-tertiary-500/30 bg-tertiary-500/20 px-1.5 py-0.5 text-[10px] font-medium text-tertiary-400 font-one">
                        {product.price}€
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2">
                  <p className="line-clamp-3 text-[11px] leading-relaxed text-white/70 font-one sm:text-xs">
                    {product.description}
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-2 xl:hidden">
                  <button
                    className="cursor-pointer rounded-lg bg-white/10 p-1.5 transition-all duration-200 hover:bg-white/20"
                    onClick={() => handleEdit(product)}
                  >
                    <IoCreateOutline
                      size={16}
                      className="text-white hover:text-tertiary-400 transition-colors"
                    />
                  </button>
                  <button
                    className="cursor-pointer rounded-lg bg-white/10 p-1.5 transition-all duration-200 hover:bg-red-500/20"
                    onClick={() => handleDelete(product)}
                  >
                    <AiOutlineDelete
                      size={16}
                      className="text-white hover:text-red-400 transition-colors"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sentinel infinite scroll */}
      <div ref={loadMoreRef} className="flex items-center justify-center py-4">
        {loadingMore && (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-tertiary-400 border-t-transparent" />
        )}
        {!hasNextPage && !loadingMore && products.length > 0 && (
          <p className="text-xs font-one text-white/30">Tous les produits sont affichés</p>
        )}
      </div>

      {isModalOpen && (
        <CreateOrUpdateProduct
          userId={session?.user?.id ?? ""}
          onCreate={() => {
            fetchProducts(1, true);
            setIsModalOpen(false);
          }}
          setIsOpen={setIsModalOpen}
          existingProduct={selectedProduct ?? undefined}
        />
      )}
      {isModalDeleteOpen && (
        <DeleteProduct
          onDelete={() => {
            fetchProducts(1, true);
            setIsModalDeleteOpen(false);
          }}
          setIsOpen={setIsModalDeleteOpen}
          product={selectedProduct ?? undefined}
        />
      )}
    </section>
  );
}
