'use client'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Custom404Client() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DotLottieReact
          src="https://lottie.host/41eb9e03-d0cd-4abe-ae3e-7e1994ac5163/CqUa7x73ns.lottie"
          loop
          autoplay
          style={{ width: 400, height: 400 }}
        />
      </motion.div>
      <motion.h1
        className="text-4xl font-bold mt-6 text-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        Oops! Page Not Found
      </motion.h1>
      <motion.p
        className="text-gray-500 mt-2 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        Our AI agent couldn’t find this page in the lead pipeline. Let’s get you back on track.
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <Link
          href="/"
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Go Home
        </Link>
      </motion.div>
    </div>
  )
}
