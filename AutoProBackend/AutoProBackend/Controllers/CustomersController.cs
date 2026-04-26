using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _db;

    public CustomersController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? searchBy)
    {
        var query = _db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();
            query = searchBy switch
            {
                "phone" => query.Where(c => c.Phone.ToLower().Contains(search)),
                "plate" => query.Where(c => c.Vehicles.Any(v => v.PlateNo.ToLower().Contains(search))),
                "licenseId" => query.Where(c => c.LicenseId != null && c.LicenseId.ToLower().Contains(search)),
                _ => query.Where(c => c.Name.ToLower().Contains(search) || c.User.Email.ToLower().Contains(search))
            };
        }

        var customers = await query.Select(c => MapToResponse(c)).ToListAsync();
        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customerId = GetCustomerIdFromToken();

        // Customers can only view their own profile
        if (User.IsInRole("Customer") && customerId != id)
            return Forbid();

        var customer = await _db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null) return NotFound();

        return Ok(MapToResponse(customer));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateCustomerRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { message = "Email already registered" });

        var customerRole = await _db.Roles.FirstAsync(r => r.Name == "Customer");

        var user = new User
        {
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            RoleId = customerRole.Id
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var customer = new Customer
        {
            UserId = user.Id,
            Name = req.Name,
            Phone = req.Phone,
            LicenseId = req.LicenseId
        };
        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        await _db.Entry(customer).Reference(c => c.User).LoadAsync();
        await _db.Entry(customer).Collection(c => c.Vehicles).LoadAsync();

        return Created($"/api/customers/{customer.Id}", MapToResponse(customer));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerRequest req)
    {
        var customerId = GetCustomerIdFromToken();
        if (User.IsInRole("Customer") && customerId != id) return Forbid();

        var customer = await _db.Customers.FindAsync(id);
        if (customer == null) return NotFound();

        if (req.Name != null) customer.Name = req.Name;
        if (req.Phone != null) customer.Phone = req.Phone;
        if (req.LicenseId != null) customer.LicenseId = req.LicenseId;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(int id)
    {
        var customerId = GetCustomerIdFromToken();
        if (User.IsInRole("Customer") && customerId != id) return Forbid();

        var sales = await _db.Sales
            .Include(s => s.Items).ThenInclude(i => i.Part)
            .Where(s => s.CustomerId == id)
            .OrderByDescending(s => s.Date)
            .Select(s => new SaleResponse
            {
                Id = s.Id,
                CustomerId = s.CustomerId,
                CustomerName = s.Customer.Name,
                StaffId = s.StaffId,
                StaffName = s.Staff.Name,
                Date = s.Date,
                Subtotal = s.Subtotal,
                LoyaltyDiscount = s.LoyaltyDiscount,
                Tax = s.Tax,
                Total = s.Total,
                PaymentMethod = s.PaymentMethod,
                Status = s.Status,
                LoyaltyPointsAwarded = s.LoyaltyPointsAwarded,
                Items = s.Items.Select(i => new SaleItemResponse
                {
                    Id = i.Id,
                    PartId = i.PartId,
                    PartName = i.PartName,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    LineTotal = i.LineTotal
                }).ToList()
            })
            .ToListAsync();

        return Ok(sales);
    }

    [HttpPost("{id}/vehicles")]
    public async Task<IActionResult> AddVehicle(int id, [FromBody] AddVehicleRequest req)
    {
        var customerId = GetCustomerIdFromToken();
        if (User.IsInRole("Customer") && customerId != id) return Forbid();

        if (!await _db.Customers.AnyAsync(c => c.Id == id)) return NotFound();

        if (await _db.Vehicles.AnyAsync(v => v.PlateNo == req.PlateNo))
            return Conflict(new { message = "Plate number already registered" });

        var vehicle = new Vehicle
        {
            CustomerId = id,
            VehicleType = req.VehicleType,
            PlateNo = req.PlateNo,
            RegistrationDate = req.RegistrationDate
        };
        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();

        return Created(string.Empty, new VehicleResponse
        {
            Id = vehicle.Id,
            VehicleType = vehicle.VehicleType,
            PlateNo = vehicle.PlateNo,
            RegistrationDate = vehicle.RegistrationDate
        });
    }

    [HttpDelete("{id}/vehicles/{vehicleId}")]
    public async Task<IActionResult> RemoveVehicle(int id, int vehicleId)
    {
        var customerId = GetCustomerIdFromToken();
        if (User.IsInRole("Customer") && customerId != id) return Forbid();

        var vehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == id);
        if (vehicle == null) return NotFound();

        _db.Vehicles.Remove(vehicle);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private int? GetCustomerIdFromToken()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        return _db.Customers.FirstOrDefault(c => c.UserId == userId)?.Id;
    }

    private static CustomerResponse MapToResponse(Customer c) => new()
    {
        Id = c.Id,
        UserId = c.UserId,
        Name = c.Name,
        Email = c.User?.Email ?? string.Empty,
        Phone = c.Phone,
        LicenseId = c.LicenseId,
        JoinDate = c.JoinDate,
        LoyaltyPoints = c.LoyaltyPoints,
        Tier = c.Tier,
        TotalSpent = c.TotalSpent,
        Visits = c.Visits,
        Vehicles = c.Vehicles.Select(v => new VehicleResponse
        {
            Id = v.Id,
            VehicleType = v.VehicleType,
            PlateNo = v.PlateNo,
            RegistrationDate = v.RegistrationDate
        }).ToList()
    };
}
