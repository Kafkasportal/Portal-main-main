
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importDataWithRelationships() {
  console.log('Bağlantılı kişilerle veri aktarımı başlıyor...');

  const xmlPath = path.join(process.cwd(), 'Export.xml');
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

  const rowRegex = /<Row[^>]*>([\s\S]*?)<\/Row>/g;
  const cellRegex = /<Cell[^>]*>([\s\S]*?)<\/Cell>/g;
  const dataRegex = /<Data[^>]*>([\s\S]*?)<\/Data>/;

  let match;
  const allRows: string[][] = [];

  // 1. Tüm satırları oku ve ID'ye göre sırala  
  while ((match = rowRegex.exec(xmlContent)) !== null) {
    const rowInner = match[1];
    const cells: string[] = [];
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowInner)) !== null) {
      const cellInner = cellMatch[1];
      const dataMatch = dataRegex.exec(cellInner);
      const value = dataMatch ? dataMatch[1].trim() : '';
      cells.push(value);
    }

    if (cells[0] === 'ID' || cells[1] === 'Ad Soyad' || cells.length < 3) continue;
    allRows.push(cells);
  }

  // ÖNEMLİ: ID'ye göre ARTAN sırada sırala (1, 2, 3, ...)
  allRows.sort((a, b) => {
    const idA = parseInt(a[0]) || 0;
    const idB = parseInt(b[0]) || 0;
    return idA - idB;
  });

  // XML'deki sıralama genellikle hane bazlıdır. 
  // Ancak ID'ler azalan sırada olduğu için diziyi ters çevirip (veya mantığına göre) işleyelim.
  // Genelde "İhtiyaç Sahibi Kişi" hane reisidir.

  const beneficiariesMap = new Map<string, Record<string, unknown>>();

  // 2. Verileri işle
  for (const cells of allRows) {
    const fullName = cells[1] || '';
    const nameParts = fullName.split(' ');
    const soyad = nameParts.length > 1 ? nameParts.pop() : '';
    const ad = nameParts.join(' ');
    const tc = (cells[2] || '').replace(/\s/g, '');
    if (!tc) continue;

    const rawIhtiyac = cells[16] || '';
    const rawDurum = (cells[14] || '').toLowerCase();
    let durum = 'aktif';
    if (rawDurum.includes('pasif')) durum = 'pasif';
    else if (rawDurum.includes('beklemede')) durum = 'beklemede';
    else if (rawDurum !== 'aktif') durum = 'diger';

    let ihtiyacDurumu = 'belirtilmemis';
    const lowerIhtiyac = rawIhtiyac.toLowerCase();
    if (lowerIhtiyac.includes('acil')) ihtiyacDurumu = 'acil';
    else if (lowerIhtiyac.includes('yüksek') || lowerIhtiyac.includes('yuksek')) ihtiyacDurumu = 'yuksek';
    else if (lowerIhtiyac.includes('orta')) ihtiyacDurumu = 'orta';
    else if (lowerIhtiyac.includes('düşük') || lowerIhtiyac.includes('dusuk')) ihtiyacDurumu = 'dusuk';

    const beneficiary = {
      tc_kimlik_no: tc,
      ad: ad,
      soyad: soyad,
      telefon: cells[12] || '-',
      adres: cells[8] || '',
      il: cells[5] || '',
      ilce: cells[6] || '',
      cinsiyet: 'belirtilmemis',
      meslek: cells[17] || '',
      aylik_gelir: parseFloat((cells[18] || '0').replace(',', '.')) || 0,
      hane_buyuklugu: parseInt(cells[9]) || 0,
      durum: durum,
      ihtiyac_durumu: ihtiyacDurumu,
      kategori: cells[15] || '',
      relationship_type: rawIhtiyac.includes('İhtiyaç Sahibi Kişi') ? 'İhtiyaç Sahibi Kişi' : 'Bakmakla Yükümlü Olunan Kişi',
      notlar: `Doğum Yeri: ${cells[3] || '-'}\nUyruk: ${cells[4] || '-'}\nIBAN: ${cells[19] || '-'}\nOrijinal Durum: ${cells[14] || '-'}\nOrijinal İhtiyaç: ${rawIhtiyac}`,
      _temp_raw_ihtiyac: rawIhtiyac
    };

    beneficiariesMap.set(tc, beneficiary);
  }

  const allBeneficiaries = Array.from(beneficiariesMap.values());

  // ADRES BAZLI GRUPLAMA
  // Aynı adreste yaşayan kişileri grupla
  const addressGroups = new Map<string, Record<string, unknown>[]>();

  for (const b of allBeneficiaries) {
    const address = (b.adres as string) || 'Bilinmeyen Adres';
    if (!addressGroups.has(address)) {
      addressGroups.set(address, []);
    }
    addressGroups.get(address)!.push(b);
  }

  // Her adres grubu için hane reisi belirle
  for (const [, group] of addressGroups) {
    // Grup içindeki "İhtiyaç Sahibi Kişi"leri bul
    const householdHeads = group.filter(b => {
      const rawIhtiyac = (b._temp_raw_ihtiyac as string) || '';
      return rawIhtiyac.includes('İhtiyaç Sahibi Kişi');
    });

    // Grup içindeki "Bakmakla Yükümlü Olunan Kişi"leri bul  
    const dependents = group.filter(b => {
      const rawIhtiyac = (b._temp_raw_ihtiyac as string) || '';
      return rawIhtiyac.includes('Bakmakla Yükümlü Olunan Kişi');
    });

    // Eğer bu adreste sadece 1 hane reisi varsa, bakmakla yükümlüleri ona bağla
    if (householdHeads.length === 1) {
      const headTc = householdHeads[0].tc_kimlik_no as string;
      householdHeads[0]._temp_primary_tc = null; // Hane reisi bağımsız

      for (const dep of dependents) {
        dep._temp_primary_tc = headTc;
      }
    } else if (householdHeads.length > 1) {
      // Birden fazla hane reisi - her biri bağımsız
      for (const head of householdHeads) {
        head._temp_primary_tc = null;
      }
      // Bakmakla yükümlüler ilk hane reisine bağlansın (mantıklı değil ama önce düzeltelim)
      if (dependents.length > 0 && householdHeads.length > 0) {
        const firstHeadTc = householdHeads[0].tc_kimlik_no as string;
        for (const dep of dependents) {
          dep._temp_primary_tc = firstHeadTc;
        }
      }
    } else if (dependents.length > 0) {
      // Sadece bakmakla yükümlüler var - hepsi bağımsız yap
      for (const dep of dependents) {
        dep._temp_primary_tc = null;
      }
    }
  }

  console.log(`Toplam ${addressGroups.size} adres grubu işlendi.`);

  // 3. Önce tüm kişileri yükle (parent_id olmadan)
  console.log('Kişiler yükleniyor...');
  for (let i = 0; i < allBeneficiaries.length; i += 100) {
    const batch = allBeneficiaries.slice(i, i + 100).map((item) => {
      const rest = { ...item } as Record<string, unknown>;
      delete rest._temp_primary_tc;
      delete rest._temp_raw_ihtiyac;
      return rest;
    });
    await uploadBatch(batch);
  }

  // 4. ID'leri al ve parent_id'leri güncelle
  console.log('İlişkiler kuruluyor...');
  const { data: dbRecords, error: fetchError } = await supabase
    .from('beneficiaries')
    .select('id, tc_kimlik_no');

  if (fetchError) {
    console.error('Kayıtlar çekilemedi:', fetchError);
    return;
  }

  const tcToIdMap = new Map(dbRecords.map(r => [r.tc_kimlik_no, r.id]));
  const updates = [];

  for (const b of allBeneficiaries) {
    const primaryTc = b._temp_primary_tc as string | null;
    const currentTc = b.tc_kimlik_no as string;
    if (primaryTc && tcToIdMap.has(primaryTc)) {
      updates.push({
        id: tcToIdMap.get(currentTc),
        tc_kimlik_no: currentTc, // NOT NULL kısıtlamasını aşmak için
        parent_id: tcToIdMap.get(primaryTc)
      });
    }
  }

  // İlişkileri güncelle
  console.log(`${updates.length} ilişki güncelleniyor...`);
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('beneficiaries')
      .update({ parent_id: update.parent_id })
      .eq('id', update.id);

    if (updateError) {
      console.error(`İlişki güncelleme hatası (ID: ${update.id}):`, updateError);
    }
  }
  console.log('İlişki güncellemeleri tamamlandı.');

  console.log('İşlem başarıyla tamamlandı.');
}

async function uploadBatch(batch: Record<string, unknown>[]) {
  const { error } = await supabase
    .from('beneficiaries')
    .upsert(batch, { onConflict: 'tc_kimlik_no' });

  if (error) {
    console.error('Batch yükleme hatası:', error);
  } else {
    console.log(`${batch.length} kayıt işlendi.`);
  }
}

importDataWithRelationships().catch(console.error);
