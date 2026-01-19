import React from "react";
// import Link from "next/link";
// import NavMobile from "./Navbar/NavMobile";
import NavbarApp from "./Navbar/NavbarApp";
import NavbarMobile from "./Navbar/NavbarMobile";

export default function HeaderApp() {
  return (
    <>
      {" "}
      <div className="block xl:hidden">
        <NavbarMobile />
      </div>
      <div className="hidden xl:block">
        <NavbarApp />
      </div>
      {/* <div className="sm:hidden px-4 pt-8 rounded-2xl flex justify-between items-center mx-2">
        <Link
          href={"/dashboard"}
          className="text-xl font-one font-bold text-white "
        >
          InkStudio
        </Link>
        <NavMobile />
      </div> */}
    </>
  );
}
