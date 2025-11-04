import type {
	InputNodeData,
	LlmNodeData,
	OutputNodeData,
	ToolNodeData,
	WorkflowNode,
	WorkflowNodeData,
} from './types'
import { LabeledField } from './ui'

export default function NodeInspector({
	node,
	onUpdate,
}: {
	node: WorkflowNode | null
	onUpdate: (id: string, data: Partial<WorkflowNodeData>) => void
}) {
	if (!node) {
		return (
			<aside className="w-72 border-l border-slate-900/70 bg-slate-950/80 p-6 text-slate-300">
				<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
					Inspector
				</h2>
				<p className="mt-4 text-sm leading-relaxed">
					Select a node to configure prompts, models, and transforms.
				</p>
			</aside>
		)
	}

	const renderBody = () => {
		if (node.type === 'inputNode') {
			const data = node.data as InputNodeData
			return (
				<div className="space-y-4">
					<LabeledField label="Display name">
						<input
							className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
							value={data.label}
							onChange={(event) => onUpdate(node.id, { label: event.target.value })}
						/>
					</LabeledField>
					<LabeledField label="Initial value">
						<textarea
							className="h-28 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
							value={data.value}
							onChange={(event) => onUpdate(node.id, { value: event.target.value })}
							placeholder={data.placeholder}
						/>
					</LabeledField>
				</div>
			)
		}

		if (node.type === 'llmNode') {
			const data = node.data as LlmNodeData
			return (
				<div className="space-y-4">
					<LabeledField label="Display name">
						<input
							className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
							value={data.label}
							onChange={(event) => onUpdate(node.id, { label: event.target.value })}
						/>
					</LabeledField>
					<LabeledField label="Prompt template">
						<textarea
							className="h-36 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
							value={data.prompt}
							onChange={(event) => onUpdate(node.id, { prompt: event.target.value })}
							placeholder="Use {{input}} to reference the upstream text"
						/>
					</LabeledField>
					<div className="grid grid-cols-2 gap-3">
						<LabeledField label="Model">
							<input
								className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
								value={data.model}
								onChange={(event) => onUpdate(node.id, { model: event.target.value })}
							/>
						</LabeledField>
						<LabeledField label="Temperature">
							<input
								type="range"
								min={0}
								max={1}
								step={0.05}
								value={data.temperature}
								onChange={(event) =>
									onUpdate(node.id, { temperature: Number(event.target.value) })
								}
							/>
							<p className="text-right text-xs text-slate-400">{(data.temperature ?? 0).toFixed(2)}</p>
						</LabeledField>
					</div>
					{data.response ? (
						<LabeledField label="Last response">
							<pre className="max-h-48 whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-200">
								{data.response}
							</pre>
							{data.mocked ? (
								<p className="mt-1 text-[11px] text-amber-300">Mocked response – set GROQ_API_KEY to call the real API.</p>
							) : null}
						</LabeledField>
					) : null}
					{data.error ? (
						<div className="rounded-md border border-rose-400/40 bg-rose-950/70 px-3 py-2 text-xs text-rose-200">{data.error}</div>
					) : null}
				</div>
			)
		}

		if (node.type === 'toolNode') {
			const data = node.data as ToolNodeData
			return (
				<div className="space-y-4">
					<LabeledField label="Display name">
						<input
							className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
							value={data.label}
							onChange={(event) => onUpdate(node.id, { label: event.target.value })}
						/>
					</LabeledField>
					<LabeledField label="JavaScript snippet">
						<textarea
							className="h-40 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
							value={data.script}
							onChange={(event) => onUpdate(node.id, { script: event.target.value })}
							placeholder="return input.toUpperCase();"
						/>
					</LabeledField>
					{data.lastResult ? (
						<LabeledField label="Last result">
							<pre className="max-h-40 whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-200">
								{data.lastResult}
							</pre>
						</LabeledField>
					) : null}
				</div>
			)
		}

		if (node.type === 'outputNode') {
			const data = node.data as OutputNodeData
			return (
				<div className="space-y-4">
					<LabeledField label="Display name">
						<input
							className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
							value={data.label}
							onChange={(event) => onUpdate(node.id, { label: event.target.value })}
						/>
					</LabeledField>
					{data.result ? (
						<LabeledField label="Output">
							<pre className="max-h-52 whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-200">
								{data.result}
							</pre>
						</LabeledField>
					) : (
						<p className="text-xs text-slate-500">Run the flow to populate the output node.</p>
					)}
				</div>
			)
		}

		return null
	}

	return (
		<aside className="w-72 border-l border-slate-900/70 bg-slate-950/80 p-6 text-slate-200 flex flex-col">
			<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Inspector</h2>
			<p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">{node.type}</p>
			<div className="mt-4 max-h-[calc(100vh-150px)] space-y-5 overflow-y-auto pr-1">{renderBody()}</div>
		</aside>
	)
}


