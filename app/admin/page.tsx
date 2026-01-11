import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // SERVER ACTION: Create a Scenario
  async function createScenario(formData: FormData) {
    "use server";
    
    // 1. Deactivate old scenarios so users only see the new one
    await prisma.liveScenario.updateMany({
      data: { isActive: false }
    });

    // 2. Create the new live scenario
    await prisma.liveScenario.create({
      data: {
        title: formData.get("title") as string,
        optionA: formData.get("optionA") as string,
        optionB: formData.get("optionB") as string,
      }
    });

    revalidatePath("/"); // Update the homepage for everyone instantly
    redirect("/admin?success=true");
  }

  return (
    <main className="min-h-screen bg-black text-white p-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-red-600 mb-8 uppercase tracking-widest">
        ⚡ Live Operator Terminal
      </h1>

      <form action={createScenario} className="w-full max-w-md flex flex-col gap-4">
        
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 uppercase">Live Situation</label>
          <input name="title" required placeholder="e.g. Jonathan is pushing a compound..." 
            className="bg-[#111] border border-gray-800 p-3 rounded text-white focus:border-red-600 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase">Option A</label>
            <input name="optionA" required placeholder="Push Aggressively" 
              className="bg-[#111] border border-gray-800 p-3 rounded text-white focus:border-blue-600 outline-none" />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase">Option B</label>
            <input name="optionB" required placeholder="Hold & Heal" 
              className="bg-[#111] border border-gray-800 p-3 rounded text-white focus:border-green-600 outline-none" />
          </div>
        </div>

        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded mt-4 uppercase tracking-widest">
          BROADCAST TO LIVE USERS
        </button>

      </form>
    </main>
  );
}