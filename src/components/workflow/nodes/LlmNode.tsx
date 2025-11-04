import { Handle, Position, type NodeProps } from '@xyflow/react'
import { NodeCard } from '../ui'
import { useNodeEditor } from '../context'
import type { LlmNodeData } from '../types'

export default function LlmNode({ id, data, selected }: NodeProps<LlmNodeData>) {
	const { selectNode } = useNodeEditor()

	return (
		<div className="relative">
			<Handle type="target" position={Position.Left} className="h-3 w-3 border-0 bg-slate-500" />
			<NodeCard label={data.label} status={data.status} selected={selected} onSelect={() => selectNode(id)}>
				<div>
					<p className="text-[11px] uppercase tracking-wider text-slate-400">Prompt</p>
					<pre className="mt-1 max-h-28 whitespace-pre-wrap rounded-md border border-slate-800/70 bg-slate-950/60 p-2 text-[11px] leading-snug text-slate-200">
						{data.prompt}
					</pre>
				</div>
				<p className="text-[11px] text-slate-400">Connect this node and run the flow to see output in the Output node.</p>
				{data.error ? (
					<div className="rounded-md border border-rose-400/40 bg-rose-950/70 px-2 py-1 text-[11px] text-rose-200">{data.error}</div>
				) : null}
			</NodeCard>
			<Handle type="source" position={Position.Right} className="h-3 w-3 border-0 bg-sky-400" />
		</div>
	)
}


