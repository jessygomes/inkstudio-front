import React from "react";

interface FormErrorProps {
  message: string | undefined;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className="bg-gradient-to-r from-red-900/30 to-red-700/30 p-3 border border-red-700  font-one rounded-lg flex items-center justify-center gap-x-2 text-sm text-white">
      <p className="">{message}</p>
    </div>
  );
};
