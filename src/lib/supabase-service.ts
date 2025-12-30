/**
 * Supabase Service
 * Central service for all Supabase operations
 *
 * This file now only contains re-exports for backward compatibility.
 * All actual implementations are in src/lib/services/
 */

// ==================================================
// RE-EXPORTS: Modular Services (Backward Compatibility)
// ==================================================
export {
  // Members Service
  fetchMembers,
  fetchMember,
  createMember,
  updateMember,
  deleteMember,
  // Donations Service
  fetchDonations,
  fetchDonation,
  createDonation,
  // Kumbaras Service
  fetchKumbaras,
  fetchKumbaraByCode,
  createKumbara,
  collectKumbara,
  // Beneficiaries Service
  fetchBeneficiaries,
  fetchBeneficiaryById,
  createBeneficiary,
  updateBeneficiary,
  fetchDependentPersons,
  // Applications Service
  fetchApplications,
  fetchApplicationById,
  updateApplicationStatus,
  // Payments Service
  fetchPayments,
  fetchPaymentById,
  fetchPaymentsByDateRange,
  fetchDailyCashSummary,
  fetchMonthlyCashSummary,
  createPayment,
  updatePayment,
  deletePayment,
  // DISABLED: In-Kind Aids Service (in_kind_aids table not in database schema)
  // fetchInKindAids,
  // fetchInKindAidById,
  // createInKindAid,
  // updateInKindAid,
  // deleteInKindAid,
  // Storage Service
  uploadDocument,
  fetchDocuments,
  getDocumentUrl,
  deleteDocument,
  downloadDocument,
  // Dashboard Service
  fetchDashboardStats,
  // Financial Service
  fetchFinancialSummary,
  fetchIncomeExpenseReport,
  fetchIncomeByCategory,
  fetchExpenseByCategory,
  // Users Service
  fetchUsers,
  fetchUser,
  fetchCurrentUser,
  createUser,
  updateUser,
  updateUserProfile,
  updatePassword,
  deleteUser,
  updateNotificationPreferences,
  fetchNotificationPreferences,
  // Hospital Service
  fetchHospitals,
  createHospital,
  updateHospital,
  fetchReferrals,
  fetchReferral,
  createReferral,
  updateReferral,
  fetchAppointments,
  createAppointment,
  fetchTreatmentCosts,
  createTreatmentCost,
  fetchTreatmentOutcomes,
  createTreatmentOutcome,
  updateTreatmentOutcome,
} from './services'

// ==================================================
// LEGACY FALLBACK (For backward compatibility with RPC method)
// ==================================================

/**
 * Alias for fetchDashboardStats from dashboard.service
 * Maintains backward compatibility with RPC pattern
 */
export { fetchDashboardStats as fetchDashboardStatsFallback } from './services'
