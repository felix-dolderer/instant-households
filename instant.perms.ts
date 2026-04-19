// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react-native'

const rules = {
  $default: {
    allow: {
      $default: 'false',
    },
  },
  $users: {
    allow: {
      view: 'auth.id == data.id',
      create: 'true',
      update: 'auth.id == data.id',
    },
  },
  organizations: {
    allow: {
      view: 'isOrganizationMember || hasMatchingOrganizationCode',
      create: 'isSignedIn',
      update: 'isOrganizationMember || canLookupOrganizationByCode',
      delete: 'isOrganizationMember',
    },
    bind: {
      isSignedIn: 'auth.id != null',
      isOrganizationMember: "auth.id in data.ref('users.id')",
      hasMatchingOrganizationCode: 'ruleParams.organizationCode == data.code',
      canLookupOrganizationByCode:
        'hasMatchingOrganizationCode && size(request.modifiedFields) == 0',
    },
  },
  colors: {
    allow: {
      view: 'isOrganizationMember',
      create: 'isOrganizationMember',
      update: 'isOrganizationMember',
      delete: 'isOrganizationMember',
    },
    bind: {
      isOrganizationMember: "auth.id in data.ref('organization.users.id')",
    },
  },
} satisfies InstantRules

export default rules
