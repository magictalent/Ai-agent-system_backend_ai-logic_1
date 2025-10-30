import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4 text-purple-800 flex items-center gap-3">
        <span>
          <i className="fa-regular fa-circle-question text-purple-400"></i>
        </span>
        Help &amp; Support
      </h1>
      <p className="text-gray-700 mb-8">
        Welcome to SellienT! Here are answers to common questions, tips, and resources.
        Still stuck? Our AI Assistant (<span className="inline-block"><i className="fa-solid fa-sparkles text-pink-400"></i></span> "Toki") is always available in the bottom right!
      </p>
      <div className="bg-white rounded-xl border border-purple-100 shadow-sm mb-8">
        <ul className="divide-y divide-purple-50">
          <li className="p-5">
            <h2 className="text-lg font-semibold text-purple-700 mb-1">How do I get started?</h2>
            <p className="text-gray-600">
              Use the sidebar to create your first campaign, import leads, or connect your WhatsApp/Email channels. The dashboard gives you an overview to manage everything.
            </p>
          </li>
          <li className="p-5">
            <h2 className="text-lg font-semibold text-purple-700 mb-1">Where can I view campaign performance?</h2>
            <p className="text-gray-600">
              Go to <Link href="/campaigns" className="text-purple-700 underline">Campaigns</Link> to see open/click/reply rates and overall results.
            </p>
          </li>
          <li className="p-5">
            <h2 className="text-lg font-semibold text-purple-700 mb-1">How does the AI assistant help?</h2>
            <p className="text-gray-600">
              Toki (the sparkle icon) can answer questions about your campaigns, leads, and platform features. Tap <span className="inline-block"><i className="fa-solid fa-sparkles text-pink-400"></i></span> at any time!
            </p>
          </li>
          <li className="p-5">
            <h2 className="text-lg font-semibold text-purple-700 mb-1">How do I upgrade or manage my account?</h2>
            <p className="text-gray-600">
              Visit <Link href="/settings" className="text-purple-700 underline">Settings</Link> or the <Link href="/upgrade" className="text-purple-700 underline">Upgrade</Link> page.
            </p>
          </li>
          <li className="p-5">
            <h2 className="text-lg font-semibold text-purple-700 mb-1">Need more help?</h2>
            <p className="text-gray-600">
              The <span className="inline-block"><i className="fa-solid fa-sparkles text-pink-400"></i></span> AI Assistant is available 24/7, or contact our team at <a href="mailto:support@sellient.com" className="underline text-purple-700">support@sellient.com</a>.
            </p>
          </li>
        </ul>
      </div>
      <div className="text-sm text-gray-500 mb-2">
        <span className="font-medium text-purple-700">Tip:</span> For platform walkthroughs and updates, visit our <a className="underline" href="https://sellient.com/blog" target="_blank" rel="noopener noreferrer">blog</a> or contact support.
      </div>
    </div>
  );
}
