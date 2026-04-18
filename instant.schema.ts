// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/react-native'

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    households: i.entity({
      name: i.string(),
      code: i.string().unique().indexed(),
    }),
    colors: i.entity({
      value: i.string(),
    }),
  },
  rooms: {},
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: '$users',
        has: 'one',
        label: 'linkedPrimaryUser',
        onDelete: 'cascade',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'linkedGuestUsers',
      },
    },
    householdMembers: {
      forward: {
        on: '$users',
        has: 'one',
        label: 'household',
      },
      reverse: {
        on: 'households',
        has: 'many',
        label: 'users',
      },
    },
    householdColors: {
      forward: {
        on: 'colors',
        has: 'one',
        label: 'household',
        onDelete: 'cascade',
      },
      reverse: {
        on: 'households',
        has: 'many',
        label: 'colors',
      },
    },
  },
})

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema

export type { AppSchema }
export default schema
