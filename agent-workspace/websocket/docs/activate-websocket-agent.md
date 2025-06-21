# WebSocket Agent Activation Prompt

**Purpose**: Activate the specialized WebSocket development agent with full authority and Gemini integration

## 🤖 Agent Activation Command

To activate the WebSocket development agent, use this exact prompt:

```markdown
You are now the WebSocket Deployment Agent for the homelab-gitops-auditor project.

Your primary directive is to develop and deploy the WebSocket real-time dashboard feature according to the approved deployment plan.

**CRITICAL REQUIREMENTS:**
1. **Mandatory Gemini Code Review**: ALL code changes MUST be reviewed using:
   mcp__gemini-collab__gemini_code_review
   code: "[YOUR CODE]"
   focus: "WebSocket implementation stability, performance, and security"

2. **Agent Authority**: You have full development and deployment autonomy within the approved plan constraints

3. **Success Criteria**: Meet all technical requirements specified in the deployment plan

4. **Timeline**: 3-week implementation timeline with specific phase milestones

**Reference Documents:**
- WebSocket Deployment Plan: /docs/WEBSOCKET-DEPLOYMENT-PLAN.md
- Agent Instructions: /.prompts/agents/websocket-deployment-agent.md

Begin by reviewing the current project structure and confirming your understanding of the WebSocket implementation requirements.

IMPORTANT: Before writing any code, use Gemini to review your implementation approach.
```

## 🎯 Agent Initialization Checklist

When activating the agent, ensure:

### ✅ Pre-Activation Verification
- [ ] Gemini MCP server is configured and functional
- [ ] homelab-gitops-auditor project is active in Serena
- [ ] WebSocket deployment plan has been reviewed and approved
- [ ] Development environment is set up with required dependencies

### ✅ Agent Authority Confirmation
- [ ] Agent understands full development autonomy within constraints
- [ ] Mandatory Gemini review process is acknowledged
- [ ] Success criteria and KPIs are understood
- [ ] Rollback procedures are confirmed

### ✅ Technical Environment Setup
- [ ] Access to project codebase (/mnt/c/GIT/homelab-gitops-auditor)
- [ ] Backend development environment (Node.js, npm)
- [ ] Frontend development environment (React, Vite)
- [ ] Testing frameworks and tools available

## 🔧 Agent Capabilities Verification

### Development Capabilities
```bash
# Verify agent can perform these actions:
# - Read and modify project files
# - Install and manage dependencies
# - Run tests and build processes
# - Execute deployment scripts
# - Monitor system performance
```

### Gemini Integration Test
```bash
# Test Gemini code review capability:
mcp__gemini-collab__gemini_code_review
  code: "console.log('Agent activation test');"
  focus: "Simple code review test for agent activation"
```

### Project Access Verification
```bash
# Confirm agent can access project structure:
# - /api/ (backend development)
# - /dashboard/ (frontend development)
# - /scripts/ (deployment scripts)
# - /docs/ (documentation)
```

## 📋 Initial Agent Tasks

### Phase 0: Agent Initialization (Day 1)
1. **Project Structure Analysis**
   - Review current codebase architecture
   - Identify integration points for WebSocket implementation
   - Confirm existing dependencies and infrastructure

2. **Development Environment Setup**
   - Install required WebSocket dependencies
   - Set up testing framework for WebSocket functionality
   - Configure development tools and utilities

3. **Gemini Integration Testing**
   - Test Gemini code review workflow
   - Validate review criteria and feedback mechanisms
   - Establish review checkpoints for implementation phases

### Phase 1 Preparation: Backend Planning
1. **Architecture Review with Gemini**
   - Submit WebSocket server architecture for review
   - Validate file watcher implementation approach
   - Confirm error handling and security strategies

2. **Development Plan Validation**
   - Review implementation timeline with Gemini
   - Validate technical approach and dependencies
   - Confirm testing and deployment strategies

## 🚨 Agent Escalation Procedures

### When to Escalate
**Immediate Escalation Required:**
- Gemini review identifies critical security vulnerabilities
- Implementation approach conflicts with approved plan
- Technical blockers prevent progress for >4 hours
- Performance requirements cannot be met with current approach

### Escalation Process
1. **Document Issue**: Clear description of problem and attempted solutions
2. **Gemini Consultation**: Get Gemini's assessment of the issue
3. **Impact Assessment**: Evaluate effect on timeline and deliverables
4. **Stakeholder Notification**: Report to project maintainers
5. **Resolution Planning**: Develop alternative approaches with Gemini

## 🔄 Continuous Monitoring

### Daily Status Checks
- [ ] Development progress against Phase 1 timeline
- [ ] Gemini review status and outstanding approvals
- [ ] Testing results and quality metrics
- [ ] Risk identification and mitigation actions

### Weekly Milestone Reviews
- [ ] Phase completion status
- [ ] Performance metrics and targets
- [ ] Security review outcomes
- [ ] Deployment readiness assessment

## 📊 Success Validation

### Agent Performance Metrics
- **Code Quality**: 100% Gemini review approval rate
- **Timeline Adherence**: On-track for 3-week delivery
- **Testing Coverage**: 95%+ test coverage achieved
- **Performance Targets**: All KPIs met or exceeded

### Completion Criteria
- ✅ WebSocket real-time functionality fully implemented
- ✅ All Gemini code reviews passed
- ✅ Comprehensive testing completed
- ✅ Production deployment successful
- ✅ Performance monitoring active
- ✅ Documentation complete

---

**Agent Status**: 🟢 **Ready for Activation**
**Next Action**: Use activation command to begin WebSocket development
**Support**: Gemini MCP integration confirmed and ready
