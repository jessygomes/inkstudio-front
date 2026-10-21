import Conversation from "@/components/Application/Messaging/Conversation";

export default function MessagingPage() {
  return (
    <div className="h-[calc(100dvh-7rem)] overflow-hidden bg-noir-700 xl:h-dvh">
      <Conversation />
    </div>
  );
}
