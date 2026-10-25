import MessageList from "@/components/Application/Messaging/MessageList";
import React from "react";

export default function MessageriePage() {
  return (
    <div className="flex min-w-0 flex-col bg-noir-700">
      <div className="min-h-0 w-full flex-1">
        <MessageList />
      </div>
    </div>
  );
}
