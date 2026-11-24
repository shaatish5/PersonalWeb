using Microsoft.AspNetCore.Identity;

namespace ResumeAPI.Data;

public static class DbSeeder
{
    public static async Task SeedAdminAsync(IServiceProvider services, IConfiguration configuration)
    {
        using var scope = services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();

        var email = configuration["AdminSeed:Email"];
        var password = configuration["AdminSeed:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser is not null)
        {
            return;
        }

        var adminUser = new IdentityUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(adminUser, password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to seed admin user: {errors}");
        }
    }
}