"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import { ProductSalonProps } from "@/lib/type";
import { useEffect, useState } from "react";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { MdOutlineSell } from "react-icons/md";
import Image from "next/image";
import CreateOrUpdateProduct from "./CreateOrUpdateProduct";
import DeleteProduct from "./DeleteProduct";

export default function ProductList() {
  const user = useUser();

  const [loading, setLoading] = useState(true);

  //! State
  const [products, setProducts] = useState<ProductSalonProps[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSalonProps | null>(null);

  //! Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  //! Récupère les photos du portfolio
  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/product-salon/${user?.id}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Vérifier que data est un tableau
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("La réponse n'est pas un tableau:", data);
        setProducts([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des produits :", err);
      setProducts([]); // S'assurer que produits reste un tableau
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, []);

  //! Handlers pour les actions
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
    <section className="w-full">
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
            <MdOutlineSell
              size={28}
              className="text-tertiary-400 animate-pulse"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-one tracking-wide uppercase">
              Produits
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              Gérez vos produits, consultez les détails de chaque article et
              proposez-les à la vente.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4 items-center">
          <button
            onClick={handleCreate}
            className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
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
            Nouveau produit
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-full rounded-2xl p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
            <p className="text-white/60 font-two text-xs text-center">
              Chargement des photos...
            </p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="h-full w-full flex">
          <div className="w-full rounded-2xl shadow-xl border border-white/10 p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center mb-2">
              <MdOutlineSell
                size={40}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <h2 className="text-white font-one text-xl text-center">
              Aucun produit dans votre boutique
            </h2>
            <p className="text-white/60 font-two text-xs text-center">
              Ajoutez vos produits pour montrer aux clients ce que vous proposez
              !
            </p>
            <button
              onClick={handleCreate}
              className="mt-2 px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-medium font-one text-xs shadow-lg transition-all"
            >
              Ajouter une photo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-tertiary-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl group"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  width={500}
                  height={500}
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay avec actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
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

              <div className="p-4 space-y-3">
                {/* Header avec nom et prix */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-one text-sm font-bold tracking-wide truncate flex-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-tertiary-500/20 text-tertiary-400 rounded-full text-xs font-one font-medium border border-tertiary-500/30">
                        {product.price}€
                      </span>
                    </div>
                  </div>

                  {/* Prix avec badge */}
                </div>

                {/* Description */}
                <div className="border-t border-white/10 pt-2">
                  <p className="text-white/70 text-xs font-one line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Actions au bas (version alternative pour mobile) */}
                <div className="flex gap-2 justify-end pt-2 lg:hidden">
                  <button
                    className="cursor-pointer p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200"
                    onClick={() => handleEdit(product)}
                  >
                    <IoCreateOutline
                      size={16}
                      className="text-white hover:text-tertiary-400 transition-colors"
                    />
                  </button>
                  <button
                    className="cursor-pointer p-1.5 bg-white/10 rounded-lg hover:bg-red-500/20 transition-all duration-200"
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
      {isModalOpen && (
        <CreateOrUpdateProduct
          userId={user.id ?? ""}
          onCreate={() => {
            fetchProducts();
            setIsModalOpen(false);
          }}
          setIsOpen={setIsModalOpen}
          existingProduct={selectedProduct ?? undefined}
        />
      )}
      {isModalDeleteOpen && (
        <DeleteProduct
          onDelete={() => {
            fetchProducts();
            setIsModalDeleteOpen(false);
          }}
          setIsOpen={setIsModalDeleteOpen}
          product={selectedProduct ?? undefined}
        />
      )}
    </section>
  );
}
