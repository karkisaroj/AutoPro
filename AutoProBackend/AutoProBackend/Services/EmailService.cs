using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

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
        if (string.IsNullOrWhiteSpace(host) || host == "smtp.gmail.com" && string.IsNullOrWhiteSpace(_config["Email:Password"]))
        {
            _logger.LogWarning("Email not sent to {To}: SMTP not configured.", to);
            return;
        }

        var port     = int.Parse(_config["Email:SmtpPort"] ?? "587");
        var username = _config["Email:Username"] ?? string.Empty;
        var password = _config["Email:Password"] ?? string.Empty;
        var from     = _config["Email:From"]     ?? username;
        var fromName = _config["Email:FromName"] ?? "AutoPro Garage";

        if (password == "YOUR_GMAIL_APP_PASSWORD_HERE")
        {
            _logger.LogWarning("Email not sent to {To}: Gmail App Password not configured in appsettings.json.", to);
            throw new InvalidOperationException(
                "Gmail App Password is not set. Go to myaccount.google.com → Security → App Passwords and generate a 16-character password, then add it to appsettings.json Email:Password.");
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, from));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = body };

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(username, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            _logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP error sending to {To}: {Error}", to, ex.Message);
            throw new InvalidOperationException($"Email delivery failed: {ex.Message}", ex);
        }
    }
}
