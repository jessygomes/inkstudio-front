import React from "react";

interface FormErrorProps {
  message: string | undefined;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className="bg-gradient-to-r from-red-900 to-red-700 p-3  font-one rounded-[20px] flex items-center justify-center gap-x-2 text-sm text-white">
      <p className="">{message}</p>
    </div>
  );
};
