using AutoProBackend.DTOs;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var result = await auth.LoginAsync(req);
        return result is null
            ? Unauthorized(new { message = "Invalid email or password" })
            : Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var (response, emailConflict, roleSetupIncomplete) = await auth.RegisterAsync(req);

        if (emailConflict)       return Conflict(new { message = "Email already registered" });
        if (roleSetupIncomplete) return StatusCode(500, new { message = "Role setup incomplete" });

        return Created(string.Empty, response);
    }
}
