import { ReactFlowProvider } from '@xyflow/react'
import WorkflowCanvas from './Canvas'

export default function WorkflowBuilder() {
	return (
		<ReactFlowProvider>
			<WorkflowCanvas />
		</ReactFlowProvider>
	)
}