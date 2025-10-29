
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
          src="https://lottie.host/0bbb5813-3366-4ea6-90cb-b9aff353c814/J1zwDPSJcU.lottie"
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
        Developing!
      </motion.h1>
      <motion.p
        className="text-gray-500 mt-2 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        This page is under construction.
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

