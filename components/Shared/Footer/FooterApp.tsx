import React from "react";

export default function Footer() {
  return (
    <footer className="px-4 py-20 sm:px-20 bg-noir-700">
      <div className="flex items-center justify-center gap-4 mb-8">
        <h3 className="text-white text-3xl font-two font-bold uppercase">
          InkStudio
        </h3>
        <div className="bg-white/50 w-full h-[1px]"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 text-white"></div>
    </footer>
  );
}
