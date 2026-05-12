using Demo.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace Demo.Shared.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<PostApproval> PostApprovals { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Vote> Votes { get; set; }
        public DbSet<Badge> Badges { get; set; }
        // public DbSet<UserBadge> UserBadges { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { id = 1, name = "User", code = "User"},
                new Role { id = 2, name = "Admin", code = "Admin"}
            );

            // Seed default admin user
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    id = 1,
                    userName = "admin",
                    email = "admin@gmail.com",
                    displayName = "Admin",
                    passwordHash = passwordHash,
                    deleted = false,
                    createdAt = new DateTime(2026, 1, 1),
                    reputation = 0
                }
            );

            modelBuilder.Entity("user_roles").HasData(
                new { user_id = 1L, role_id = 2 }
            );
            
            modelBuilder.Entity<User>().HasIndex(u => u.userName).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.email).IsUnique();
            modelBuilder.Entity<Role>().HasIndex(r => r.name).IsUnique();
            modelBuilder.Entity<Post>().HasIndex(p => p.slug).IsUnique();
            modelBuilder.Entity<Tag>().HasIndex(t => t.name).IsUnique();
            modelBuilder.Entity<Tag>().HasIndex(t => t.slug).IsUnique();
            modelBuilder.Entity<Badge>().HasIndex(b => b.name).IsUnique();
            modelBuilder.Entity<Vote>().HasIndex(v => new { v.userId, v.postId }).IsUnique();

            // User
            modelBuilder.Entity<User>()
                .HasMany(u => u.Roles)
                .WithMany(r => r.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "user_roles",
                    j => j.HasOne<Role>()
                          .WithMany()
                          .HasForeignKey("role_id")
                          .OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<User>()
                          .WithMany()
                          .HasForeignKey("user_id")
                          .OnDelete(DeleteBehavior.Cascade)
                );
            
            modelBuilder.Entity<User>()
                .HasMany(u => u.Badges)
                .WithMany(b => b.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "user_badges",
                    j => j.HasOne<Badge>()
                        .WithMany()
                        .HasForeignKey("badge_id")
                        .OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<User>()
                        .WithMany()
                        .HasForeignKey("user_id")
                        .OnDelete(DeleteBehavior.Cascade)
                );

            // Post
            modelBuilder.Entity<Post>()
               .HasMany(p => p.Tags)
               .WithMany(t => t.Posts)
               .UsingEntity<Dictionary<string, object>>(
                   "post_tags",
                   j => j.HasOne<Tag>()
                         .WithMany()
                         .HasForeignKey("tag_id")
                         .OnDelete(DeleteBehavior.Cascade),
                   j => j.HasOne<Post>()
                         .WithMany()
                         .HasForeignKey("post_id")
                         .OnDelete(DeleteBehavior.Cascade)
               );

            modelBuilder.Entity<Post>()
               .HasOne(p => p.ParentPost)
               .WithMany(p => p.ChildAnswers)
               .HasForeignKey(p => p.parentId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Cascade);
               
            modelBuilder.Entity<Post>()
                .HasOne(p => p.AcceptedAnswer)
                .WithOne()
                .HasForeignKey<Post>(p => p.acceptedAnswerId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.NoAction);

            // Vote
            modelBuilder.Entity<Vote>()
               .HasOne(v => v.User)
               .WithMany(u => u.Votes)
               .HasForeignKey(v => v.userId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Vote>()
                .HasOne(v => v.Post)
                .WithMany(p => p.Votes)
                .HasForeignKey(v => v.postId)
                .OnDelete(DeleteBehavior.Cascade);

            // Comment
            modelBuilder.Entity<Comment>()
               .HasOne(c => c.User)
               .WithMany(u => u.Comments)
               .HasForeignKey(c => c.userId)
               .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.postId)
                .OnDelete(DeleteBehavior.Cascade);

            // PostApproval
            modelBuilder.Entity<PostApproval>()
                .Property(pa => pa.status)
                .HasConversion<string>();

            modelBuilder.Entity<PostApproval>()
                .HasOne(pa => pa.Post)
                .WithMany(p => p.Approvals)
                .HasForeignKey(pa => pa.postId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostApproval>()
                .HasOne(pa => pa.User)
                .WithMany(u => u.PostApprovals)
                .HasForeignKey(pa => pa.adminId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

}
