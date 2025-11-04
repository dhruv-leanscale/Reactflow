import type { DragEvent } from 'react'
import type { PaletteItem, WorkflowNodeType } from './types'

const palette: PaletteItem[] = [
	{ type: 'inputNode', title: 'Input', description: 'Start with user text' },
	{ type: 'llmNode', title: 'Groq LLM', description: 'Call Groq with context' },
	{ type: 'toolNode', title: 'Transform', description: 'Run JavaScript' },
	{ type: 'outputNode', title: 'Output', description: 'Collect result' },
]

export default function NodePalette({
	onDragStart,
}: {
	onDragStart: (event: DragEvent<HTMLDivElement>, type: WorkflowNodeType) => void
}) {
	return (
		<aside className="w-72 border-r border-slate-900/70 bg-slate-950/90 p-5 text-slate-200 flex flex-col">
			<div className="flex items-center gap-2">
				<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
					Nodes
				</h2>
				<span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
					Drag onto canvas
				</span>
			</div>
			<div className="mt-4">
				<input
					placeholder="Search nodes…"
					className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500"
				/>
			</div>
			<div className="mt-4 grid grid-cols-1 gap-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 140px)' }}>
				{palette.map((item) => (
					<div
						key={item.type}
						draggable
						onDragStart={(event) => onDragStart(event, item.type)}
						className="group cursor-grab rounded-lg border border-slate-800/70 bg-slate-900/80 p-4 shadow transition hover:border-sky-400/70 hover:bg-slate-900 active:cursor-grabbing"
					>
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold text-white">{item.title}</p>
							<span className="text-[10px] text-slate-400 uppercase tracking-wider">
								{item.type}
							</span>
						</div>
						<p className="mt-1 text-xs leading-snug text-slate-400">{item.description}</p>
					</div>
				))}
			</div>
		</aside>
	)
}


