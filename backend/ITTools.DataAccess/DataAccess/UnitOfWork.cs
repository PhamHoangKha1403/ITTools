using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ITTools.Infrastructure.DataAccess
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UnitOfWork> _logger;

        private IToolRepository? _toolRepository;
        private IUserRepository? _userRepository;
        private IFavoriteRepository? _favoriteRepository;
        private IToolGroupRepository? _toolGroupRepository;

        // Lazy loading
        public IToolRepository Tools => _toolRepository ??= new ToolRepository(_context);
        public IToolGroupRepository ToolGroups => _toolGroupRepository ??= new ToolGroupRepository(_context);
        public IUserRepository Users => _userRepository ??= new UserRepository(_context);
        public IFavoriteRepository Favorites => _favoriteRepository ??= new FavoriteRepository(_context);

        public UnitOfWork(ApplicationDbContext context, ILogger<UnitOfWork> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
            _logger?.LogInformation("UnitOfWork instance created.");
        }

        public async Task<int> CommitAsync()
        {
            _logger?.LogInformation("Attempting to commit changes to the database.");
            try
            {
                int result = await _context.SaveChangesAsync();
                _logger?.LogInformation("Successfully committed {Count} changes.", result);
                return result;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "An error occurred while committing changes.");
                throw;
            }
        }

        private bool disposed = false;

        public async ValueTask DisposeAsync()
        {
            await DisposeAsync(true);
            GC.SuppressFinalize(this);
        }

        protected virtual async ValueTask DisposeAsync(bool disposing)
        {
            if (!disposed)
            {
                if (disposing)
                {
                    await _context.DisposeAsync();
                    _logger?.LogInformation("DbContext disposed within UnitOfWork.");
                }
                disposed = true;
            }
        }
    }
}
