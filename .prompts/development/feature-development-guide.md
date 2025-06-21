# Feature Development Guide

Use this prompt when developing new features for the homelab-gitops-auditor project.

## Feature Development Process

When implementing a new feature, follow this structured approach to ensure quality and consistency.

### 1. Requirements Analysis
Before writing any code, help me understand:

**Functional Requirements**:
- What specific problem does this feature solve?
- Who are the primary users of this feature?
- What are the key use cases and user flows?
- What are the success criteria?

**Technical Requirements**:
- Which components need to be modified (API, dashboard, scripts)?
- Are there any external integrations required?
- What are the performance requirements?
- Are there security considerations?

**Constraints & Dependencies**:
- Are there any existing system limitations?
- Does this depend on other features or external services?
- What is the timeline and complexity estimate?

### 2. Architecture Design
Design the feature with these considerations:

**System Integration**:
- How does this fit into the existing architecture?
- Which MCP servers or APIs need to be involved?
- What data flows are required?
- How will this impact existing functionality?

**Component Breakdown**:
- Backend API changes (if any)
- Frontend UI components (if any)
- Database or file system changes
- Configuration requirements
- Deployment considerations

**Security & Performance**:
- What security measures are needed?
- How will this impact system performance?
- What caching strategies should be employed?
- How will errors be handled?

### 3. Implementation Planning
Create a development plan that includes:

**Development Phases**:
1. Backend implementation (API endpoints, business logic)
2. Frontend implementation (UI components, state management)
3. Integration testing
4. Documentation updates
5. Deployment scripts (if needed)

**Testing Strategy**:
- Unit tests for core business logic
- Integration tests for API endpoints
- Component tests for UI elements
- End-to-end tests for critical user flows

**Documentation Requirements**:
- API documentation updates
- User guide additions
- Developer documentation
- Configuration examples

### 4. Code Implementation Guidelines

**Backend Development** (`/api/`):
- Follow existing service patterns
- Implement proper error handling and logging
- Use appropriate HTTP status codes
- Validate all inputs
- Include appropriate middleware (auth, rate limiting, etc.)

**Frontend Development** (`/dashboard/`):
- Create reusable React components
- Use TypeScript for type safety
- Follow existing styling patterns (Tailwind CSS)
- Implement proper loading and error states
- Ensure responsive design

**Scripts & Automation** (`/scripts/`):
- Write idempotent deployment scripts
- Include proper error handling and rollback procedures
- Add logging and progress indicators
- Test scripts in development environment first

### 5. Quality Assurance Checklist

Before considering the feature complete:

**Functionality**:
- [ ] All requirements are implemented
- [ ] Feature works as specified in all supported browsers
- [ ] Error cases are handled gracefully
- [ ] Performance is acceptable

**Code Quality**:
- [ ] Code follows project conventions
- [ ] Appropriate comments and documentation
- [ ] No security vulnerabilities
- [ ] Proper error handling and logging

**Testing**:
- [ ] Unit tests written and passing
- [ ] Integration tests cover main flows
- [ ] Manual testing completed
- [ ] Edge cases considered and tested

**Documentation**:
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] Developer notes added
- [ ] Configuration documented

### 6. Deployment Considerations

**Pre-deployment**:
- Configuration changes documented
- Database migrations (if any) prepared
- Backup procedures verified
- Rollback plan prepared

**Deployment Process**:
- Follow GitOps principles
- Update version numbers
- Deploy to staging first
- Monitor for issues
- Document deployment steps

**Post-deployment**:
- Verify functionality in production
- Monitor logs for errors
- Check performance metrics
- Update team on deployment status

## Example Feature Implementation

```
Feature: Add repository compliance scoring

1. Requirements: Calculate and display compliance scores for repositories
2. Architecture: New scoring service, dashboard widget, database storage
3. Implementation:
   - Backend: `/api/scoring-service.js` with compliance algorithms
   - Frontend: `ScoreWidget.tsx` component for dashboard
   - Storage: Extend audit history JSON structure
4. Testing: Unit tests for scoring logic, component tests for widget
5. Documentation: API docs, scoring methodology explanation
```

Always consider the long-term maintainability and extensibility of the feature, not just immediate functionality.
