import { db } from "@/lib/db";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const selectId = "4d39508b-9ee2-48a3-b70d-8192d9c5a059";

function App() {
  const { isLoading, error, user } = db.useAuth();

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
    );
  }

  if (error) {
    return (
      <ScreenShell>
        <View className="w-full max-w-md rounded-[28px] border border-red-300/20 bg-red-950/60 p-6">
          <Text className="font-mono text-xs uppercase tracking-[3px] text-red-200">
            Authentication error
          </Text>
          <Text className="mt-3 text-base leading-6 text-red-50">
            {error.message}
          </Text>
        </View>
      </ScreenShell>
    );
  }

  if (user) {
    return <Main />;
  }

  return <LoginScreen />;
}

function Main() {
  const user = db.useUser();
  const { isLoading, error, data } = db.useQuery({
    colors: {
      $: { where: { id: selectId } },
    },
  });

  const selectedColor = data?.colors[0]?.value ?? "#D6D3D1";
  const palette = useMemo(
    () => [
      { label: "Fern", value: "#6D9773" },
      { label: "Tide", value: "#5C7AEA" },
      { label: "Iris", value: "#7C3AED" },
    ],
    [],
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: selectedColor }}
    >
      <View className="flex-1 justify-between px-6 py-8">
        <View className="gap-3">
          <Text className="font-mono text-xs uppercase tracking-[3px] text-black/55">
            Signed in
          </Text>
          <Text className="text-4xl font-black leading-tight text-slate-950">
            Hello {user?.email ?? "there"}
          </Text>
          <Text className="max-w-sm text-base leading-6 text-slate-900/75">
            You are authenticated with Instant magic codes. Pick a backdrop
            color and the main experience stays visible only for signed-in
            users.
          </Text>
        </View>

        <View className="rounded-[32px] border border-black/10 bg-white/80 p-6 shadow-2xl">
          <Text className="font-mono text-xs uppercase tracking-[3px] text-slate-500">
            Favorite color
          </Text>
          <Text className="mt-3 text-3xl font-bold text-slate-950">
            Choose the room tone
          </Text>
          <Text className="mt-2 text-base leading-6 text-slate-600">
            The current selection is synced through Instant and updates the page
            background in real time.
          </Text>

          <View className="mt-6 gap-3">
            {palette.map((color) => {
              const active = color.value === selectedColor;

              return (
                <Pressable
                  key={color.value}
                  onPress={() => {
                    db.transact(
                      db.tx.colors[selectId].update({ value: color.value }),
                    );
                  }}
                  className="flex-row items-center justify-between rounded-[22px] border px-4 py-4"
                  style={{
                    backgroundColor: active ? "rgba(15, 23, 42, 0.92)" : "#fff",
                    borderColor: active ? "rgba(15, 23, 42, 0.92)" : "#E7E5E4",
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <Text
                      className="text-base font-semibold"
                      style={{ color: active ? "#F8FAFC" : "#0F172A" }}
                    >
                      {color.label}
                    </Text>
                  </View>
                  <Text
                    className="font-mono text-xs uppercase tracking-[2px]"
                    style={{ color: active ? "#CBD5E1" : "#64748B" }}
                  >
                    {active ? "Selected" : "Set"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => {
              db.auth.signOut();
            }}
            className="mt-6 rounded-full border border-slate-300 px-4 py-3"
          >
            <Text className="text-center font-semibold text-slate-800">
              Sign out
            </Text>
          </Pressable>

          {isLoading ? (
            <Text className="mt-4 text-sm text-slate-500">Loading color...</Text>
          ) : null}
          {error ? (
            <Text className="mt-4 text-sm text-red-600">{error.message}</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const trimmedEmail = email.trim().toLowerCase();

  const sendCode = async () => {
    if (!trimmedEmail) {
      Alert.alert("Email required", "Enter your email to receive a magic code.");
      return;
    }

    setIsSending(true);
    setSentEmail(trimmedEmail);

    try {
      await db.auth.sendMagicCode({ email: trimmedEmail });
    } catch (err) {
      setSentEmail("");
      Alert.alert("Unable to send code", getErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) {
      Alert.alert("Code required", "Enter the code we emailed to you.");
      return;
    }

    setIsVerifying(true);

    try {
      await db.auth.signInWithMagicCode({
        email: sentEmail,
        code: code.trim(),
      });
    } catch (err) {
      setCode("");
      Alert.alert("Unable to verify code", getErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <ScreenShell>
      <KeyboardAvoidingView
        className="w-full"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="self-center w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl">
          <Text className="font-mono text-xs uppercase tracking-[3px] text-stone-300">
            Households
          </Text>
          <Text className="mt-4 text-4xl font-black leading-tight text-stone-50">
            Enter with a magic code.
          </Text>
          <Text className="mt-3 text-base leading-6 text-stone-300">
            Only logged-in users can access the main screen. Use your email to
            get a one-time code and we will sign you in securely.
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
                  backgroundColor: isVerifying ? "#57534E" : "#F4EEE7",
                }}
              >
                <Text className="text-center text-base font-bold text-slate-950">
                  {isVerifying ? "Verifying..." : "Verify code"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setSentEmail("");
                  setCode("");
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
                style={{ backgroundColor: isSending ? "#57534E" : "#F4EEE7" }}
              >
                <Text className="text-center text-base font-bold text-slate-950">
                  {isSending ? "Sending..." : "Send magic code"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

function ScreenShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SafeAreaView className="flex-1 bg-[#171717]">
      <View className="flex-1 overflow-hidden bg-[#171717]">
        <View className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-amber-200/10" />
        <View className="absolute -right-20 top-28 h-72 w-72 rounded-full bg-indigo-400/10" />
        <View className="absolute bottom-0 left-8 h-64 w-64 rounded-full bg-emerald-300/10" />
        <View className="flex-1 items-center justify-center px-6">
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "body" in error &&
    typeof error.body === "object" &&
    error.body !== null &&
    "message" in error.body &&
    typeof error.body.message === "string"
  ) {
    return error.body.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Please try again in a moment.";
}

export default App;
