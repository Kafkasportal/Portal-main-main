// Common Types
export type Currency = 'TRY' | 'USD' | 'EUR'
export type PaymentMethod = 'nakit' | 'havale' | 'kredi-karti' | 'mobil-odeme'
export type PaymentStatus = 'beklemede' | 'tamamlandi' | 'iptal' | 'iade'

// JSON-compatible value type for dynamic data structures
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
export type JsonObject = { [key: string]: JsonValue }

export interface Timestamps {
  createdAt: Date
  updatedAt: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Document Types
export type DocumentType = 'kimlik' | 'ikamet' | 'saglik' | 'gelir' | 'diger'

export interface BeneficiaryDocument {
  id: number
  beneficiaryId: number
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  documentType: DocumentType
  uploadedBy?: string
  createdAt: Date
}

export interface FileUploadOptions {
  maxSize?: number // bytes
  acceptedTypes?: string[]
  onProgress?: (progress: number) => void
}

// User Types - Re-export from RBAC
export type { 
  RoleName, 
  PermissionName, 
  PermissionModule,
  Role,
  Permission as RBACPermission,
  StaffUser,
  RoleWithPermissions,
} from './rbac'

// Legacy UserRole for backward compatibility
export type UserRole = 'admin' | 'muhasebe' | 'gorevli' | 'uye'

export type Permission =
  | 'donations.view'
  | 'donations.create'
  | 'donations.edit'
  | 'donations.delete'
  | 'members.view'
  | 'members.create'
  | 'members.edit'
  | 'social-aid.view'
  | 'social-aid.approve'
  | 'reports.export'
  | 'settings.manage'

export interface User extends Timestamps {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  roleId?: string // RBAC role reference
  title?: string // Unvan
  department?: string // Birim
  avatar?: string
  isActive: boolean
  lastLogin?: Date
  hireDate?: Date
  permissions: Permission[]
}

// Notification Preferences
export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
}

// Backup Types
export type BackupType = 'full' | 'data-only' | 'schema-only'
export type BackupStatus = 'pending' | 'completed' | 'failed'

export interface Backup {
  id: string
  type: BackupType
  status: BackupStatus
  fileName: string
  filePath: string
  fileSize: number
  createdAt: Date
  completedAt?: Date
  error?: string
}

export interface BackupHistory {
  backups: Backup[]
  total: number
}

// Donation (Bağış) Types
export type DonationPurpose =
  | 'genel'
  | 'egitim'
  | 'saglik'
  | 'insani-yardim'
  | 'kurban'
  | 'fitre-zekat'

export interface Bagisci {
  id: number | string
  ad: string
  soyad: string
  telefon?: string
  email?: string
  adres?: string
}

export interface Bagis extends Timestamps {
  id: number
  bagisci: Bagisci
  tutar: number
  currency: Currency
  amac: DonationPurpose
  odemeYontemi: PaymentMethod
  durum: PaymentStatus
  makbuzNo?: string
  aciklama?: string
  fatura?: {
    url: string
    uploadedAt: Date
  }
}

