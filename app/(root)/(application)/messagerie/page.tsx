import MessageList from "@/components/Application/Messaging/MessageList";
import React from "react";

export default function MessageriePage() {
  return (
    <div className="wrapper-global !min-h-0 h-[calc(100dvh-7rem)] overflow-hidden !px-0 py-0 xl:h-dvh">
      <div className="min-h-0 w-full flex-1">
        <MessageList />
      </div>
    </div>
  );
}
