import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/States'

interface PlaceholderPageProps {
  title: string
  description: string
}

/** Chỗ giữ sẵn cho các module chưa có API — thay bằng page thật khi backend xong. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} subtitle={description} />
      <Card>
        <EmptyState message="Module này chưa được nối API. Nội dung sẽ hiển thị ở đây." />
      </Card>
    </>
  )
}
