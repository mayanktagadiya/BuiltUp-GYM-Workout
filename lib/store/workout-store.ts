import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SetLog, WorkoutSession } from "@/lib/types";

interface WorkoutStore {
  activeSession: WorkoutSession | null;
  pendingSetLogs: SetLog[];
  setActiveSession: (session: WorkoutSession | null) => void;
  addSetLog: (log: SetLog) => void;
  clearPendingLogs: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set) => ({
      activeSession: null,
      pendingSetLogs: [],
      setActiveSession: (session) => set({ activeSession: session }),
      addSetLog: (log) =>
        set((state) => ({ pendingSetLogs: [...state.pendingSetLogs, log] })),
      clearPendingLogs: () => set({ pendingSetLogs: [] }),
    }),
    {
      name: "buildup-workout",
    }
  )
);
