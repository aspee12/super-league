'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { FullPageLoader } from '@shared-component/FullPageLoader'
import { ConfirmModal } from '@shared-component/modals/ConfirmationModal/ConfirmModal'
import { AddNewsModal } from '@shared-component/modals/WebModals/AddNewsModal'
import { NewsCard } from '@components/NewsView/NewsCard'
import { NewsFilterBar, hasActiveFilters } from '@components/NewsView/NewsFilterBar'
import { ArchiveSeasonNotice, SeasonFilter } from '@shared-component/SeasonFilter'
import { getTeams } from '@/lib/matches-api'
import { deleteNews, type PayloadNews } from '@/lib/news-api'
import { useNews, type NewsFilters } from '@/hooks/useNews'
import { useSeasons } from '@/hooks/useSeasons'
import { useAuthStore } from '@/store/authStore'

/** Cards shown before "View More". */
const PAGE_SIZE = 3

export default function MobileNewsView() {
  const [filters, setFilters] = useState<NewsFilters>({})
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PayloadNews | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PayloadNews | null>(null)

  const queryClient = useQueryClient()
  const user = useAuthStore((response) => response.user)
  const { isViewingActiveSeason } = useSeasons()
  // Archived seasons are read-only — see the note in MatchesView.
  const isSuperAdmin = user?.role === 'super_admin' && isViewingActiveSeason

  const { filteredNews, isLoading } = useNews(filters)
  // Every club, not just this season's — an article can be about any of them.
  const teamsQuery = useQuery({ queryKey: ['teams', null], queryFn: () => getTeams() })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('News deleted.')
      setPendingDelete(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setPendingDelete(null)
    },
  })

  const activeCount = hasActiveFilters(filters)
  const visibleNews = filteredNews.slice(0, visibleCount)
  const hasMore = filteredNews.length > visibleCount

  /** Narrowing the list should collapse it back to the first page. */
  const handleFiltersChange = (next: NewsFilters) => {
    setFilters(next)
    setVisibleCount(PAGE_SIZE)
  }

  if (isLoading) return <FullPageLoader message="Loading news..." />

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div className="px-4 pt-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-semibold text-gray-800 text-[18px]">News</h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className={`h-9 flex items-center gap-1.5 px-3 rounded-[8px] border text-[14px] transition-colors ${
                activeCount
                  ? 'bg-[#267c93] border-[#267c93] text-white'
                  : 'bg-white border-[#e7e6e6] text-[#605e5c]'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null)
                  setModalOpen(true)
                }}
                aria-label="Add news"
                className="h-9 w-9 flex items-center justify-center rounded-[8px] bg-[#267c93] text-white"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-3">
          <SeasonFilter showReset={false} />
        </div>

        <ArchiveSeasonNotice />

        {filtersOpen && (
          <div className="bg-white rounded-xl shadow-sm p-3">
            <NewsFilterBar
              compact
              filters={filters}
              onChange={handleFiltersChange}
              teams={teamsQuery.data ?? []}
            />
          </div>
        )}
      </div>

      <div className="px-4">
        {filteredNews.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">
            No news articles match these filters
          </p>
        ) : (
          <section className="rounded-2xl border border-[#a6dfe6]/60 bg-[#ecf9ff]/75 p-3">
            <div className="flex flex-col gap-6">
              {visibleNews.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onEdit={
                    isSuperAdmin
                      ? (a) => {
                          setEditing(a)
                          setModalOpen(true)
                        }
                      : undefined
                  }
                  onDelete={isSuperAdmin ? setPendingDelete : undefined}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="rounded-full bg-white px-6 py-2.5 text-[15px] font-bold text-[#004556]
                             shadow-sm border border-[#e7e6e6] active:bg-[#f5f5f5]"
                >
                  View More
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      <AddNewsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editing}
      />

      <ConfirmModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        title="Delete News?"
        message="Are you sure you want to delete this article? This cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
