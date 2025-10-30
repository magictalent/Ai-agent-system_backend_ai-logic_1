"use client"

import { useState } from "react"
import { Plus, FileText } from "lucide-react"

type Snippet = {
  id: number
  title: string
  description: string
  code: string
}

const initialSnippets: Snippet[] = [
  {
    id: 1,
    title: "Hello World in JavaScript",
    description: "A simple hello world example.",
    code: `console.log("Hello, World!");`
  },
  {
    id: 2,
    title: "Fetch Data (async/await)",
    description: "How to fetch data from an API using fetch and async/await.",
    code: `async function getData() {
  const res = await fetch('/api/data');
  return await res.json();
}`
  }
]

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", code: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAddSnippet = () => {
    if (!form.title.trim() || !form.code.trim()) return
    setSnippets([
      ...snippets,
      {
        id: Date.now(),
        title: form.title.trim(),
        description: form.description.trim(),
        code: form.code
      }
    ])
    setForm({ title: "", description: "", code: "" })
    setShowForm(false)
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-900">
          <FileText className="text-blue-500" size={28} />
          My Code Snippets
        </h1>
        <button
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus size={18} /> New Snippet
        </button>
      </div>

      {showForm && (
        <div className="mb-10 border p-6 rounded-xl bg-blue-50 border-blue-100">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-blue-700 mb-1">
              Title
            </label>
            <input
              name="title"
              className="w-full px-3 py-2 rounded-lg border border-blue-200"
              value={form.title}
              onChange={handleChange}
              placeholder="Snippet title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-blue-700 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <input
              name="description"
              className="w-full px-3 py-2 rounded-lg border border-blue-200"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-blue-700 mb-1">
              Code
            </label>
            <textarea
              name="code"
              className="w-full px-3 py-2 rounded-lg border border-blue-200 font-mono"
              rows={6}
              value={form.code}
              onChange={handleChange}
              placeholder="Paste your code here..."
            />
          </div>
          <div className="flex gap-3">
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={handleAddSnippet}
            >
              Save Snippet
            </button>
            <button
              className="px-5 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition"
              onClick={() => setShowForm(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {snippets.length === 0 ? (
        <div className="text-center text-gray-600">No snippets yet.</div>
      ) : (
        <div className="space-y-6">
          {snippets.map((snip) => (
            <div key={snip.id} className="rounded-xl border border-gray-100 shadow p-5 bg-gray-50">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="text-blue-400" size={20} />
                <span className="font-semibold text-lg">{snip.title}</span>
              </div>
              {snip.description && (
                <div className="mb-2 text-sm text-gray-500">{snip.description}</div>
              )}
              <pre className="bg-black text-white rounded-lg p-4 overflow-x-auto text-sm">
                <code>{snip.code}</code>
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

