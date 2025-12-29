using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using StudentMgmt.Api.Configuration;

namespace StudentMgmt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IOptions<JwtSettings> jwtSettings) : ControllerBase
{
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var (isValid, role) = ValidateCredentials(request.Username, request.Password);

        if (!isValid)
        {
            return Unauthorized(new { Message = "Invalid username or password." });
        }

        var token = GenerateJwtToken(request.Username, role!);

        return Ok(new LoginResponse(token, DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes)));
    }

    private static (bool IsValid, string? Role) ValidateCredentials(string username, string password) =>
        (username, password) switch
        {
            ("admin", "admin") => (true, "Admin"),
            ("staff", "staff") => (true, "Staff"),
            _ => (false, null)
        };

    private string GenerateJwtToken(string username, string role)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record LoginRequest(string Username, string Password);

public record LoginResponse(string Token, DateTime ExpiresAt);
