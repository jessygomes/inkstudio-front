import MessageList from "@/components/Application/Messaging/MessageList";
import React from "react";

export default function MessageriePage() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 lg:px-10 pb-10 lg:pb-0">
      <div className="w-full mt-4 xl:mt-23">
        <MessageList />
      </div>
    </div>
  );
}
