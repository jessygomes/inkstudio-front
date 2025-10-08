"use client";
import { useEffect } from "react";

export default function ModalManager() {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const hasModal = document.querySelectorAll("[data-modal]").length > 0;
      if (hasModal) {
        // lock scroll and preserve offset
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
      } else {
        // unlock scroll and restore
        const top = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        if (top) {
          const scrollY = parseInt(top || "0") * -1;
          window.scrollTo(0, scrollY);
        }
      }
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
