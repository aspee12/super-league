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
import { useAuthStore } from '@/store/authStore'
import { NewsCard } from './NewsCard'
import { NewsFilterBar } from './NewsFilterBar'

export default function NewsView() {
  const [filters, setFilters] = useState<NewsFilters>({})
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
      <div className="flex items-center justify-between mb-4">
        <h1
          className="font-bold text-[20px] text-[#201f1e]"
          style={{ lineHeight: '30px', letterSpacing: '0.25px' }}
        >
          News
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
        <NewsFilterBar filters={filters} onChange={setFilters} teams={teamsQuery.data ?? []} />
      </div>

      {filteredNews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No news articles match these filters
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredNews.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onEdit={isSuperAdmin ? openEdit : undefined}
              onDelete={isSuperAdmin ? setPendingDelete : undefined}
            />
          ))}
        </div>
      )}

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
