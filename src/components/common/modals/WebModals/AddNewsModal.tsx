'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { getTeams } from '@/lib/matches-api'
import { uploadMedia } from '@/lib/teams-api'
import {
  createNews,
  updateNews,
  type CreateNewsBody,
  type NewsCategory,
} from '@/lib/news-api'
import { NEWS_CATEGORIES, NEWS_CATEGORY_CONFIG } from '@constants/news'
import { NewsImageDropzone } from '@components/NewsView/NewsImageDropzone'
import { useSeasons } from '@/hooks/useSeasons'
import type { AddNewsModalProps } from '@app-types/shared-type'

type FormValues = {
  title: string
  content: string
  category: NewsCategory
  team: string
  season: string
  publishedDate: string
  featured: boolean
}

/** Card summaries are a trimmed version of the body copy. */
const EXCERPT_MAX = 160
function deriveExcerpt(content: string): string {
  const clean = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    // Skip '## ' subheadings so a card summary never opens with a section label.
    .filter((p) => p && !p.startsWith('## '))
    .join(' ')
    .replace(/\s+/g, ' ')
  if (clean.length <= EXCERPT_MAX) return clean
  return `${clean.slice(0, EXCERPT_MAX).trimEnd()}…`
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

const FIELD_CLASS =
  'w-full h-10 px-3 rounded-[8px] border border-black/38 text-[14px] text-[#201f1e] ' +
  'focus:outline-none focus:ring-2 focus:ring-[#267c93]/30'

/**
 * Gate the content behind `isOpen` so each open mounts a fresh form — that
 * removes the need to reset state from an effect when `initialData` changes.
 */
export function AddNewsModal(props: AddNewsModalProps) {
  if (!props.isOpen) return null
  return <AddNewsModalContent {...props} />
}

function AddNewsModalContent({
  onClose,
  initialData,
  onSubmit,
  title,
  submitText,
}: AddNewsModalProps) {
  const isEditMode = !!initialData
  const queryClient = useQueryClient()
  const { seasons, viewingSeasonId } = useSeasons()

  const [file, setFile] = useState<File | null>(null)
  const [showExistingImage, setShowExistingImage] = useState(true)

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialData
      ? {
          title: initialData.title,
          content: initialData.content,
          category: initialData.category,
          team:
            typeof initialData.team === 'string'
              ? initialData.team
              : (initialData.team?.id ?? ''),
          season:
            typeof initialData.season === 'string'
              ? initialData.season
              : (initialData.season?.id ?? ''),
          publishedDate: initialData.publishedDate,
          featured: Boolean(initialData.featured),
        }
      : {
          title: '',
          content: '',
          category: 'club_news',
          team: '',
          // New articles default to the season currently being viewed.
          season: viewingSeasonId ?? '',
          publishedDate: todayISO(),
          featured: false,
        },
  })

  const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: getTeams })
  const teams = teamsQuery.data ?? []

  // Lock background scroll for as long as the modal is mounted.
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const finish = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ['news'] })
    toast.success(message)
    onSubmit?.()
    onClose()
  }

  const createMutation = useMutation({
    mutationFn: async (body: CreateNewsBody & { file: File | null }) => {
      const { file: chosen, ...rest } = body
      const image = chosen ? await uploadMedia(chosen) : undefined
      return createNews({ ...rest, ...(image && { image }) })
    },
    onSuccess: () => finish('News published.'),
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      body,
      file: chosen,
      clearImage,
    }: {
      id: string
      body: Partial<CreateNewsBody>
      file: File | null
      clearImage: boolean
    }) => {
      const image = chosen ? await uploadMedia(chosen) : undefined
      return updateNews(id, {
        ...body,
        ...(image ? { image } : clearImage ? { image: '' } : {}),
      })
    },
    onSuccess: () => finish('News updated.'),
    onError: (err: Error) => toast.error(err.message),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const onFormSubmit = (data: FormValues) => {
    if (!data.title.trim()) {
      setError('title', { type: 'required', message: 'Title is required' })
      return
    }
    if (!data.content.trim()) {
      setError('content', { type: 'required', message: 'Description is required' })
      return
    }
    if (!data.publishedDate) {
      setError('publishedDate', { type: 'required', message: 'Publish date is required' })
      return
    }
    if (!data.season) {
      setError('season', { type: 'required', message: 'Season is required' })
      return
    }

    const body = {
      title: data.title.trim(),
      content: data.content.trim(),
      excerpt: deriveExcerpt(data.content),
      category: data.category,
      season: data.season,
      publishedDate: data.publishedDate,
      featured: data.featured,
      ...(data.team && { team: data.team }),
    }

    if (isEditMode && initialData?.id) {
      updateMutation.mutate({
        id: initialData.id,
        body,
        file,
        clearImage: !showExistingImage,
      })
    } else {
      createMutation.mutate({ ...body, file })
    }
  }

  const heading = title ?? (isEditMode ? 'Edit News' : 'Add News')
  const cta = submitText ?? (isEditMode ? 'Save Changes' : 'Post News')

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end md:items-center md:justify-center z-9999"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="bg-white rounded-t-2xl md:rounded-[4px] w-full md:max-w-[720px] max-h-[92vh] md:max-h-[88vh] flex flex-col shadow-[0px_10px_20px_2px_rgba(0,0,0,0.04),0px_4px_20px_2px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <div className="bg-[#f5f5f5] border-b border-black/12 flex items-center justify-between px-6 py-3 rounded-t-2xl md:rounded-t-[4px] shrink-0">
          <h2 className="font-bold text-[16px] text-[#201f1e]" style={{ letterSpacing: '0.15px' }}>
            {heading}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#201f1e] hover:opacity-70"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex flex-col gap-4 px-6 py-4 overflow-y-auto flex-1">
            {/* Title */}
            <div>
              <label htmlFor="news-title" className="block text-[14px] text-[#201f1e] mb-1">
                Title
              </label>
              <input
                id="news-title"
                {...register('title')}
                placeholder="Headline for this article"
                className={FIELD_CLASS}
              />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            {/* Cover image */}
            <NewsImageDropzone
              file={file}
              onFileChange={setFile}
              maxSizeMB={1}
              existingImageUrl={
                showExistingImage && initialData?.image ? initialData.image : undefined
              }
              onClearExisting={() => setShowExistingImage(false)}
            />

            {/* Description */}
            <div>
              <textarea
                {...register('content')}
                rows={5}
                placeholder="Type your description here..."
                className="w-full min-h-[122px] px-4 py-3 rounded-[8px] border border-black/38 text-[14px] text-[#201f1e] focus:outline-none focus:ring-2 focus:ring-[#267c93]/30"
                style={{ lineHeight: '24px' }}
              />
              {errors.content && (
                <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
              )}
            </div>

            {/* Metadata — drives the filters on the news page */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="news-category" className="block text-[14px] text-[#201f1e] mb-1">
                  Category
                </label>
                <select id="news-category" {...register('category')} className={FIELD_CLASS}>
                  {NEWS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {NEWS_CATEGORY_CONFIG[c].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="news-team" className="block text-[14px] text-[#201f1e] mb-1">
                  Team <span className="text-[#605e5c]">(optional)</span>
                </label>
                <select id="news-team" {...register('team')} className={FIELD_CLASS}>
                  <option value="">No specific team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="news-season" className="block text-[14px] text-[#201f1e] mb-1">
                  Season
                </label>
                <select id="news-season" {...register('season')} className={FIELD_CLASS}>
                  <option value="">Select a season</option>
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {s.isActive ? ' (current)' : ''}
                    </option>
                  ))}
                </select>
                {errors.season && (
                  <p className="text-sm text-red-600 mt-1">{errors.season.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="news-date" className="block text-[14px] text-[#201f1e] mb-1">
                  Publish date
                </label>
                <input
                  id="news-date"
                  type="date"
                  {...register('publishedDate')}
                  className={FIELD_CLASS}
                />
                {errors.publishedDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.publishedDate.message}</p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('featured')}
                className="h-4 w-4 accent-[#267c93]"
              />
              <span className="text-[14px] text-[#201f1e]">Feature this article</span>
            </label>
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-black/12 flex items-center justify-end gap-4 px-6 py-3 shrink-0 rounded-b-[4px]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 px-4 rounded-[4px] border border-[#267c93] bg-white text-[16px] font-medium text-[#267c93] hover:bg-[#267c93]/5 disabled:opacity-50"
              style={{ letterSpacing: '1.25px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-4 rounded-[4px] bg-[#267c93] text-[16px] font-medium text-white hover:bg-[#1e6477] transition disabled:opacity-50"
              style={{ letterSpacing: '1.25px' }}
            >
              {isSubmitting ? 'Saving…' : cta}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
