/**
 * Check for Duplicate Aid Recipients
 * 
 * This script checks for duplicate aid recipients by comparing:
 * 1. TC Kimlik No duplicates
 * 2. Name and surname duplicates
 * 3. Multiple aid applications from same person
 * 
 * Usage:
 *   node scripts/check-duplicate-recipients.js
 *   node scripts/check-duplicate-recipients.js --export duplicates.csv
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  exportFile: process.argv.find(arg => arg.startsWith('--export'))?.split('=')[1] || null,
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
 * Check for duplicate TC Kimlik No in beneficiaries
 */
async function checkDuplicateTC() {
  console.log('Checking for duplicate TC Kimlik No in beneficiaries...');
  
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('tc_kimlik_no, ad, soyad, COUNT(*) as count')
      .not('tc_kimlik_no', 'is', null)
      .not('tc_kimlik_no', 'eq', '')
      .group('tc_kimlik_no, ad, soyad')
      .having('COUNT(*)', 'gt', 1);
    
    if (error) throw error;
    
    console.log(`Found ${data.length} beneficiaries with duplicate TC Kimlik No`);
    return data;
  } catch (error) {
    console.error('Error checking duplicate TC:', error.message);
    return [];
  }
}

/**
 * Check for duplicate TC Kimlik No in family members
 */
async function checkDuplicateTCInFamilyMembers() {
  console.log('Checking for duplicate TC Kimlik No in family members...');
  
  try {
    const { data, error } = await supabase
      .from('beneficiary_family_members')
      .select('tc_kimlik_no, ad, soyad, beneficiary_id, COUNT(*) as count')
      .not('tc_kimlik_no', 'is', null)
      .not('tc_kimlik_no', 'eq', '')
      .group('tc_kimlik_no, ad, soyad, beneficiary_id')
      .having('COUNT(*)', 'gt', 1);
    
    if (error) throw error;
    
    console.log(`Found ${data.length} family members with duplicate TC Kimlik No`);
    return data;
  } catch (error) {
    console.error('Error checking duplicate TC in family members:', error.message);
    return [];
  }
}

/**
 * Check for multiple aid applications from same person
 */
async function checkMultipleAidApplications() {
  console.log('Checking for multiple aid applications from same person...');
  
  try {
    const { data, error } = await supabase
      .from('social_aid_applications')
      .select('basvuran_tc_kimlik_no, basvuran_ad, basvuran_soyad, durum, COUNT(*) as count')
      .not('basvuran_tc_kimlik_no', 'is', null)
      .not('basvuran_tc_kimlik_no', 'eq', '')
      .group('basvuran_tc_kimlik_no, basvuran_ad, basvuran_soyad, durum')
      .having('COUNT(*)', 'gt', 1);
    
    if (error) throw error;
    
    console.log(`Found ${data.length} persons with multiple aid applications`);
    return data;
  } catch (error) {
    console.error('Error checking multiple aid applications:', error.message);
    return [];
  }
}

/**
 * Check for duplicates between beneficiaries and aid applicants
 */
async function checkBeneficiaryVsAidApplicants() {
  console.log('Checking for duplicates between beneficiaries and aid applicants...');
  
  try {
    const { data: beneficiaries } = await supabase
      .from('beneficiaries')
      .select('id, tc_kimlik_no, ad, soyad')
      .not('tc_kimlik_no', 'is', null)
      .limit(1000);
    
    if (!beneficiaries) return [];
    
    const tcList = beneficiaries.map(b => b.tc_kimlik_no);
    
    const { data: aidApplicants, error } = await supabase
      .from('social_aid_applications')
      .select('id, basvuran_tc_kimlik_no, basvuran_ad, basvuran_soyad, durum')
      .in('basvuran_tc_kimlik_no', tcList);
    
    if (error) throw error;
    
    const duplicates = beneficiaries
      .filter(b => aidApplicants?.some(a => a.basvuran_tc_kimlik_no === b.tc_kimlik_no))
      .map(b => {
        const apps = aidApplicants.filter(a => a.basvuran_tc_kimlik_no === b.tc_kimlik_no);
        return {
          tc_kimlik_no: b.tc_kimlik_no,
          beneficiary: `${b.ad} ${b.soyad}`,
          aid_applications: apps.length,
          application_details: apps,
        };
      });
    
    console.log(`Found ${duplicates.length} beneficiaries with aid applications`);
    return duplicates;
  } catch (error) {
    console.error('Error checking beneficiary vs aid applicants:', error.message);
    return [];
  }
}

/**
 * Check for family members appearing as beneficiaries
 */