export interface BagisStats {
  toplamBagis: number
  toplamBagisci: number
  aylikOrtalama: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

// Kumbara (Collection Box) Types
export type KumbaraStatus = 'aktif' | 'pasif' | 'bakim'

// GPS koordinatları için
export interface GpsKoordinat {
  lat: number
  lng: number
}

// Kumbara toplama (boşaltma) kaydı
export interface KumbaraToplama {
  id: number
  kumbaraId: number
  tarih: Date
  tutar: number
  toplayanKisi: User
  notlar?: string
}

// Kumbara QR kod bilgisi
export interface KumbaraQR {
  kod: string // QR kodun içeriği (unique identifier)
  tapilanTarih?: Date // QR kodun sisteme tanıtıldığı tarih
}

export interface Kumbara extends Timestamps {
  id: number
  kod: string
  ad: string // Kumbaranın adı (örn: "Merkez Cami Kumbarası")
  konum: string // Metin açıklaması (örn: "Merkez Cami Girişi")
  koordinat?: GpsKoordinat // GPS koordinatları (rota için)
  qrKod?: KumbaraQR // QR kod bilgisi
  sorumlu: User
  sonBosaltma?: Date
  toplamTutar: number
  toplamaBaşarina: number // Toplam toplanan miktar (geçmişten bugüne)
  toplamaGecmisi: KumbaraToplama[] // Toplama geçmişi
  durum: KumbaraStatus
  notlar?: string
  fotoğraf?: string // Kumbaranın fotoğrafı URL
}

// Member (Üye) Types
export type UyeTuru = 'aktif' | 'onursal' | 'genc' | 'destekci'
export type AidatDurumu = 'guncel' | 'gecmis' | 'muaf'
export type Cinsiyet = 'erkek' | 'kadin'

export interface UyeAdres {
  il: string
  ilce: string
  mahalle?: string
  acikAdres?: string
}

export interface Uye extends Timestamps {
  id: number
  tcKimlikNo: string
  ad: string
  soyad: string
  dogumTarihi: Date
  cinsiyet: Cinsiyet
  telefon: string
  email?: string
  adres: UyeAdres
  uyeTuru: UyeTuru
  uyeNo: string
  kayitTarihi: Date
  aidatDurumu: AidatDurumu
  kanGrubu?: string
  meslek?: string
  aidat: {
    tutar: number
    sonOdemeTarihi?: Date
  }
}

// Social Aid (Sosyal Yardım) Types
export type YardimTuru =
  | 'ayni'
  | 'nakdi'
  | 'egitim'
  | 'saglik'
  | 'kira'
  | 'fatura'
export type BasvuruDurumu =
  | 'beklemede'
  | 'inceleniyor'
  | 'onaylandi'
  | 'reddedildi'
  | 'odendi'

export interface BasvuranKisi {
  ad: string
  soyad: string
  tcKimlikNo: string
  telefon: string
  adres: string
}

export interface BasvuruBelge {
  url: string
  tur: string
  uploadedAt: Date
}

export interface OdemeBilgileri {
  tutar: number
  odemeTarihi: Date
  makbuzNo: string
  odemeYontemi: PaymentMethod
  iban?: string
  bankaAdi?: string
  durum?: string
}

export interface SosyalYardimBasvuru extends Timestamps {
  id: number
  basvuranKisi: BasvuranKisi
  yardimTuru: YardimTuru
  talepEdilenTutar?: number
  gerekce: string
  belgeler: BasvuruBelge[]
  durum: BasvuruDurumu
  degerlendiren?: User
  degerlendirmeTarihi?: Date
  degerlendirmeNotu?: string
  odemeBilgileri?: OdemeBilgileri
}

// İhtiyaç Sahibi (Beneficiary) Types - Kapsamlı Sistem
export type IhtiyacDurumu = 'taslak' | 'aktif' | 'pasif' | 'tamamlandi'

export type IhtiyacSahibiKategori =
  | 'yetim-ailesi'
  | 'multeci-aile'
  | 'ihtiyac-sahibi-aile'
  | 'ogrenci-yabanci'
  | 'ogrenci-tc'
  | 'vakif-dernek'
  | 'devlet-okulu'
  | 'kamu-kurumu'
  | 'ozel-egitim-kurumu'

export type IhtiyacSahibiTuru = 'ihtiyac-sahibi-kisi' | 'bakmakla-yukumlu'

export type FonBolgesi = 'avrupa' | 'serbest'

export type DosyaBaglantisi = 'partner-kurum' | 'calisma-sahasi'

export type KimlikBelgesiTuru =
  | 'yok'
  | 'nufus-cuzdani'
  | 'tc-kimlik-belgesi'
  | 'gecici-ikamet-belgesi'
  | 'yabanci-kimlik-belgesi'

export type PasaportTuru =
  | 'yok'
  | 'diplomatik'
  | 'gecici'
  | 'hizmet'
  | 'hususi'
  | 'umuma-mahsus'

export type VizeGirisTuru =
  | 'yok'
  | 'calisma-izni'
  | 'egitim-ogrenci'
  | 'gecici-ikamet'
  | 'ikinci-vatandaslik'
  | 'multeci'
  | 'siginmaci'
  | 'turist-seyahat'

export type MedeniHal = 'bekar' | 'evli' | 'dul' | 'bosanmis'

export type EgitimDurumu =
  | 'okur-yazar-degil'
  | 'ilkokul'
  | 'ortaokul'
  | 'lise'
  | 'universite'
  | 'yuksek-lisans'
  | 'doktora'

export type SaglikDurumu = 'iyi' | 'kronik-hasta' | 'engelli' | 'yasli-bakim'

export type RizaBeyaniDurumu = 'alinmadi' | 'alindi' | 'reddetti'

// Kimlik Bilgileri
export interface KimlikBilgileri {
  babaAdi?: string
  anneAdi?: string
  belgeTuru: KimlikBelgesiTuru
  belgeGecerlilikTarihi?: Date
  seriNumarasi?: string
  oncekiUyruk?: string
  oncekiIsim?: string
}

// Pasaport ve Vize Bilgileri
export interface PasaportVizeBilgileri {
  pasaportTuru: PasaportTuru
  pasaportNumarasi?: string
  pasaportGecerlilikTarihi?: Date
  vizeGirisTuru: VizeGirisTuru
  vizeBitisTarihi?: Date
  girisTarihi?: Date
  girisKapisi?: string
}

// Göç ve İkamet Bilgileri
export interface GocIkametBilgileri {
  geciciKorumaTarihi?: Date
  geciciKorumaIl?: string
  oturmaIzniTuru?: string
  oturmaIzniGecerlilikTarihi?: Date
  oturmaIzniAlinmaTarihi?: Date
  oturmaIzniYenilenmeTarihi?: Date
  yukumluOlduguKurum?: string
  sonGeldigiAdres?: string
}

// Sağlık Bilgileri
export interface SaglikBilgileri {
  kanGrubu?: string
  kronikHastalik?: string
  engelDurumu?: string
  engelOrani?: number
  surekliIlac?: string
  saglikGuvenceleri?: string
}

// Ekonomik ve Sosyal Durum
export interface EkonomikSosyalDurum {
  egitimDurumu?: EgitimDurumu
  meslek?: string
  calismaDurumu?: string
  aylikGelir?: number
  gelirKaynagi?: string
  konutDurumu?: 'kira' | 'ev-sahibi' | 'misafir' | 'barinma-merkezi'
  kiraTutari?: number
  borcDurumu?: string
  borcTutari?: number
}

// Aile ve Hane Bilgileri
export interface AileHaneBilgileri {
  medeniHal: MedeniHal
  esAdi?: string
  esTelefon?: string
  ailedekiKisiSayisi: number
  cocukSayisi: number
  yetimSayisi: number
  calısanSayisi: number
  bakmaklaYukumluSayisi: number
}

// Bağlantılı Kayıt Sayıları
export interface BaglantiliKayitlar {
  bankaHesaplari: number
  dokumanlar: number
  fotograflar: number
  baktigiYetimler: number
  baktigiKisiler: number
  sponsorlar: number
  referanslar: number
  gorusmeKayitlari: number
  gorusmeSeansTakibi: number
  yardimTalepleri: number
  yapilanYardimlar: number
  rizaBeyannamesi: number
  sosyalKartlar: number
}

// Ana İhtiyaç Sahibi Interface (Genişletilmiş)
export interface IhtiyacSahibi extends Timestamps {
  id: number

