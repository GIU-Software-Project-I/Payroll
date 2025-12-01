$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginBody = @{ email = 'payroll.spec@example.com'; password = 'Payroll@1234' } | ConvertTo-Json
Write-Output "Calling /auth/login..."
$loginResp = Invoke-RestMethod -Uri 'http://localhost:8000/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -WebSession $session -ErrorAction Stop
Write-Output "Login response body:"
$loginResp | ConvertTo-Json

Write-Output "Calling /payroll-execution/initiation..."
$body = @{ payrollPeriod = '2025-11-30'; entity = 'Acme Corp'; employees = 120; exceptions = 3; totalnetpay = 123456.78 } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri 'http://localhost:8000/payroll-execution/initiation' -Method POST -Body $body -ContentType 'application/json' -WebSession $session -ErrorAction Stop
Write-Output "Initiation response:"
$resp | ConvertTo-Json -Depth 6

Write-Output "Done"
