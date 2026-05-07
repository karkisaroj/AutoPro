using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest req);
    Task<(AuthResponse? response, bool emailConflict, bool roleSetupIncomplete)> RegisterAsync(RegisterRequest req);
}
