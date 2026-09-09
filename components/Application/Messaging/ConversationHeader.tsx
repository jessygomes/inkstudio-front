import Image from "next/image";
import { ConversationDto } from "@/lib/queries/conversation.action";
import ArchiveBtn from "./ArchiveBtn";
import DeleteConversationBtn from "./DeleteConversationBtn";
interface Props {
    conversation: ConversationDto;
    otherUser: ConversationDto["client"] | ConversationDto["salon"] | undefined;
    isConnected: boolean;
    onShowDetails: () => void;
    onStatusChange: (status: "ACTIVE" | "ARCHIVED") => void;
}
export default function ConversationHeader({ conversation, otherUser, isConnected, onShowDetails, onStatusChange }: Props) {
    return (<header className="shrink-0 border-b border-white/10 p-4 sm:p-5">
 <div className="flex items-center gap-3">
 <Image src={otherUser?.image || "/images/default-avatar.png"} width={48} height={48} alt="" className="h-12 w-12 shrink-0 rounded-2xl object-cover"/>
 <div className="min-w-0 flex-1"><h1 className="truncate text-base font-semibold text-white">{otherUser?.salonName || [otherUser?.firstName, otherUser?.lastName].filter(Boolean).join(" ") || "Interlocuteur"}</h1>
 <p className="mt-1 truncate text-sm text-white/60">{conversation.subject}</p></div>
 <ArchiveBtn conversationId={conversation.id} status={conversation.status} onStatusChange={onStatusChange}/>
 <DeleteConversationBtn conversationId={conversation.id}/>
 </div>
 <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
 <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/75">{{ ACTIVE: "Active", ARCHIVED: "Archivée", CLOSED: "Fermée" }[conversation.status]}</span>
 <span role="status" className="flex items-center gap-2 text-white/60"><span className={isConnected ? "h-1.5 w-1.5 rounded-full bg-emerald-400" : "h-1.5 w-1.5 rounded-full bg-amber-400"}/>{isConnected ? "Messagerie connectée" : "Connexion interrompue"}</span>
 {conversation.appointmentId && <button type="button" onClick={onShowDetails} className="ml-auto min-h-9 rounded-xl border border-white/15 px-3 text-white hover:bg-white/10 focus-visible:outline-2 lg:hidden">Voir le rendez-vous</button>}
 </div></header>);
}
