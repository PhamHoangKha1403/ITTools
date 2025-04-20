using ITTools.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ITTools.Infrastructure.DataAccess
{
    /// <summary>
    /// Entity Framework Core context for PostgreSQL.
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Tool> Tools { get; set; }
        //public DbSet<ToolGroup> ToolGroups { get; set; }
        //public DbSet<Favorite> Favorites { get; set; }
        public DbSet<User> Users { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Gọi base trước

            // Cấu hình cho Entity Tool
            modelBuilder.Entity<Tool>(entity =>
            {
                // --- Quan trọng: Cấu hình kiểu cột cho JSONB ---
                entity.Property(t => t.InputSchema)
                      .HasColumnType("jsonb") // Chỉ định rõ kiểu cột trong DB là jsonb
                      .IsRequired(); // Đảm bảo cột này là NOT NULL như schema DB

                entity.Property(t => t.OutputSchema)
                      .HasColumnType("jsonb") // Chỉ định rõ kiểu cột trong DB là jsonb
                      .IsRequired(); // Đảm bảo cột này là NOT NULL như schema DB

                // Cấu hình mối quan hệ với ToolGroup
                entity.HasOne<ToolGroup>() // Nếu có navigation property đến ToolGroup
                      .WithMany()        // Hoặc .WithMany(g => g.Tools) nếu có collection trong ToolGroup
                      .HasForeignKey(t => t.GroupId)
                      .IsRequired()
                      .OnDelete(DeleteBehavior.Restrict); // Giống 'ON DELETE RESTRICT' trong SQL
            });

            // Cấu hình cho Entity User (ví dụ: index cho username)
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Username).IsUnique();
            });

            // Cấu hình khóa chính phức hợp cho Favorites
            modelBuilder.Entity<Favorite>(entity =>
            {
                entity.HasKey(f => new { f.UserId, f.ToolId });

                // Cấu hình cascade delete (EF Core thường tự động làm điều này cho Required relationship)
                entity.HasOne<User>()
                      .WithMany() // Giả sử User không có collection Favorites
                      .HasForeignKey(f => f.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<Tool>()
                      .WithMany() // Giả sử Tool không có collection Favorites
                      .HasForeignKey(f => f.ToolId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Cấu hình cho PremiumUpgradeRequests (ví dụ)
            modelBuilder.Entity<PremiumUpgradeRequest>(entity =>
            {
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(p => p.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<User>() // Mối quan hệ với ProcessedByUser
                      .WithMany()
                      .HasForeignKey(p => p.ProcessedByUserId)
                      .OnDelete(DeleteBehavior.SetNull); // ON DELETE SET NULL
            });
        }
    }
}
