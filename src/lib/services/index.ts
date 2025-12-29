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
} from './mappers'

// Domain services
export * from './members.service'
export * from './donations.service'
export * from './kumbaras.service'
export * from './beneficiaries.service'
