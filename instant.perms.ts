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
      view: "auth.id in data.ref('users.id') || ruleParams.householdCode == data.code",
      create: "auth.id != null",
      update: "auth.id in data.ref('users.id') || (ruleParams.householdCode == data.code && size(request.modifiedFields) == 0)",
      delete: "auth.id in data.ref('users.id')",
    },
  },
  colors: {
    allow: {
      view: "auth.id in data.ref('household.users.id')",
      create: "auth.id in data.ref('household.users.id')",
      update: "auth.id in data.ref('household.users.id')",
      delete: "auth.id in data.ref('household.users.id')",
    },
  },
} satisfies InstantRules;

export default rules;
