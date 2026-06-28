import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

type PdfDownloadButtonProps = {
    href: string
}

export function PdfDownloadButton({ href }: PdfDownloadButtonProps) {
    return (
        <Button asChild size="sm" variant="outline" className="gap-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-50 print:hidden">
            <a href={href}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Baixar PDF</span>
            </a>
        </Button>
    )
}
