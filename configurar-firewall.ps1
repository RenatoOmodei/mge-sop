$port = 3010
$ruleName = "ERP Pedidos de Venda Local $port"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if (-not $existing) {
  New-NetFirewallRule `
    -DisplayName $ruleName `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort $port `
    -Action Allow | Out-Null
}

Write-Host "Regra de firewall pronta para a porta $port."
