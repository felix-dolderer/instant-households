import { db } from '@/lib/db'
import { id } from '@instantdb/react-native'
import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const DEFAULT_COLOR = '#D6D3D1'
const palette = [
  { label: 'Fern', value: '#6D9773' },
  { label: 'Tide', value: '#5C7AEA' },
  { label: 'Iris', value: '#7C3AED' },
]

function App() {
  const { isLoading, error, user } = db.useAuth()

  if (isLoading) {
    return (
      <ScreenShell>
        <View className="items-center gap-4">
          <ActivityIndicator size="large" color="#F4EEE7" />
          <Text className="font-mono text-sm uppercase tracking-[3px] text-stone-300">
            Checking session
          </Text>
        </View>
      </ScreenShell>
    )
  }

  if (error) {
    return (
      <ScreenShell>
        <View className="w-full max-w-md rounded-[28px] border border-red-300/20 bg-red-950/60 p-6">
          <Text className="font-mono text-xs uppercase tracking-[3px] text-red-200">
            Authentication error
          </Text>
          <Text className="mt-3 text-base leading-6 text-red-50">{error.message}</Text>
        </View>
      </ScreenShell>
    )
  }

  if (user) {
    return <AuthenticatedApp user={user} />
  }

  return <LoginScreen />
}

function AuthenticatedApp({
  user,
}: Readonly<{
  user: NonNullable<ReturnType<typeof db.useAuth>['user']>
}>) {
  const { isLoading, error, data } = db.useQuery({
    $users: {
      $: { where: { id: user.id } },
      organization: {
        colors: {},
      },
    },
  })

  const organization = data?.$users[0]?.organization ?? null

  if (isLoading) {
    return (
      <ScreenShell>
        <View className="items-center gap-4">
          <ActivityIndicator size="large" color="#F4EEE7" />
          <Text className="font-mono text-sm uppercase tracking-[3px] text-stone-300">
            Loading your organization
          </Text>
        </View>
      </ScreenShell>
    )
  }

  if (error) {
    return (
      <ScreenShell>
        <View className="w-full max-w-md rounded-[28px] border border-red-300/20 bg-red-950/60 p-6">
          <Text className="font-mono text-xs uppercase tracking-[3px] text-red-200">
            Organization sync error
          </Text>
          <Text className="mt-3 text-base leading-6 text-red-50">{error.message}</Text>
          <Pressable
            onPress={() => {
              db.auth.signOut()
            }}
            className="mt-6 rounded-full border border-white/15 px-4 py-3"
          >
            <Text className="text-center font-semibold text-white">Sign out</Text>
          </Pressable>
        </View>
      </ScreenShell>
    )
  }

  if (!organization) {
    return <OrganizationSetupScreen user={user} />
  }

  return <OrganizationHome organization={organization} userEmail={user.email} />
}

