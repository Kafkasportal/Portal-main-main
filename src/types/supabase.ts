export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'moderator' | 'user'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'moderator' | 'user'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'moderator' | 'user'
          avatar_url?: string | null
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: number
          tc_kimlik_no: string
          ad: string
          soyad: string
          email: string | null
          telefon: string
          cinsiyet: 'erkek' | 'kadin'
          dogum_tarihi: string | null
          adres: string | null
          il: string | null
          ilce: string | null
          kan_grubu: string | null
          meslek: string | null
          uye_turu: 'standart' | 'onursal' | 'fahri'
          kayit_tarihi: string
          aidat_durumu: 'odendi' | 'beklemede' | 'gecikti'
          notlar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          tc_kimlik_no: string
          ad: string
          soyad: string
          email?: string | null
          telefon: string
          cinsiyet: 'erkek' | 'kadin'
          dogum_tarihi?: string | null
          adres?: string | null
          il?: string | null
          ilce?: string | null
          kan_grubu?: string | null
          meslek?: string | null
          uye_turu?: 'standart' | 'onursal' | 'fahri'
          kayit_tarihi?: string
          aidat_durumu?: 'odendi' | 'beklemede' | 'gecikti'
          notlar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          tc_kimlik_no?: string
          ad?: string
          soyad?: string
          email?: string | null
          telefon?: string
          cinsiyet?: 'erkek' | 'kadin'
          dogum_tarihi?: string | null
          adres?: string | null
          il?: string | null
          ilce?: string | null
          kan_grubu?: string | null
          meslek?: string | null
          uye_turu?: 'standart' | 'onursal' | 'fahri'
          aidat_durumu?: 'odendi' | 'beklemede' | 'gecikti'
          notlar?: string | null
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: number
          bagisci_adi: string
          tutar: number
          currency: 'TRY' | 'EUR' | 'USD'
          amac: string
          odeme_yontemi: 'nakit' | 'havale' | 'kredi_karti' | 'kumbara'
          makbuz_no: string | null
          tarih: string
          aciklama: string | null
          member_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          bagisci_adi: string
          tutar: number
          currency?: 'TRY' | 'EUR' | 'USD'
          amac: string
          odeme_yontemi: 'nakit' | 'havale' | 'kredi_karti' | 'kumbara'
          makbuz_no?: string | null
          tarih?: string
          aciklama?: string | null
          member_id?: number | null
          created_at?: string
        }
        Update: {
          bagisci_adi?: string
          tutar?: number
          currency?: 'TRY' | 'EUR' | 'USD'
          amac?: string
          odeme_yontemi?: 'nakit' | 'havale' | 'kredi_karti' | 'kumbara'
          makbuz_no?: string | null
          tarih?: string
          aciklama?: string | null
          member_id?: number | null
        }
      }
      beneficiaries: {
        Row: {
          id: number
          tc_kimlik_no: string
          ad: string
          soyad: string
          telefon: string
          email: string | null
          adres: string | null
          il: string | null
          ilce: string | null
          cinsiyet: 'erkek' | 'kadin'
          dogum_tarihi: string | null
          medeni_hal: string | null
          egitim_durumu: string | null
          meslek: string | null
          aylik_gelir: number | null
          hane_buyuklugu: number | null
          durum: 'aktif' | 'pasif' | 'beklemede'
          ihtiyac_durumu: 'acil' | 'yuksek' | 'orta' | 'dusuk'
          kategori: string | null
          notlar: string | null
          // Bağlantılı kişiler için yeni sütunlar
          parent_id: number | null
          relationship_type:
            | 'İhtiyaç Sahibi Kişi'
            | 'Bakmakla Yükümlü Olunan Kişi'
            | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          tc_kimlik_no: string
          ad: string
          soyad: string
          telefon: string
          email?: string | null
          adres?: string | null
          il?: string | null
          ilce?: string | null
          cinsiyet: 'erkek' | 'kadin'
          dogum_tarihi?: string | null
          medeni_hal?: string | null
          egitim_durumu?: string | null
          meslek?: string | null
          aylik_gelir?: number | null
          hane_buyuklugu?: number | null
          durum?: 'aktif' | 'pasif' | 'beklemede'
          ihtiyac_durumu?: 'acil' | 'yuksek' | 'orta' | 'dusuk'
          kategori?: string | null
          notlar?: string | null
          parent_id?: number | null
          relationship_type?:
            | 'İhtiyaç Sahibi Kişi'
            | 'Bakmakla Yükümlü Olunan Kişi'
            | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          tc_kimlik_no?: string
          ad?: string
          soyad?: string
          telefon?: string
          email?: string | null
          adres?: string | null
          il?: string | null
          ilce?: string | null
          cinsiyet?: 'erkek' | 'kadin'
          dogum_tarihi?: string | null
          medeni_hal?: string | null
          egitim_durumu?: string | null
          meslek?: string | null
          aylik_gelir?: number | null
          hane_buyuklugu?: number | null
          durum?: 'aktif' | 'pasif' | 'beklemede'
          ihtiyac_durumu?: 'acil' | 'yuksek' | 'orta' | 'dusuk'
          kategori?: string | null
          notlar?: string | null
          parent_id?: number | null
          relationship_type?:
            | 'İhtiyaç Sahibi Kişi'
            | 'Bakmakla Yükümlü Olunan Kişi'
            | null
          updated_at?: string
        }
      }
      kumbaras: {
        Row: {
          id: number
          kod: string
          konum: string
          durum: 'aktif' | 'pasif' | 'toplandi' | 'kayip'
          sorumlu_id: number | null
          son_toplama_tarihi: string | null
          toplam_toplanan: number
          notlar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          kod: string
          konum: string
          durum?: 'aktif' | 'pasif' | 'toplandi' | 'kayip'
          sorumlu_id?: number | null
          son_toplama_tarihi?: string | null
          toplam_toplanan?: number
          notlar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          kod?: string
          konum?: string
          durum?: 'aktif' | 'pasif' | 'toplandi' | 'kayip'
          sorumlu_id?: number | null
          son_toplama_tarihi?: string | null
          toplam_toplanan?: number
          notlar?: string | null
          updated_at?: string
        }
      }
      social_aid_applications: {
        Row: {
          id: number
          basvuran_id: number
          yardim_turu: string
          talep_edilen_tutar: number | null
          onaylanan_tutar: number | null
          durum: 'beklemede' | 'inceleniyor' | 'onaylandi' | 'reddedildi'
          basvuru_tarihi: string
          degerlendirme_tarihi: string | null
          gerekce: string | null
          notlar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          basvuran_id: number
          yardim_turu: string
          talep_edilen_tutar?: number | null
          onaylanan_tutar?: number | null
          durum?: 'beklemede' | 'inceleniyor' | 'onaylandi' | 'reddedildi'
          basvuru_tarihi?: string
          degerlendirme_tarihi?: string | null
          gerekce?: string | null
          notlar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          basvuran_id?: number
          yardim_turu?: string
          talep_edilen_tutar?: number | null
          onaylanan_tutar?: number | null
          durum?: 'beklemede' | 'inceleniyor' | 'onaylandi' | 'reddedildi'
          degerlendirme_tarihi?: string | null
          gerekce?: string | null
          notlar?: string | null
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: number
          application_id: number
          beneficiary_id: number
          tutar: number
          odeme_tarihi: string
          odeme_yontemi: 'nakit' | 'havale' | 'elden'
          durum: 'beklemede' | 'odendi' | 'iptal'
          notlar: string | null
          created_at: string
        }
        Insert: {
          id?: number
          application_id: number
          beneficiary_id: number
          tutar: number
          odeme_tarihi?: string
          odeme_yontemi: 'nakit' | 'havale' | 'elden'
          durum?: 'beklemede' | 'odendi' | 'iptal'
          notlar?: string | null
          created_at?: string
        }
        Update: {
          tutar?: number
          odeme_tarihi?: string
          odeme_yontemi?: 'nakit' | 'havale' | 'elden'
          durum?: 'beklemede' | 'odendi' | 'iptal'
          notlar?: string | null
        }
      }
      hospitals: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          specialties: string[] | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          specialties?: string[] | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          specialties?: string[] | null
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          beneficiary_id: string
          hospital_id: string
          reason: string
          referral_date: string
          status:
            | 'referred'
            | 'scheduled'
            | 'treated'
            | 'follow-up'
            | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          beneficiary_id: string
          hospital_id: string
          reason: string
          referral_date?: string
          status?:
            | 'referred'
            | 'scheduled'
            | 'treated'
            | 'follow-up'
            | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string
          hospital_id?: string
          reason?: string
          referral_date?: string
          status?:
            | 'referred'
            | 'scheduled'
            | 'treated'
            | 'follow-up'
            | 'cancelled'
          notes?: string | null
          updated_at?: string
        }
      }
      hospital_appointments: {
        Row: {
          id: string
          referral_id: string
          appointment_date: string
          location: string | null
          status: 'scheduled' | 'completed' | 'cancelled' | 'missed'
          reminder_sent: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          referral_id: string
          appointment_date: string
          location?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled' | 'missed'
          reminder_sent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          referral_id?: string
          appointment_date?: string
          location?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled' | 'missed'
          reminder_sent?: boolean
          notes?: string | null
          updated_at?: string
        }
      }
      treatment_costs: {
        Row: {
          id: string
          referral_id: string
          description: string
          amount: number
          currency: 'TRY' | 'EUR' | 'USD'
          payment_status: 'pending' | 'paid' | 'partially_paid'
          payment_date: string | null
          payment_method: 'nakit' | 'havale' | 'elden' | null
          incurred_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          referral_id: string
          description: string
          amount: number
          currency?: 'TRY' | 'EUR' | 'USD'
          payment_status?: 'pending' | 'paid' | 'partially_paid'
          payment_date?: string | null
          payment_method?: 'nakit' | 'havale' | 'elden' | null
          incurred_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          referral_id?: string
          description?: string
          amount?: number
          currency?: 'TRY' | 'EUR' | 'USD'
          payment_status?: 'pending' | 'paid' | 'partially_paid'
          payment_date?: string | null
          payment_method?: 'nakit' | 'havale' | 'elden' | null
          incurred_date?: string
          updated_at?: string
        }
      }
      treatment_outcomes: {
        Row: {
          id: string
          referral_id: string
          appointment_id: string | null
          diagnosis: string | null
          treatment_received: string | null
          outcome_notes: string | null
          follow_up_needed: boolean
          follow_up_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          referral_id: string
          appointment_id?: string | null
          diagnosis?: string | null
          treatment_received?: string | null
          outcome_notes?: string | null
          follow_up_needed?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          referral_id?: string
          appointment_id?: string | null
          diagnosis?: string | null
          treatment_received?: string | null
          outcome_notes?: string | null
          follow_up_needed?: boolean
          follow_up_date?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
