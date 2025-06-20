# Task Completion Guidelines (Updated)

## When a Task is Completed

### 1. MCP Server Validation (REQUIRED)
- **Code-linter MCP validation**: ALL code must pass code-linter MCP server validation before completion
- **Serena coordination**: Use Serena to orchestrate all MCP server operations
- **GitHub MCP operations**: Repository operations should be handled through GitHub MCP server
- **Multi-server workflow**: Let Serena marshall different MCP servers as needed

### 2. Code Quality Checks
- **Lint through MCP**: Run code-linter MCP server validation (mandatory)
- **Type checking**: Ensure TypeScript compilation passes with `tsc -b`
- **Style consistency**: Follow established patterns in the codebase
- **Error handling**: Verify proper error handling is implemented
- **MCP integration**: Ensure proper MCP server usage patterns

### 3. Repository Operations
- **GitHub MCP usage**: Use GitHub MCP server for all repository operations when possible
- **Issue creation**: Create GitHub issues through MCP for any findings
- **Pull request management**: Handle PRs via GitHub MCP server
- **Branch operations**: Create/manage branches through GitHub MCP
- **Commit validation**: Ensure commits meet quality standards

### 4. Git Actions Configuration
- **Workflow setup**: Ensure Git Actions are configured for the changes
- **Automated testing**: Verify CI/CD workflows are triggered properly
- **Quality gates**: Confirm automated quality checks are in place
- **Deployment automation**: Ensure deployment workflows are configured
- **Status checks**: Verify all required status checks pass

### 5. Testing Procedures
- **Manual testing**: Test the specific functionality that was modified
- **API endpoints**: Test API endpoints with curl or browser if modified
- **Dashboard functionality**: Verify UI changes work as expected
- **Cross-browser compatibility**: Check that changes work in different browsers
- **MCP integration**: Test MCP server integrations work correctly

### 6. Build Verification
- **Development build**: Ensure `npm run dev` works without errors
- **Production build**: Run `npm run build` to verify production build succeeds
- **No console errors**: Check browser console for JavaScript errors
- **Asset loading**: Verify all assets (CSS, images, fonts) load correctly
- **MCP dependencies**: Verify all required MCP servers are available

### 7. Documentation Updates
- **Update README.md**: If functionality changes affect usage
- **Update CHANGELOG.md**: Add entry for significant changes
- **Code comments**: Ensure complex logic is properly commented
- **API documentation**: Update if endpoints are added or modified
- **MCP documentation**: Document any new MCP server integrations

### 8. Quality Assurance Workflow
1. **Development**: Write code following conventions
2. **MCP Validation**: Run code-linter MCP server checks
3. **Serena Coordination**: Use Serena to orchestrate operations
4. **GitHub MCP**: Handle repository operations through GitHub MCP
5. **Git Actions**: Trigger and verify automated workflows
6. **Final Review**: Ensure all quality gates pass

### 9. File Organization
- **Clean up temp files**: Remove any temporary or debug files
- **Proper file placement**: Ensure files are in correct directories
- **Consistent naming**: Follow established naming conventions
- **Remove unused imports**: Clean up any unused imports or dependencies
- **Git Actions files**: Ensure workflow files are properly placed

### 10. Version Control Through GitHub MCP
- **GitHub MCP operations**: Use GitHub MCP for all repository operations
- **Commit message**: Write clear, descriptive commit messages
- **Atomic commits**: Make focused commits that address single concerns
- **Branch naming**: Use descriptive branch names for feature development
- **Pull request**: Create PR through GitHub MCP with clear description

### 11. Performance Checks
- **Bundle size**: Check if changes significantly impact bundle size
- **API response times**: Verify API endpoints respond quickly
- **Memory usage**: Ensure no memory leaks in long-running processes
- **Resource loading**: Optimize any new assets or dependencies
- **MCP performance**: Verify MCP server operations are efficient

### 12. Security Considerations
- **Input validation**: Verify all user inputs are properly validated
- **API security**: Ensure proper authentication and authorization
- **CORS configuration**: Verify CORS settings are appropriate
- **File permissions**: Check that file permissions are secure
- **MCP security**: Ensure MCP server integrations follow security best practices

### 13. Final Verification
- **Full system test**: Run complete development environment with `./dev-run.sh`
- **Data integrity**: Verify data flow from audit scripts through API to dashboard
- **Error scenarios**: Test error conditions and edge cases
- **User experience**: Verify changes improve or maintain good UX
- **MCP integration**: Confirm all MCP server operations work end-to-end

## Ready for Deployment Checklist
- [ ] **Code-linter MCP validation passed (MANDATORY)**
- [ ] Serena orchestration implemented correctly
- [ ] GitHub MCP server used for repository operations
- [ ] Git Actions configured and working
- [ ] Code linted and type-checked
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Build verification passed
- [ ] Files properly organized
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Version control clean
- [ ] Full system test passed
- [ ] All MCP server integrations working

## Critical Requirements (Non-Negotiable)
1. **ALL code must pass code-linter MCP server validation**
2. **Use Serena to marshall all MCP server operations**
3. **Favor GitHub MCP server for repository operations**
4. **Configure Git Actions for automation**
5. **No direct git commands when GitHub MCP is available**