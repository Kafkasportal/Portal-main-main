
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// .env.local dosyasını yükle
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importData() {
  console.log('Veri aktarımı başlıyor...');

  const xmlPath = path.join(process.cwd(), 'Export.xml');
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

  // Basit bir regex ile Row'ları ayıklayalım
  const rowRegex = /<Row[^>]*>([\s\S]*?)<\/Row>/g;
  const cellRegex = /<Cell[^>]*>([\s\S]*?)<\/Cell>/g;
  const dataRegex = /<Data[^>]*>([\s\S]*?)<\/Data>/;

  let match;
  const beneficiariesMap = new Map<string, Record<string, unknown>>();
  let rowCount = 0;

  while ((match = rowRegex.exec(xmlContent)) !== null) {
    const rowInner = match[1];
    const cells = [];
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowInner)) !== null) {
      const cellInner = cellMatch[1];
      const dataMatch = dataRegex.exec(cellInner);
      const value = dataMatch ? dataMatch[1].trim() : '';
      cells.push(value);
    }

    // İlk satır başlık olabilir, kontrol edelim
    if (cells[0] === 'ID' || cells[1] === 'Ad Soyad') {
      continue;
    }

    if (cells.length < 3) continue;

    rowCount++;

    // Ad Soyad ayırma
    const fullName = cells[1] || '';
    const nameParts = fullName.split(' ');
    const soyad = nameParts.length > 1 ? nameParts.pop() : '';
    const ad = nameParts.join(' ');

    // TC Kimlik No temizleme (boşlukları kaldır)
    const tc = (cells[2] || '').replace(/\s/g, '');
    if (!tc) continue;

    // Durum mapping
    const rawDurum = (cells[14] || '').toLowerCase();
    let durum = 'aktif';
    if (rawDurum.includes('pasif')) durum = 'pasif';
    else if (rawDurum.includes('beklemede')) durum = 'beklemede';
    else if (rawDurum !== 'aktif') durum = 'diger';

    // İhtiyaç durumu mapping
    const rawIhtiyac = (cells[16] || '').toLowerCase();
    let ihtiyacDurumu = 'belirtilmemis';
    if (rawIhtiyac.includes('acil')) ihtiyacDurumu = 'acil';
    else if (rawIhtiyac.includes('yüksek') || rawIhtiyac.includes('yuksek')) ihtiyacDurumu = 'yuksek';
    else if (rawIhtiyac.includes('orta')) ihtiyacDurumu = 'orta';
    else if (rawIhtiyac.includes('düşük') || rawIhtiyac.includes('dusuk')) ihtiyacDurumu = 'dusuk';

    // Hane büyüklüğü (Cell 10)
    const haneBuyuklugu = parseInt(cells[9]) || 0;

    // Aylık Gelir (Cell 19)
    const aylikGelir = parseFloat((cells[18] || '0').replace(',', '.')) || 0;

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
      aylik_gelir: aylikGelir,
      hane_buyuklugu: haneBuyuklugu,
      durum: durum,
      ihtiyac_durumu: ihtiyacDurumu,
      kategori: cells[15] || '',
      notlar: `Doğum Yeri: ${cells[3] || '-'}\nUyruk: ${cells[4] || '-'}\nIBAN: ${cells[19] || '-'}\nOrijinal Durum: ${cells[14] || '-'}\nOrijinal İhtiyaç: ${cells[16] || '-'}`
    };

    // Mükerrer kayıtları engellemek için Map kullanıyoruz
    beneficiariesMap.set(tc, beneficiary);
  }

  const allBeneficiaries = Array.from(beneficiariesMap.values());
  console.log(`Toplam ${rowCount} satır okundu, ${allBeneficiaries.length} benzersiz kayıt bulundu.`);

  // 100'erli gruplar halinde yükleyelim
  for (let i = 0; i < allBeneficiaries.length; i += 100) {
    const batch = allBeneficiaries.slice(i, i + 100);
    await uploadBatch(batch);
  }

  console.log('İşlem tamamlandı.');
}

async function uploadBatch(batch: Record<string, unknown>[]) {
  const { error } = await supabase
    .from('beneficiaries')
    .upsert(batch, { onConflict: 'tc_kimlik_no' });

  if (error) {
    console.error('Batch yükleme hatası:', error);
  } else {
    console.log(`${batch.length} kayıt başarıyla yüklendi/güncellendi.`);
  }
}

importData().catch(console.error);
