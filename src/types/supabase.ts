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
          id: string
          tc_kimlik_no: string
          ad: string
          soyad: string
          email: string | null
          telefon: string
          cinsiyet: 'erkek' | 'kadin'
          dogum_tarihi: string | null
          adres: string | null
          uye_turu: 'standart' | 'onursal' | 'fahri'
          kayit_tarihi: string
          aidat_durumu: 'odendi' | 'beklemede' | 'gecikti'
          notlar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tc_kimlik_no: string
          ad: string
          soyad: string
          email?: string | null
          telefon: string
          cinsiyet: 'erkek' | 'kadin'
          dogum_tarihi?: string | null
          adres?: string | null
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
          uye_turu?: 'standart' | 'onursal' | 'fahri'
          aidat_durumu?: 'odendi' | 'beklemede' | 'gecikti'
          notlar?: string | null
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          bagisci_adi: string
          tutar: number
          currency: 'TRY' | 'EUR' | 'USD'
          amac: string
          odeme_yontemi: 'nakit' | 'havale' | 'kredi_karti' | 'kumbara'
          makbuz_no: string | null
          tarih: string
          aciklama: string | null
          member_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bagisci_adi: string
          tutar: number
          currency?: 'TRY' | 'EUR' | 'USD'
          amac: string
          odeme_yontemi: 'nakit' | 'havale' | 'kredi_karti' | 'kumbara'
          makbuz_no?: string | null
          tarih?: string
          aciklama?: string | null
          member_id?: string | null
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
          member_id?: string | null
        }
      }
      beneficiaries: {
        Row: {
          id: string
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
          parent_id: string | null
          relationship_type: 'İhtiyaç Sahibi Kişi' | 'Bakmakla Yükümlü Olunan Kişi' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
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
          parent_id?: string | null
          relationship_type?: 'İhtiyaç Sahibi Kişi' | 'Bakmakla Yükümlü Olunan Kişi' | null
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
          parent_id?: string | null
          relationship_type?: 'İhtiyaç Sahibi Kişi' | 'Bakmakla Yükümlü Olunan Kişi' | null
          updated_at?: string
        }
      }
      kumbaras: {
        Row: {
          id: string
          kod: string
          konum: string
          durum: 'aktif' | 'pasif' | 'toplandi' | 'kayip'
          sorumlu_id: string | null
          son_toplama_tarihi: string | null
          toplam_toplanan: number
          notlar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kod: string
          konum: string
          durum?: 'aktif' | 'pasif' | 'toplandi' | 'kayip'
          sorumlu_id?: string | null
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
          sorumlu_id?: string | null
          son_toplama_tarihi?: string | null
          toplam_toplanan?: number
          notlar?: string | null
          updated_at?: string
        }
      }
      social_aid_applications: {
        Row: {
          id: string
          basvuran_id: string
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
          id?: string
          basvuran_id: string
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
          basvuran_id?: string
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
          id: string
          application_id: string
          beneficiary_id: string
          tutar: number
          odeme_tarihi: string
          odeme_yontemi: 'nakit' | 'havale' | 'elden'
          durum: 'beklemede' | 'odendi' | 'iptal'
          notlar: string | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          beneficiary_id: string
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
