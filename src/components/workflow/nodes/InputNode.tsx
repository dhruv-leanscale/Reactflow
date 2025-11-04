import { Handle, Position, type NodeProps } from '@xyflow/react'
import { NodeCard } from '../ui'
import { useNodeEditor } from '../context'
import type { InputNodeData } from '../types'

export default function InputNode({ id, data, selected }: NodeProps<InputNodeData>) {
	const { updateNode, selectNode } = useNodeEditor()

	return (
		<div className="relative">
			<NodeCard label={data.label} status={data.status} selected={selected} onSelect={() => selectNode(id)}>
				<textarea
					className="h-32 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
					value={data.value}
					onChange={(event) => updateNode(id, { value: event.target.value })}
					placeholder={data.placeholder}
				/>
			</NodeCard>
			<Handle type="source" position={Position.Right} className="h-3 w-3 border-0 bg-sky-400" />
		</div>
	)
}


