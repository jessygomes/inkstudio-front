import React from "react";
import Navbar from "./Navbar/Navbar";
import NavMobile from "./Navbar/NavMobile";

export default function Header() {
  return (
    <>
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <div className="lg:hidden px-4 pt-4 rounded-2xl w-full">
        <NavMobile />
      </div>
    </>
  );
}
