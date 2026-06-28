import { redirect } from 'next/navigation'

/**
 * Redirect to the main quote page which already renders the full proposal
 * with selected layout, timeline, status actions and approve/reject buttons.
 */
export default async function ApprovePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ token?: string }>
}) {
    const { id } = await params
    const { token } = await searchParams
    redirect(`/quotes/${id}${token ? `?token=${encodeURIComponent(token)}` : ''}`)
}
