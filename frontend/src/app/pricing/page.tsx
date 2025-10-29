'use client'

import { useState } from 'react'

type BillingType = 'monthly' | 'yearly'

type Plan = {
  name: string
  price: number
  yearlyPrice: number
  highlightLabel?: string
  period: string
  features: {
    text: string
    on: boolean
  }[]
  taskLine: string
  customButtonText?: string
}

const plans: Plan[] = [
  {
    name: 'STARTER',
    price: 59,
    yearlyPrice: 47,
    period: 'per mo',
    features: [
      { text: '1 User', on: true },
      { text: '10 GB Storage', on: true },
      { text: 'Basic Analytics', on: true },
      { text: 'Email Support', on: true },
      { text: 'Custom Domain', on: false },
      { text: 'Advanced Integrations', on: false },
    ],
    taskLine: '1000 monthly tasks',
    customButtonText: undefined,
  },
  {
    name: 'PRO',
    price: 89,
    yearlyPrice: 71,
    period: 'per mo',
    features: [
      { text: '5 Users', on: true },
      { text: '100 GB Storage', on: true },
      { text: 'Advanced Analytics', on: true },
      { text: 'Priority Email Support', on: true },
      { text: 'Custom Domain', on: true },
      { text: 'Configure advanced AI tools', on: true },
    ],
    taskLine: '10,000 monthly tasks',
    highlightLabel: 'Most Popular',
    customButtonText: undefined,
  },
  {
    name: 'ENTERPRISE',
    price: 99,
    yearlyPrice: 79,
    period: 'per mo',
    features: [
      { text: 'Unlimited Users', on: true },
      { text: '1 TB Storage', on: true },
      { text: 'Full Analytics Suite', on: true },
      { text: 'Dedicated Manager', on: true },
      { text: 'Integration via API', on: true },
      { text: 'Largest custom models & AI', on: true },
    ],
    taskLine: 'Unlimited monthly tasks',
    customButtonText: 'Contact Sales',
  },
]

const planDisplayFeatures: Record<string, string[]> = {
  STARTER: [
    '1 Integration channel',
    'Email & Dashboard Alerts',
    'No workflow syncing',
    'Basic Support',
  ],
  PRO: [
    'Up to 5 integration channels',
    'Advanced workflow syncing',
    'Email, SMS & Webhook Alerts',
    'Priority Support',
  ],
  ENTERPRISE: [
    'Unlimited integration channels',
    'Enterprise-grade workflow syncing',
    'All alerts types (Email, SMS, Webhook)',
    '24/7 Premium Support',
    'Large volume customization tools',
  ],
}

