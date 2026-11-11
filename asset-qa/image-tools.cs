using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

/// <summary>
/// 素材验收用的离线图像检测工具（Windows System.Drawing）。
/// 只包含检查与接触表功能，可直接随 asset-qa 文件夹复制给其他 agent。
/// </summary>
public static class AssetImageTools
{
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

                long bg = 0, bandTotal = 0, bandBg = 0;
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
