'use client'

import { useState } from 'react'
import Image from 'next/image'

type Payment = {
  id: number
  date: string
  amount: number
  status: string
}

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState('visa')
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'visa', type: 'Visa', cardNumber: '7812 2139 0823 7916', expiry: '08/24', main: true },
    { id: 'master', type: 'Mastercard', cardNumber: '9201 2345 8912 2222', expiry: '04/26', main: false },
  ])

  const [invoices] = useState([
    { id: 1, date: 'March 5, 2023', amount: 180, status: 'Paid' },
    { id: 2, date: 'February 1, 2023', amount: 250, status: 'Paid' },
    { id: 3, date: 'April 2, 2022', amount: 105, status: 'Paid' },
    { id: 4, date: 'June 10, 2021', amount: 200, status: 'Paid' },
    { id: 5, date: 'March 4, 2019', amount: 300, status: 'Paid' },
  ])

  const [transactions] = useState([
    { id: 1, name: 'Netflix', date: '25 Mar 2023, 12:34', amount: -12.99 },
    { id: 2, name: 'Apple', date: '24 Mar 2023, 16:08', amount: 52.0 },
  ])

  // Payment history based on invoices
  const [payments] = useState<Payment[]>([
    { id: 1, date: 'March 5, 2023', amount: 180, status: 'Paid' },
    { id: 2, date: 'February 1, 2023', amount: 250, status: 'Paid' },
    { id: 3, date: 'April 2, 2022', amount: 105, status: 'Paid' },
    { id: 4, date: 'June 10, 2021', amount: 200, status: 'Paid' },
    { id: 5, date: 'March 4, 2019', amount: 300, status: 'Paid' },
  ])

  // Demo FX
  const currency = '$'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#201c45] via-[#191e37] to-[#161535] px-5 py-10 flex flex-col gap-10 items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-7">
        {/* Main Card & Balance */}
        <div className="md:col-span-2 flex flex-col gap-7">
          {/* Card */}
          <div className="rounded-2xl shadow-xl bg-gradient-to-tr from-[#21195b] via-[#25276a] to-[#4b18ae] relative p-7 flex flex-col text-white mb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium mb-3 opacity-70">Vision UI</span>
              <span className="ml-auto flex">
                {/* Could be credit card icon here if desired */}
                <svg width="34" height="22" viewBox="0 0 34 22" fill="none" className="opacity-80">
                  <rect width="34" height="22" rx="6" fill="#e0d7ff" fillOpacity="0.2" />
                  <rect x="4" y="6" width="26" height="10" rx="3" fill="#fff" fillOpacity="0.09" />
                </svg>
              </span>
            </div>
            <div className="text-2xl font-bold tracking-wider mt-2 mb-4 select-text">
              7812 2139 0823 7916
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs opacity-60">Valid Thru</div>
                <div className="font-medium">08/24</div>
              </div>
              <div className="ml-7 flex flex-col items-end">
                <span className="text-xs opacity-60 mb-0.5">CVV</span>
                <span className="font-medium">09X</span>
              </div>
            </div>
            <div className="absolute right-7 top-6 flex items-center">
              <div className="w-7 h-7 rounded-full bg-white bg-opacity-40 flex items-center justify-center text-indigo-300 font-bold text-lg">◎</div>
              <div className="ml-2 w-5 h-5 rounded-full bg-white bg-opacity-10 flex items-center justify-center" />
            </div>
          </div>
          {/* Balance */}

          {/* Balance Card */}
          <div className="rounded-2xl bg-[#19194a] shadow-lg px-7 py-6 flex flex-col gap-4 border border-[#302369]/40">
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3 0 2.25 3 5 3 5s3-2.75 3-5c0-1.657-1.343-3-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v.01" />
              </svg>
              Current Balance
            </div>
            <div className="text-4xl md:text-5xl font-extrabold text-indigo-200 tracking-tight">
              {currency}6,256.00
            </div>
            <div className="text-xs text-gray-400">As of {new Date().toLocaleDateString()}</div>
          </div>

          {/* Transactions Card */}
          <div className="rounded-2xl bg-[#19194a] shadow-lg px-7 py-6 flex flex-col gap-4 border border-[#302369]/40">
            <div className="flex items-center gap-2 text-lg font-bold text-white mb-2">
              <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              Recent Transactions
            </div>
            <div className="divide-y divide-[#31295b]/60">
              {transactions.length === 0 && (
                <div className="py-4 text-gray-500 text-sm">No transactions found.</div>
              )}
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-white font-medium">{tx.name}</div>
                    <div className="text-xs text-gray-400">{tx.date}</div>
                  </div>
                  <div className={`text-base font-bold ${tx.amount >= 0 ? 'text-green-300' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : '-'}{currency}{Math.abs(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payments Table (History) */}
        <div className="md:col-span-2 flex flex-col gap-7">
          <div className="bg-[#201e4e]/80 rounded-2xl shadow-lg border border-[#372c71]/40 p-8">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-white">Payment History</h2>
              <button className="text-indigo-300 hover:underline text-sm">Export .csv</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm bg-[#231e4a]/70 border-b border-[#292364]/60">
                    <th className="py-3 px-5 font-semibold">Date</th>
                    <th className="py-3 px-5 font-semibold">Amount</th>
                    <th className="py-3 px-5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 px-5 text-center text-gray-500">
                        No payment history found.
                      </td>
                    </tr>
                  )}
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-[#292364]/30 hover:bg-[#232262]/30 transition">
                      <td className="py-4 px-5 text-white text-sm">{payment.date}</td>
                      <td className="py-4 px-5 text-indigo-200 font-bold">{currency}{payment.amount.toFixed(2)}</td>
                      <td className="py-4 px-5">
                        <span className={
                          payment.status === 'Paid'
                            ? "px-3 py-1 rounded-xl text-xs font-semibold text-green-300 bg-green-500/10 border border-green-400/10"
                            : "px-3 py-1 rounded-xl text-xs font-semibold text-yellow-300 bg-yellow-500/10 border border-yellow-400/10"
                        }>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
