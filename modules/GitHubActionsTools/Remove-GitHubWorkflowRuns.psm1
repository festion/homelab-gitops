function Remove-GitHubWorkflowRuns {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [string[]]$Repos = @("festion/homelab-gitops-auditor"),

        [Parameter(Mandatory = $false)]
        [ValidateSet("success", "failure", "cancelled", "skipped", "timed_out", "action_required")]
        [string]$Status = "failure",

        [Parameter(Mandatory = $false)]
        [int]$Days = 0,

        [Parameter(Mandatory = $false)]
        [switch]$DryRun
    )

    foreach ($repo in $Repos) {
        Write-Host "`n📁 Processing repository: $repo"
        $parts = $repo.Split("/")
        $owner = $parts[0]
        $repoName = $parts[1]

        Write-Host "📡 Fetching workflow runs from $owner/$repoName..."

        try {
            $runs = gh api "repos/$owner/$repoName/actions/runs" --paginate | ConvertFrom-Json
        } catch {
            Write-Warning "⚠️ Failed to fetch runs for $repo: $_"
            continue
        }

        $deleted = 0
        $skipped = 0
        $cutoff = (Get-Date).AddDays(-$Days)

        foreach ($run in $runs.workflow_runs) {
            $runId = $run.id
            $status = $run.status
            $conclusion = $run.conclusion
            $createdAt = Get-Date $run.created_at
            $isArchived = $run.head_repository.archived

            $shouldDelete = $true

            if ($Status -and $conclusion -ne $Status) {
                $shouldDelete = $false
            }

            if ($Days -gt 0 -and $createdAt -lt $cutoff) {
                $shouldDelete = $false
            }

            if ($status -eq "in_progress" -or $status -eq "queued") {
                Write-Host "⏭️  Skipping run $runId ($status)..."
                $skipped++
                continue
            }

            if ($isArchived) {
                Write-Host "📦 Skipping run $runId from archived repo..."
                $skipped++
                continue
            }

            if ($shouldDelete) {
                if ($DryRun) {
                    Write-Host "🔍 Would delete run $runId ($conclusion @ $createdAt)"
                } else {
                    Write-Host "🗑️  Deleting run $runId ($conclusion @ $createdAt)"
                    gh api -X DELETE "repos/$owner/$repoName/actions/runs/$runId"
                }
                $deleted++
            } else {
                Write-Host "✔️  Keeping run $runId ($conclusion @ $createdAt)"
                $skipped++
            }
        }

        Write-Host "`n✅ Cleanup complete for $repoName. Deleted: $deleted | Skipped: $skipped"
    }
}
