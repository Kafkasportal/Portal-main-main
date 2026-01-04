/**
 * Import Beneficiary Family Members from Excel
 * 
 * This script reads Excel files containing family member information
 * and imports them into Supabase database.
 * 
 * Usage:
 *   node scripts/import-beneficiary-families.js
 *   node scripts/import-beneficiary-families.js --file Aynı_Aileden_Olanlar.xlsx
 *   node scripts/import-beneficiary-families.js --file Aynı_Aileden_Olmayanlar.xlsx --dry-run
 */

const { read, utils } = require('exceljs');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const config = {
  // Get from environment variables or use placeholders
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  excelFile: process.argv.find(arg => arg.startsWith('--file'))?.split('=')[1] || 'Aynı_Aileden_Olanlar.xlsx',
  dryRun: process.argv.includes('--dry-run'),
};

// Validate configuration
if (!config.supabaseUrl || !config.supabaseServiceKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Read Excel file and parse data
 */
function readExcelFile(filePath) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    const workbook = read(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(sheet, { defval: '' });
    
    console.log(`Found ${data.length} rows in sheet: ${sheetName}`);
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error.message);
    process.exit(1);
  }
}

/**
 * Parse Excel row to family member structure
 */
function parseExcelRow(row, beneficiaryId) {
  // Normalize column names (case-insensitive, trim spaces)
  const normalizedRow = {};
  Object.keys(row).forEach(key => {
    normalizedRow[key.toLowerCase().trim()] = row[key];
  });

  // Map Excel columns to database fields
  return {
    beneficiary_id: beneficiaryId,
    ad: normalizedRow['ad'] || normalizedRow['adi'] || normalizedRow['isim'] || '',
    soyad: normalizedRow['soyad'] || normalizedRow['soyadi'] || '',
    tc_kimlik_no: normalizedRow['tc'] || normalizedRow['tc kimlik'] || normalizedRow['tc kimlik no'] || '',
    cinsiyet: normalizedRow['cinsiyet'] || null,
    dogum_tarihi: parseDate(normalizedRow['dogum tarihi'] || normalizedRow['dogum_tarihi'] || normalizedRow['doğum tarihi']),
    iliski: normalizeIliski(normalizedRow['iliski'] || normalizedRow['ilişki'] || 'diğer'),
    medeni_durum: normalizeMedeniDurum(normalizedRow['medeni durumu'] || normalizedRow['medeni_hal'] || null),
    egitim_durumu: normalizedRow['egitim durumu'] || normalizedRow['egitim'] || null,
    meslek: normalizedRow['meslek'] || null,
    gelir_durumu: normalizeGelirDurumu(normalizedRow['gelir durumu'] || normalizedRow['calisma durumu'] || null),
    aciklama: normalizedRow['aciklama'] || normalizedRow['açıklama'] || null,
  };
}

/**
 * Parse date string to YYYY-MM-DD format
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // If it's a number (Excel date)
    if (typeof dateStr === 'number') {
      const SSF = require('exceljs/ssf');
      const date = SSF.parse_date_code(dateStr);
      return date.toISOString().split('T')[0];
    }
    
    // If it's a string, parse it
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return null;
  } catch (error) {
    console.warn(`Warning: Could not parse date "${dateStr}": ${error.message}`);
    return null;
  }
}

/**
 * Normalize relationship type
 */
function normalizeIliski(value) {
  const mappings = {
    'es': 'eş',
    'eş': 'eş',
    'baba': 'baba',
    'anne': 'anne',
    'cocuk': 'çocuk',
    'çocuk': 'çocuk',
    'torun': 'torun',
    'kardes': 'kardeş',
    'kardeş': 'kardeş',
    'diger': 'diğer',
    'diğer': 'diğer',
  };
  
  const normalized = (value || '').toLowerCase().trim();
  return mappings[normalized] || 'diğer';
}

/**
 * Normalize marital status
 */
function normalizeMedeniDurum(value) {
  if (!value) return null;
  
  const mappings = {
    'bekar': 'bekar',
    'bekâr': 'bekâr',
    'evli': 'evli',
    'dul': 'dul',
    'dül': 'dül',
    'bosanmis': 'boşanmış',
    'boşanmış': 'boşanmış',
  };
  
  const normalized = value.toLowerCase().trim();
  return mappings[normalized] || null;
}

/**
 * Normalize income status
 */
function normalizeGelirDurumu(value) {
  if (!value) return null;
  
  const mappings = {
    'calisan': 'çalışan',
    'çalışan': 'çalışan',
    'emekli': 'emekli',
    'calismiyor': 'çalışmıyor',
    'çalışmıyor': 'çalışmıyor',
    'ogrenci': 'öğrenci',
    'öğrenci': 'öğrenci',
  };
  
  const normalized = value.toLowerCase().trim();
  return mappings[normalized] || null;
}

