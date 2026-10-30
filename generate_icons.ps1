Add-Type -AssemblyName System.Drawing

function Generate-CalendarIcon([int]$size, [string]$outputPath) {
    $bmp = [System.Drawing.Bitmap]::new($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # 1. Background: Pure solid white (Opaque for Apple Touch Icon)
    $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.FillRectangle($whiteBrush, 0, 0, $size, $size)

    # 2. Apple Calendar Signature Red Banner at Top (30% of height)
    $headerHeight = [int]($size * 0.30)
    $redColor = [System.Drawing.Color]::FromArgb(255, 255, 59, 48) # Apple Red #ff3b30
    $redBrush = [System.Drawing.SolidBrush]::new($redColor)
    $g.FillRectangle($redBrush, 0, 0, $size, $headerHeight)

    # 3. Two Binder Rings / Hanging Clips at Top (Silver/White)
    $ringWidth = [int]($size * 0.065)
    $ringHeight = [int]($size * 0.12)
    $ringY = [int]($headerHeight * 0.08)
    $ring1X = [int]($size * 0.22)
    $ring2X = [int]($size * 0.71)
    $ringBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(240, 255, 255, 255))
    
    # Clip 1
    $gp1 = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $gp1.AddArc($ring1X, $ringY, $ringWidth, $ringWidth, 180, 180)
    $gp1.AddArc($ring1X, $ringY + $ringHeight - $ringWidth, $ringWidth, $ringWidth, 0, 180)
    $gp1.CloseFigure()
    $g.FillPath($ringBrush, $gp1)
    
    # Clip 2
    $gp2 = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $gp2.AddArc($ring2X, $ringY, $ringWidth, $ringWidth, 180, 180)
    $gp2.AddArc($ring2X, $ringY + $ringHeight - $ringWidth, $ringWidth, $ringWidth, 0, 180)
    $gp2.CloseFigure()
    $g.FillPath($ringBrush, $gp2)

    # 4. Text on Red Banner: "CALENDAR"
    $sf = [System.Drawing.StringFormat]::new()
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $headerFontSize = [float]($size * 0.08)
    $headerFont = [System.Drawing.Font]::new("Segoe UI", $headerFontSize, [System.Drawing.FontStyle]::Bold)
    $headerTextRect = [System.Drawing.RectangleF]::new(0, [float]($headerHeight * 0.40), [float]$size, [float]($headerHeight * 0.55))
    $g.DrawString("CALENDAR", $headerFont, $whiteBrush, $headerTextRect, $sf)

    # 5. Calendar Center Content: Large Minimalist Date Number (e.g. "31")
    $bodyY = $headerHeight
    $bodyHeight = $size - $headerHeight
    $numberFontSize = [float]($size * 0.38)
    $numberFont = [System.Drawing.Font]::new("Segoe UI", $numberFontSize, [System.Drawing.FontStyle]::Bold)
    $darkCharcoal = [System.Drawing.Color]::FromArgb(255, 28, 28, 30) # Apple Dark #1c1c1e
    $numberBrush = [System.Drawing.SolidBrush]::new($darkCharcoal)
    
    $numberRect = [System.Drawing.RectangleF]::new(0, [float]($bodyY + $bodyHeight * 0.04), [float]$size, [float]($bodyHeight * 0.65))
    $g.DrawString("31", $numberFont, $numberBrush, $numberRect, $sf)

    # 6. Two Event Badges below number (Pink for Work, Blue for Travel)
    $dotRadius = [int]($size * 0.025)
    $dotY = [int]($bodyY + $bodyHeight * 0.77)
    $centerX = [int]($size * 0.5)
    $spacing = [int]($size * 0.06)

    $pinkColor = [System.Drawing.Color]::FromArgb(255, 244, 114, 182) # #f472b6
    $pinkBrush = [System.Drawing.SolidBrush]::new($pinkColor)
    $g.FillEllipse($pinkBrush, $centerX - $spacing - $dotRadius, $dotY, $dotRadius * 2, $dotRadius * 2)

    $blueColor = [System.Drawing.Color]::FromArgb(255, 56, 189, 248) # #38bdf8
    $blueBrush = [System.Drawing.SolidBrush]::new($blueColor)
    $g.FillEllipse($blueBrush, $centerX + $spacing - $dotRadius, $dotY, $dotRadius * 2, $dotRadius * 2)

    # Clean border (subtle 1px line so standalone previews look crisp)
    $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(35, 0, 0, 0), 1)
    $g.DrawRectangle($borderPen, 0, 0, $size - 1, $size - 1)

    # Save PNG
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Successfully generated: $outputPath ($($size)x$($size))"
}

$baseDir = "C:\Users\ken03\.gemini\antigravity\scratch\schedule-countdown"
Generate-CalendarIcon 512 "$baseDir\icon-512.png"
Generate-CalendarIcon 192 "$baseDir\icon-192.png"
Generate-CalendarIcon 180 "$baseDir\apple-touch-icon.png"
Generate-CalendarIcon 180 "$baseDir\apple-touch-icon-180x180.png"
Generate-CalendarIcon 64  "$baseDir\favicon-64.png"
Generate-CalendarIcon 32  "$baseDir\favicon-32.png"
