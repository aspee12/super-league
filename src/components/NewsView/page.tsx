'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { FullPageLoader } from '@shared-component/FullPageLoader'
import { ConfirmModal } from '@shared-component/modals/ConfirmationModal/ConfirmModal'
import { AddNewsModal } from '@shared-component/modals/WebModals/AddNewsModal'
import { ArchiveSeasonNotice, SeasonFilter } from '@shared-component/SeasonFilter'
import { getTeams } from '@/lib/matches-api'
import { deleteNews, type PayloadNews } from '@/lib/news-api'
import { useNews, type NewsFilters } from '@/hooks/useNews'
import { useSeasons } from '@/hooks/useSeasons'
import { useAuthStore } from '@/store/authStore'
import { NewsCard } from './NewsCard'
import { NewsFilterBar } from './NewsFilterBar'

/** Cards shown before "View More" — one full row on the widest grid. */
const PAGE_SIZE = 4

export default function NewsView() {
  const [filters, setFilters] = useState<NewsFilters>({})
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
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

  const visibleNews = filteredNews.slice(0, visibleCount)
  const hasMore = filteredNews.length > visibleCount

  /** Narrowing the list should collapse it back to the first page. */
  const handleFiltersChange = (next: NewsFilters) => {
    setFilters(next)
    setVisibleCount(PAGE_SIZE)
  }

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (article: PayloadNews) => {
    setEditing(article)
    setModalOpen(true)
  }

  if (isLoading) return <FullPageLoader message="Loading news..." />

  return (
    <div className="min-h-screen flex-1 p-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
      {/* Single tinted panel holding the whole section, so the white cards
          read as one group rather than floating on the page background. */}
      <section className="rounded-2xl border border-[#a6dfe6]/60 bg-[#ecf9ff]/75 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1
            className="font-bold text-[24px] text-[#004556]"
            style={{ lineHeight: '32px', letterSpacing: '0.25px' }}
          >
            Latest News
          </h1>

          <div className="flex items-center gap-4">
            <SeasonFilter showReset={false} />

            {isSuperAdmin && (
              <button
                type="button"
                onClick={openAdd}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-[4px] bg-[#267c93] text-white hover:bg-[#1e6477] transition"
              >
                <Plus className="h-4 w-4" />
                <span className="font-bold text-[16px]" style={{ letterSpacing: '1.25px' }}>
                  Add News
                </span>
              </button>
            )}
          </div>
        </div>

        <ArchiveSeasonNotice />

        <div className="mb-6">
          <NewsFilterBar
            filters={filters}
            onChange={handleFiltersChange}
            teams={teamsQuery.data ?? []}
          />
        </div>

        {filteredNews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No news articles match these filters
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-7">
              {visibleNews.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onEdit={isSuperAdmin ? openEdit : undefined}
                  onDelete={isSuperAdmin ? setPendingDelete : undefined}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="rounded-full bg-white px-8 py-3 text-[16px] font-bold text-[#004556]
                             shadow-sm border border-[#e7e6e6] hover:bg-[#f5f5f5] transition-colors"
                >
                  View More
                </button>
              </div>
            )}
          </>
        )}
      </section>

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
