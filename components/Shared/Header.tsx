import React from "react";
import Link from "next/link";
import Navbar from "./Navbar/Navbar";
import NavMobile from "./Navbar/NavMobile";

export default function Header() {
  return (
    <>
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <div className="lg:hidden px-4 pt-8 rounded-2xl flex justify-between items-center mx-2">
        <Link href={"/"} className="text-xl font-one font-bold text-white ">
          InkStudio
        </Link>
        <NavMobile />
      </div>
    </>
  );
}
