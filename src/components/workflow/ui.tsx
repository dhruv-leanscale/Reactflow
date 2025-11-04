import { cn } from '@/lib/utils'
import type { NodeStatus } from './types'
import type { ReactNode } from 'react'

export function NodeCard({
	label,
	status,
	selected,
	onSelect,
	children,
}: {
	label: string
	status?: NodeStatus
	selected: boolean
	onSelect?: () => void
	children: ReactNode
}) {
	return (
		<div
			onMouseDown={(event) => {
				event.stopPropagation()
				onSelect?.()
			}}
			className={cn(
				'rounded-lg border border-slate-800/70 bg-slate-900/85 p-4 shadow transition',
				selected ? 'border-sky-400 shadow-sky-500/30' : 'hover:border-slate-600/80',
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<span className="text-sm font-semibold text-white">{label}</span>
				<StatusBadge status={status} />
			</div>
			<div className="mt-3 space-y-3 text-xs text-slate-200">{children}</div>
		</div>
	)
}

export function StatusBadge({ status }: { status?: NodeStatus }) {
	if (!status) return null

	const styles: Record<NodeStatus, string> = {
		idle: 'bg-slate-700/80 text-slate-200',
		running:
			'bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse',
		success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40',
		error: 'bg-rose-500/20 text-rose-300 border border-rose-400/40',
	}

	return (
		<span
			className={cn(
				'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
				styles[status],
			)}
		>
			{status}
		</span>
	)
}

export function LabeledField({
	label,
	children,
}: {
	label: string
	children: ReactNode
}) {
	return (
		<label className="block space-y-2 text-xs">
			<span className="font-semibold uppercase tracking-widest text-slate-400">
				{label}
			</span>
			{children}
		</label>
	)
}