  // Temel Bilgiler
  tur: IhtiyacSahibiTuru
  kategori: IhtiyacSahibiKategori
  ad: string
  soyad: string
  uyruk: string
  dogumTarihi?: Date
  cinsiyet?: Cinsiyet
  tcKimlikNo?: string
  yabanciKimlikNo?: string

  // Dosya Bilgileri
  dosyaNo: string
  fonBolgesi?: FonBolgesi
  dosyaBaglantisi?: DosyaBaglantisi
  dosyaBaglantisiDetay?: string

  // İletişim
  cepTelefonu?: string
  cepTelefonuOperator?: string
  sabitTelefon?: string
  yurtdisiTelefon?: string
  email?: string

  // Adres Bilgileri
  ulke: string
  sehir: string
  ilce?: string
  mahalle?: string
  adres?: string

  // Alt Bilgiler
  kimlikBilgileri?: KimlikBilgileri
  pasaportVizeBilgileri?: PasaportVizeBilgileri
  gocIkametBilgileri?: GocIkametBilgileri
  saglikBilgileri?: SaglikBilgileri
  ekonomikDurum?: EkonomikSosyalDurum
  aileHaneBilgileri?: AileHaneBilgileri

  // Sponsorluk
  sponsorlukTipi?: 'bireysel' | 'kurumsal' | 'yok'

  // Durum ve İstatistikler
  durum: IhtiyacDurumu
  rizaBeyaniDurumu: RizaBeyaniDurumu
  kayitTarihi: Date
  sonAtamaTarihi?: Date