async function checkFamilyMembersAsBeneficiaries() {
  console.log('Checking for family members who are also beneficiaries...');
  
  try {
    const { data: familyMembers } = await supabase
      .from('beneficiary_family_members')
      .select('tc_kimlik_no, ad, soyad, beneficiary_id')
      .not('tc_kimlik_no', 'is', null)
      .limit(1000);
    
    if (!familyMembers) return [];
    
    const tcList = familyMembers.map(f => f.tc_kimlik_no);
    
    const { data: beneficiaries, error } = await supabase
      .from('beneficiaries')
      .select('id, tc_kimlik_no, ad, soyad')
      .in('tc_kimlik_no', tcList);
    
    if (error) throw error;
    
    const duplicates = familyMembers
      .filter(f => beneficiaries?.some(b => b.tc_kimlik_no === f.tc_kimlik_no))
      .map(f => {
        const ben = beneficiaries.find(b => b.tc_kimlik_no === f.tc_kimlik_no);
        return {
          tc_kimlik_no: f.tc_kimlik_no,
          name: `${f.ad} ${f.soyad}`,
          family_of: `Beneficiary ID: ${f.beneficiary_id}`,
          also_beneficiary: `${ben.ad} ${ben.soyad} (ID: ${ben.id})`,
        };
      });
    
    console.log(`Found ${duplicates.length} family members who are also beneficiaries`);
    return duplicates;
  } catch (error) {
    console.error('Error checking family members as beneficiaries:', error.message);
    return [];
  }
}

/**
 * Generate report
 */
async function generateReport() {
  console.log('\n=== Duplicate Recipients Report ===\n');
  
  const results = {
    duplicateTCInBeneficiaries: await checkDuplicateTC(),
    duplicateTCInFamilyMembers: await checkDuplicateTCInFamilyMembers(),
    multipleAidApplications: await checkMultipleAidApplications(),
    beneficiaryVsAidApplicants: await checkBeneficiaryVsAidApplicants(),
    familyMembersAsBeneficiaries: await checkFamilyMembersAsBeneficiaries(),
  };
  
  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Duplicate TC in beneficiaries: ${results.duplicateTCInBeneficiaries.length}`);
  console.log(`Duplicate TC in family members: ${results.duplicateTCInFamilyMembers.length}`);
  console.log(`Multiple aid applications: ${results.multipleAidApplications.length}`);
  console.log(`Beneficiaries with aid applications: ${results.beneficiaryVsAidApplicants.length}`);
  console.log(`Family members as beneficiaries: ${results.familyMembersAsBeneficiaries.length}`);
  
  const totalIssues = 
    results.duplicateTCInBeneficiaries.length +
    results.duplicateTCInFamilyMembers.length +
    results.multipleAidApplications.length +
    results.beneficiaryVsAidApplicants.length +
    results.familyMembersAsBeneficiaries.length;
  
  console.log(`\nTotal issues found: ${totalIssues}`);
  
  // Export to CSV if requested
  if (config.exportFile) {
    await exportToCSV(results, config.exportFile);
  }
  
  return results;
}

/**
 * Export results to CSV
 */
async function exportToCSV(results, filename) {
  console.log(`\nExporting report to ${filename}...`);
  
  let csvContent = '';
  
  // Header
  csvContent += 'Type,TC Kimlik No,Name,Count,Details\n';
  
  // Duplicate TC in beneficiaries
  results.duplicateTCInBeneficiaries.forEach(r => {
    csvContent += `Duplicate TC (Beneficiary),${r.tc_kimlik_no},"${r.ad} ${r.soyad}",${r.count},"Multiple beneficiaries with same TC"\n`;
  });
  
  // Duplicate TC in family members
  results.duplicateTCInFamilyMembers.forEach(r => {
    csvContent += `Duplicate TC (Family),${r.tc_kimlik_no},"${r.ad} ${r.soyad}",${r.count},"Multiple family members with same TC"\n`;
  });
  
  // Multiple aid applications
  results.multipleAidApplications.forEach(r => {
    csvContent += `Multiple Applications,${r.basvuran_tc_kimlik_no},"${r.basvuran_ad} ${r.basvuran_soyad}",${r.count},"${r.durum} applications"\n`;
  });
  
  // Beneficiary vs Aid Applicants
  results.beneficiaryVsAidApplicants.forEach(r => {
    csvContent += `Beneficiary+Application,${r.tc_kimlik_no},"${r.beneficiary}",${r.aid_applications},"Has ${r.aid_applications} aid applications"\n`;
  });
  
  // Family members as beneficiaries
  results.familyMembersAsBeneficiaries.forEach(r => {
    csvContent += `Family+Beneficiary,${r.tc_kimlik_no},"${r.name}",1,"${r.family_of} | ${r.also_beneficiary}"\n`;
  });
  
  fs.writeFileSync(filename, csvContent, 'utf-8');
  console.log(`Report exported to ${filename}`);
}

/**
 * Main function
 */
async function main() {
  console.log('=== Duplicate Aid Recipients Checker ===');
  console.log(`Export: ${config.exportFile || 'NO'}`);
  
  await generateReport();
  
  console.log('\n=== Check Complete ===\n');
}

// Run script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


