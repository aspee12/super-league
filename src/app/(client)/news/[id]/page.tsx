'use client'

import { useParams } from 'next/navigation'
import { AppShell } from '@shared-component/AppShell'
import { NewsArticleView } from '@components/NewsView/NewsArticleView'

export default function NewsArticlePage() {
  const params = useParams()
  const id = params?.id as string

  return (
    <AppShell>
      <NewsArticleView articleId={id} />
    </AppShell>
  )
}