  // Yardım İstatistikleri
  basvuruSayisi: number
  yardimSayisi: number
  toplamYardimTutari: number
  sonYardimTarihi?: Date

  // Bağlantılı Kayıtlar
  baglantiliKayitlar?: BaglantiliKayitlar

  // Ek Bilgiler
  fotografUrl?: string
  notlar?: string
  mernisDogrulama?: boolean
}

// Liste görünümü için kısa versiyon
export interface IhtiyacSahibiListItem {
  id: number
  tur: IhtiyacSahibiTuru
  ad: string
  soyad: string
  kategori: IhtiyacSahibiKategori
  yas?: number
  uyruk: string
  tcKimlikNo?: string
  yabanciKimlikNo?: string
  cepTelefonu?: string
  ulke: string
  sehir: string
  ilce?: string
  adres?: string
  ailedekiKisiSayisi?: number
  yetimSayisi?: number
  basvuruSayisi: number
  yardimSayisi: number
  dosyaNo: string
  sonAtamaTarihi?: Date
  durum: IhtiyacDurumu
}

// Table State Types
export interface TableState {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, string | string[]>
}

// Dashboard Stats Types
export interface DashboardStats {
  totalDonations: number
  donationsTrend: number
  activeMembers: number
  membersGrowth?: number
  totalBeneficiaries?: number
  pendingApplications: number
  monthlyAid: number
  aidGrowth?: number
  monthlyDonationTotal?: number
  donationGrowth?: number
  monthlyDonations: MonthlyData[]
  aidDistribution: AidDistributionData[]
  recentDonations: Bagis[]
  recentApplications?: Array<{
    id: number
    basvuranKisi: { ad: string; soyad: string }
    talepEdilenTutar: number
    durum: string
    createdAt: string
  }>
  recentMembers?: Array<{
    id: number
    ad: string
    soyad: string
    uyeNo: string
    uyeTuru: string
    createdAt: string
  }>
  beneficiaryCounts?: {
    aktif: number
    pasif: number
    tamamlandi: number
  }
}

export interface MonthlyData {
  month: string
  amount: number
}

export interface AidDistributionData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

// Payment Types
export type PaymentMethodVezne = 'nakit' | 'havale' | 'elden'
export type PaymentStatusVezne = 'beklemede' | 'odendi' | 'iptal'

export interface Payment extends Timestamps {
  id: number
  applicationId?: number
  beneficiaryId: number
  beneficiary?: {
    ad: string
    soyad: string
  }
  tutar: number
  odemeTarihi: Date
  odemeYontemi: PaymentMethodVezne
  durum: PaymentStatusVezne
  makbuzNo?: string
  notlar?: string
}

export interface CashSummary {
  toplamTutar: number
  nakitTutar: number
  havaleTutar: number
  eldenTutar: number
  odemeSayisi: number
  tarih: Date
}

export interface Receipt {
  id: string
  makbuzNo: string
  paymentId: number
  beneficiaryName: string
  tutar: number
  odemeYontemi: PaymentMethodVezne
  odemeTarihi: Date
  createdAt: Date
}

// In-Kind Aid Types
export type InKindAidType = 'gida' | 'giyim' | 'yakacak' | 'diger'
export type InKindAidUnit = 'adet' | 'kg' | 'paket' | 'kutu' | 'takim' | 'diger'

export interface InKindAid extends Timestamps {
  id: number
  beneficiaryId: number
  beneficiary?: {
    ad: string
    soyad: string
  }
  yardimTuru: InKindAidType
  miktar: number
  birim: InKindAidUnit
  dagitimTarihi: Date
  notlar?: string
}

// Financial Summary Types
export interface FinancialSummary {
  toplamGelir: number
  toplamGider: number
  netBakiye: number
  buAyGelir: number
  buAyGider: number
  gecenAyGelir: number
  gecenAyGider: number
  gelirArtis: number
  giderArtis: number
}

export interface IncomeExpenseReport {
  tarih: Date
  gelir: number
  gider: number
  net: number
}

export interface CategorySummary {
  kategori: string
  tutar: number
  yuzde: number
}

// Hospital Referral & Treatment Types
export type ReferralStatus = 'referred' | 'scheduled' | 'treated' | 'follow-up' | 'cancelled'
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed'
export type TreatmentCostStatus = 'pending' | 'paid' | 'partially_paid'

export interface Hospital extends Timestamps {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  specialties: string[]
  isActive: boolean
  notes?: string
}

export interface Referral extends Timestamps {
  id: string
  beneficiaryId: string
  beneficiary?: { ad: string; soyad: string }
  hospitalId: string
  hospital?: { name: string }
  reason: string
  referralDate: Date
  status: ReferralStatus
  notes?: string
}

export interface HospitalAppointment extends Timestamps {
  id: string
  referralId: string
  appointmentDate: Date
  location?: string
  status: AppointmentStatus
  reminderSent: boolean
  notes?: string
}

export interface TreatmentCost extends Timestamps {
  id: string
  referralId: string
  description: string
  amount: number
  currency: Currency
  paymentStatus: TreatmentCostStatus
  paymentDate?: Date
  paymentMethod?: PaymentMethod
  incurredDate: Date
}

export interface TreatmentOutcome extends Timestamps {
  id: string
  referralId: string
  appointmentId?: string
  diagnosis?: string
  treatmentReceived?: string
  outcomeNotes?: string
  followUpNeeded: boolean
  followUpDate?: Date
}

// Navigation Types
export interface NavItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  badge?: number
}

