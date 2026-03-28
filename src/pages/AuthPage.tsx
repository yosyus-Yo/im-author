import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'

export default function AuthPage() {
  const { user, signIn, signInAsGuest } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/app', { replace: true })
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    try {
      await signIn()
    } catch (error) {
      console.error('Sign in failed', error)
    }
  }

  const handleGuestSignIn = async () => {
    try {
      await signInAsGuest()
    } catch (error) {
      console.error('Guest sign in failed', error)
    }
  }

  return (
    <div className="font-body text-on-surface min-h-screen flex flex-col bg-[#f5efe6]">
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-secondary-fixed-dim blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] rounded-full bg-primary-fixed-dim blur-[100px]"></div>
        </div>
        <div className="bg-[#fbf7f1] w-full max-w-md p-10 rounded-xl relative z-10 shadow-lg">
          <div className="text-center mb-10">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
              I'm Author
            </h1>
            <p className="text-on-surface-variant font-body text-sm mt-3 tracking-wide opacity-80 uppercase">
              The Modern Scriptorium
            </p>
          </div>
          <div className="space-y-6">
            <button
              onClick={() => void handleGoogleSignIn()}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-white transition-all duration-300 group"
            >
              <span className="text-xl">G</span>
              <span className="text-on-surface font-medium text-sm">Continue with Google</span>
            </button>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-[#fbf7f1] px-4 text-outline">or via manuscript key</span>
              </div>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full bg-surface-container-highest/40 border-0 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm placeholder:text-outline/50"
                  id="email"
                  placeholder="author@manuscript.com"
                  type="email"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1"
                    htmlFor="password"
                  >
                    Secret Key
                  </label>
                  <a
                    className="text-[10px] text-secondary hover:text-on-secondary-container transition-colors font-bold uppercase tracking-widest"
                    href="#"
                  >
                    Forgotten?
                  </a>
                </div>
                <input
                  className="w-full bg-surface-container-highest/40 border-0 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm placeholder:text-outline/50"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
              <button
                className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-semibold tracking-wide hover:bg-stone-800 transition-all duration-300 shadow-sm mt-4"
                type="submit"
              >
                Open Workspace
              </button>
            </form>
            <div className="pt-2">
              <button
                onClick={() => void handleGuestSignIn()}
                className="w-full border border-outline-variant/40 text-on-surface-variant py-3 rounded-lg text-sm font-medium hover:bg-surface-container-high/30 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span className="text-sm group-hover:rotate-12 transition-transform">✍️</span>
                <span>Continue as Guest</span>
              </button>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              New to the craft?{' '}
              <a
                className="text-secondary font-bold hover:underline underline-offset-4 decoration-secondary/30"
                href="#"
              >
                Apply for access
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
