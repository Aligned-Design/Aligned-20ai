import { RequestHandler } from 'express';
import { WorkflowTemplate, WorkflowInstance, WorkflowAction, WorkflowNotification } from '@shared/workflow';

// Mock workflow templates and instances
const mockTemplates: WorkflowTemplate[] = [
  {
    id: 'template_1',
    name: 'Standard Approval Process',
    description: 'Standard 3-step approval for most content',
    brandId: 'brand_1',
    isDefault: true,
    steps: [
      {
        id: 'step_1',
        stage: 'internal_review',
        name: 'Internal Review',
        description: 'Agency team reviews content',
        requiredRole: 'internal_reviewer',
        isRequired: true,
        allowParallel: false,
        autoAdvance: false,
        order: 1
      },
      {
        id: 'step_2',
        stage: 'client_review',
        name: 'Client Approval',
        description: 'Client reviews and approves content',
        requiredRole: 'client',
        isRequired: true,
        allowParallel: false,
        autoAdvance: false,
        timeoutHours: 48,
        order: 2
      },
      {
        id: 'step_3',
        stage: 'published',
        name: 'Publish',
        description: 'Content is published to platforms',
        requiredRole: 'admin',
        isRequired: true,
        allowParallel: false,
        autoAdvance: true,
        order: 3
      }
    ],
    notifications: {
      emailOnStageChange: true,
      reminderAfterHours: 24
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const getWorkflowTemplates: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.query;
    
    const templates = mockTemplates.filter(t => t.brandId === brandId);
    res.json(templates);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch workflow templates'
    });
  }
};

export const createWorkflowTemplate: RequestHandler = async (req, res) => {
  try {
    const template: WorkflowTemplate = req.body;
    
    // TODO: Save to database
    mockTemplates.push(template);
    
    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create workflow template'
    });
  }
};

export const startWorkflow: RequestHandler = async (req, res) => {
  try {
    const { contentId, templateId, assignedUsers, priority, deadline } = req.body;
    
    const template = mockTemplates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const workflowInstance: WorkflowInstance = {
      id: `workflow_${Date.now()}`,
      contentId,
      templateId,
      currentStage: 'internal_review',
      currentStepId: template.steps[0].id,
      status: 'active',
      steps: template.steps.map(step => ({
        id: `instance_${step.id}_${Date.now()}`,
        stepId: step.id,
        stage: step.stage,
        status: step.order === 1 ? 'in_progress' : 'pending',
        assignedTo: assignedUsers[step.id],
        assignedAt: step.order === 1 ? new Date().toISOString() : undefined,
        startedAt: step.order === 1 ? new Date().toISOString() : undefined,
        comments: [],
        timeoutAt: step.timeoutHours ? 
          new Date(Date.now() + step.timeoutHours * 60 * 60 * 1000).toISOString() : 
          undefined
      })),
      assignedUsers,
      startedAt: new Date().toISOString(),
      metadata: {
        priority: priority || 'medium',
        deadline,
        tags: []
      }
    };
    
    // TODO: Save to database
    // TODO: Send notifications
    
    res.json({ success: true, workflow: workflowInstance });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to start workflow'
    });
  }
};

export const processWorkflowAction: RequestHandler = async (req, res) => {
  try {
    const __action: WorkflowAction = req.body;
    
    // TODO: Validate user permissions
    // TODO: Update workflow instance
    // TODO: Advance to next step if applicable
    // TODO: Send notifications
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process workflow action'
    });
  }
};

export const getWorkflowNotifications: RequestHandler = async (req, res) => {
  try {
    const { __userId } = req.query;
    
    // TODO: Fetch notifications for user
    const notifications: WorkflowNotification[] = [];
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch notifications'
    });
  }
};
