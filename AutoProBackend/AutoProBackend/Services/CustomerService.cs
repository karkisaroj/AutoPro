using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;
    public CustomerService(AppDbContext db) => _db = db;

    public async Task<List<CustomerResponse>> GetAllAsync(string? search, string? searchBy)
    {
        var query = _db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = searchBy switch
            {
                "phone" => query.Where(c => c.Phone.ToLower().Contains(s)),
                "plate" => query.Where(c => c.Vehicles.Any(v => v.PlateNo.ToLower().Contains(s))),
                "licenseId" => query.Where(c => c.LicenseId != null && c.LicenseId.ToLower().Contains(s)),
                _ => query.Where(c => c.Name.ToLower().Contains(s) || c.User.Email.ToLower().Contains(s))
            };
        }

        return await query.Select(c => MapToResponse(c)).ToListAsync();
    }

    public async Task<CustomerResponse?> GetByIdAsync(int id)
    {
        var customer = await _db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);
        return customer == null ? null : MapToResponse(customer);
    }

    public async Task<(CustomerResponse? response, bool emailConflict)> CreateAsync(CreateCustomerRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return (null, true);

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
        return (MapToResponse(customer), false);
    }

    public async Task<(CustomerResponse? response, bool notFound)> UpdateAsync(int id, UpdateCustomerRequest req)
    {
        var customer = await _db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null) return (null, true);

        if (!string.IsNullOrWhiteSpace(req.Name))     customer.Name      = req.Name.Trim();
        if (!string.IsNullOrWhiteSpace(req.Phone))    customer.Phone     = req.Phone.Trim();
        if (req.LicenseId != null)                    customer.LicenseId = req.LicenseId.Trim();

        await _db.SaveChangesAsync();
        return (MapToResponse(customer), false);
    }

    public async Task<List<SaleResponse>> GetHistoryAsync(int customerId) =>
        await _db.Sales
            .Include(s => s.Customer)
            .Include(s => s.Staff)
            .Include(s => s.Items).ThenInclude(i => i.Part)
            .Where(s => s.CustomerId == customerId)
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

    public async Task<(VehicleResponse? response, bool notFound, bool plateConflict)> AddVehicleAsync(int customerId, AddVehicleRequest req)
    {
        if (!await _db.Customers.AnyAsync(c => c.Id == customerId))
            return (null, true, false);

        var normalizedPlate = req.PlateNo.Trim().ToUpperInvariant();
        if (await _db.Vehicles.AnyAsync(v => v.PlateNo == normalizedPlate))
            return (null, false, true);

        var vehicle = new Vehicle
        {
            CustomerId = customerId,
            VehicleType = req.VehicleType.Trim(),
            PlateNo = normalizedPlate,
            RegistrationDate = req.RegistrationDate.HasValue
                ? DateTime.SpecifyKind(req.RegistrationDate.Value, DateTimeKind.Utc)
                : null
        };
        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();

        return (new VehicleResponse
        {
            Id = vehicle.Id,
            VehicleType = vehicle.VehicleType,
            PlateNo = vehicle.PlateNo,
            RegistrationDate = vehicle.RegistrationDate
        }, false, false);
    }

    public async Task<(VehicleResponse? response, bool notFound, bool plateConflict, bool hasActiveAppointments)> UpdateVehicleAsync(int customerId, int vehicleId, UpdateVehicleRequest req)
    {
        var vehicle = await _db.Vehicles
            .FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == customerId);
        if (vehicle == null) return (null, true, false, false);

        if (!string.IsNullOrWhiteSpace(req.PlateNo))
        {
            var normalizedPlate = req.PlateNo.Trim().ToUpperInvariant();
            if (await _db.Vehicles.AnyAsync(v => v.PlateNo == normalizedPlate && v.Id != vehicleId))
                return (null, false, true, false);
            vehicle.PlateNo = normalizedPlate;
        }

        if (!string.IsNullOrWhiteSpace(req.VehicleType))
            vehicle.VehicleType = req.VehicleType.Trim();

        if (req.RegistrationDate.HasValue)
            vehicle.RegistrationDate = DateTime.SpecifyKind(req.RegistrationDate.Value, DateTimeKind.Utc);

        await _db.SaveChangesAsync();

        return (new VehicleResponse
        {
            Id = vehicle.Id,
            VehicleType = vehicle.VehicleType,
            PlateNo = vehicle.PlateNo,
            RegistrationDate = vehicle.RegistrationDate
        }, false, false, false);
    }

    public async Task<(bool success, bool notFound, bool hasActiveAppointments)> RemoveVehicleAsync(int customerId, int vehicleId)
    {
        var vehicle = await _db.Vehicles
            .Include(v => v.Appointments)
            .FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == customerId);
        if (vehicle == null) return (false, true, false);

        var hasActive = vehicle.Appointments
            .Any(a => a.Status == "Pending" || a.Status == "Confirmed");
        if (hasActive) return (false, false, true);

        _db.Vehicles.Remove(vehicle);
        await _db.SaveChangesAsync();
        return (true, false, false);
    }

    public async Task<int?> GetCustomerIdByUserIdAsync(int userId)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        return customer?.Id;
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
