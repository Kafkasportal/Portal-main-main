export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          ad: string
          adres: string | null
          ailedeki_kisi_sayisi: number | null
          anne_adi: string | null
          aylik_gelir: number | null
          baba_adi: string | null
          bakmakla_yukumlu_sayisi: number | null
          belge_gecerlilik_tarihi: string | null
          belge_turu: string | null
          calisan_sayisi: number | null
          calisma_durumu: string | null
          cep_telefonu: string | null
          cep_telefonu_operator: string | null
          cinsiyet: string
          cocuk_sayisi: number | null
          created_at: string
          dogum_tarihi: string | null
          dosya_baglantisi: string | null
          durum: string
          egitim_durumu: string | null
          email: string | null
          engel_durumu: string | null
          engel_orani: number | null
          es_adi: string | null
          es_telefon: string | null
          fon_bolgesi: string | null
          hane_buyuklugu: number | null
          id: number
          ihtiyac_durumu: string
          il: string | null
          ilce: string | null
          kan_grubu: string | null
          kategori: string | null
          kira_tutari: number | null
          konut_durumu: string | null
          kronik_hastalik: string | null
          mahalle: string | null
          medeni_hal: string | null
          mernis_dogrulama: boolean | null
          meslek: string | null
          notlar: string | null
          onceki_isim: string | null
          onceki_uyruk: string | null
          parent_id: number | null
          pasaport_gecerlilik_tarihi: string | null
          pasaport_numarasi: string | null
          pasaport_turu: string | null
          relationship_type: string | null
          riza_beyani_durumu: string | null
          sabit_telefon: string | null
          sehir: string | null
          seri_numarasi: string | null
          soyad: string
          sponsorluk_tipi: string | null
          surekli_ilac: string | null
          tc_kimlik_no: string | null
          telefon: string
          ulke: string | null
          updated_at: string
          uyruk: string | null
          vize_bitis_tarihi: string | null
          vize_giris_turu: string | null
          yabanci_kimlik_no: string | null
          yetim_sayisi: number | null
          yurtdisi_telefon: string | null
        }
        Insert: {
          ad: string
          adres?: string | null
          ailedeki_kisi_sayisi?: number | null
          anne_adi?: string | null
          aylik_gelir?: number | null
          baba_adi?: string | null
          bakmakla_yukumlu_sayisi?: number | null
          belge_gecerlilik_tarihi?: string | null
          belge_turu?: string | null
          calisan_sayisi?: number | null
          calisma_durumu?: string | null
          cep_telefonu?: string | null
          cep_telefonu_operator?: string | null
          cinsiyet: string
          cocuk_sayisi?: number | null
          created_at?: string
          dogum_tarihi?: string | null
          dosya_baglantisi?: string | null
          durum?: string
          egitim_durumu?: string | null
          email?: string | null
          engel_durumu?: string | null
          engel_orani?: number | null
          es_adi?: string | null
          es_telefon?: string | null
          fon_bolgesi?: string | null
          hane_buyuklugu?: number | null
          id?: number
          ihtiyac_durumu?: string
          il?: string | null
          ilce?: string | null
          kan_grubu?: string | null
          kategori?: string | null
          kira_tutari?: number | null
          konut_durumu?: string | null
          kronik_hastalik?: string | null
          mahalle?: string | null
          medeni_hal?: string | null
          mernis_dogrulama?: boolean | null
          meslek?: string | null
          notlar?: string | null
          onceki_isim?: string | null
          onceki_uyruk?: string | null
          parent_id?: number | null
          pasaport_gecerlilik_tarihi?: string | null
          pasaport_numarasi?: string | null
          pasaport_turu?: string | null
          relationship_type?: string | null
          riza_beyani_durumu?: string | null
          sabit_telefon?: string | null
          sehir?: string | null
          seri_numarasi?: string | null
          soyad: string
          sponsorluk_tipi?: string | null
          surekli_ilac?: string | null
          tc_kimlik_no?: string | null
          telefon: string
          ulke?: string | null
          updated_at?: string
          uyruk?: string | null
          vize_bitis_tarihi?: string | null
          vize_giris_turu?: string | null
          yabanci_kimlik_no?: string | null
          yetim_sayisi?: number | null
          yurtdisi_telefon?: string | null
        }
        Update: {
          ad?: string
          adres?: string | null
          ailedeki_kisi_sayisi?: number | null
          anne_adi?: string | null
          aylik_gelir?: number | null
          baba_adi?: string | null
          bakmakla_yukumlu_sayisi?: number | null
          belge_gecerlilik_tarihi?: string | null
          belge_turu?: string | null
          calisan_sayisi?: number | null
          calisma_durumu?: string | null
          cep_telefonu?: string | null
          cep_telefonu_operator?: string | null
          cinsiyet?: string
          cocuk_sayisi?: number | null
          created_at?: string
          dogum_tarihi?: string | null
          dosya_baglantisi?: string | null
          durum?: string
          egitim_durumu?: string | null
          email?: string | null
          engel_durumu?: string | null
          engel_orani?: number | null
          es_adi?: string | null
          es_telefon?: string | null
          fon_bolgesi?: string | null
          hane_buyuklugu?: number | null
          id?: number
          ihtiyac_durumu?: string
          il?: string | null
          ilce?: string | null
          kan_grubu?: string | null
          kategori?: string | null
          kira_tutari?: number | null
          konut_durumu?: string | null
          kronik_hastalik?: string | null
          mahalle?: string | null
          medeni_hal?: string | null
          mernis_dogrulama?: boolean | null
          meslek?: string | null
          notlar?: string | null
          onceki_isim?: string | null
          onceki_uyruk?: string | null
          parent_id?: number | null
          pasaport_gecerlilik_tarihi?: string | null
          pasaport_numarasi?: string | null
          pasaport_turu?: string | null
          relationship_type?: string | null
          riza_beyani_durumu?: string | null
          sabit_telefon?: string | null
          sehir?: string | null
          seri_numarasi?: string | null
          soyad?: string
          sponsorluk_tipi?: string | null
          surekli_ilac?: string | null
          tc_kimlik_no?: string | null
          telefon?: string
          ulke?: string | null
          updated_at?: string
          uyruk?: string | null
          vize_bitis_tarihi?: string | null
          vize_giris_turu?: string | null
          yabanci_kimlik_no?: string | null
          yetim_sayisi?: number | null
          yurtdisi_telefon?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_family_members: {
        Row: {
          aciklama: string | null
          ad: string
          beneficiary_id: number
          cinsiyet: string | null
          created_at: string
          dogum_tarihi: string | null
          egitim_durumu: string | null
          gelir_durumu: string | null
          id: number
          iliski: string
          medeni_durum: string | null
          meslek: string | null
          soyad: string
          tc_kimlik_no: string | null
          updated_at: string
        }
        Insert: {
          aciklama?: string | null
          ad: string
          beneficiary_id: number
          cinsiyet?: string | null
          created_at?: string
          dogum_tarihi?: string | null
          egitim_durumu?: string | null
          gelir_durumu?: string | null
          id?: number
          iliski: string
          medeni_durum?: string | null
          meslek?: string | null
          soyad: string
          tc_kimlik_no?: string | null
          updated_at?: string
        }
        Update: {
          aciklama?: string | null
          ad?: string
          beneficiary_id?: number
          cinsiyet?: string | null
          created_at?: string
          dogum_tarihi?: string | null
          egitim_durumu?: string | null
          gelir_durumu?: string | null
          id?: number
          iliski?: string
          medeni_durum?: string | null
          meslek?: string | null
          soyad?: string
          tc_kimlik_no?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_family_members_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          beneficiary_id: number | null
          created_at: string
          description: string | null
          document_type: string
          entity_id: number | null
          entity_type: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: number
          is_verified: boolean | null
          mime_type: string | null
          storage_bucket: string | null
          storage_path: string | null
          tags: string[] | null
          uploaded_by: string | null
          verification_date: string | null
          verified_by: string | null
        }
        Insert: {
          beneficiary_id?: number | null
          created_at?: string
          description?: string | null
          document_type: string
          entity_id?: number | null
          entity_type?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: number
          is_verified?: boolean | null
          mime_type?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          tags?: string[] | null
          uploaded_by?: string | null
          verification_date?: string | null
          verified_by?: string | null
        }
        Update: {
          beneficiary_id?: number | null
          created_at?: string
          description?: string | null
          document_type?: string
          entity_id?: number | null
          entity_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: number
          is_verified?: boolean | null
          mime_type?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          tags?: string[] | null
          uploaded_by?: string | null
          verification_date?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          aciklama: string | null
          amac: string
          bagisci_adi: string
          bagisci_adres: string | null
          bagisci_email: string | null
          bagisci_telefon: string | null
          created_at: string
          currency: string
          id: number
          makbuz_no: string | null
          member_id: number | null
          odeme_yontemi: string
          tarih: string
          tutar: number
        }
        Insert: {
          aciklama?: string | null
          amac: string
          bagisci_adi: string
          bagisci_adres?: string | null
          bagisci_email?: string | null
          bagisci_telefon?: string | null
          created_at?: string
          currency?: string
          id?: number
          makbuz_no?: string | null
          member_id?: number | null
          odeme_yontemi: string
          tarih?: string
          tutar: number
        }
        Update: {
          aciklama?: string | null
          amac?: string
          bagisci_adi?: string
          bagisci_adres?: string | null
          bagisci_email?: string | null
          bagisci_telefon?: string | null
          created_at?: string
          currency?: string
          id?: number
          makbuz_no?: string | null
          member_id?: number | null
          odeme_yontemi?: string
          tarih?: string
          tutar?: number
        }
        Relationships: [
          {
            foreignKeyName: "donations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_appointments: {
        Row: {
          appointment_date: string
          created_at: string
          id: number
          location: string | null
          notes: string | null
          referral_id: number
          reminder_sent: boolean
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          id?: number
          location?: string | null
          notes?: string | null
          referral_id: number
          reminder_sent?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          id?: number
          location?: string | null
          notes?: string | null
          referral_id?: number
          reminder_sent?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_appointments_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: number
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: number
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: number
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      in_kind_aids: {
        Row: {
          beneficiary_id: number
          birim: string
          created_at: string
          dagitim_tarihi: string
          id: number
          miktar: number
          notlar: string | null
          updated_at: string
          yardim_turu: string
        }
        Insert: {
          beneficiary_id: number
          birim: string
          created_at?: string
          dagitim_tarihi?: string
          id?: number
          miktar: number
          notlar?: string | null
          updated_at?: string
          yardim_turu: string
        }
        Update: {
          beneficiary_id?: number
          birim?: string
          created_at?: string
          dagitim_tarihi?: string
          id?: number
          miktar?: number
          notlar?: string | null
          updated_at?: string
          yardim_turu?: string
        }
        Relationships: [
          {
            foreignKeyName: "in_kind_aids_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      kumbaras: {
        Row: {
          created_at: string
          durum: string
          id: number
          kod: string
          konum: string
          notlar: string | null
          son_toplama_tarihi: string | null
          sorumlu_id: number | null
          toplam_toplanan: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          durum?: string
          id?: number
          kod: string
          konum: string
          notlar?: string | null
          son_toplama_tarihi?: string | null
          sorumlu_id?: number | null
          toplam_toplanan?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          durum?: string
          id?: number
          kod?: string
          konum?: string
          notlar?: string | null
          son_toplama_tarihi?: string | null
          sorumlu_id?: number | null
          toplam_toplanan?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kumbaras_sorumlu_id_fkey"
            columns: ["sorumlu_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          ad: string
          adres: string | null
          aidat_durumu: string
          cinsiyet: string
          created_at: string
          dogum_tarihi: string | null
          email: string | null
          id: number
          kan_grubu: string | null
          kayit_tarihi: string
          meslegi: string | null
          notlar: string | null
          soyad: string
          tc_kimlik_no: string
          telefon: string
          updated_at: string
          uye_turu: string
        }
        Insert: {
          ad: string
          adres?: string | null
          aidat_durumu?: string
          cinsiyet: string
          created_at?: string
          dogum_tarihi?: string | null
          email?: string | null
          id?: number
          kan_grubu?: string | null
          kayit_tarihi?: string
          meslegi?: string | null
          notlar?: string | null
          soyad: string
          tc_kimlik_no: string
          telefon: string
          updated_at?: string
          uye_turu?: string
        }
        Update: {
          ad?: string
          adres?: string | null
          aidat_durumu?: string
          cinsiyet?: string
          created_at?: string
          dogum_tarihi?: string | null
          email?: string | null
          id?: number
          kan_grubu?: string | null
          kayit_tarihi?: string
          meslegi?: string | null
          notlar?: string | null
          soyad?: string
          tc_kimlik_no?: string
          telefon?: string
          updated_at?: string
          uye_turu?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          application_id: number
          beneficiary_id: number
          created_at: string
          durum: string
          id: number
          makbuz_no: string | null
          notlar: string | null
          odeme_tarihi: string
          odeme_yontemi: string
          tutar: number
        }
        Insert: {
          application_id: number
          beneficiary_id: number
          created_at?: string
          durum?: string
          id?: number
          makbuz_no?: string | null
          notlar?: string | null
          odeme_tarihi: string
          odeme_yontemi: string
          tutar: number
        }
        Update: {
          application_id?: number
          beneficiary_id?: number
          created_at?: string
          durum?: string
          id?: number
          makbuz_no?: string | null
          notlar?: string | null
          odeme_tarihi?: string
          odeme_yontemi?: string
          tutar?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "social_aid_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          module: string
          name: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          module: string
          name: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          beneficiary_id: number
          created_at: string
          hospital_id: number
          id: number
          notes: string | null
          reason: string
          referral_date: string
          status: string
          updated_at: string
        }
        Insert: {
          beneficiary_id: number
          created_at?: string
          hospital_id: number
          id?: number
          notes?: string | null
          reason: string
          referral_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          beneficiary_id?: number
          created_at?: string
          hospital_id?: number
          id?: number
          notes?: string | null
          reason?: string
          referral_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          new_role_id: string | null
          old_role_id: string | null
          permission_id: string | null
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          new_role_id?: string | null
          old_role_id?: string | null
          permission_id?: string | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          new_role_id?: string | null
          old_role_id?: string | null
          permission_id?: string | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_audit_logs_new_role_id_fkey"
            columns: ["new_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_audit_logs_old_role_id_fkey"
            columns: ["old_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_audit_logs_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_audit_logs_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          hierarchy_level: number
          id: string
          is_active: boolean
          is_system_role: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          hierarchy_level?: number
          id?: string
          is_active?: boolean
          is_system_role?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          hierarchy_level?: number
          id?: string
          is_active?: boolean
          is_system_role?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_aid_applications: {
        Row: {
          basvuran_ad: string | null
          basvuran_adres: string | null
          basvuran_id: number | null
          basvuran_soyad: string | null
          basvuran_tc_kimlik_no: string | null
          basvuran_telefon: string | null
          basvuru_tarihi: string
          created_at: string
          degerlendirme_tarihi: string | null
          durum: string
          gerekce: string | null
          id: number
          notlar: string | null
          onaylanan_tutar: number | null
          talep_edilen_tutar: number | null
          updated_at: string
          yardim_turu: string
        }
        Insert: {
          basvuran_ad?: string | null
          basvuran_adres?: string | null
          basvuran_id?: number | null
          basvuran_soyad?: string | null
          basvuran_tc_kimlik_no?: string | null
          basvuran_telefon?: string | null
          basvuru_tarihi?: string
          created_at?: string
          degerlendirme_tarihi?: string | null
          durum?: string
          gerekce?: string | null
          id?: number
          notlar?: string | null
          onaylanan_tutar?: number | null
          talep_edilen_tutar?: number | null
          updated_at?: string
          yardim_turu: string
        }
        Update: {
          basvuran_ad?: string | null
          basvuran_adres?: string | null
          basvuran_id?: number | null
          basvuran_soyad?: string | null
          basvuran_tc_kimlik_no?: string | null
          basvuran_telefon?: string | null
          basvuru_tarihi?: string
          created_at?: string
          degerlendirme_tarihi?: string | null
          durum?: string
          gerekce?: string | null
          id?: number
          notlar?: string | null
          onaylanan_tutar?: number | null
          talep_edilen_tutar?: number | null
          updated_at?: string
          yardim_turu?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_aid_applications_basvuran_id_fkey"
            columns: ["basvuran_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_costs: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string
          id: number
          incurred_date: string
          payment_date: string | null
          payment_method: string | null
          payment_status: string
          referral_id: number
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description: string
          id?: number
          incurred_date?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          referral_id: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string
          id?: number
          incurred_date?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          referral_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_costs_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_outcomes: {
        Row: {
          appointment_id: number | null
          created_at: string
          diagnosis: string | null
          follow_up_date: string | null
          follow_up_needed: boolean
          id: number
          outcome_notes: string | null
          referral_id: number
          treatment_received: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: number | null
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          follow_up_needed?: boolean
          id?: number
          outcome_notes?: string | null
          referral_id: number
          treatment_received?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: number | null
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          follow_up_needed?: boolean
          id?: number
          outcome_notes?: string | null
          referral_id?: number
          treatment_received?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_outcomes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "hospital_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_outcomes_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          permission_id: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          department: string | null
          email: string
          hire_date: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string
          notes: string | null
          phone: string | null
          role: string
          role_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email: string
          hire_date?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string
          role_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string
          role_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_stats: { Args: never; Returns: Json }
      get_donation_source_distribution: { Args: never; Returns: Json }
      get_donation_trends: { Args: { period_type: string }; Returns: Json }
      get_top_donors: { Args: { limit_count?: number }; Returns: Json }
      get_user_hierarchy_level: { Args: { p_user_id: string }; Returns: number }
      get_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_moderator_or_above: { Args: never; Returns: boolean }
      is_muhasebe_or_above: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      user_has_permission: {
        Args: { p_permission_name: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]
export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
