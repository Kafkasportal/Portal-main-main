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
          role: 'admin' | 'moderator' | 'muhasebe' | 'user'
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'moderator' | 'muhasebe' | 'user'
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'moderator' | 'muhasebe' | 'user'
          phone?: string | null
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
          kan_grubu: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-' | null
          meslek: string | null
          meslegi: string | null
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
          kan_grubu?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-' | null
          meslek?: string | null
          meslegi?: string | null
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
          kan_grubu?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-' | null
          meslek?: string | null
          meslegi?: string | null
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
          bagisci_telefon: string | null
          bagisci_email: string | null
          bagisci_adres: string | null
          tutar: number
          currency: 'TRY' | 'USD' | 'EUR'
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
          bagisci_telefon?: string | null
          bagisci_email?: string | null
          bagisci_adres?: string | null
          tutar: number
          currency?: 'TRY' | 'USD' | 'EUR'
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
          bagisci_telefon?: string | null
          bagisci_email?: string | null
          bagisci_adres?: string | null
          tutar?: number
          currency?: 'TRY' | 'USD' | 'EUR'
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
          tc_kimlik_no: string | null
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
          durum: 'aktif' | 'pasif' | 'arsiv' | 'beklemede'
          ihtiyac_durumu: 'acil' | 'yuksek' | 'orta' | 'dusuk'
          kategori: string | null
          notlar: string | null
          parent_id: number | null
          relationship_type: 'İhtiyaç Sahibi Kişi' | 'Bakmakla Yükümlü Olunan Kişi' | null
          uyruk: string | null
          yabanci_kimlik_no: string | null
          fon_bolgesi: string | null
          dosya_baglantisi: string | null
          mernis_dogrulama: boolean | null
          cep_telefonu: string | null
          cep_telefonu_operator: string | null
          sabit_telefon: string | null
          yurtdisi_telefon: string | null
          ulke: string | null
          sehir: string | null
          mahalle: string | null
          baba_adi: string | null
          anne_adi: string | null
          belge_turu: string | null
          belge_gecerlilik_tarihi: string | null
          seri_numarasi: string | null
          onceki_uyruk: string | null
          onceki_isim: string | null
          pasaport_turu: string | null
          pasaport_numarasi: string | null
          pasaport_gecerlilik_tarihi: string | null
          vize_giris_turu: string | null
          vize_bitis_tarihi: string | null
          kan_grubu: string | null
          kronik_hastalik: string | null
          engel_durumu: string | null
          engel_orani: number | null
          surekli_ilac: string | null
          calisma_durumu: string | null
          konut_durumu: string | null
          kira_tutari: number | null
          es_adi: string | null
          es_telefon: string | null
          ailedeki_kisi_sayisi: number | null
          cocuk_sayisi: number | null
          yetim_sayisi: number | null
          calisan_sayisi: number | null
          bakmakla_yukumlu_sayisi: number | null
          sponsorluk_tipi: 'bireysel' | 'kurumsal' | 'yok' | null
          riza_beyani_durumu: 'alinmadi' | 'alindi' | 'reddetti' | null
          created_at: string
          updated_at: string
          // JSONB fields sometimes added via extension
          kimlik_bilgileri?: Json | null
          saglik_bilgileri?: Json | null
          ekonomik_durum?: Json | null
          aile_hane_bilgileri?: Json | null
        }
        Insert: {
          id?: number
          tc_kimlik_no?: string | null
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
          durum?: 'aktif' | 'pasif' | 'arsiv' | 'beklemede'
          ihtiyac_durumu?: 'acil' | 'yuksek' | 'orta' | 'dusuk'
          kategori?: string | null
          notlar?: string | null
          parent_id?: number | null
          relationship_type?: 'İhtiyaç Sahibi Kişi' | 'Bakmakla Yükümlü Olunan Kişi' | null
          uyruk?: string | null
          yabanci_kimlik_no?: string | null
          fon_bolgesi?: string | null
          dosya_baglantisi?: string | null
          mernis_dogrulama?: boolean | null
          cep_telefonu?: string | null
          cep_telefonu_operator?: string | null
          sabit_telefon?: string | null
          yurtdisi_telefon?: string | null
          ulke?: string | null
          sehir?: string | null
          mahalle?: string | null
          baba_adi?: string | null
          anne_adi?: string | null
          belge_turu?: string | null
          belge_gecerlilik_tarihi?: string | null
          seri_numarasi?: string | null
          onceki_uyruk?: string | null
          onceki_isim?: string | null
          pasaport_turu?: string | null
          pasaport_numarasi?: string | null
          pasaport_gecerlilik_tarihi?: string | null
          vize_giris_turu?: string | null
          vize_bitis_tarihi?: string | null
          kan_grubu?: string | null
          kronik_hastalik?: string | null
          engel_durumu?: string | null
          engel_orani?: number | null
          surekli_ilac?: string | null
          calisma_durumu?: string | null
          konut_durumu?: string | null
          kira_tutari?: number | null
          es_adi?: string | null
          es_telefon?: string | null
          ailedeki_kisi_sayisi?: number | null
          cocuk_sayisi?: number | null
          yetim_sayisi?: number | null
          calisan_sayisi?: number | null
          bakmakla_yukumlu_sayisi?: number | null
          sponsorluk_tipi?: 'bireysel' | 'kurumsal' | 'yok' | null
          riza_beyani_durumu?: 'alinmadi' | 'alindi' | 'reddetti' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          tc_kimlik_no?: string | null
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
          durum?: 'aktif' | 'pasif' | 'arsiv' | 'beklemede'
          ihtiyac_durumu?: 'acil' | 'yuksek' | 'orta' | 'dusuk'
          kategori?: string | null
          notlar?: string | null
          parent_id?: number | null
          relationship_type?: 'İhtiyaç Sahibi Kişi' | 'Bakmakla Yükümlü Olunan Kişi' | null
          uyruk?: string | null
          yabanci_kimlik_no?: string | null
          fon_bolgesi?: string | null
          dosya_baglantisi?: string | null
          mernis_dogrulama?: boolean | null
          cep_telefonu?: string | null
          cep_telefonu_operator?: string | null
          sabit_telefon?: string | null
          yurtdisi_telefon?: string | null
          ulke?: string | null
          sehir?: string | null
          mahalle?: string | null
          baba_adi?: string | null
          anne_adi?: string | null
          belge_turu?: string | null
          belge_gecerlilik_tarihi?: string | null
          seri_numarasi?: string | null
          onceki_uyruk?: string | null
          onceki_isim?: string | null
          pasaport_turu?: string | null
          pasaport_numarasi?: string | null
          pasaport_gecerlilik_tarihi?: string | null
          vize_giris_turu?: string | null
          vize_bitis_tarihi?: string | null
          kan_grubu?: string | null
          kronik_hastalik?: string | null
          engel_durumu?: string | null
          engel_orani?: number | null
          surekli_ilac?: string | null
          calisma_durumu?: string | null
          konut_durumu?: string | null
          kira_tutari?: number | null
          es_adi?: string | null
          es_telefon?: string | null
          ailedeki_kisi_sayisi?: number | null
          cocuk_sayisi?: number | null
          yetim_sayisi?: number | null
          calisan_sayisi?: number | null
          bakmakla_yukumlu_sayisi?: number | null
          sponsorluk_tipi?: 'bireysel' | 'kurumsal' | 'yok' | null
          riza_beyani_durumu?: 'alinmadi' | 'alindi' | 'reddetti' | null
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
          basvuran_id: number | null
          basvuran_ad: string | null
          basvuran_soyad: string | null
          basvuran_tc_kimlik_no: string | null
          basvuran_telefon: string | null
          basvuran_adres: string | null
          yardim_turu: 'ayni' | 'nakdi' | 'egitim' | 'saglik' | 'kira' | 'fatura' | string
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
          basvuran_id?: number | null
          basvuran_ad?: string | null
          basvuran_soyad?: string | null
          basvuran_tc_kimlik_no?: string | null
          basvuran_telefon?: string | null
          basvuran_adres?: string | null
          yardim_turu: 'ayni' | 'nakdi' | 'egitim' | 'saglik' | 'kira' | 'fatura' | string
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
          basvuran_id?: number | null
          basvuran_ad?: string | null
          basvuran_soyad?: string | null
          basvuran_tc_kimlik_no?: string | null
          basvuran_telefon?: string | null
          basvuran_adres?: string | null
          yardim_turu?: 'ayni' | 'nakdi' | 'egitim' | 'saglik' | 'kira' | 'fatura' | string
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
          makbuz_no: string | null
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
          makbuz_no?: string | null
          notlar?: string | null
          created_at?: string
        }
        Update: {
          tutar?: number
          odeme_tarihi?: string
          odeme_yontemi?: 'nakit' | 'havale' | 'elden'
          durum?: 'beklemede' | 'odendi' | 'iptal'
          makbuz_no?: string | null
          notlar?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          beneficiary_id: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          document_type: 'kimlik' | 'ikamet' | 'saglik' | 'gelir' | 'diger'
          mime_type: string | null
          is_verified: boolean
          verification_date: string | null
          verified_by: string | null
          description: string | null
          tags: string[] | null
          storage_bucket: string
          storage_path: string | null
          entity_type: 'beneficiary' | 'member' | 'application' | 'payment' | 'other' | null
          entity_id: number | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          beneficiary_id?: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          document_type: 'kimlik' | 'ikamet' | 'saglik' | 'gelir' | 'diger'
          mime_type?: string | null
          is_verified?: boolean
          verification_date?: string | null
          verified_by?: string | null
          description?: string | null
          tags?: string[] | null
          storage_bucket?: string
          storage_path?: string | null
          entity_type?: 'beneficiary' | 'member' | 'application' | 'payment' | 'other' | null
          entity_id?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          beneficiary_id?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          document_type?: 'kimlik' | 'ikamet' | 'saglik' | 'gelir' | 'diger'
          mime_type?: string | null
          is_verified?: boolean
          verification_date?: string | null
          verified_by?: string | null
          description?: string | null
          tags?: string[] | null
          storage_bucket?: string
          storage_path?: string | null
          entity_type?: 'beneficiary' | 'member' | 'application' | 'payment' | 'other' | null
          entity_id?: number | null
          uploaded_by?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          action_type: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout' | 'access_denied' | null
          entity_name: string | null
          change_summary: string | null
          severity: 'info' | 'warning' | 'critical'
          status: 'success' | 'failure' | 'attempted'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          action_type?: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout' | 'access_denied' | null
          entity_name?: string | null
          change_summary?: string | null
          severity?: 'info' | 'warning' | 'critical'
          status?: 'success' | 'failure' | 'attempted'
          created_at?: string
        }
        Update: {
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          action_type?: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout' | 'access_denied' | null
          entity_name?: string | null
          change_summary?: string | null
          severity?: 'info' | 'warning' | 'critical'
          status?: 'success' | 'failure' | 'attempted'
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
