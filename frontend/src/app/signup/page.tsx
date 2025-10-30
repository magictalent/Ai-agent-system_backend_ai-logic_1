'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company_name: formData.companyName,
          }
        }
      })

      if (error) throw new Error(error.message)

      if (data.user) {
        if (data.user.email_confirmed_at) {
          router.push('/login?message=Registration successful! You can now log in.')
        } else {
          // Show the verification email message on the signup page just like login page did
          setSuccessMessage('Registration successful! Please check your email and click the verification link to activate your account.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
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

        {/* Signup Card Section */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center py-12">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto rounded-2xl shadow-lg p-10 bg-gradient-to-br from-[#202245]/70 via-[#24295d]/60 to-[#24244b]/90 border border-[#23254d]/60 relative"
            style={{ boxShadow: '0 8px 40px 0 #18213b40, 0 2px 8px 0 #192e6a33' }}
            autoComplete="off"
          >
            <div className="flex flex-col items-center mb-7">
              <img src="/logo23.png" alt="Register logo" className="h-21 w-60 mb-2 bg-opacity-90" />
              <h2 className="text-3xl font-bold text-[#58A6FF] tracking-tight mb-1">Create Account</h2>
              <p className="text-[#A8AAC3ef] text-base mt-1">Start your sales journey</p>
            </div>

            {successMessage && (
              <div className="bg-green-400/10 border border-green-400 text-green-200 px-4 py-3 rounded mb-3 text-[15px] text-center animate-fade-in">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-400 text-red-100 px-4 py-3 rounded mb-3 text-[15px] text-center animate-shake">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-5 mb-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="firstName" className="block mb-1 text-[#adc3e2] text-xs font-semibold tracking-wide">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-lg text-white bg-[#232445]/70 placeholder-[#6270a7] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] font-medium border border-[#31345b] transition-all duration-200"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    spellCheck={false}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="lastName" className="block mb-1 text-[#adc3e2] text-xs font-semibold tracking-wide">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-lg text-white bg-[#232445]/70 placeholder-[#6270a7] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] font-medium border border-[#31345b] transition-all duration-200"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    spellCheck={false}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="companyName" className="block mb-1 text-[#adc3e2] text-xs font-semibold tracking-wide">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-white bg-[#232445]/70 placeholder-[#6270a7] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] font-medium border border-[#31345b] transition-all duration-200"
                  placeholder="Your Company Inc"
                  value={formData.companyName}
                  onChange={handleChange}
                  spellCheck={false}
                />
              </div>
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
                  value={formData.email}
                  onChange={handleChange}
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
                  className="w-full px-4 py-2.5 rounded-lg text-white bg-[#232445]/70 placeholder-[#6270a7] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] font-medium border border-[#31345b] transition-all duration-200"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  spellCheck={false}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block mb-1 text-[#adc3e2] text-xs font-semibold tracking-wide">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-white bg-[#232445]/70 placeholder-[#6270a7] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] font-medium border border-[#31345b] transition-all duration-200"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  spellCheck={false}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
               className="w-full bg-gradient-to-r from-[#58A6FF] via-[#353b8d] to-[#2bccaa] hover:from-[#73c7ff] hover:via-[#2678C5] hover:to-[#60f7c8] text-white py-2.5 rounded-lg font-bold text-base transition disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div className="flex flex-col items-center gap-2 mt-6">
              <span className="text-[#7c8cbf] text-xs select-none">or</span>
              <button
                type="button"
                className="w-full bg-white/90 hover:bg-white text-[#131b24] hover:text-[#214877] text-[15px] font-semibold rounded-lg py-2 flex items-center justify-center gap-2 shadow transition duration-150 border border-[#e2eaff] hover:border-[#7dc6fa] group"
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
            <div className="text-center mt-7">
              <p className="text-[#b5bcea]">
                Already have an account?{' '}
                <Link href="/login" className="text-[#58A6FF] hover:text-[#b9e0fe] font-semibold">
                  Sign in
                </Link>
              </p>
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