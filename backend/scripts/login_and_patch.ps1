$login = Invoke-RestMethod -Uri http://localhost:8000/auth/login -Method Post -ContentType 'application/json' -Body '{"email":"payroll.spec@example.com","password":"Payroll@1234"}'
Write-Host "LOGIN RESPONSE:"; $login | ConvertTo-Json -Depth 5
$token = $login.access_token
if (-not $token) { Write-Error "No access token returned"; exit 1 }
$initiationId = '692d2b5b09063ec75ba4b06d'
$body = '{"exceptions":2,"totalnetpay":122000}'
$patch = Invoke-RestMethod -Uri "http://localhost:8000/payroll-execution/initiation/$initiationId" -Method Patch -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $body
Write-Host "PATCH RESPONSE:"; $patch | ConvertTo-Json -Depth 5
