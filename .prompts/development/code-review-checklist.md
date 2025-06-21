# Code Review Checklist

Use this prompt for comprehensive code reviews in the homelab-gitops-auditor project.

## Review Instructions

Please review the provided code changes with focus on the following areas. For each area, provide specific feedback and suggestions for improvement.

### 1. Code Quality & Style
- **Consistency**: Does the code follow established patterns in the codebase?
- **Readability**: Is the code self-documenting with clear variable/function names?
- **Complexity**: Are functions/methods appropriately sized and focused?
- **Comments**: Are comments helpful and up-to-date?

### 2. Security Assessment
- **Input Validation**: Are all inputs properly validated and sanitized?
- **Authentication**: Are authentication mechanisms properly implemented?
- **Authorization**: Are access controls appropriate for the functionality?
- **Data Exposure**: Is sensitive information properly protected?
- **Dependencies**: Are third-party dependencies secure and up-to-date?

### 3. Error Handling & Logging
- **Error Boundaries**: Are errors caught and handled appropriately?
- **Logging**: Are important events and errors properly logged?
- **User Experience**: Do error conditions provide helpful feedback?
- **Recovery**: Can the system gracefully recover from errors?

### 4. Performance Considerations
- **Efficiency**: Are algorithms and data structures appropriate?
- **Resource Usage**: Is memory and CPU usage optimized?
- **Scalability**: Will the code perform well under load?
- **Caching**: Are appropriate caching strategies implemented?

### 5. Testing & Maintainability
- **Test Coverage**: Are critical paths covered by tests?
- **Test Quality**: Are tests meaningful and maintainable?
- **Documentation**: Is functionality properly documented?
- **Backwards Compatibility**: Are breaking changes properly handled?

### 6. Project-Specific Considerations
- **GitOps Compliance**: Does the code follow GitOps principles?
- **MCP Integration**: Are MCP server interactions properly implemented?
- **API Design**: Are API endpoints consistent with existing patterns?
- **Configuration**: Is configuration management handled correctly?

## Review Format

For each file reviewed, provide:

1. **Overall Assessment**: Brief summary of the changes and their impact
2. **Strengths**: What the code does well
3. **Issues Found**: Specific problems that need addressing
4. **Suggestions**: Concrete recommendations for improvement
5. **Approval Status**: Ready to merge, needs changes, or requires discussion

## Example Review Output

```
### File: api/audit-service.js

**Overall Assessment**: Adds new audit endpoint with proper error handling and logging.

**Strengths**:
- Good error handling with try/catch blocks
- Consistent API response format
- Proper input validation

**Issues Found**:
- Line 45: SQL injection vulnerability in dynamic query construction
- Line 78: Missing rate limiting for expensive operation
- Missing unit tests for new functionality

**Suggestions**:
- Use parameterized queries for database operations
- Implement rate limiting middleware
- Add comprehensive test coverage

**Approval Status**: Needs changes before merge
```

Always be constructive and specific in your feedback, focusing on both immediate issues and long-term maintainability.
