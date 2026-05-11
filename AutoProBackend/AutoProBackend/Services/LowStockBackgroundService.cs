namespace AutoProBackend.Services;

public class LowStockBackgroundService(IServiceScopeFactory scopeFactory, ILogger<LowStockBackgroundService> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var reports = scope.ServiceProvider.GetRequiredService<IReportService>();
                var count = await reports.SendLowStockAlertAsync();
                if (count > 0)
                    logger.LogInformation("Low stock alert emailed for {Count} part(s).", count);

                var reminded = await reports.SendOverdueRemindersAsync();
                if (reminded > 0)
                    logger.LogInformation("Overdue credit reminders sent to {Count} customer(s).", reminded);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error in LowStockBackgroundService.");
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