/**
 * Find beneficiary by TC Kimlik No
 */
async function findBeneficiaryByTC(tcKimlikNo) {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('id, ad, soyad, tc_kimlik_no')
      .eq('tc_kimlik_no', tcKimlikNo)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error finding beneficiary with TC ${tcKimlikNo}:`, error.message);
    return null;
  }
}

/**
 * Check if family member already exists
 */
async function checkDuplicateFamilyMember(beneficiaryId, tcKimlikNo) {
  try {
    const { data, error } = await supabase
      .from('beneficiary_family_members')
      .select('id')
      .eq('beneficiary_id', beneficiaryId)
      .eq('tc_kimlik_no', tcKimlikNo)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking duplicate family member:', error.message);
    return null;
  }
}

/**
 * Insert family member into database
 */
async function insertFamilyMember(member) {
  try {
    const { data, error } = await supabase
      .from('beneficiary_family_members')
      .insert(member)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error inserting family member:', error.message);
    throw error;
  }
}

/**
 * Import family members
 */
async function importFamilyMembers(excelData) {
  let successCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;
  let notFoundCount = 0;
  const errors = [];
  const warnings = [];

  console.log('\n=== Starting Import ===\n');

  for (let i = 0; i < excelData.length; i++) {
    const row = excelData[i];
    const rowNum = i + 2; // Excel row numbers start from 1, plus header row

    try {
      // Extract beneficiary TC Kimlik No from row
      const beneficiaryTC = row['TC Kimlik No'] || row['TC'] || row['tc_kimlik_no'];
      
      if (!beneficiaryTC) {
        warnings.push(`Row ${rowNum}: No TC Kimlik No found, skipping`);
        notFoundCount++;
        continue;
      }

      // Find beneficiary
      const beneficiary = await findBeneficiaryByTC(beneficiaryTC);
      if (!beneficiary) {
        warnings.push(`Row ${rowNum}: Beneficiary not found with TC ${beneficiaryTC}`);
        notFoundCount++;
        continue;
      }

      // Parse family member data
      const familyMember = parseExcelRow(row, beneficiary.id);
      
      if (!familyMember.tc_kimlik_no) {
        warnings.push(`Row ${rowNum}: Family member has no TC Kimlik No`);
        continue;
      }

      // Check for duplicates
      const existing = await checkDuplicateFamilyMember(beneficiary.id, familyMember.tc_kimlik_no);
      if (existing) {
        console.log(`Row ${rowNum}: Family member already exists (TC: ${familyMember.tc_kimlik_no})`);
        duplicateCount++;
        continue;
      }

      // Dry run mode
      if (config.dryRun) {
        console.log(`[DRY RUN] Row ${rowNum}: Would insert family member ${familyMember.ad} ${familyMember.soyad} for beneficiary ${beneficiary.ad} ${beneficiary.soyad}`);
        successCount++;
        continue;
      }

      // Insert family member
      await insertFamilyMember(familyMember);
      console.log(`Row ${rowNum}: Inserted family member ${familyMember.ad} ${familyMember.soyad} for beneficiary ${beneficiary.ad} ${beneficiary.soyad}`);
      successCount++;

    } catch (error) {
      console.error(`Row ${rowNum}: Error - ${error.message}`);
      errors.push(`Row ${rowNum}: ${error.message}`);
      errorCount++;
    }
  }

  // Print summary
  console.log('\n=== Import Summary ===');
  console.log(`Total rows processed: ${excelData.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Duplicates found: ${duplicateCount}`);
  console.log(`Beneficiaries not found: ${notFoundCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Warnings: ${warnings.length}`);

  if (warnings.length > 0) {
    console.log('\n=== Warnings ===');
    warnings.forEach(w => console.log(w));
  }

  if (errors.length > 0) {
    console.log('\n=== Errors ===');
    errors.forEach(e => console.log(e));
  }

  console.log('\n=== Import Complete ===\n');
}

/**
 * Main function
 */
async function main() {
  console.log('=== Beneficiary Family Members Import ===');
  console.log(`Excel file: ${config.excelFile}`);
  console.log(`Dry run: ${config.dryRun ? 'YES' : 'NO'}`);
  
  const excelData = readExcelFile(config.excelFile);
  
  if (excelData.length === 0) {
    console.log('No data found in Excel file.');
    process.exit(0);
  }

  await importFamilyMembers(excelData);
}

// Run script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
