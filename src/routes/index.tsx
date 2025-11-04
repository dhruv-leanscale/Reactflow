import { createFileRoute } from '@tanstack/react-router'
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder'

export const Route = createFileRoute('/')({
	component: WorkflowBuilder,
})
