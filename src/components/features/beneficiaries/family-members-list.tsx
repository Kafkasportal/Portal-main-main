'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, AlertCircle, Info } from 'lucide-react'
import {
  fetchFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  searchFamilyMembers,
  getFamilyCompositionSummary,
  checkDuplicateRecipients,
} from '@/lib/services/beneficiary-family-service'
import type { FamilyMember } from '@/types'
import type { Iliski, MedeniDurum } from '@/types'
import { format } from 'date-fns'
import { FamilyMemberForm } from './family-member-form'

interface FamilyMembersListProps {
  beneficiaryId: number
  beneficiaryName?: string
  beneficiaryTcKimlikNo?: string
  readonly?: boolean
}

export function FamilyMembersList({
  beneficiaryId,
  beneficiaryName,
  beneficiaryTcKimlikNo,
  readonly = false,
}: FamilyMembersListProps) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [summary, setSummary] = useState<{
    total: number;
    byRelationship?: Record<string, number>;
  } | null>(null)
  const [duplicates, setDuplicates] = useState<string[]>([])
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)

  // Load family members
  const loadMembers = async () => {
    try {
      setLoading(true)
      const data = await fetchFamilyMembers(beneficiaryId)
      setMembers(data)
      
      // Load summary
      const summaryData = await getFamilyCompositionSummary(beneficiaryId)
      setSummary(summaryData)
    } catch (error) {
      console.error('Failed to load family members:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load family members on mount
  useEffect(() => {
    loadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beneficiaryId])

  // Search members
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length >= 2) {
      try {
        const results = await searchFamilyMembers(query)
        setMembers(results)
      } catch (error) {
        console.error('Search failed:', error)
      }
    } else {
      loadMembers()
    }
  }

  // Check for duplicate aid recipients
  const checkForDuplicates = async () => {
    const tcKimlikNumbers = members.map(m => m.tcKimlikNo).filter(Boolean)
    if (tcKimlikNumbers.length === 0) return

    setCheckingDuplicates(true)
    try {
      const duplicateWarnings = await checkDuplicateRecipients(tcKimlikNumbers)
      setDuplicates(duplicateWarnings)
    } catch (error) {
      console.error('Duplicate check failed:', error)
    } finally {
      setCheckingDuplicates(false)
    }
  }

  // Add new member
  const handleAddMember = async (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addFamilyMember({
        ...member,
        beneficiaryId,
      })
      await loadMembers()
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add family member:', error)
    }
  }

  // Update member
  const handleUpdateMember = async (member: FamilyMember) => {
    try {
      await updateFamilyMember(member.id, member)
      setEditingMember(null)
      await loadMembers()
    } catch (error) {
      console.error('Failed to update family member:', error)
    }
  }

  // Delete member
  const handleDeleteMember = async (id: number) => {
    if (!confirm('Bu aile üyesini silmek istediğinizden emin misiniz?')) return

    try {
      await deleteFamilyMember(id)
      await loadMembers()
    } catch (error) {
      console.error('Failed to delete family member:', error)
    }
  }

  // Render relationship badge
  const getRelationshipBadge = (iliski: Iliski) => {
    const colors: Record<Iliski, string> = {
      'eş': 'bg-blue-100 text-blue-800',
      'baba': 'bg-green-100 text-green-800',
      'anne': 'bg-purple-100 text-purple-800',
      'çocuk': 'bg-yellow-100 text-yellow-800',
      'torun': 'bg-orange-100 text-orange-800',
      'kardeş': 'bg-pink-100 text-pink-800',
      'diğer': 'bg-gray-100 text-gray-800',
    }
    
    const labels: Record<Iliski, string> = {
      'eş': 'Eş',
      'baba': 'Baba',
      'anne': 'Anne',
      'çocuk': 'Çocuk',
      'torun': 'Torun',
      'kardeş': 'Kardeş',
      'diğer': 'Diğer',
    }
    
    return (
      <Badge variant="secondary" className={colors[iliski]}>
        {labels[iliski]}
      </Badge>
    )
  }

  // Render marital status badge
  const getMaritalStatusBadge = (durum: MedeniDurum) => {
    const colors: Record<MedeniDurum, string> = {
      'bekâr': 'bg-gray-100 text-gray-800',
      'evli': 'bg-green-100 text-green-800',
      'dül': 'bg-red-100 text-red-800',
      'boşanmış': 'bg-purple-100 text-purple-800',
    }
    
    return (
      <Badge variant="secondary" className={colors[durum]}>
        {durum}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Yükleniyor...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Hane İle İlgili Kişiler
          </h2>
          {beneficiaryName && (
            <p className="text-gray-600 mt-1">
              {beneficiaryName} ({beneficiaryTcKimlikNo || 'TC No'})
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          {!readonly && (
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Üye
            </Button>
          )}
          {duplicates.length > 0 && (
            <Button
              onClick={checkForDuplicates}
              variant="outline"
              size="sm"
              loading={checkingDuplicates}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Tekrar Kontrolü
            </Button>
          )}
        </div>
      </div>

      {/* Duplicate Warnings */}
      {duplicates.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900">Aynı Kişilere Yardım Uyarısı</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Aşağıdaki kişiler için daha önce yardım başvurusu yapılmış:
              </p>
              <ul className="mt-2 space-y-1">
                {duplicates.map((warning, index) => (
                  <li key={index} className="text-sm">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Toplam Üye</div>
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">İlişki Türü</div>
            <div className="text-2xl font-bold text-gray-900">
              {summary.byRelationship?.['eş'] || 0} Eş
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Çocuk Sayısı</div>
            <div className="text-2xl font-bold text-gray-900">
              {summary.byRelationship?.['çocuk'] || 0}
            </div>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Aile üyesi ara (TC Kimlik, ad, soyad)..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Info className="absolute left-3 top-1/2 text-gray-400 h-5 w-5" />
        </div>
      </Card>

      {/* Members List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aile Üyesi</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">İlişki</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">TC Kimlik</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cinsiyet</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Medeni Durum</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Eğitim/Meslek</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gelir Durumu</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Açıklama</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Henüz aile üyesi eklenmemiş
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.ad} {member.soyad}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.tcKimlikNo || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getRelationshipBadge(member.iliski as Iliski)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {member.dogumTarihi ? format(new Date(member.dogumTarihi), 'P', { locale: 'tr' }) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {member.medeniDurum && getMaritalStatusBadge(member.medeniDurum as MedeniDurum)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>
                        {member.egitimDurumu && (
                          <span className="block">{member.egitimDurumu}</span>
                        )}
                        {member.meslek && (
                          <span className="block text-xs text-gray-500">{member.meslek}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {member.gelirDurumu && (
                        <Badge variant="secondary">{member.gelirDurumu}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {member.aciklama ? (
                        <span className="block max-w-xs truncate" title={member.aciklama}>
                          {member.aciklama}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <ButtonGroup size="sm">
                        {!readonly && (
                          <>
                            <Button
                              variant="ghost"
                              onClick={() => setEditingMember(member)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Yeni Aile Üyesi Ekle
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <FamilyMemberForm
              beneficiaryId={beneficiaryId}
              onSubmit={handleAddMember}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Aile Üyesini Düzenle
                </h3>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <FamilyMemberForm
              beneficiaryId={beneficiaryId}
              initialData={editingMember}
              onSubmit={handleUpdateMember}
              onCancel={() => setEditingMember(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}