// =============================================
// BENEFICIARY NEED ASSESSMENT TYPES
// =============================================

export type AssessmentType = 'initial' | 'follow-up' | 'review' | 'updated'
export type AssessmentStatus = 'draft' | 'in-progress' | 'completed' | 'archived'
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low'
export type HousingType = 'owned' | 'rented' | 'shared' | 'shelter' | 'informal'
export type HousingCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
export type HealthStatus = 'healthy' | 'chronic-illness' | 'disabled' | 'elderly'
export type EmploymentStatus = 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired' | 'disabled'
export type RelationshipType = 'child' | 'parent' | 'sibling' | 'spouse' | 'grandparent' | 'other'
export type DependentEducationStatus = 'student' | 'not-attending' | 'completed' | 'not-applicable'

// Dependent in assessment
export interface AssessmentDependent {
  id?: string
  assessmentId?: string
  name: string
  relationship: RelationshipType
  age?: number
  gender?: 'male' | 'female' | 'other'
  healthStatus: HealthStatus
  educationStatus: DependentEducationStatus
  employmentStatus: string
  supportNeeds: string[]
  monthlyCost?: number
  createdAt?: Date
}

// Assessment Document
export interface AssessmentDocument {
  id: string
  assessmentId: string
  documentType: string
  fileName: string
  filePath: string
  fileSize: number
  uploadedBy?: string
  createdAt: Date
}

// Main Need Assessment Form
export interface NeedAssessmentForm {
  // Beneficiary Reference
  beneficiaryId: string
  
  // Assessment Info
  assessmentDate: Date
  assessorId?: string
  assessmentType: AssessmentType
  
  // Family Composition
  householdSize: number
  dependents: AssessmentDependent[]
  dependentCount: number
  childrenCount: number
  elderlyCount: number
  disabledCount: number
  orphansCount: number
  
  // Income
  monthlyIncome: number
  incomeSources: string[]
  incomeVerified: boolean
  incomeDocumentation?: string
  
  // Expenses
  monthlyExpenses: number
  rentExpense?: number
  utilitiesExpense?: number
  foodExpense?: number
  healthExpense?: number
  educationExpense?: number
  otherExpenses?: number
  
  // Housing
  housingType: HousingType
  housingCondition: HousingCondition
  hasUtilities: boolean
  
  // Health & Education
  healthIssues: string[]
  educationNeeds: string[]
  employmentStatus: EmploymentStatus
  
  // Specific Needs
  specificNeeds?: JsonObject
  
  // Recommendations
  recommendedAidTypes: string[]
  recommendedAidAmount?: number
  assessmentNotes?: string
}

// Need Assessment with Metadata
export interface NeedAssessment extends Timestamps {
  id: string
  beneficiaryId: string
  assessmentDate: Date
  assessorId: string
  assessmentType: AssessmentType
  status: AssessmentStatus
  
  // Family
  householdSize: number
  dependentCount: number
  childrenCount: number
  elderlyCount: number
  disabledCount: number
  orphansCount: number
  
  // Financial
  monthlyIncome: number
  incomeSources: string[]
  incomeVerified: boolean
  incomeDocumentation?: string
  
  monthlyExpenses: number
  rentExpense?: number
  utilitiesExpense?: number
  foodExpense?: number
  healthExpense?: number
  educationExpense?: number
  otherExpenses?: number
  
