'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportToCSV, exportToJSON } from '@/lib/export'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

interface DataTableExportButtonProps<TData extends Record<string, any>> {
  data: TData[]
  filename?: string
  disabled?: boolean
}

/**
 * Export Button Component
 * Allows users to export table data in CSV or JSON format
 */
export function DataTableExportButton<TData extends Record<string, any>>({
  data,
  filename = 'export',
  disabled = false,
}: DataTableExportButtonProps<TData>) {
  const handleExportCSV = () => {
    try {
      if (data.length === 0) {
        toast.error('Dışa aktarılacak veri yok', {
          description: 'Lütfen en az bir satır seçin veya tüm verileri dışa aktarın.',
        })
        return
      }

      exportToCSV(data, `${filename}.csv`)
      toast.success('Başarıyla dışa aktarıldı', {
        description: `${data.length} satır CSV olarak indirildi.`,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Dışa aktarma başarısız', {
        description: 'Lütfen tekrar deneyiniz.',
      })
    }
  }

  const handleExportJSON = () => {
    try {
      if (data.length === 0) {
        toast.error('Dışa aktarılacak veri yok', {
          description: 'Lütfen en az bir satır seçin veya tüm verileri dışa aktarın.',
        })
        return
      }

      exportToJSON(data, `${filename}.json`)
      toast.success('Başarıyla dışa aktarıldı', {
        description: `${data.length} satır JSON olarak indirildi.`,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Dışa aktarma başarısız', {
        description: 'Lütfen tekrar deneyiniz.',
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || data.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Dışa Aktar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Format Seçin</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportCSV}>
          <span className="font-mono">CSV</span>
          <span className="text-muted-foreground ml-2 text-xs">
            (Virgülle ayrılmış)
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <span className="font-mono">JSON</span>
          <span className="text-muted-foreground ml-2 text-xs">
            (Yapılandırılmış veri)
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
