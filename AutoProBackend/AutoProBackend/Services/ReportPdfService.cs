using AutoProBackend.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace AutoProBackend.Services;

public class ReportPdfService : IReportPdfService
{
    private const string PrimaryHex = "#7c3aed";

    public byte[] GenerateFinancialReport(FinancialReportResponse data, string period, int year, int? month)
    {
        var periodLabel = period.ToLower() switch
        {
            "daily"   => $"Daily — {new DateTime(year, month ?? 1, DateTime.UtcNow.Day):dd MMM yyyy}",
            "monthly" => $"Monthly — {new DateTime(year, month ?? DateTime.UtcNow.Month, 1):MMMM yyyy}",
            _         => $"Yearly — {year}"
        };

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(36);
                page.DefaultTextStyle(t => t.FontFamily("Arial").FontSize(9));

                // ── HEADER ──────────────────────────────────────────────
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(inner =>
                        {
                            inner.Item().Text("AutoPro Garage")
                                 .FontSize(20).Bold()
                                 .FontColor(Color.FromHex(PrimaryHex));
                            inner.Item().Text("Financial Report")
                                 .FontSize(13).SemiBold();
                            inner.Item().PaddingTop(2)
                                 .Text($"Period: {periodLabel}")
                                 .FontSize(9).FontColor(Colors.Grey.Darken1);
                        });
                        row.AutoItem().AlignRight().Column(inner =>
                        {
                            inner.Item()
                                 .Text($"Generated: {DateTime.UtcNow:dd MMM yyyy}")
                                 .FontSize(9).FontColor(Colors.Grey.Darken1);
                            inner.Item().Text("Confidential")
                                 .FontSize(8).FontColor(Colors.Grey.Medium);
                        });
                    });
                    col.Item().PaddingTop(6)
                       .LineHorizontal(1.5f)
                       .LineColor(Color.FromHex(PrimaryHex));
                    col.Item().Height(10);
                });

                // ── CONTENT ─────────────────────────────────────────────
                page.Content().Column(col =>
                {
                    // KPI section
                    col.Item().Text("Key Performance Indicators")
                       .FontSize(11).SemiBold()
                       .FontColor(Color.FromHex(PrimaryHex));
                    col.Item().Height(6);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn();
                            cols.RelativeColumn();
                            cols.RelativeColumn();
                        });

                        void KpiCell(string label, string value, string? sub = null) =>
                            table.Cell()
                                 .Border(0.5f).BorderColor(Colors.Grey.Lighten2)
                                 .Background(Colors.Grey.Lighten5)
                                 .Padding(10)
                                 .Column(c =>
                                 {
                                     c.Item().Text(label).FontSize(8).FontColor(Colors.Grey.Darken1);
                                     c.Item().Text(value).FontSize(14).Bold();
                                     if (sub != null)
                                         c.Item().Text(sub).FontSize(8).FontColor(Colors.Grey.Medium);
                                 });

                        KpiCell("Total Revenue",     $"NPR {data.TotalRevenue:N0}");
                        KpiCell("Total Expenses",    $"NPR {data.TotalExpenses:N0}");
                        KpiCell("Net Profit",        $"NPR {data.NetProfit:N0}",
                                data.NetProfit >= 0 ? "Profitable" : "Loss");
                        KpiCell("Invoices Issued",   data.InvoicesIssued.ToString());
                        KpiCell("Avg Invoice Value", $"NPR {data.AverageInvoiceValue:N0}");
                        KpiCell("Month-over-Month",
                                $"{(data.MonthOverMonthChange >= 0 ? "+" : "")}{data.MonthOverMonthChange:F1}%",
                                data.MonthOverMonthChange >= 0 ? "Growth" : "Decline");
                    });

                    col.Item().Height(18);

                    // Breakdown section
                    col.Item().Text("Revenue Breakdown")
                       .FontSize(11).SemiBold()
                       .FontColor(Color.FromHex(PrimaryHex));
                    col.Item().Height(6);

                    if (data.DailyBreakdown.Count == 0)
                    {
                        col.Item().Text("No transaction data for this period.")
                           .FontSize(9).FontColor(Colors.Grey.Medium);
                    }
                    else
                    {
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(cols =>
                            {
                                cols.RelativeColumn(3);
                                cols.RelativeColumn(3);
                                cols.RelativeColumn(2);
                            });

                            void HeaderCell(string text) =>
                                table.Cell()
                                     .Background(Color.FromHex(PrimaryHex))
                                     .Padding(6)
                                     .Text(text).FontSize(9).Bold()
                                     .FontColor(Colors.White);

                            HeaderCell("Date");
                            HeaderCell("Revenue (NPR)");
                            HeaderCell("Invoices");

                            bool alt = false;
                            foreach (var entry in data.DailyBreakdown)
                            {
                                var bg = alt ? Colors.Grey.Lighten5 : Colors.White;
                                alt = !alt;

                                table.Cell().Background(bg)
                                     .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2)
                                     .Padding(6)
                                     .Text(entry.Date.ToString("dd MMM yyyy")).FontSize(9);

                                table.Cell().Background(bg)
                                     .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2)
                                     .Padding(6)
                                     .Text($"{entry.Revenue:N0}").FontSize(9).SemiBold();

                                table.Cell().Background(bg)
                                     .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2)
                                     .Padding(6)
                                     .Text(entry.Invoices.ToString()).FontSize(9);
                            }

                            // Totals row
                            var totRev = data.DailyBreakdown.Sum(e => e.Revenue);
                            var totInv = data.DailyBreakdown.Sum(e => e.Invoices);

                            table.Cell().Background(Colors.Grey.Lighten3).Padding(6)
                                 .Text("TOTAL").Bold().FontSize(9);
                            table.Cell().Background(Colors.Grey.Lighten3).Padding(6)
                                 .Text($"{totRev:N0}").Bold().FontSize(9)
                                 .FontColor(Color.FromHex(PrimaryHex));
                            table.Cell().Background(Colors.Grey.Lighten3).Padding(6)
                                 .Text(totInv.ToString()).Bold().FontSize(9);
                        });
                    }
                });

                // ── FOOTER ───────────────────────────────────────────────
                page.Footer().Row(row =>
                {
                    row.RelativeItem()
                       .Text("AutoPro Garage, Kathmandu, Nepal")
                       .FontSize(8).FontColor(Colors.Grey.Medium);
                    row.AutoItem().Text(x =>
                    {
                        x.Span("Page ").FontSize(8).FontColor(Colors.Grey.Medium);
                        x.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                        x.Span(" of ").FontSize(8).FontColor(Colors.Grey.Medium);
                        x.TotalPages().FontSize(8).FontColor(Colors.Grey.Medium);
                    });
                });
            });
        }).GeneratePdf();
    }

    public byte[] GeneratePurchaseOrderInvoice(PurchaseOrderResponse data)
    {
        var statusColor = data.Status == "Received" ? Colors.Green.Darken1 : Colors.Orange.Darken1;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(36);
                page.DefaultTextStyle(t => t.FontFamily("Arial").FontSize(9));

                // ── HEADER ────────────────────────────────────────────────
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(inner =>
                        {
                            inner.Item().Text("AutoPro Garage")
                                 .FontSize(20).Bold().FontColor(Color.FromHex(PrimaryHex));
                            inner.Item().Text("Purchase Order Invoice")
                                 .FontSize(13).SemiBold();
                        });
                        row.AutoItem().AlignRight().Column(inner =>
                        {
                            inner.Item().Text($"PO #{data.Id}")
                                 .FontSize(16).Bold().FontColor(Color.FromHex(PrimaryHex));
                            inner.Item().Text($"Date: {data.Date:dd MMM yyyy}")
                                 .FontSize(9).FontColor(Colors.Grey.Darken1);
                            inner.Item().PaddingTop(4)
                                 .Text(data.Status.ToUpper())
                                 .FontSize(9).Bold().FontColor(statusColor);
                        });
                    });
                    col.Item().PaddingTop(6)
                       .LineHorizontal(1.5f).LineColor(Color.FromHex(PrimaryHex));
                    col.Item().Height(10);
                });

                // ── CONTENT ───────────────────────────────────────────────
                page.Content().Column(col =>
                {
                    // Vendor section
                    col.Item().Text("Vendor Details")
                       .FontSize(11).SemiBold().FontColor(Color.FromHex(PrimaryHex));
                    col.Item().Height(6);
                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2)
                       .Background(Colors.Grey.Lighten5).Padding(10)
                       .Column(v =>
                       {
                           v.Item().Text(data.VendorName).FontSize(12).Bold();
                           v.Item().PaddingTop(2)
                            .Text($"Vendor ID: {data.VendorId}")
                            .FontSize(9).FontColor(Colors.Grey.Medium);
                           if (!string.IsNullOrWhiteSpace(data.Notes))
                               v.Item().PaddingTop(4)
                                .Text($"Notes: {data.Notes}")
                                .FontSize(9).FontColor(Colors.Grey.Darken1);
                       });

                    col.Item().Height(18);

                    // Items table
                    col.Item().Text("Order Items")
                       .FontSize(11).SemiBold().FontColor(Color.FromHex(PrimaryHex));
                    col.Item().Height(6);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(4);
                            cols.RelativeColumn(2);
                            cols.RelativeColumn(3);
                            cols.RelativeColumn(3);
                        });

                        void HeaderCell(string text) =>
                            table.Cell()
                                 .Background(Color.FromHex(PrimaryHex))
                                 .Padding(6)
                                 .Text(text).FontSize(9).Bold().FontColor(Colors.White);

                        HeaderCell("Part Name");
                        HeaderCell("Quantity");
                        HeaderCell("Unit Cost (NPR)");
                        HeaderCell("Line Total (NPR)");

                        bool alt = false;
                        foreach (var item in data.Items)
                        {
                            var bg = alt ? Colors.Grey.Lighten5 : Colors.White;
                            alt = !alt;

                            table.Cell().Background(bg)
                                 .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2)
                                 .Padding(6).Text(item.PartName).FontSize(9);

                            table.Cell().Background(bg)
                                 .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2)
                                 .Padding(6).Text(item.Quantity.ToString()).FontSize(9);

                            table.Cell().Background(bg)
                                 .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2)
                                 .Padding(6).Text($"{item.UnitCost:N0}").FontSize(9).SemiBold();

                            table.Cell().Background(bg)
                                 .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2)
                                 .Padding(6).Text($"{item.LineTotal:N0}").FontSize(9).SemiBold();
                        }

                        // Grand total row
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(6)
                             .Text("GRAND TOTAL").Bold().FontSize(9);
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(6).Text("");
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(6).Text("");
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(6)
                             .Text($"{data.Total:N0}").Bold().FontSize(11)
                             .FontColor(Color.FromHex(PrimaryHex));
                    });

                    col.Item().Height(18);

                    // Status note
                    var noteText = data.Status == "Received"
                        ? "This purchase order has been received. Inventory has been updated."
                        : "This purchase order is pending. Mark as Received once goods arrive to update inventory.";
                    col.Item().Background(data.Status == "Received" ? Colors.Green.Lighten4 : Colors.Orange.Lighten4)
                       .Border(0.5f).BorderColor(data.Status == "Received" ? Colors.Green.Lighten1 : Colors.Orange.Lighten1)
                       .Padding(8).Text(noteText).FontSize(8).FontColor(Colors.Grey.Darken2);
                });

                // ── FOOTER ────────────────────────────────────────────────
                page.Footer().Row(row =>
                {
                    row.RelativeItem()
                       .Text("AutoPro Garage, Kathmandu, Nepal")
                       .FontSize(8).FontColor(Colors.Grey.Medium);
                    row.AutoItem().Text(x =>
                    {
                        x.Span("Page ").FontSize(8).FontColor(Colors.Grey.Medium);
                        x.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                        x.Span(" of ").FontSize(8).FontColor(Colors.Grey.Medium);
                        x.TotalPages().FontSize(8).FontColor(Colors.Grey.Medium);
                    });
                });
            });
        }).GeneratePdf();
    }
}
