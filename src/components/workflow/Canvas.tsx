import { Background, Controls, MarkerType, MiniMap, Panel, ReactFlow, addEdge, useEdgesState, useNodesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { invokeGroq, type GroqInvocationResult } from '@/lib/server/groq'
import { cn } from '@/lib/utils'

import NodePalette from './Palette'
import NodeInspector from './Inspector'
import { NodeEditorContext } from './context'
import type {
	InputNodeData,
	LlmNodeData,
	ToolNodeData,
	WorkflowEdge,
	WorkflowNode,
	WorkflowNodeData,
	WorkflowNodeType,
} from './types'
import { defaultEdgeOptions, nodeDefaults } from './types'
import InputNode from './nodes/InputNode'
import LlmNode from './nodes/LlmNode'
import ToolNode from './nodes/ToolNode'
import OutputNode from './nodes/OutputNode'

const nodeTypes: any = {
	inputNode: InputNode,
	llmNode: LlmNode,
	toolNode: ToolNode,
	outputNode: OutputNode,
}

const initialNodes: WorkflowNode[] = [
	{
		id: 'input-1',
		type: 'inputNode',
		position: { x: 80, y: 200 },
		data: {
			label: 'Flow Input',
			value: 'Help me design a friendly welcome message.',
			placeholder: 'Describe what the flow should generate...',
			status: 'idle',
		},
		...nodeDefaults,
	},
	{
		id: 'llm-1',
		type: 'llmNode',
		position: { x: 380, y: 180 },
		data: {
			label: 'Groq LLM',
			prompt: 'Generate a helpful answer using this request:\n\n{{input}}',
			model: 'llama-3.1-8b-instant',
			temperature: 0.4,
			status: 'idle',
		},
		...nodeDefaults,
	},
	{
		id: 'output-1',
		type: 'outputNode',
		position: { x: 900, y: 200 },
		data: {
			label: 'Flow Output',
			result: '',
			status: 'idle',
		},
		...nodeDefaults,
	},
]

const initialEdges: WorkflowEdge[] = [
	{ id: 'edge-input-llm', source: 'input-1', target: 'llm-1', type: 'smoothstep' },
	{ id: 'edge-llm-output', source: 'llm-1', target: 'output-1', type: 'smoothstep' },
]

export default function WorkflowCanvas() {
	const [nodes, setNodes, internalOnNodesChange] = useNodesState<any>(initialNodes as any)
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
	const [isRunning, setIsRunning] = useState(false)
	const [runError, setRunError] = useState<string | null>(null)
	const reactFlowWrapper = useRef<HTMLDivElement | null>(null)
	const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
	const [showPalette, setShowPalette] = useState(true)
	const [showInspector, setShowInspector] = useState(true)
	const [isDark, setIsDark] = useState(true)

	const updateNodeData = useCallback(
		(id: string, data: Partial<WorkflowNodeData>) => {
			setNodes((existing) =>
				existing.map((node) =>
					node.id === id
						? ({
								...node,
								data: {
									...node.data,
									...(data as WorkflowNodeData),
								},
							} as any)
						: node,
					),
			)
		},
		[setNodes],
	)

	const contextValue = useMemo(
		() => ({ updateNode: updateNodeData, selectNode: setSelectedNodeId }),
		[updateNodeData],
	)

	const selectedNode = useMemo(
		() => nodes.find((node) => node.id === selectedNodeId) ?? null,
		[nodes, selectedNodeId],
	)

	const onConnect = useCallback(
		(params: any) =>
			setEdges((current) =>
				addEdge(
					{
						...params,
						type: 'smoothstep',
						markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
					},
					current,
				),
			),
		[setEdges],
	)

	const handleNodesChange = useCallback(
		(changes: any[]) => {
			internalOnNodesChange(changes)

			if (
				selectedNodeId &&
				changes.some((change) => change.type === 'remove' && change.id === selectedNodeId)
			) {
				setSelectedNodeId(null)
			}
		},
		[internalOnNodesChange, selectedNodeId],
	)

	const handleSelectionChange = useCallback(({ nodes: nextNodes }: any) => {
		setSelectedNodeId(nextNodes[0]?.id ?? null)
	}, [])

	const handleDragOver = useCallback((event: DragEvent) => {
		event.preventDefault()
		event.dataTransfer.dropEffect = 'move'
	}, [])

	const handleDragStart = useCallback((event: DragEvent<HTMLDivElement>, type: any) => {
		event.dataTransfer.setData('application/reactflow', type)
		event.dataTransfer.effectAllowed = 'move'
	}, [])

	const handleDrop = useCallback(
		(event: DragEvent) => {
			event.preventDefault()
			if (!reactFlowWrapper.current || !reactFlowInstance) return

			const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType
			if (!type) return

			const bounds = reactFlowWrapper.current.getBoundingClientRect()
			const client = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
			const position = reactFlowInstance.screenToFlowPosition
				? reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
				: reactFlowInstance.project(client)

			const newNode: WorkflowNode = {
				id: createNodeId(type),
				type,
				position,
				data: createNodeData(type),
				...nodeDefaults,
			}

			setNodes((current) => current.concat(newNode))
			setSelectedNodeId(newNode.id)
		},
		[reactFlowInstance, setNodes],
	)

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			// Ignore delete/backspace when typing in inputs/textareas/contenteditable
			const activeElement = (document.activeElement as HTMLElement | null)
			const isTypingContext = !!activeElement && (
				activeElement.tagName === 'INPUT' ||
				activeElement.tagName === 'TEXTAREA' ||
				activeElement.isContentEditable ||
				!!activeElement.closest('[contenteditable="true"]')
			)

			if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId && !isTypingContext) {
				event.preventDefault()
				setNodes((current) => current.filter((n) => n.id !== selectedNodeId))
				setEdges((current) => current.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId))
				setSelectedNodeId(null)
			}
		}
		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [selectedNodeId, setNodes, setEdges])

	const handleRunFlow = useCallback(async () => {
		if (isRunning) return
		setRunError(null)
		setIsRunning(true)

		let inputNode: WorkflowNode | undefined
		let outputNode: WorkflowNode | undefined

		try {
			inputNode = nodes.find((node) => node.type === 'inputNode') as WorkflowNode | undefined
			outputNode = nodes.find((node) => node.type === 'outputNode') as WorkflowNode | undefined

			if (!inputNode || !outputNode) throw new Error('Add both input and output nodes to run the flow.')

			const inputValue = (inputNode.data as InputNodeData).value?.trim() ?? ''
			if (!inputValue) throw new Error('Provide some text inside the input node to get started.')

			updateNodeData(inputNode.id, { status: 'running' })
			updateNodeData(outputNode.id, { status: 'idle', result: '' })

			const adjacency = new Map<string, string[]>()
			edges.forEach((edge) => {
				adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target])
			})

			const path: WorkflowNode[] = []
			const visited = new Set<string>()
			let cursor: WorkflowNode | undefined = inputNode
			while (cursor && !visited.has(cursor.id)) {
				path.push(cursor)
				if (cursor.id === outputNode.id) break
				visited.add(cursor.id)
				const nextTargets: any[] = adjacency.get(cursor.id) ?? []
				const nextId: any = nextTargets[0]
				cursor = nextId ? (nodes.find((n) => n.id === nextId) as WorkflowNode | undefined) : undefined
				if (!cursor) break
			}

			if (path[path.length - 1]?.id !== outputNode.id) {
				throw new Error('Connect the nodes so the flow reaches the output node.')
			}

			let workingOutput = inputValue
			for (const node of path.slice(1)) {
				if (node.type === 'llmNode') {
					const llmData = node.data as LlmNodeData
					const promptTemplate = llmData.prompt ?? ''
					const prompt = promptTemplate.replace(/\{\{\s*input\s*\}\}/gi, workingOutput)
					updateNodeData(node.id, { status: 'running', error: undefined, lastPrompt: prompt })
					try {
						const llmResult = (await invokeGroq({ data: { prompt, model: llmData.model, temperature: llmData.temperature } } as any)) as GroqInvocationResult
						const output = llmResult.output?.trim() ?? ''
						workingOutput = output
						updateNodeData(node.id, { status: 'success', response: output, mocked: llmResult.mocked })
					} catch (error) {
						const message = error instanceof Error ? error.message : 'LLM node failed.'
						updateNodeData(node.id, { status: 'error', error: message })
						throw new Error(message)
					}
				} else if (node.type === 'toolNode') {
					const toolData = node.data as ToolNodeData
					updateNodeData(node.id, { status: 'running' })
					try {
						if (toolData.summarize) {
							const systemPrompt =
								toolData.systemPrompt?.trim() ||
								'You are a helpful assistant that writes a concise, clear summary of the given text. Keep it brief and capture only the key points.'
							const llmResult = (await invokeGroq({ data: { prompt: workingOutput, systemPrompt } } as any)) as GroqInvocationResult
							const output = llmResult.output?.trim() ?? ''
							workingOutput = output
							updateNodeData(node.id, { status: 'success', lastResult: output })
						} else {
							const fn = new Function('input', toolData.script ?? 'return input;')
							const result = fn(workingOutput)
							const normalized = typeof result === 'string' ? result : result == null ? '' : JSON.stringify(result)
							workingOutput = normalized
							updateNodeData(node.id, { status: 'success', lastResult: normalized })
						}
					} catch (error) {
						const message = error instanceof Error ? error.message : 'Transform node failed.'
						updateNodeData(node.id, { status: 'error', lastResult: undefined })
						throw new Error(`Tool node error: ${message}`)
					}
				} else if (node.type === 'outputNode') {
					updateNodeData(node.id, { status: 'running' })
				}
			}

			updateNodeData(outputNode.id, { status: 'success', result: workingOutput })
			updateNodeData(inputNode.id, { status: 'success' })
			setSelectedNodeId(outputNode.id)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'The workflow run failed unexpectedly.'
			setRunError(message)
			if (inputNode) updateNodeData(inputNode.id, { status: 'error' })
			if (outputNode) updateNodeData(outputNode.id, { status: 'error' })
		} finally {
			setIsRunning(false)
		}
	}, [edges, isRunning, nodes, updateNodeData])

	return (
		<NodeEditorContext.Provider value={contextValue}>
			<div className={isDark ? 'flex h-screen overflow-hidden bg-slate-950' : 'flex h-screen overflow-hidden bg-zinc-50'}>
				{showPalette ? <NodePalette onDragStart={handleDragStart} /> : null}
				<div className="relative flex-1" ref={reactFlowWrapper}>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						nodeTypes={nodeTypes}
						onNodesChange={handleNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onInit={setReactFlowInstance}
						onSelectionChange={handleSelectionChange}
						onPaneClick={() => setSelectedNodeId(null)}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						defaultEdgeOptions={{ ...defaultEdgeOptions, markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 } as any }}
						fitView
						minZoom={0.2}
						maxZoom={1.8}
						colorMode={isDark ? 'dark' : 'light'}
						snapToGrid
						snapGrid={[16, 16]}
					>
						<MiniMap pannable zoomable />
						<Background variant={'dots' as any} gap={16} size={1} color={isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(30, 41, 59, 0.25)'} />
						<Controls position="bottom-right" />
						<Panel position="top-center">
							<div className="flex items-center gap-3 rounded-full bg-slate-900/85 px-4 py-2 shadow-lg shadow-slate-950/40 backdrop-blur">
								<button
									className={cn(
										'rounded-full px-4 py-1 text-sm font-semibold text-white transition',
										isRunning ? 'bg-sky-500/40 text-sky-200' : 'bg-sky-500 hover:bg-sky-400',
									)}
									onClick={handleRunFlow}
									disabled={isRunning}
								>
									{isRunning ? 'Running…' : 'Run Flow'}
								</button>
								<span className="text-xs text-slate-300">
									{isRunning ? 'Executing nodes in order' : 'Drag nodes in from the left panel'}
								</span>
							</div>
						</Panel>
						<Panel position="top-left">
							<div className="flex items-center gap-2 rounded-md bg-slate-900/80 px-2 py-2 shadow">
								<button
									className="rounded bg-sky-600/80 px-2 py-1 text-xs text-white hover:bg-sky-500"
									onClick={() => setShowPalette((v) => !v)}
								>
									{showPalette ? 'Hide Palette' : 'Show Palette'}
								</button>
								<button
									className="rounded bg-fuchsia-600/80 px-2 py-1 text-xs text-white hover:bg-fuchsia-500"
									onClick={() => setShowInspector((v) => !v)}
								>
									{showInspector ? 'Hide Inspector' : 'Show Inspector'}
								</button>
							</div>
						</Panel>
						<Panel position="top-right">
							<button
								className={cn(
									'rounded-full px-3 py-1 text-xs font-semibold',
									isDark ? 'bg-emerald-600/80 text-white hover:bg-emerald-500' : 'bg-slate-200 text-slate-800 hover:bg-slate-300',
								)}
								onClick={() => setIsDark((v) => !v)}
							>
								{isDark ? 'Dark' : 'Light'}
							</button>
						</Panel>
						{runError ? (
							<Panel position="bottom-left">
								<div className="max-w-xs rounded-md border border-rose-400/40 bg-rose-950/70 px-3 py-2 text-xs text-rose-100 shadow">
									{runError}
								</div>
							</Panel>
						) : null}
					</ReactFlow>
				</div>
				{showInspector ? <NodeInspector node={selectedNode as any} onUpdate={updateNodeData} /> : null}
			</div>
		</NodeEditorContext.Provider>
	)
}

function createNodeId(type: any) {
	return `${type}-${Math.random().toString(36).slice(2, 8)}`
}

function createNodeData(type: any): WorkflowNodeData {
	switch (type) {
		case 'inputNode':
			return { label: 'Flow Input', value: '', placeholder: 'Enter a starting instruction…', status: 'idle' } as any
		case 'llmNode':
			return {
				label: 'Groq LLM',
				prompt: 'Use the upstream result as context:\n\n{{input}}',
				model: 'llama-3.3-8b-instant',
				temperature: 0.3,
				status: 'idle',
			} as any
		case 'toolNode':
			return {
				label: 'Transform',
				script: 'return input;',
				summarize: false,
				systemPrompt:
					'You are a helpful assistant that writes a concise, clear summary of the given text. Keep it brief and capture only the key points.',
				status: 'idle',
			} as any
		case 'outputNode':
			return { label: 'Flow Output', result: '', status: 'idle' } as any
		default:
			return { label: 'Node', status: 'idle' } as any
	}
}


