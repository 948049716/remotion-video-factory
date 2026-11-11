using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

/// <summary>
/// 跳槽马 — 离线图像处理工具（Windows System.Drawing）。
/// 不依赖 Pillow / OpenCV，供 PowerShell 调用。
/// </summary>
public static class TiaocaoImageTools
{
    /// <summary>裁掉右下角水印区域，再缩放为固定尺寸。</summary>
    public static void CropAndResize(string input, string output, double bottomPct, double rightPct, int targetW, int targetH)
    {
        using (Bitmap src = new Bitmap(input))
        {
            int cropW = Math.Max(1, (int)Math.Round(src.Width * (1.0 - rightPct)));
            int cropH = Math.Max(1, (int)Math.Round(src.Height * (1.0 - bottomPct)));
            Rectangle cropRect = new Rectangle(0, 0, cropW, cropH);

            using (Bitmap cropped = src.Clone(cropRect, PixelFormat.Format32bppArgb))
            {
                int outW = targetW > 0 ? targetW : cropped.Width;
                int outH = targetH > 0 ? targetH : cropped.Height;

                using (Bitmap resized = new Bitmap(outW, outH, PixelFormat.Format32bppArgb))
                using (Graphics g = Graphics.FromImage(resized))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;
                    g.DrawImage(cropped, 0, 0, outW, outH);
                    resized.Save(output, ImageFormat.Png);
                }
            }
        }
    }

    /// <summary>
    /// 从四角采样绿幕颜色，自动抠图并裁到 alpha 边界。
    /// greenDominance：大于 0 时，绿色明显占优的像素直接判为背景（适合人物/道具）。
    /// erodePixels：对 alpha 做 N 像素腐蚀，用来消除绿边。
    /// </summary>
    public static void ChromaKeyAuto(
        string input,
        string output,
        int tolerance,
        int feather,
        int padding,
        int clearCornerW,
        int clearCornerH,
        int greenDominance,
        int erodePixels,
        bool despill)
    {
        using (Bitmap src = new Bitmap(input))
        {
            int[] xs = { 2, src.Width - 3, 2, src.Width - 3 };
            int[] ys = { 2, 2, src.Height - 3, src.Height - 3 };
            int r = 0, g = 0, b = 0;

            for (int i = 0; i < 4; i++)
            {
                Color c = src.GetPixel(xs[i], ys[i]);
                r += c.R;
                g += c.G;
                b += c.B;
            }

            ChromaKey(
                input,
                output,
                r / 4,
                g / 4,
                b / 4,
                tolerance,
                feather,
                padding,
                clearCornerW,
                clearCornerH,
                greenDominance,
                erodePixels,
                despill);
        }
    }

    /// <summary>以指定颜色为键抠图，羽化边缘，去溢色，腐蚀 alpha 后裁到边界。</summary>
    public static void ChromaKey(
        string input,
        string output,
        int keyR,
        int keyG,
        int keyB,
        int tolerance,
        int feather,
        int padding,
        int clearCornerW,
        int clearCornerH,
        int greenDominance,
        int erodePixels,
        bool despill)
    {
        using (Bitmap src = new Bitmap(input))
        {
            int w = src.Width;
            int h = src.Height;

            using (Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    g.DrawImage(src, 0, 0, w, h);
                }

                Rectangle rect = new Rectangle(0, 0, w, h);
                BitmapData data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
                int stride = data.Stride;
                byte[] bytes = new byte[stride * h];
                Marshal.Copy(data.Scan0, bytes, 0, bytes.Length);

                int maxDist = tolerance + feather;

                for (int y = 0; y < h; y++)
                {
                    int row = y * stride;
                    for (int x = 0; x < w; x++)
                    {
                        int i = row + x * 4;
                        byte b = bytes[i];
                        byte gcol = bytes[i + 1];
                        byte r = bytes[i + 2];

                        double dr = r - keyR;
                        double dg = gcol - keyG;
                        double db = b - keyB;
                        double dist = Math.Sqrt(dr * dr + dg * dg + db * db);

                        bool dominantKey = false;
                        if (greenDominance > 0)
                        {
                            if (keyG >= keyR && keyG >= keyB)
                            {
                                dominantKey = gcol > r + greenDominance && gcol > b + greenDominance;
                            }
                            else if (keyR >= keyG && keyB >= keyG)
                            {
                                dominantKey = r > gcol + greenDominance && b > gcol + greenDominance;
                            }
                            else if (keyR >= keyG && keyR >= keyB)
                            {
                                dominantKey = r > gcol + greenDominance && r > b + greenDominance;
                            }
                            else if (keyB >= keyR && keyB >= keyG)
                            {
                                dominantKey = b > r + greenDominance && b > gcol + greenDominance;
                            }
                        }

                        int alpha;
                        if (dist <= tolerance || dominantKey)
                        {
                            alpha = 0;
                        }
                        else if (dist <= maxDist)
                        {
                            alpha = (int)Math.Round(255.0 * (dist - tolerance) / Math.Max(1.0, feather));
                        }
                        else
                        {
                            alpha = 255;
                        }

                        // 去溢色：只处理靠近键色的边缘，避免把绿色草料洗灰。
                        if (despill && alpha > 0 && dist < maxDist + 100)
                        {
                            int maxRB = Math.Max(r, b);
                            if (gcol > maxRB + 8)
                            {
                                bytes[i + 1] = (byte)(maxRB + 8);
                            }
                        }

                        if (alpha < 0) alpha = 0;
                        if (alpha > 255) alpha = 255;
                        bytes[i + 3] = (byte)alpha;
                    }
                }

                if (clearCornerW > 0 && clearCornerH > 0)
                {
                    int startX = Math.Max(0, w - clearCornerW);
                    int startY = Math.Max(0, h - clearCornerH);

                    for (int y = startY; y < h; y++)
                    {
                        int row = y * stride;
                        for (int x = startX; x < w; x++)
                        {
                            bytes[row + x * 4 + 3] = 0;
                        }
                    }
                }

                if (erodePixels > 0)
                {
                    byte[] alphaCopy = new byte[w * h];
                    for (int y = 0; y < h; y++)
                    {
                        int row = y * stride;
                        for (int x = 0; x < w; x++)
                        {
                            alphaCopy[y * w + x] = bytes[row + x * 4 + 3];
                        }
                    }

                    for (int y = 0; y < h; y++)
                    {
                        int row = y * stride;
                        for (int x = 0; x < w; x++)
                        {
                            if (alphaCopy[y * w + x] == 0) continue;

                            bool edge = false;
                            for (int dy = -erodePixels; dy <= erodePixels && !edge; dy++)
                            {
                                for (int dx = -erodePixels; dx <= erodePixels; dx++)
                                {
                                    int nx = x + dx;
                                    int ny = y + dy;
                                    if (nx < 0 || ny < 0 || nx >= w || ny >= h)
                                    {
                                        edge = true;
                                        break;
                                    }
                                    if (alphaCopy[ny * w + nx] == 0)
                                    {
                                        edge = true;
                                        break;
                                    }
                                }
                            }

                            if (edge)
                            {
                                bytes[row + x * 4 + 3] = 0;
                            }
                        }
                    }
                }

                int minX = w, minY = h, maxX = -1, maxY = -1;
                for (int y = 0; y < h; y++)
                {
                    int row = y * stride;
                    for (int x = 0; x < w; x++)
                    {
                        if (bytes[row + x * 4 + 3] > 16)
                        {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }

                Marshal.Copy(bytes, 0, data.Scan0, bytes.Length);
                bmp.UnlockBits(data);

                SaveTrimmed(bmp, output, minX, minY, maxX, maxY, padding);
            }
        }
    }

    /// <summary>对已有透明通道的 PNG 做边界裁剪。</summary>
    public static void TrimAlpha(string input, string output, int padding, int clearCornerW, int clearCornerH)
    {
        using (Bitmap src = new Bitmap(input))
        {
            int w = src.Width;
            int h = src.Height;

            using (Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    g.DrawImage(src, 0, 0, w, h);
                }

                Rectangle rect = new Rectangle(0, 0, w, h);
                BitmapData data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
                int stride = data.Stride;
                byte[] bytes = new byte[stride * h];
                Marshal.Copy(data.Scan0, bytes, 0, bytes.Length);

                if (clearCornerW > 0 && clearCornerH > 0)
                {
                    int startX = Math.Max(0, w - clearCornerW);
                    int startY = Math.Max(0, h - clearCornerH);

                    for (int y = startY; y < h; y++)
                    {
                        int row = y * stride;
                        for (int x = startX; x < w; x++)
                        {
                            bytes[row + x * 4 + 3] = 0;
                        }
                    }
                }

                int minX = w, minY = h, maxX = -1, maxY = -1;
                for (int y = 0; y < h; y++)
                {
                    int row = y * stride;
                    for (int x = 0; x < w; x++)
                    {
                        if (bytes[row + x * 4 + 3] > 16)
                        {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }

                Marshal.Copy(bytes, 0, data.Scan0, bytes.Length);
                bmp.UnlockBits(data);

                SaveTrimmed(bmp, output, minX, minY, maxX, maxY, padding);
            }
        }
    }

    private static void SaveTrimmed(Bitmap bmp, string output, int minX, int minY, int maxX, int maxY, int padding)
    {
        int w = bmp.Width;
        int h = bmp.Height;

        if (maxX < minX || maxY < minY)
        {
            bmp.Save(output, ImageFormat.Png);
            return;
        }

        int x0 = Math.Max(0, minX - padding);
        int y0 = Math.Max(0, minY - padding);
        int x1 = Math.Min(w - 1, maxX + padding);
        int y1 = Math.Min(h - 1, maxY + padding);
        Rectangle crop = new Rectangle(x0, y0, x1 - x0 + 1, y1 - y0 + 1);

        using (Bitmap trimmed = bmp.Clone(crop, PixelFormat.Format32bppArgb))
        {
            trimmed.Save(output, ImageFormat.Png);
        }
    }

    /// <summary>把透明三视图按等宽切成独立视图，并裁到 alpha 边界。</summary>
    public static void SliceTurnaround(string input, string outputPrefix, int columns, int padding)
    {
        using (Bitmap src = new Bitmap(input))
        {
            int w = src.Width;
            int h = src.Height;
            int colW = w / columns;

            for (int i = 0; i < columns; i++)
            {
                int x0 = i * colW;
                int width = (i == columns - 1) ? w - x0 : colW;

                using (Bitmap col = src.Clone(new Rectangle(x0, 0, width, h), PixelFormat.Format32bppArgb))
                {
                    Rectangle rect = new Rectangle(0, 0, width, h);
                    BitmapData data = col.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                    int stride = data.Stride;
                    byte[] bytes = new byte[stride * h];
                    Marshal.Copy(data.Scan0, bytes, 0, bytes.Length);

                    int minX = width, minY = h, maxX = -1, maxY = -1;
                    for (int y = 0; y < h; y++)
                    {
                        int row = y * stride;
                        for (int x = 0; x < width; x++)
                        {
                            if (bytes[row + x * 4 + 3] > 16)
                            {
                                if (x < minX) minX = x;
                                if (x > maxX) maxX = x;
                                if (y < minY) minY = y;
                                if (y > maxY) maxY = y;
                            }
                        }
                    }

                    col.UnlockBits(data);
                    SaveTrimmed(col, outputPrefix + "-v" + (i + 1) + ".png", minX, minY, maxX, maxY, padding);
                }
            }
        }
    }

    /// <summary>
    /// 按透明列间隙切分多视图角色表。间隙小于 minGapPx 的视图会合并；
    /// 检测到超过 maxViews 个视图时，视为群像，只输出整体 -v1。
    /// </summary>
    public static void SliceByGaps(string input, string outputPrefix, int minGapPx, int padding, int maxViews)
    {
        using (Bitmap src = new Bitmap(input))
        {
            int w = src.Width;
            int h = src.Height;
            using (Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    g.DrawImage(src, 0, 0, w, h);
                }

                Rectangle rect = new Rectangle(0, 0, w, h);
                BitmapData data = bmp.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                int stride = data.Stride;
                byte[] bytes = new byte[stride * h];
                Marshal.Copy(data.Scan0, bytes, 0, bytes.Length);
                bmp.UnlockBits(data);

                bool[] occupied = new bool[w];
                for (int x = 0; x < w; x++)
                {
                    bool any = false;
                    for (int y = 0; y < h; y++)
                    {
                        if (bytes[y * stride + x * 4 + 3] > 16)
                        {
                            any = true;
                            break;
                        }
                    }
                    occupied[x] = any;
                }

                List<int[]> runs = new List<int[]>();
                int start = -1;
                for (int x = 0; x < w; x++)
                {
                    if (occupied[x] && start < 0) start = x;
                    if (!occupied[x] && start >= 0)
                    {
                        runs.Add(new int[] { start, x - 1 });
                        start = -1;
                    }
                }
                if (start >= 0) runs.Add(new int[] { start, w - 1 });

                List<int[]> merged = new List<int[]>();
                foreach (int[] run in runs)
                {
                    if (merged.Count == 0)
                    {
                        merged.Add(new int[] { run[0], run[1] });
                        continue;
                    }
                    int[] last = merged[merged.Count - 1];
                    if (run[0] - last[1] - 1 < minGapPx)
                    {
                        last[1] = run[1];
                    }
                    else
                    {
                        merged.Add(new int[] { run[0], run[1] });
                    }
                }

                if (merged.Count == 0) return;

                if (merged.Count > maxViews)
                {
                    int minX = w;
                    int minY = h;
                    int maxX = -1;
                    int maxY = -1;
                    for (int y = 0; y < h; y++)
                    {
                        for (int x = 0; x < w; x++)
                        {
                            if (bytes[y * stride + x * 4 + 3] > 16)
                            {
                                if (x < minX) minX = x;
                                if (x > maxX) maxX = x;
                                if (y < minY) minY = y;
                                if (y > maxY) maxY = y;
                            }
                        }
                    }
                    if (maxX >= 0)
                    {
                        SaveTrimmed(bmp, outputPrefix + "-v1.png", minX, minY, maxX, maxY, padding);
                    }
                    return;
                }

                for (int i = 0; i < merged.Count; i++)
                {
                    int x0 = merged[i][0];
                    int x1 = merged[i][1];
                    int minY = h;
                    int maxY = -1;
                    for (int y = 0; y < h; y++)
                    {
                        bool any = false;
                        for (int x = x0; x <= x1; x++)
                        {
                            if (bytes[y * stride + x * 4 + 3] > 16)
                            {
                                any = true;
                                break;
                            }
                        }
                        if (any)
                        {
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                    if (maxY < 0) continue;
                    SaveTrimmed(
                        bmp,
                        outputPrefix + "-v" + (i + 1) + ".png",
                        x0,
                        minY,
                        x1,
                        maxY,
                        padding
                    );
                }
            }
        }
    }

    /// <summary>
    /// 检测单张素材：尺寸、幕布纯度、主体边距、透明边与绿/洋红边残留。
    /// keyMode：green / green-alpha / magenta / none。
    /// 返回分号分隔的 key=value 指标，供验收脚本判定。
    /// </summary>
    public static string Inspect(string input, string keyMode, int tolerance, int bandPct)
    {
        using (Bitmap src = new Bitmap(input))
        {
            int w = src.Width;
            int h = src.Height;
            bool hasAlpha = Image.IsAlphaPixelFormat(src.PixelFormat);

            using (Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    g.DrawImage(src, 0, 0, w, h);
                }

                Rectangle rect = new Rectangle(0, 0, w, h);
                BitmapData data = bmp.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                int stride = data.Stride;
                byte[] bytes = new byte[stride * h];
                Marshal.Copy(data.Scan0, bytes, 0, bytes.Length);
                bmp.UnlockBits(data);

                bool useGreen = keyMode == "green" || keyMode == "green-alpha";
                bool useMagenta = keyMode == "magenta";
                int keyR = useMagenta ? 255 : 0;
                int keyG = useGreen ? 255 : 0;
                int keyB = useMagenta ? 255 : 0;

                long cr = 0, cg = 0, cb = 0;
                int cn = 0;
                int[] cxs = { 0, Math.Max(0, w - 6), 0, Math.Max(0, w - 6) };
                int[] cys = { 0, 0, Math.Max(0, h - 6), Math.Max(0, h - 6) };
                for (int k = 0; k < 4; k++)
                {
                    for (int y = cys[k]; y < Math.Min(h, cys[k] + 6); y++)
                    {
                        int row = y * stride;
                        for (int x = cxs[k]; x < Math.Min(w, cxs[k] + 6); x++)
                        {
                            int i = row + x * 4;
                            cb += bytes[i];
                            cg += bytes[i + 1];
                            cr += bytes[i + 2];
                            cn++;
                        }
                    }
                }

                double avgR = (double)cr / cn;
                double avgG = (double)cg / cn;
                double avgB = (double)cb / cn;
                double cornerDist = -1;
                bool cornerDominant = false;
                if (useGreen)
                {
                    cornerDist = Math.Sqrt(Math.Pow(avgR - keyR, 2) + Math.Pow(avgG - keyG, 2) + Math.Pow(avgB - keyB, 2));
                    cornerDominant = avgG > avgR + 30 && avgG > avgB + 30;
                }
                else if (useMagenta)
                {
                    cornerDist = Math.Sqrt(Math.Pow(avgR - keyR, 2) + Math.Pow(avgG - keyG, 2) + Math.Pow(avgB - keyB, 2));
                    cornerDominant = avgR > avgG + 30 && avgB > avgG + 30;
                }

                int bandW = Math.Max(1, (int)Math.Round(w * bandPct / 100.0));
                int bandH = Math.Max(1, (int)Math.Round(h * bandPct / 100.0));
                int border = Math.Max(1, (int)Math.Round(Math.Min(w, h) * 0.02));

                long bg = 0, nonBg = 0, bandTotal = 0, bandBg = 0;
                long semi = 0, fringe = 0, opaque = 0;
                long borderGreen = 0, borderMagenta = 0, borderTotal = 0;
                int minX = w, minY = h, maxX = -1, maxY = -1;

                for (int y = 0; y < h; y++)
                {
                    int row = y * stride;
                    for (int x = 0; x < w; x++)
                    {
                        int i = row + x * 4;
                        int b = bytes[i];
                        int gcol = bytes[i + 1];
                        int r = bytes[i + 2];
                        int a = bytes[i + 3];

                        bool greenDom = gcol > r + 40 && gcol > b + 40;
                        bool magentaDom = r > gcol + 40 && b > gcol + 40;

                        bool isBg = false;
                        if (useGreen || useMagenta)
                        {
                            double dr = r - keyR;
                            double dg = gcol - keyG;
                            double db = b - keyB;
                            double dist = Math.Sqrt(dr * dr + dg * dg + db * db);
                            isBg = dist <= tolerance || (useGreen ? greenDom : magentaDom);
                        }

                        if (isBg)
                        {
                            bg++;
                        }
                        else
                        {
                            nonBg++;
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }

                        bool inBand = x < bandW || x >= w - bandW || y < bandH || y >= h - bandH;
                        if (inBand)
                        {
                            bandTotal++;
                            if (isBg) bandBg++;
                        }

                        if (a > 0 && a < 250)
                        {
                            semi++;
                            if (greenDom || magentaDom) fringe++;
                        }
                        if (a >= 250) opaque++;

                        if (x < border || x >= w - border || y < border || y >= h - border)
                        {
                            borderTotal++;
                            if (gcol > r + 60 && gcol > b + 60) borderGreen++;
                            if (r > gcol + 60 && b > gcol + 60) borderMagenta++;
                        }
                    }
                }

                double total = (double)w * h;
                StringBuilder sb = new StringBuilder();
                AppendMetric(sb, "width", w);
                AppendMetric(sb, "height", h);
                AppendMetric(sb, "hasAlpha", hasAlpha ? 1 : 0);
                AppendMetric(sb, "cornerDist", Math.Round(cornerDist, 1));
                AppendMetric(sb, "cornerDominant", cornerDominant ? 1 : 0);
                AppendMetric(sb, "bgRatio", (double)bg / total);
                AppendMetric(sb, "bandBgRatio", bandTotal > 0 ? (double)bandBg / bandTotal : -1);
                AppendMetric(sb, "semiRatio", (double)semi / total);
                AppendMetric(sb, "fringeRatio", semi > 0 ? (double)fringe / semi : 0);
                AppendMetric(sb, "opaqueRatio", (double)opaque / total);
                AppendMetric(sb, "borderGreenRatio", borderTotal > 0 ? (double)borderGreen / borderTotal : 0);
                AppendMetric(sb, "borderMagentaRatio", borderTotal > 0 ? (double)borderMagenta / borderTotal : 0);
                AppendMetric(sb, "marginLeft", maxX >= 0 ? Math.Round(100.0 * minX / w, 2) : -1);
                AppendMetric(sb, "marginTop", maxY >= 0 ? Math.Round(100.0 * minY / h, 2) : -1);
                AppendMetric(sb, "marginRight", maxX >= 0 ? Math.Round(100.0 * (w - 1 - maxX) / w, 2) : -1);
                AppendMetric(sb, "marginBottom", maxY >= 0 ? Math.Round(100.0 * (h - 1 - maxY) / h, 2) : -1);
                return sb.ToString();
            }
        }
    }

    private static void AppendMetric(StringBuilder sb, string key, double value)
    {
        if (sb.Length > 0) sb.Append(';');
        sb.Append(key).Append('=').Append(value.ToString("0.###", CultureInfo.InvariantCulture));
    }

    private static void AppendMetric(StringBuilder sb, string key, int value)
    {
        if (sb.Length > 0) sb.Append(';');
        sb.Append(key).Append('=').Append(value.ToString(CultureInfo.InvariantCulture));
    }

    /// <summary>生成带棋盘格背景与文件名的素材接触表。</summary>
    public static void MakeContactSheet(string inputList, string output, int columns, int thumbW, string bgColorHex)
    {
        string[] inputs = inputList.Split(new char[] { '|' }, StringSplitOptions.RemoveEmptyEntries);
        if (inputs.Length == 0) return;

        int cellW = thumbW + 24;
        int cellH = (int)Math.Round(thumbW * 0.75) + 52;
        int rows = (int)Math.Ceiling((double)inputs.Length / columns);
        int width = cellW * columns;
        int height = cellH * rows;

        Color paper = ColorTranslator.FromHtml(bgColorHex);

        using (Bitmap sheet = new Bitmap(width, height, PixelFormat.Format32bppArgb))
        using (Graphics g = Graphics.FromImage(sheet))
        {
            g.Clear(paper);
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = SmoothingMode.HighQuality;

            using (Font labelFont = new Font("Microsoft YaHei", 12, FontStyle.Regular))
            using (SolidBrush labelBrush = new SolidBrush(Color.FromArgb(28, 26, 23)))
            using (SolidBrush cellBrush = new SolidBrush(Color.FromArgb(244, 235, 216)))
            using (Pen borderPen = new Pen(Color.FromArgb(201, 185, 154), 1))
            using (SolidBrush checkA = new SolidBrush(Color.FromArgb(232, 220, 195)))
            using (SolidBrush checkB = new SolidBrush(Color.FromArgb(218, 204, 176)))
            {
                for (int i = 0; i < inputs.Length; i++)
                {
                    int col = i % columns;
                    int row = i / columns;
                    int x = col * cellW + 12;
                    int y = row * cellH + 12;
                    int boxW = thumbW;
                    int boxH = (int)Math.Round(thumbW * 0.75);

                    g.FillRectangle(cellBrush, x, y, boxW, boxH);
                    g.DrawRectangle(borderPen, x, y, boxW, boxH);

                    int tile = 16;
                    for (int yy = 0; yy < boxH; yy += tile)
                    {
                        for (int xx = 0; xx < boxW; xx += tile)
                        {
                            SolidBrush brush = ((xx / tile + yy / tile) % 2 == 0) ? checkA : checkB;
                            g.FillRectangle(brush, x + xx, y + yy, Math.Min(tile, boxW - xx), Math.Min(tile, boxH - yy));
                        }
                    }

                    try
                    {
                        using (Bitmap img = new Bitmap(inputs[i]))
                        {
                            double scale = Math.Min((double)boxW / img.Width, (double)boxH / img.Height);
                            int drawW = Math.Max(1, (int)Math.Round(img.Width * scale));
                            int drawH = Math.Max(1, (int)Math.Round(img.Height * scale));
                            int drawX = x + (boxW - drawW) / 2;
                            int drawY = y + (boxH - drawH) / 2;
                            g.DrawImage(img, drawX, drawY, drawW, drawH);
                        }
                    }
                    catch
                    {
                        // 单张读取失败不影响整张接触表
                    }

                    string name = Path.GetFileName(inputs[i]);
                    g.DrawString(name, labelFont, labelBrush, x + 2, y + boxH + 8);
                }
            }

            sheet.Save(output, ImageFormat.Png);
        }
    }
}
