using System.Net;
using System.Net.Mail;

namespace AutoProBackend.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        var host = _config["Email:SmtpHost"];
        if (string.IsNullOrWhiteSpace(host))
        {
            _logger.LogWarning("Email not sent to {To}: SMTP not configured.", to);
            return;
        }

        var port = int.Parse(_config["Email:SmtpPort"] ?? "587");
        var username = _config["Email:Username"] ?? string.Empty;
        var password = _config["Email:Password"] ?? string.Empty;
        var from = _config["Email:From"] ?? "noreply@autopro.com";

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(username, password)
        };

        var message = new MailMessage(from, to, subject, body)
        {
            IsBodyHtml = true
        };

        await client.SendMailAsync(message);
        _logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
    }
}
