import React from "react";

interface FormSuccessProps {
  message: string | undefined;
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;

  return (
    <div className=" bg-emerald-500/15 p-2 rounded-2xl flex items-center justify-center gap-x-2 text-sm text-emerald-500 font-one">
      <p className="">{message}</p>
    </div>
  );
};
