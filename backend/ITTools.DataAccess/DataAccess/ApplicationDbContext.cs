using ITTools.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ITTools.Infrastructure.DataAccess
{
    /// <summary>
    /// Entity Framework Core context for PostgreSQL.
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        //public DbSet<Tool> Tools { get; set; }
        //public DbSet<ToolGroup> ToolGroups { get; set; }
        //public DbSet<Favorite> Favorites { get; set; }
        public DbSet<User> Users { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
    }
}
