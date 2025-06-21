# Prompts Directory Overview

The `.prompts` directory contains a comprehensive collection of structured prompts designed to streamline development, operations, and analysis tasks for the homelab-gitops-auditor project.

## 📁 Directory Structure

```
.prompts/
├── README.md                           # Main documentation
├── PROMPTS_OVERVIEW.md                 # This overview file
├── system-prompts/                     # Core system behavior prompts
│   ├── project-context.md              # Project overview and architecture
│   └── development-assistant.md        # Development-focused assistant prompt
├── development/                        # Development workflow prompts
│   ├── code-review-checklist.md        # Comprehensive code review guide
│   └── feature-development-guide.md    # Feature implementation process
├── operations/                         # Operational procedure prompts
│   ├── deployment-procedures.md        # Safe deployment practices
│   └── incident-response.md            # Incident handling procedures
├── analysis/                          # Analysis and audit prompts
│   ├── gitops-audit-procedures.md      # GitOps compliance auditing
│   └── security-assessment.md          # Security evaluation framework
├── templates/                         # Reusable prompt templates
│   └── prompt-template.md             # Template for creating new prompts
└── archived/                          # Historical prompt storage
    └── .gitkeep                       # Directory placeholder
```

## 🎯 Prompt Categories

### System Prompts
**Purpose**: Define fundamental AI assistant behavior and project context
- **project-context.md**: Complete project overview including architecture, components, and principles
- **development-assistant.md**: Specialized development assistant with technical expertise

### Development Prompts
**Purpose**: Guide development workflow and code quality assurance
- **code-review-checklist.md**: 6-point comprehensive code review framework
- **feature-development-guide.md**: End-to-end feature development process

### Operations Prompts
**Purpose**: Ensure reliable deployment and incident management
- **deployment-procedures.md**: Step-by-step deployment with rollback procedures
- **incident-response.md**: Severity-based incident classification and response

### Analysis Prompts
**Purpose**: Systematic evaluation of GitOps compliance and security
- **gitops-audit-procedures.md**: Complete GitOps compliance assessment framework
- **security-assessment.md**: Multi-layered security vulnerability assessment

### Templates
**Purpose**: Standardize new prompt creation
- **prompt-template.md**: Comprehensive template with examples and best practices

## 🔧 Usage Guidelines

### For AI Assistants
1. **Start with System Prompts**: Load project-context.md for comprehensive understanding
2. **Choose Appropriate Category**: Select prompts based on the task type
3. **Follow Structured Process**: Use the step-by-step guidance in each prompt
4. **Validate Results**: Apply the validation frameworks provided

### For Developers
1. **Reference During Work**: Use prompts as checklists and guidance
2. **Customize as Needed**: Adapt prompts for specific project requirements
3. **Keep Updated**: Update prompts when processes change
4. **Share Knowledge**: Contribute new prompts using the template

## 📊 Prompt Effectiveness

### Quality Assurance Benefits
- **Consistent Code Reviews**: 6-point systematic evaluation
- **Standardized Deployments**: Reduced deployment failures
- **Comprehensive Security**: Multi-layer vulnerability assessment
- **GitOps Compliance**: Systematic audit procedures

### Development Efficiency
- **Faster Onboarding**: Complete project context available
- **Reduced Errors**: Step-by-step guidance prevents mistakes
- **Knowledge Sharing**: Documented processes and best practices
- **Automated Validation**: Built-in quality checks

## 🔄 Maintenance Strategy

### Regular Updates
- **Monthly**: Review and update based on project evolution
- **Post-Incident**: Update procedures based on lessons learned
- **Version Changes**: Align prompts with new project versions
- **Feedback Integration**: Incorporate user feedback and improvements

### Version Control
- All prompts are version controlled with the main codebase
- Changes are tracked through standard Git workflow
- Updates are documented in commit messages
- Archive old prompts when superseded

## 🎓 Best Practices

### Creating New Prompts
1. Use the prompt template (`templates/prompt-template.md`)
2. Include specific examples relevant to the project
3. Provide validation criteria and success metrics
4. Test prompts with different scenarios
5. Document the prompt purpose and usage

### Using Existing Prompts
1. Read the entire prompt before starting
2. Follow the step-by-step structure
3. Use provided checklists and validation steps
4. Adapt examples to your specific situation
5. Provide feedback for continuous improvement

### Maintaining Prompt Quality
1. Keep prompts concise but comprehensive
2. Update examples with real project scenarios
3. Validate prompts against current project state
4. Remove outdated information promptly
5. Cross-reference related prompts appropriately

## 🔗 Integration with Project

### Development Workflow
The prompts integrate seamlessly with the project's development practices:
- Code reviews follow the established quality framework
- Deployments use the standardized procedures
- Security assessments align with project requirements
- Feature development follows the proven process

### Tool Integration
Prompts work alongside project tools:
- **GitHub MCP**: Version control and collaboration workflows
- **Code Linter**: Quality assurance automation
- **Audit Scripts**: Compliance validation procedures
- **Monitoring Tools**: Incident response procedures

### Documentation Alignment
Prompts complement existing project documentation:
- Reference existing docs where appropriate
- Avoid duplication of information
- Provide actionable guidance beyond static documentation
- Link to relevant project resources

This prompt collection ensures consistent, high-quality development and operations practices while maintaining the flexibility to adapt to evolving project needs.
