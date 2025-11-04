import { type Edge, type Node, type NodeTypes, Position } from '@xyflow/react'

export type NodeStatus = 'idle' | 'running' | 'success' | 'error'

export type InputNodeData = {
	label: string
	value: string
	placeholder?: string
	status?: NodeStatus
}

export type LlmNodeData = {
	label: string
	prompt: string
	model: string
	temperature: number
	response?: string
	status?: NodeStatus
	lastPrompt?: string
	mocked?: boolean
	error?: string
}

export type ToolNodeData = {
	label: string
	script: string
	/** When true, this node will call the LLM to summarize the upstream text. */
	summarize?: boolean
	/** Optional system prompt used when summarize is enabled. */
	systemPrompt?: string
	status?: NodeStatus
	lastResult?: string
}

export type OutputNodeData = {
	label: string
	result?: string
	status?: NodeStatus
}

export type WorkflowNodeType = 'inputNode' | 'llmNode' | 'toolNode' | 'outputNode'

export type WorkflowNodeDataMap = {
	inputNode: InputNodeData
	llmNode: LlmNodeData
	toolNode: ToolNodeData
	outputNode: OutputNodeData
}

export type WorkflowNodeData = WorkflowNodeDataMap[WorkflowNodeType]
export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>
export type WorkflowEdge = Edge

export type PaletteItem = {
	type: WorkflowNodeType
	title: string
	description: string
}

export const nodeDefaults = {
	sourcePosition: Position.Right,
	targetPosition: Position.Left,
}

export const defaultEdgeOptions = {
	type: 'smoothstep' as const,
}

export type NodeTypesMap = NodeTypes