function OrganizationHome({
  organization,
  userEmail,
}: Readonly<{
  organization: {
    id: string
    name: string
    code: string
    colors?: { id: string; value: string }[]
  }
  userEmail?: string | null
}>) {
  const selectedColor = organization.colors?.[0]?.value ?? DEFAULT_COLOR
  const colorRecord = organization.colors?.[0]
  const paletteOptions = useMemo(() => palette, [])

  const setOrganizationColor = async (value: string) => {
    try {
      if (colorRecord) {
        await db.transact(db.tx.colors[colorRecord.id].update({ value }))
        return
      }

      const colorId = id()
      await db.transact(db.tx.colors[colorId].create({ value }).link({ organization: organization.id }))
    } catch (error) {
      Alert.alert('Unable to update color', getErrorMessage(error))
    }
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: selectedColor }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}
      >
        <View className="gap-8">
          <View className="gap-3">
            <Text className="font-mono text-xs uppercase tracking-[3px] text-black/55">
              Organization active
            </Text>
            <Text className="text-4xl font-black leading-tight text-slate-950">
              {organization.name}
            </Text>
            <Text className="max-w-sm text-base leading-6 text-slate-900/75">
              Signed in as {userEmail ?? 'your account'}. Everyone in this organization sees the same
              shared color, while other organizations keep their own separate state.
            </Text>
          </View>

          <View className="gap-4">
            <View className="rounded-[32px] border border-black/10 bg-black/10 p-5">
              <Text className="font-mono text-xs uppercase tracking-[3px] text-black/55">
                Invite code
              </Text>
              <Text className="mt-3 text-3xl font-black tracking-[4px] text-slate-950">
                {organization.code}
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-900/75">
                Share this code with another signed-in user so they can join this same organization and
                access the shared preferences.
              </Text>
            </View>

            <View className="rounded-[32px] border border-black/10 bg-white/80 p-6 shadow-2xl">
              <Text className="font-mono text-xs uppercase tracking-[3px] text-slate-500">
                Shared preference
              </Text>
              <Text className="mt-3 text-3xl font-bold text-slate-950">Choose the room tone</Text>
              <Text className="mt-2 text-base leading-6 text-slate-600">
                The current selection is synced through Instant and updates the organization backdrop
                in real time for every member.
              </Text>

              <View className="mt-6 gap-3">
                {paletteOptions.map(color => {
                  const active = color.value === selectedColor

                  return (
                    <Pressable
                      key={color.value}
                      onPress={() => {
                        void setOrganizationColor(color.value)
                      }}
                      className="flex-row items-center justify-between rounded-[22px] border px-4 py-4"
                      style={{
                        backgroundColor: active ? 'rgba(15, 23, 42, 0.92)' : '#fff',
                        borderColor: active ? 'rgba(15, 23, 42, 0.92)' : '#E7E5E4',
                      }}
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        <Text
                          className="text-base font-semibold"
                          style={{ color: active ? '#F8FAFC' : '#0F172A' }}
                        >
                          {color.label}
                        </Text>
                      </View>
                      <Text
                        className="font-mono text-xs uppercase tracking-[2px]"
                        style={{ color: active ? '#CBD5E1' : '#64748B' }}
                      >
                        {active ? 'Selected' : 'Set'}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>

              <Pressable
                onPress={() => {
                  db.auth.signOut()
                }}
                className="mt-6 rounded-full border border-slate-300 px-4 py-3"
              >
                <Text className="text-center font-semibold text-slate-800">Sign out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function OrganizationSetupScreen({
  user,
}: Readonly<{
  user: NonNullable<ReturnType<typeof db.useAuth>['user']>
}>) {
  const [mode, setMode] = useState<'join' | 'create'>('join')
  const [joinCode, setJoinCode] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const normalizedCode = normalizeOrganizationCode(joinCode)

  const createOrganization = async () => {
    setIsCreating(true)

    try {
      const organizationId = id()
      const colorId = id()

      await db.transact([
        db.tx.organizations[organizationId]
          .create({
            name: buildOrganizationName(user.email, organizationName),
            code: generateOrganizationCode(),
          })
          .link({ users: user.id }),
        db.tx.colors[colorId].create({ value: DEFAULT_COLOR }).link({ organization: organizationId }),
      ])
    } catch (error) {
      Alert.alert('Unable to create organization', getErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  const joinOrganization = async () => {
    if (!normalizedCode) {
      Alert.alert('Code required', 'Enter the organization code to join.')
      return
    }

    setIsJoining(true)

    try {
      const { data } = await db.queryOnce(
        {
          organizations: {
            $: {
              where: {
                code: normalizedCode,
              },
            },
          },
        },
        {
          ruleParams: {
            organizationCode: normalizedCode,
          },
        },
      )

      const organization = data.organizations[0]

      if (!organization) {
        Alert.alert('Organization not found', 'That code does not match an existing organization yet.')
        return
      }

      await db.transact(
        db.tx.organizations[organization.id]
          .ruleParams({ organizationCode: normalizedCode })
          .link({ users: user.id }),
      )
    } catch (error) {
      Alert.alert('Unable to join organization', getErrorMessage(error))
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <ScreenShell>
      <KeyboardAvoidingView
        className="w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="w-full max-w-md self-center overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl">
          <Text className="font-mono text-xs uppercase tracking-[3px] text-stone-300">
            Organization access
          </Text>
          <Text className="mt-4 text-4xl font-black leading-tight text-stone-50">
            Choose or join your shared space.
          </Text>
          <Text className="mt-3 text-base leading-6 text-stone-300">
            You are signed in as {user.email ?? 'your account'}, but you still need an organization
            before shared preferences and storage become available.
          </Text>

          <View className="mt-8 flex-row rounded-full border border-white/10 bg-white/5 p-1">
            <ModeButton
              label="Join with code"
              active={mode === 'join'}
              onPress={() => setMode('join')}
            />
            <ModeButton
              label="Create organization"
              active={mode === 'create'}
              onPress={() => setMode('create')}
            />
          </View>

          {mode === 'join' ? (
            <View className="mt-8 gap-4">
              <View className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                <Text className="mb-2 font-mono text-xs uppercase tracking-[2px] text-stone-400">
                  Organization code
                </Text>
                <TextInput
                  value={joinCode}
                  onChangeText={setJoinCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="AB12CD34"
                  placeholderTextColor="#A8A29E"
                  className="text-base tracking-[3px] text-stone-50"
                />
              </View>

              <View className="rounded-[24px] border border-amber-300/15 bg-amber-300/10 px-4 py-3">
                <Text className="font-mono text-xs uppercase tracking-[2px] text-amber-100">
                  Shared organization
                </Text>
                <Text className="mt-2 text-sm leading-6 text-amber-50/85">
                  Joining an organization connects you to its shared data and synced preferences
                  instantly.
                </Text>
              </View>

              <Pressable
                onPress={joinOrganization}
                disabled={isJoining}
                className="rounded-full px-5 py-4"
                style={{ backgroundColor: isJoining ? '#57534E' : '#F4EEE7' }}
              >
                <Text className="text-center text-base font-bold text-slate-950">
                  {isJoining ? 'Joining...' : 'Join organization'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-8 gap-4">
              <View className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                <Text className="mb-2 font-mono text-xs uppercase tracking-[2px] text-stone-400">
                  Organization name
                </Text>
                <TextInput
                  value={organizationName}
                  onChangeText={setOrganizationName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  placeholder="Sunday Flat"
                  placeholderTextColor="#A8A29E"
                  className="text-base text-stone-50"
                />
              </View>

              <View className="rounded-[24px] border border-emerald-300/15 bg-emerald-300/10 px-4 py-3">
                <Text className="font-mono text-xs uppercase tracking-[2px] text-emerald-100">
                  New organization
                </Text>
                <Text className="mt-2 text-sm leading-6 text-emerald-50/85">
                  We will create a fresh organization, seed its shared color preference, and generate a
                  code you can share with others.
                </Text>
              </View>

              <Pressable
                onPress={createOrganization}
                disabled={isCreating}
                className="rounded-full px-5 py-4"
                style={{ backgroundColor: isCreating ? '#57534E' : '#F4EEE7' }}
              >
                <Text className="text-center text-base font-bold text-slate-950">
                  {isCreating ? 'Creating...' : 'Create organization'}
                </Text>
              </Pressable>
            </View>
          )}

          <Pressable
            onPress={() => {
              db.auth.signOut()
            }}
            className="mt-6 rounded-full border border-white/15 px-5 py-4"
          >
            <Text className="text-center text-sm font-semibold text-stone-200">Sign out</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  )
}

function ModeButton({
  active,
  label,
  onPress,
}: Readonly<{
  active: boolean
  label: string
  onPress: () => void
}>) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-full px-4 py-3"
      style={{ backgroundColor: active ? '#F4EEE7' : 'transparent' }}
    >
      <Text
        className="text-center text-sm font-semibold"
        style={{ color: active ? '#020617' : '#D6D3D1' }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [sentEmail, setSentEmail] = useState('')
  const [code, setCode] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const trimmedEmail = email.trim().toLowerCase()

  const sendCode = async () => {
    if (!trimmedEmail) {
      Alert.alert('Email required', 'Enter your email to receive a magic code.')
      return
    }

    setIsSending(true)
    setSentEmail(trimmedEmail)

    try {
      await db.auth.sendMagicCode({ email: trimmedEmail })
    } catch (err) {
      setSentEmail('')
      Alert.alert('Unable to send code', getErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  const verifyCode = async () => {
    if (!code.trim()) {
      Alert.alert('Code required', 'Enter the code we emailed to you.')
      return
    }

    setIsVerifying(true)

    try {
      await db.auth.signInWithMagicCode({
        email: sentEmail,
        code: code.trim(),
      })
    } catch (err) {
      setCode('')
      Alert.alert('Unable to verify code', getErrorMessage(err))
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <ScreenShell>
      <KeyboardAvoidingView
        className="w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="w-full max-w-md self-center overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl">
          <Text className="font-mono text-xs uppercase tracking-[3px] text-stone-300">
            Organizations
          </Text>
          <Text className="mt-4 text-4xl font-black leading-tight text-stone-50">
            Enter with a magic code.
          </Text>
          <Text className="mt-3 text-base leading-6 text-stone-300">
            Only logged-in users can access the main screen. Use your email to get a one-time code
            and we will sign you in securely.
          </Text>

          {sentEmail ? (
            <View className="mt-8 gap-4">
              <View className="rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3">
                <Text className="font-mono text-xs uppercase tracking-[2px] text-emerald-200">
                  Code sent
                </Text>
                <Text className="mt-2 text-sm leading-6 text-emerald-50">
                  We sent a verification code to {sentEmail}.
                </Text>
              </View>

              <View className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                <Text className="mb-2 font-mono text-xs uppercase tracking-[2px] text-stone-400">
                  Verification code
                </Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="123456"
                  placeholderTextColor="#A8A29E"
                  className="text-base text-stone-50"
                />
              </View>

              <Pressable
                onPress={verifyCode}
                disabled={isVerifying}
                className="rounded-full px-5 py-4"
                style={{
                  backgroundColor: isVerifying ? '#57534E' : '#F4EEE7',
                }}
              >
                <Text className="text-center text-base font-bold text-slate-950">
                  {isVerifying ? 'Verifying...' : 'Verify code'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setSentEmail('')
                  setCode('')
                }}
                className="rounded-full border border-white/15 px-5 py-4"
              >
                <Text className="text-center text-sm font-semibold text-stone-200">
                  Use a different email
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-8 gap-4">
              <View className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                <Text className="mb-2 font-mono text-xs uppercase tracking-[2px] text-stone-400">
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="you@example.com"
                  placeholderTextColor="#A8A29E"
                  className="text-base text-stone-50"
                />
              </View>

              <Pressable
                onPress={sendCode}
                disabled={isSending}
                className="rounded-full px-5 py-4"
                style={{ backgroundColor: isSending ? '#57534E' : '#F4EEE7' }}
              >
                <Text className="text-center text-base font-bold text-slate-950">
                  {isSending ? 'Sending...' : 'Send magic code'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  )
}

function ScreenShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SafeAreaView className="flex-1 bg-[#171717]">
      <View className="flex-1 overflow-hidden bg-[#171717]">
        <View className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-amber-200/10" />
        <View className="absolute -right-20 top-28 h-72 w-72 rounded-full bg-indigo-400/10" />
        <View className="absolute bottom-0 left-8 h-64 w-64 rounded-full bg-emerald-300/10" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 items-center justify-center px-6 py-8">{children}</View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'body' in error &&
    typeof error.body === 'object' &&
    error.body !== null &&
    'message' in error.body &&
    typeof error.body.message === 'string'
  ) {
    return error.body.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Please try again in a moment.'
}

function normalizeOrganizationCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replaceAll(/[^A-Z0-9]/g, '')
    .slice(0, 8)
}

function generateOrganizationCode() {
  return id().replaceAll('-', '').slice(0, 8).toUpperCase()
}

function buildOrganizationName(email: string | undefined | null, input: string) {
  const trimmed = input.trim()

  if (trimmed) {
    return trimmed
  }

  const localPart = email?.split('@')[0]?.trim()

  if (localPart) {
    return `${capitalize(localPart)} organization`
  }

  return 'New organization'
}

function capitalize(value: string) {
  if (!value) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default App
