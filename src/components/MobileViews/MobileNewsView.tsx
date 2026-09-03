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
import { useAuthStore } from '@/store/authStore'

export default function MobileNewsView() {
  const [filters, setFilters] = useState<NewsFilters>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PayloadNews | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PayloadNews | null>(null)

  const queryClient = useQueryClient()
  const user = useAuthStore((response) => response.user)
  const isSuperAdmin = user?.role === 'super_admin'

  const { filteredNews, isLoading } = useNews(filters)
  const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: getTeams })

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

  if (isLoading) return <FullPageLoader message="Loading news..." />

  return (
    <div className="min-h-screen pb-20" style={{ fontFamily: 'Roboto, sans-serif' }}>
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
              onChange={setFilters}
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
          <div className="space-y-3">
            {filteredNews.map((article) => (
              <div key={article.id} className="bg-white rounded-xl shadow-sm">
                <NewsCard
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
              </div>
            ))}
          </div>
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
