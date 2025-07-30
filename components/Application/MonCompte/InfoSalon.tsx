"use client";
import { UpdateSalonUserProps } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface InfoSalonProps {
  salon: UpdateSalonUserProps;
}

export default function InfoSalon({ salon }: InfoSalonProps) {
  const router = useRouter();

  return (
    <article className="flex flex-col items-end p-2 rounded-[20px]">
      <article className="flex gap-8 w-full ">
        <div className="relative w-[250px] h-[250px] rounded-3xl overflow-hidden">
          {salon.image ? (
            <Image
              width={200}
              height={200}
              src={salon.image}
              alt="Salon Image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500 font-two">No Image</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 justify-center">
          <h1 className="text-white uppercase text-3xl font-one">
            {salon.salonName}
          </h1>
          <p className="text-white font-two text-sm">
            Lieu : {salon.address}, {salon.postalCode} {salon.city}
          </p>
          <p className="text-white text-sm">{salon.description}</p>
          <div>
            {salon.instagram && (
              <Link
                href={salon.instagram}
                target="_blank"
                className="text-white"
              >
                Instagram
              </Link>
            )}
            {salon.facebook && (
              <Link
                href={`https://www.facebook.com/${salon.facebook}`}
                target="_blank"
                className="text-white"
              >
                Facebook
              </Link>
            )}
            {salon.tiktok && (
              <Link
                href={`https://www.tiktok.com/@${salon.tiktok}`}
                target="_blank"
                className="text-white"
              >
                Tik Tok
              </Link>
            )}
            {salon.website && (
              <Link href={salon.website} target="_blank" className="text-white">
                Site Web
              </Link>
            )}
          </div>
        </div>
      </article>
      <button
        onClick={() => router.push("/mon-compte/modifier-salon")}
        className="text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[200px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
      >
        Modifier les informations
      </button>
    </article>
  );
}
