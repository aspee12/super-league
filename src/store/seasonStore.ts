import { create } from 'zustand'

type SeasonState = {
  /**
   * The season the user explicitly picked. `null` means "follow the active
   * season" — so a new season becoming active is reflected without the user
   * having to reset anything. Deliberately not persisted: every visit starts
   * on the active season, matching how EPL defaults to the current campaign.
   */
  selectedSeasonId: string | null
  setSelectedSeasonId: (id: string | null) => void
  resetSeason: () => void
}

export const useSeasonStore = create<SeasonState>()((set) => ({
  selectedSeasonId: null,
  setSelectedSeasonId: (id) => set({ selectedSeasonId: id }),
  resetSeason: () => set({ selectedSeasonId: null }),
}))
