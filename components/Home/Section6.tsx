"use client";
import React, { useState } from "react";

const faqs = [
  {
    question: "Comment fonctionne InkStudio ?",
    answer:
      "InkStudio est une plateforme tout-en-un qui vous permet de gérer vos réservations, vos clients, et bien plus encore, directement en ligne.",
  },
  {
    question: "Puis-je personnaliser mon portfolio ?",
    answer:
      "Oui, InkStudio vous permet de créer un portfolio en ligne avec des options de personnalisation et une protection anti-vol.",
  },
  {
    question: "Quels rappels sont envoyés aux clients ?",
    answer:
      "InkStudio envoie des rappels automatiques pour les rendez-vous et des instructions de soin après les séances.",
  },
];
export default function Section6() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-noir-700 flex flex-col h-auto py-10 px-4 sm:px-20">
      <h2 className="text-white text-3xl font-two font-bold mb-8">FAQ</h2>
      <div className="w-full">
        {faqs.map((faq, index) => (
          <div key={index} className=" mb-4 border-b border-gray-600 pb-4">
            <button
              onClick={() => toggleFAQ(index)}
              className="cursor-pointer w-full text-left text-white font-two font-bold text-lg flex justify-between items-center"
            >
              {faq.question}
              <span className="text-tertiary-500 text-3xl cursor-pointer hover:text-tertiary-400 transition-all duration-300">
                {activeIndex === index ? "-" : "+"}
              </span>
            </button>
            {activeIndex === index && (
              <p className="text-white/80 mt-2 font-one">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
