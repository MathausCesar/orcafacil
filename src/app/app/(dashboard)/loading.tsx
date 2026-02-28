export default function Loading() {
    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border h-20" />

            {/* CTA Skeleton */}
            <div className="rounded-3xl bg-muted h-48" />

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2 bg-card rounded-2xl h-48" />
                <div className="bg-card rounded-2xl h-48" />
            </div>

            {/* Recent Items Skeleton */}
            <div className="space-y-6">
                <div className="h-8 bg-muted rounded w-48" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card p-5 rounded-2xl border border-border h-20" />
                    ))}
                </div>
            </div>
        </div>
    )
}
