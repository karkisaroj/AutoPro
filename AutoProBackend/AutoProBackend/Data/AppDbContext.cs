using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Staff> Staff => Set<Staff>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Part> Parts => Set<Part>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Vehicle>()
            .HasIndex(v => v.PlateNo)
            .IsUnique();

        modelBuilder.Entity<Part>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Sale>()
            .Property(s => s.Subtotal).HasPrecision(18, 2);
        modelBuilder.Entity<Sale>()
            .Property(s => s.LoyaltyDiscount).HasPrecision(18, 2);
        modelBuilder.Entity<Sale>()
            .Property(s => s.Tax).HasPrecision(18, 2);
        modelBuilder.Entity<Sale>()
            .Property(s => s.Total).HasPrecision(18, 2);

        modelBuilder.Entity<SaleItem>()
            .Property(si => si.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<SaleItem>()
            .Property(si => si.LineTotal).HasPrecision(18, 2);

        modelBuilder.Entity<PurchaseOrder>()
            .Property(po => po.Total).HasPrecision(18, 2);

        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(poi => poi.UnitCost).HasPrecision(18, 2);
        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(poi => poi.LineTotal).HasPrecision(18, 2);

        modelBuilder.Entity<Staff>()
            .Property(s => s.Salary).HasPrecision(18, 2);

        modelBuilder.Entity<Customer>()
            .Property(c => c.TotalSpent).HasPrecision(18, 2);

        modelBuilder.Entity<Vendor>()
            .Property(v => v.Rating).HasPrecision(3, 1);
        modelBuilder.Entity<Vendor>()
            .Property(v => v.TotalSpent).HasPrecision(18, 2);

        // Seed roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin", Description = "Full system access" },
            new Role { Id = 2, Name = "Staff", Description = "Service and sales operations" },
            new Role { Id = 3, Name = "Customer", Description = "Customer portal access" }
        );
    }
}
