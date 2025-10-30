"use client"

import { useState } from 'react'
import { Plus, CheckCircle, ListChecks } from 'lucide-react'

type Task = {
  id: number
  title: string
  description: string
  done: boolean
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Set up project repository',
    description: 'Initialize git and create the base folder structure.',
    done: true,
  },
  {
    id: 2,
    title: 'Design Task Model',
    description: 'Define the Task type and create mock data.',
    done: false,
  },
  {
    id: 3,
    title: 'Implement Tasks UI',
    description: 'Build the basic UI for task display and adding new tasks.',
    done: false,
  },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAddTask = () => {
    if (!form.title.trim()) return
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: form.title.trim(),
        description: form.description.trim(),
        done: false,
      },
    ])
    setForm({ title: '', description: '' })
    setShowForm(false)
  }

  const toggleDone = (id: number) => {
    setTasks(tasks =>
      tasks.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-900">
          <ListChecks className="text-blue-500" size={28} />
          Task List
        </h1>
        <button
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          onClick={() => setShowForm(v => !v)}
        >
          <Plus size={18} /> New Task
        </button>
      </div>
      {showForm && (
        <div className="mb-8 border p-6 rounded-xl bg-blue-50 border-blue-100">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-blue-700 mb-1">
              Title
            </label>
            <input
              name="title"
              className="w-full px-3 py-2 rounded-lg border border-blue-200"
              value={form.title}
              onChange={handleChange}
              placeholder="Task title"
              maxLength={40}
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-blue-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              className="w-full px-3 py-2 rounded-lg border border-blue-200"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description"
              rows={3}
              maxLength={120}
            />
          </div>
          <div className="flex gap-3">
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={handleAddTask}
            >
              Save Task
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
      {tasks.length === 0 ? (
        <div className="text-center text-gray-600">No tasks yet.</div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`rounded-xl border p-5 flex items-start gap-4 transition bg-gray-50 ${task.done ? "border-green-200 opacity-60" : "border-gray-100"}`}
            >
              <button onClick={() => toggleDone(task.id)} className="mt-1" aria-label={task.done ? "Mark incomplete" : "Mark complete"}>
                <CheckCircle
                  size={28}
                  className={task.done ? "text-green-500" : "text-gray-300"}
                  strokeWidth={2.2}
                  fill={task.done ? "#22c55e" : "none"}
                />
              </button>
              <div>
                <div className={`font-semibold text-lg ${task.done ? "line-through text-gray-400" : "text-blue-900"}`}>{task.title}</div>
                {task.description && (
                  <div className={`mt-1 text-sm ${task.done ? "text-gray-400" : "text-gray-600"}`}>{task.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
