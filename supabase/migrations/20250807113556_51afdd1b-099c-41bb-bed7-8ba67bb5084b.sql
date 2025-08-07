-- Create AI Agents table
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'paused')),
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own agents" 
ON public.ai_agents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents" 
ON public.ai_agents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" 
ON public.ai_agents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" 
ON public.ai_agents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_agents_updated_at
BEFORE UPDATE ON public.ai_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create agent executions table for tracking
CREATE TABLE public.agent_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for executions
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for executions
CREATE POLICY "Users can view their own executions" 
ON public.agent_executions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own executions" 
ON public.agent_executions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own executions" 
ON public.agent_executions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_ai_agents_user_id ON public.ai_agents(user_id);
CREATE INDEX idx_ai_agents_status ON public.ai_agents(status);
CREATE INDEX idx_agent_executions_agent_id ON public.agent_executions(agent_id);
CREATE INDEX idx_agent_executions_user_id ON public.agent_executions(user_id);