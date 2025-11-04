import { createContext, useContext } from 'react'
import type { WorkflowNodeData } from './types'

export type NodeEditorContextValue = {
	updateNode: (id: string, data: Partial<WorkflowNodeData>) => void
	selectNode: (id: string | null) => void
}

export const NodeEditorContext = createContext<NodeEditorContextValue | null>(
	null,
)

export function useNodeEditor() {
	const ctx = useContext(NodeEditorContext)
	if (!ctx) {
		throw new Error('useNodeEditor must be used within the WorkflowBuilder context')
	}
	return ctx
}


