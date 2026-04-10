// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  $default: {
    allow: {
      $default: "false",
    },
  },
  $users: {
    allow: {
      view: "auth.id == data.id",
      create: "true",
      update: "auth.id == data.id",
    },
  },
  households: {
    allow: {
      view: "isHouseholdUser || hasMatchingHouseholdCode",
      create: "isSignedIn",
      update: "isHouseholdUser || canLookupHouseholdByCode",
      delete: "isHouseholdUser",
    },
    bind: {
      isSignedIn: "auth.id != null",
      isHouseholdUser: "auth.id in data.ref('users.id')",
      hasMatchingHouseholdCode: "ruleParams.householdCode == data.code",
      canLookupHouseholdByCode: "hasMatchingHouseholdCode && size(request.modifiedFields) == 0",
    },
  },
  colors: {
    allow: {
      view: "isHouseholdUser",
      create: "isHouseholdUser",
      update: "isHouseholdUser",
      delete: "isHouseholdUser",
    },
    bind: {
      isHouseholdUser: "auth.id in data.ref('household.users.id')",
    },
  },
} satisfies InstantRules;

export default rules;
