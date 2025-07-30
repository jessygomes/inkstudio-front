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
          className="relative text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
        >
          Nouveeau produit
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white/10 rounded-2xl overflow-hidden border border-white/20 hover:border-tertiary-400/50 transition-all duration-300"
            >
              <div className="aspect-square relative">
                <Image
                  width={500}
                  height={500}
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-one tracking-widest font-semibold mb-2">
                    {product.name} | {product.price}€
                  </h3>

                  <div className="flex gap-2 text-xs items-center justify-center">
                    <button
                      className="cursor-pointer text-black"
                      onClick={() => handleEdit(product)}
                    >
                      <IoCreateOutline
                        size={20}
                        className="text-white hover:text-tertiary-500 duration-200"
                      />
                    </button>
                    <button
                      className="cursor-pointer text-black"
                      onClick={() => handleDelete(product)}
                    >
                      {" "}
                      <AiOutlineDelete
                        size={20}
                        className="text-white hover:text-red-800 duration-200"
                      />
                    </button>
                  </div>
                </div>

                <p className="text-white/70 text-[10px] line-clamp-2">
                  {product.description}
                </p>
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
