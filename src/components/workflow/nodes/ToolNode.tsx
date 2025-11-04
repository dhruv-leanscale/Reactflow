import { Handle, Position, type NodeProps } from '@xyflow/react'
import { NodeCard } from '../ui'
import { useNodeEditor } from '../context'
import type { ToolNodeData } from '../types'

export default function ToolNode({ id, data, selected }: NodeProps) {
	const { updateNode, selectNode } = useNodeEditor()
	const toolData = data as ToolNodeData

	return (
		<div className="relative">
			<Handle type="target" position={Position.Left} className="h-3 w-3 border-0 bg-slate-500" />
			<NodeCard label={toolData.label} status={toolData.status} selected={selected} onSelect={() => selectNode(id)}>
				<div className="mb-2 flex items-center gap-2">
					<input
						id={`${id}-summarize`}
						type="checkbox"
						className="h-3 w-3 accent-sky-500"
						checked={!!toolData.summarize}
						onChange={(e) => updateNode(id, { summarize: e.target.checked })}
					/>
					<label htmlFor={`${id}-summarize`} className="select-none text-[11px] uppercase tracking-wider text-slate-300">
						Summarize via LLM
					</label>
				</div>

				{toolData.summarize ? (
					<div>
						<p className="text-[11px] uppercase tracking-wider text-slate-400">System prompt</p>
						<textarea
							className="mt-1 h-24 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
							value={toolData.systemPrompt ?? ''}
							onChange={(event) => updateNode(id, { systemPrompt: event.target.value })}
							placeholder="You are a helpful assistant that writes a concise, clear summary..."
						/>
					</div>
				) : (
					<textarea
						className="h-28 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
						value={toolData.script}
						onChange={(event) => updateNode(id, { script: event.target.value })}
						placeholder="return input.toUpperCase();"
					/>
				)}
				{toolData.lastResult ? (
					<div>
						<p className="text-[11px] uppercase tracking-wider text-slate-400">Last result</p>
						<pre className="mt-1 max-h-24 whitespace-pre-wrap rounded-md border border-slate-800/70 bg-slate-950/60 p-2 text-[11px] text-slate-200">
							{toolData.lastResult}
						</pre>
					</div>
				) : null}
			</NodeCard>
			<Handle type="source" position={Position.Right} className="h-3 w-3 border-0 bg-sky-400" />
		</div>
	)
}


