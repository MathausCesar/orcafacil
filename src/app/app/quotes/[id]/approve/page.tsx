import { redirect } from 'next/navigation'

/**
 * Redirect to the main quote page which already renders the full proposal
 * with selected layout, timeline, status actions and approve/reject buttons.
 */
export default async function ApprovePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    redirect(`/quotes/${id}`)
}
