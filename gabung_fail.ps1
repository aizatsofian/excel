# Nama untuk fail output
$outputFile = "projek-penuh.txt"

# Laluan penuh ke fail output
$fullOutputPath = Join-Path -Path $PSScriptRoot -ChildPath $outputFile

# Mula dengan mengosongkan fail output jika ia wujud
Clear-Content -Path $fullOutputPath -ErrorAction SilentlyContinue

# Dapatkan semua fail secara rekursif dari direktori semasa
$files = Get-ChildItem -Path $PSScriptRoot -Recurse -File

# Loop melalui setiap fail yang ditemui
foreach ($file in $files) {
    # Syarat ini adalah untuk mengabaikan fail skrip itu sendiri dan fail output
    if ($file.Name -ne "gabung_fail.ps1" -and $file.Name -ne $outputFile) {
        
        # Dapatkan laluan relatif untuk tajuk
        $relativePath = $file.FullName.Replace($PSScriptRoot + "\", "")

        # Tulis tajuk (header) ke dalam fail output
        Add-Content -Path $fullOutputPath -Value "===== FAIL: $relativePath ====="

        # Salin kandungan sebenar fail tersebut ke dalam fail output
        Add-Content -Path $fullOutputPath -Value (Get-Content -Path $file.FullName -Raw)

        # Tambah satu baris baru sebagai pemisah
        Add-Content -Path $fullOutputPath -Value "`r`n"
    }
}

Write-Host "Selesai! Semua kod telah digabungkan ke dalam fail $outputFile"