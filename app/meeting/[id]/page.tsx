import JitsiMeeting from "@/components/Application/Visio/JitsiMeeting";

export default function meetingPage() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 sm:px-20">
      <div className="w-full">
        <JitsiMeeting />
      </div>
    </div>
  );
}
