$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginBody = @{ email = 'payroll.spec@example.com'; password = 'Payroll@1234' } | ConvertTo-Json
Write-Output "Logging in as payroll.spec@example.com..."
try {
    $loginResp = Invoke-RestMethod -Uri 'http://localhost:8000/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -WebSession $session -ErrorAction Stop
    Write-Output "Login OK"
} catch {
    Write-Error "Login failed: $_"
    exit 1
}

Write-Output "Creating payroll initiation..."
$createBody = @{ payrollPeriod = '2025-11-30'; entity = 'Acme Corp'; employees = 120; exceptions = 3; totalnetpay = 123456.78 } | ConvertTo-Json
try {
    $createResp = Invoke-RestMethod -Uri 'http://localhost:8000/payroll-execution/initiation' -Method POST -Body $createBody -ContentType 'application/json' -WebSession $session -ErrorAction Stop
    Write-Output "Create response:`n"; $createResp | ConvertTo-Json -Depth 6
} catch {
    Write-Error "Create failed: $_"
    exit 1
}

 # Extract id (support debug wrapper or plain created doc)
 $initId = $null
 if ($null -ne $createResp) {
     if ($createResp.PSObject.Properties.Name -contains 'created') { $initId = $createResp.created._id }
     elseif ($createResp.PSObject.Properties.Name -contains '_id') { $initId = $createResp._id }
 }
if (-not $initId) { Write-Error "Could not determine initiation id from response"; exit 1 }
Write-Output "Initiation id: $initId"

Write-Output "Patching initiation (exceptions=2, totalnetpay=122000)..."
$patchBody = @{ exceptions = 2; totalnetpay = 122000 } | ConvertTo-Json
try {
    $patchResp = Invoke-RestMethod -Uri "http://localhost:8000/payroll-execution/initiation/$initId" -Method PATCH -Body $patchBody -ContentType 'application/json' -WebSession $session -ErrorAction Stop
    Write-Output "Patch response:`n"; $patchResp | ConvertTo-Json -Depth 6
} catch {
    Write-Error "Patch failed: $_"
}

Write-Output "Approving initiation..."
try {
    $approveResp = Invoke-RestMethod -Uri "http://localhost:8000/payroll-execution/initiation/$initId/approve" -Method POST -WebSession $session -ErrorAction Stop
    Write-Output "Approve response:`n"; $approveResp | ConvertTo-Json -Depth 6
} catch {
    Write-Error "Approve failed: $_"
}

Write-Output "Rejecting initiation (reason test)..."
try {
    $rejectBody = @{ reason = 'Testing reject after approve' } | ConvertTo-Json
    $rejectResp = Invoke-RestMethod -Uri "http://localhost:8000/payroll-execution/initiation/$initId/reject" -Method POST -Body $rejectBody -ContentType 'application/json' -WebSession $session -ErrorAction Stop
    Write-Output "Reject response:`n"; $rejectResp | ConvertTo-Json -Depth 6
} catch {
    Write-Error "Reject failed: $_"
}

Write-Output "Fetching draft for id (should report removed)..."
try {
    $draftResp = Invoke-RestMethod -Uri "http://localhost:8000/payroll-execution/draft/$initId" -Method GET -WebSession $session -ErrorAction Stop
    Write-Output "Draft fetch response:`n"; $draftResp | ConvertTo-Json -Depth 6
} catch {
    Write-Error "Draft fetch failed: $_"
}

Write-Output "Smoke test sequence complete."