  // Housing
  housingType: HousingType
  housingCondition: HousingCondition
  hasUtilities: boolean
  
  // Health & Social
  healthIssues: string[]
  educationNeeds: string[]
  employmentStatus: EmploymentStatus
  specificNeeds?: JsonObject
  
  // Scoring
  priorityScore: number
  priorityLevel: PriorityLevel
  
  // Recommendations
  recommendedAidTypes: string[]
  recommendedAidAmount?: number
  assessmentNotes?: string
  
  // Related Data
  dependents?: AssessmentDependent[]
  documents?: AssessmentDocument[]
}

// Assessment History
export interface AssessmentHistoryRecord {
  id: string
  beneficiaryId: string
  assessmentId: string
  assessmentDate: Date
  priorityLevel: PriorityLevel
  priorityScore: number
  householdSize: number
  monthlyIncome: number
  monthlyExpenses: number
  recommendedAidAmount?: number
  assessorName?: string
  createdAt: Date
}

// Priority Score Calculation Result
export interface PriorityScoreResult {
  score: number
  priorityLevel: PriorityLevel
}

// Assessment Summary for Dashboard
export interface AssessmentSummary {
  totalAssessments: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  averagePriorityScore: number
  recentAssessments: NeedAssessment[]
}

// =============================================
// ACTIVITY AUDIT LOG TYPES
// =============================================

export type AuditActionType = 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout' | 'access_denied'
export type AuditSeverity = 'info' | 'warning' | 'critical'
export type AuditStatus = 'success' | 'failure' | 'attempted'

// Base audit log entry (from audit_logs table)
export interface AuditLog extends Timestamps {
  id: string
  userId?: string
  action: string
  actionType?: AuditActionType
  tableName: string
  recordId?: string
  oldData?: JsonObject
  newData?: JsonObject
  ipAddress?: string
  entityName?: string
  changeSummary?: string
  severity?: AuditSeverity
  status?: AuditStatus
}

// Enhanced audit event (from audit_events table)
export interface AuditEvent extends Timestamps {
  id: string
  userId?: string
  eventType: string
  entityType: string
  entityId?: string
  action: string
  beforeData?: JsonObject
  afterData?: JsonObject
  metadata?: JsonObject
  ipAddress?: string
  userAgent?: string
  requestId?: string
  severity: AuditSeverity
  status: AuditStatus
  errorMessage?: string
  indexedAt?: Date
}

// User session tracking
export interface UserSession extends Timestamps {
  id: string
  userId: string
  ipAddress?: string
  userAgent?: string
  loginAt: Date
  logoutAt?: Date
  sessionDurationSeconds?: number
  status: 'active' | 'expired' | 'logged_out'
}

// Audit log configuration
export interface AuditLogConfig extends Timestamps {
  id: string
  key: string
  value: JsonObject
  description?: string
  updatedBy?: string
  updatedAt: Date
}

// Audit trail for a specific record
export interface AuditTrail {
  recordId: string
  tableName: string
  entries: AuditLog[]
  summary: {
    totalChanges: number
    firstChange: Date
    lastChange: Date
    changedBy: string[]
  }
}

// Audit statistics
export interface AuditStatistics {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsByUser: Record<string, number>
  criticalEvents: number
  failedEvents: number
  dateRange: {
    from: Date
    to: Date
  }
}

// Audit log filter options
export interface AuditLogFilter {
  userId?: string
  action?: AuditActionType
  actionType?: AuditActionType
  tableName?: string
  entityType?: string
  severity?: AuditSeverity
  status?: AuditStatus
  dateFrom?: Date
  dateTo?: Date
  searchText?: string
  page?: number
  limit?: number
}

// Paginated audit log response
export interface PaginatedAuditLogs {
  data: AuditLog[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Change detail for audit log
export interface ChangeDetail {
  field: string
  oldValue: JsonValue
  newValue: JsonValue
  changed: boolean
  valueType?: string
}

// User activity summary
export interface UserActivitySummary {
  userId: string
  userName: string
  totalActions: number
  actionsToday: number
  lastActivityAt?: Date
  mostCommonAction: AuditActionType
  sessions: UserSession[]
}

// Audit log export format
export interface AuditLogExport {
  id: string
  timestamp: string
  userId: string
  userName?: string
  action: string
  entityType: string
  entityId?: string
  changes?: string
  ipAddress?: string
  severity?: string
  status?: string
}
