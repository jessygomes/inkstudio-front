"use client";
import React, { useState } from "react";

const faqs = [
  {
    question: "Comment fonctionne INKERA Studio ?",
    answer:
      "INKERA Studio est une plateforme tout-en-un qui vous permet de gérer vos réservations, vos clients, et bien plus encore, directement en ligne.",
  },
  {
    question: "Puis-je personnaliser mon portfolio ?",
    answer:
      "Oui, INKERA Studio vous permet de créer un portfolio en ligne avec des options de personnalisation et une protection anti-vol.",
  },
  {
    question: "Quels rappels sont envoyés aux clients ?",
    answer:
      "INKERA Studio envoie des rappels automatiques pour les rendez-vous et des instructions de soin après les séances.",
  },
];
export default function Section6() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-noir-700 flex flex-col py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
      {/* Titre modernisé */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-white text-2xl sm:text-3xl font-two font-bold mb-4 text-center">
          FAQ
        </h2>
        <div className="h-1 w-16 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto"></div>
      </div>

      {/* Container des FAQs */}
      <div className="w-full max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="cursor-pointer w-full text-left p-4 sm:p-6 flex justify-between items-center group"
            >
              <span className="text-white font-two font-bold text-base sm:text-lg pr-4 group-hover:text-tertiary-400 transition-colors duration-300">
                {faq.question}
              </span>
              <div className="flex-shrink-0 w-8 h-8 bg-tertiary-500/20 rounded-full flex items-center justify-center">
                <span className="text-tertiary-400 text-lg font-bold cursor-pointer group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                  {activeIndex === index ? "−" : "+"}
                </span>
              </div>
            </button>

            {activeIndex === index && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>
                <p className="text-white/80 font-one text-sm sm:text-base leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Élément décoratif en bas */}
      {/* <div className="flex justify-center mt-12">
        <div className="h-1 w-20 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full opacity-60"></div>
      </div> */}
    </section>
  );
}
