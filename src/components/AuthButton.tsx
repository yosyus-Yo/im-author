import type { User } from '@supabase/supabase-js'

interface AuthButtonProps {
  user: User | null
  isLoading: boolean
  onSignIn: () => Promise<void>
  onSignOut: () => Promise<void>
  onOpenLibrary: () => void
  authModeLabel: string
}

function getDisplayName(user: User | null) {
  return (
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    '사용자'
  )
}

export default function AuthButton({
  user,
  isLoading,
  onSignIn,
  onSignOut,
  onOpenLibrary,
  authModeLabel,
}: AuthButtonProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-[#f7efe3] px-4 py-3 text-sm font-medium text-stone-600">
        인증 상태 확인 중...
      </div>
    )
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => void onSignIn()}
        className="inline-flex items-center justify-center rounded-2xl border border-stone-900 bg-stone-900 px-4 py-3 text-sm font-semibold text-amber-50 shadow-sm"
      >
        {authModeLabel === 'Supabase' ? 'Google로 로그인' : '데모 로그인'}
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-stone-200 bg-[#f7efe3] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-sm font-semibold text-amber-900">
          {getDisplayName(user).slice(0, 1)}
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">{getDisplayName(user)}</p>
          <p className="text-xs text-stone-500">{authModeLabel} 연결</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenLibrary}
        className="rounded-2xl border border-stone-200 bg-[#fffdfa] px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm"
      >
        내 서재
      </button>
      <button
        type="button"
        onClick={() => void onSignOut()}
        className="rounded-2xl border border-stone-200 bg-[#fffdfa] px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm"
      >
        로그아웃
      </button>
    </div>
  )
}
