/**
 * Services Index
 * Tüm modüler servisleri buradan export ediyoruz
 */

// Base utilities
export { getClient, toPaginatedResponse } from './base.service'

// Mappers
export {
  mapMember,
  mapDonation,
  mapKumbara,
  mapBeneficiary,
  mapApplication,
  mapPayment,
  // DISABLED: mapInKindAid - in_kind_aids table not in database schema
  // mapInKindAid,
  mapHospital,
  mapReferral,
  mapAppointment,
  mapTreatmentCost,
  mapTreatmentOutcome,
} from './mappers'

// Domain services
export * from './members.service'
export * from './donations.service'
export * from './kumbaras.service'
export * from './beneficiaries.service'
export * from './applications.service'
export * from './payments.service'
// DISABLED: in_kind_aids table not in database schema
// export * from './in-kind-aids.service'
export * from './storage.service'
export * from './dashboard.service'
export * from './financial.service'
export * from './users.service'
export * from './hospital.service'
