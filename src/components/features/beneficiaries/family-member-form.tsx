'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { FamilyMember, Iliski, MedeniDurum } from '@/types'

interface FamilyMemberFormProps {
  beneficiaryId: number
  initialData?: FamilyMember | null
  onSubmit: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel: () => void
}

export function FamilyMemberForm({
  beneficiaryId,
  initialData,
  onSubmit,
  onCancel,
}: FamilyMemberFormProps) {
  const [formData, setFormData] = useState<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>({
    beneficiaryId,
    ad: '',
    soyad: '',
    tcKimlikNo: '',
    cinsiyet: 'erkek' as 'erkek' | 'kadın',
    dogumTarihi: undefined,
    iliski: 'çocuk' as Iliski,
    medeniDurum: 'bekâr' as MedeniDurum,
    egitimDurumu: '',
    meslek: '',
    gelirDurumu: 'çalışan' as 'çalışan' | 'emekli' | 'çalışmıyor' | 'öğrenci',
    aciklama: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set form data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        beneficiaryId,
        ad: initialData.ad,
        soyad: initialData.soyad,
        tcKimlikNo: initialData.tcKimlikNo || '',
        cinsiyet: initialData.cinsiyet || 'erkek',
        dogumTarihi: initialData.dogumTarihi ? new Date(initialData.dogumTarihi) : undefined,
        iliski: initialData.iliski || 'çocuk',
        medeniDurum: initialData.medeniDurum || 'bekâr',
        egitimDurumu: initialData.egitimDurumu || '',
        meslek: initialData.meslek || '',
        gelirDurumu: initialData.gelirDurumu || 'çalışan',
        aciklama: initialData.aciklama || '',
      })
    }
  }, [initialData, beneficiaryId])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.ad.trim()) {
      newErrors.ad = 'Ad zorunludur'
    }

    if (!formData.soyad.trim()) {
      newErrors.soyad = 'Soyad zorunludur'
    }

    if (!formData.tcKimlikNo.trim()) {
      newErrors.tcKimlikNo = 'TC Kimlik No zorunludur'
    } else if (formData.tcKimlikNo.length !== 11 || !/^\d{11}$/.test(formData.tcKimlikNo)) {
      newErrors.tcKimlikNo = 'Geçerli bir TC Kimlik No giriniz'
    }

    if (!formData.iliski) {
      newErrors.iliski = 'İlişki türü seçmelisiniz'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({
        beneficiaryId,
        ad: '',
        soyad: '',
        tcKimlikNo: '',
        cinsiyet: 'erkek' as 'erkek' | 'kadın',
        dogumTarihi: undefined,
        iliski: 'çocuk' as Iliski,
        medeniDurum: 'bekâr' as MedeniDurum,
        egitimDurumu: '',
        meslek: '',
        gelirDurumu: 'çalışan' as 'çalışan' | 'emekli' | 'çalışmıyor' | 'öğrenci',
        aciklama: '',
      })
    } catch (error) {
      console.error('Form submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {initialData ? 'Aile Üyesini Düzenle' : 'Yeni Aile Üyesi Ekle'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ad */}
          <div className="space-y-2">
            <Label htmlFor="ad">Ad *</Label>
            <Input
              id="ad"
              value={formData.ad}
              onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
              className={errors.ad ? 'border-red-500' : ''}
              placeholder="Örn: Ahmet"
            />
            {errors.ad && (
              <p className="text-sm text-red-600 mt-1">{errors.ad}</p>
            )}
          </div>

          {/* Soyad */}
          <div className="space-y-2">
            <Label htmlFor="soyad">Soyad *</Label>
            <Input
              id="soyad"
              value={formData.soyad}
              onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
              className={errors.soyad ? 'border-red-500' : ''}
              placeholder="Örn: Yılmaz"
            />
            {errors.soyad && (
              <p className="text-sm text-red-600 mt-1">{errors.soyad}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TC Kimlik No */}
          <div className="space-y-2">
            <Label htmlFor="tcKimlikNo">TC Kimlik No *</Label>
            <Input
              id="tcKimlikNo"
              value={formData.tcKimlikNo}
              onChange={(e) => setFormData({ ...formData, tcKimlikNo: e.target.value })}
              className={errors.tcKimlikNo ? 'border-red-500' : ''}
              placeholder="11 haneli TC numarası"
              maxLength={11}
            />
            {errors.tcKimlikNo && (
              <p className="text-sm text-red-600 mt-1">{errors.tcKimlikNo}</p>
            )}
          </div>

          {/* Cinsiyet */}
          <div className="space-y-2">
            <Label htmlFor="cinsiyet">Cinsiyet *</Label>
            <Select value={formData.cinsiyet} onValueChange={(value) => setFormData({ ...formData, cinsiyet: value as 'erkek' | 'kadın' })}>
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="erkek">Erkek</SelectItem>
                <SelectItem value="kadın">Kadın</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Doğum Tarihi */}
          <div className="space-y-2">
            <Label htmlFor="dogumTarihi">Doğum Tarihi</Label>
            <Input
              id="dogumTarihi"
              type="date"
              value={formData.dogumTarihi ? new Date(formData.dogumTarihi).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, dogumTarihi: e.target.value ? new Date(e.target.value) : undefined })}
              className=""
            />
          </div>

          {/* İlişki Türü */}
          <div className="space-y-2">
            <Label htmlFor="iliski">İlişki Türü *</Label>
            <Select value={formData.iliski} onValueChange={(value) => setFormData({ ...formData, iliski: value as Iliski })}>
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eş">Eş</SelectItem>
                <SelectItem value="baba">Baba</SelectItem>
                <SelectItem value="anne">Anne</SelectItem>
                <SelectItem value="çocuk">Çocuk</SelectItem>
                <SelectItem value="torun">Torun</SelectItem>
                <SelectItem value="kardeş">Kardeş</SelectItem>
                <SelectItem value="diğer">Diğer</SelectItem>
              </SelectContent>
            </Select>
            {errors.iliski && (
              <p className="text-sm text-red-600 mt-1">{errors.iliski}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Medeni Durum */}
          <div className="space-y-2">
            <Label htmlFor="medeniDurum">Medeni Durum *</Label>
            <Select value={formData.medeniDurum} onValueChange={(value) => setFormData({ ...formData, medeniDurum: value as MedeniDurum })}>
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bekâr">Bekâr</SelectItem>
                <SelectItem value="evli">Evli</SelectItem>
                <SelectItem value="dül">Dül</SelectItem>
                <SelectItem value="boşanmış">Boşanmış</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Eğitim Durumu */}
          <div className="space-y-2">
            <Label htmlFor="egitimDurumu">Eğitim Durumu</Label>
            <Input
              id="egitimDurumu"
              value={formData.egitimDurumu}
              onChange={(e) => setFormData({ ...formData, egitimDurumu: e.target.value })}
              placeholder="Örn: Üniversite mezunu, Lise mezunu"
              className=""
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Meslek */}
          <div className="space-y-2">
            <Label htmlFor="meslek">Meslek</Label>
            <Input
              id="meslek"
              value={formData.meslek}
              onChange={(e) => setFormData({ ...formData, meslek: e.target.value })}
              placeholder="Örn: Öğretmen, Mühendis, Doktor"
              className=""
            />
          </div>

          {/* Gelir Durumu */}
          <div className="space-y-2">
            <Label htmlFor="gelirDurumu">Gelir Durumu</Label>
            <Select value={formData.gelirDurumu} onValueChange={(value) => setFormData({ ...formData, gelirDurumu: value as 'çalışan' | 'emekli' | 'çalışmıyor' | 'öğrenci' })}>
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="çalışan">Çalışan</SelectItem>
                <SelectItem value="emekli">Emekli</SelectItem>
                <SelectItem value="çalışmıyor">Çalışmıyor</SelectItem>
                <SelectItem value="öğrenci">Öğrenci</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Açıklama */}
        <div className="space-y-2">
          <Label htmlFor="aciklama">Açıklama</Label>
          <Textarea
            id="aciklama"
            value={formData.aciklama}
            onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
            placeholder="Ek bilgileri veya özel durumlar..."
            rows={3}
            className=""
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  )
}


