namespace AutoProBackend.Models;

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Admin, Staff, Customer
    public string? Description { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
}
