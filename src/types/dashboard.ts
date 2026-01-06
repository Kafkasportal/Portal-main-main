// =============================================================================
// Data Types
// =============================================================================

export interface Stat {
  id: string
  label: string
  value: number
  currency?: 'TRY' | 'USD' | 'EUR'
  change: number
  trend: 'up' | 'down' | 'stable'
  description: string
}

export interface FinancialTrendData {
  month: string
  income: number
  expense: number
}

export interface PendingApplication {
  id: string
  applicantName: string
  applicationType: 'nakdi' | 'ayni' | 'eğitim' | 'sağlık' | 'kira' | 'fatura'
  requestedAmount: number
  currency: 'TRY' | 'USD' | 'EUR'
  applicationDate: string
  status: 'beklemede' | 'inceleniyor' | 'onaylandı' | 'reddedildi'
  priority: 'düşük' | 'orta' | 'yüksek' | 'acil'
  note?: string
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  route: string
  description: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface DashboardProps {
  /** İstatistik kartları için özet metrikler */
  stats: Stat[]
  /** Gelir-gider trendi için aylık veri */
  financialTrend: FinancialTrendData[]
  /** Bekleyen başvurular listesi */
  pendingApplications: PendingApplication[]
  /** Hızlı erişim butonları */
  quickActions: QuickAction[]
  /** İstatistik kartına tıklandığında çağrılır */
  onStatClick?: (statId: string) => void
  /** Başvuruya tıklandığında çağrılır */
  onApplicationClick?: (applicationId: string) => void
  /** Hızlı erişim butonuna tıklandığında çağrılır */
  onQuickActionClick?: (actionId: string) => void
  /** Komut paleti açıldığında çağrılır */
  onCommandPaletteOpen?: () => void
}
