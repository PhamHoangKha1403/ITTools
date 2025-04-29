namespace ITTools.Domain.Interfaces
{
    public interface IUnitOfWork : IAsyncDisposable
    {
        public IToolRepository Tools { get; }
        public IToolGroupRepository ToolGroups { get; }
        public IUserRepository Users { get; }
        public IFavoriteRepository Favorites { get; }

        /// <summary>
        /// Commits all changes made to the database.
        /// </summary>
        /// <returns>The number of state entries written to the database.</returns>
        Task<int> CommitAsync();
    }
}
