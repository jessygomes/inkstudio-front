"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import { ProductSalonProps } from "@/lib/type";
import { CSSProperties, useEffect, useState } from "react";
import BarLoader from "react-spinners/BarLoader";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import Image from "next/image";
import CreateOrUpdateProduct from "./CreateOrUpdateProduct";
import DeleteProduct from "./DeleteProduct";

export default function ProductList() {
  const user = useUser();

  const [loading, setLoading] = useState(true);
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "none",
  };
  const color = "#ff5500";

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
      {" "}
      <div className="flex justify-center gap-4 items-center mt-4 mb-8">
        <button
          onClick={handleCreate}
          className="cursor-pointer w-[200px] text-center px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
        >
          Nouveau produit
        </button>
      </div>
      {loading ? (
        <div className="w-full flex items-center justify-center">
          <BarLoader
            color={color}
            loading={loading}
            cssOverride={override}
            width={300}
            height={5}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : products.length === 0 ? (
        <div className="h-[350px] w-full flex justify-center items-center text-white/70">
          Aucune photo dans votre portfolio
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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
