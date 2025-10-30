'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShowResendVerification(false)

    if (!email.trim()) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError('Please enter your password.')
      setLoading(false)
      return
    }

    try {
      await login(email.trim().toLowerCase(), password)
      router.push('/dashboard')
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials') || err.message.includes('Invalid credentials')) {
        setError('Invalid email or password. Please check your credentials.')
      } else if (err.message.includes('Email not confirmed') || err.message.includes('not confirmed')) {
        setError('Please check your email and click the verification link before logging in.')
        setShowResendVerification(true)
      } else if (err.message.includes('User not found')) {
        setError('No account found with this email address. Please sign up first.')
      } else if (err.message.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a moment and try again.')
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }

    setResendLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccessMessage('Verification email sent! Please check your inbox.')
        setShowResendVerification(false)
      }
    } catch (err: any) {
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#214877] via-[#251144] to-[#191b34] px-4 py-10">
      <div className="relative flex w-full max-w-5xl shadow-2xl rounded-3xl overflow-hidden border border-[#292c46]/50 bg-[#181a2c]/80 backdrop-blur-xl">
        {/* Decorative left section */}
        <div className="hidden lg:flex flex-col justify-center w-1/2 px-12 py-14 bg-gradient-to-b from-[#222962] via-[#1e214a]/60 to-[#1b1739] relative">
          <div className="absolute opacity-30 blur-2xl z-0 left-[-60px] top-40 w-96 h-96 rounded-full bg-[#54c0fc] mix-blend-screen"></div>
          <div className="absolute opacity-10 blur-3xl z-0 right-0 bottom-20 w-[420px] h-[180px] rounded-full bg-[#5afcaa] rotate-[-10deg]"></div>
          <div className="relative z-10 select-none">
            <img src="/logo23.png" alt="Sellient Logo" className="h-14 w-auto mb-8 drop-shadow" />
            <span className="uppercase tracking-[0.25em] text-sm text-[#98b6e9] font-semibold">
              Built for world:
            </span>
            <h1 className="mt-8 text-[3.2rem] xl:text-[4.5rem] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6fecb8] via-[#58A6FF] to-[#68d7f8] drop-shadow mb-3 tracking-tight">
              Sellient <br />
              <span className="inline-block text-gradient bg-gradient-to-tr from-[#a8aac3] via-[#f0e6fa] to-[#dbeafe] bg-clip-text text-transparent font-semibold text-5xl xl:text-6xl">SALES</span>
              <span className="inline-block pl-2 text-[#58A6FF] font-bold text-5xl xl:text-6xl drop-shadow">HUB</span>
            </h1>
            <p className="mt-12 text-lg text-[#cff2fbcc] font-medium max-w-[420px]">
              Accelerate your sales with powerful tools, advanced analytics, and seamless team collaboration.
            </p>
          </div>
        </div>
        {/* Login Card Section */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center py-12">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto rounded-2xl shadow-lg p-10 bg-gradient-to-br from-[#202245]/70 via-[#24295d]/60 to-[#24244b]/90 border border-[#23254d]/60 relative"
            style={{ boxShadow: '0 8px 40px 0 #18213b40, 0 2px 8px 0 #192e6a33' }}
            autoComplete="off"
          >
            <div className="flex flex-col items-center mb-7">
              <img src="/logo23.png" alt="Login logo" className="h-21 w-60 mb-  bg-opacity-90" />
              <h2 className="text-3xl font-bold text-[#58A6FF] tracking-tight mb-1">Welcome Back</h2>
              <p className="text-[#A8AAC3ef] text-base mt-1">Sign in to your account</p>
            </div>

            {successMessage && (
              <div className="bg-green-400/10 border border-green-400 text-green-200 px-4 py-3 rounded mb-3 text-[15px] text-center animate-fade-in">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-400 text-red-100 px-4 py-3 rounded mb-3 text-[15px] text-center animate-shake">
                {error}
                {showResendVerification && (
                  <div className="mt-2">
                    <button
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="text-blue-300 hover:text-blue-100 underline text-xs disabled:opacity-60 animate-pulse"
                      type="button"
                    >
                      {resendLoading ? 'Sending...' : 'Resend verification email'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-5 mb-5">
              <div>
                <label htmlFor="email" className="block mb-1 text-[#adc3e2] text-xs font-semibold tracking-wide">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-lg text-white bg-[#232445]/70 placeholder-[#6270a7] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] font-medium border border-[#31345b] transition-all duration-200"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  spellCheck={false}
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-1 text-[#adc3e2] text-xs font-semibold tracking-wide">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-lg text-white bg-[#232445]/70 placeholder-[#6270a7] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] font-medium border border-[#31345b] transition-all duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  spellCheck={false}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#23244B] bg-[#252c53] checked:bg-[#58A6FF] focus:ring-[#58A6FF] accent-[#58A6FF] transition-all"
                    style={{ boxShadow: '0 0 0 1.5px #23244b inset' }}
                  />
                  <label htmlFor="remember-me" className="ml-2 text-xs text-[#9baad6] font-medium">
                    Remember me
                  </label>
                </div>
                <div className="text-xs">
                  <a href="#" className="text-[#58A6FF] hover:underline hover:text-[#7ec6ff] transition font-medium">
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#58A6FF] via-[#353b8d] to-[#2bccaa] hover:from-[#73c7ff] hover:via-[#2678C5] hover:to-[#60f7c8] text-white py-2.5 rounded-lg font-bold text-base transition disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Signing in...
                </span>
              ) : (
                'Login'
              )}
            </button>
            <div className="flex items-center gap-2 text-xs text-[#b4c4ea] pt-5">
              <input type="checkbox" id="terms" className="accent-[#58A6FF] scale-90" required />
              <label htmlFor="terms" className="select-none">
                I agree to the{' '}
                <a href="#" className="text-[#58A6FF] hover:underline hover:text-[#5de9cd] transition font-semibold">
                  Terms &amp; Conditions
                </a>
              </label>
            </div>
            <div className="text-center mt-3">
              <span className="text-[#b6bcdb] text-sm">
                Don’t have an account?{' '}
                <Link href="/signup" className="text-[#58A6FF] hover:underline font-semibold hover:text-[#5de9cd]">
                  Sign up
                </Link>
              </span>
            </div>
            <div className="relative py-5 flex items-center">
              <div className="flex-grow border-t border-[#24335a]"></div>
              <span className="mx-3 text-slate-400/80 text-xs">or</span>
              <div className="flex-grow border-t border-[#24335a]"></div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
                        queryParams: { prompt: 'select_account' },
                      },
                    })
                    if (error) throw error
                  } catch (e: any) {
                    setError(e.message || 'Google sign-in failed')
                  }
                }}
                className="w-full bg-white/90 hover:bg-white text-[#131b24] hover:text-[#214877] text-[15px] font-semibold rounded-lg py-2 flex items-center justify-center gap-2 shadow transition duration-150 border border-[#e2eaff] hover:border-[#7dc6fa] group"
              >
                <img src="/icons/google.png" alt="Google" className="w-5 h-5 mr-2" />
                <span className="mr-1">Continue with</span>
                <span className="font-bold group-hover:text-[#58A6FF] transition">Google</span>
              </button>
              <button
                type="button"
                className="w-full bg-[#18182f] hover:bg-[#23244B] border border-[#23244B] text-white text-[15px] rounded-lg py-2 flex items-center justify-center gap-2 transition font-semibold"
              >
                <img src="/icons/apple.png" alt="Apple" className="w-5 h-5 mr-2" />
                <span className="mr-1">Continue with</span>
                <span className="font-bold text-[#e4e4e6] group-hover:text-[#000] transition">Apple</span>
              </button>
            </div>
          </form>
          <div className="w-full mt-10 text-center select-none animate-fade-in-slow">
            <div className="text-xs text-[#FFFFFFFF] font-medium">&copy; {new Date().getFullYear()} Made with <span className="text-[#58A6FF]">❤</span> by Andi Jackson. All rights reserved.</div>
            <div className="flex gap-4 justify-center mt-2 text-xs text-[#FFFFFFFF]">
              <a href="#" className="hover:text-[#58A6FF] transition text-xs">Marketplace</a>
              <span className="opacity-40">|</span>
              <a href="#" className="hover:text-[#58A6FF] transition text-xs">Blog</a>
              <span className="opacity-40">|</span>
              <a href="#" className="hover:text-[#58A6FF] transition text-xs">License</a>
            </div>
          </div>
        </div>
      </div>
      {/* Subtle floating background shapes for extra branding */}
      <div className="fixed z-0 inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[#58A6FF]/20 blur-3xl animate-float-slow" />
        <div className="absolute bottom-10 right-[-120px] w-[440px] h-[200px] rounded-full bg-gradient-to-tr from-[#67f3bc]/20 via-[#58A6FF]/10 to-[#ecebf0]/0 blur-3xl animate-float-reverse" />
      </div>
      {/* Animations */}
      <style jsx>{`
        @keyframes floatSlow {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(18px) scale(1.02);
          }
        }
        @keyframes floatReverse {
          0%,
          100% {
            transform: translateX(0px) scale(1);
          }
          50% {
            transform: translateX(-20px) scale(1.04);
          }
        }
        .animate-float-slow {
          animation: floatSlow 8s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: floatReverse 9s linear infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease;
        }
        .animate-fade-in-slow {
          animation: fadeIn 1.1s cubic-bezier(0.33, 1, 0.68, 1);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-shake {
          animation: shakeIt 0.22s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shakeIt {
          10%, 90% {
            transform: translateX(-1px);
          }
          20%, 80% {
            transform: translateX(2px);
          }
          30%, 50%, 70% {
            transform: translateX(-4px);
          }
          40%, 60% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </div>
  )
}