const planDisplayFeaturesOn: Record<string, boolean[]> = {
  STARTER: [true, true, false, false],
  PRO: [true, true, true, true],
  ENTERPRISE: [true, true, true, true, true],
}

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingType>('monthly')

  const getPlanPrice = (plan: Plan) =>
    billing === 'monthly' ? plan.price : plan.yearlyPrice

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#201c45] via-[#191e37] to-[#161535] px-5 py-10 flex flex-col items-center font-sans">
      {/* Header */}
      <div className="w-full max-w-5xl relative rounded-b-3xl bg-gradient-to-tr from-[#2b216d] via-[#21195c] to-[#582fa1] shadow-xl px-8 pt-12 pb-28 mb-[-80px] z-10 border border-[#382F7A]/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 mt-2 drop-shadow">
              See our pricing
            </h1>
            <p className="text-gray-300 mb-5 max-w-lg">
              Flexible plans for all businesses. Upgrade, downgrade or cancel anytime. Start 14-day free trial.
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-[#1a1942]/60 px-3 py-2 rounded-xl flex gap-2 shadow border border-[#3a3369]/40">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  billing === 'monthly'
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-slate-200 hover:bg-[#222366]/70'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  billing === 'yearly'
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-slate-200 hover:bg-[#222366]/70'
                }`}
              >
                Yearly
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-400/20 text-green-200 rounded-full font-semibold">Save 20%</span>
              </button>
            </div>
            <button className="hidden md:inline-block mt-6 rounded-3xl border border-indigo-100 text-indigo-200 px-5 py-2 font-bold shadow bg-gradient-to-r from-[#5044c8]/70 to-[#210d63]/40 tracking-tight transition hover:bg-indigo-500/80 hover:text-white">
              Contact us
            </button>
          </div>
        </div>
      </div>
      {/* Pricing Plans */}
      <div className="w-full max-w-5xl flex flex-col items-center mt-0">
        {/* Plans Row */}
        <div className="w-full flex flex-col md:flex-row gap-8 justify-center items-center mt-[-5rem]">
          {plans.map((plan, idx) => {
            // Card layout and visual choices
            const isPro = plan.name === 'PRO'
            const commonCard =
              'rounded-2xl shadow-2xl flex flex-col px-8 py-12 w-full max-w-sm items-center text-center'
            const colorCard =
              plan.name === 'PRO'
                ? 'bg-[#2f277b]/95 border-2 border-indigo-500 scale-105 relative z-10'
                : 'bg-[#25226a]/90 border border-[#382F7A]/30'
            const featuresArr = planDisplayFeatures[plan.name]
            const featuresOnArr = planDisplayFeaturesOn[plan.name]

            return (
              <div className={`${commonCard} ${colorCard} mb-4 md:mb-0`} key={plan.name}>
                <div
                  className={`uppercase text-xs tracking-wider ${
                    isPro
                      ? 'text-indigo-200 font-black opacity-90'
                      : 'text-slate-200 font-bold opacity-70'
                  } mb-5`}
                >
                  {plan.name.charAt(0).toUpperCase() + plan.name.slice(1).toLowerCase()}
                </div>
                <div className="text-4xl font-extrabold text-white mb-4">
                  ${getPlanPrice(plan)}
                </div>
                <div
                  className={`text-sm ${
                    isPro ? 'text-indigo-100' : 'text-slate-300'
                  } mb-8`}
                >
                  {plan.taskLine}
                </div>
                {/* Features List */}
                <ul
                  className={`space-y-4 ${
                    isPro || plan.name === 'ENTERPRISE'
                      ? 'text-indigo-50/95'
                      : 'text-slate-100/90'
                  } text-left mb-8 self-stretch`}
                >
                  {featuresArr &&
                    featuresArr.map((feat, i) => (
                      <li
                        className={`flex items-center gap-2 ${
                          featuresOnArr && featuresOnArr[i] ? '' : 'opacity-70'
                        }`}
                        key={feat}
                      >
                        <span
                          className={`font-bold text-lg ${
                            featuresOnArr && featuresOnArr[i]
                              ? 'text-green-400'
                              : 'text-slate-400'
                          }`}
                        >
                          ●
                        </span>
                        {feat}
                      </li>
                    ))}
                </ul>
                <button
                  className={`w-full py-2.5 rounded-xl ${
                    isPro
                      ? 'bg-indigo-500 hover:bg-indigo-700'
                      : plan.name === 'ENTERPRISE'
                      ? 'bg-indigo-700 hover:bg-indigo-800'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white text-lg font-bold shadow transition`}
                >
                  {plan.customButtonText || 'Choose'}
                </button>
                {/* Highlight Badge for Pro plan */}
                {plan.highlightLabel && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-xs font-bold text-white rounded-xl shadow-md ring-2 ring-indigo-200/50">
                    {plan.highlightLabel}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        {/* Pricing Notes */}
        <div className="w-full mt-12 flex flex-col items-center">
          <div className="text-xs text-indigo-100/70 mt-8 mb-1 text-center">
            *Prices listed in USD for Vision Studio SaaS.
          </div>
          <div className="text-xs text-indigo-200/40 text-center">
            Please{' '}
            <a
              href="/contact"
              className="text-indigo-300 hover:underline font-medium"
            >
              contact sales
            </a>{' '}
            for custom enterprise needs or higher usage.
          </div>
        </div>
        {/* FAQ Section */}
        <div className="w-full max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="group rounded-xl bg-[#19194a]/70 p-5 border border-[#382F7A]/20">
              <summary className="font-semibold text-indigo-100 cursor-pointer flex items-center group-open:text-indigo-300 transition-colors">
                <span className="mr-2 text-lg">
                  What payment methods do you support?
                </span>
              </summary>
              <div className="mt-2 text-indigo-100 text-sm">
                We currently support major credit cards and secure online payment gateways. For enterprise invoicing, please{' '}
                <a href="/contact" className="text-indigo-300 hover:underline">
                  contact us
                </a>
                .
              </div>
            </details>
            <details className="group rounded-xl bg-[#19194a]/70 p-5 border border-[#382F7A]/20">
              <summary className="font-semibold text-indigo-100 cursor-pointer flex items-center group-open:text-indigo-300 transition-colors">
                <span className="mr-2 text-lg">
                  Can I switch between plans?
                </span>
              </summary>
              <div className="mt-2 text-indigo-100 text-sm">
                Yes, you can upgrade or downgrade your plan at any time from your billing dashboard. Changes take effect immediately.
              </div>
            </details>
            <details className="group rounded-xl bg-[#19194a]/70 p-5 border border-[#382F7A]/20">
              <summary className="font-semibold text-indigo-100 cursor-pointer flex items-center group-open:text-indigo-300 transition-colors">
                <span className="mr-2 text-lg">Do you offer any free trials?</span>
              </summary>
              <div className="mt-2 text-indigo-100 text-sm">
                All users get a 14-day free trial of our Pro plan when signing up – no credit card required.
              </div>
            </details>
            <details className="group rounded-xl bg-[#19194a]/70 p-5 border border-[#382F7A]/20">
              <summary className="font-semibold text-indigo-100 cursor-pointer flex items-center group-open:text-indigo-300 transition-colors">
                <span className="mr-2 text-lg">What counts as a "task"?</span>
              </summary>
              <div className="mt-2 text-indigo-100 text-sm">
                Any execution of an automation flow, integration step, or alert triggers a "task". For details, refer to our{' '}
                <a href="/docs/billing" className="text-indigo-300 hover:underline">
                  billing docs
                </a>
                .
              </div>
            </details>
            <details className="group rounded-xl bg-[#19194a]/70 p-5 border border-[#382F7A]/20">
              <summary className="font-semibold text-indigo-100 cursor-pointer flex items-center group-open:text-indigo-300 transition-colors">
                <span className="mr-2 text-lg">How can I get a custom quote?</span>
              </summary>
              <div className="mt-2 text-indigo-100 text-sm">
                If your business has specific needs, higher usage, or wants an SLA, please{' '}
                <a href="/contact" className="text-indigo-300 hover:underline">
                  reach out to our sales team
                </a>{' '}
                for a tailored quote.
              </div>
            </details>
          </div>
        </div>
        {/* Call to Action */}
        <div className="w-full max-w-2xl mx-auto mt-16 mb-24">
          <div className="rounded-2xl bg-gradient-to-br from-[#2d2776]/50 to-[#232168]/60 border border-indigo-900/30 shadow-xl px-8 py-10 flex flex-col items-center text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to get started?
            </h3>
            <p className="text-indigo-200/90 mb-6 text-base md:text-lg">
              Unlock powerful workflow integrations and AI automation for your team.
            </p>
            <a
              href="/signup"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 transition-all px-7 py-3 rounded-xl text-lg font-bold text-white shadow-lg mt-1"
            >
              Start your free trial
            </a>
            <div className="text-xs text-indigo-300/60 mt-3">
              No credit card required · Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
