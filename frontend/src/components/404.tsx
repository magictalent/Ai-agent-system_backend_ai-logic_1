import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Image
          src="/images/404-ai-agent.png"
          alt="404 AI Agent Not Found"
          width={400}
          height={400}
          priority
        />
      </motion.div>
      <h1 className="text-4xl font-bold mt-6 text-gray-800">
        Oops! Page Not Found
      </h1>
      <p className="text-gray-500 mt-2 max-w-md">
        Our AI agent couldn’t find this page in the lead pipeline. Let’s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
