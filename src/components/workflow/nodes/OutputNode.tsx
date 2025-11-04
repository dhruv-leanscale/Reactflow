import { Handle, Position, type NodeProps } from '@xyflow/react'
import { NodeCard } from '../ui'
import { useNodeEditor } from '../context'
import type { OutputNodeData } from '../types'

export default function OutputNode({ id, data, selected }: NodeProps) {
	const { selectNode } = useNodeEditor()
	const nodeData = data as OutputNodeData
	const nodeId = id as string
	const isSelected = (selected as unknown as boolean) ?? false

	return (
		<div className="relative">
			<Handle type="target" position={Position.Left} className="h-3 w-3 border-0 bg-slate-500" />
				<NodeCard label={nodeData.label} status={nodeData.status} selected={isSelected} onSelect={() => selectNode(nodeId)}>
					{nodeData.result ? (
					<pre className="whitespace-pre-wrap break-words rounded-md border border-slate-800/70 bg-slate-950/60 p-2 text-[11px] leading-snug text-slate-200">
							{nodeData.result}
					</pre>
				) : (
					<p className="text-[11px] text-slate-400">Run the flow to capture the final response.</p>
				)}
			</NodeCard>
		</div>
	)
}


