import Chat from "@/components/Chat";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 h-full max-w-4xl w-full mx-auto bg-white dark:bg-slate-900 shadow-sm">
      <Chat />
    </main>
  );
}

